import { choreograph, type WorldState } from "@/components/worlds/choreography";

import { axis, coverage, euCarShare, rail, source, spread } from "@/content/modal-split-chapter";

import { AXIS_HEIGHT, LANES, OVER_TIME, RATIO } from "./geometry";

/**
 * What twenty-four years moved, against what a border moves.
 *
 * Both drawn on one axis at one scale, because the comparison is the finding and a comparison
 * made at two scales is not one. The EU car share went from 82.0 in 2000 to 82.5 in 2024. In 2024
 * alone the countries reporting ran from 66.9 to 97.8. Half a point against thirty-one.
 *
 * Every figure is computed by the report from its pinned API response rather than typed into its
 * prose, which is the property that repository is built around - so the closing beat is the
 * SHA-256 and the coverage rule rather than a conclusion.
 */

export type ModalKey =
  | "axis"
  | "eu"
  | "moved"
  | "spread"
  | "germany"
  | "rail"
  | "provenance";

export const STATES: readonly WorldState<ModalKey>[] = [
  {
    key: "axis",
    from: 0.0,
    to: 0.12,
    label: `Car share, ${axis.min} to ${axis.max} per cent`,
    caption: "The axis starts at 60 because every observed value is above it. A truncated axis is a decision.",
  },
  {
    key: "eu",
    from: 0.12,
    to: 0.26,
    label: `The EU aggregate in ${euCarShare.fromYear}: ${euCarShare.from}%`,
    caption: "Inland passenger kilometres travelled by car, across the twenty-seven.",
  },
  {
    key: "moved",
    from: 0.26,
    to: 0.42,
    label: `${euCarShare.years} years later: ${euCarShare.to}%`,
    caption: `A change of ${euCarShare.changePoints} points, drawn at the scale it happened at.`,
  },
  {
    key: "spread",
    from: 0.42,
    to: 0.58,
    label: `In ${coverage.comparisonYear} alone, ${spread.points} points`,
    caption: `From ${spread.lowest.country} at ${spread.lowest.share}% to ${spread.highest.country} at ${spread.highest.share}%.`,
  },
  {
    key: "germany",
    from: 0.58,
    to: 0.72,
    label: `Germany sits at ${spread.germany.share}%`,
    caption: `Twelfth of ${spread.germany.of}. Where a country is matters ${RATIO} times what a quarter century did.`,
  },
  {
    key: "rail",
    from: 0.72,
    to: 0.86,
    label: `Rail gained in ${rail.gainedIn} of ${rail.of}`,
    caption: `The largest shift was ${rail.largest.country}, at ${rail.largest.points} points.`,
  },
  {
    key: "provenance",
    from: 0.86,
    to: 1.0,
    label: "Pinned by hash, not by memory",
    caption: `${source.publisher} ${source.dataset}, committed with its SHA-256 and its request recorded beside it.`,
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

const MIDDLE = AXIS_HEIGHT / 2;

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one holds a single vertical axis and slides along it. The temptation in
 * a world about two quantities of wildly different size is to close in on the small one, and the
 * shot table deliberately does not - the beat about half a point is framed wide enough that half
 * a point looks like half a point.
 */
export const SHOTS: Record<ModalKey, Shot> = {
  axis: { height: 0.6, distance: 17.0, swing: 0.0, look: 0.0, target: 0, aimY: MIDDLE },
  eu: { height: 0.2, distance: 7.0, swing: 0.5, look: 0.0, target: LANES.time + 0.8, aimY: OVER_TIME.from },
  /* Close enough that half a point is a visible distance - and the next shot takes it away again. */
  moved: { height: 0.05, distance: 3.6, swing: 0.25, look: 0.1, target: LANES.time + 0.4, aimY: (OVER_TIME.from + OVER_TIME.to) / 2 },
  spread: { height: 0.4, distance: 18.0, swing: 2.0, look: 0.0, target: 0, aimY: MIDDLE },
  germany: { height: 0.0, distance: 17.0, swing: 2.4, look: 0.2, target: 0, aimY: MIDDLE },
  rail: { height: 1.6, distance: 14.0, swing: 0.0, look: -0.8, target: 0, aimY: -1.8 },
  provenance: { height: 2.4, distance: 21.0, swing: 0.0, look: 0.0, target: 0, aimY: MIDDLE - 0.6 },
};

/**
 * How far right of centre the subject is aimed, as a share of however wide the frame is.
 *
 * The caption sits behind a scrim in the stage's own colour, so anything drawn in the lower left
 * is dimmed without looking dimmed.
 */
export const PLATE_BIAS = 0.2;
