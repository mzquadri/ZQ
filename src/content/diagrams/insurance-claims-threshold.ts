import type { ProjectDiagram } from "./types";

/**
 * Where a probability stops being a probability and becomes a decision.
 *
 * `src/data_pipeline.py`, `model_training.py`, `calibration.py`, `threshold_optimizer.py` and
 * `explainability.py` are the five boxes, and the order they appear in is the argument.
 *
 * The split is a gate rather than a first step because of what it guards: encoders and scaling are
 * fitted on the training side only, so the thing being measured later has not already seen the
 * data it is measured on.
 *
 * Calibration sits between the model and the threshold because the threshold search is meaningless
 * without it. Searching a cut-off over scores that are not probabilities optimises a number that
 * does not mean what the cost criterion assumes it means, which is why Platt and isotonic are
 * cross-validated and scored by Brier rather than by accuracy.
 *
 * The threshold is the second gate and it has two exits, because that is the project's finding:
 * the value of acting and the value of leaving alone cross exactly once, and nowhere near one
 * half. A diagram ending in a single "prediction" box would be drawing the thing the project
 * argues against.
 */
export const claimsThresholdDiagram: ProjectDiagram = {
  slug: "insurance-claims-threshold",
  title: "A probability, calibrated, and then turned into a decision",
  caption:
    "Calibration sits before the threshold search because searching a cut-off over scores that are not probabilities optimises the wrong quantity. The gate has two exits, and they cross once - nowhere near one half.",
  accent: "var(--accent-systems)",
  nodes: [
    {
      id: "split",
      label: "Split first",
      kind: "gate",
      col: 0,
      row: 1,
      stages: [0],
      tools: ["pandas"],
      note: "Encoders and scaling fitted on the training side only.",
    },
    {
      id: "models",
      label: "Classifiers compared",
      kind: "process",
      col: 1,
      row: 1,
      stages: [1],
      tools: ["scikit-learn", "XGBoost", "LightGBM"],
      note: "Behind one interface, so this is not a comparison of harnesses.",
    },
    {
      id: "calibrate",
      label: "Calibrated",
      kind: "process",
      col: 2,
      row: 1,
      stages: [2],
      note: "Platt or isotonic, cross-validated, scored by Brier.",
    },
    {
      id: "threshold",
      label: "Threshold searched",
      kind: "gate",
      col: 3,
      row: 1,
      stages: [3],
      note: "Against the cost criterion. The two costs are wildly unequal.",
    },
    {
      id: "shap",
      label: "Attribution",
      kind: "artifact",
      col: 3,
      row: 3,
      stages: [4],
      tools: ["SHAP"],
      note: "What the chosen model rests on, computed after it is chosen.",
    },
    {
      id: "act",
      label: "Worth acting on",
      kind: "sink",
      col: 4,
      row: 0,
      note: "Above the line the costs put it, not above one half.",
    },
    {
      id: "leave",
      label: "Left alone",
      kind: "sink",
      col: 4,
      row: 2,
      note: "Where acting costs more than being wrong about it.",
    },
  ],
  edges: [
    { from: "split", to: "models", kind: "data" },
    { from: "models", to: "calibrate", kind: "data" },
    { from: "calibrate", to: "threshold", kind: "data", label: "probabilities" },
    { from: "calibrate", to: "shap", kind: "control", label: "attributed" },
    { from: "threshold", to: "act", kind: "data" },
    { from: "threshold", to: "leave", kind: "refused" },
    { from: "shap", to: "models", kind: "feedback", label: "which features carry it" },
  ],
};
