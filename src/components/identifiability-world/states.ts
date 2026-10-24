import { choreograph, type WorldState } from "@/components/worlds/choreography";

import { activations, figure } from "@/content/identifiability-chapter";

import { NET_GAP, SPAN } from "./geometry";

/**
 * Same function, different weights.
 *
 * The repository publishes no measurement and says so: `experiments/` and `results/` carry no
 * versioned configuration, trained model or numerical finding. So this world animates what the
 * code does rather than what it found - it builds a second network from the first by relabelling
 * hidden units and flipping signs in matched pairs, checks that the two agree numerically on
 * sampled inputs, and checks that an unrelated network put through the same comparison does not.
 *
 * Three networks at three depths. Two of them land on the same output and one does not, which is
 * what makes the check a check rather than a demonstration.
 */

export type IdentKey =
  | "network"
  | "second"
  | "permute"
  | "sign"
  | "agree"
  | "unrelated"
  | "limits";

export const STATES: readonly WorldState<IdentKey>[] = [
  {
    key: "network",
    from: 0.0,
    to: 0.12,
    label: "One network",
    caption: `One input, ${figure.hidden} hidden units, one output. A small fixed layout, not a trained model.`,
  },
  {
    key: "second",
    from: 0.12,
    to: 0.26,
    label: "And a second built from it",
    caption: "Same architecture, same activation, constructed rather than trained.",
  },
  {
    key: "permute",
    from: 0.26,
    to: 0.42,
    label: "Relabel the hidden units",
    caption: "Which unit is called which is a naming decision. The function does not depend on it.",
  },
  {
    key: "sign",
    from: 0.42,
    to: 0.56,
    label: "Then flip signs in matched pairs",
    caption: "A sign flipped on the way in and again on the way out cancels, for an odd activation.",
  },
  {
    key: "agree",
    from: 0.56,
    to: 0.72,
    label: "The two outputs coincide",
    caption: "Checked numerically on sampled inputs, and the parameters align under the same relabelling.",
  },
  {
    key: "unrelated",
    from: 0.72,
    to: 0.86,
    label: "An unrelated network does not",
    caption: "Put through the same comparison it fails it, which is what makes the check worth running.",
  },
  {
    key: "limits",
    from: 0.86,
    to: 1.0,
    label: "A prototype, not a theorem",
    caption: `Finite and numerical on sampled inputs, for ${activations.join(", ")}. The formal conditions live in the cited papers.`,
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

const MIDDLE = (SPAN.low + SPAN.high) / 2;

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one works across the gap between the networks. Two networks seen from in
 * front are two diagrams; seen from the side they are two objects at two depths with one output
 * axis running between them, and "these two land on the same point" becomes a thing about space.
 */
export const SHOTS: Record<IdentKey, Shot> = {
  network: { height: 1.0, distance: 17.0, swing: 0.0, look: NET_GAP, target: 0, aimY: MIDDLE },
  second: { height: 2.2, distance: 19.0, swing: 2.0, look: 1.2, target: 0, aimY: MIDDLE },
  permute: { height: 4.5, distance: 18.0, swing: 0.0, look: 1.2, target: 0, aimY: MIDDLE },
  sign: { height: 1.4, distance: 14.0, swing: 4.5, look: 1.2, target: -1.0, aimY: MIDDLE },
  /* Sighted down the output axis, where two marks coinciding is the only thing to see. */
  agree: { height: 0.8, distance: 11.0, swing: 6.5, look: 0.6, target: 4.0, aimY: 0.2 },
  unrelated: { height: 1.6, distance: 13.0, swing: 7.0, look: -0.4, target: 3.4, aimY: 0.4 },
  limits: { height: 5.0, distance: 22.0, swing: -2.0, look: 0.0, target: 0, aimY: MIDDLE },
};

/**
 * How far right of centre the subject is aimed, as a share of however wide the frame is.
 *
 * The caption sits behind a scrim in the stage's own colour, so anything drawn in the lower left
 * is dimmed without looking dimmed.
 */
export const PLATE_BIAS = 0.2;
