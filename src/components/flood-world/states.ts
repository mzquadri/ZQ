import { choreograph, type WorldState } from "@/components/worlds/choreography";

import { events, gapOverCalendar, generator, model, scores } from "@/content/flood-chapter";

import { CEILING, COLUMNS, GAP, SCORE_HEIGHT } from "./geometry";

/**
 * A ceiling, and how close a table of 365 numbers gets to it.
 *
 * The generator adds independent noise every day. Nothing can predict it, so 0.9691 is the best
 * score available on this series and the ceiling is a physical thing in this world rather than a
 * dashed line on a chart. What the sequence is for is the distance between two columns standing
 * under it: a 208,513-parameter network at 0.9213 and a lookup table of mean discharge per
 * calendar day, using no weather input at all, at 0.9025.
 *
 * The catchment is generated. The repository says so in its second paragraph and this world says
 * so in its last beat, before and after any score.
 */

export type FloodKey =
  | "generated"
  | "ceiling"
  | "network"
  | "calendar"
  | "gap"
  | "events"
  | "limits";

export const STATES: readonly WorldState<FloodKey>[] = [
  {
    key: "generated",
    from: 0.0,
    to: 0.14,
    label: `${generator.years} years, generated`,
    caption: "Seasonal shape, rain response and daily noise, in the shares the generator mixes them.",
  },
  {
    key: "ceiling",
    from: 0.14,
    to: 0.28,
    label: `Which puts a ceiling at ${scores.ceiling}`,
    caption: "The noise term is independent day to day. No method can recover it, so none can score above this.",
  },
  {
    key: "network",
    from: 0.28,
    to: 0.42,
    label: `The network reaches ${scores.lstm}`,
    caption: `${model.architecture}, ${model.parameters.toLocaleString("en-GB")} parameters, best at epoch ${model.bestEpoch}.`,
  },
  {
    key: "calendar",
    from: 0.42,
    to: 0.58,
    label: `A table of 365 numbers reaches ${scores.calendar}`,
    caption: "Mean discharge per calendar day. It uses no weather input and has no parameters to fit.",
  },
  {
    key: "gap",
    from: 0.58,
    to: 0.72,
    label: `The network buys ${gapOverCalendar}`,
    caption: "Which is what the architecture, the training run and the parameter count are worth on this series.",
  },
  {
    key: "events",
    from: 0.72,
    to: 0.86,
    label: "And on the days that matter it runs low",
    caption: `Above the ${events.thresholdM3s} threshold the model under-predicts, where below it, it does not.`,
  },
  {
    key: "limits",
    from: 0.86,
    to: 1.0,
    label: "None of this is a river",
    caption: "There is no gauge and no site. Every number describes recovering a signal the repository generated.",
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

const WHOLE = 0;
const COMPARED = (COLUMNS[0].x + COLUMNS[1].x) / 2;
const MIDDLE = SCORE_HEIGHT / 2;
/** Halfway up the two column tops the finding compares, so the close shot holds both. */
const TOPS = (GAP.from + GAP.to) / 2;

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one works from under the ceiling. A ceiling seen from above is a floor,
 * so every shot but the first keeps the eye below it, which is the position the finding is told
 * from - two columns reaching for the same surface and neither one getting there.
 */
export const SHOTS: Record<FloodKey, Shot> = {
  generated: { height: 0.6, distance: 16.0, swing: 0.0, look: 0.0, target: WHOLE, aimY: MIDDLE },
  ceiling: { height: -1.4, distance: 20.0, swing: 2.4, look: 0.0, target: WHOLE, aimY: CEILING.y - 1.2 },
  network: { height: -0.6, distance: 20.0, swing: 3.0, look: 0.0, target: WHOLE, aimY: MIDDLE },
  calendar: { height: -0.4, distance: 18.0, swing: 2.2, look: 0.2, target: COMPARED, aimY: MIDDLE + 0.4 },
  /* Close on the two columns the finding is a comparison between, from below their tops. */
  gap: { height: -1.0, distance: 9.0, swing: 1.2, look: 0.2, target: COMPARED, aimY: TOPS },
  events: { height: 0.4, distance: 9.5, swing: -2.0, look: -0.4, target: WHOLE, aimY: -1.2 },
  limits: { height: 1.2, distance: 24.0, swing: 0.0, look: 0.0, target: WHOLE, aimY: MIDDLE },
};

/**
 * How far right of centre the subject is aimed, as a share of however wide the frame is.
 *
 * The caption sits behind a scrim in the stage's own colour, so anything drawn in the lower left
 * is dimmed without looking dimmed.
 */
export const PLATE_BIAS = 0.2;
