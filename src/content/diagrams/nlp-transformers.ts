import type { ProjectDiagram } from "./types";

/**
 * A loader that stops, and a split that is read once.
 *
 * `src/data_loader.py` holds both `load_ag_news` and `_generate_synthetic_ag_news`, and the
 * interesting thing about the second is that the first does not call it when the download fails.
 * Falling back would keep the pipeline green on invented text, and a green pipeline that has
 * silently stopped measuring anything is worse than a red one. So the loader is drawn as a gate
 * with a terminal refusal beside it: the run stops, and that is the designed outcome rather than
 * an unhandled case.
 *
 * The second shape is the protocol. Two model families are trained - TF-IDF baselines through
 * scikit-learn, DistilBERT through the Hugging Face Trainer - and both are tuned against a
 * stratified validation split, never against the published test split. The test split is drawn as
 * a gate because it is read once and nothing is chosen on the far side of it; the return path from
 * validation to the transformer is where tuning is allowed to happen, and drawing it is what shows
 * that it happens there and nowhere else.
 */
export const nlpTransformersDiagram: ProjectDiagram = {
  slug: "nlp-transformers",
  title: "A loader that refuses, and a split read once",
  caption:
    "Tuning has exactly one legal path - the return edge into the transformer from the validation split. The test split is entered once, from the left, and nothing is selected after it.",
  accent: "var(--accent-retrieval)",
  nodes: [
    {
      id: "loader",
      label: "Load AG News",
      kind: "gate",
      col: 0,
      row: 1,
      stages: [0],
      tools: ["Datasets"],
      note: "The synthetic fixture exists and is not substituted when the download fails.",
    },
    {
      id: "tfidf",
      label: "TF-IDF baselines",
      kind: "process",
      col: 1,
      row: 0,
      stages: [1],
      tools: ["scikit-learn"],
      note: "Logistic regression, linear SVM, random forest.",
    },
    {
      id: "bert",
      label: "DistilBERT",
      kind: "process",
      col: 1,
      row: 2,
      stages: [2],
      tools: ["Hugging Face Transformers", "PyTorch"],
      note: "Fine-tuned through the Trainer.",
    },
    {
      id: "stopped",
      label: "Run stops",
      kind: "sink",
      col: 1,
      row: 3,
      note: "No fallback. A green pipeline on invented text measures nothing.",
    },
    {
      id: "validation",
      label: "Validation split",
      kind: "store",
      col: 2,
      row: 1,
      stages: [3],
      note: "Stratified. The only split anything is tuned against.",
    },
    {
      id: "test",
      label: "Published test split",
      kind: "gate",
      col: 3,
      row: 1,
      stages: [4, 5],
      note: "Read once, for the final number. No choice is made after it.",
    },
    {
      id: "report",
      label: "Metrics report",
      kind: "artifact",
      col: 4,
      row: 1,
      stages: [6],
      note: "Classification metrics and confusion matrices; latency optional.",
    },
  ],
  edges: [
    { from: "loader", to: "tfidf", kind: "data" },
    { from: "loader", to: "bert", kind: "data" },
    { from: "loader", to: "stopped", kind: "refused", label: "dataset unavailable" },
    { from: "tfidf", to: "validation", kind: "data" },
    { from: "bert", to: "validation", kind: "data" },
    { from: "validation", to: "test", kind: "control", label: "selection frozen" },
    { from: "test", to: "report", kind: "data" },
    { from: "validation", to: "bert", kind: "feedback", label: "tunes the transformer" },
  ],
};
