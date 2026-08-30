import {
  calibration,
  inputExperiment,
  outputExperiment,
  ratingCurve,
  verdict,
} from "@/content/hydrology-world";

import {
  beat,
  caption,
  focus,
  mix,
  palette,
  type Palette,
  type SceneDefinition,
} from "../scene";
import type { Surface } from "../surface";

/**
 * Hydrology: the same model, and two very different kinds of wrong.
 *
 * This chapter is a single curve, and it is the only chapter in the reel that is. There is no
 * network, no pipeline and no field of objects - just a stage-discharge relationship and two
 * intervals projected through it, because that projection *is* the finding and anything else in
 * the frame would be decoration around it.
 *
 *   rest   the fitted rating curve, and the calibrated model behind it
 *   0.08   perturb the rain: two thousand series, multiplicative noise
 *   0.18   and the objective barely moves
 *   0.30   reset. The curve returns, unmarked
 *   0.40   perturb the ruler instead: plus or minus 25 cm on water level
 *   0.52   project that interval through the curve at low stage, and at the peak
 *   0.66   the discharge spread that comes out
 *   0.78   recalibrate, and it mostly does not help
 *   0.90   the ratio
 *
 * The curve is drawn from the seminar's own fitted parameters - two power laws blended by a
 * sigmoid - not from a shape chosen to look convincing. Evaluated at the stages the seminar
 * reports, it reproduces the published bands: 8.633 at base stage and 337.68 at the peak. The
 * picture and the numbers come from the same place.
 *
 * Deliberately not a forecast. There is no horizon, no predictive interval and no coverage claim
 * anywhere in this scene; it is a sensitivity result about where uncertainty enters a calibrated
 * model, which is a different and smaller thing.
 */

/** The seminar's fitted stage-discharge relationship, exactly as reported. */
function rating(h: number) {
  const w = 1 / (1 + Math.exp(-(h - ratingCurve.transition.centre) / ratingCurve.transition.width));
  const low =
    h > ratingCurve.q1.h0 ? ratingCurve.q1.a * Math.pow(h - ratingCurve.q1.h0, ratingCurve.q1.b) : 0;
  const high =
    h > ratingCurve.q2.h0 ? ratingCurve.q2.a * Math.pow(h - ratingCurve.q2.h0, ratingCurve.q2.b) : 0;
  return low * (1 - w) + high * w;
}

const H_MIN = 160;
const H_MAX = 590;
const Q_MAX = rating(H_MAX) * 1.08;

