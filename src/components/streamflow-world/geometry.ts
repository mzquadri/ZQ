import {
  models,
  monthly,
  overview,
  overviewMax,
  split,
  testWindow,
  zoom,
} from "@/content/streamflow-world";

/**
 * The bench the three models are laid out on.
 *
 * Time runs along X for everything, which is the one axis all three rows share. Depth is not
 * uncertainty here - it is the leaderboard: one lane per model, so the three tasks can be put
 * side by side at their real resolutions and the mismatch becomes something you can see rather
 * than something you have to be told.
 *
 * No point in this module is invented. Every series comes from the generated content module,
 * which the generator refuses to write unless it has reproduced the repository's reference run.
 */

export const SPAN_X = 9.4;
export const SPAN_Y = 2.9;

/** One shared vertical scale, so a monthly mean and a daily value are comparable by eye. */
export const Q_SCALE = overviewMax;

export const x = (t: number) => (t - 0.5) * SPAN_X;
export const y = (q: number) => (q / Q_SCALE) * SPAN_Y;

/** Where the chronological cut falls along the timeline. */
export const SPLIT_X = x(split.frac);

/** Lane depth per model. The leaderboard, given a third dimension. */
export const LANES = {
  naive: -2.1,
  sarimax: 0,
  xgboost: 2.1,
} as const;

/** The whole series as points. */
export const series = overview.map((p) => ({ t: p[0], q: p[1] }));

/**
 * The test window, mapped onto the part of the timeline it actually occupies.
 *
 * The two test years are the last 13% of the record, so they are drawn there rather than
 * stretched across the frame - the reader should be able to see how little of the series the
 * evaluation covers.
 */
const testFrom = split.frac;
export const testAt = (t: number) => testFrom + t * (1 - testFrom);

export const test = testWindow.map((p) => ({
  t: testAt(p[0]),
  actual: p[1],
  xgboost: p[2],
  naive: p[3],
}));

/** Monthly means: SARIMAX's actual target, at its actual resolution. */
export const monthlyPoints = monthly.map((p) => ({ t: testAt(p[0]), q: p[1] }));

/**
 * The repository's own zoomed figure: the first 120 test days.
 *
 * Given its own vertical scale rather than the shared one. On the global axis these 120 days
 * occupy a sliver near the top of the frame, and the whole reason to show them is that the two
 * lines are close but not identical - which is invisible unless the range is expanded. The
 * readout carries the units, so the local scale costs nothing in honesty.
 */
const zoomLo = Math.min(...zoom.map((p) => Math.min(p[1], p[2])));
const zoomHi = Math.max(...zoom.map((p) => Math.max(p[1], p[2])));
export const zoomY = (q: number) =>
  0.45 + ((q - zoomLo) / (zoomHi - zoomLo)) * (SPAN_Y * 0.78);

export const zoomPoints = zoom.map((p) => ({
  t: p[0],
  actual: p[1],
  xgboost: p[2],
  naive: p[3],
}));

/**
 * The leaderboard bars.
 *
 * R2 is unbounded below and the naive baseline sits at -11.69, so a bar chart drawn on a linear
 * R2 axis is one enormous downward spike and two stubs. The bars are drawn on a squashed scale
 * that keeps the sign and the ordering honest while leaving the two positive rows readable, and
 * the readout carries the exact numbers - which is where a number belongs anyway.
 */
const squash = (r2: number) => (r2 >= 0 ? r2 : -Math.log10(1 - r2) / 2.2);

export const bars = models.map((m, i) => ({
  key: m.key,
  label: m.label,
  r2: m.r2,
  height: squash(m.r2),
  /* Ordered as the table orders them: baseline, classical, gradient boosting. */
  x: (i - (models.length - 1) / 2) * 2.1,
}));

export const barMax = Math.max(...bars.map((b) => Math.abs(b.height)));

/** Where each model's error actually lives, for the comparison state. */
export const scoredCounts = models.map((m) => ({
  key: m.key,
  label: m.label,
  scoredOn: m.scoredOn,
}));
