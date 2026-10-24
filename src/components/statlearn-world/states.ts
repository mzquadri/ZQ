import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * Sixty tiles, and the one that decided a result.
 *
 * The held-out set is sixty points, so every accuracy in the report is a count out of sixty and
 * the finest distinction the coursework can make is one tile. The project's most interesting
 * result turns on exactly that distinction - a random search beat Bayesian optimisation by a
 * single test point - so the world is built so the reader can see the tile.
 *
 * Nothing here is a percentage. The runs light tiles, the baseline lights tiles, and the margin is
 * a tile lifting out of the grid. A number that cannot be resolved more finely than this should
 * not be drawn more finely than this.
 */

export type StatlearnKey =
  | "points"
  | "baseline"
  | "default"
  | "sweep"
  | "margin"
  | "checks"
  | "ledger";

export const STATES: readonly WorldState<StatlearnKey>[] = [
  {
    key: "points",
    from: 0.0,
    to: 0.12,
    label: "Sixty held-out points",
    caption: "Every accuracy in the report is a count out of these. One tile is the finest distinction available.",
  },
  {
    key: "baseline",
    from: 0.12,
    to: 0.27,
    label: "Thirty-two, by guessing",
    caption: "The majority class, with no model at all. This is the line anything has to clear.",
  },
  {
    key: "default",
    from: 0.27,
    to: 0.42,
    label: "The default settings get twenty-three",
    caption: "Nine fewer than guessing. An untouched configuration loses to having no model.",
  },
  {
    key: "sweep",
    from: 0.42,
    to: 0.58,
    label: "Forty-seven, after the sweep",
    caption: "The learning rate was wrong by four orders of magnitude - 0.001 against 10.",
  },
  {
    key: "margin",
    from: 0.58,
    to: 0.73,
    label: "And the search that won, won by one",
    caption: "Random search 48, Bayesian optimisation 47. One tile, which is all this axis can resolve.",
  },
  {
    key: "checks",
    from: 0.73,
    to: 0.87,
    label: "The gradients, checked twice",
    caption: "Against autograd at 2.8e-17, against central differences at 5.1e-9. Eight orders apart, for a reason.",
  },
  {
    key: "ledger",
    from: 0.87,
    to: 1.0,
    label: "Every number traced to its cell",
    caption: "126 reported values across 11 problems, none of them transcribed by hand.",
  },
];

export const { at, active } = choreograph(STATES);

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one is nearly overhead and stays there. A grid of counted things is read
 * from above, and the single lifted tile at the end is the only moment it drops low enough for
 * height to be visible at all - which is the point of dropping.
 */
export const SHOTS: Record<
  StatlearnKey,
  { height: number; distance: number; swing: number; look: number }
> = {
  points: { height: 7.2, distance: 3.0, swing: 0.0, look: 0.0 },
  baseline: { height: 6.6, distance: 3.6, swing: 0.0, look: 0.0 },
  default: { height: 6.2, distance: 4.0, swing: 0.0, look: 0.0 },
  sweep: { height: 6.0, distance: 4.4, swing: 0.0, look: 0.0 },
  margin: { height: 2.6, distance: 6.4, swing: 1.1, look: 0.2 },
  checks: { height: 4.4, distance: 7.0, swing: -1.6, look: -0.6 },
  ledger: { height: 8.4, distance: 5.0, swing: 0.0, look: 0.0 },
};
