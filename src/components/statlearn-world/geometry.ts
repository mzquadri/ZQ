import { baseline, correctOf, gradientChecks, runs, testPoints } from "@/content/statlearn-chapter";

/**
 * The layout of the statistical-learning world.
 *
 * Sixty tiles in a grid, because sixty is the held-out set and the whole argument is that nothing
 * finer than one of them can be measured. Which tile a run lights is not a claim - the report
 * publishes counts, not per-point outcomes - so tiles light in order and the count is the only
 * thing the picture asserts.
 */

export const COLUMNS = 10;
export const ROWS = Math.ceil(testPoints / COLUMNS);
export const TILE = { size: 0.42, gap: 0.54 } as const;

export interface Tile {
  readonly index: number;
  readonly x: number;
  readonly z: number;
}

export const TILES: readonly Tile[] = Array.from({ length: testPoints }, (_, i) => {
  const column = i % COLUMNS;
  const row = Math.floor(i / COLUMNS);
  return {
    index: i,
    x: (column - (COLUMNS - 1) / 2) * TILE.gap,
    z: (row - (ROWS - 1) / 2) * TILE.gap,
  };
});

const byKey = (key: string) => runs.find((run) => run.key === key);

/** The counts each state lights, read from the ledger rather than written here. */
export const COUNTS = {
  baseline: correctOf(baseline),
  default: correctOf(byKey("default") ?? baseline),
  sweep: correctOf(byKey("sweep") ?? baseline),
  bayes: correctOf(byKey("bayes") ?? baseline),
  random: correctOf(byKey("random") ?? baseline),
} as const;

/**
 * The tiles that separate the two searches.
 *
 * `random` beat `bayes`, and the difference is the slice between their counts - one tile, which is
 * why the beat that shows it is the only one the camera drops low for.
 */
export const MARGIN_TILES = TILES.slice(COUNTS.bayes, COUNTS.random);

/**
 * The two gradient checks on a log scale.
 *
 * They differ by eight orders of magnitude because one is limited by a finite-difference step size
 * and the other is float64 round-off, and that distance is the finding rather than an awkwardness
 * to normalise away.
 */
export const CHECKS = gradientChecks.map((check) => ({
  key: check.key,
  label: check.label,
  value: check.value,
  /* log10, shifted so the smaller one still has visible height. */
  height: Math.max(0.1, (Math.log10(check.value) + 20) / 12),
}));
