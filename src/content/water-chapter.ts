/**
 * Water quality: a leaderboard that its own run does not support.
 *
 * Unlike most chapters here this one does carry numbers, because the
 * repository tracks them: `results/model_results.json` is a committed artefact
 * of a seeded run. What those numbers measure is how well each model recovers
 * the deliberately class-correlated distributions of a generated dataset. They
 * are not laboratory measurements, and the repository states that it does not
 * predict whether real water is safe to drink and must not be used for any
 * water-quality or regulatory decision.
 *
 * The reason the project is worth a page is what the artefact contains that
 * the README's headline table leaves out. The table ranks five models by
 * single-split accuracy, F1 and ROC-AUC. The same JSON also records the
 * cross-validated F1 mean and its standard deviation across folds - and once
 * those are drawn, three of the four models stop being distinguishable.
 *
 * Every figure below is computed from the artefact rather than transcribed, so
 * a changed run changes the page.
 */

export const repository = "https://github.com/mzquadri/ML-Water-Quality-Classification";

/** The generated dataset the run used. */
export const dataset = {
  samples: 5000,
  features: 9,
  seed: 42,
  testFraction: 0.2,
  folds: 5,
  positiveShare: 0.4,
  missingShare: 0.07,
  missingIn: ["pH", "sulfate", "trihalomethanes"],
} as const;

export interface ModelResult {
  readonly name: string;
  readonly accuracy: number;
  readonly f1: number;
  readonly rocAuc: number;
  /** Cross-validated F1 across folds. Absent for the tuned model: none was recorded. */
  readonly cvMean?: number;
  readonly cvSd?: number;
}

/** `results/model_results.json`, verbatim. */
export const results: readonly ModelResult[] = [
  { name: "SVM (RBF)", accuracy: 0.826, f1: 0.7899, rocAuc: 0.9089, cvMean: 0.8194, cvSd: 0.0153 },
  { name: "XGBoost (tuned)", accuracy: 0.825, f1: 0.7889, rocAuc: 0.8984 },
  { name: "Random Forest", accuracy: 0.814, f1: 0.7634, rocAuc: 0.8893, cvMean: 0.7874, cvSd: 0.0221 },
  { name: "XGBoost", accuracy: 0.807, f1: 0.7643, rocAuc: 0.8958, cvMean: 0.7958, cvSd: 0.0187 },
  { name: "Logistic Regression", accuracy: 0.759, f1: 0.6961, rocAuc: 0.8383, cvMean: 0.693, cvSd: 0.0114 },
];

/** The models that have an interval, ordered as the figure draws them. */
export const withInterval: readonly Required<ModelResult>[] = results
  .filter((r): r is Required<ModelResult> => r.cvMean !== undefined && r.cvSd !== undefined)
  .slice()
  .sort((a, b) => b.cvMean - a.cvMean);

/** The one model the README bolds as competitive for which no interval was recorded. */
export const withoutInterval = results.filter((r) => r.cvMean === undefined);

const low = (r: Required<ModelResult>) => r.cvMean - r.cvSd;
const high = (r: Required<ModelResult>) => r.cvMean + r.cvSd;

/**
 * The band every model except logistic regression could be sitting in.
 *
 * Intersecting the one-standard-deviation intervals of the three tree- and
 * kernel-based models leaves a non-empty range, which is the whole finding: a
 * single value of F1 is consistent with all three, so the order the table puts
 * them in is not something this run established.
 */
const contenders = withInterval.filter((r) => r.name !== "Logistic Regression");

export const commonBand = {
  from: Math.max(...contenders.map(low)),
  to: Math.min(...contenders.map(high)),
  models: contenders.length,
} as const;

export const commonBandText = {
  from: commonBand.from.toFixed(3),
  to: commonBand.to.toFixed(3),
} as const;

/** Whether two models' one-standard-deviation intervals overlap at all. */
export function overlaps(a: Required<ModelResult>, b: Required<ModelResult>): boolean {
  return low(a) <= high(b) && low(b) <= high(a);
}

/** The model that is actually separated from the rest, and by how much. */
export const separated = withInterval[withInterval.length - 1];
export const separatedGap = withInterval[withInterval.length - 2].cvMean - separated.cvMean;

/** The largest fold-to-fold standard deviation in the run. */
export const widestSd = withInterval.reduce((w, r) => (r.cvSd > w.cvSd ? r : w), withInterval[0]);

/** The smallest gap between neighbouring contenders, for comparison with that spread. */
export const closestGap = Math.min(
  ...contenders.slice(1).map((r, i) => contenders[i].cvMean - r.cvMean)
);

export const axis = { from: 0.65, to: 0.85 } as const;
export function axisPercent(value: number): number {
  return ((value - axis.from) / (axis.to - axis.from)) * 100;
}

/** What the pipeline does, in the order it does it. */
export const pipeline = [
  "median imputation for the missing values",
  "standard scaling, for the models that need it",
  "five-fold stratified cross-validation on the training split",
  "a 27-point grid search, for XGBoost only",
] as const;
