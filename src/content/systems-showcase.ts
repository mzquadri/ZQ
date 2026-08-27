/**
 * Copy and data for the public systems showcase.
 *
 * A synthetic teaching model of a problem that shows up in most data platforms: one source
 * becomes several representations, and keeping them honest is harder than building them. It
 * describes no real system, no employer, and no dataset — every quantity is illustrative and
 * labelled as such on the page.
 *
 * This file is deliberately separate from any case-study content. Shared geometry lives in
 * `scene-geometry.ts`; nothing is imported from a project's own copy in either direction.
 */

export const showcase = {
  eyebrow: "Engineering systems",
  title: "One source. Several representations. Independently checked.",
  introduction:
    "Most data platforms end up holding the same information more than once — as records, as vectors, as a graph. Each copy is useful, and each one can drift. This is an illustrative model of how I think about keeping them honest: what gets captured, what gets derived, what happens when the source changes, and what a check actually proves.",
  note: "Illustrative system model. Synthetic data throughout; it describes no particular system.",
} as const;

export interface ShowcaseRepresentation {
  id: "records" | "vectors" | "graph";
  role: string;
  name: string;
  holds: string;
  derivedFrom: string;
  checkedBy: string;
}

/** One capture, three derived views. The names are generic on purpose. */
export const representations: readonly ShowcaseRepresentation[] = [
  {
    id: "records",
    role: "Canonical",
    name: "Structured data",
    holds: "Ordered records with stable identities, and the relationships found in their fields.",
    derivedFrom: "The captured source, parsed once",
    checkedBy: "Reconstructing each record from the bytes it came from",
  },
  {
    id: "vectors",
    role: "Derived",
    name: "Vector space",
    holds: "One embedding per record, placed so that distance stands for similarity.",
    derivedFrom: "The structured records",
    checkedBy: "Comparing every point against the record it represents",
  },
  {
    id: "graph",
    role: "Derived",
    name: "Knowledge graph",
    holds: "A node per record and typed edges for the relationships between them.",
    derivedFrom: "The structured records",
    checkedBy: "Comparing the node and edge sets against the records",
  },
];

export interface CountColumn {
  store: string;
  total: string;
  detail: string;
}

/** The opening comparison: two sides that agree on a number and on nothing else. */
export const countIllustration: readonly CountColumn[] = [
  {
    store: "Records stored",
    total: "Twelve",
    detail: "Rows written by the ingestion path, each with its own identity.",
  },
  {
    store: "Vectors indexed",
    total: "Twelve",
    detail: "One embedding per record, written by the projection path.",
  },
];

export type Disposition = "retained" | "added" | "replaced" | "pruned";

export interface ChangeRule {
  change: string;
  outcome: string;
  disposition: Disposition;
  detail: string;
}

/** What an updated source does to what is already stored. A general data-engineering shape. */
export const changeRules: readonly ChangeRule[] = [
  {
    change: "Unchanged",
    outcome: "Retained",
    disposition: "retained",
    detail: "The record is identical to what is held, so it keeps its identity and everything derived from it.",
  },
  {
    change: "New",
    outcome: "Added",
    disposition: "added",
    detail: "A record the previous version did not contain is stored and projected into both derived views.",
  },
  {
    change: "Changed",
    outcome: "Replaced",
    disposition: "replaced",
    detail: "The record keeps its place and its content is replaced, along with its embedding and its edges.",
  },
  {
    change: "Removed",
    outcome: "Pruned",
    disposition: "pruned",
    detail: "The record leaves the current version. What is removed is its place in what is served, not the record that it existed.",
  },
];

export interface GenerationPlane {
  id: "history" | "previous" | "current";
  name: string;
  note: string;
}

/** Front to back is expressed in CSS; the order here is the order they are rendered in. */
export const generations: readonly GenerationPlane[] = [
  {
    id: "history",
    name: "Retained history",
    note: "What each earlier version was built from, kept exactly as captured.",
  },
  {
    id: "previous",
    name: "Previous state",
    note: "What was being served until the updated source arrived.",
  },
  {
    id: "current",
    name: "Current state",
    note: "What is served now, after converging on the update.",
  },
];

export interface GenerationRecord {
  id: string;
  label: string;
  disposition: Disposition;
  column: number;
}

/** Six records, one of each interesting outcome, in a fixed order. */
export const generationRecords: readonly GenerationRecord[] = [
  { id: "r1", label: "Record A", disposition: "retained", column: 0 },
  { id: "r2", label: "Record B", disposition: "replaced", column: 1 },
  { id: "r3", label: "Record C", disposition: "retained", column: 2 },
  { id: "r4", label: "Record D", disposition: "pruned", column: 3 },
  { id: "r5", label: "Record E", disposition: "retained", column: 4 },
  { id: "r6", label: "Record F", disposition: "added", column: 5 },
];

export interface CheckLevel {
  name: string;
  rulesOut: string;
  stillOpen: string;
}

/**
 * Comparisons, weakest first.
 *
 * Stated with what each settles and what it does not, because the failure this whole figure is
 * about is a strong-sounding result being read as a stronger claim than it makes.
 */
export const checkLevels: readonly CheckLevel[] = [
  {
    name: "Quantity",
    rulesOut: "A view that is obviously incomplete or obviously duplicated.",
    stillOpen: "Which records are present, and whether any of them says the right thing.",
  },
  {
    name: "Identity",
    rulesOut: "A substitution that preserves the total — one record removed, another added.",
    stillOpen: "Whether the content behind a correctly named identity matches its source.",
  },
  {
    name: "Content",
    rulesOut: "Stored text that does not reproduce the bytes it was captured from.",
    stillOpen: "Whether those bytes were the right thing to capture.",
  },
  {
    name: "Relationships",
    rulesOut: "An edge the current extraction no longer produces from the record it came from.",
    stillOpen: "Whether an edge that reproduces cleanly points at the right target.",
  },
  {
    name: "Provenance",
    rulesOut: "A version built by an undeclared pipeline, or by more than one of them.",
    stillOpen: "Whether declaring that pipeline was the correct decision.",
  },
];
