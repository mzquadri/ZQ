import {
  axis,
  closestGap,
  commonBand,
  results,
  separated,
  widestSd,
} from "@/content/water-chapter";

/**
 * The layout of the water-quality world.
 *
 * One axis of F1 along x, the models stacked in y and staggered in z, and every position computed
 * from the committed results file. The band is the intersection of the contenders' intervals,
 * computed in the content module rather than drawn by eye - so a re-run that separated the models
 * would close it on its own and this world would stop making the claim.
 */

/*
 * A long axis, deliberately. Four of the five models sit inside 0.032 of F1, so a span short
 * enough to frame whole puts them on top of each other and the overlap stops being readable. The
 * axis is drawn at a scale where one standard deviation is a visible length, and the camera closes
 * in on the contenders rather than the drawing compressing them - a zoom, not a distortion.
 */
export const AXIS_WIDTH = 15;
/** The models stack upward in rank order, so five intervals read as five. */
export const ROW_GAP = 1.55;
/** A slight stagger in depth, so the stack is a solid seen in perspective and not a flat chart. */
export const ROW_DEPTH = 0.45;

/** Where a score sits along the drawn axis. */
export const px = (value: number) =>
  ((value - axis.from) / (axis.to - axis.from)) * AXIS_WIDTH - AXIS_WIDTH / 2;

export interface Row {
  readonly name: string;
  /** The single-split score the table ranks on. */
  readonly split: number;
  /** The cross-validated mean, where one was recorded. */
  readonly mean: number | null;
  readonly sd: number;
  /** Height in the stack: best single-split score on top, in the order the table publishes. */
  readonly y: number;
  readonly z: number;
  readonly isSeparated: boolean;
  /** True where this model's interval meets the common band. */
  readonly contender: boolean;
}

/* Ordered by the single-split F1, which is the order the repository's table publishes. */
const ranked = [...results].sort((a, b) => b.f1 - a.f1);

export const ROWS: readonly Row[] = ranked.map((model, i) => {
  const mean = model.cvMean ?? null;
  const sd = model.cvSd ?? 0;
  return {
    name: model.name,
    split: model.f1,
    mean,
    sd,
    y: ((ranked.length - 1) / 2 - i) * ROW_GAP,
    z: (i - (ranked.length - 1) / 2) * ROW_DEPTH,
    isSeparated: model.name === separated.name,
    /*
     * A contender is a model whose interval actually meets the band. Derived rather than listed,
     * so a model moving out of the overlap stops being drawn as passing through it.
     */
    contender:
      mean !== null &&
      model.name !== separated.name &&
      mean - sd <= commonBand.to &&
      mean + sd >= commonBand.from,
  };
});

export const BAND = {
  from: px(commonBand.from),
  to: px(commonBand.to),
} as const;

/** The two lengths the closing beat compares, on the same axis as everything else. */
export const COMPARISON = {
  gap: (closestGap / (axis.to - axis.from)) * AXIS_WIDTH,
  spread: (widestSd.cvSd / (axis.to - axis.from)) * AXIS_WIDTH,
  /* Both bars grow from here, so the longer one is longer on the page as well as in the table. */
  origin: -1.0,
} as const;

/** Where the contenders sit, so the camera can close on them without the number being guessed. */
export const CLUSTER = (() => {
  const meets = ROWS.filter((row) => row.contender && row.mean !== null);
  const lo = Math.min(...meets.map((row) => px((row.mean ?? 0) - row.sd)));
  const hi = Math.max(...meets.map((row) => px((row.mean ?? 0) + row.sd)));
  return { centre: (lo + hi) / 2, width: hi - lo } as const;
})();

/** The whole spread of drawn marks, for the shots that have to hold all five at once. */
export const EVERYTHING = (() => {
  const xs = ROWS.flatMap((row) => {
    const mean = row.mean ?? row.split;
    return [px(mean - row.sd), px(mean + row.sd), px(row.split)];
  });
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  return { centre: (lo + hi) / 2, width: hi - lo } as const;
})();

/** The wall stands past the top and bottom of the stack, so no interval ends inside its face. */
export const BAND_HEIGHT = ROWS.length * ROW_GAP + 0.9;
/** And has thickness, so the intervals pass through a solid rather than crossing a line. */
export const BAND_THICKNESS = ROWS.length * ROW_DEPTH + 0.9;
