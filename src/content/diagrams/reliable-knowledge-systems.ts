import type { ProjectDiagram } from "./types";

/**
 * One capture, three derived forms, and a check that runs backwards from each.
 *
 * Synthetic throughout, like the page it sits on. It carries no `tools` and no `stages` for the
 * same reason `medico.ts` does - this work is not in the project registry, so neither field could
 * be checked by `validate:content`, and an unvalidated claim is worse than an absent one. It is
 * doubly important here: this is the public-safe model of employer work, and naming technologies
 * on it would be asserting detail about a deployed system that this page exists not to assert.
 *
 * The idea is the direction of the arrows at the right-hand side. Three representations are
 * derived from one captured source, and days later any of them may have stopped telling the truth
 * about it. Checking them against each other finds disagreement without saying who is wrong;
 * checking them by re-deriving tests the derivation against itself. So verification runs from each
 * derived form back to the capture, and what follows from a failure is a rebuild from the
 * evidence rather than a patch to the form that drifted.
 *
 * That rebuild edge returning to the derivation is the point of the whole drawing: the system's
 * answer to a derived representation being wrong is to make it again, not to correct it in place.
 */
export const reliableKnowledgeDiagram: ProjectDiagram = {
  slug: "reliable-knowledge-systems",
  title: "Three derived forms, each checked against the capture",
  caption:
    "Checking the derived forms against each other finds disagreement without identifying who is wrong; re-deriving tests the derivation against itself. Verification here runs backwards to the evidence, and a failure is rebuilt rather than patched.",
  accent: "var(--accent-retrieval)",
  nodes: [
    {
      id: "capture",
      label: "Captured source",
      kind: "source",
      col: 0,
      row: 1,
      note: "Illustrative throughout. The retained bytes are the evidence.",
    },
    {
      id: "derive",
      label: "Derived three ways",
      kind: "process",
      col: 1,
      row: 1,
      note: "One capture projected into three representations with different jobs.",
    },
    {
      id: "index",
      label: "Index",
      kind: "store",
      col: 2,
      row: 0,
      note: "For finding a unit without reading everything.",
    },
    {
      id: "graph",
      label: "Graph",
      kind: "store",
      col: 2,
      row: 1,
      note: "For following references between units.",
    },
    {
      id: "cache",
      label: "Cache",
      kind: "store",
      col: 2,
      row: 2,
      note: "For answering the same question again cheaply.",
    },
    {
      id: "verify",
      label: "Checked backwards",
      kind: "gate",
      col: 3,
      row: 1,
      note: "From each derived form to the evidence, not forward from it.",
    },
    {
      id: "rebuild",
      label: "Rebuilt from evidence",
      kind: "sink",
      col: 4,
      row: 1,
      note: "A form that has drifted is made again rather than corrected in place.",
    },
  ],
  edges: [
    { from: "capture", to: "derive", kind: "data" },
    { from: "derive", to: "index", kind: "data" },
    { from: "derive", to: "graph", kind: "data" },
    { from: "derive", to: "cache", kind: "data" },
    { from: "index", to: "verify", kind: "control" },
    { from: "graph", to: "verify", kind: "control" },
    { from: "cache", to: "verify", kind: "control" },
    { from: "verify", to: "rebuild", kind: "data", label: "on disagreement" },
    { from: "verify", to: "capture", kind: "feedback", label: "against the retained bytes" },
    { from: "rebuild", to: "derive", kind: "feedback", label: "made again, not patched" },
  ],
};
