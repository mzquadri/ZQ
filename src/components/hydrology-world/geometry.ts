import {
  curve,
  event,
  inputExperiment,
  outputExperiment,
  ratingCurve,
  verdict,
} from "@/content/hydrology-world";

/**
 * The shape of the scene, and the one piece of real physics in it.
 *
 * The stage ensemble here is not decoration and it is not a spread drawn to look plausible. It is
 * generated the way Assignment 5 generates it: draw a uniform offset in [-25, +25] cm for every
 * timestep of every member, add it to the water level, and push the result through the fitted
 * rating curve. That is the repository's method, reproduced, using the repository's coefficients.
 *
 * What is NOT reproduced is numpy's exact random stream under seed 42, so these are not the same
 * 2,000 series - they are 44 series drawn the same way. The shape of the spread is a consequence
 * of the curve, which is the part that carries the argument.
 */

/* Deterministic noise, so the scene is identical on every load and between server and client. */
function hash(n: number) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32;
}

/** Q(h), evaluated exactly as Ass_05_Output_Uncertain_Group_B.py evaluates it. */
export function dischargeAt(h: number) {
  const a = h - ratingCurve.q2.h0;
  const q2 =
    a < 0
      ? ratingCurve.q2.a * -Math.pow(Math.abs(a), ratingCurve.q2.b)
      : ratingCurve.q2.a * Math.pow(a, ratingCurve.q2.b);
  const q1 = ratingCurve.q1.a * Math.pow(Math.max(0, h - ratingCurve.q1.h0), ratingCurve.q1.b);
  const w = 1 / (1 + Math.exp(-(h - ratingCurve.transition.centre) / ratingCurve.transition.width));
  return (1 - w) * q1 + w * q2;
}

/* World extents. Time runs along X, discharge up Y, ensemble members back into Z. */
export const SPAN_X = 8.6;
export const SPAN_Y = 3.1;
export const SPAN_Z = 3.4;

/** Every discharge in the scene is divided by the same number, so bands stay comparable. */
export const Q_SCALE = Math.max(...event.map((p) => p[4]));

export const x = (t: number) => (t - 0.5) * SPAN_X;
export const y = (q: number) => (q / Q_SCALE) * SPAN_Y;

/** The reference trajectory: the event as the unperturbed rating curve renders it. */
export const reference = event.map((p) => ({ t: p[0], stage: p[1], q: p[2] }));

export const MEMBERS = 44;
export const PERTURBATION = { low: -25, high: 25 };

/**
 * The stage ensemble: the repository's generator, run again.
 *
 * One offset per member per timestep, uniform across the interval the code actually uses, added
 * to stage before the curve is applied. Nothing here scales a band by a chosen amount - the width
 * at any point is whatever the curve returns, which is why it is narrow at baseflow and enormous
 * at the peak without being told to be.
 */
export const stageMembers = Array.from({ length: MEMBERS }, (_, m) =>
  event.map((p, i) => {
    const u = PERTURBATION.low + hash(m * 7919 + i * 104729) * (PERTURBATION.high - PERTURBATION.low);
    return dischargeAt(p[1] + u);
  }),
);

/**
 * The precipitation ensemble, for the first experiment.
 *
 * The multipliers are the ones Assignment 4 draws - Gaussian, clipped to the same interval - and
 * they are shown acting on the input, which is where they act. Their effect on discharge is not
 * reproducible outside the course environment, since it needs HBV001A and forcing data that are
 * not redistributable, so the discharge band for this experiment is scaled to the ratio the
 * repository measured between the two mean objective-function losses. It is 356 times narrower
 * than the stage band because that is the number the summaries report, not because it looked right.
 */
const RAIN_RATIO = inputExperiment.meanLoss / outputExperiment.meanLoss;

/** Gaussian via Box-Muller on the deterministic hash, then clipped as the code clips. */
function multiplier(seed: number) {
  const u1 = Math.max(1e-6, hash(seed));
  const u2 = hash(seed * 31 + 17);
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.min(1.25, Math.max(0.75, 1 + z * 0.083));
}

export const rainMultipliers = Array.from({ length: MEMBERS }, (_, m) => multiplier(m * 2749 + 13));

export const rainMembers = Array.from({ length: MEMBERS }, (_, m) =>
  event.map((p, i) => {
    const spread = (p[4] - p[3]) * RAIN_RATIO;
    return p[2] + (hash(m * 3571 + i * 6151) - 0.5) * spread;
  }),
);

/** The envelope: min and max across the stage ensemble at each timestep. */
export const envelope = event.map((_, i) => {
  let lo = Infinity;
  let hi = -Infinity;
  for (const member of stageMembers) {
    if (member[i] < lo) lo = member[i];
    if (member[i] > hi) hi = member[i];
  }
  return { lo, hi };
});

/** The same, for the precipitation ensemble. It is thin enough to vanish, which is the point. */
export const rainEnvelope = event.map((_, i) => {
  let lo = Infinity;
  let hi = -Infinity;
  for (const member of rainMembers) {
    if (member[i] < lo) lo = member[i];
    if (member[i] > hi) hi = member[i];
  }
  return { lo, hi };
});

/** Where the peak sits, so the camera and the annotations can point at it. */
export const peakIndex = event.reduce(
  (best, p, i) => (p[2] > event[best][2] ? i : best),
  0,
);

/**
 * The rating curve as its own object, for the state that explains the mechanism.
 *
 * Stage along X, discharge up Y, with the band 25 cm either side. This is the only place in the
 * scene where X is not time.
 */
export const curveRibbon = curve.map((c, i) => ({
  t: i / (curve.length - 1),
  stage: c[0],
  q: c[1],
  lo: c[2],
  hi: c[3],
}));

export const curveMaxQ = Math.max(...curve.map((c) => c[3]));

/** The transition stage, as a fraction along the curve ribbon, for the marker. */
export const transitionAt =
  (ratingCurve.transition.centre - curve[0][0]) / (curve[curve.length - 1][0] - curve[0][0]);

export { verdict };
