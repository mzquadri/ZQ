import { choreograph, type WorldState } from "@/components/worlds/choreography";

import {
  blockMonths,
  bootstrapDraws,
  dataset,
  marginSurvives,
  seriesTotal,
  testMonths,
  windows,
} from "@/content/munich-chapter";

import { RUNS } from "./geometry";

/**
 * One wall at zero, and two intervals: one clear of it, one impaled on it.
 *
 * The published window reports a 23.4 per cent improvement over a seasonal-naive baseline, with a
 * bootstrap interval that stays positive. Running the identical protocol three years earlier, on
 * ordinary years rather than on 2021 and 2022, the margin is negative and its interval straddles
 * zero. The headline does not survive the move, and the repository publishes both runs so that
 * it can be seen not to.
 *
 * The intervals drawn are the moving-block ones. The repository runs independent draws too and
 * says which to believe, because assuming monthly accident counts carry no memory makes the
 * interval too narrow - and the narrower pair would have made the published margin look better
 * than its own author claims it is.
 */

export type MunichKey =
  | "window"
  | "interval"
  | "series"
  | "ordinary"
  | "crosses"
  | "count"
  | "survives";

const [published, ordinary] = windows;

export const STATES: readonly WorldState<MunichKey>[] = [
  {
    key: "window",
    from: 0.0,
    to: 0.12,
    label: `${(published.margin * 100).toFixed(1)}% better than seasonal naive`,
    caption: `On ${published.testYears}, the window the project published.`,
  },
  {
    key: "interval",
    from: 0.12,
    to: 0.28,
    label: "And the interval clears zero",
    caption: `${bootstrapDraws.toLocaleString("en-GB")} draws, ${blockMonths}-month blocks. Nothing in it is a loss.`,
  },
  {
    key: "series",
    from: 0.28,
    to: 0.42,
    label: `It beats the baseline on ${published.seriesWon} of ${seriesTotal}`,
    caption: "Every series in the set, over the same twenty-four held-out months.",
  },
  {
    key: "ordinary",
    from: 0.42,
    to: 0.58,
    label: "Then the same protocol, three years earlier",
    caption: `${ordinary.testYears}. Nothing changes but the window, and the margin lands on the other side of zero.`,
  },
  {
    key: "crosses",
    from: 0.58,
    to: 0.72,
    label: "Its interval straddles the wall",
    caption: `From ${ordinary.low.toFixed(3)} to ${ordinary.high.toFixed(3)}. A margin an interval contains zero in is not a margin.`,
  },
  {
    key: "count",
    from: 0.72,
    to: 0.86,
    label: `And it beats the baseline on ${ordinary.seriesWon} of ${seriesTotal}`,
    caption: "The same count, on the same seven series, in a period with no pandemic in it.",
  },
  {
    key: "survives",
    from: 0.86,
    to: 1.0,
    label: marginSurvives ? "The margin survives" : "So the margin does not survive",
    caption: `${dataset.monthlyObservations.toLocaleString("en-GB")} monthly observations, ${dataset.firstYear} to ${dataset.lastYear}, from the city's open data portal.`,
  },
];

export const { at, active } = choreograph(STATES);

/* A type alias, not an interface: `blendShots` blends every numeric field, and only an alias
 * carries the implicit index signature that lets it. */
export type Shot = {
  readonly height: number;
  readonly distance: number;
  /** Sideways offset from `target`, not an absolute x. */
  readonly swing: number;
  readonly look: number;
  readonly target: number;
  readonly aimY: number;
};

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one keeps the wall in frame and moves around it. The published interval
 * is shot from a side where its clearance is obvious, and the ordinary one from a side where the
 * wall passes through it - the same object from two positions, which is the project's method as
 * much as its finding.
 */
export const SHOTS: Record<MunichKey, Shot> = {
  window: { height: 1.0, distance: 19.0, swing: 0.0, look: RUNS[0].z, target: 0, aimY: 0.2 },
  interval: { height: 0.6, distance: 17.0, swing: 2.0, look: RUNS[0].z * 0.6, target: 0, aimY: 0.0 },
  series: { height: 2.6, distance: 16.0, swing: 2.6, look: 0.0, target: 0, aimY: 0.4 },
  ordinary: { height: 0.8, distance: 18.0, swing: -1.6, look: RUNS[1].z * 0.6, target: 0, aimY: 0.0 },
  /* Low and oblique, where a wall through a bar reads as a wall through a bar. */
  crosses: { height: -0.6, distance: 12.0, swing: -3.2, look: RUNS[1].z * 0.5, target: 0, aimY: -0.2 },
  count: { height: 2.8, distance: 16.0, swing: -2.6, look: 0.0, target: 0, aimY: 0.4 },
  survives: { height: 3.6, distance: 22.0, swing: 0.0, look: 0.0, target: 0, aimY: 0.2 },
};

/** Held-out months, quoted where the world needs it. */
export const TEST_MONTHS = testMonths;

/**
 * How far right of centre the subject is aimed, as a share of however wide the frame is.
 *
 * The caption sits behind a scrim in the stage's own colour, so anything drawn in the lower left
 * is dimmed without looking dimmed.
 */
export const PLATE_BIAS = 0.21;
