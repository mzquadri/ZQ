import type { ProjectDiagram } from "./types";

/**
 * Three rows of a leaderboard that were not answering the same question.
 *
 * `src/experiment.py` and `src/baselines.py` are the whole of it: a seeded fifteen-year series, a
 * chronological holdout, a gradient-boosted model repeated over five seeds, and baselines that are
 * given exactly the information the model is given.
 *
 * The comparison is drawn as a gate because that is the step the project is about. A leaderboard
 * invites one reading - rank the rows - and the rows here differ in what they were told rather
 * than in how good they are. Scored one step ahead with yesterday's measurement supplied, simply
 * repeating yesterday's value is hard to beat, and the earlier run's headline number was a
 * property of that setup rather than of the model.
 *
 * So the return path goes to the holdout rather than to the model: what the split hands forward
 * decides the result, and changing the horizon changes which row wins.
 */
export const streamflowDiagram: ProjectDiagram = {
  slug: "streamflow-forecasting",
  title: "A leaderboard whose rows were asked different questions",
  caption:
    "The baselines are given exactly what the model is given, which is what makes the comparison a comparison. The return path is the finding: what the split hands forward decides the ranking more than the models do.",
  accent: "var(--accent-flow)",
  nodes: [
    {
      id: "series",
      label: "Synthetic series",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      tools: ["NumPy"],
      note: "Fifteen years from a seed. Not a measured river.",
    },
    {
      id: "holdout",
      label: "Chronological holdout",
      kind: "gate",
      col: 1,
      row: 1,
      stages: [1],
      note: "Split by date, and it decides what each row is told.",
    },
    {
      id: "model",
      label: "Five-seed repeat",
      kind: "process",
      col: 2,
      row: 0,
      stages: [3],
      tools: ["XGBoost"],
      note: "The same fit five times, so one seed cannot be the result.",
    },
    {
      id: "baselines",
      label: "Daily baselines",
      kind: "process",
      col: 2,
      row: 2,
      stages: [2],
      tools: ["statsmodels"],
      note: "Persistence and seasonal naive, given the same information.",
    },
    {
      id: "compare",
      label: "Same task?",
      kind: "gate",
      col: 3,
      row: 1,
      note: "One step ahead with yesterday's value supplied is a different question.",
    },
    {
      id: "errors",
      label: "Error analysis",
      kind: "artifact",
      col: 4,
      row: 1,
      stages: [4],
      tools: ["Matplotlib"],
      note: "Where the gap between the questions exceeds the gap between the models.",
    },
  ],
  edges: [
    { from: "series", to: "holdout", kind: "data" },
    { from: "holdout", to: "model", kind: "data" },
    { from: "holdout", to: "baselines", kind: "data", label: "the same inputs" },
    { from: "model", to: "compare", kind: "data" },
    { from: "baselines", to: "compare", kind: "data" },
    { from: "compare", to: "errors", kind: "data" },
    { from: "errors", to: "holdout", kind: "feedback", label: "the horizon was the question" },
  ],
};
