import type { ProjectDiagram } from "./types";

/**
 * A translation whose success condition is an assertion, not a score.
 *
 * `model.py`, `train.py` and `check_parameters.py` are the repository. The shape worth drawing is
 * that the data is not re-derived: the split is exported by running the PyTorch side, and the
 * Keras side reads it. Two frameworks each constructing "the same" split is how a comparison
 * quietly stops being one.
 *
 * The parameter count is drawn as an artifact rather than as a step because of where it comes
 * from. It is derived by hand from the architecture, not read out of a framework summary - which
 * is the only version of that number that can disagree with both frameworks and be right.
 *
 * The return path is the point of the whole project. Four of the five differences between the
 * frameworks can be corrected for; the reduction order of the convolution kernels cannot, and no
 * amount of further work removes it. So it is drawn flowing back into the corrections as a
 * residue rather than forward as a conclusion: it is where the translation stops, not where it
 * fails.
 */
export const kerasPytorchDiagram: ProjectDiagram = {
  slug: "keras-pytorch-parity",
  title: "One split, two frameworks, and one difference that stays",
  caption:
    "The split is exported from the PyTorch run rather than rebuilt, so the two sides are provably reading the same data. Four framework differences are corrected for; the fifth is the floor.",
  accent: "var(--accent-pipeline)",
  nodes: [
    {
      id: "split",
      label: "Split exported",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      tools: ["NumPy"],
      note: "Produced by running torch. The other side reads it rather than rebuilding it.",
    },
    {
      id: "translate",
      label: "Architecture translated",
      kind: "process",
      col: 1,
      row: 1,
      stages: [1],
      tools: ["Keras"],
      note: "Rebuilt layer for layer in the second framework.",
    },
    {
      id: "byhand",
      label: "Count derived by hand",
      kind: "artifact",
      col: 2,
      row: 0,
      stages: [2],
      note: "From the architecture, not from either framework's summary.",
    },
    {
      id: "differences",
      label: "Differences corrected",
      kind: "process",
      col: 2,
      row: 2,
      stages: [3],
      tools: ["TensorFlow"],
      note: "Initialisers, epsilon, padding and ordering, each handled explicitly.",
    },
    {
      id: "assert",
      label: "Asserted every push",
      kind: "gate",
      col: 3,
      row: 1,
      stages: [4],
      tools: ["GitHub Actions"],
      note: "A silent change in either framework fails the build rather than the comparison.",
    },
    {
      id: "floor",
      label: "The irreducible one",
      kind: "artifact",
      col: 4,
      row: 1,
      note: "Kernel reduction order. Not a defect, and not removable.",
    },
  ],
  edges: [
    { from: "split", to: "translate", kind: "data" },
    { from: "translate", to: "byhand", kind: "control", label: "read off the design" },
    { from: "translate", to: "differences", kind: "data" },
    { from: "byhand", to: "assert", kind: "control", label: "expected count" },
    { from: "differences", to: "assert", kind: "data" },
    { from: "assert", to: "floor", kind: "data" },
    { from: "floor", to: "differences", kind: "feedback", label: "cannot be corrected for" },
  ],
};
