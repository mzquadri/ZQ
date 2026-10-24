import {
  detail,
  generator,
  misread,
  ocv,
  socRange,
  split,
  voltageBand,
} from "@/content/battery-chapter";

/**
 * The layout of the battery world.
 *
 * State of charge along x, cycle number into depth, open-circuit voltage as height. The repository
 * ships a deterministic generator, so the surface is not a drawing of a dataset - it is that
 * function evaluated on a grid, with the two Gaussian noise terms left out, which makes it the
 * generator's mean surface rather than one of its samples.
 *
 * The surface is nearly flat along the cycle axis on purpose. Ageing costs 0.0001 volts a cycle
 * and the voltage axis is about a volt wide, so two hundred cycles move the whole sheet by two per
 * cent of its own height. That invisibility is the point of the project, so the geometry keeps it
 * and the camera closes in instead.
 */

export const AXIS_WIDTH = 14;
/* Short on purpose. The close beats have to sit inside the cycle axis to compare two edges that
 * differ by two per cent of the voltage axis, and a camera nearer than half the depth clips the
 * near edge away. A long cycle axis would buy presence in the wide shots and cost the argument. */
export const DEPTH = 5.0;
/** Drawn units per volt, chosen so the voltage band fills a little over a third of the axis. */
export const UNITS_PER_VOLT = 5.3;

const MID_VOLTS = (voltageBand.low + voltageBand.high) / 2;

export const px = (soc: number) =>
  ((soc - socRange.from) / (socRange.to - socRange.from)) * AXIS_WIDTH - AXIS_WIDTH / 2;
export const py = (volts: number) => (volts - MID_VOLTS) * UNITS_PER_VOLT;
export const pz = (cycle: number) =>
  ((cycle - 1) / (generator.cycles - 1)) * DEPTH - DEPTH / 2;

/** Grid resolution. Fine along state of charge, where the curve bends; coarse along cycle, where
 * it does not - the ageing term is linear in cycle and a hundred rows would draw one plane. */
export const GRID = { soc: 56, cycle: 10 } as const;

/** A point on the generator's mean surface, in drawn units. */
export function surfacePoint(socT: number, cycleT: number) {
  const soc = socRange.from + (socRange.to - socRange.from) * socT;
  const cycle = 1 + (generator.cycles - 1) * cycleT;
  return { x: px(soc), y: py(ocv(soc, cycle)), z: pz(cycle) };
}

/** The fresh edge, which is the curve a lookup table is built from. */
export const FRESH_Z = pz(1);
/** The aged edge, two hundred cycles later. */
export const AGED_Z = pz(generator.cycles);

/**
 * The misreading, as three points in space.
 *
 * `truth` is where the cell actually is. `onAged` is the voltage it reports from there. `onFresh`
 * is where that same voltage sits on the curve the gauge was calibrated against - and the distance
 * between `truth` and `onFresh` along x is the charge the lookup gives away.
 */
export const MISREAD = {
  truthX: px(misread.truth),
  readsX: px(misread.reads),
  volts: py(ocv(misread.truth, generator.cycles)),
  freshVolts: py(ocv(misread.truth, 1)),
} as const;

/** The window the close beats work in, where the two edges are far enough apart to be seen. */
export const DETAIL = {
  from: px(detail.from),
  to: px(detail.to),
  centre: (px(detail.from) + px(detail.to)) / 2,
} as const;

/** Where the temporal split falls along the cycle axis: the last fifty cycles are held back. */
export const SPLIT_Z = pz(split.testFrom);

/** The vertical extent the surface covers, for framing. */
export const VOLT_SPAN = { low: py(voltageBand.low), high: py(voltageBand.high) } as const;
