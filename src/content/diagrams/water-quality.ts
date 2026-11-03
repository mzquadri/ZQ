import type { ProjectDiagram } from "./types";

/**
 * A ranking, and the two things the run did that make it unsupportable.
 *
 * `src/pipeline.py` is one function end to end: a stratified split, median imputation, standard
 * scaling, five estimators, `cross_val_score(cv=5, scoring="f1")`, and a grid search that is
 * applied to XGBoost alone. Everything downstream of the split is drawn from that file.
 *
 * Two asymmetries in it are the reason the table at the end cannot be read as a ranking, and both
 * are drawn rather than described. One estimator is tuned over twenty-seven configurations and the
 * other four are not, so the comparison is not like-for-like. And the same run that produced the
 * ordering also recorded how far each model moved between folds, which is what the gate reads: the
 * intervals of the top three overlap, so their order is a property of the fold assignment rather
 * than of the models.
 *
 * The source is drawn as a generator rather than as data because it is one. `generate_data.py`
 * seeds a deterministic sample; nothing in this project is a measurement of water.
 */
export const waterQualityDiagram: ProjectDiagram = {
  slug: "water-quality",
  title: "Five estimators, one tuned, and a ranking that does not hold",
  caption:
    "The grid search reaches one estimator and not the other four, so the table is not a like-for-like comparison - and the fold-to-fold spread the same run recorded is wide enough to swallow the top three places.",
  accent: "var(--accent-flow)",
  nodes: [
    {
      id: "generator",
      label: "Seeded generator",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      note: "5,000 deterministic samples. No measurement of water anywhere.",
    },
    {
      id: "prep",
      label: "Impute and scale",
      kind: "process",
      col: 1,
      row: 1,
      stages: [1, 2],
      tools: ["pandas", "scikit-learn"],
      note: "Median imputation; standard scaling only where the estimator needs it.",
    },
    {
      id: "cv",
      label: "Five-fold CV",
      kind: "process",
      col: 2,
      row: 0,
      stages: [3],
      tools: ["scikit-learn"],
      note: "Stratified, on the training split, scored by F1.",
    },
    {
      id: "grid",
      label: "Grid search",
      kind: "process",
      col: 2,
      row: 2,
      stages: [4],
      tools: ["XGBoost"],
      note: "Twenty-seven configurations, and only for this one estimator.",
    },
    {
      id: "ranking",
      label: "Ordered table",
      kind: "gate",
      col: 3,
      row: 1,
      note: "Three contenders' intervals overlap, so the order is not supported.",
    },
    {
      id: "results",
      label: "Committed metrics",
      kind: "artifact",
      col: 4,
      row: 1,
      stages: [5],
      note: "Written to a tracked file, so the table cannot drift from the run.",
    },
  ],
  edges: [
    { from: "generator", to: "prep", kind: "data" },
    { from: "prep", to: "cv", kind: "data", label: "four untuned" },
    { from: "prep", to: "grid", kind: "data", label: "one tuned" },
    { from: "cv", to: "ranking", kind: "data", label: "mean F1 and spread" },
    { from: "grid", to: "ranking", kind: "data", label: "best configuration" },
    { from: "ranking", to: "results", kind: "data" },
  ],
};
