"use client";

import { useEffect, useRef, useState } from "react";

import { SCENES } from "./scenes";
import { CanvasSurface } from "./surface";

/**
 * The moving half of a flagship sequence.
 *
 * The still is already in the HTML as SVG, drawn by the same function this draws with. This adds
 * scroll: it evaluates the scene at the reader's position and paints the result, and it does so
 * only when three things are true - motion is wanted, the chapter is near, and the position has
 * actually changed.
 *
 * There is nothing to download. That is the whole reason this replaced a frame sequence: a
 * sequence of ninety images has to arrive before it can be scrubbed, and until it does the reader
 * is looking at a poster. Here the first paint and the last frame are the same code.
 */
export default function SceneCanvas({ slug }: { slug: string }) {
  const scene = SCENES[slug];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawnRef = useRef(-1);
  const [active, setActive] = useState(false);
  /* Held back until the first paint, so the canvas never covers the still while empty. */
  const [painted, setPainted] = useState(false);

  /* Gate one: motion. Gate two: proximity. Neither costs anything until it passes. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = canvasRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(true)),
      { rootMargin: "150% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active || !scene) return;
    const canvas = canvasRef.current;
    const track = canvas?.closest<HTMLElement>(".scn");
    if (!canvas || !track) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let portrait = false;

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) return false;
      portrait = box.height > box.width;
      /*
       * Capped at 2. Above that the extra pixels are past what the eye resolves on a phone and the
       * fill cost grows with their square, which is the one way a vector scene can get expensive.
       */
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const next = { w: Math.round(box.width * ratio), h: Math.round(box.height * ratio) };
      if (next.w !== canvas.width || next.h !== canvas.height) {
        canvas.width = next.w;
        canvas.height = next.h;
        drawnRef.current = -1;
      }
      w = portrait ? scene.portraitWidth : scene.width;
      h = portrait ? scene.portraitHeight : scene.height;
      return true;
    };

    const paint = (progress: number) => {
      if (!resize()) return;
      /* Fit the scene's drawing space into the canvas, preserving its aspect. */
      const scale = Math.min(canvas.width / w, canvas.height / h);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.fillStyle = scene.palette.ground;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.setTransform(
        scale,
        0,
        0,
        scale,
        (canvas.width - w * scale) / 2,
        (canvas.height - h * scale) / 2,
      );
      scene.draw(new CanvasSurface(context, w, h), progress, scene.palette);
      setPainted(true);
    };

    const sample = () => {
      const rect = track.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      const raw = Math.max(0, Math.min(1, -rect.top / span));
      /*
       * Quantised. A scene is a few hundred primitives, so redrawing is cheap, but redrawing for a
       * sub-pixel scroll delta is still work nobody can see.
       */
      const step = Math.round(raw * 900);
      if (step !== drawnRef.current) {
        drawnRef.current = step;
        paint(step / 900);
      }
      raf = requestAnimationFrame(sample);
    };

    raf = requestAnimationFrame(sample);
    const onResize = () => {
      drawnRef.current = -1;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [active, scene]);

  if (!scene) return null;

  return (
    <canvas
      aria-hidden="true"
      className="scn-canvas"
      data-ready={painted ? "" : undefined}
      ref={canvasRef}
    />
  );
}
