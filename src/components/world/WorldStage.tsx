"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

import { useStageVisibility } from "./stage-visibility";
import { worldRenderingIsWorthIt } from "./webgl-support";
import type { WorldState } from "@/components/worlds/choreography";

/**
 * The host every exploded world shares.
 *
 * The five worlds that existed before this each carried their own copy of it, and the copies had
 * converged: the same four gates, the same requestAnimationFrame sampler reading the same track
 * geometry, the same caption block, the same flat figure underneath. What differed between them
 * was a class name and a minimum width.
 *
 * What is deliberately *not* shared is anything a reader can see move. The state list, the camera,
 * the scene graph and the readout stay with each world, because the point of a world is that a
 * transport surrogate and a chest-ray classifier look like different systems. Sharing the
 * choreography would produce nineteen worlds that move identically and read as one template used
 * nineteen times. `worlds/choreography.ts` says the same thing about its own primitives.
 *
 * ### The four gates, and why each one exists
 *
 * 1. **Width.** A multi-state sequence with a caption beside it is not legible in a phone's
 *    column. Below the threshold the flat figure is the page.
 * 2. **Motion.** A reader who has asked for less of it does not get a scroll-driven 3D stage.
 * 3. **A renderer worth using.** `worldRenderingIsWorthIt()` refuses a software rasteriser, where
 *    this would be a slideshow that also heats the machine.
 * 4. **Proximity.** Nothing mounts until the stage is near, and `frameloop` goes to `never` once
 *    it leaves, so a finished world stops competing for the main thread.
 *
 * Until all four pass the flat figure carries the whole argument. That is the contract: the world
 * is the enhancement, never the only copy of the evidence.
 */

/** What the sampler writes and the scene reads. Shared so the scene files can import one type. */
export interface WorldFrame {
  progress: number;
}

export default function WorldStage<K extends string>({
  states,
  active,
  className,
  flat,
  readout,
  canvas,
  minWidth = 1000,
}: {
  states: readonly WorldState<K>[];
  /** The state the reader is inside, for the caption and the live region. */
  active: (progress: number) => WorldState<K>;
  /** The world's own modifier, beside the shared `world-stage`. */
  className: string;
  /** The complete figure, which is the page until the renderer is up - and after it leaves. */
  flat: ReactNode;
  /** Optional per-state detail panel. */
  readout?: (state: K) => ReactNode;
  /**
   * The world's canvas, as a render prop rather than a component.
   *
   * Each world passes its own `dynamic(() => import("./XWorldCanvas"), { ssr: false })`, which is
   * what keeps one world's Three.js scene out of every other world's bundle. Hoisting the import
   * here would put all of them in one chunk.
   */
  canvas: (args: {
    frame: RefObject<WorldFrame | null>;
    frameloop: "always" | "never";
  }) => ReactNode;
  minWidth?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef<WorldFrame>({ progress: 0 });

  const [eligible, setEligible] = useState(false);
  const { drawing, mounted } = useStageVisibility(hostRef, eligible);
  const [caption, setCaption] = useState(() => states[0]);

  useEffect(() => {
    const wide = window.matchMedia(`(min-width: ${minWidth}px)`);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () => setEligible(wide.matches && !still.matches && worldRenderingIsWorthIt());
    evaluate();
    wide.addEventListener("change", evaluate);
    still.addEventListener("change", evaluate);
    return () => {
      wide.removeEventListener("change", evaluate);
      still.removeEventListener("change", evaluate);
    };
  }, [minWidth]);

  useEffect(() => {
    if (!drawing) return;
    let raf = 0;
    let lastKey = "";

    /*
     * Progress is written into a ref, not into state. The scene reads it inside the render loop,
     * so putting it in React state would re-render the tree sixty times a second to deliver a
     * number that only the GPU needs. Only the caption, which changes a handful of times across
     * the whole track, goes through setState.
     */
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
  }, [drawing, active]);

  return (
    <div className={`world-stage ${className}`} data-mode={mounted ? "scene" : "static"} ref={hostRef}>
      <div className="world-track" ref={trackRef}>
        <div className="world-viewport">
          {mounted ? (
            <div aria-hidden="true" className="world-canvas">
              {canvas({ frame, frameloop: drawing ? "always" : "never" })}
            </div>
          ) : null}

          <div className="world-caption">
            <p aria-live="polite" className="world-stage-line">
              <span className="world-index">
                {String(states.indexOf(caption) + 1).padStart(2, "0")} / {states.length}
              </span>
              <strong>{caption.label}</strong>
              <span className="world-line">{caption.caption}</span>
            </p>
            {readout ? readout(caption.key) : null}
          </div>

          {/* The figure stays in the document; it is hidden only once the surface is up. */}
          <div className="world-flat">{flat}</div>
        </div>
      </div>
    </div>
  );
}
