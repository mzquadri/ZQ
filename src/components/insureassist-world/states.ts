import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * The InsureAssist sequence.
 *
 * A document-intelligence machine taken apart in the order the system actually processes a
 * question: three forms, the wording they share, how they are cut up, how a chunk keeps hold of
 * which form it came from, the space the chunks are searched in, a real question, the failure that
 * makes this corpus hard, the two retrievers that fix part of it, the evidence coming back, the
 * generator, and the boundaries.
 *
 * The middle is the point. Most of a RAG sequence is machinery anyone could draw; the part worth
 * five states is that three federal forms share word-for-word wording, so a retriever can find the
 * right provision in the wrong document, and the whole architecture exists to reduce that.
 */

export type InsureKey =
  | "corpus"
  | "duplication"
  | "chunking"
  | "identity"
  | "embedding"
  | "query"
  | "wrongform"
  | "fusion"
  | "evidence"
  | "generation"
  | "limits";

export const STATES: readonly WorldState<InsureKey>[] = [
  {
    key: "corpus",
    from: 0.0,
    to: 0.08,
    label: "Three forms",
    caption: "The NFIP Standard Flood Insurance Policy, as three federal forms. Redistributable: works of the US Government.",
  },
  {
    key: "duplication",
    from: 0.08,
    to: 0.17,
    label: "Shared wording",
    caption: "They share a skeleton and a great deal of word-for-word text, and differ in substance.",
  },
  {
    key: "chunking",
    from: 0.17,
    to: 0.26,
    label: "Chunking",
    caption: "800 characters, 120 of overlap, deterministic. The corpus becomes 314 chunks.",
  },
  {
    key: "identity",
    from: 0.26,
    to: 0.35,
    label: "Provenance",
    caption: "The document ID goes inside the chunk hash. Hashing text alone would collide across forms and merge them.",
  },
  {
    key: "embedding",
    from: 0.35,
    to: 0.45,
    label: "Vector space",
    caption: "Every chunk becomes a 384-dimensional point. Colour is the form it came from; position is meaning.",
  },
  {
    key: "query",
    from: 0.45,
    to: 0.55,
    label: "A question arrives",
    caption: "Cosine search returns the twenty nearest passages, ranked.",
  },
  {
    key: "wrongform",
    from: 0.55,
    to: 0.68,
    label: "The wrong form",
    caption: "Right provision. Wrong document. Eight of eighteen held-out questions put the wrong form at rank one.",
  },
  {
    key: "fusion",
    from: 0.68,
    to: 0.79,
    label: "Two retrievers",
    caption: "Dense and lexical disagree, and each finds questions the other misses. Rank fusion reads positions, not scores.",
  },
  {
    key: "evidence",
    from: 0.79,
    to: 0.87,
    label: "Evidence",
    caption: "Five chunks return to their forms, each carrying a citation and character offsets.",
  },
  {
    key: "generation",
    from: 0.87,
    to: 0.94,
    label: "Generation",
    caption: "A local model answers from the retrieved context only - and never declines to answer.",
  },
  {
    key: "limits",
    from: 0.94,
    to: 1.0,
    label: "Where it stops",
    caption: "Twenty-two held-out questions, one jurisdiction, one peril. The evidence is narrow and says so.",
  },
];

export const { at, active } = choreograph(STATES);

/**
 * The camera, one keyframe per state.
 *
 * Its own language again. The transport world orbits a city from above and the medico world stands
 * square in front of a lightbox; this one starts looking down at documents on a desk, dives to
 * their level as they come apart, pulls back and around while the chunks are out in vector space,
 * then returns to the forms when the evidence does. The viewer travels through the system rather
 * than watching it from one chair.
 */
export const SHOTS: Record<InsureKey, { height: number; distance: number; look: number; yaw: number }> = {
  corpus: { height: 5.6, distance: 8.8, look: 0.2, yaw: -0.2 },
  duplication: { height: 4.0, distance: 9.4, look: 0.3, yaw: -0.44 },
  chunking: { height: 2.6, distance: 7.6, look: 0.2, yaw: -0.6 },
  identity: { height: 1.4, distance: 5.6, look: 0.35, yaw: -0.5 },
  embedding: { height: 2.2, distance: 11.2, look: 0.4, yaw: -0.9 },
  query: { height: 1.6, distance: 9.6, look: 0.4, yaw: -1.15 },
  wrongform: { height: 1.2, distance: 8.6, look: 0.35, yaw: -1.45 },
  fusion: { height: 2.8, distance: 10.6, look: 0.3, yaw: -1.75 },
  evidence: { height: 2.0, distance: 8.8, look: 0.2, yaw: -2.05 },
  generation: { height: 1.4, distance: 7.8, look: 0.15, yaw: -2.25 },
  limits: { height: 4.6, distance: 10.4, look: 0.0, yaw: -2.4 },
};
