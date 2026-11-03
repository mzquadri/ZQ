import type { ProjectDiagram } from "./types";

/**
 * One capture, several derived forms, and verification that runs backwards.
 *
 * Drawn at exactly the level of abstraction the case study already publishes, and no deeper. The
 * boxes are kinds of component and the technologies are the ones the project's own registry entry
 * already names. There is no service name, no topic, no endpoint, no identifier and no quantity
 * here, and none may be added: this page is the public-safe account of employer work, and the
 * detail that would make the drawing more specific is exactly the detail that may not be shown.
 *
 * What the diagram contributes is the direction of the verification arrow, which is the whole
 * engineering idea and is hard to state in prose without sounding like a platitude. Derived
 * representations are projections of a stored version, and the obvious way to check them is to
 * re-derive and compare - which tests the derivation against itself. Here the check runs the other
 * way, from each stored result back to the captured bytes that are the evidence. That is why the
 * return edge reaches all the way to the capture rather than to the structuring step.
 *
 * The three signals stay three boxes' worth of one artifact because merging them into a single
 * health figure would be the failure the design exists to avoid: a store can be internally intact,
 * derived from a source that has since moved on, and disagree with its siblings, and those are
 * three different problems with three different responses.
 */
export const legalKnowledgeDiagram: ProjectDiagram = {
  slug: "legal-knowledge-platform",
  title: "Verification that runs back to the evidence",
  caption:
    "Re-deriving and comparing would test the derivation against itself. The check here runs backwards from each stored result to the captured bytes - and reports integrity, currentness and agreement as three signals rather than one.",
  accent: "var(--accent-retrieval)",
  nodes: [
    {
      id: "capture",
      label: "Captured document",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      tools: ["S3-compatible object storage"],
      note: "Exact bytes retained, immutable, as the evidence everything answers to.",
    },
    {
      id: "structure",
      label: "Stored atomically",
      kind: "gate",
      col: 1,
      row: 1,
      stages: [1],
      tools: ["PostgreSQL", "Apache Kafka"],
      note: "Ordered units, one version written whole - or nothing is written.",
    },
    {
      id: "vectors",
      label: "Vector representation",
      kind: "store",
      col: 2,
      row: 0,
      stages: [2],
      tools: ["Qdrant", "BGE-M3 embeddings"],
      note: "A projection of the stored version, not a second original.",
    },
    {
      id: "graph",
      label: "Reference graph",
      kind: "store",
      col: 2,
      row: 2,
      stages: [2],
      tools: ["Neo4j"],
      note: "The same version projected again, into references between units.",
    },
    {
      id: "verify",
      label: "Measured against evidence",
      kind: "gate",
      col: 3,
      row: 1,
      stages: [3],
      tools: ["Python", "Docker"],
      note: "Recording what was compared, not only whether it matched.",
    },
    {
      id: "signals",
      label: "Three separate signals",
      kind: "artifact",
      col: 4,
      row: 1,
      stages: [4],
      note: "Integrity, source currentness and cross-store agreement, never merged.",
    },
  ],
  edges: [
    { from: "capture", to: "structure", kind: "data" },
    { from: "structure", to: "vectors", kind: "data" },
    { from: "structure", to: "graph", kind: "data" },
    { from: "vectors", to: "verify", kind: "control" },
    { from: "graph", to: "verify", kind: "control" },
    { from: "verify", to: "signals", kind: "data" },
    { from: "verify", to: "capture", kind: "feedback", label: "back to the retained bytes" },
  ],
};
