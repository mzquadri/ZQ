import type { ProjectDiagram } from "./types";

/**
 * A surrogate that is allowed to decline.
 *
 * The left half is the substitution the thesis is about: an agent-based simulation that takes
 * hours is replaced by a graph network that answers in milliseconds, over a road network that is
 * held fixed so that what varies between scenarios is demand rather than topology.
 *
 * The right half is the part that makes it usable, and it is the reason this is drawn as a gate
 * rather than as a pipeline ending in a prediction. A surrogate that is fast and silently wrong is
 * worse than a simulation that is slow, so the uncertainty estimate is not an output beside the
 * prediction - it is the input to a policy that decides whether the prediction is answered at all.
 *
 * The return path is calibration, and it is the claim the whole thing rests on. A stated
 * uncertainty is only worth anything if it matches the error actually observed against simulated
 * truth, so the policy is checked back against the scenarios rather than trusted on its own.
 */
export const transportUqDiagram: ProjectDiagram = {
  slug: "transport-uq",
  title: "A fast answer, and the policy that decides whether to give it",
  caption:
    "The uncertainty estimate is not a figure printed beside the prediction - it is what the review policy reads. The return path is calibration: a stated uncertainty means nothing until it is checked against error observed on simulated truth.",
  accent: "var(--accent-graph)",
  nodes: [
    {
      id: "matsim",
      label: "Policy scenarios",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      note: "Agent-based simulation runs. Hours each, which is the problem.",
    },
    {
      id: "graph",
      label: "Road-link graph",
      kind: "process",
      col: 1,
      row: 1,
      stages: [1],
      tools: ["NumPy"],
      note: "Links as nodes. The network is fixed; the demand on it is not.",
    },
    {
      id: "surrogate",
      label: "Graph surrogate",
      kind: "process",
      col: 2,
      row: 1,
      stages: [2],
      tools: ["PyTorch", "PyTorch Geometric"],
      note: "PointNet encoder, TransformerConv and GAT layers.",
    },
    {
      id: "uncertainty",
      label: "Uncertainty estimate",
      kind: "process",
      col: 3,
      row: 1,
      stages: [3],
      note: "How unsure the surrogate is, per junction, not per run.",
    },
    {
      id: "policy",
      label: "Review policy",
      kind: "gate",
      col: 4,
      row: 1,
      stages: [4],
      note: "Reads the uncertainty and decides whether to answer at all.",
    },
    {
      id: "answered",
      label: "Answered directly",
      kind: "sink",
      col: 5,
      row: 0,
      tools: ["Streamlit"],
      note: "Milliseconds instead of hours, where the estimate supports it.",
    },
    {
      id: "deferred",
      label: "Held for review",
      kind: "sink",
      col: 5,
      row: 2,
      note: "The predictions the policy declines to make on its own.",
    },
  ],
  edges: [
    { from: "matsim", to: "graph", kind: "data" },
    { from: "graph", to: "surrogate", kind: "data" },
    { from: "surrogate", to: "uncertainty", kind: "data" },
    { from: "uncertainty", to: "policy", kind: "control" },
    { from: "policy", to: "answered", kind: "data", label: "confident enough" },
    { from: "policy", to: "deferred", kind: "refused", label: "not confident enough" },
    { from: "policy", to: "matsim", kind: "feedback", label: "calibrated against simulated truth" },
  ],
};
