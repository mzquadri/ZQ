import type { ProjectDiagram } from "./types";

/**
 * A gate that stops the run, and the one place anything is allowed to be fitted.
 *
 * Both of the shapes drawn here are claims the repository makes about itself in code, not in
 * prose, which is why they are worth a diagram.
 *
 * The first is the fitting surface. `src/feature_store.py` has exactly one method that fits
 * anything - `fit_transform_train` - and its docstring says so: "Everything downstream -
 * validation, test, and serving - goes through `transform`, which cannot fit. Keeping the fitting
 * surface this small is what makes the leakage claim checkable." A diagram with one "feature
 * engineering" box would hide the only detail that makes that claim meaningful, so the fit path
 * and the transform path are drawn as two boxes that split at the partition and never rejoin.
 *
 * The second is the gate. `src/pipeline.py` raises `GateFailure` and the run stops: "a pipeline
 * that continues past a failed gate is not a gate." The refused path therefore ends in a terminal
 * box rather than looping back to training, because nothing retries.
 *
 * The return path is training-serving parity. The fitted state travels into the bundle and the
 * serving process transforms through it, which is what `tests/test_training_serving_parity.py`
 * exists to hold - the same transformers, not an equivalent reimplementation of them.
 */
export const mlopsPipelineDiagram: ProjectDiagram = {
  slug: "mlops-reference-pipeline",
  title: "One fitting surface, and a gate that stops the run",
  caption:
    "Fitting happens in exactly one box; validation, test and serving all go through a path that cannot fit. The gate is a conjunction - one failed check and nothing is registered at all.",
  accent: "var(--accent-systems)",
  nodes: [
    {
      id: "data",
      label: "Licensed data",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      note: "Hashed and checked for duplicates before anything reads it.",
    },
    {
      id: "split",
      label: "Partition",
      kind: "process",
      col: 1,
      row: 1,
      stages: [1],
      note: "Train, validation and test, fixed before a feature exists.",
    },
    {
      id: "fit",
      label: "Fit transformers",
      kind: "process",
      col: 2,
      row: 0,
      stages: [2],
      tools: ["scikit-learn"],
      note: "The only place anything is fitted. Train partition only.",
    },
    {
      id: "transform",
      label: "Transform",
      kind: "process",
      col: 2,
      row: 2,
      note: "Cannot fit. Validation, test and serving share this path.",
    },
    /*
     * Row 0, beside the fitting path rather than on the centre line. Column 3 has to stay clear at
     * rows 1 and 2 so the held-out matrices can reach the gate without crossing this box - the
     * evaluation path and the training path genuinely do not meet until the gate.
     */
    {
      id: "train",
      label: "Train candidate",
      kind: "process",
      col: 3,
      row: 0,
      tools: ["scikit-learn"],
      note: "Produces a bundle with checksummed artifacts.",
    },
    {
      id: "gate",
      label: "Promotion gate",
      kind: "gate",
      col: 4,
      row: 1,
      stages: [3],
      note: "A conjunction of checks on held-out metrics and latency.",
    },
    {
      id: "registry",
      label: "Registry",
      kind: "store",
      col: 5,
      row: 0,
      stages: [4],
      note: "Registered as staging, then transitioned to production.",
    },
    {
      id: "serve",
      label: "Prediction service",
      kind: "sink",
      col: 5,
      row: 1,
      tools: ["FastAPI"],
      note: "Loads only a bundle whose gate flag and checksums verify.",
    },
    {
      id: "blocked",
      label: "Gate failure",
      kind: "sink",
      col: 5,
      row: 2,
      note: "The run raises and stops. Nothing is registered, and nothing retries.",
    },
  ],
  edges: [
    { from: "data", to: "split", kind: "data" },
    { from: "split", to: "fit", kind: "data", label: "train only" },
    { from: "split", to: "transform", kind: "data", label: "held out" },
    { from: "fit", to: "transform", kind: "control", label: "fitted state" },
    { from: "fit", to: "train", kind: "data" },
    { from: "transform", to: "gate", kind: "data", label: "held-out matrices" },
    { from: "train", to: "gate", kind: "data", label: "candidate" },
    { from: "gate", to: "registry", kind: "data", label: "every check passes" },
    { from: "gate", to: "blocked", kind: "refused", label: "any check fails" },
    { from: "registry", to: "serve", kind: "data", label: "promote" },
    { from: "serve", to: "transform", kind: "feedback", label: "same transformers" },
  ],
};
