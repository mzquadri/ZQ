"use client";

import { useCallback, useMemo, type ReactNode } from "react";

import CanvasStage, { type DrawFn } from "@/components/scene/CanvasStage";
import { CONFIDENCE_FLOOR, series } from "@/content/cinema-geometry";
import { ease, mix, project, ramp, rgba, type Camera } from "@/components/scene/projector";

/**
 * The hero, given depth.
 *
 * Same five beats and the same data as the flat figure beneath it - not a second dataset, the
 * identical series - but the horizon now runs *into* the scene instead of across it. That is the
 * one thing the SVG cannot say: the interval is a surface over time, and calibration reshapes a
 * surface rather than adjusting a pair of lines.
 *
 * Canvas 2D, not WebGL. The hero is above the fold, and the figure is a few hundred flat faces;
 * paying 875KB for a perspective transform there would be indefensible. See projector.ts.
 *
 * Sampled rather than complete: every third point of the series, which is enough for the ribbon
 * to read and keeps the painter's sort small.
 */

const STEP = 3;
const SAMPLES = series.filter((_, i) => i % STEP === 0);

/** Series index becomes depth; the value becomes height; the band becomes the ribbon's width. */
/*
 * Screen width for this figure is `depth * sin(yaw) * focal / distance` - every point sits at
 * x = 0, so the span is the only thing that gives it horizontal presence. Sized so the ribbon
 * fills the hero rather than floating in the middle of it.
 */
const DEPTH_SPAN = 26;
const HEIGHT_SCALE = 0.034;

const BEATS = {
  drawFrom: 0.02,
  drawTo: 0.24,
  expandFrom: 0.22,
  expandTo: 0.44,
  calibrateFrom: 0.44,
  calibrateTo: 0.64,
  verifyFrom: 0.62,
  verifyTo: 0.8,
  declineFrom: 0.78,
  declineTo: 0.96,
} as const;

