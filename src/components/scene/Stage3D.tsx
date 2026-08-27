"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The gate every WebGL scene on this site passes through.
 *
 * Generalised from the vector card, which already had the right policy: three.js is not fetched
 * until four conditions hold - the scene is near the viewport, the visitor has not asked for
 * reduced motion, the viewport is wide enough for depth to read, and WebGL exists. If any fails,
 * the flat figure passed as `fallback` is the whole outcome, not a degraded one.
 *
 * It also exposes two things a scene needs and the old component computed privately:
 *
 *   `active`   the scene is properly on screen, not merely close enough to justify downloading
 *              the renderer. Scenes settle on this rather than on mere presence.
 *   `progress` how far the host has travelled through the viewport, 0 to 1. This is what lets a
 *              3D scene be scrubbed by scroll like everything else on the site, without a scroll
 *              listener: it is updated from IntersectionObserver thresholds, which fire off the
 *              main thread's critical path and stop entirely once the scene leaves.
 *
 * The FPS budget guard lives with the scenes themselves (they own the frame loop); this component
 * only needs to hear that it gave up, via `onDegrade`.
 */

const DEFAULT_MIN_WIDTH = 720;

export function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

export interface Stage3DState {
  active: boolean;
  progress: number;
  onDegrade: () => void;
}

export default function Stage3D({
  className,
  fallback,
  children,
  minWidth = DEFAULT_MIN_WIDTH,
  label,
  trackSelector,
}: {
  className: string;
  /** The flat figure. Always rendered - it is what a reader without WebGL actually sees. */
  fallback: ReactNode;
  children: (state: Stage3DState) => ReactNode;
  minWidth?: number;
  /** Describes the scene for assistive technology; the canvas itself is inert. */
  label?: string;
  /**
   * Ancestor selector whose travel through the viewport defines `progress`.
   *
   * Needed wherever the scene sits inside a sticky stage: a sticky element stops moving relative
   * to the viewport the moment it pins, so its own view progress stalls and the scene freezes
   * halfway through its sequence. The track is the tall element the sticky child is pinned
   * inside, and that is what the reader is actually scrolling through.
   */
  trackSelector?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [degraded, setDegraded] = useState(false);

  const onDegrade = useCallback(() => {
    setDegraded(true);
    setEnabled(false);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || degraded) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia(`(min-width: ${minWidth}px)`);
    const eligible = () => !motion.matches && wide.matches && webglAvailable();

    let mount: IntersectionObserver | null = null;
    let detach: (() => void) | null = null;

    const stop = () => {
      mount?.disconnect();
      mount = null;
      detach?.();
      detach = null;
    };

    const evaluate = () => {
      stop();
      if (!eligible()) {
        setEnabled(false);
        setActive(false);
        return;
      }

      mount = new IntersectionObserver(
        (entries) => {
          setEnabled(entries.some((entry) => entry.isIntersecting));
          setActive(entries.some((entry) => entry.intersectionRatio > 0.4));
        },
        { rootMargin: "300px 0px", threshold: [0, 0.4, 1] },
      );
      mount.observe(host);

      /*
       * Progress comes from a scroll listener, not from IntersectionObserver thresholds.
       *
       * Thresholds were tried first and are the wrong instrument here: on a track several
       * viewports tall the intersection *ratio* barely moves, so it crosses almost no thresholds
       * and the scene sits frozen mid-sequence. Sampling the rectangle is the only way to get
       * continuous progress.
       *
       * The cost is bounded on purpose. The listener is attached only while the scene is mounted
       * - which already means WebGL is running and the reader is looking at it - it is throttled
       * to one read per frame, and it is passive so it never blocks scrolling.
       */
      const tracked = (trackSelector && host.closest(trackSelector)) || host;

      let queued = false;
      const sample = () => {
        queued = false;
        const rect = tracked.getBoundingClientRect();
        const viewport = window.innerHeight || 1;
        const travelled = viewport - rect.top;
        const distance = viewport + rect.height;
        setProgress(Math.max(0, Math.min(1, travelled / distance)));
      };
      const onScroll = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(sample);
      };

      sample();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      detach = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    };

    evaluate();
    motion.addEventListener("change", evaluate);
    wide.addEventListener("change", evaluate);
    return () => {
      stop();
      motion.removeEventListener("change", evaluate);
      wide.removeEventListener("change", evaluate);
    };
  }, [degraded, minWidth, trackSelector]);

  return (
    <div
      aria-label={label}
      className={className}
      data-mode={enabled ? "webgl" : degraded ? "degraded" : "static"}
      ref={hostRef}
      role={label ? "img" : undefined}
    >
      {fallback}
      {enabled ? children({ active, progress, onDegrade }) : null}
    </div>
  );
}
