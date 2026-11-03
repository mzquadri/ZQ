import type { ProjectDiagram } from "./types";

/**
 * An exploratory analysis with something to be wrong about.
 *
 * `src/generate_data.py` and `src/eda_analysis.py` are the repository. Every number in the project
 * was invented, so nothing the analysis finds is evidence about weather - which raises the
 * question of what an exploratory analysis of invented data can honestly be held to.
 *
 * The answer is the return path, and the diagram is arranged so that it is the conclusion rather
 * than a footnote. Because the generator was configured with known parameters, every statistic the
 * analysis recovers has a correct value it can be compared against. So the recovery check is a
 * gate reading back to the generator, and the figures - four families of them - are a separate
 * branch that produces no verdict at all.
 *
 * The hemisphere reversal gets its own box because it is applied twice, once in the generator and
 * again in the seasonal comparison, and the second is the kind of correction that is easy to
 * forget and invisible when forgotten.
 */
export const weatherEdaDiagram: ProjectDiagram = {
  slug: "weather-eda",
  title: "Invented data, and the one thing it can still be checked against",
  caption:
    "Nothing here is evidence about weather. What it can be held to is its own generator: every recovered statistic has a configured value behind it, which is what the return path compares.",
  accent: "var(--accent-graph)",
  nodes: [
    {
      id: "generator",
      label: "Seeded generator",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      note: "21,900 daily records for six cities, at a fixed seed.",
    },
    {
      id: "hemisphere",
      label: "Seasons reversed",
      kind: "process",
      col: 1,
      row: 1,
      stages: [1],
      note: "For the southern cities - applied in the generator and again in the comparison.",
    },
    {
      id: "summary",
      label: "Per-city summary",
      kind: "store",
      col: 2,
      row: 1,
      stages: [2],
      tools: ["pandas"],
      note: "Tracked as an artefact rather than printed and lost.",
    },
    {
      id: "figures",
      label: "Four figure families",
      kind: "artifact",
      col: 3,
      row: 0,
      stages: [3, 4, 5, 6],
      tools: ["matplotlib", "seaborn"],
      note: "Distributions, seasonal comparisons, exceedance curves, correlations.",
    },
    {
      id: "recovery",
      label: "Recovered against configured",
      kind: "gate",
      col: 3,
      row: 2,
      stages: [7],
      tools: ["NumPy"],
      note: "Every statistic compared with the number it was generated from.",
    },
    {
      id: "verdict",
      label: "What the check caught",
      kind: "artifact",
      col: 4,
      row: 1,
      note: "Temperature scatters around zero. Humidity misses the same way in every city.",
    },
  ],
  edges: [
    { from: "generator", to: "hemisphere", kind: "data" },
    { from: "hemisphere", to: "summary", kind: "data" },
    { from: "summary", to: "figures", kind: "data" },
    { from: "summary", to: "recovery", kind: "control" },
    { from: "figures", to: "verdict", kind: "data" },
    { from: "recovery", to: "verdict", kind: "data" },
    { from: "recovery", to: "generator", kind: "feedback", label: "against the configured values" },
  ],
};
