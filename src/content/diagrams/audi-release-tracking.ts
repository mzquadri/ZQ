import type { ProjectDiagram } from "./types";

/**
 * A form over a sheet, and the decision not to replace the sheet.
 *
 * The whole architecture is the loop. The data lives in a spreadsheet that was already in
 * everyone's hands, and the work did not move it anywhere - it put a form in front of it and
 * wrote back to the same cells. That is why the return path is drawn as the closing edge rather
 * than omitted: a tool that introduced a second copy of the data would have created a
 * reconciliation problem in exchange for solving a reading problem.
 *
 * The four frames are the actual contribution. The columns had accumulated in the order the sheet
 * had grown, which is not an order anyone reads in, so the form groups them by subject instead.
 * Nothing is computed here and nothing is modelled; the answer was always in the sheet, and the
 * cost was reading across a screen that did not fit on a screen, many times a day.
 *
 * Kept at the level of description the case study already publishes: a component is chosen from a
 * validated list and its row is located behind the form. No field names, no identifiers, no
 * quantities.
 */
export const audiReleaseDiagram: ProjectDiagram = {
  slug: "audi-release-tracking",
  title: "A form over the sheet, writing back to the sheet",
  caption:
    "The loop closes on the same cells it opened. Introducing a second copy of the data would have traded a reading problem for a reconciliation problem, so the sheet stays the record.",
  accent: "var(--accent-vision)",
  nodes: [
    {
      id: "sheet",
      label: "The existing sheet",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      note: "Too wide to read across, and already in everyone's hands.",
    },
    {
      id: "pick",
      label: "Component chosen",
      kind: "gate",
      col: 1,
      row: 1,
      stages: [1],
      tools: ["Data validation"],
      note: "From a validated list rather than typed in free text.",
    },
    {
      id: "lookup",
      label: "Row located",
      kind: "process",
      col: 2,
      row: 1,
      stages: [2],
      tools: ["Excel VBA"],
      note: "Behind the form, so nobody scrolls sideways to find it.",
    },
    {
      id: "frames",
      label: "Four frames",
      kind: "process",
      col: 3,
      row: 1,
      stages: [3],
      tools: ["UserForms"],
      note: "Grouped by subject instead of by the order the sheet grew in.",
    },
    {
      id: "writeback",
      label: "Written back",
      kind: "sink",
      col: 4,
      row: 1,
      stages: [4],
      tools: ["Event-driven programming"],
      note: "To the same cells. There is no second source of truth.",
    },
  ],
  edges: [
    { from: "sheet", to: "pick", kind: "data" },
    { from: "pick", to: "lookup", kind: "control" },
    { from: "lookup", to: "frames", kind: "data" },
    { from: "frames", to: "writeback", kind: "data" },
    { from: "writeback", to: "sheet", kind: "feedback", label: "the sheet stays the record" },
  ],
};