function draw(s: Surface, progress: number, p: Palette) {
  const rain = beat(progress, 0.08, 0.16);
  const rainCost = beat(progress, 0.18, 0.26);
  const reset = beat(progress, 0.3, 0.38);
  const ruler = beat(progress, 0.4, 0.5);
  const project = beat(progress, 0.52, 0.62);
  const spread = beat(progress, 0.66, 0.74);
  const recal = beat(progress, 0.78, 0.86);
  const ratio = beat(progress, 0.9, 0.98);

  const f = focus(s);
  const plotW = s.portrait ? s.w * 0.72 : f.r * 1.5;
  const plotH = s.portrait ? f.r * 1.25 : f.r * 1.5;
  const x0 = s.portrait ? (s.w - plotW) / 2 : f.x - plotW * 0.42;
  /* Lifted, so the stage markers and the axis label clear the caption line beneath them. */
  const y1 = f.y + plotH * (s.portrait ? 0.06 : 0.4);
  const y0 = y1 - plotH;

  const px = (h: number) => x0 + ((h - H_MIN) / (H_MAX - H_MIN)) * plotW;
  const py = (q: number) => y1 - (q / Q_MAX) * plotH;

  /* ---- axes ---- */
  s.line(x0, y1, x0 + plotW, y1, { stroke: p.line, width: 1 });
  s.line(x0, y0, x0, y1, { stroke: p.line, width: 1 });
  /* Below the stage markers, not level with them: "peak" and "water level" were overprinting. */
  s.text(x0 + plotW, y1 + s.unit * 0.058, "water level", {
    size: s.unit * 0.021,
    fill: p.soft,
    alpha: 0.7,
    mono: true,
    anchor: "end",
  });
  s.text(x0, y0 - s.unit * 0.016, "discharge", {
    size: s.unit * 0.021,
    fill: p.soft,
    alpha: 0.7,
    mono: true,
  });

  /* ---- the curve ---- */
  const pts: [number, number][] = [];
  for (let i = 0; i <= 90; i += 1) {
    const h = mix(H_MIN, H_MAX, i / 90);
    pts.push([px(h), py(rating(h))]);
  }
  s.poly(pts, { stroke: p.accent, width: 2, alpha: 0.95, cap: "round" });

  /* ---- perturbing the rain: noise above the curve, and almost nothing below it ---- */
  const rainAlive = rain * (1 - reset);
  if (rainAlive > 0.02) {
    for (let i = 0; i < 26; i += 1) {
      const t = i / 25;
      const h = mix(H_MIN + 30, H_MAX - 20, t);
      const jitter = (((i * 37) % 11) / 10 - 0.5) * s.unit * 0.02 * rainAlive;
      s.line(px(h), y0 + s.unit * 0.02, px(h) + jitter, y0 + s.unit * 0.06, {
        stroke: p.soft,
        width: 1,
        alpha: rainAlive * 0.5,
      });
    }
    /* The objective barely moves: a band so tight it has to be labelled to be believed. */
    if (rainCost > 0.02) {
      const band = (plotH * inputExperiment.ofvStd) / 0.25;
      s.poly(
        pts.map(([x, y]) => [x, y - band * rainCost] as [number, number]),
        { stroke: p.accent, width: 1, alpha: rainCost * 0.55 * (1 - reset) },
      );
      s.poly(
        pts.map(([x, y]) => [x, y + band * rainCost] as [number, number]),
        { stroke: p.accent, width: 1, alpha: rainCost * 0.55 * (1 - reset) },
      );
    }
  }

  /* ---- perturbing the ruler: the same interval on the axis, at two places ---- */
  const stages = [verdict.baseStage, verdict.peakStage];
  stages.forEach((h, i) => {
    const on = beat(ruler, i * 0.25, i * 0.25 + 0.6);
    if (on <= 0.02) return;
    const half = 25;
    const xa = px(h - half);
    const xb = px(h + half);
    const q = rating(h);

    /* The ruler error, drawn on the axis where it is introduced. Identical at both stages. */
    s.line(xa, y1, xb, y1, { stroke: p.ink, width: 3, alpha: on, cap: "round" });
    for (const x of [xa, xb]) {
      s.line(x, y1 - s.unit * 0.012, x, y1 + s.unit * 0.012, { stroke: p.ink, width: 1.4, alpha: on });
    }

    if (project > 0.02) {
      const pr = beat(project, i * 0.2, i * 0.2 + 0.7);
      const qa = rating(h - half);
      const qb = rating(h + half);
      /* Up to the curve, then across to the discharge axis. The amplification is the geometry. */
      for (const [x, qq] of [
        [xa, qa],
        [xb, qb],
      ] as const) {
        s.line(x, y1, x, mix(y1, py(qq), pr), { stroke: p.ink, width: 1, alpha: pr * 0.45, dash: [4, 4] });
        s.line(x, py(qq), mix(x, x0, pr), py(qq), {
          stroke: p.ink,
          width: 1,
          alpha: pr * 0.45,
          dash: [4, 4],
        });
      }
      if (spread > 0.02) {
        const sp = beat(spread, i * 0.2, i * 0.2 + 0.7);
        const band = qb - qa;
        /* The consequence: the same 50 cm becomes these two very different discharge bands. */
        /*
         * A floor on the drawn length. The base-stage band really is this small next to the peak
         * one - that is the finding - but at two pixels it reads as nothing rather than as little.
         */
        const top = mix(py(qa), py(qb), sp);
        const drawn = Math.abs(top - py(qa)) < s.unit * 0.02 ? py(qa) - s.unit * 0.02 * sp : top;
        s.line(x0, py(qa), x0, drawn, {
          stroke: p.warn,
          width: s.unit * 0.008,
          alpha: sp,
          cap: "round",
        });
        s.text(x0 - s.unit * 0.014, py(q), `${band.toFixed(band > 100 ? 0 : 1)}`, {
          size: s.unit * (i === 1 ? 0.03 : 0.022),
          fill: i === 1 ? p.warn : p.soft,
          alpha: sp,
          mono: true,
          anchor: "end",
          baseline: "middle",
        });
      }
    }

    s.text(px(h), y1 + s.unit * 0.03, i === 0 ? "base" : "peak", {
      size: s.unit * 0.02,
      fill: p.soft,
      alpha: on * 0.85,
      mono: true,
      anchor: "middle",
    });
  });

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (ratio > 0.05) {
    say(`perturbing the ruler costs ${verdict.lossRatio.toFixed(0)}x more`, ratio, p.warn);
    say(`than perturbing the rain`, ratio * 0.85, p.soft, 1);
  } else if (recal > 0.05) {
    say(`recalibrated NSE ${outputExperiment.recalNseMean.toFixed(4)}`, recal * (1 - ratio * 0.8), p.ink);
    say(`${outputExperiment.recalBetter} of ${outputExperiment.series} beat the baseline`, recal * 0.85 * (1 - ratio * 0.8), p.warn, 1);
  } else if (spread > 0.05) {
    say(`same 50 cm · ${verdict.bandAtBase.toFixed(1)} then ${verdict.bandAtPeak.toFixed(0)}`, spread * (1 - recal * 0.8), p.warn);
    say(`curve exponent ${verdict.exponentAtBase} to ${verdict.exponentAtPeak}`, spread * 0.8 * (1 - recal * 0.8), p.soft, 1);
  } else if (ruler > 0.05) say("now perturb the ruler: plus or minus 25 cm", ruler * (1 - project * 0.7), p.ink);
  else if (reset > 0.05) say("reset", reset * (1 - ruler * 0.9), p.soft);
  else if (rainCost > 0.05) {
    say(`NSE ${calibration.nse} to ${inputExperiment.nseMean.toFixed(4)}`, rainCost * (1 - reset * 0.9), p.ink);
    say(`${inputExperiment.betterByChance} of ${inputExperiment.series} did better by chance`, rainCost * 0.8 * (1 - reset * 0.9), p.soft, 1);
  } else if (rain > 0.05) say(`perturb the rain · ${inputExperiment.series} series`, rain * (1 - rainCost * 0.8), p.ink);
  else say(`calibrated HBV · NSE ${calibration.nse}`, 1 - rain * 0.9, p.soft);
}

export const hydrology: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3.4,
  portraitTravel: 2.8,
  rest: 0,
  label:
    "The seminar's fitted stage-discharge rating curve, drawn from its own two blended power laws. Perturbing the precipitation across two thousand series barely moves the objective. The curve resets, and the same experiment is run on the water level instead: an identical fifty-centimetre interval is projected through the curve at base stage and at the peak, and comes out as a discharge band of 8.6 in one place and 338 in the other. Recalibration recovers almost none of it, and the loss from perturbing the measurement is 356 times the loss from perturbing the rain. No forecast, horizon or coverage claim is made anywhere.",
  palette: palette("flow"),
  draw,
};
