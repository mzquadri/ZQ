/**
 * Eurostat modal split: what 24 years of policy moved, against what a border moves.
 *
 * Every figure here is one the report computes at render time from the pinned
 * API response rather than one typed into its prose, which is the property the
 * repository is built around. Read from its README's "What it found" section,
 * which is itself generated.
 *
 *   data/raw/tran_hv_psmod.json   the committed API response, pinned by SHA-256
 *   data/raw/PROVENANCE.md        the request, the licence and the response shape
 *
 * The comparison year is 2024, which the report selects as the most recent year
 * holding at least 90 per cent of peak reporting coverage, rather than simply
 * taking the latest year present.
 */

export const repository = "https://github.com/mzquadri/r-ggplot2-eurostat-report";

export const source = {
  dataset: "tran_hv_psmod",
  title: "Modal split of inland passenger transport",
  publisher: "Eurostat",
  retrievedAt: "2026-10-18",
  sha256: "eee898d1bc29443c469dd804fd23a236d296610b1e23e3d8ec1508ace9947220",
} as const;

export const coverage = {
  countries: 35,
  firstYear: 1990,
  lastYear: 2024,
  peakYear: 2010,
  comparisonYear: 2024,
} as const;

/** The EU aggregate, at both ends of the comparison. */
export const euCarShare = {
  aggregate: "EU27_2020",
  fromYear: 2000,
  from: 82.0,
  toYear: 2024,
  to: 82.5,
  changePoints: 0.5,
  years: 24,
} as const;

/** The spread across countries in the comparison year. */
export const spread = {
  points: 30.9,
  highest: { country: "Montenegro", share: 97.8 },
  lowest: { country: "Hungary", share: 66.9 },
  germany: { share: 84.1, rank: 12, of: 34 },
} as const;

export const rail = {
  gainedIn: 14,
  of: 32,
  largest: { country: "Switzerland", points: 7.3 },
} as const;

/**
 * The axis the figure is drawn on. It starts at 60 rather than 0 because the
 * whole range of observed values sits above it, and a zero baseline here would
 * compress the only two things the figure is comparing into the top third.
 * Stated rather than quietly chosen, because a truncated axis is a decision.
 */
export const axis = { min: 60, max: 100 } as const;

export function axisPercent(value: number): number {
  const span = axis.max - axis.min;
  return Math.round(((value - axis.min) / span) * 1000) / 10;
}
