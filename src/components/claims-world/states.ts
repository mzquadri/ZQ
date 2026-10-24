import { choreograph, type WorldState } from "@/components/worlds/choreography";

import { breakEvenText, costs } from "@/content/claims-chapter";

import { CROSSING, HABIT, VALUE_SPAN } from "./geometry";

/**
 * Two surfaces, and the line they meet along.
 *
 * There is no model here and no dataset. The repository publishes neither and says so, so this
 * world has no result to animate - what it has is an argument that needs nothing measured: four
 * signed values fix two expectations, both expectations are linear in one probability, and two
 * planes meet along one line. That line is the only threshold the matrix justifies.
 *
 * Built as solids because the claim is geometric. A chart with two crossing lines invites the
 * reading that the crossing was found; two surfaces intersecting in space read as what actually
 * happened, which is that the crossing was there as soon as the four numbers were chosen.
 */

export type ClaimsKey =
  | "surfaces"
  | "matrix"
  | "crossing"
  | "habit"
  | "ratio"
  | "stages"
  | "limits";

export const STATES: readonly WorldState<ClaimsKey>[] = [
  {
    key: "surfaces",
    from: 0.0,
    to: 0.12,
    label: "Two actions, one probability",
    caption: "The value of acting on a policy, and the value of leaving it alone, over the chance it claims.",
  },
  {
    key: "matrix",
    from: 0.12,
    to: 0.28,
    label: "Four numbers set both slopes",
    caption: `A missed claim costs ${Math.abs(costs.falseNegative)}. An unnecessary investigation costs ${Math.abs(costs.falsePositive)}.`,
  },
  {
    key: "crossing",
    from: 0.28,
    to: 0.44,
    label: "They meet along one line",
    caption: `At ${breakEvenText.percent}% - solved from the four values, with no data anywhere in it.`,
  },
  {
    key: "habit",
    from: 0.44,
    to: 0.58,
    label: "And the cut everything defaults to",
    caption: "One half, which is where a classifier's threshold sits unless someone moves it.",
  },
  {
    key: "ratio",
    from: 0.58,
    to: 0.72,
    label: "The distance between them",
    caption: `One half is ${breakEvenText.ratio} times the cut this matrix justifies. Everything in between is given away.`,
  },
  {
    key: "stages",
    from: 0.72,
    to: 0.86,
    label: "Rank, calibrate, then cut",
    caption: "Three separate questions. A pipeline that answers them together cannot be told which one it got wrong.",
  },
  {
    key: "limits",
    from: 0.86,
    to: 1.0,
    label: "The matrix is illustrative",
    caption: "No versioned data, trained model or evaluation report is published, so none of this is a measured result.",
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

/** The two ends of the argument, so the camera can hold either without the number being guessed. */
const WHOLE = 0;
const CUTS = (CROSSING.x + HABIT.x) / 2;
const MIDDLE = (VALUE_SPAN.low + VALUE_SPAN.high) / 2;

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one rolls around the line the surfaces meet along. Two planes seen
 * face-on are two lines that cross, which is the chart this is trying not to be; seen from the
 * side they are solids, and the line where they meet is an edge standing in the air. The beat
 * about the justified cut is shot along that edge on purpose.
 */
export const SHOTS: Record<ClaimsKey, Shot> = {
  surfaces: { height: 9.0, distance: 27.0, swing: 0.0, look: 0.0, target: WHOLE, aimY: MIDDLE },
  matrix: { height: 7.5, distance: 27.0, swing: 4.0, look: 0.0, target: WHOLE, aimY: MIDDLE },
  /* Down inside the wedge, where one sheet is above the other on one side and below on the other. */
  crossing: { height: 2.2, distance: 6.0, swing: 0.8, look: 0.4, target: CROSSING.x + 0.8, aimY: -0.3 },
  habit: { height: 6.0, distance: 17.0, swing: 1.6, look: 0.0, target: CUTS, aimY: -1.2 },
  ratio: { height: 10.0, distance: 17.0, swing: 0.0, look: -0.8, target: CUTS, aimY: -1.6 },
  stages: { height: 8.0, distance: 24.0, swing: -4.0, look: 0.0, target: WHOLE, aimY: MIDDLE },
  limits: { height: 11.0, distance: 30.0, swing: 0.0, look: 0.0, target: WHOLE, aimY: MIDDLE },
};

/**
 * How far right of centre the subject is aimed, as a share of however wide the frame is.
 *
 * The caption occupies the lower left of the stage behind a scrim in the stage's own colour, so
 * anything drawn there is dimmed without looking dimmed. A share rather than a number of units,
 * because this world closes in by a factor of two and a fixed offset would not survive it.
 */
export const PLATE_BIAS = 0.21;
