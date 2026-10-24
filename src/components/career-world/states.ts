import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * Seven terms with ceilings, and two things that go straight through them.
 *
 * A weighted sum gives every component a hard upper bound: a term worth thirteen points can move
 * the total by thirteen points and no more, however badly it is failed. That bound is the subject,
 * so it is drawn as a physical ceiling over each term - and the two flat penalties the engine adds
 * are drawn passing through the ceilings of the terms they belong to, because that is exactly what
 * they do and it is the only reason they exist.
 *
 * The scene is deliberately literal. "A penalty larger than its own weight" is a sentence that
 * reads as a technicality and a picture that reads as a violation.
 */

export type CareerKey =
  | "weights"
  | "ceilings"
  | "penalties"
  | "through"
  | "ladder"
  | "rejects"
  | "reach";

export const STATES: readonly WorldState<CareerKey>[] = [
  {
    key: "weights",
    from: 0.0,
    to: 0.13,
    label: "Seven components, a hundred points",
    caption: "Technical 26, location 20, freshness 16, experience 15, language 13, domain 6, education 4.",
  },
  {
    key: "ceilings",
    from: 0.13,
    to: 0.27,
    label: "Each one has a ceiling",
    caption: "A weighted term can move the score by its own weight and not one point more.",
  },
  {
    key: "penalties",
    from: 0.27,
    to: 0.41,
    label: "Two carry a flat penalty",
    caption: "Location and language. Not a lower score - a deduction applied on top of one.",
  },
  {
    key: "through",
    from: 0.41,
    to: 0.56,
    label: "And both go through the ceiling",
    caption: "26 against a term worth 20. 30 against a term worth 13. That is the whole finding.",
  },
  {
    key: "ladder",
    from: 0.56,
    to: 0.69,
    label: "Why the top of the ladder is the point",
    caption: "German at B2 costs 8, C1 and above 22, native 30. Only the last one is unavailable rather than hard.",
  },
  {
    key: "rejects",
    from: 0.69,
    to: 0.84,
    label: "Four things discard a posting",
    caption: "Each answers whether the opportunity exists, never whether the candidate is good enough.",
  },
  {
    key: "reach",
    from: 0.84,
    to: 1.0,
    label: "What it actually reaches",
    caption: "Nine adapters, 87 employers - and 102 of 279 candidates that never answered their own endpoint.",
  },
];

export const { at, active } = choreograph(STATES);

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one stays low and square to the bars for as long as the argument is about
 * height, because a ceiling being broken is only legible from the side. It lifts once, at the end,
 * for the only beat that is about breadth rather than height.
 */
export const SHOTS: Record<
  CareerKey,
  { height: number; distance: number; swing: number; tilt: number }
> = {
  /*
   * Seven bars span 6.74 units and the tallest penalty stands 3.6 above the floor, so nothing may
   * come closer than about eight and a half without losing a term off one side. The first table
   * put the two beats that are *about* the overrun at 7.6 and 6.8 with a lateral swing on top,
   * and cropped the largest term - technical, at 26 - out of the frame exactly when the reader
   * needed it for comparison.
   */
  weights: { height: 1.1, distance: 9.6, swing: 0.0, tilt: 0.03 },
  ceilings: { height: 1.4, distance: 9.0, swing: 0.0, tilt: 0.05 },
  penalties: { height: 1.2, distance: 8.8, swing: -0.6, tilt: 0.04 },
  through: { height: 1.3, distance: 8.6, swing: -0.9, tilt: 0.04 },
  ladder: { height: 1.5, distance: 8.2, swing: 1.4, tilt: 0.06 },
  rejects: { height: 2.0, distance: 8.6, swing: 0.0, tilt: 0.12 },
  reach: { height: 4.2, distance: 11.4, swing: 0.0, tilt: 0.34 },
};
