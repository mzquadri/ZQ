import { bias, events, generator, scores } from "@/content/flood-chapter";

/**
 * The layout of the flood world.
 *
 * Nash-Sutcliffe efficiency as height, one column per method, and a ceiling the columns stand
 * under. The ceiling is not a drawn convention: the generator adds independent noise every day
 * that nothing can predict, so 0.9691 is the best any method could score on this series, and a
 * column that reached it would be reporting a bug.
 *
 * Every number comes from the repository's pinned `results/benchmark.json` by way of
 * `@/content/flood-chapter`. Nothing here describes a real river; the catchment is generated and
 * the world says so in its last beat as the repository says it in its second paragraph.
 */

/** The window of NSE the world draws. Below 0.6 there is nothing but the train-mean baseline. */
export const SCORE_FLOOR = 0.6;
/** Drawn height for the whole window, floor to ceiling. */
export const SCORE_HEIGHT = 7;
export const COLUMN_GAP = 2.3;
export const COLUMN_SIZE = 1.3;

export const py = (score: number) =>
  ((Math.max(score, SCORE_FLOOR) - SCORE_FLOOR) / (1 - SCORE_FLOOR)) * SCORE_HEIGHT;

export interface Column {
  readonly key: string;
  readonly label: string;
  readonly score: number;
  readonly x: number;
  /** True for the two the project's finding is a comparison between. */
  readonly compared: boolean;
  /** True where the score is below the window and is drawn as reaching the floor. */
  readonly offScale: boolean;
}

const ORDER = [
  { key: "lstm", label: "2-layer LSTM", score: scores.lstm, compared: true },
  { key: "calendar", label: "calendar-day table", score: scores.calendar, compared: true },
  { key: "persistence", label: "yesterday's value", score: scores.persistence, compared: false },
  { key: "linear", label: "linear regression", score: scores.linear, compared: false },
  { key: "trainMean", label: "the training mean", score: scores.trainMean, compared: false },
] as const;

export const COLUMNS: readonly Column[] = ORDER.map((entry, i) => ({
  ...entry,
  x: (i - (ORDER.length - 1) / 2) * COLUMN_GAP,
  offScale: entry.score < SCORE_FLOOR,
}));

/** The ceiling, as a height and as a slab wide enough to cover every column. */
export const CEILING = {
  y: py(scores.ceiling),
  width: ORDER.length * COLUMN_GAP + 1.2,
} as const;

/** The two the finding compares, and the height between them. */
export const GAP = {
  from: py(scores.calendar),
  to: py(scores.lstm),
  x: COLUMNS[0].x,
} as const;

/**
 * The generator's own variance shares, as three slabs stacked to the ceiling.
 *
 * The noise share is the one that matters: it is the part of the signal that nothing can recover,
 * and its size is why the ceiling sits where it does rather than at one.
 */
export const SHARES = [
  { key: "seasonal", label: "seasonal", share: generator.seasonalShare },
  { key: "rain", label: "rain", share: generator.rainShare },
  { key: "noise", label: "unpredictable noise", share: generator.noiseShare },
] as const;

/**
 * The bias on either side of the event threshold, as two bars from a common zero.
 *
 * Drawn on its own scale, in cubic metres a second rather than in NSE, because it is a different
 * quantity. The two bars share that scale with each other, which is the only comparison being
 * made: the model runs slightly high on ordinary days and well low on the days that matter.
 */
export const BIAS = {
  below: bias.belowThreshold,
  above: bias.aboveThreshold,
  /** Drawn units per cubic metre a second, set by the larger of the two. */
  scale: 1.6 / Math.max(Math.abs(bias.belowThreshold), Math.abs(bias.aboveThreshold)),
  threshold: events.thresholdM3s,
} as const;
