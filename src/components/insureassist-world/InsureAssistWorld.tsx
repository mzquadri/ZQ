"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { useStageVisibility } from "@/components/world/stage-visibility";
import { worldRenderingIsWorthIt } from "@/components/world/webgl-support";

import RetrieverPanel from "./RetrieverPanel";
import Readout from "./Readout";
import { STATES, active } from "./states";
import type { Frame } from "./InsureAssistWorldScene";

/**
 * The host for the InsureAssist world.
 *
 * Four gates, all of which must pass before anything is downloaded: wide enough for an
 * eleven-state sequence to be legible, motion not declined, the machine able to render it
 * without a software rasteriser, and the section actually on screen. Until then the retriever
 * comparison is the page - a complete figure, not a placeholder - so the renderer buys depth
 * rather than meaning.
 *
 * The fourth gate is the one that was missing. `ShowcaseCanvas` has always asked whether WebGL
 * is worth running; the worlds asked only whether the viewport was wide. See
 * `@/components/world/webgl-support` for what that costs and what was ruled out before adding
 * it.
 *
 * Scroll is sampled per frame into a ref. Only the caption and the readout re-render, and only
 * when the state changes.
 */

const WorldCanvas = dynamic(() => import("./InsureAssistWorldCanvas"), { ssr: false });

const MIN_WIDTH = 1000;

export default function InsureAssistWorld({ flat }: { flat: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef<Frame>({ progress: 0 });

  const [eligible, setEligible] = useState(false);
  const { drawing, mounted } = useStageVisibility(hostRef, eligible);
  const [caption, setCaption] = useState(() => STATES[0]);
  /* Quantised so the panel re-renders a few times per state, not sixty times a second. */
  const [step, setStep] = useState(0);

  useEffect(() => {
    const wide = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () =>
      setEligible(wide.matches && !still.matches && worldRenderingIsWorthIt());
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
        const quantised = Math.round(progress * 50);
        setStep((previous) => (previous === quantised ? previous : quantised));
      }
      raf = requestAnimationFrame(sample);
    };

    raf = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(raf);
  }, [drawing]);

  return (
    <div className="world-stage insureassist-world" data-mode={mounted ? "scene" : "static"} ref={hostRef}>
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

          {/* The comparison, pinned where the camera cannot swing it away. */}
          <RetrieverPanel progress={step / 50} />

          {/* The matrix stays in the document; it is hidden only once the surface is up. */}
          <div className="world-flat">{flat}</div>
        </div>
      </div>
    </div>
  );
}
