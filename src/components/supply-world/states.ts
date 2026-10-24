import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * Five segments, four sources, and two lines that land on the same one.
 *
 * The scorecard is a weighted sum of five components, so the composite is drawn as one bar of a
 * hundred points in five segments. Behind it stand the columns each segment is normalised from -
 * and two of the five lines converge on one column, because delivery reliability reads
 * `on_time_rate` and quality reads `1 - on_time_rate`, and inverting a min-max normalisation of
 * one minus a series returns the series.
 *
 * Convergence is the whole finding and it is a thing you can see in depth. The two segments then
 * merge, leaving a scorecard with four distinct signals rather than five.
 */

export type SupplyKey =
  | "composite"
  | "sources"
  | "converge"
  | "merge"
  | "remaining"
  | "classical"
  | "withheld";

export const STATES: readonly WorldState<SupplyKey>[] = [
  {
    key: "composite",
    from: 0.0,
    to: 0.12,
    label: "One score, five weights",
    caption: "Delivery reliability 30, quality 25, cost efficiency 20, lead time 15, flexibility 10.",
  },
  {
    key: "sources",
    from: 0.12,
    to: 0.28,
    label: "Each normalised from a column",
    caption: "Every segment is tied to the field it is computed from, and the tie is drawn.",
  },
  {
    key: "converge",
    from: 0.28,
    to: 0.45,
    label: "Two land on the same column",
    caption: "One reads on-time rate ascending. The other reads late-delivery rate, which is one minus it.",
  },
  {
    key: "merge",
    from: 0.45,
    to: 0.61,
    label: "So they are one signal",
    caption: "Inverting a min-max normalisation of one minus a series returns the series exactly.",
  },
  {
    key: "remaining",
    from: 0.61,
    to: 0.75,
    label: "Four distinct signals, not five",
    caption: "55% of the composite is one measurement under two names. The largest independent term is 20.",
  },
  {
    key: "classical",
    from: 0.75,
    to: 0.89,
    label: "The inventory maths is textbook",
    caption: "Order quantity, safety stock and reorder point, implemented as stated. Not what is in question.",
  },
  {
    key: "withheld",
    from: 0.89,
    to: 1.0,
    label: "And none of it is measured here",
    caption: "No dataset, no processed data, no forecast artefact, no verified business metric.",
  },
];

export const { at, active } = choreograph(STATES);

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one swings around to find the angle where two lines can be seen landing
 * on one column. Convergence read head-on is two lines overlapping; read from the side it is two
 * lines meeting, which is the difference between a diagram and a demonstration.
 */
export const SHOTS: Record<
  SupplyKey,
  { height: number; distance: number; swing: number; look: number }
> = {
  /*
   * Convergence happens in the ground plane - the ties run back in z - so it is read from above,
   * not from the side. The first table swung the camera out to 4.2 and the bar went nearly
   * edge-on, which turned two lines meeting into two lines overlapping. Height does the work that
   * swing was being asked to do, and swing is kept small enough to keep the bar legible.
   */
  composite: { height: 2.0, distance: 9.6, swing: 0.0, look: -0.4 },
  sources: { height: 4.0, distance: 9.4, swing: 0.8, look: -1.4 },
  converge: { height: 5.4, distance: 8.6, swing: 1.4, look: -1.8 },
  merge: { height: 4.8, distance: 8.4, swing: 1.0, look: -1.5 },
  remaining: { height: 2.4, distance: 9.4, swing: 0.3, look: -0.4 },
  classical: { height: 2.8, distance: 10.4, swing: -1.2, look: 0.6 },
  withheld: { height: 5.0, distance: 12.4, swing: 0.0, look: 0.0 },
};
