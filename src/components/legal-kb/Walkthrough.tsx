"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { sceneStatesAt, walkthroughSteps } from "@/content/legal-kb-walkthrough";
import { WalkthroughContext, useWalkthrough, type WalkthroughValue } from "@/components/scene/walkthrough-context";

/**
 * The one scene driver the guided walkthrough uses.
 *
 * There are two drivers on this page and they must never write at the same time: each scene's own
 * viewport reveal, and this. The rule enforced here is that `active` decides. While the
 * walkthrough runs, every driven scene reads its state from the table in
 * `legal-kb-walkthrough.ts`; while it does not, each scene is back on its own observer and this
 * component holds no timers at all.
 *
 * One scheduler, one timeout. Beats and steps are the same queue, which is why pausing genuinely
 * freezes progression and why stepping backwards lands on the same picture as stepping forwards.
 */

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [position, setPosition] = useState({ step: 0, beat: 0 });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const launcher = useRef<HTMLButtonElement | null>(null);
  const dock = useRef<HTMLDivElement | null>(null);
  // Bumped whenever the run should re-frame its target: on start, on a step change, and when the
  // visitor presses Play after scrolling somewhere else.
  const [scrollTick, setScrollTick] = useState(0);

  const registerLauncher = useCallback((element: HTMLButtonElement | null) => {
    launcher.current = element;
  }, []);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const sceneStates = useMemo(
    () => (active ? sceneStatesAt(position.step, position.beat) : null),
    [active, position.step, position.beat],
  );

  const step = walkthroughSteps[position.step];

  // --- Scrolling ------------------------------------------------------------------------------
  // The walkthrough moves the page to what it is talking about and nothing more: no locking, no
  // hijacking, no wheel interception. The visitor can scroll away at any moment, and if they do,
  // autoplay stops rather than dragging them back.
  useEffect(() => {
    if (!active || !step) return;
    const target = document.querySelector(step.target);
    if (!target) return;
    // Top-aligned, not centred: several of these stages are taller than the space between the
    // header and the dock, and centring a tall element scrolls past the part being explained.
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }, [active, step, position.step, scrollTick]);

  // --- The single scheduler -------------------------------------------------------------------
  useEffect(() => {
    clearTimer();
    if (!active || !playing || !step) return;

    const beat = step.beats[position.beat];
    if (!beat) return;

    timer.current = setTimeout(() => {
      setPosition((current) => {
        const currentStep = walkthroughSteps[current.step];
        if (current.beat + 1 < currentStep.beats.length) {
          return { step: current.step, beat: current.beat + 1 };
        }
        if (current.step + 1 < walkthroughSteps.length) {
          return { step: current.step + 1, beat: 0 };
        }
        return current;
      });
    }, beat.hold);

    return clearTimer;
  }, [active, playing, position.step, position.beat, step, clearTimer]);

  // Reaching the last beat of the last step ends the run rather than looping.
  useEffect(() => {
    if (!active) return;
    const last = walkthroughSteps.length - 1;
    if (position.step === last && position.beat === walkthroughSteps[last].beats.length - 1 && playing) {
      const beat = walkthroughSteps[last].beats[position.beat];
      const finish = setTimeout(() => {
        setPlaying(false);
        setComplete(true);
      }, beat.hold);
      return () => clearTimeout(finish);
    }
  }, [active, playing, position.step, position.beat]);

  const start = useCallback(() => {
    setComplete(false);
    setPosition({ step: 0, beat: 0 });
    setScrollTick((tick) => tick + 1);
    setActive(true);
    setPlaying(true);
  }, []);

  const exit = useCallback(() => {
    clearTimer();
    setActive(false);
    setPlaying(false);
    setComplete(false);
    // Focus goes back where it came from, which is the only place the visitor can be sure of.
    launcher.current?.focus();
  }, [clearTimer]);

  const goTo = useCallback((stepIndex: number, beatIndex: number) => {
    setComplete(false);
    setPosition({ step: stepIndex, beat: beatIndex });
    setScrollTick((tick) => tick + 1);
  }, []);

  // Next and Previous move whole steps: a visitor pressing Next means "the next thing you have to
  // say", not "the next frame". Landing on a step's final beat means Previous shows the finished
  // picture of the step before rather than replaying it from the start.
  const next = useCallback(() => {
    setPlaying(false);
    setPosition((current) => {
      if (current.step + 1 >= walkthroughSteps.length) {
        const last = walkthroughSteps.length - 1;
        setComplete(true);
        return { step: last, beat: walkthroughSteps[last].beats.length - 1 };
      }
      return { step: current.step + 1, beat: 0 };
    });
  }, []);

  const previous = useCallback(() => {
    setPlaying(false);
    setComplete(false);
    setPosition((current) => {
      if (current.beat > 0) return { step: current.step, beat: 0 };
      if (current.step === 0) return { step: 0, beat: 0 };
      const target = current.step - 1;
      return { step: target, beat: walkthroughSteps[target].beats.length - 1 };
    });
  }, []);

  const toggle = useCallback(() => {
    if (complete) {
      setComplete(false);
      setPosition({ step: 0, beat: 0 });
      setScrollTick((tick) => tick + 1);
      setPlaying(true);
      return;
    }
    setPlaying((current) => {
      // Resuming re-frames the current step. A visitor who scrolled away and then pressed Play
      // meant "carry on with the tour", and carrying on somewhere they cannot see is not that.
      if (!current) setScrollTick((tick) => tick + 1);
      return !current;
    });
  }, [complete]);

  const restart = useCallback(() => {
    goTo(0, 0);
    setPlaying(true);
  }, [goTo]);

  // --- Keyboard -------------------------------------------------------------------------------
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      // Space on a button is that button's own activation; do not also treat it as play/pause.
      const onControl = target?.closest("button, a, input, textarea, select");
      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          next();
          break;
        case "ArrowLeft":
          event.preventDefault();
          previous();
          break;
        case " ":
          if (onControl) return;
          event.preventDefault();
          toggle();
          break;
        case "Escape":
          event.preventDefault();
          exit();
          break;
        default:
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, next, previous, toggle, exit]);

  // --- Yielding to the visitor ----------------------------------------------------------------
  // Deliberate input only. Scroll events fire for the walkthrough's own scrollIntoView, so
  // listening to those would pause the run every time it moved. Wheel, touch and page-key presses
  // are the visitor actually taking over.
  useEffect(() => {
    if (!active || !playing) return;
    const yield_ = () => setPlaying(false);
    const onKey = (event: KeyboardEvent) => {
      if (["PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp"].includes(event.key)) yield_();
    };
    window.addEventListener("wheel", yield_, { passive: true });
    window.addEventListener("touchmove", yield_, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", yield_);
      window.removeEventListener("touchmove", yield_);
      window.removeEventListener("keydown", onKey);
    };
  }, [active, playing]);

  // A hidden tab must not let the run race ahead. It pauses and stays paused, because resuming
  // into a step whose caption the visitor never saw is worse than asking them to press play.
  useEffect(() => {
    if (!active) return;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") setPlaying(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [active]);

  /*
   * The run publishes its position on the document element.
   *
   * Three jobs: the stylesheet keeps scroll targets clear of the dock, steps that have no scene of
   * their own can still get a visual treatment keyed off the step id, and anything driving this
   * from outside - a later recorder, a test - can read exactly where the run is without reaching
   * into React. Nothing here depends on scroll position, pointer position, or elapsed time.
   */
  useEffect(() => {
    const root = document.documentElement;
    if (!active) {
      root.removeAttribute("data-walkthrough");
      root.removeAttribute("data-walkthrough-step");
      root.removeAttribute("data-walkthrough-beat");
      return;
    }
    root.setAttribute("data-walkthrough", complete ? "complete" : "running");
    root.setAttribute("data-walkthrough-step", walkthroughSteps[position.step].id);
    root.setAttribute("data-walkthrough-beat", String(position.beat));
    return () => {
      root.removeAttribute("data-walkthrough");
      root.removeAttribute("data-walkthrough-step");
      root.removeAttribute("data-walkthrough-beat");
    };
  }, [active, complete, position.step, position.beat]);

  /*
   * The control surface, published for anything driving the run from outside the React tree.
   *
   * This is the same set of actions the dock's buttons call - nothing extra, nothing privileged.
   * It exists because "press Next eleven times and hope" is not a way to reach an exact position:
   * a deterministic caller needs to name (step, beat) and get the same picture every time. The
   * export tool in `tools/` uses it; so can a test, or the console.
   */
  useEffect(() => {
    const surface = { start, exit, next, previous, toggle, restart, goTo, steps: walkthroughSteps.map((entry) => entry.id) };
    (window as unknown as Record<string, unknown>).zqWalkthrough = surface;
    return () => {
      delete (window as unknown as Record<string, unknown>).zqWalkthrough;
    };
  }, [start, exit, next, previous, toggle, restart, goTo]);

  // Focus moves into the dock once, on start. It is not moved again on every step: a screen
  // reader hearing the step announced is better served by a live region than by being yanked.
  useEffect(() => {
    if (active) dock.current?.focus();
  }, [active]);

  const value = useMemo<WalkthroughValue>(
    () => ({
      active,
      playing,
      complete,
      stepIndex: position.step,
      totalSteps: walkthroughSteps.length,
      sceneStates,
      start,
      exit,
      next,
      previous,
      toggle,
      restart,
      goTo,
      registerLauncher,
    }),
    [
      active, playing, complete, position.step, sceneStates,
      start, exit, next, previous, toggle, restart, goTo, registerLauncher,
    ],
  );

  return (
    <WalkthroughContext.Provider value={value}>
      {children}
      {active ? <WalkthroughDock dockRef={dock} /> : null}
    </WalkthroughContext.Provider>
  );
}

function WalkthroughDock({ dockRef }: { dockRef: React.RefObject<HTMLDivElement | null> }) {
  const { stepIndex, totalSteps, playing, complete, next, previous, toggle, exit, restart } =
    useWalkthrough();
  const step = walkthroughSteps[stepIndex];

  return (
    <div
      aria-label="Guided walkthrough"
      className="legal-dock"
      data-complete={complete ? "" : undefined}
      ref={dockRef}
      role="region"
      tabIndex={-1}
    >
      <div className="legal-dock-rail" aria-hidden="true">
        <span style={{ scale: `${(stepIndex + 1) / totalSteps} 1` }} />
      </div>

      <div className="legal-dock-body">
        {/* One announcement per step, not per beat: a reader does not need the frames. */}
        <p aria-live="polite" className="legal-dock-caption">
          <span className="legal-dock-count">
            {stepIndex + 1} / {totalSteps}
          </span>
          <strong>{complete ? "Walkthrough complete" : step.title}</strong>
          <span>
            {complete
              ? "You can carry on reading from here, run it again, or leave guided mode."
              : step.caption}
          </span>
        </p>

        <div className="legal-dock-controls">
          <button onClick={previous} type="button" disabled={stepIndex === 0 && !complete}>
            Previous
          </button>
          <button onClick={complete ? restart : toggle} type="button">
            {complete ? "Restart" : playing ? "Pause" : "Play"}
          </button>
          <button onClick={next} type="button" disabled={complete}>
            Next
          </button>
          <button className="legal-dock-exit" onClick={exit} type="button">
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
