/**
 * A synthetic model of a reliable knowledge system.
 *
 * Unlike every other world on this site, nothing in this file is generated from a repository. It
 * was written by hand, one string at a time, from a classification pass over private employer work:
 * each detail was sorted into public, safe-to-abstract, or private, and only the middle category
 * reached this file. Where a judgement was close, it was treated as private.
 *
 * What that means concretely. The engineering *principles* below are real and are the reason the
 * work was interesting. The *system* they describe is not: there are no service names, no store
 * technologies, no table or column names, no endpoints, no hostnames, no identifiers, no counts of
 * anything that exists in production, and no domain vocabulary that would identify the subject matter. The
 * quantities are small deliberately - twelve records, twenty-four points, a nine-node graph - and
 * they are chosen to be legible on a screen rather than to imply any deployed scale.
 *
 * A reader should finish this able to describe the class of problem and the shape of a solution,
 * and unable to describe anybody's system.
 */

export const disclosure = {
  short: "Illustrative model. Synthetic throughout.",
  long:
    "An illustrative model of a class of problem, not a description of any deployed system. Every quantity is synthetic and chosen for legibility. No architecture, technology, identifier, or scale from any employer system appears anywhere in it.",
} as const;

/**
 * The four things a system like this has to be able to say about itself.
 *
 * These are the invariant classes, stated abstractly. A single green light is not an answer to any
 * of them, which is the point: health is a conjunction, and it is only useful if you can see which
 * term failed.
 */
export const invariants = [
  {
    key: "present",
    label: "Present",
    question: "Is the captured evidence still there, byte for byte?",
    note: "The one thing that cannot be rebuilt from anything else.",
  },
  {
    key: "complete",
    label: "Complete",
    question: "Does everything that should have been derived actually exist?",
    note: "A partial build looks healthy from any single store.",
  },
  {
    key: "consistent",
    label: "Consistent",
    question: "Do the derived representations still agree with the authoritative record?",
    note: "Each one can drift on its own schedule.",
  },
  {
    key: "current",
    label: "Current",
    question: "Is the upstream source still saying what we captured?",
    note: "Nothing local changes when an external source does.",
  },
] as const;

/**
 * One capture, three derived views.
 *
 * The distinction the whole model turns on: these are not pipeline stages in sequence. They are
 * four simultaneous descriptions of the same underlying thing, and three of the four are
 * disposable.
 */
export const representations = [
  {
    key: "evidence",
    label: "Captured evidence",
    kind: "immutable",
    holds: "Exactly what was received, and a fingerprint taken at the moment of capture.",
    rebuildable: false,
    note: "Not an interpretation. It is what makes the other three checkable.",
  },
  {
    key: "structured",
    label: "Structured records",
    kind: "derived",
    holds: "Ordered records with stable identities and explicit fields.",
    rebuildable: true,
    note: "Explicit state: you can ask it what it holds and get an exact answer.",
  },
  {
    key: "semantic",
    label: "Semantic index",
    kind: "derived",
    holds: "Passages placed in a space where distance stands for similarity.",
    rebuildable: true,
    note: "Similarity-based access, at the cost of being unable to answer exactly.",
  },
  {
    key: "relational",
    label: "Relationship graph",
    kind: "derived",
    holds: "Entities and the connections between them.",
    rebuildable: true,
    note: "Keeps structure that flat records flatten away.",
  },
] as const;

/**
 * The principles that made this work worth doing, stated so they apply to any system of this shape.
 *
 * Each of these was learned by building something that did not have it.
 */
export const principles = [
  {
    label: "One writer per piece of state",
    note: "If two components can write the same thing, neither can be held to it, and no check over it means anything.",
  },
  {
    label: "Whatever measures is not whatever reports",
    note: "A service that runs the checks and also publishes the verdict is marking its own homework. The reporting layer reads results it did not produce.",
  },
  {
    label: "The reporting layer writes nothing it reports on",
    note: "It reads every representation and owns none of them, so looking at the system cannot change it.",
  },
  {
    label: "Nothing runs on a timer",
    note: "Every action begins with a person deciding to take it. A schedule hides the moment a decision was made.",
  },
  {
    label: "Derived state is disposable; captured evidence is not",
    note: "Anything that can be rebuilt from evidence should be rebuildable on demand, and anything that cannot be rebuilt must never be overwritten.",
  },
] as const;

/** What an operator can actually do, and what each action is allowed to touch. */
export const actions = [
  {
    key: "verify",
    label: "Verify",
    effect: "Re-runs the checks and refreshes the verdicts. Writes no content.",
  },
  {
    key: "rebuild",
    label: "Rebuild",
    effect: "Discards the derived representations for one item and reconstructs them from captured evidence.",
  },
] as const;

/**
 * How this kind of system goes wrong. Classes, not incidents.
 *
 * None of these describes anything that happened anywhere. They are the failure modes the design
 * exists to make visible, which is a different claim from having observed them.
 */
export const failureModes = [
  { label: "Stale derived state", note: "A representation was built from an earlier version and never rebuilt." },
  { label: "Incomplete derivation", note: "A build stopped part-way and left a representation that looks whole." },
  { label: "Silent divergence", note: "Two representations disagree and nothing compares them." },
  { label: "Upstream change", note: "The source changed after capture, so what is held is correct and no longer current." },
] as const;

/** What this page is not, stated plainly because confidentiality is the reason it is abstract. */
export const boundaries = [
  { label: "Not a deployment topology", note: "No service, store, queue, or interface from any real system appears here." },
  { label: "No production scale", note: "Every quantity is chosen to be legible on a screen and implies nothing about any deployment." },
  { label: "No internal data", note: "No content, identifier, schema, or fingerprint from any employer system is used or reproduced." },
  { label: "A class of problem", note: "The engineering principles are real. The machine that illustrates them is invented for this page." },
] as const;

/**
 * The verified public-safe part of what I worked on.
 *
 * Established from commit authorship rather than memory, and stated as problem classes rather than
 * as components. Work I did not do is not listed here: the retrieval service in that system was
 * built by someone else and is not claimed.
 */
export const contribution = [
  "Operator-facing health and status: turning a set of invariants into a verdict someone can act on, including which term failed.",
  "Cross-representation reconciliation: comparing derived representations against the authoritative record rather than trusting each in isolation.",
  "Source currency checking: detecting when an upstream source has moved on from what was captured.",
  "Rebuild workflows: discarding and reconstructing derived state from captured evidence, as an operator action rather than a scheduled job.",
  "Extraction and entity work upstream of all of it, on a smaller share of the code.",
] as const;

/** Synthetic geometry. Small, deterministic, and legible; not a model of any deployment. */
export const scale = {
  records: 12,
  vectorPoints: 24,
  graphNodes: 9,
  graphEdges: 12,
} as const;
