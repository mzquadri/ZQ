"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { WalkthroughScene } from "@/content/legal-kb-walkthrough";
import { useWalkthroughScene } from "./walkthrough-context";

/**
 * Steps server-rendered children through named scene states as they come into view.
 *
 * The children are the record. They are rendered on the server at their **terminal** state, so a
 * visitor with no JavaScript, or with reduced motion, or on a browser that never runs this file,
 * sees the finished figure rather than an empty first frame. All this component does is take a
 * complete figure and, once, walk it from the beginning.
 *
 * State is a `data-step` number on a wrapper. Every transition is a CSS transition keyed off that
 * attribute, which means the site's existing reduced-motion rule - a global
 * `transition-duration: 0.01ms` - already neutralises the motion without this component
 * participating. The explicit reduced-motion check here is belt to that brace: it skips the walk
 * entirely rather than running it instantly.
 *
 * `data-step` is also how a later phase drives the same figures from a guided walkthrough and
 * from a recording script, which is why the states are numbers on the DOM rather than positions
 * inside an animation timeline.
 */

interface SceneRevealProps {
  children: ReactNode;
  /** Number of states, including the initial one. The terminal state is `steps - 1`. */
  steps: number;
  className?: string;
  /** Milliseconds each state holds before the next. */
  interval?: number;
  /** Delay before the walk begins, so a figure is not already moving as it appears. */
  delay?: number;
  /**
   * Opt in to pointer-responsive perspective, for a figure whose depth is the point.
   *
   * Deliberately tiny and deliberately dumb: it writes two custom properties the stylesheet may
   * use to tilt by a couple of degrees, only while a fine pointer is actually over the figure,
   * and it returns to neutral the moment the pointer leaves. There is no continuous motion and
   * nothing follows the cursor - the intent is that depth feels physical when you move, not that
   * the page performs.
   */
  parallax?: boolean;
  /**
   * Which walkthrough scene this figure is, if the guided run drives it.
   *
   * While the walkthrough is active this component stops scheduling anything and simply renders
   * the state it is handed. That is what keeps the two drivers from writing at once.
   */
  scene?: WalkthroughScene;
}

/** Degrees at the far edge of the figure. Small enough that type never skews out of legibility. */
const MAX_TILT = 2.6;

export default function SceneReveal({
  children,
  steps,
  className,
  interval = 620,
  delay = 220,
  parallax = false,
  scene,
}: SceneRevealProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const terminal = steps - 1;
  // Server and first client render agree on the terminal state; the walk starts in an effect.
  const [step, setStep] = useState(terminal);
  const played = useRef(false);

  const guided = useWalkthroughScene(scene);
  const wasGuided = useRef(false);

  /*
   * Leaving guided mode must not drop a figure back to a half-played state. The visitor has now
   * seen this scene, so it settles at its terminal state and its own reveal stays spent.
   */
  useEffect(() => {
    if (guided !== null) {
      wasGuided.current = true;
      return;
    }
    if (wasGuided.current) {
      wasGuided.current = false;
      played.current = true;
      setStep(terminal);
    }
  }, [guided, terminal]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || played.current) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    let timers: ReturnType<typeof setTimeout>[] = [];

    const play = () => {
      played.current = true;
      setStep(0);
      for (let index = 1; index <= terminal; index += 1) {
        timers.push(setTimeout(() => setStep(index), delay + index * interval));
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || played.current) return;
        observer.disconnect();
        play();
      },
      // Wait until the figure is genuinely being looked at rather than merely on screen.
      { threshold: 0.4 },
    );
    observer.observe(host);

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
      timers = [];
    };
  }, [delay, interval, terminal]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !parallax) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // A coarse pointer means touch: there is no hover state to respond to, and tilting under a
    // finger that is already scrolling would fight the scroll.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const wide = window.matchMedia("(min-width: 901px)");

    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    const write = () => {
      frame = 0;
      if (!pending) return;
      host.style.setProperty("--tilt-y", `${pending.x.toFixed(2)}deg`);
      host.style.setProperty("--tilt-x", `${pending.y.toFixed(2)}deg`);
    };

    const onMove = (event: PointerEvent) => {
      if (motion.matches || !fine.matches || !wide.matches) return;
      const rect = host.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      // -1..1 from the centre of the figure, then a couple of degrees at the edges.
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      pending = { x: x * MAX_TILT, y: -y * MAX_TILT };
      if (frame === 0) frame = window.requestAnimationFrame(write);
    };

    const onLeave = () => {
      pending = null;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      // Neutral is a property removal, so the stylesheet's own resting value takes over and the
      // return is eased by the same transition as everything else.
      host.style.removeProperty("--tilt-x");
      host.style.removeProperty("--tilt-y");
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    motion.addEventListener("change", onLeave);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      motion.removeEventListener("change", onLeave);
    };
  }, [parallax]);

  // The controller wins whenever it is running; otherwise the scene's own reveal does.
  const rendered = guided ?? step;

  return (
    <div
      className={className}
      data-driver={guided === null ? "scroll" : "walkthrough"}
      data-step={rendered}
      data-terminal={rendered === terminal ? "" : undefined}
      ref={hostRef}
    >
      {children}
    </div>
  );
}
