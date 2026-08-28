"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import type { Camera } from "@/components/scene/projector";

/**
 * Host for the Canvas 2D scenes.
 *
 * Same contract as the WebGL stage - a complete flat figure underneath, gates before anything
 * runs, scroll progress as the only clock - but with no renderer to download. That is the point:
 * a scene built on this costs a couple of kilobytes, so it can sit above the fold without
 * arguing about payload.
 *
 * Two gates rather than four. There is no WebGL context to test for, and no reason to insist on
 * a wide viewport for something this cheap - a phone can afford it, so the narrow layouts get the
 * scene too, with the composition adapted by the draw function rather than switched off.
 *
 * Drawing happens only when the inputs change. A settled scene costs nothing, exactly like the
 * `frameloop="demand"` WebGL scenes.
 */

export type DrawFn = (
  context: CanvasRenderingContext2D,
  state: { progress: number; width: number; height: number; camera: Camera },
) => void;

const MAX_DPR = 1.75;

export default function CanvasStage({
  className,
  fallback,
  draw,
  camera,
  label,
  trackSelector,
  minWidth = 0,
}: {
  className: string;
  /** The flat figure. Always rendered; it is the whole thing for anyone the gates exclude. */
  fallback: ReactNode;
  draw: DrawFn;
  /** Base camera; the draw function is free to move it with progress. */
  camera: Camera;
  label?: string;
  /** Ancestor whose travel defines progress, for scenes inside a sticky stage. */
  trackSelector?: string;
  minWidth?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);
  const progressRef = useRef(0);
  const drawRef = useRef(draw);

  /* Kept in a ref so a new draw closure does not tear down and rebuild the listeners. */
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  /** Sizes the backing store to the box and the device, capped. */
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return null;
    const rect = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { context, width, height };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia(`(min-width: ${minWidth}px)`);
    const eligible = () => !motion.matches && wide.matches;

    let observer: IntersectionObserver | null = null;
    let detach: (() => void) | null = null;
    let frame = 0;
    let last = -1;

    const render = () => {
      frame = 0;
      const sized = resize();
      if (!sized) return;
      sized.context.clearRect(0, 0, sized.width, sized.height);
      drawRef.current(sized.context, {
        progress: progressRef.current,
        width: sized.width,
        height: sized.height,
        camera,
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(render);
    };

    const sample = () => {
      const tracked = (trackSelector && host.closest(trackSelector)) || host;
      const rect = tracked.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const value = Math.max(0, Math.min(1, (viewport - rect.top) / (viewport + rect.height)));
      progressRef.current = value;
      // Redraw only when the value has actually moved a visible amount.
      if (Math.abs(value - last) > 0.0015) {
        last = value;
        schedule();
      }
    };

    const stop = () => {
      observer?.disconnect();
      observer = null;
      detach?.();
      detach = null;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const evaluate = () => {
      stop();
      if (!eligible()) {
        setEnabled(false);
        return;
      }
      setEnabled(true);

      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((entry) => entry.isIntersecting);
          if (!visible) {
            detach?.();
            detach = null;
            return;
          }
          if (detach) return;
          const onScroll = () => sample();
          window.addEventListener("scroll", onScroll, { passive: true });
          window.addEventListener("resize", onScroll, { passive: true });
          detach = () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
          };
          sample();
          schedule();
        },
        { rootMargin: "200px 0px" },
      );
      observer.observe(host);
    };

    evaluate();
    motion.addEventListener("change", evaluate);
    wide.addEventListener("change", evaluate);
    return () => {
      stop();
      motion.removeEventListener("change", evaluate);
      wide.removeEventListener("change", evaluate);
    };
  }, [camera, minWidth, resize, trackSelector]);

  return (
    <div
      aria-label={label}
      className={className}
      data-mode={enabled ? "canvas" : "static"}
      ref={hostRef}
      role={label ? "img" : undefined}
    >
      {fallback}
      <canvas aria-hidden="true" className="canvas-layer" ref={canvasRef} />
    </div>
  );
}
