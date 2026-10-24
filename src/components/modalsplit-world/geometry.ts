import { axis, coverage, euCarShare, rail, spread } from "@/content/modal-split-chapter";

/**
 * The layout of the modal-split world.
 *
 * Car share of inland passenger transport runs up the vertical axis, and the two things the
 * report compares stand on it side by side: twenty-four years of change on the left, and the
 * distance between countries in one year on the right.
 *
 * Both are drawn at the same scale on the same axis, which is the entire argument. Nothing is
 * magnified to make the comparison land - 0.5 points against 30.9 points is 62 to one, and that
 * ratio is what a reader should be looking at.
 *
 * The axis starts at 60 rather than 0, as the report's does and for the reason the report gives:
 * every observed value sits above it, and a zero baseline compresses the only two things being
 * compared into the top third. A truncated axis is a decision, so this world starts its sequence
 * by stating it.
 */

export const AXIS_HEIGHT = 8;
export const py = (share: number) =>
  ((share - axis.min) / (axis.max - axis.min)) * AXIS_HEIGHT;

/** The two columns: change over time on the left, difference between places on the right. */
export const LANES = { time: -2.8, place: 2.8 } as const;

/** What twenty-four years of policy moved, as two marks on the axis. */
export const OVER_TIME = {
  from: py(euCarShare.from),
  to: py(euCarShare.to),
  fromYear: euCarShare.fromYear,
  toYear: euCarShare.toYear,
  points: euCarShare.changePoints,
} as const;

/** What a border moves, as the span between the highest and lowest country in one year. */
export const ACROSS_PLACE = {
  low: py(spread.lowest.share),
  high: py(spread.highest.share),
  germany: py(spread.germany.share),
  points: spread.points,
  year: coverage.comparisonYear,
} as const;

/** How many times larger the second is than the first, computed rather than asserted. */
export const RATIO = Math.round((spread.points / euCarShare.changePoints) * 10) / 10;

/**
 * The rail beat, as a row of marks: one per country with a rail share recorded, with the ones
 * that gained lifted. Only the count and the largest gain are published, so only the count and
 * the largest gain are drawn - the other thirteen are lifted to a common height rather than to
 * values the report does not give.
 */
export const RAIL = {
  total: rail.of,
  gained: rail.gainedIn,
  largestName: rail.largest.country,
  largestPoints: rail.largest.points,
  gap: 0.46,
} as const;

export const railX = (i: number) => (i - (RAIL.total - 1) / 2) * RAIL.gap;
