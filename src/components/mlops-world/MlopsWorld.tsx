"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { useStageVisibility } from "@/components/world/stage-visibility";

import Readout from "./Readout";
import { STATES, active } from "./states";
import type { Frame } from "./MlopsWorldScene";

/**
 * The host for the MLOps world.
 *
 * Three gates, all of which must pass before anything is downloaded: wide enough for an
 * eleven-state sequence to be legible, motion not declined, and the section actually on screen.
 * Until then the promotion gate is the page - a complete figure, not a placeholder - so the
 * renderer buys depth rather than meaning.
 *
 * Scroll is sampled per frame into a ref. Only the caption and the readout re-render, and only
 * when the state changes.
 */

const WorldCanvas = dynamic(() => import("./MlopsWorldCanvas"), { ssr: false });

const MIN_WIDTH = 1000;

export default function MlopsWorld({ flat }: { flat: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef<Frame>({ progress: 0 });

  const [eligible, setEligible] = useState(false);
  const { drawing, mounted } = useStageVisibility(hostRef, eligible);
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
    if (!drawing) return;
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
  }, [drawing]);

  return (
    <div className="world-stage mlops-world" data-mode={mounted ? "scene" : "static"} ref={hostRef}>
      <div className="world-track" ref={trackRef}>
        <div className="world-viewport">
          {mounted ? (
            <div aria-hidden="true" className="world-canvas">
              <WorldCanvas frame={frame} frameloop={drawing ? "always" : "never"} />
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
