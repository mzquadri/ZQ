import { choreograph, type WorldState } from "@/components/worlds/choreography";

import {
  missedByTheCount,
  model,
  resolvedCount,
  totalCount,
} from "@/content/translation-chapter";

import { BEAM, WALL } from "./geometry";

/**
 * A translation, not a race.
 *
 * Two frameworks facing each other, five differences spanning the gap, and a beam laid across it
 * that never moves. Four of the differences were corrected for. The fifth - two random number
 * streams, two kernel reduction orders - cannot be, and the project accepts it as the floor on
 * any comparison of this kind rather than pretending it away.
 *
 * There is no Keras accuracy in this world, because there is none in the repository: `results/`
 * holds a `.gitkeep` and the README records the figure as pending. The closing beat draws that
 * absence as an absence.
 */

export type TranslationKey =
  | "two"
  | "count"
  | "differences"
  | "resolved"
  | "floor"
  | "missed"
  | "pending";

export const STATES: readonly WorldState<TranslationKey>[] = [
  {
    key: "two",
    from: 0.0,
    to: 0.12,
    label: "Two frameworks, one architecture",
    caption: "The same network written twice, to find out what writing it twice actually costs.",
  },
  {
    key: "count",
    from: 0.12,
    to: 0.26,
    label: `${model.parameters.toLocaleString("en-GB")} trainable parameters`,
    caption: "Asserted on every push, with no data and no fit. A check that needs neither to fail.",
  },
  {
    key: "differences",
    from: 0.26,
    to: 0.44,
    label: `${totalCount} places the frameworks disagree`,
    caption: "Weight decay, the schedule, channel dropout, the augmentation draws, and the kernels.",
  },
  {
    key: "resolved",
    from: 0.44,
    to: 0.6,
    label: `${resolvedCount} of them close`,
    caption: "Halve the decay, reimplement the schedule per batch, match the dropout, match the definitions.",
  },
  {
    key: "floor",
    from: 0.6,
    to: 0.74,
    label: "One of them does not",
    caption: "Reduction orders differ between frameworks and between devices. That is the floor, not a defect.",
  },
  {
    key: "missed",
    from: 0.74,
    to: 0.88,
    label: "And the count is a floor too",
    caption: `${missedByTheCount.what}: dropout carries no weights, so the assertion still passes.`,
  },
  {
    key: "pending",
    from: 0.88,
    to: 1.0,
    label: `PyTorch reaches ${model.pytorchAccuracy}%`,
    caption: "The Keras figure is pending its run. The repository publishes none, so neither does this.",
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

const MIDDLE = WALL.height / 2;

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one stands in the gap. Two walls either side of the eye is the position
 * the project is written from - not comparing two results, but standing between two ways of
 * saying the same thing and counting what differs.
 */
export const SHOTS: Record<TranslationKey, Shot> = {
  two: { height: 0.8, distance: 21.0, swing: 0.0, look: 0.0, target: 0, aimY: MIDDLE },
  count: { height: 1.6, distance: 20.0, swing: 1.5, look: 0.0, target: 0, aimY: BEAM.y - 1.4 },
  differences: { height: 0.4, distance: 21.0, swing: 1.8, look: 0.0, target: 0, aimY: MIDDLE },
  resolved: { height: -0.4, distance: 20.0, swing: 2.2, look: 0.4, target: 0, aimY: MIDDLE - 0.4 },
  floor: { height: -0.8, distance: 19.0, swing: 2.5, look: 0.6, target: 0, aimY: 5.4 },
  /* Low, so the trap passing under the beam and the beam not moving are in one frame. */
  missed: { height: -1.2, distance: 21.0, swing: 1.2, look: 0.0, target: 0, aimY: MIDDLE + 0.8 },
  pending: { height: 1.0, distance: 19.0, swing: -1.6, look: -0.4, target: 0, aimY: 2.4 },
};

/**
 * How far right of centre the subject is aimed, as a share of however wide the frame is.
 *
 * The caption sits behind a scrim in the stage's own colour, so anything drawn in the lower left
 * is dimmed without looking dimmed.
 */
export const PLATE_BIAS = 0.2;
