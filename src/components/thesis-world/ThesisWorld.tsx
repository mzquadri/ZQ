"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";

import ReliabilityPanel from "./ReliabilityPanel";
import Readout from "./Readout";
import { STATES, activeState } from "./states";
import type { Frame } from "./ThesisWorldScene";

/**
 * The host for the thesis world.
 *
 * Three gates decide whether any of this runs, and all three have to pass: the viewport has to be
 * wide enough for a scene with nine states to be legible, the reader must not have asked for less
 * motion, and the section has to actually be on screen. Until then the flat figure is the page,
 * and it is a complete figure rather than a placeholder - so nothing here is load-bearing for
 * meaning, which is also what keeps the WebGL payload honest: it buys depth, not information.
 *
 * Scroll is sampled per animation frame against the track element rather than through an
 * intersection observer, because the scene needs continuous position, not a handful of threshold
 * crossings. The value goes into a ref, never into state - putting it in state would re-render
 * React sixty times a second to move objects React does not own.
 */

const WorldCanvas = dynamic(() => import("./ThesisWorldCanvas"), { ssr: false });

const MIN_WIDTH = 1000;

export default function ThesisWorld({ flat }: { flat: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef<Frame>({ progress: 0 });

  const [eligible, setEligible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [caption, setCaption] = useState(() => STATES[0]);
  /* Quantised so the readout re-renders a few times per state, not sixty times a second. */
  const [step, setStep] = useState(0);

  /* Gate one and two: wide enough, and motion not declined. Re-evaluated on both. */
  useEffect(() => {
    const wide = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () => setEligible(wide.matches && !still.matches);
    evaluate();
    wide.addEventListener("change", evaluate);
    still.addEventListener("change", evaluate);
    return () => {
      wide.removeEventListener("change", evaluate);
      still.removeEventListener("change", evaluate);
    };
  }, []);

  /* Gate three: nothing downloads until the section is near the viewport. */
  useEffect(() => {
    const host = hostRef.current;
    if (!eligible || !host) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setMounted(true)),
      /*
       * No pre-roll margin, deliberately.
       *
       * The world begins about thirty pixels below the fold, so a 300px margin was satisfied
       * before the reader had scrolled at all and the renderer arrived as part of the initial
       * load - 1.47MB on a page whose first screen is a title and an abstract. At zero the
       * download starts when the section does, which costs a moment of flat figure and keeps
       * the opening screen the weight of the text it actually shows.
       */
      /*
       * The bottom of the root is pulled up by a third, so the section has to reach the upper two
       * thirds of the viewport before it counts as visible.
       *
       * A plain zero margin was measured shipping the renderer as part of the initial page: this
       * route's world sits close under a short hero, so it was already intersecting on arrival and
       * /work/medico downloaded 228 KB of three.js before a reader had scrolled at all. Six of the
       * eight worlds already deferred it this way; this one and the thesis world did not.
       */
      { rootMargin: "0px 0px -35% 0px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [eligible]);

  /* Scroll position, sampled once per frame and parked in a ref. */
  useEffect(() => {
    if (!mounted) return;
    let raf = 0;
    let lastKey = "";

    const sample = () => {
      const track = trackRef.current;
      if (track) {
        const rect = track.getBoundingClientRect();
        const travel = Math.max(1, rect.height - window.innerHeight);
        const progress = Math.max(0, Math.min(1, -rect.top / travel));
        frame.current.progress = progress;
        /* The caption is the one thing that does re-render, and only when the state changes. */
        const state = activeState(progress);
        if (state.key !== lastKey) {
          lastKey = state.key;
          setCaption(state);
        }
        const quantised = Math.round(progress * 40);
        setStep((previous) => (previous === quantised ? previous : quantised));
      }
      raf = requestAnimationFrame(sample);
    };

    raf = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(raf);
  }, [mounted]);

  return (
    <div className="thesis-world" data-mode={mounted ? "scene" : "static"} ref={hostRef}>
      <div className="thesis-world-track" ref={trackRef}>
        <div className="thesis-world-viewport">
          {mounted ? (
            <div aria-hidden="true" className="thesis-world-canvas">
              <WorldCanvas frame={frame} />
            </div>
          ) : null}

          {/*
            The caption is the only text over the scene, and it is a live region so a screen
            reader following along hears the same stage names a sighted reader sees.
          */}
          <div className="thesis-world-caption">
            <p aria-live="polite" className="thesis-world-stage">
              <span className="thesis-world-index">
                {String(STATES.indexOf(caption) + 1).padStart(2, "0")}
              </span>
              <strong>{caption.label}</strong>
              <span className="thesis-world-line">{caption.caption}</span>
            </p>
            <Readout progress={step / 40} state={caption.key} />
          </div>

          {/* The measurement, pinned where the camera cannot swing it away. */}
          <ReliabilityPanel progress={step / 40} />

          {/* The flat figure stays in the document; it is hidden only once the surface is up. */}
          <div className="thesis-world-flat">{flat}</div>
        </div>
      </div>
    </div>
  );
}
