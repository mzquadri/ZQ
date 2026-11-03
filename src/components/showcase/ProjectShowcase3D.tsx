"use client";

import { useEffect, useRef, type ReactNode } from "react";

import styles from "./ProjectShowcase3D.module.css";

/**
 * The shared stage every project figure sits on.
 *
 * Three behaviours, and the file that owns each one is deliberate. The zoom is CSS alone, bound to
 * scroll position through `animation-timeline`, so it runs off the main thread and reverses when
 * the reader scrolls back up. The layers are CSS as well: anything inside marked `data-depth`
 * floats at its own Z. Only the pointer tilt needs a script, and this component is that script.
 *
 * The children stay server-rendered. Nothing here decides what a figure shows, and with no
 * JavaScript, no fine pointer or a reduced-motion preference the figure is simply flat and complete.
 */

/** Degrees at the far edge. Small enough that the type never skews out of legibility. */
const DEFAULT_TILT = 4;

interface ProjectShowcase3DProps {
  children: ReactNode;
  /** Scroll-bound zoom in and out. Off for index cards, which must be legible on first paint. */
  zoom?: boolean;
  /** Set inside a pinned stage, where a figure's own view timeline stalls while it is pinned. */
  pinned?: boolean;
  /** Stretch to the parent, for a card in a grid. */
  fill?: boolean;
  maxTilt?: number;
}

export default function ProjectShowcase3D({
  children,
  zoom = true,
  pinned = false,
  fill = false,
  maxTilt = DEFAULT_TILT,
}: ProjectShowcase3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const plane = planeRef.current;
    if (!host || !plane) return;

    const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const wantsCalm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canTilt || wantsCalm) return;

    const listeners = new AbortController();
    let frame = 0;
    let x = 0.5;
    let y = 0.5;

    const paint = () => {
      frame = 0;
      plane.style.setProperty("--ps-rx", `${((0.5 - y) * 2 * maxTilt).toFixed(2)}deg`);
      plane.style.setProperty("--ps-ry", `${((x - 0.5) * 2 * maxTilt).toFixed(2)}deg`);
      plane.style.setProperty("--ps-gx", `${(x * 100).toFixed(1)}%`);
      plane.style.setProperty("--ps-gy", `${(y * 100).toFixed(1)}%`);
    };

    host.addEventListener(
      "pointermove",
      (event) => {
        // Measured on the host: the plane is the thing rotating, so its own box would feed back.
        const box = host.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return;
        x = (event.clientX - box.left) / box.width;
        y = (event.clientY - box.top) / box.height;
        plane.dataset.tilting = "";
        if (!frame) frame = requestAnimationFrame(paint);
      },
      { passive: true, signal: listeners.signal },
    );

    host.addEventListener(
      "pointerleave",
      () => {
        cancelAnimationFrame(frame);
        frame = 0;
        delete plane.dataset.tilting;
        for (const property of ["--ps-rx", "--ps-ry", "--ps-gx", "--ps-gy"]) {
          plane.style.removeProperty(property);
        }
      },
      { signal: listeners.signal },
    );

    return () => {
      listeners.abort();
      cancelAnimationFrame(frame);
    };
  }, [maxTilt]);

  return (
    <div
      className={styles.stage}
      data-fill={fill ? "" : undefined}
      data-pinned={pinned ? "" : undefined}
      data-showcase=""
      data-zoom={zoom ? "" : undefined}
      ref={hostRef}
    >
      <div className={styles.plane} ref={planeRef}>
        {children}
        <span aria-hidden="true" className={styles.glare} />
      </div>
    </div>
  );
}
