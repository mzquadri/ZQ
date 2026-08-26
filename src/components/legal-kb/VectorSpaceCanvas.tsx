"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { vectorPoints } from "@/content/legal-kb-scene";

/**
 * The client island that decides whether the vector card's WebGL layer runs at all.
 *
 * Four gates before three.js is fetched, the same four the repository showcase already uses: the
 * card must be near the viewport, the visitor must not prefer reduced motion, the viewport must
 * be wide enough for the depth to read, and WebGL must be available. If any fails, the card keeps
 * its flat mark and nothing is downloaded - which is a complete outcome, not a degraded one,
 * because the card's text already says everything the points can show.
 *
 * This is the only WebGL on the page. A vector representation is the one place where the claim
 * being made is genuinely spatial: units acquire positions in a space where distance stands for
 * similarity. Rows and references are lists and links; drawing those in 3D would be decoration.
 */

const VectorSpaceScene = dynamic(() => import("./VectorSpaceScene"), {
  ssr: false,
  loading: () => null,
});

const MIN_WIDTH = 720;

/** Projection bounds for the flat mark. Named so a run of coordinates never reaches the file. */
const FLAT = { half: 100, spread: 78, near: 2.1, depth: 2.6 } as const;

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

export default function VectorSpaceCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [degraded, setDegraded] = useState(false);

  const onDegrade = useCallback(() => {
    setDegraded(true);
    setEnabled(false);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || degraded) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
    const eligible = () => !motion.matches && wide.matches && webglAvailable();

    let observer: IntersectionObserver | null = null;

    const evaluate = () => {
      observer?.disconnect();
      observer = null;
      if (!eligible()) {
        setEnabled(false);
        setActive(false);
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((entry) => entry.isIntersecting);
          setEnabled(visible);
          // Separate from `enabled`: the points settle when the card is properly in view, not
          // when it is merely close enough to justify downloading the renderer.
          setActive(entries.some((entry) => entry.intersectionRatio > 0.5));
        },
        { rootMargin: "300px 0px", threshold: [0, 0.5, 1] },
      );
      observer.observe(host);
    };

    evaluate();
    motion.addEventListener("change", evaluate);
    wide.addEventListener("change", evaluate);
    return () => {
      observer?.disconnect();
      motion.removeEventListener("change", evaluate);
      wide.removeEventListener("change", evaluate);
    };
  }, [degraded]);

  return (
    <div
      aria-hidden="true"
      className="legal-vector-canvas"
      data-mode={enabled ? "webgl" : degraded ? "degraded" : "static"}
      ref={hostRef}
    >
      {/*
       * The flat mark is an orthographic projection of the very same sixteen points, not a
       * decorative scatter. Depth becomes point size, which is the honest 2D reading of "these
       * occupy positions in a space", and it means the WebGL layer and its absence are showing
       * one dataset rather than two different pictures.
       */}
      <svg
        className="legal-vector-flat"
        role="presentation"
        viewBox={`${-FLAT.half} ${-FLAT.half} ${FLAT.half * 2} ${FLAT.half * 2}`}
      >
        {vectorPoints.map(([x, y, z]) => (
          <circle
            cx={x * FLAT.spread}
            cy={-y * FLAT.spread}
            key={`${x},${y},${z}`}
            r={FLAT.near + (z + 0.5) * FLAT.depth}
          />
        ))}
      </svg>
      {enabled ? <VectorSpaceScene active={active} onDegrade={onDegrade} /> : null}
    </div>
  );
}
