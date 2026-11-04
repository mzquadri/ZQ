"use client";

import { useEffect } from "react";

/** Everything on the site that behaves like a card. Add a selector here and it tilts. */
const TILT = [
  ".metric",
  ".work-card",
  ".writing-card",
  ".artifact-links > a",
  ".ending-channels a",
  ".cred-list > li",
  ".exp-item",
  ".xp-role",
  ".res-item",
  ".skill-group",
  ".edu-item",
  ".reliable-list > li",
  ".limitation-panel",
  ".footer-grid > div",
].join(",");

const MAX_TILT = 6;

/**
 * Pointer tilt, glare and layered depth for every card, from one listener.
 *
 * One delegated listener rather than a component per card, so a page with sixty cards costs the
 * same as a page with one and the cards stay server-rendered. tilt.css does the drawing. With no
 * fine pointer or under reduced motion this never attaches.
 */
export default function GlobalTilt() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;

    const listeners = new AbortController();
    let active: HTMLElement | null = null;
    let frame = 0;
    let x = 0.5;
    let y = 0.5;

    const release = () => {
      if (!active) return;
      delete active.dataset.tilting;
      for (const name of ["--t-rx", "--t-ry", "--t-gx", "--t-gy"]) active.style.removeProperty(name);
      active = null;
    };

    const paint = () => {
      frame = 0;
      if (!active) return;
      active.style.setProperty("--t-rx", `${((0.5 - y) * 2 * MAX_TILT).toFixed(2)}deg`);
      active.style.setProperty("--t-ry", `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
      active.style.setProperty("--t-gx", `${(x * 100).toFixed(1)}%`);
      active.style.setProperty("--t-gy", `${(y * 100).toFixed(1)}%`);
    };

    document.addEventListener(
      "pointermove",
      (event) => {
        const target = event.target instanceof Element ? event.target.closest<HTMLElement>(TILT) : null;
        if (target !== active) release();
        if (!target) return;
        active = target;
        active.dataset.tilting = "";
        const box = target.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return;
        x = (event.clientX - box.left) / box.width;
        y = (event.clientY - box.top) / box.height;
        if (!frame) frame = requestAnimationFrame(paint);
      },
      { passive: true, signal: listeners.signal },
    );
    document.addEventListener("pointerleave", release, { signal: listeners.signal });

    return () => {
      listeners.abort();
      cancelAnimationFrame(frame);
      release();
    };
  }, []);

  return null;
}
