"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";

import Readout from "./Readout";
import { STATES, active } from "./states";
import type { Frame } from "./CifarWorldScene";

/**
 * The host for the CIFAR world.
 *
 * Same three gates as every other world: wide enough for a twelve-state sequence to be legible,
 * motion not declined, and the section actually on screen. Until all three pass, the architecture,
 * the per-class spread and the confusion matrix are the page as a static figure - the whole
 * argument, so nothing is withheld from a reader who never triggers the renderer.
 */

const WorldCanvas = dynamic(() => import("./CifarWorldCanvas"), { ssr: false });

const MIN_WIDTH = 1000;

export default function CifarWorld({ flat }: { flat: ReactNode }) {
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
    <div
      className="world-stage cifar-world"
      data-mode={mounted ? "scene" : "static"}
      ref={hostRef}
    >
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

          {/* The figures stay in the document; they are hidden only once the surface is up. */}
          <div className="world-flat">{flat}</div>
        </div>
      </div>
    </div>
  );
}
