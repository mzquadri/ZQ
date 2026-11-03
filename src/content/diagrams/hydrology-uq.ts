import type { ProjectDiagram } from "./types";

/**
 * One calibrated model, disturbed twice.
 *
 * The repository is a sequence of assignments - calibration, local sensitivity, global
 * sensitivity, then input and output uncertainty - and the diagram keeps that order because the
 * finding depends on it. The two sensitivity analyses are drawn side by side rather than in
 * sequence because they disagree: which parameter matters most depends on whether you ask near
 * the optimum or across the whole space, and a diagram that chained them would imply one refines
 * the other.
 *
 * The uncertainty stage is a gate because it is where the project stops being a modelling
 * exercise. Two perturbations enter it and they are not symmetrical: disturbing the rainfall
 * barely moves a calibrated model, and disturbing the stage reading that the discharge was
 * inferred from moves it by orders of magnitude more. The return path is the attempted rescue -
 * refitting against every perturbed series recovers only a fraction of the loss and never wins,
 * which is why it is drawn going back to calibration and not forward to a result.
 */
export const hydrologyUqDiagram: ProjectDiagram = {
  slug: "hydrology-uq",
  title: "A calibrated model, and the two ways of disturbing it",
  caption:
    "The two sensitivity analyses sit side by side because they disagree about which parameter matters. The return path is the rescue that fails: recalibrating against the perturbed series recovers only part of the loss.",
  accent: "var(--accent-flow)",
  nodes: [
    {
      id: "hbv",
      label: "HBV baseline",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      note: "A conceptual rainfall-runoff model over one high-flow event.",
    },
    {
      id: "calibration",
      label: "Calibration",
      kind: "process",
      col: 1,
      row: 1,
      stages: [1],
      tools: ["SciPy (QMC sampling)"],
      note: "Eighteen parameters fitted until the hydrograph matches. The fit is not the problem.",
    },
    {
      id: "local",
      label: "Local sensitivity",
      kind: "process",
      col: 2,
      row: 0,
      stages: [2],
      note: "One parameter at a time, in the neighbourhood of the optimum.",
    },
    {
      id: "global",
      label: "Global sensitivity",
      kind: "process",
      col: 2,
      row: 2,
      stages: [3],
      tools: ["NumPy"],
      note: "Across the whole parameter space, which ranks them differently.",
    },
    {
      id: "perturb",
      label: "Perturb the inputs",
      kind: "gate",
      col: 3,
      row: 1,
      stages: [4],
      note: "The rainfall going in, and the stage the discharge was inferred from.",
    },
    {
      id: "verdict",
      label: "Two envelopes",
      kind: "artifact",
      col: 4,
      row: 1,
      tools: ["Matplotlib"],
      note: "One barely opens. The other swallows the calibrated run entirely.",
    },
  ],
  edges: [
    { from: "hbv", to: "calibration", kind: "data" },
    { from: "calibration", to: "local", kind: "data" },
    { from: "calibration", to: "global", kind: "data" },
    { from: "local", to: "perturb", kind: "control", label: "near the optimum" },
    { from: "global", to: "perturb", kind: "control", label: "across the space" },
    { from: "perturb", to: "verdict", kind: "data" },
    { from: "verdict", to: "calibration", kind: "feedback", label: "refitting does not recover it" },
  ],
};
