/**
 * The exploded sequence.
 *
 * One pass through an engineered object: the whole thing, then its layers, then its parts, then
 * data moving through the parts, then what came out, then where it stops being true, then back
 * together. The subject is a research pipeline rather than a machine, but the grammar is the same
 * one a watch movement or an engine teardown uses.
 *
 * Each state owns a slice of scroll. `at(progress, state)` returns 0 before the slice, 1 after it,
 * and an eased value inside - so a state can be asked "how far through me are you" without any
 * state needing to know about the others. Everything the scene does is a function of those nine
 * numbers, which is what keeps the choreography reversible: scrubbing backwards is not a special
 * case, it is the same expression evaluated at a smaller number.
 */

export type StateKey =
  | "network"
  | "scenario"
  | "features"
  | "model"
  | "prediction"
  | "uncertainty"
  | "calibration"
  | "selective"
  | "limits";

export type ThesisState = {
  key: StateKey;
  /** Scroll slice, as a fraction of the whole track. */
  from: number;
  to: number;
  label: string;
  /** One line. It names what the frame is showing, and never restates the body copy. */
  caption: string;
};

export const STATES: readonly ThesisState[] = [
  {
    key: "network",
    from: 0.0,
    to: 0.1,
    label: "Network",
    caption: "One held-out scenario: a road network of 31,635 segments, drawn here in schematic.",
  },
  {
    key: "scenario",
    from: 0.1,
    to: 0.21,
    label: "Intervention",
    caption: "A capacity reduction is applied to a corridor. Everywhere else the policy input is zero.",
  },
  {
    key: "features",
    from: 0.21,
    to: 0.34,
    label: "Features",
    caption: "Five values per segment lift out of the network, in the order the model receives them.",
  },
  {
    key: "model",
    from: 0.34,
    to: 0.47,
    label: "Model",
    caption: "PointNetTransfGAT separates into its layers. Four attention heads, one value out per segment.",
  },
  {
    key: "prediction",
    from: 0.47,
    to: 0.58,
    label: "Prediction",
    caption: "Predicted change in volume settles onto the network. Most segments do not move at all.",
  },
  {
    key: "uncertainty",
    from: 0.58,
    to: 0.71,
    label: "Uncertainty",
    caption: "Thirty stochastic passes give a spread per segment - and the raw interval is far too narrow.",
  },
  {
    key: "calibration",
    from: 0.71,
    to: 0.82,
    label: "Calibration",
    caption: "One temperature, fitted on twenty scenarios, pulls the reliability curve back toward the diagonal.",
  },
  {
    key: "selective",
    from: 0.82,
    to: 0.93,
    label: "Selective review",
    caption: "Rank by uncertainty, keep the confident half, send the rest to review. The kept half is measurably better.",
  },
  {
    key: "limits",
    from: 0.93,
    to: 1.0,
    label: "Where it stops",
    caption: "One network, one intervention family, one model family. The system closes.",
  },
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Smoothstep. Gentle at both ends so nothing in the scene starts or stops abruptly. */
export const ease = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/** Linear position within a scroll slice, unclamped at the edges by design. */
export function span(progress: number, from: number, to: number) {
  return clamp01((progress - from) / Math.max(1e-6, to - from));
}

/** How far through a named state the scroll currently is. */
export function at(progress: number, key: StateKey) {
  const state = STATES.find((s) => s.key === key);
  if (!state) return 0;
  return ease(span(progress, state.from, state.to));
}

/** The state a reader is currently inside, for the caption and the semantic live region. */
export function activeState(progress: number): ThesisState {
  for (const state of STATES) if (progress < state.to) return state;
  return STATES[STATES.length - 1];
}

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
