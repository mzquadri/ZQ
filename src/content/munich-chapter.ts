/**
 * Munich accident forecasting: the published margin, and the margin that is not there.
 *
 * Read out of the repository's own pinned artefacts rather than its prose:
 *
 *   results/reference_run.json        the published window, 2021-2022
 *   results/pandemic_free_run.json    the identical protocol run three years earlier
 *   results/uncertainty_run.json      the paired bootstrap over held-out months
 *
 * The intervals published here are the moving-block ones, not the independent
 * ones. The repository runs both and says which to believe: drawing months
 * independently assumes monthly accident counts carry no memory, which is
 * false and makes the interval too narrow, so where the two disagree the wider
 * block interval is the one to read. Taking the narrower pair would have made
 * the published margin look better than its own author claims it is.
 */

export const repository = "https://github.com/mzquadri/munich-accident-forecasting";

export const dataset = {
  monthlyObservations: 1932,
  series: 7,
  firstYear: 2000,
  lastYear: 2022,
  source: "Landeshauptstadt Muenchen, open data portal",
} as const;

/**
 * Two runs of one protocol. `margin` is the model's improvement over seasonal
 * naive on scaled MAE; `low` and `high` are the 3-month moving-block bootstrap
 * bounds, 10,000 draws.
 */
export const windows = [
  {
    key: "published",
    label: "2021 and 2022, as published",
    testYears: "2021 to 2022",
    trendWindowYears: 6,
    scaledMae: 0.1531,
    naiveScaledMae: 0.1999,
    mapePercent: 20.48,
    margin: 0.234414,
    low: 0.072056,
    high: 0.333084,
    seriesWon: 7,
    clearsZero: true,
  },
  {
    key: "ordinary",
    label: "2018 and 2019, ordinary years",
    testYears: "2018 to 2019",
    trendWindowYears: 12,
    scaledMae: 0.1657,
    naiveScaledMae: 0.1435,
    mapePercent: 17.7,
    margin: -0.155261,
    low: -0.368036,
    high: 0.069418,
    seriesWon: 3,
    clearsZero: false,
  },
] as const;

export const seriesTotal = 7;
export const testMonths = 24;
export const testRows = 168;
export const bootstrapDraws = 10000;
export const blockMonths = 3;

/** How much of the published margin the move to an ordinary period costs. */
export const marginShareLost = 1.662336;
export const marginSurvives = false;

/**
 * The axis the figure is drawn on. Wide enough to hold both intervals with a
 * margin, and symmetric about zero so neither side is flattered by the framing.
 */
export const axis = { min: -0.45, max: 0.4 } as const;

/** Where a value sits along that axis, as a percentage. */
export function axisPercent(value: number): number {
  const span = axis.max - axis.min;
  return Math.round(((value - axis.min) / span) * 1000) / 10;
}
