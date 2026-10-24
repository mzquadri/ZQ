import { choreograph, type WorldState } from "@/components/worlds/choreography";

import { detector, drift, rescored, runs, seasonalFix } from "@/content/drift-chapter";

import { BANDS, OFFERS } from "./geometry";

/**
 * A gate that moves, and the model it refuses for not being better than itself.
 *
 * Three offers to one promotion policy. The first has no champion to beat and clears the
 * baseline. The second beats the 2011 champion re-scored on the new window by more than two per
 * cent, and is promoted - which moves the gate to where the second model now is. The third offer
 * is the same model again, and the gate it has to pass is itself, so it is refused.
 *
 * Every number is read out of an artefact the repository exports rather than out of its prose,
 * which is that project's own source hierarchy. Two figures it carries in prose are deliberately
 * absent here, and the closing beat says which and why.
 */

export type DriftKey =
  | "baseline"
  | "retrain"
  | "refused"
  | "measured"
  | "detector"
  | "seasonal"
  | "absent";

export const STATES: readonly WorldState<DriftKey>[] = [
  {
    key: "baseline",
    from: 0.0,
    to: 0.14,
    label: `The first model clears the baseline`,
    caption: `MAE ${runs[0].mae} against a baseline of ${runs[0].baselineMae}. Nothing is registered yet, so it is promoted.`,
  },
  {
    key: "retrain",
    from: 0.14,
    to: 0.3,
    label: "Retrained, it beats the champion",
    caption: `${runs[1].mae} against ${rescored.championOnNewWindow} on the same window. The gate moves to where it landed.`,
  },
  {
    key: "refused",
    from: 0.3,
    to: 0.46,
    label: "Offered again, it is refused",
    caption: `The same model, and the gate is now itself: ${runs[2].mae} is not two per cent better than ${runs[1].mae}.`,
  },
  {
    key: "measured",
    from: 0.46,
    to: 0.6,
    label: `The target moved ${drift.target}`,
    caption: `Against a threshold of ${drift.targetThreshold}. One of ${drift.featureColumns} feature columns crossed its own.`,
  },
  {
    key: "detector",
    from: 0.6,
    to: 0.74,
    label: `${detector.name}, silent on the control window`,
    caption: `${detector.controlAlarms} alarms over ${detector.controlRows.toLocaleString("en-GB")} rows where an alarm would be false by construction.`,
  },
  {
    key: "seasonal",
    from: 0.74,
    to: 0.88,
    label: "And a defect in the monitor itself",
    caption: `A ${seasonalFix.minWindowRows}-row window is January only, compared against a reference spanning twelve months.`,
  },
  {
    key: "absent",
    from: 0.88,
    to: 1.0,
    label: "Two figures left out on purpose",
    caption: "Numbers the repository writes in prose but no script computes are a description, not a result.",
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

const GATE_ZONE = (OFFERS[1].gateX + OFFERS[2].gateX) / 2;

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one descends. The promotion axis is at the top, what the monitor
 * measured is below it and the defect found in the monitor is below that - which is the order
 * the project discovered them in and the order a reader needs them in. Nothing climbs back up.
 */
export const SHOTS: Record<DriftKey, Shot> = {
  baseline: { height: 0.8, distance: 19.0, swing: 0.0, look: 0.0, target: 0, aimY: 0.6 },
  retrain: { height: 0.4, distance: 17.0, swing: 1.6, look: 0.0, target: -1.0, aimY: 0.2 },
  /* Close on the two gates, because the distance between them is the whole of the refusal. */
  refused: { height: -0.2, distance: 9.0, swing: 1.2, look: 0.2, target: GATE_ZONE, aimY: -1.0 },
  measured: { height: 0.6, distance: 14.0, swing: 2.0, look: 0.0, target: 0, aimY: BANDS.measured + 1.2 },
  detector: { height: 0.2, distance: 13.0, swing: -1.4, look: 0.0, target: 0, aimY: BANDS.measured - 1.0 },
  seasonal: { height: 1.0, distance: 13.0, swing: -2.2, look: 0.0, target: 0, aimY: BANDS.seasonal + 0.4 },
  absent: { height: 2.4, distance: 24.0, swing: 0.0, look: 0.0, target: 0, aimY: -3.0 },
};

/**
 * How far right of centre the subject is aimed, as a share of however wide the frame is.
 *
 * The caption sits behind a scrim in the stage's own colour, so anything drawn in the lower left
 * is dimmed without looking dimmed.
 */
export const PLATE_BIAS = 0.21;
