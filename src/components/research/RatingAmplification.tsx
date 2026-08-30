"use client";

import { useId, useState } from "react";

import {
  amplificationStops,
  dischargeBand,
  gaugeUncertaintyCm,
  ratingDischarge,
  verdict,
} from "@/content/hydrology-world";

/**
 * The same ruler error, moved along the curve.
 *
 * The rest of this page reports the amplification at two stages and lets the reader infer what
 * happens between them. That inference is the whole finding, so here it is the thing you do: one
 * water level under your control, a gauge uncertainty that never changes, and a discharge interval
 * that opens from about seven to well over three hundred as the level rises.
 *
 * The point a reader should leave with is a derivative, not a number. **The measurement error did
 * not grow.** It is fixed at plus or minus 25 cm everywhere on the axis, and it is drawn at
 * constant width to prove it. What grows is what the curve does with it, because the curve is
 * steep at the top and nearly flat at the bottom.
 *
 * Not a forecast. There is no horizon, no lead time and no predictive interval here: this is a
 * fixed measurement uncertainty pushed through a fitted stage-discharge relationship, which is a
 * smaller and different claim.
 *
 * A range input rather than a scroll scrub, because it is the one control that is already
 * keyboard-operable, already touch-operable, and already announced correctly - and because a
 * reader who wants to move slowly across the steep part should be able to, rather than being
 * carried through it at whatever speed the page happens to scroll.
 */

const MIN_STAGE = 250;
const MAX_STAGE = 560;
const PLOT = { w: 720, h: 380, left: 96, right: 34, top: 26, bottom: 54 };
const Q_MAX = ratingDischarge(MAX_STAGE) * 1.06;

const px = (stage: number) =>
  PLOT.left + ((stage - MIN_STAGE) / (MAX_STAGE - MIN_STAGE)) * (PLOT.w - PLOT.left - PLOT.right);
const py = (q: number) => PLOT.h - PLOT.bottom - (q / Q_MAX) * (PLOT.h - PLOT.top - PLOT.bottom);

const CURVE = Array.from({ length: 121 }, (_, i) => {
  const stage = MIN_STAGE + ((MAX_STAGE - MIN_STAGE) * i) / 120;
  return `${px(stage).toFixed(1)},${py(ratingDischarge(stage)).toFixed(1)}`;
}).join(" ");

