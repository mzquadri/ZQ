/**
 * Insurance claims: a probability is not a decision.
 *
 * This chapter carries no model result, because the repository publishes none
 * and says so in its own scope section: it versions no data, no split, no
 * trained model, no calibration output and no evaluation report, and therefore
 * makes no verified accuracy, AUC, calibration or business-value claim.
 *
 * What is derivable is the arithmetic. The repository ships an illustrative
 * cost matrix in `src/threshold_optimizer.py`, and a cost matrix plus a
 * calibrated probability determines where the decision boundary belongs - in
 * closed form, with no data involved. That derivation is the figure.
 *
 * The matrix is illustrative. The repository is explicit that it is not a
 * validated business policy and must not be used without domain, legal,
 * fairness and risk review, and nothing here upgrades it.
 */

export const repository = "https://github.com/mzquadri/Insurance-Claims-Prediction-ML";

/**
 * The example cost matrix, exactly as `compute_business_value` defaults it.
 *
 * Signed values rather than costs: catching a claim early is worth something,
 * an unnecessary investigation is a small loss, and missing a real claim is a
 * payout. Doing nothing about a policy that was never going to claim is zero.
 */
export const costs = {
  truePositive: 500,
  trueNegative: 0,
  falsePositive: -50,
  falseNegative: -1000,
} as const;

/** The value of acting on a policy whose probability of claiming is `p`. */
export function valueOfFlagging(p: number): number {
  return p * costs.truePositive + (1 - p) * costs.falsePositive;
}

/** The value of leaving that same policy alone. */
export function valueOfHolding(p: number): number {
  return p * costs.falseNegative + (1 - p) * costs.trueNegative;
}

/**
 * Where the two are equal, which is the only threshold the matrix justifies.
 *
 * Setting the two lines equal and solving for `p` gives
 *   p = (V_tn - V_fp) / ((V_tp - V_fn) + (V_tn - V_fp))
 * with no reference to any dataset. It is a property of the four numbers
 * above, so it is quotable without a model behind it.
 */
export const breakEven =
  (costs.trueNegative - costs.falsePositive) /
  (costs.truePositive - costs.falseNegative + (costs.trueNegative - costs.falsePositive));

/** The threshold nearly everything defaults to, for comparison. */
export const defaultCut = 0.5;

/** How far the habit sits from the arithmetic. */
export const cutRatio = defaultCut / breakEven;

export const breakEvenText = {
  percent: (breakEven * 100).toFixed(2),
  ratio: cutRatio.toFixed(1),
} as const;

/** The vertical extent the figure's value axis has to cover. */
export const valueBand = {
  low: valueOfHolding(1),
  high: valueOfFlagging(1),
} as const;

/** The four cells of the matrix, in reading order, for the figure. */
export const cells = [
  { key: "tp", label: "claim caught early", value: costs.truePositive },
  { key: "fp", label: "investigated for nothing", value: costs.falsePositive },
  { key: "fn", label: "claim missed", value: costs.falseNegative },
  { key: "tn", label: "left alone, correctly", value: costs.trueNegative },
] as const;

/** How `find_optimal_threshold` can be asked to choose a cut. */
export const selectionMethods = [
  { key: "f1", label: "best F1" },
  { key: "youden", label: "Youden's J" },
  { key: "business", label: "most expected value" },
  { key: "precision_at_recall", label: "precision at 90% recall" },
] as const;

/** What `calibration.py` fits, and what it scores them with. */
export const calibration = {
  methods: ["Platt scaling", "isotonic regression"],
  score: "Brier score",
  folds: 5,
} as const;

/** The classifiers `model_training.py` compares. */
export const models = [
  "logistic regression",
  "random forest",
  "XGBoost",
  "LightGBM",
] as const;

/** The three things the pipeline separates, which is its whole argument. */
export const stages = [
  { key: "rank", label: "rank", note: "does the model order policies by risk at all" },
  { key: "calibrate", label: "calibrate", note: "does a stated 20% mean twenty in a hundred" },
  { key: "cut", label: "cut", note: "where the probability becomes an action" },
] as const;