function readToken(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export default function HeroFieldCanvas({ flat }: { flat: ReactNode }) {
  const camera = useMemo<Camera>(() => ({ distance: 13, focal: 640, yaw: -1.05, pitch: 0.22 }), []);

  const draw = useCallback<DrawFn>((context, { progress, width, height, camera: base }) => {
    const accent = readToken("--accent-graph", "#4cc4b0");
    const warn = readToken("--orange", "#f15a35");
    const ink = readToken("--stage-ink", "#f2f0e8");

    const drawn = ease(ramp(progress, BEATS.drawFrom, BEATS.drawTo));
    const expand = ease(ramp(progress, BEATS.expandFrom, BEATS.expandTo));
    const calibrate = ease(ramp(progress, BEATS.calibrateFrom, BEATS.calibrateTo));
    const verify = ease(ramp(progress, BEATS.verifyFrom, BEATS.verifyTo));
    const decline = ease(ramp(progress, BEATS.declineFrom, BEATS.declineTo));

    /*
     * The camera swings a little across the sequence and settles lower as the ribbon takes shape,
     * because a surface read from directly above is indistinguishable from a pair of lines.
     */
    const cam: Camera = {
      ...base,
      /*
       * Yaw is kept well away from zero on purpose.
       *
       * Every point in this figure sits at x = 0 and is distinguished only by depth, so screen
       * width comes entirely from `-z * sin(yaw)`. Near yaw = 0 that term vanishes and the whole
       * ribbon collapses into a vertical spike - which is exactly what it did. Holding the angle
       * between roughly -1.05 and -0.7 keeps the horizon spread across the frame while still
       * turning enough to show the surface has depth.
       */
      yaw: base.yaw + progress * 0.35,
      pitch: mix(0.32, 0.1, ease(ramp(progress, 0.1, 0.7))),
      focal: (base.focal * Math.min(width, 1600)) / 1100,
    };

    const at = (i: number) => {
      const s = SAMPLES[i];
      const t = i / Math.max(1, SAMPLES.length - 1);
      return {
        z: (t - 0.5) * DEPTH_SPAN,
        y: (160 - s.y) * HEIGHT_SCALE,
        // Uniform first, then the calibrated width that tracks where the signal is genuinely hard.
        band: mix(s.rawBand, s.calBand, calibrate) * HEIGHT_SCALE * expand,
        confident: s.confidence >= CONFIDENCE_FLOOR,
        observed: (160 - s.observed) * HEIGHT_SCALE,
        covered: s.covered,
      };
    };

    const visible = Math.max(2, Math.floor(SAMPLES.length * drawn));

    /*
     * The envelope is one closed surface, not a run of quads.
     *
     * Drawing it as separate quads was tried and produced a hatched fold wherever the band width
     * changed quickly - adjacent faces projecting almost on top of each other, each stroked. A
     * single polygon traced along the upper edge and back along the lower one has no interior
     * seams to fold, is one fill instead of thirty, and needs no depth sort at all.
     */
    const upper: { x: number; y: number }[] = [];
    const lower: { x: number; y: number }[] = [];
    let declinedRun = 0;

    for (let i = 0; i < visible; i += 1) {
      const p = at(i);
      upper.push(project({ x: 0, y: p.y + p.band, z: p.z }, cam, width, height));
      lower.push(project({ x: 0, y: p.y - p.band, z: p.z }, cam, width, height));
      if (!p.confident) declinedRun += 1;
    }

    const traceSurface = (fill: string, stroke: string) => {
      context.beginPath();
      upper.forEach((q, i) => (i === 0 ? context.moveTo(q.x, q.y) : context.lineTo(q.x, q.y)));
      for (let i = lower.length - 1; i >= 0; i -= 1) context.lineTo(lower[i].x, lower[i].y);
      context.closePath();
      context.fillStyle = fill;
      context.fill();
      context.strokeStyle = stroke;
      context.lineWidth = 1.1;
      context.stroke();
    };

    traceSurface(rgba(accent, 0.18), rgba(accent, 0.34));

    /*
     * The region the model declines to answer in, drawn over the surface as its own band so the
     * boundary is a visible edge rather than a colour that has been blended into its neighbour.
     */
    if (decline > 0 && declinedRun > 1) {
      const lowConf = [];
      for (let i = 0; i < visible; i += 1) if (!at(i).confident) lowConf.push(i);
      if (lowConf.length > 1) {
        const from = lowConf[0];
        const to = lowConf[lowConf.length - 1];
        context.beginPath();
        for (let i = from; i <= to; i += 1) {
          const q = upper[i];
          if (i === from) context.moveTo(q.x, q.y);
          else context.lineTo(q.x, q.y);
        }
        for (let i = to; i >= from; i -= 1) context.lineTo(lower[i].x, lower[i].y);
        context.closePath();
        context.fillStyle = rgba(warn, 0.1 + decline * 0.14);
        context.fill();
        context.strokeStyle = rgba(warn, decline * 0.55);
        context.setLineDash([4, 4]);
        context.lineWidth = 1;
        context.stroke();
        context.setLineDash([]);
      }
    }

    /* The prediction itself, drawn over the surface it sits inside. */
    context.beginPath();
    for (let i = 0; i < visible; i += 1) {
      const p = at(i);
      const q = project({ x: 0, y: p.y, z: p.z }, cam, width, height);
      if (i === 0) context.moveTo(q.x, q.y);
      else context.lineTo(q.x, q.y);
    }
    context.strokeStyle = rgba(accent, 0.95);
    context.lineWidth = 2.4;
    context.lineJoin = "round";
    context.stroke();

    /* Observations pin the surface to what actually happened. */
    if (verify > 0) {
      for (let i = 0; i < visible; i += 2) {
        const p = at(i);
        const q = project({ x: 0, y: p.observed, z: p.z }, cam, width, height);
        const declined = decline * (p.confident ? 0 : 1);
        context.beginPath();
        context.arc(q.x, q.y, Math.max(1.2, q.scale * 0.016), 0, Math.PI * 2);
        context.fillStyle = p.covered
          ? rgba(ink, 0.5 + verify * 0.45)
          : rgba(warn, 0.55 + verify * 0.45);
        context.fill();
        if (declined > 0.4) {
          // Declined observations are ringed rather than dimmed, so they stay at full contrast.
          context.beginPath();
          context.arc(q.x, q.y, Math.max(3, q.scale * 0.034), 0, Math.PI * 2);
          context.strokeStyle = rgba(warn, 0.55);
          context.lineWidth = 1;
          context.stroke();
        }
      }
    }
  }, []);

  return (
    <CanvasStage
      camera={camera}
      className="hero-field"
      draw={draw}
      fallback={flat}
      minWidth={900}
      trackSelector=".cine-hero"
      label="The forecast and its uncertainty interval drawn as a surface running into depth: the interval widens where the signal is hard, narrows where it is not, and the region the model declines to answer in is marked."
    />
  );
}
