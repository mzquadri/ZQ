import { choreograph, type WorldState } from "@/components/worlds/choreography";

import { CLUSTER, COMPARISON, EVERYTHING } from "./geometry";

/**
 * Five intervals, and a slab that passes through three of them.
 *
 * The repository's table ranks five models by a single split. The same committed artefact also
 * records the cross-validated mean and the fold-to-fold spread, and once those are drawn as
 * intervals, three of the five overlap - so a single value of F1 is consistent with all three and
 * the order the table presents was not established by this run.
 *
 * An overlap is an intersection, and an intersection is a solid. The band is built as one: a slab
 * standing in the range every contender could be sitting in, with their intervals passing through
 * it. A reader should see three bars pierced by one block.
 */

export type WaterKey =
  | "ranked"
  | "crossval"
  | "intervals"
  | "band"
  | "through"
  | "separated"
  | "spread";

export const STATES: readonly WorldState<WaterKey>[] = [
  {
    key: "ranked",
    from: 0.0,
    to: 0.12,
    label: "Ranked on a single split",
    caption: "Five models, five F1 scores, in the order the table publishes them.",
  },
  {
    key: "crossval",
    from: 0.12,
    to: 0.28,
    label: "Re-measured across five folds",
    caption: "Each mark travels from its single-split score to its cross-validated mean.",
  },
  {
    key: "intervals",
    from: 0.28,
    to: 0.44,
    label: "With one standard deviation either side",
    caption: "The spread between folds, which the same artefact records and the table leaves out.",
  },
  {
    key: "band",
    from: 0.44,
    to: 0.6,
    label: "The range consistent with all three",
    caption: "Intersecting the contenders' intervals leaves a band that is not empty.",
  },
  {
    key: "through",
    from: 0.6,
    to: 0.74,
    label: "Three of them pass through it",
    caption: "So one value of F1 is consistent with all three, and this run did not separate them.",
  },
  {
    key: "separated",
    from: 0.74,
    to: 0.88,
    label: "One model it does separate",
    caption: "Logistic regression sits clear of the next by 0.0944, well outside anything shared.",
  },
  {
    key: "spread",
    from: 0.88,
    to: 1.0,
    label: "The spread is wider than the gap",
    caption: "The widest fold-to-fold deviation is 0.0221. The closest gap being ranked on is 0.0084.",
  },
];

export const { at, active } = choreograph(STATES);

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one closes in and then sights along the band. An intersection seen from
 * the front is a rectangle over some bars; seen from its own edge it is a slab with things
 * running through it, and that is the reading the finding needs.
 *
 * `target` is where along the axis the camera is pointed, and it is the reason this world can draw
 * F1 at a scale where a standard deviation is a visible length: the wide beats hold all five
 * models, the middle beats close on the three that overlap, and the beat about the one model the
 * run does separate pulls back far enough to hold that gap and the band in a single frame.
 */
/* A type alias, not an interface: `blendShots` blends every numeric field, and only an alias
 * carries the implicit index signature that lets it. */
export type Shot = {
  readonly height: number;
  readonly distance: number;
  /** Sideways offset from `target`, not an absolute x. */
  readonly swing: number;
  readonly look: number;
  readonly target: number;
  /** Where along the stack the camera is pointed. Aiming below the stack lifts it up the frame,
   * clear of the caption scrim in the lower left. */
  readonly aimY: number;
};

const ALL = EVERYTHING.centre;
const FEW = CLUSTER.centre;
const BARS = COMPARISON.origin + COMPARISON.spread / 2;

export const SHOTS: Record<WaterKey, Shot> = {
  ranked: { height: 0.3, distance: 22.0, swing: 0.0, look: 0.0, target: ALL, aimY: -1.6 },
  crossval: { height: 0.2, distance: 22.0, swing: 0.5, look: 0.0, target: ALL, aimY: -1.6 },
  intervals: { height: 0.0, distance: 22.0, swing: 1.1, look: 0.0, target: ALL, aimY: -1.7 },
  band: { height: -0.5, distance: 12.0, swing: 1.6, look: 0.0, target: FEW, aimY: 0.3 },
  /* Hard oblique: the wall is seen along its own face, which is what makes a bar look pierced. */
  through: { height: -0.9, distance: 11.0, swing: 3.0, look: 0.4, target: FEW, aimY: 0.4 },
  separated: { height: 0.6, distance: 22.0, swing: -1.4, look: 0.0, target: ALL, aimY: -2.2 },
  spread: { height: -0.3, distance: 5.0, swing: 0.0, look: 0.0, target: BARS, aimY: -0.15 },
};

/**
 * How far right of centre the axis is aimed, as a share of however wide the frame currently is.
 *
 * The caption occupies the lower left of the stage and carries a scrim that is the stage's own
 * colour, so it is invisible over empty background and quietly erases anything drawn underneath
 * it - which is exactly what it did to the one model this world is about. The subject is aimed
 * into the clear two thirds instead.
 *
 * A share rather than a number of units, because this world closes in by a factor of six and a
 * fixed offset would slide it off at one end of that or the other.
 */
export const PLATE_BIAS = 0.24;
