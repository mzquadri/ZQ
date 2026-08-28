"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";

import Readout from "./Readout";
import { STATES, active } from "./states";
import type { Frame } from "./ReliableWorldScene";

/**
 * The host for the reliable-knowledge world.
 *
 * Three gates, all of which must pass before anything is downloaded: wide enough for an
 * eleven-state sequence to be legible, motion not declined, and the section actually on screen.
 * Until then the exploded schematic is the page - a complete figure, not a placeholder - so the
 * renderer buys depth rather than meaning.
 *
 * Scroll is sampled per frame into a ref. Only the caption and the readout re-render, and only
 * when the state changes.
 */

const WorldCanvas = dynamic(() => import("./ReliableWorldCanvas"), { ssr: false });

const MIN_WIDTH = 1000;

export default function ReliableWorld({ flat }: { flat: ReactNode }) {
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
      /*
       * The bottom of the root is pulled up by a third, so the section has to reach the upper two
       * thirds of the viewport before it counts as visible.
       *
       * A plain zero margin was not enough here. This world sits directly under a case-study hero
       * that is shorter than one viewport, so the section was already intersecting on load and the
       * renderer arrived as part of the initial page weight - 1.46MB on a page whose first screen
       * is a title and a paragraph. Shrinking the root means the download starts when the reader
       * actually moves toward it.
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
    <div className="world-stage reliable-world" data-mode={mounted ? "scene" : "static"} ref={hostRef}>
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
