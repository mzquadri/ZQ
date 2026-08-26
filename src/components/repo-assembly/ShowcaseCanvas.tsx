"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RepoAssembly } from "@/content/assembly";
import type { HoverInfo } from "./AssemblyScene";
import styles from "./RepoShowcase.module.css";

/**
 * The client island that decides whether the 3D layer runs at all, and tears it down
 * cleanly when it should not.
 *
 * Four gates have to pass before three.js is even fetched: the section must be near the
 * viewport, the visitor must not prefer reduced motion, the viewport must be wide enough
 * to be worth it, and WebGL must actually be available. If any fails, nothing loads and
 * the server-rendered strip below is all there is - which is the intended outcome, not a
 * degraded one.
 */

const AssemblyScene = dynamic(() => import("./AssemblyScene"), {
  ssr: false,
  loading: () => null,
});

const MIN_WIDTH = 900;

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

export default function ShowcaseCanvas({ assemblies }: { assemblies: readonly RepoAssembly[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [enabled, setEnabled] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const router = useRouter();

  const onSelect = useCallback((href: string) => router.push(href), [router]);

  // --- Eligibility and lazy mount ------------------------------------------------
  useEffect(() => {
    const host = hostRef.current;
    if (!host || degraded) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);

    const eligible = () => !motion.matches && wide.matches && webglAvailable();

    let observer: IntersectionObserver | null = null;
    const evaluate = () => {
      if (!eligible()) {
        setEnabled(false);
        setHover(null);
        return;
      }
      observer?.disconnect();
      // Mount a little before the section arrives, unmount well after it leaves, so the
      // canvas never exists for a visitor who scrolls straight past.
      observer = new IntersectionObserver(
        (entries) => setEnabled(entries.some((entry) => entry.isIntersecting)),
        { rootMargin: "400px 0px" },
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

  // --- Scroll progress -----------------------------------------------------------
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !enabled) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = host.getBoundingClientRect();
      const span = rect.height + window.innerHeight;
      const travelled = window.innerHeight - rect.top;
      progress.current = Math.min(Math.max(travelled / span, 0), 1);
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled]);

  const onDegrade = useCallback(() => {
    setDegraded(true);
    setEnabled(false);
    setHover(null);
  }, []);

  return (
    <div
      className={styles.canvasHost}
      data-mode={enabled ? "webgl" : degraded ? "degraded" : "static"}
      ref={hostRef}
    >
      {enabled ? (
        <>
          <div aria-hidden="true" className={styles.canvasLayer}>
            <AssemblyScene
              assemblies={assemblies}
              onDegrade={onDegrade}
              onHover={setHover}
              onSelect={onSelect}
              progress={progress}
            />
          </div>
          {hover ? (
            <p aria-hidden="true" className={styles.tooltip}>
              <span>{hover.kind}</span>
              <strong>{hover.label}</strong>
              <span>
                {hover.repo} · last public commit {hover.lastCommit}
              </span>
            </p>
          ) : (
            <p aria-hidden="true" className={styles.hint}>
              Scroll to separate · hover a part · click to open the case study
            </p>
          )}
        </>
      ) : degraded ? (
        /*
         * The band keeps the height it already occupied. Collapsing it would slide the
         * cards below up under the reader's eye, which is a worse outcome than a quiet
         * notice - and the strip beneath already carries everything the layer showed.
         */
        <p className={styles.degradedNote}>
          The 3D view was switched off to keep this page responsive. Everything it showed is
          listed below.
        </p>
      ) : null}
    </div>
  );
}
