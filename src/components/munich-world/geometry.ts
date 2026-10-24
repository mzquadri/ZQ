import { axis, seriesTotal, windows } from "@/content/munich-chapter";

/**
 * The layout of the munich world.
 *
 * Improvement over a seasonal-naive baseline runs along x, zero is a wall standing on it, and the
 * two runs of the protocol are two intervals at two depths. One of them clears the wall. The
 * other is impaled on it, which is what "the margin does not survive an ordinary period" looks
 * like when it is a solid rather than a sentence.
 *
 * The intervals are the three-month moving-block bootstrap ones, as the repository says to read:
 * drawing months independently assumes monthly accident counts carry no memory, which is false
 * and makes the interval too narrow. Taking the narrower pair would have flattered the published
 * margin against its own author's advice.
 */

export const AXIS_WIDTH = 14;
export const px = (value: number) =>
  ((value - axis.min) / (axis.max - axis.min)) * AXIS_WIDTH - AXIS_WIDTH / 2;

/** Zero, which is the only thing either interval has to be on one side of. */
export const ZERO_X = px(0);

export interface Run {
  readonly key: string;
  readonly label: string;
  readonly testYears: string;
  readonly margin: number;
  readonly low: number;
  readonly high: number;
  readonly seriesWon: number;
  readonly clearsZero: boolean;
  readonly z: number;
}

export const RUNS: readonly Run[] = windows.map((window, i) => ({
  key: window.key,
  label: window.label,
  testYears: window.testYears,
  margin: px(window.margin),
  low: px(window.low),
  high: px(window.high),
  seriesWon: window.seriesWon,
  clearsZero: window.clearsZero,
  z: i === 0 ? -2.2 : 2.2,
}));

/** One block per series, so "seven of seven" and "three of seven" are the same picture twice. */
export const SERIES = Array.from({ length: seriesTotal }, (_, i) => ({
  index: i,
  y: (i - (seriesTotal - 1) / 2) * 0.62,
}));

export const WALL = { height: 6.2, depth: 5.4, width: 0.14 } as const;
export const BAR = { thickness: 0.42 } as const;
