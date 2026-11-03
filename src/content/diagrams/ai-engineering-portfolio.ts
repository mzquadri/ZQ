import type { ProjectDiagram } from "./types";

/**
 * A claim about authorship, and the measurement it is allowed to overrule.
 *
 * The repository's `tools/` directory is a set of generators and checkers - `gen_diagrams.py`,
 * `gen_drawio.py`, `export_png.py`, and alongside them `check_public.py`, `check_links.py`,
 * `check_stdlib_only.py`. The diagrams are generated and the publication rules are enforced, which
 * is the same arrangement this site's own diagrams use.
 *
 * The structural decision worth drawing is the direction of the arrow between the count and the
 * class. Commit share is measured rather than recalled, which makes it evidence; but it is not the
 * verdict, because a component someone else designed and you rewrote reads the same in a commit
 * log as one you designed. So the class is assigned from the count and may override it, and the
 * override is drawn going back to the measurement rather than quietly replacing it.
 *
 * The two closing artifacts are separate boxes on purpose. A decision record says why something
 * was done; the statement of what is not claimed says what the work does not entitle anyone to
 * conclude. Collapsing them would lose the second, which is the harder one to write.
 */
export const authorshipDiagram: ProjectDiagram = {
  slug: "ai-engineering-portfolio",
  title: "A measured share, and the class allowed to overrule it",
  caption:
    "Commit share is measured rather than recalled, which makes it evidence - but not the verdict. The return path is the override: where the count misleads about authorship, the class says so instead of deferring to it.",
  accent: "var(--accent-steel)",
  nodes: [
    {
      id: "workstreams",
      label: "Four workstreams",
      kind: "source",
      col: 0,
      row: 0,
      stages: [0],
      tools: ["diagrams.net", "Mermaid"],
      note: "One platform, drawn as the four streams of work across it.",
    },
    {
      id: "history",
      label: "Measured commit share",
      kind: "source",
      col: 0,
      row: 2,
      stages: [1],
      tools: ["Git"],
      note: "Counted per component rather than remembered.",
    },
    {
      id: "classes",
      label: "Authorship class",
      kind: "gate",
      col: 1,
      row: 1,
      stages: [2],
      note: "Four classes. The count informs them and does not decide them.",
    },
    {
      id: "decisions",
      label: "Decision records",
      kind: "artifact",
      col: 2,
      row: 0,
      stages: [3],
      tools: ["Markdown"],
      note: "Context, reason, trade-off and limitation, each written down.",
    },
    {
      id: "notclaimed",
      label: "What is not claimed",
      kind: "artifact",
      col: 2,
      row: 2,
      stages: [4],
      note: "Stated before anyone has to ask for it.",
    },
    {
      id: "published",
      label: "Published case studies",
      kind: "sink",
      col: 3,
      row: 1,
      tools: ["SVG"],
      note: "Generated, link-checked and screened for what may be shown.",
    },
  ],
  edges: [
    { from: "workstreams", to: "classes", kind: "data" },
    { from: "history", to: "classes", kind: "data", label: "evidence" },
    { from: "classes", to: "decisions", kind: "data" },
    { from: "classes", to: "notclaimed", kind: "data" },
    { from: "decisions", to: "published", kind: "data" },
    { from: "notclaimed", to: "published", kind: "control" },
    { from: "classes", to: "history", kind: "feedback", label: "overrides a misleading count" },
  ],
};