export default function RatingAmplification() {
  const [stage, setStage] = useState<number>(verdict.baseStage);
  const id = useId();

  const band = dischargeBand(stage);
  const lo = stage - gaugeUncertaintyCm;
  const hi = stage + gaugeUncertaintyCm;

  return (
    <figure className="chart-figure research-figure rating-amp">
      <figcaption>
        <strong>Technical question</strong>
        The gauge is uncertain by the same 25 cm wherever the river is. What does that become in
        discharge, and why does the answer depend on where you measure?
      </figcaption>

      <div className="rating-amp-controls">
        <label htmlFor={id}>
          Water level
          <output>{stage} cm</output>
        </label>
        <input
          id={id}
          max={MAX_STAGE}
          min={MIN_STAGE}
          onChange={(event) => setStage(Number(event.target.value))}
          step={1}
          type="range"
          value={stage}
        />
        {/* Coarse stops, for a thumb and for anyone who would rather not drag at all. */}
        <div className="rating-amp-stops">
          {amplificationStops.map((stop) => (
            <button
              key={stop.key}
              type="button"
              data-active={Math.abs(stage - stop.stage) < 3 ? "" : undefined}
              onClick={() => setStage(stop.stage)}
            >
              {stop.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-visual" aria-hidden="true">
        <svg viewBox={`0 0 ${PLOT.w} ${PLOT.h}`}>
          <g className="chart-grid">
            <path d={`M${PLOT.left} ${PLOT.top}V${PLOT.h - PLOT.bottom}H${PLOT.w - PLOT.right}`} />
          </g>

          <polyline className="rating-amp-curve" points={CURVE} />

          {/* The input: identical width at every position on the axis. */}
          <g className="rating-amp-input">
            <line x1={px(lo)} y1={PLOT.h - PLOT.bottom} x2={px(hi)} y2={PLOT.h - PLOT.bottom} />
            <line x1={px(lo)} y1={PLOT.h - PLOT.bottom - 7} x2={px(lo)} y2={PLOT.h - PLOT.bottom + 7} />
            <line x1={px(hi)} y1={PLOT.h - PLOT.bottom - 7} x2={px(hi)} y2={PLOT.h - PLOT.bottom + 7} />
          </g>

          {/* Up to the curve, then across to the discharge axis. */}
          <g className="rating-amp-project">
            <line x1={px(lo)} y1={PLOT.h - PLOT.bottom} x2={px(lo)} y2={py(band.low)} />
            <line x1={px(hi)} y1={PLOT.h - PLOT.bottom} x2={px(hi)} y2={py(band.high)} />
            <line x1={px(lo)} y1={py(band.low)} x2={PLOT.left} y2={py(band.low)} />
            <line x1={px(hi)} y1={py(band.high)} x2={PLOT.left} y2={py(band.high)} />
          </g>

          {/* The output: the same input, after the curve. */}
          <line
            className="rating-amp-output"
            x1={PLOT.left}
            y1={py(band.low)}
            x2={PLOT.left}
            y2={py(band.high)}
          />
          <circle className="rating-amp-dot" cx={px(stage)} cy={py(band.centre)} r="5" />

          <g className="chart-labels">
            <text x={PLOT.w - PLOT.right} y={PLOT.h - 16} textAnchor="end">
              water level (cm)
            </text>
            <text x={PLOT.left} y={PLOT.top - 8}>
              discharge (m³/s)
            </text>
          </g>
        </svg>
      </div>

      {/*
        The reading, in text. Two figures side by side: one that never changes and one that does.
        This is the accessible equivalent of the drawing above it, not a caption on it.
      */}
      <div className="rating-amp-readout">
        <div>
          <p className="rating-amp-label">Measurement uncertainty</p>
          <p className="rating-amp-value">&plusmn;{gaugeUncertaintyCm} cm</p>
          <p className="rating-amp-note">
            Fixed. The same at {MIN_STAGE} cm as at {MAX_STAGE}.
          </p>
        </div>
        <div data-output="">
          <p className="rating-amp-label">Discharge interval</p>
          <p className="rating-amp-value">
            {band.width < 100 ? band.width.toFixed(2) : band.width.toFixed(0)} m³/s
          </p>
          <p className="rating-amp-note">
            {band.low.toFixed(1)} to {band.high.toFixed(1)} at a water level of {stage} cm.
          </p>
        </div>
      </div>

      <p className="research-note">
        The error did not grow &mdash; the transformation amplified it. The curve is nearly flat at
        low water and steep at the top, so the same 50 cm of gauge uncertainty spans{" "}
        {verdict.bandAtBase} m³/s at a base stage of {verdict.baseStage} cm and {verdict.bandAtPeak}{" "}
        at {verdict.peakStage}. The local exponent runs from about {verdict.exponentAtBase} to{" "}
        {verdict.exponentAtPeak} across that range. Nothing here is a forecast: it is a fixed
        measurement uncertainty pushed through a fitted stage-discharge relationship.
      </p>

      <div className="research-table-wrap">
        <table className="research-data-table">
          <caption>
            Evaluated from the seminar&rsquo;s own fitted parameters. Source: {" "}
            {"results/assignment5/results_fiting_curve.txt"}
          </caption>
          <thead>
            <tr>
              <th scope="col">Water level</th>
              <th scope="col">Gauge uncertainty</th>
              <th scope="col">Discharge interval</th>
              <th scope="col">Width</th>
            </tr>
          </thead>
          <tbody>
            {amplificationStops.map((stop) => {
              const row = dischargeBand(stop.stage);
              return (
                <tr key={stop.key}>
                  <th scope="row">
                    {stop.label} &middot; {stop.stage} cm
                  </th>
                  <td>&plusmn;{gaugeUncertaintyCm} cm</td>
                  <td>
                    {row.low.toFixed(2)} &ndash; {row.high.toFixed(2)} m³/s
                  </td>
                  <td>{row.width < 100 ? row.width.toFixed(2) : row.width.toFixed(0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
