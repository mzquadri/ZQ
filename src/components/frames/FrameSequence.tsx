"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A scroll-scrubbed frame sequence.
 *
 * The premium teardown in every reference studied for this rebuild is delivered this way: not a
 * live renderer, but a pre-rendered sequence decomposed into frames, with scroll position mapped
 * to a frame index. Frames are chosen over both video and WebGL for the same reason the references
 * give - a decoded image array does not stutter, where video scrubbing does and a simulation can.
 *
 * Three things follow from that, and they are the reason this component exists rather than another
 * three.js world:
 *
 *   - **Phones get the cinema.** Every WebGL world on this site is refused on mobile and under
 *     reduced motion, and those readers currently get a static figure instead of the story. A
 *     frame sequence runs identically everywhere, so the sequence *is* the mobile experience.
 *   - **Frame zero is the resting composition.** The poster shown before any scroll, under reduced
 *     motion, and while frames are still arriving is the first frame of the sequence, so there is
 *     no seam between the page and the animation.
 *   - **Scroll is bidirectional time.** Scrolling back rewinds the teardown exactly; nothing here
 *     is a one-way trigger.
 *
 * No animation library. Scroll is sampled once per frame into a ref, the index is derived from it,
 * and a frame is drawn only when the index actually changes - so a still reader costs one
 * comparison per frame and nothing else.
 */

export default function FrameSequence({
  src,
  count,
  width,
  height,
  label,
  className,
  /** How many viewport heights the sequence is scrubbed across. Higher is slower. */
  travel = 3,
  viewTransitionName,
  children,
}: {
  src: string;
  count: number;
  width: number;
  height: number;
  label: string;
  className?: string;
  travel?: number;
  /**
   * Shared-element name, carried by the frame itself.
   *
   * It belongs on the visual and not on the text beside it: the transition animates the object a
   * visitor was looking at into the same object on the next page, and naming the plate instead
   * would animate the caption.
   */
  viewTransitionName?: string;
  /** Rendered over the frame, inside the pin, so the plate travels with the object. */
  children?: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const drawnRef = useRef(-1);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);

  /* Gate 1: motion, and gate 2: proximity. Nothing downloads until both pass. */
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (still.matches) return;
    const node = trackRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(true)),
      { rootMargin: "200% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* Decode every frame once, in order, then allow scrubbing. */
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let loaded = 0;
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < count; i += 1) {
      const img = new Image();
      img.decoding = "async";
      img.src = `${src}/${String(i).padStart(3, "0")}.webp`;
      img.onload = () => {
        loaded += 1;
        /*
         * Ready at the whole sequence, not at the first frame. Scrubbing into a gap and finding
         * nothing there is worse than holding the poster half a second longer.
         */
        if (loaded === count && !cancelled) {
          framesRef.current = images;
          setReady(true);
        }
      };
      images[i] = img;
    }
    return () => {
      cancelled = true;
    };
  }, [active, count, src]);

  /* Scrub. */
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !context) return;

    const sample = () => {
      const track = trackRef.current;
      if (track) {
        const rect = track.getBoundingClientRect();
        const span = Math.max(1, rect.height - window.innerHeight);
        const p = Math.max(0, Math.min(1, -rect.top / span));
        const index = Math.min(count - 1, Math.max(0, Math.round(p * (count - 1))));
        if (index !== drawnRef.current) {
          const frame = framesRef.current[index];
          if (frame?.complete) {
            context.drawImage(frame, 0, 0, canvas.width, canvas.height);
            drawnRef.current = index;
          }
        }
      }
      raf = requestAnimationFrame(sample);
    };
    raf = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(raf);
  }, [ready, count]);

  return (
    <div
      className={`seq${className ? ` ${className}` : ""}`}
      ref={trackRef}
      style={{ "--seq-travel": String(travel) } as React.CSSProperties}
    >
      <div className="seq-pin">
        {/*
          The ratio travels as a custom property rather than as an inline `aspectRatio`. React
          normalises inline style values, and the server and client disagreed on the spacing of
          "1280 / 720", which is enough to fail hydration. A custom property is passed through
          verbatim on both sides.
        */}
        <figure
          className="seq-frame"
          style={
            {
              "--seq-ratio": `${width} / ${height}`,
              ...(viewTransitionName ? { viewTransitionName } : {}),
            } as React.CSSProperties
          }
        >
          {/*
            The poster carries the accessible description and holds the frame until the sequence
            is decoded. It is the same image as frame zero, so the handover is invisible.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={label}
            className="seq-poster"
            data-hidden={ready ? "" : undefined}
            height={height}
            src={`${src}/poster.webp`}
            width={width}
          />
          <canvas
            aria-hidden="true"
            className="seq-canvas"
            data-ready={ready ? "" : undefined}
            height={height}
            ref={canvasRef}
            width={width}
          />
        </figure>
        {children ? <div className="seq-plate">{children}</div> : null}
      </div>
    </div>
  );
}
