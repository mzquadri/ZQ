import type { ProjectDiagram } from "./types";

/**
 * A split made by cycle number, and the ageing that comes back to explain it.
 *
 * The modules are the repository's: `data_loader.py` parses NASA cell files or falls back to a
 * deterministic demonstration set, `feature_engineering.py` builds rolling, voltage, thermal and
 * energy features, `soc_regression.py` trains SVR, random forest and XGBoost through one shared
 * `evaluate_regression`, and `clustering_analysis.py`, `genetic_fuzzy.py` and `soh_analysis.py`
 * run beside that rather than after it.
 *
 * Two things are drawn as gates. The source is one because it is a choice with consequences: the
 * authorised cell data and the generated demonstration set are not interchangeable, and which one
 * ran decides whether any number downstream means anything. The split is the other, because it
 * holds back the last fifty cycles *by cycle number and without shuffling* - a random split here
 * would leak the ageing trajectory into training, and the whole project is about ageing.
 *
 * The return edge is the finding. `soh_analysis.py` fits degradation curves and estimates internal
 * resistance, and what those say is that the voltage curve the estimator was calibrated against
 * moves as the cell ages. So the analyses that sit beside the regression are not a postscript to
 * it; they explain why its features stop meaning what they meant.
 */
export const batterySocDiagram: ProjectDiagram = {
  slug: "battery-soc",
  title: "Held back by cycle number, and explained by ageing",
  caption:
    "The split is drawn as a gate because shuffling it would leak the ageing trajectory the project exists to study. The return edge is the finding: the degradation fits explain why the features drift out from under the estimator.",
  accent: "var(--accent-steel)",
  nodes: [
    {
      id: "source",
      label: "Cells or demo set",
      kind: "gate",
      col: 0,
      row: 1,
      stages: [0],
      note: "Authorised cell data if present, a deterministic synthetic set otherwise.",
    },
    {
      id: "features",
      label: "Cycle-aware features",
      kind: "process",
      col: 1,
      row: 1,
      stages: [1],
      tools: ["pandas"],
      note: "Rolling, voltage, thermal and energy terms.",
    },
    {
      id: "split",
      label: "Last 50 cycles held back",
      kind: "gate",
      col: 2,
      row: 1,
      stages: [2],
      note: "By cycle number, never shuffled.",
    },
    {
      id: "regression",
      label: "Charge regression",
      kind: "process",
      col: 3,
      row: 0,
      stages: [3],
      tools: ["scikit-learn", "XGBoost"],
      note: "SVR, random forest and XGBoost through one metric function.",
    },
    {
      id: "beside",
      label: "Analyses beside it",
      kind: "process",
      col: 3,
      row: 2,
      stages: [4],
      tools: ["DEAP", "scikit-fuzzy"],
      note: "Clustering, genetic-fuzzy rules and state-of-health fits.",
    },
    {
      id: "report",
      label: "Scores and curves",
      kind: "artifact",
      col: 4,
      row: 1,
      note: "Held-out error beside the degradation the same cells show.",
    },
  ],
  edges: [
    { from: "source", to: "features", kind: "data" },
    { from: "features", to: "split", kind: "data" },
    { from: "split", to: "regression", kind: "data", label: "earlier cycles" },
    { from: "split", to: "beside", kind: "data" },
    { from: "regression", to: "report", kind: "data" },
    { from: "beside", to: "report", kind: "data" },
    { from: "beside", to: "features", kind: "feedback", label: "the curve moves as it ages" },
  ],
};
