import type { ProjectDiagram } from "./types";

/**
 * A result read against a ceiling that is known rather than guessed.
 *
 * The unusual thing about this repository is `src/generate_data.py`, and the diagram is arranged
 * around it. Because the series is built rather than observed, how much of it is signal and how
 * much is independent noise is known exactly - which means there is a hard upper bound on what any
 * model could score, and the honest form of the result is the distance to that bound rather than
 * the score itself.
 *
 * So the composition hangs off the generator as an artifact, and the return path runs from the
 * final reading back to it. That is the direction the argument actually travels: the gap of 0.019
 * between the network and a calendar baseline is only interpretable once you know what the
 * remaining headroom was.
 *
 * `Scored once` is a gate because `scripts/check_reference_run.py` exists to hold it there. A
 * model re-scored until the number improves has been tuned on its test set, whatever the commit
 * message says.
 */
export const floodLstmDiagram: ProjectDiagram = {
  slug: "flood-lstm",
  title: "A gap of 0.019, read against a ceiling that is known",
  caption:
    "Because the series was generated, the noise ceiling is known exactly rather than estimated - so the result is the distance to it, not the score. The return path is where that reading happens.",
  accent: "var(--accent-flow)",
  nodes: [
    {
      id: "generator",
      label: "Twenty years, seeded",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      tools: ["NumPy"],
      note: "Fixed seed, so the series is reproducible and its parts are known.",
    },
    {
      id: "composition",
      label: "Signal composition",
      kind: "artifact",
      col: 1,
      row: 0,
      stages: [1],
      note: "How much is structure and how much is independent noise.",
    },
    {
      id: "split",
      label: "Chronological split",
      kind: "gate",
      col: 1,
      row: 1,
      stages: [2],
      tools: ["pandas"],
      note: "Scalers fitted on the training span only.",
    },
    {
      id: "network",
      label: "Recurrent network",
      kind: "process",
      col: 2,
      row: 0,
      stages: [3],
      tools: ["PyTorch"],
      note: "Reads a window of weather.",
    },
    {
      id: "baselines",
      label: "Three baselines",
      kind: "process",
      col: 2,
      row: 2,
      stages: [3],
      note: "Including a calendar, which reads no weather at all.",
    },
    {
      id: "scored",
      label: "Scored once",
      kind: "gate",
      col: 3,
      row: 1,
      note: "A reference run is committed, so a second attempt would show.",
    },
    {
      id: "ceiling",
      label: "Gap to the ceiling",
      kind: "artifact",
      col: 4,
      row: 1,
      stages: [4],
      tools: ["Matplotlib"],
      note: "An axis from nothing to the limit the noise imposes, not truncated.",
    },
  ],
  edges: [
    { from: "generator", to: "composition", kind: "control", label: "known exactly" },
    { from: "generator", to: "split", kind: "data" },
    { from: "split", to: "network", kind: "data" },
    { from: "split", to: "baselines", kind: "data" },
    { from: "network", to: "scored", kind: "data" },
    { from: "baselines", to: "scored", kind: "data" },
    { from: "scored", to: "ceiling", kind: "data" },
    { from: "ceiling", to: "composition", kind: "feedback", label: "read against the implied limit" },
  ],
};
