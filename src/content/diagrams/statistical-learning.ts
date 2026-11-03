import type { ProjectDiagram } from "./types";

/**
 * A derivation, checked twice by things that could not both be wrong the same way.
 *
 * `Assignment_3/solution/mlp.py` implements backpropagation from a hand derivation, and the two
 * checks beside it are drawn in parallel rather than in sequence because that is the entire value
 * of having two. Central differences test the gradient against the function it claims to
 * differentiate; autograd tests it against a completely separate implementation. A bug that
 * survives both is not a bug in the derivation.
 *
 * The baseline is a gate because of what it caught: the untouched configuration does not clear
 * the majority class, which means the first honest reading of the experiment is that the default
 * model is worse than guessing the commonest label.
 *
 * The return path is the project's closing judgement. There are sixty held-out points, and a
 * difference between two tuned runs has to be larger than what sixty points can resolve before it
 * is a difference at all - so the report reads back against the tuning rather than ranking it.
 */
export const statLearnDiagram: ProjectDiagram = {
  slug: "statistical-learning",
  title: "One derivation, two independent checks, sixty test points",
  caption:
    "The two gradient checks run in parallel because their value is in being unalike - one tests against the function, the other against a separate implementation. The return path is what sixty held-out points can and cannot resolve.",
  accent: "var(--accent-corpus)",
  nodes: [
    {
      id: "derived",
      label: "Gradients by hand",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      tools: ["NumPy"],
      note: "Backpropagation derived on paper, then implemented from the derivation.",
    },
    {
      id: "finitediff",
      label: "Central differences",
      kind: "gate",
      col: 1,
      row: 0,
      stages: [1],
      note: "Against the function it claims to differentiate.",
    },
    {
      id: "autograd",
      label: "Autograd",
      kind: "gate",
      col: 1,
      row: 2,
      stages: [1],
      tools: ["PyTorch"],
      note: "Against an entirely separate implementation.",
    },
    {
      id: "baseline",
      label: "Against the majority class",
      kind: "gate",
      col: 2,
      row: 1,
      stages: [2],
      note: "A wall the untouched configuration does not clear.",
    },
    {
      id: "tuning",
      label: "Sweep, then two searches",
      kind: "process",
      col: 3,
      row: 1,
      stages: [3],
      tools: ["scikit-learn"],
      note: "A learning-rate sweep, then two different tuners over the same space.",
    },
    {
      id: "report",
      label: "Written from the run",
      kind: "artifact",
      col: 4,
      row: 1,
      stages: [4],
      tools: ["Jupyter", "LaTeX"],
      note: "Every figure, table and quoted number emitted by the notebook itself.",
    },
  ],
  edges: [
    { from: "derived", to: "finitediff", kind: "control" },
    { from: "derived", to: "autograd", kind: "control" },
    { from: "finitediff", to: "baseline", kind: "data" },
    { from: "autograd", to: "baseline", kind: "data" },
    { from: "baseline", to: "tuning", kind: "data" },
    { from: "tuning", to: "report", kind: "data" },
    { from: "report", to: "tuning", kind: "feedback", label: "sixty points cannot resolve it" },
  ],
};
