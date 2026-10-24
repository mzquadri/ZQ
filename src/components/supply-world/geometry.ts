import { components, duplicated, duplicatedWeight, formulas, independent } from "@/content/supply-chain-chapter";

/**
 * The layout of the supply-chain world.
 *
 * The composite is one bar of unit length in five segments, so a segment's width is its weight and
 * nothing has to be said about proportion. Behind it stand the distinct source columns - four of
 * them, not five, which is the finding - and each segment is tied to the column it is normalised
 * from.
 */

export const BAR = { width: 7.2, height: 0.62, depth: 0.62, y: 0.0 } as const;
export const SOURCE_Z = -3.4;

/** The duplicates are laid out first so they have somewhere to merge to. */
const ORDER = [...duplicated, ...independent];

export interface Segment {
  readonly key: string;
  readonly label: string;
  readonly weight: number;
  readonly width: number;
  /** Centre of the segment along the bar. */
  readonly x: number;
  readonly duplicate: boolean;
  /** Which source column it is tied to. Both duplicates share one. */
  readonly source: number;
}

export const SEGMENTS: readonly Segment[] = (() => {
  let run = 0;
  return ORDER.map((component, i) => {
    const width = component.weight * BAR.width;
    const x = -BAR.width / 2 + run + width / 2;
    run += width;
    return {
      key: component.key,
      label: component.label,
      weight: component.weight,
      width,
      x,
      duplicate: Boolean(component.duplicate),
      /* The two duplicates both tie to column 0. Everything else gets its own. */
      source: component.duplicate ? 0 : i - duplicated.length + 1,
    };
  });
})();

/** One column per distinct signal: four, because the two duplicates share one. */
export const SOURCE_COUNT = 1 + independent.length;

export const SOURCES = Array.from({ length: SOURCE_COUNT }, (_, i) => ({
  index: i,
  x: (i - (SOURCE_COUNT - 1) / 2) * 1.8,
}));

/** Where the merged block ends up: the whole duplicated share, at the start of the bar. */
export const MERGED = {
  width: duplicatedWeight * BAR.width,
  x: -BAR.width / 2 + (duplicatedWeight * BAR.width) / 2,
} as const;

export const FORMULA_X = formulas.map((_, i) => (i - (formulas.length - 1) / 2) * 2.1);

export const COMPONENT_COUNT = components.length;
