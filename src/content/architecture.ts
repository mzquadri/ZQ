import { site } from "./truth";

/*
 * The architecture case studies.
 *
 * These live in a separate public repository and static site. They are not restated here, and
 * that is deliberate rather than lazy: the two sites publish at different levels and were
 * reviewed under different rules.
 *
 * This site's treatment of the same employer work is `/work/reliable-knowledge-systems`, which
 * is synthetic throughout - it carries the class of problem and none of the particulars. The
 * case-study site carries the particulars: named services, topics, stores and verification
 * gates, published after its own redaction review and its own public/private split.
 *
 * So this module is a gateway, not a copy. It names what is over there, says plainly what that
 * material is and is not, and sends the reader to the artifact itself. Nothing here restates a
 * service name, a topic, a store, an identifier or a quantity from the deployed system; if that
 * rule is ever relaxed, the reason `/work/reliable-knowledge-systems` can call itself synthetic
 * goes with it.
 */

export const architecture = {
  site: site.architecture,
  repository: site.architectureRepository,
  eyebrow: "Architecture / Case studies / Separate site",
  title: "The systems, drawn at the level an interviewer asks about.",
  standfirst:
    "A separate case-study site documents the AI systems I contributed to at BP-ITCS: twenty architecture diagrams, an interactive walkthrough and a written record of what each claim rests on. It is published on its own terms, with its own review of what could be shown.",
  /** What the reader is actually getting, stated before they click away. */
  scope: {
    is: [
      "Architecture case studies of systems I contributed to as an engineer.",
      "A stated contribution level for every component, separating what I implemented from what I extended and what was already there.",
      "Claims traced to files, with the method written down rather than asserted.",
    ],
    isNot: [
      "Official documentation of any employer platform.",
      "A claim to have built a corporate platform single-handed.",
      "Deployment detail, credentials, hosts, addresses or customer data, all of which were removed rather than obscured.",
    ],
  },
} as const;

export interface ArchitectureEntry {
  id: string;
  /** What the reader is going to do, phrased as the action rather than the artifact. */
  label: string;
  audience: string;
  summary: string;
  href: string;
  /** Roughly how long it takes, so a reader can choose before clicking rather than after. */
  duration: string;
}

/**
 * Four ways in, ordered by how much time the reader has rather than by importance. The first
 * is the whole thing; the rest are the three questions it gets asked most.
 */
export const architectureEntries: readonly ArchitectureEntry[] = [
  {
    id: "interactive",
    label: "Open the interactive architecture",
    audience: "Start here",
    summary:
      "One page, every diagram inlined, with a control that dims everything I did not implement so authorship is visible across the whole system at once.",
    href: architecture.site,
    duration: "Browse",
  },
  {
    id: "walkthrough",
    label: "Run the interview walkthrough",
    audience: "Technical interview",
    summary:
      "An eleven-step guided sequence through the same page, in the order the work is best explained out loud: the system, then one document through it, then the checks, then what is mine.",
    href: `${architecture.site}#legal`,
    duration: "About 20 minutes",
  },
  {
    id: "verification",
    label: "Read the verification argument",
    audience: "Engineering depth",
    summary:
      "The part worth the most time: how a stored representation is checked back against the bytes the publisher served, and why a checker that shares its subject's assumptions cannot falsify anything.",
    href: `${architecture.site}#trust`,
    duration: "About 10 minutes",
  },
  {
    id: "contribution",
    label: "See the contribution map",
    audience: "Scope and honesty",
    summary:
      "Every repository classified by what I actually did in it, including the ones where the answer is nothing. Commit shares are given as evidence of weight, not as proof of authorship.",
    href: `${architecture.site}#contributions`,
    duration: "About 3 minutes",
  },
];

/**
 * The subjects on the case-study site, as an index.
 *
 * These are the section headings of that site's own navigation and the contribution classes of its
 * own published contribution map - both already public there, under its redaction review. Nothing
 * here adds a service name, a topic, a store, an identifier or a quantity that is not already
 * published on the other side of the link, which is the rule this module has always been under.
 *
 * The value of listing them is that a reader chooses a subject before leaving rather than being
 * handed one undifferentiated outbound link and a promise that it is interesting.
 */
export const architectureSubjects = [
  {
    slug: "arch-legal",
    title: "Legal knowledge database",
    kind: "Primary implementation / Browse",
    summary:
      "Published law turned into verifiable machine-readable knowledge: capture, structure, projection and a control plane. An eleven-step guided walkthrough runs through the same page in the order the work is best explained out loud.",
    href: `${architecture.site}#legal`,
    accent: "var(--accent-retrieval)",
    external: true,
  },
  {
    slug: "arch-trust",
    title: "Trust and verification",
    kind: "Primary implementation / About 10 minutes",
    summary:
      "How a stored representation is checked back against the bytes the publisher served, and why a checker that shares its subject's assumptions cannot falsify anything.",
    href: `${architecture.site}#trust`,
    accent: "var(--accent-graph)",
    external: true,
  },
  {
    slug: "arch-events",
    title: "Event-driven systems",
    kind: "Primary implementation / Ingestion",
    summary:
      "How a document moves between services without any of them holding a distributed transaction, and what has to be true for redelivery to be harmless.",
    href: `${architecture.site}#events`,
    accent: "var(--accent-pipeline)",
    external: true,
  },
  {
    slug: "arch-query",
    title: "Retrieval and answering",
    kind: "Primary implementation / Retrieval",
    summary:
      "Dense and sparse retrieval over a verified corpus, and what a citation has to point at before it is worth having.",
    href: `${architecture.site}#query`,
    accent: "var(--accent-corpus)",
    external: true,
  },
  {
    slug: "arch-documents",
    title: "Document intelligence",
    kind: "Significant contribution / Extraction",
    summary:
      "Extraction over insurance paperwork with a deterministic fallback beside the model, corruption detected before the text is trusted, and the fields that failed kept visible.",
    href: `${architecture.site}#documents`,
    accent: "var(--accent-steel)",
    external: true,
  },
  {
    slug: "arch-compliance",
    title: "AI compliance",
    kind: "Integration / shared",
    summary:
      "A questionnaire-based assessment product built by colleagues, whose results reach the knowledge layer through an ingestion path inside a service I implemented. The product is not mine and the page says so.",
    href: `${architecture.site}#compliance`,
    accent: "var(--accent-systems)",
    external: true,
  },
  {
    slug: "arch-radiology",
    title: "Medical imaging",
    kind: "Significant contribution / Research-grade",
    summary:
      "A multi-label chest-radiograph model with per-finding calibrated thresholds and gradient-based attribution. Research-grade only: no certified device, no regulatory clearance, no clinical accuracy figure.",
    href: `${architecture.site}#radiology`,
    accent: "var(--accent-flow)",
    external: true,
  },
] as const;
