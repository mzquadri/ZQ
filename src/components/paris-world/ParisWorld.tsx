"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { places, worldIntro } from "@/content/world-atlas";
import { worldRenderingIsWorthIt } from "@/components/world/webgl-support";
import type { WorldFrame } from "./ParisWorldScene";

const ParisWorldCanvas = dynamic(() => import("./ParisWorldCanvas"), { ssr: false });

/** Below this width the world is not worth the download; the classic view is. */
const MIN_WIDTH = 820;

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The explorable world, and everything around it that is not WebGL.
 *
 * The reader is never trapped in it. A phone, a browser without WebGL, and a
 * reader who has asked for less motion all get sent to the classic view
 * instead, and the link to it is on screen the whole time for everyone else.
 * The world is a way to look at the work, not a toll gate in front of it.
 */
export default function ParisWorld({ dark }: { dark: boolean }) {
  const frame = useRef<WorldFrame>({ selected: -1, hovered: -1, dark: dark ? 1 : 0, drift: true });
  const [selected, setSelected] = useState(-1);
  const [ready, setReady] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    /* Decided after the first paint, not during it. Setting state synchronously
     * inside an effect makes React render twice before the browser draws; a
     * frame later costs nothing visible and the page is already up. */
    const id = requestAnimationFrame(() => {
      const wide = window.innerWidth >= MIN_WIDTH;
      const reduced = prefersReducedMotion();
    /*
     * `?world=force` exists for one job: taking the screen recording. The
     * renderer check fails closed on a software rasteriser, which is exactly
     * what a headless browser reports, so without an override the world can
     * never be filmed. It overrides the renderer test only. A narrow window
     * and a request for reduced motion still send the reader to the classic
     * view, because those are the reader's circumstances rather than ours.
     */
      const forced = new URLSearchParams(window.location.search).get("world") === "force";
      setSupported(wide && !reduced && (forced || worldRenderingIsWorthIt()));
      frame.current.drift = !reduced;
      setReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  /* The theme is owned by the document, so the scene is told about it rather
   * than asking: one source of truth, and the dissolve happens in the frame
   * loop where every other colour change happens.
   *
   * The rate is matched to the CSS transition on the panels. They used to
   * differ, and a frame caught between them showed a dark interface floating
   * over a daylit city. */
  useEffect(() => {
    const f = frame.current;
    let raf = 0;
    const target = dark ? 1 : 0;
    const step = () => {
      f.dark += (target - f.dark) * 0.22;
      if (Math.abs(target - f.dark) > 0.002) raf = requestAnimationFrame(step);
      else f.dark = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [dark]);

  const visit = useCallback((index: number) => {
    setSelected(index);
    frame.current.selected = index;
  }, []);

  const place = selected >= 0 ? places[selected] : null;

  if (!ready || supported === null) {
    return <div className="world-stage world-stage-idle" aria-hidden="true" />;
  }

  if (!supported) {
    return (
      <section className="world-fallback">
        <h1>{worldIntro.title}</h1>
        <p>{worldIntro.standfirst}</p>
        <p className="world-fallback-note">
          The 3D world needs a wider screen and WebGL, and it is switched off when you have asked
          your system for less motion. Everything it shows is on the classic view, which is faster
          anyway.
        </p>
        <Link className="world-cta" href="/classic">
          {worldIntro.classicLabel}
        </Link>
      </section>
    );
  }

  return (
    <section className="world-stage">
      <div className="world-canvas">
        <ParisWorldCanvas frame={frame} frameloop="always" />
      </div>

      <header className="world-intro" data-away={selected >= 0 ? "true" : "false"}>
        <h1>{worldIntro.title}</h1>
        <p>{worldIntro.standfirst}</p>
      </header>

      <nav className="world-places" aria-label="Places in the world">
        <p className="world-places-label">Visit</p>
        <ul>
          {places.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                className={i === selected ? "is-current" : undefined}
                onClick={() => visit(i)}
                onPointerEnter={() => (frame.current.hovered = i)}
                onPointerLeave={() => (frame.current.hovered = -1)}
                aria-current={i === selected ? "true" : undefined}
              >
                <span className="world-place-name">{item.name}</span>
                <span className="world-place-kind">{item.kind}</span>
              </button>
            </li>
          ))}
        </ul>
        {selected >= 0 ? (
          <button type="button" className="world-wide" onClick={() => visit(-1)}>
            Back to the whole city
          </button>
        ) : null}
      </nav>

      {place ? (
        <aside className="world-readout" aria-live="polite">
          <p className="world-readout-kind">{place.kind}</p>
          <h2>{place.name}</h2>
          <p className="world-readout-headline">{place.headline}</p>
          <p className="world-readout-detail">{place.detail}</p>
          <Link className="world-readout-link" href={place.href}>
            Read the whole thing
          </Link>
        </aside>
      ) : null}

      <footer className="world-escape">
        <Link className="world-cta" href="/classic">
          {worldIntro.classicLabel}
        </Link>
        <span>{worldIntro.classicHint}</span>
      </footer>
    </section>
  );
}
