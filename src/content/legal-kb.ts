/**
 * Figure content for the legal knowledge platform case study.
 *
 * Held here rather than inside the components for the same reason the systems graph keeps its
 * nodes in `systems-graph.ts`: the figures are about to gain motion, and the thing that animates
 * should not also be the thing that owns the words. It also puts every string this case study
 * renders in one reviewable place, which matters more than usual for employer work.
 *
 * Nothing in this file is measured. Quantities are illustrative and spelled as words so that a
 * reader cannot mistake an example for a result, and no entry carries corpus content, corpus
 * scale, an internal service name, or any other internal identifier.
 */

export interface CountColumn {
  store: string;
  total: string;
  detail: string;
}

/** The opening figure: two sides of a comparison that agree on a number and nothing else. */
export const countIllustration: readonly CountColumn[] = [
  {
    store: "Stored units",
    total: "Twelve",
    detail: "Ordered units parsed out of the published document and held in the relational store.",
  },
  {
    store: "Indexed vectors",
    total: "Twelve",
    detail: "One embedded record per stored unit, written into the vector store by the projection path.",
  },
];

export interface Representation {
  role: string;
  name: string;
  holds: string;
  writer: string;
  checkedAgainst: string;
}

/** One captured document, three derived representations, each with a single writer. */
export const representationFanOut: readonly Representation[] = [
  {
    role: "Canonical",
    name: "Relational representation",
    holds: "Ordered units, their versions, and the references extracted from their text.",
    writer: "Structure processor",
    checkedAgainst: "The captured source bytes",
  },
  {
    role: "Derived",
    name: "Vector representation",
    holds: "One embedded record per active unit, addressable by a deterministic identity.",
    writer: "Projection service",
    checkedAgainst: "The relational representation, record by record",
  },
  {
    role: "Derived",
    name: "Reference graph",
    holds: "A node per active unit and typed edges for the references between them.",
    writer: "Projection service",
    checkedAgainst: "The relational representation, node and edge set",
  },
];

export interface ConvergenceRule {
  change: string;
  outcome: string;
  disposition: "retained" | "added" | "replaced" | "pruned";
  detail: string;
}

/** What an amended source does to each unit already stored. */
export const convergenceRules: readonly ConvergenceRule[] = [
  {
    change: "Unchanged",
    outcome: "Retained",
    disposition: "retained",
    detail: "The unit is identical to what is stored, so it keeps its identity and its derived records.",
  },
  {
    change: "New",
    outcome: "Added",
    disposition: "added",
    detail: "A unit the previous version did not contain is stored and projected into both derived stores.",
  },
  {
    change: "Changed",
    outcome: "Replaced",
    disposition: "replaced",
    detail: "The unit keeps its place in the document and its content is replaced, along with everything derived from it.",
  },
  {
    change: "Removed",
    outcome: "Pruned from current state",
    disposition: "pruned",
    detail: "The unit leaves the current version. What is removed is its place in what is served, not the evidence it existed.",
  },
];

export interface LadderRung {
  name: string;
  rulesOut: string;
  stillOpen: string;
}

/**
 * Evidence classes, weakest first.
 *
 * Each rung is stated with what it settles and what it does not, because the failure this whole
 * case study is about is a strong-sounding result being read as a stronger claim than it makes.
 */
export const confidenceLadder: readonly LadderRung[] = [
  {
    name: "Quantity",
    rulesOut: "A representation that is obviously incomplete or obviously duplicated.",
    stillOpen: "Which records are present, and whether any of them says the right thing.",
  },
  {
    name: "Identity",
    rulesOut: "A substitution that preserves the total, such as one unit removed and another added.",
    stillOpen: "Whether the content behind a correctly named identity matches its source.",
  },
  {
    name: "Content fidelity",
    rulesOut: "Stored text that does not reconstruct the captured bytes exactly, including whitespace and special characters.",
    stillOpen: "Whether the captured bytes were the right publication to capture.",
  },
  {
    name: "Reference fidelity",
    rulesOut: "A stored reference that the current extractor does not reproduce from the passage it came from.",
    stillOpen: "Whether a reference that reproduces cleanly points at the correct target.",
  },
  {
    name: "Structure",
    rulesOut: "A served unit that does not correspond one-to-one, and in order, with a unit of the source.",
    stillOpen: "Whether the source's own structure is a faithful record of the document it publishes.",
  },
  {
    name: "Provenance",
    rulesOut: "A version built by an undeclared processing profile, or by more than one of them.",
    stillOpen: "Whether declaring that profile was the correct decision.",
  },
  {
    name: "Currentness",
    rulesOut: "A stored version whose publisher has since served something different.",
    stillOpen: "Anything that happened between observations. A pass has an age.",
  },
];

export interface VerificationState {
  name: string;
  means: string;
  tone: "measured" | "current" | "unsupported" | "stale" | "failed";
}

/** The distinctions the reporting layer refuses to collapse into a single status. */
export const verificationStates: readonly VerificationState[] = [
  {
    name: "Measured",
    means: "Every applicable check ran and passed against the stored version.",
    tone: "measured",
  },
  {
    name: "Verified and current",
    means: "Measured, and the published source was confirmed unchanged within its recency window.",
    tone: "current",
  },
  {
    name: "Unsupported",
    means: "A check could not run because the evidence it needs does not exist, and it recorded why.",
    tone: "unsupported",
  },
  {
    name: "Stale",
    means: "A recorded result is older than its recency window. The result stands; its age is annotated.",
    tone: "stale",
  },
  {
    name: "Failed",
    means: "A check ran, reached the data, and disagreed with it. This is the only one that reports a defect.",
    tone: "failed",
  },
];
