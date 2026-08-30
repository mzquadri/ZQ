"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";

import Readout from "./Readout";
import { STATES, active } from "./states";

/**
 * The host for the medico world.
 *
 * Three gates, all of which must pass before anything is downloaded: wide enough for an
 * eleven-state sequence to be legible, motion not declined, and the section actually on screen.
 * Until then the coverage matrix is the page - a complete figure, not a placeholder - so the
 * renderer buys depth rather than meaning.
 *
 * Scroll is sampled per frame into a ref. Only the caption and the readout re-render, and only
 * when the state changes.
 */

/*
 * Declared here rather than imported from the scene.
 *
 * `MedicoWorldScene` imports three and react-three-fiber, and this shell is loaded with the page.
 * Even as `import type`, the edge from here to that module was enough for the bundler to place the
 * renderer in this route's initial chunk: /work/medico shipped 228 KB of three.js on arrival while
 * its sibling routes shipped none. The other seven worlds keep this type inside their canvas
 * module, which is the one that is dynamically imported; medico was the odd one out.
 */
type Frame = { progress: number };

const WorldCanvas = dynamic(() => import("./MedicoWorldCanvas"), { ssr: false });

const MIN_WIDTH = 1000;

export default function MedicoWorld({ flat }: { flat: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef<Frame>({ progress: 0 });

  const [eligible, setEligible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [caption, setCaption] = useState(() => STATES[0]);

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

  useEffect(() => {
    const host = hostRef.current;
    if (!eligible || !host) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setMounted(true)),
      /* No pre-roll: the renderer arrives when the section does, not as part of page load. */
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
        const state = active(progress);
        if (state.key !== lastKey) {
          lastKey = state.key;
          setCaption(state);
        }
      }
      raf = requestAnimationFrame(sample);
    };

    raf = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(raf);
  }, [mounted]);

  return (
    <div className="world-stage medico-world" data-mode={mounted ? "scene" : "static"} ref={hostRef}>
      <div className="world-track" ref={trackRef}>
        <div className="world-viewport">
          {mounted ? (
            <div aria-hidden="true" className="world-canvas">
              <WorldCanvas frame={frame} />
            </div>
          ) : null}

          <div className="world-caption">
            <p aria-live="polite" className="world-stage-line">
              <span className="world-index">
                {String(STATES.indexOf(caption) + 1).padStart(2, "0")} / {STATES.length}
              </span>
              <strong>{caption.label}</strong>
              <span className="world-line">{caption.caption}</span>
            </p>
            <Readout state={caption.key} />
          </div>

          {/* The matrix stays in the document; it is hidden only once the surface is up. */}
          <div className="world-flat">{flat}</div>
        </div>
      </div>
    </div>
  );
}
