/**
 * Architecture case studies: publishing employer work without overclaiming it.
 *
 * This repository is the architecture half of the portfolio - diagrams and
 * written decisions covering four AI workstreams on one event-driven platform
 * at BP-ITCS. It is not official documentation of those systems, and internal
 * detail is generalised or omitted.
 *
 * What makes it worth a page of its own, rather than being folded into the
 * case studies it illustrates, is the discipline it is built around: every
 * component carries an authorship class, and the repository states in as many
 * words that a commit count is evidence of weight rather than of authorship -
 * two of its classifications deliberately disagree with the counts and say so
 * on the contribution diagram.
 *
 * The counts below are the repository's own, measured with `git shortlog`.
 * The diagram and slide totals are counted from the tree.
 */

export const repository = "https://github.com/mzquadri/ai-engineering-portfolio";

export const employer = "BP-ITCS";

export interface Component {
  readonly name: string;
  readonly mine: number;
  readonly total: number;
}

/**
 * The components the repository reports a commit share for.
 *
 * It does not report one for every component, so this is the subset that can
 * be drawn rather than the whole classification.
 */
export const counted: readonly Component[] = [
  { name: "Ingestion Preprocessor", mine: 466, total: 498 },
  { name: "Legal KB Dashboard", mine: 144, total: 167 },
  { name: "Legal KB Health Service", mine: 123, total: 148 },
  { name: "Ingestion Loader", mine: 77, total: 94 },
  { name: "RAG service", mine: 0, total: 56 },
];

export function sharePercent(c: Component): number {
  return (c.mine / c.total) * 100;
}

/** The four classes, strongest claim first. */
export const classes = [
  {
    key: "primary",
    label: "primary implementation",
    detail: "four services, each the majority of its history",
  },
  {
    key: "significant",
    label: "significant contribution",
    detail: "a service created, dual extraction, a shared library, the imaging prototype",
  },
  {
    key: "integration",
    label: "integration and shared",
    detail: "a colleague's feature inside a service of mine; bounded changes elsewhere",
  },
  {
    key: "existing",
    label: "existing platform",
    detail: "the Java entity platform, the compliance product, the RAG service, every third-party store",
  },
] as const;

/**
 * What the repository refuses to claim, in its own words. This list is the
 * reason the rest of it can be read at face value.
 */
export const notClaimed = [
  { key: "deploy", label: "no production deployment", detail: "the services ran as pods in Dev and QA; there is no production environment" },
  { key: "impact", label: "no business impact metrics", detail: "none exist in any repository" },
  { key: "certified", label: "no EU law certified", detail: "the parsers work; the assurance contract for them does not exist yet" },
  { key: "medical", label: "no clinical claim", detail: "the imaging work is a research prototype: no device, no clearance, no validation, no accuracy figure" },
] as const;

/** Counted from the tree rather than the prose. */
export const artefacts = {
  diagrams: 22,
  editableSources: 8,
  mermaid: 8,
  slides: 12,
  decisions: 11,
} as const;

/** The date the commit shares were measured. */
export const measuredOn = "12 September 2026";

export const workstreams = [
  "a verifiable legal knowledge base",
  "the insurance AI compliance product it serves",
  "document intelligence over insurance paperwork",
  "a medical-imaging prototype with explainability",
] as const;
