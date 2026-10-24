/**
 * LSTM discharge forecasting on a synthetic catchment.
 *
 * Read out of the repository's pinned reference run, `results/benchmark.json`,
 * rather than its prose.
 *
 * The catchment is generated, not observed. The repository says so in its
 * second paragraph and repeats it: there is no gauge, no site and no observed
 * data, and every number describes how well a model recovers a signal that
 * repository generated. Nothing here is a claim about a real river, and the
 * page carries that before it carries any score.
 */

export const repository = "https://github.com/mzquadri/Deep-Learning-Flood-Prediction-LSTM";

export const generator = {
  days: 7300,
  years: 20,
  seed: 42,
  /** Shares of the target's variance, from the generator's own components. */
  seasonalShare: 0.7724,
  rainShare: 0.0552,
  noiseShare: 0.0309,
} as const;

/**
 * The ceiling, and the two numbers that matter against it.
 *
 * The generator adds independent noise every day that nothing can predict, so
 * no method can exceed `ceiling`. `calendar` is a lookup table of mean
 * discharge per calendar day, which uses no weather input at all.
 */
export const scores = {
  ceiling: 0.9691,
  lstm: 0.9213,
  calendar: 0.9025,
  persistence: 0.9016,
  linear: 0.701,
  trainMean: -0.0012,
} as const;

/** What the network adds over a table of 365 numbers. */
export const gapOverCalendar = Math.round((scores.lstm - scores.calendar) * 10000) / 10000;

export const model = {
  architecture: "2-layer LSTM, 128 hidden, dense head",
  parameters: 208513,
  window: 30,
  bestEpoch: 41,
} as const;

export const split = {
  train: 5110,
  validation: 1095,
  test: 1095,
  scoredRows: 1065,
  strategy: "chronological",
} as const;

/** Detecting the top five per cent of days, at the threshold the run used. */
export const events = {
  thresholdM3s: 37.214,
  lstm: { precision: 0.8043, recall: 0.6852, f1: 0.74 },
  persistence: { precision: 0.741, recall: 0.741, f1: 0.741 },
  total: 54,
} as const;

/** Where the model is biased, which is the half that matters. */
export const bias = {
  belowThreshold: 0.51,
  aboveThreshold: -2.74,
} as const;

/**
 * A defect in the generator, found and fixed before any result here was taken.
 * Kept because the repository keeps it.
 */
export const generatorDefect = {
  floorFractionBefore: 0.82,
  floorFractionAfter: 0.1259,
  rainShareBefore: 0.017,
  rainShareAfter: 0.0552,
} as const;

/** Where a score sits on a 0 to 1 axis, as a percentage. */
export function axisPercent(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 1000) / 10;
}
