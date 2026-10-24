import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * A plane at zero, and which side of it six cities land on.
 *
 * The analysis can only check itself against its own generator, and the whole question is one of
 * sign. On temperature the six recovered means scatter either side of the configured value, which
 * is what recovering a number looks like. On humidity every one of them lands on the same side,
 * which is not - and that asymmetry is the only finding in the project that was not put there by
 * hand.
 *
 * So zero is a physical plane and the cities are objects with a side. A reader should see a wall
 * that nothing crosses, rather than read that nothing crossed it.
 */

export type WeatherKey =
  | "cities"
  | "temperature"
  | "zero"
  | "humidity"
  | "bias"
  | "ranking"
  | "generated";

export const STATES: readonly WorldState<WeatherKey>[] = [
  {
    key: "cities",
    from: 0.0,
    to: 0.12,
    label: "Six cities, ten years",
    caption: "Every figure the analysis reports can be checked against the value its generator was set to.",
  },
  {
    key: "temperature",
    from: 0.12,
    to: 0.28,
    label: "Temperature, recovered less configured",
    caption: "Each city moves to its own miss. None of them further out than 0.09 of a degree.",
  },
  {
    key: "zero",
    from: 0.28,
    to: 0.42,
    label: "Scattered either side of zero",
    caption: "Which is what recovering a configured value is supposed to look like.",
  },
  {
    key: "humidity",
    from: 0.42,
    to: 0.58,
    label: "Then the same test on humidity",
    caption: "A second row of six, on the same zero plane, measured the same way.",
  },
  {
    key: "bias",
    from: 0.58,
    to: 0.74,
    label: "Every one of them on one side",
    caption: "Between 2.20 and 2.53 points high. Six out of six is a bias, not noise.",
  },
  {
    key: "ranking",
    from: 0.74,
    to: 0.88,
    label: "The ordering does survive",
    caption: "Rank the cities by configured seasonal swing and by recovered spread, and nothing crosses.",
  },
  {
    key: "generated",
    from: 0.88,
    to: 1.0,
    label: "On 21,900 generated records",
    caption: "Which is what this can establish: that the analysis reads its own input correctly.",
  },
];

export const { at, active } = choreograph(STATES);

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one slides along the zero plane and sights down it. A plane viewed
 * face-on is a rectangle; viewed along its own surface it is an edge, and an edge is what makes
 * "all of them on one side" something you can see at a glance.
 */
export const SHOTS: Record<
  WeatherKey,
  { height: number; distance: number; swing: number; look: number }
> = {
  cities: { height: 1.6, distance: 9.4, swing: 0.0, look: 0.0 },
  temperature: { height: 1.4, distance: 8.6, swing: 0.4, look: 0.6 },
  zero: { height: 1.0, distance: 7.6, swing: 3.4, look: 0.4 },
  humidity: { height: 2.2, distance: 9.0, swing: 2.2, look: -0.4 },
  bias: { height: 1.2, distance: 7.8, swing: 4.0, look: -0.6 },
  ranking: { height: 4.0, distance: 9.6, swing: 0.0, look: -1.6 },
  generated: { height: 5.0, distance: 11.6, swing: 0.0, look: -0.4 },
};
