import type { ProjectDiagram } from "./types";

/**
 * A reproducible report, drawn as the chain of commitments that makes it one.
 *
 * `R/fetch_eurostat.R`, `R/tidy_modal_split.R` and `report.qmd` are the whole repository, and
 * every box here is one of them doing one thing. What makes it worth a diagram is that this is a
 * project whose architecture *is* its claim: the finding is that nothing moved in twenty-four
 * years, and a null result is only worth reading if the path to it cannot have been chosen after
 * the fact.
 *
 * Two boxes are gates for that reason. The hash is recomputed in CI, so an upstream table that
 * changes under the report fails the build instead of silently restating a different number. And
 * the comparison year is selected by which countries actually report in it rather than by
 * recency - the one decision in the project with enough freedom to manufacture a trend, which is
 * why the return path runs back to it from the finding.
 *
 * The single render pass is not a convenience. Prose and figures come out of the same objects, so
 * the sentence and the chart cannot disagree about a number.
 */
export const eurostatDiagram: ProjectDiagram = {
  slug: "eurostat-modal-split",
  title: "The chain of commitments behind a null result",
  caption:
    "A finding of no change is only readable if the route to it was fixed in advance. The hash is recomputed in CI and the comparison year is chosen by coverage - the one decision free enough to manufacture a trend.",
  accent: "var(--accent-flow)",
  nodes: [
    {
      id: "response",
      label: "Committed response",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      tools: ["R"],
      note: "Retrieved once and committed, so the report has a fixed input.",
    },
    {
      id: "pinned",
      label: "Pinned by hash",
      kind: "gate",
      col: 1,
      row: 1,
      stages: [1],
      tools: ["GitHub Actions"],
      note: "Recomputed in CI. An upstream edit fails rather than slips through.",
    },
    {
      id: "decode",
      label: "JSON-stat decoded",
      kind: "process",
      col: 2,
      row: 1,
      stages: [2],
      tools: ["jsonlite"],
      note: "Dimension indices unpacked by hand rather than through a helper.",
    },
    {
      id: "coverage",
      label: "Year chosen by coverage",
      kind: "gate",
      col: 3,
      row: 1,
      stages: [3],
      note: "By which countries report it, not by which is most recent.",
    },
    {
      id: "render",
      label: "One render pass",
      kind: "process",
      col: 4,
      row: 1,
      stages: [4],
      tools: ["Quarto", "ggplot2"],
      note: "Prose and figures from the same objects, so they cannot disagree.",
    },
    {
      id: "finding",
      label: "Half a point",
      kind: "artifact",
      col: 5,
      row: 1,
      note: "82.0% to 82.5% across twenty-four years. The absence is the result.",
    },
  ],
  edges: [
    { from: "response", to: "pinned", kind: "data" },
    { from: "pinned", to: "decode", kind: "data" },
    { from: "decode", to: "coverage", kind: "data" },
    { from: "coverage", to: "render", kind: "control" },
    { from: "render", to: "finding", kind: "data" },
    { from: "finding", to: "coverage", kind: "feedback", label: "the one free choice" },
  ],
};
