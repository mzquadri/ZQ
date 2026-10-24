import { choreograph, type WorldState } from "@/components/worlds/choreography";

import {
  capacity,
  detailMagnification,
  generator,
  misreadText,
  rows,
  split,
} from "@/content/battery-chapter";

import { DETAIL, VOLT_SPAN } from "./geometry";

/**
 * One surface, and the two per cent of its height that ruins a lookup table.
 *
 * The repository publishes no battery measurement and says so, so there is no result here to
 * animate. What it does ship is a deterministic generator, and a generator is a surface: voltage
 * over state of charge and cycle number. Evaluating it is not a claim about a cell - it is a
 * claim about the code, which is the only claim the repository makes.
 *
 * The whole sequence is about a quantity too small to see at the scale it matters at. Ageing moves
 * the sheet by 0.02 volts across two hundred cycles, against a voltage axis nearly a volt wide, so
 * the beats that matter are a zoom rather than an exaggeration - the same magnification the flat
 * figure states in its own caption.
 */

export type BatteryKey =
  | "surface"
  | "cycles"
  | "flat"
  | "detail"
  | "misread"
  | "split"
  | "limits";

export const STATES: readonly WorldState<BatteryKey>[] = [
  {
    key: "surface",
    from: 0.0,
    to: 0.12,
    label: "Voltage over state of charge",
    caption: "The generator's own open-circuit-voltage curve, evaluated rather than drawn.",
  },
  {
    key: "cycles",
    from: 0.12,
    to: 0.28,
    label: `Swept across ${generator.cycles} cycles`,
    caption: "The same curve at every age the generator produces, which makes it a surface.",
  },
  {
    key: "flat",
    from: 0.28,
    to: 0.42,
    label: "And ageing barely tilts it",
    caption: `0.0001 volts a cycle, on an axis almost a volt wide. Two hundred cycles move the sheet by ${misreadText.volts} volts.`,
  },
  {
    key: "detail",
    from: 0.42,
    to: 0.56,
    label: `Magnified ${detailMagnification} times`,
    caption: "Close enough to see the fresh edge and the aged edge as two separate things.",
  },
  {
    key: "misread",
    from: 0.56,
    to: 0.72,
    label: "Which is where the gauge goes wrong",
    caption: `A cell truly at 50% reports a voltage the fresh curve reads back as ${misreadText.reads}%.`,
  },
  {
    key: "split",
    from: 0.72,
    to: 0.86,
    label: "So the split is by cycle, not at random",
    caption: `The last ${split.testCycles} cycles are held back whole. Two samples a second apart are nearly the same row.`,
  },
  {
    key: "limits",
    from: 0.86,
    to: 1.0,
    label: "None of this is a measured cell",
    caption: "It is the synthetic cell the repository ships so its pipeline can be developed without anyone's data.",
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

const WHOLE = 0;
const MIDDLE = (VOLT_SPAN.low + VOLT_SPAN.high) / 2;

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one starts side-on to a curve, rises to find that the curve is a sheet,
 * and then dives into a twelve-point window of it. The dive is the argument. A drift of two per
 * cent is either invisible or exaggerated, and the only honest third option is to go and look.
 */
export const SHOTS: Record<BatteryKey, Shot> = {
  surface: { height: 1.0, distance: 28.0, swing: 0.0, look: 0.0, target: WHOLE, aimY: MIDDLE },
  cycles: { height: 9.0, distance: 30.0, swing: 3.0, look: 0.0, target: WHOLE, aimY: MIDDLE },
  flat: { height: 1.2, distance: 26.0, swing: 9.0, look: 0.0, target: WHOLE, aimY: MIDDLE },
  detail: { height: 0.5, distance: 4.2, swing: 0.5, look: 0.0, target: DETAIL.centre, aimY: -0.05 },
  misread: { height: 0.25, distance: 3.6, swing: 0.2, look: 0.2, target: DETAIL.centre, aimY: -0.12 },
  split: { height: 11.0, distance: 26.0, swing: -4.0, look: 0.0, target: WHOLE, aimY: MIDDLE },
  limits: { height: 5.0, distance: 32.0, swing: 0.0, look: 0.0, target: WHOLE, aimY: MIDDLE },
};

/** Rows the default generator produces, quoted where the world needs it. */
export const GENERATED_ROWS = rows;
/** How much of nominal capacity the generator has faded by the last cycle. */
export const FADE_PERCENT = capacity.fadePercent;

/**
 * How far right of centre the subject is aimed, as a share of however wide the frame is.
 *
 * The caption sits behind a scrim in the stage's own colour, so anything drawn in the lower left
 * is dimmed invisibly. A share rather than a number of units, because this world closes in by a
 * factor of eight and no fixed offset survives that.
 */
export const PLATE_BIAS = 0.23;
