import type { ProjectDiagram } from "./types";

/**
 * A contamination audit off to one side, and one mean that hides ten numbers.
 *
 * Two parts of this repository are worth drawing and neither is the network. `src/model.py` is an
 * ordinary small CNN; drawing its layers would be a picture of a tutorial.
 *
 * The first is `src/audit.py`, which hashes image content and computes nearest-neighbour distances
 * between the test and training sets with horizontal flips included. It hangs off the data rather
 * than sitting in the flow because it does not feed training - it is a check on whether the test
 * set is a test set at all, run beside the pipeline rather than inside it.
 *
 * The second is the per-class split at the end. `src/benchmark.py` records `confusion_pairs`
 * alongside the headline accuracy, and the project's finding is that the headline is the mean of
 * ten numbers that range from 33.5% on cat to 82.0% on automobile. So the diagnostics are a
 * terminal artifact of their own rather than a line inside the evaluation box: the single number
 * and the ten numbers are different claims.
 *
 * The return edge is checkpoint selection. Validation chooses which trained state is kept, which
 * is the one place in the run where a measurement changes the model.
 */
export const cifarDiagram: ProjectDiagram = {
  slug: "cifar10-cnn",
  title: "A test set audited, and a mean pulled apart",
  caption:
    "The contamination audit sits beside the pipeline rather than in it - it asks whether the test set is one, not how the model does on it. The per-class diagnostics are separated from evaluation because one number and ten numbers are different claims.",
  accent: "var(--accent-vision)",
  nodes: [
    {
      id: "data",
      label: "CIFAR-10 subset",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      tools: ["torchvision"],
      note: "Seeded splits, fixed before anything is trained.",
    },
    {
      id: "audit",
      label: "Contamination audit",
      kind: "artifact",
      col: 1,
      row: 0,
      note: "Content hashes and nearest-neighbour distance, flips included.",
    },
    {
      id: "train",
      label: "CNN training",
      kind: "process",
      col: 1,
      row: 1,
      stages: [1],
      tools: ["PyTorch"],
      note: "A small convolutional network, trained from scratch.",
    },
    {
      id: "validation",
      label: "Validation selection",
      kind: "gate",
      col: 2,
      row: 1,
      stages: [2],
      note: "Where the kept checkpoint is chosen.",
    },
    {
      id: "test",
      label: "Test evaluation",
      kind: "process",
      col: 3,
      row: 1,
      stages: [3],
      tools: ["scikit-learn"],
      note: "One accuracy figure, and the confusion matrix behind it.",
    },
    {
      id: "perclass",
      label: "Class diagnostics",
      kind: "artifact",
      col: 4,
      row: 1,
      stages: [4],
      note: "Ten per-class figures, from 33.5% to 82.0%, under one mean.",
    },
  ],
  edges: [
    { from: "data", to: "audit", kind: "control", label: "hashed and searched" },
    { from: "data", to: "train", kind: "data" },
    { from: "train", to: "validation", kind: "data" },
    { from: "validation", to: "test", kind: "data" },
    { from: "test", to: "perclass", kind: "data" },
    { from: "validation", to: "train", kind: "feedback", label: "selects the checkpoint" },
  ],
};
