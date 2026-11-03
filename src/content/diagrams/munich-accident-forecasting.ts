import type { ProjectDiagram } from "./types";

/**
 * One protocol, run twice, on purpose.
 *
 * `accidents/pipeline.py` sequences it and `accidents/robustness.py` is why the diagram forks:
 * the same protocol is run on the published window and again on a window three years earlier, and
 * the comparison between those two runs is the result. Drawing a single path and mentioning the
 * second run in a caption would lose the entire point, because the finding is not a number from
 * either run - it is that they disagree about the sign.
 *
 * The window selection is a gate because it is the decision that has to happen before anything is
 * scored, and `accidents/uncertainty.py` bootstraps both margins afterwards rather than either
 * one alone. The return path says what the project concluded: the published margin was a property
 * of a window whose baseline years contain a pandemic, so the choice of window was doing work the
 * model was being credited with.
 */
export const munichDiagram: ProjectDiagram = {
  slug: "munich-accident-forecasting",
  title: "The same protocol, run on two windows",
  caption:
    "The fork is the experiment. Running one protocol on the published window and on a pre-pandemic window produces margins that disagree about their sign, and the bootstrap is applied to both rather than to either alone.",
  accent: "var(--accent-graph)",
  nodes: [
    {
      id: "series",
      label: "Seven published series",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      tools: ["pandas"],
      note: "City open data, one model fitted per series.",
    },
    {
      id: "window",
      label: "Trend window chosen",
      kind: "gate",
      col: 1,
      row: 1,
      stages: [1],
      note: "Selected on two validation years, before anything is scored.",
    },
    {
      id: "score",
      label: "Refit and score once",
      kind: "process",
      col: 2,
      row: 1,
      stages: [2],
      tools: ["scikit-learn"],
      note: "On the two years after the ones that chose the window.",
    },
    {
      id: "published",
      label: "Published window",
      kind: "process",
      col: 3,
      row: 0,
      stages: [3],
      note: "The window the original 23.4% margin was measured on.",
    },
    {
      id: "earlier",
      label: "Pre-pandemic window",
      kind: "process",
      col: 3,
      row: 2,
      stages: [3],
      note: "The identical protocol, three years earlier.",
    },
    {
      id: "bootstrap",
      label: "Bootstrap both margins",
      kind: "gate",
      col: 4,
      row: 1,
      stages: [4],
      tools: ["pytest"],
      note: "Over held-out months, and applied to both runs rather than one.",
    },
    {
      id: "verdict",
      label: "Both margins at zero",
      kind: "artifact",
      col: 5,
      row: 1,
      note: "One stays clear of zero. The other crosses it, and that is the finding.",
    },
  ],
  edges: [
    { from: "series", to: "window", kind: "data" },
    { from: "window", to: "score", kind: "control" },
    { from: "score", to: "published", kind: "data" },
    { from: "score", to: "earlier", kind: "data", label: "same protocol" },
    { from: "published", to: "bootstrap", kind: "data" },
    { from: "earlier", to: "bootstrap", kind: "data" },
    { from: "bootstrap", to: "verdict", kind: "data" },
    { from: "verdict", to: "window", kind: "feedback", label: "the window was the result" },
  ],
};
