import type { ProjectDiagram } from "./types";

/**
 * A system that is reluctant to discard, and the two places it cannot avoid it.
 *
 * `api/app/enrich/` holds the per-dimension readers - employment, equivalence, language,
 * location - behind adapters that speak to one applicant-tracking system each.
 *
 * The design position the diagram is drawn around is that a job advert is usually a wish list
 * rather than a minimum, so a tool that filters on it throws away things its user would want. The
 * ranking is therefore the main path and discarding is the narrow exception: a posting leaves only
 * where the opportunity does not exist or is not this profession at all.
 *
 * Which leaves the problem the project is actually about. Two requirements really are
 * disqualifying, and a weighted term cannot express that - no weight makes "not available" a
 * matter of degree. So flat penalties are applied, and the return path records what the figure
 * shows: those penalties are longer than the weighted terms they sit beside, which is how you can
 * see the weighted average had run out of room.
 *
 * Nothing silently vanishes at the end. Every deduction is named on the job rather than used to
 * remove it, which is why the last box is a posting with its reasons attached rather than a
 * filtered list.
 */
export const jobhunterDiagram: ProjectDiagram = {
  slug: "jobhunter",
  title: "Rank rather than filter, and name every deduction",
  caption:
    "Discarding is the narrow exception and ranking is the main path, because an advert is a wish list rather than a minimum. The return edge is where the weighted average ran out of room.",
  accent: "var(--accent-systems)",
  nodes: [
    {
      id: "adapters",
      label: "Nine adapters",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      tools: ["Python"],
      note: "One per applicant-tracking system, read directly rather than scraped generically.",
    },
    {
      id: "discard",
      label: "Discard, narrowly",
      kind: "gate",
      col: 1,
      row: 1,
      stages: [1],
      note: "Only where the opportunity does not exist, or is not this profession.",
    },
    {
      id: "dropped",
      label: "Not a posting",
      kind: "sink",
      col: 1,
      row: 3,
      note: "The only thing removed outright rather than ranked down.",
    },
    {
      id: "store",
      label: "Postings",
      kind: "store",
      col: 2,
      row: 0,
      tools: ["PostgreSQL"],
      note: "Kept with their enrichment, so a score can be recomputed.",
    },
    {
      id: "score",
      label: "Weighted sum",
      kind: "process",
      col: 2,
      row: 1,
      stages: [2],
      tools: ["YAML"],
      note: "Seven components, with the weights held in configuration.",
    },
    {
      id: "penalties",
      label: "Flat penalties",
      kind: "gate",
      col: 3,
      row: 1,
      stages: [3],
      note: "For the two requirements no weight can express as a matter of degree.",
    },
    {
      id: "shown",
      label: "Shown with its reasons",
      kind: "sink",
      col: 4,
      row: 1,
      stages: [4],
      tools: ["TypeScript", "React"],
      note: "Every deduction named on the job rather than used to remove it.",
    },
  ],
  edges: [
    { from: "adapters", to: "discard", kind: "data" },
    { from: "discard", to: "dropped", kind: "refused", label: "not an opportunity" },
    { from: "discard", to: "store", kind: "data", label: "kept" },
    { from: "store", to: "score", kind: "data" },
    { from: "score", to: "penalties", kind: "data" },
    { from: "penalties", to: "shown", kind: "data" },
    { from: "penalties", to: "score", kind: "feedback", label: "longer than the terms beside them" },
  ],
};
