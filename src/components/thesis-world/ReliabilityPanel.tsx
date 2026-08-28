"use client";

import { calibration } from "@/content/thesis-world";
import { at } from "./states";

/**
 * The measurement the whole sequence exists to show.
 *
 * Claimed coverage along the bottom, delivered coverage up the side, and the diagonal a perfectly
 * calibrated model would sit on. The curve is the published array, not a drawn shape - which is
 * why it sags so far below the line before the temperature is applied, and why it still does not
 * quite reach the diagonal afterwards.
 *
 * SVG rather than geometry. Two axes and ten points gain nothing from perspective, and in world
 * space the orbiting camera kept swinging the most important thing on the page out of frame.
 * Pinned to the viewport it is always visible, sharp at any pixel ratio, and legible to a reader
 * who never loads the scene at all.
 */

const W = 260;
const H = 200;
const PAD = 30;

const x = (v: number) => PAD + v * (W - PAD * 2);
const y = (v: number) => H - PAD - v * (H - PAD * 2);

export default function ReliabilityPanel({ progress }: { progress: number }) {
  const appear = at(progress, "uncertainty");
  const calibrated = at(progress, "calibration");
  const leave = at(progress, "limits");
  const shown = Math.min(appear, 1 - leave);
  if (shown <= 0.02) return null;

  /* The curve draws itself in as the state arrives, then lifts toward the diagonal. */
  const drawn = Math.max(2, Math.round(calibration.nominal.length * Math.min(1, appear * 1.6)));
  const points = calibration.nominal.slice(0, drawn).map((nominal, i) => {
    const empirical = calibration.before[i] + (calibration.after[i] - calibration.before[i]) * calibrated;
    return `${i === 0 ? "M" : "L"}${x(nominal).toFixed(1)} ${y(empirical).toFixed(1)}`;
  });

  const ninety = calibration.nominal.indexOf(0.9);
  const atNinety =
    calibration.before[ninety] + (calibration.after[ninety] - calibration.before[ninety]) * calibrated;

  return (
    <div className="thesis-reliability" style={{ opacity: shown }}>
      <svg
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${W} ${H}`}
      >
        <path className="thesis-rel-frame" d={`M${x(0)} ${y(0)} L${x(1)} ${y(0)}`} />
        <path className="thesis-rel-frame" d={`M${x(0)} ${y(0)} L${x(0)} ${y(1)}`} />
        {/* Where a perfectly calibrated model would sit. */}
        <path className="thesis-rel-ideal" d={`M${x(0)} ${y(0)} L${x(1)} ${y(1)}`} />
        <path
          className="thesis-rel-curve"
          d={points.join(" ")}
          data-calibrated={calibrated > 0.5 ? "" : undefined}
        />
        {/* The 90% reading, called out because it is the number that matters. */}
        <line className="thesis-rel-drop" x1={x(0.9)} x2={x(0.9)} y1={y(atNinety)} y2={y(0.9)} />
        <circle className="thesis-rel-dot" cx={x(0.9)} cy={y(atNinety)} r={3.4} />
        <circle className="thesis-rel-ideal-dot" cx={x(0.9)} cy={y(0.9)} r={2.4} />
      </svg>
      <p className="thesis-reliability-key">
        <span>Claimed 90%</span>
        <strong data-calibrated={calibrated > 0.5 ? "" : undefined}>
          {(atNinety * 100).toFixed(1)}% delivered
        </strong>
      </p>
    </div>
  );
}
