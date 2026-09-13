import { getProject, type Project } from "./portfolio";

/**
 * Work that has a route but no entry in the project registry.
 *
 * Two pages are in this position, and both for a reason rather than by oversight. The reliable
 * knowledge systems page is the public-safe model of employer work, so it has no repository and no
 * evidence table and would fail every registry invariant. Medico is a research prototype that
 * publishes no trained weights and no metrics, and filing it beside work that does carry evidence
 * would lend it credibility it has not earned.
 *
 * They are still real destinations, so anything that links *to* work - a tutorial's related
 * projects, the index, the sitemap - has to be able to resolve them. This module is that lookup,
 * and it is deliberately tiny: it imports no scenes and no components, so the content validator
 * and the RSS build can use it without pulling the drawing layer in behind them.
 *
 * `tests/content-foundation.test.ts` asserts these titles still match the exhibition manifest, so
 * the two descriptions cannot drift apart silently.
 */

export interface LinkableWork {
  slug: string;
  title: string;
  classification: string;
  summary: string;
  researchPath?: string;
}

export const standaloneWork: readonly LinkableWork[] = [
  {
    slug: "reliable-knowledge-systems",
    title: "Keeping derived state honest",
    classification: "Current engineering / Synthetic model",
    summary:
      "A synthetic model of keeping several derived representations of one source honest: capture, derivation, verification that runs backwards, and rebuilding derived state from evidence. Illustrative throughout; it describes no deployed system.",
  },
  {
    slug: "medico",
    title: "Uncertain is not negative",
    classification: "Research prototype / Medical imaging",
    summary:
      "A multi-label chest X-ray classifier trained across three corpora that disagree about what they label. No trained weights, no patient data, no held-out metrics, and no clinical validation.",
  },
];

/** Every slug that `/work/<slug>` resolves to, registry or standalone. */
export function getLinkableWork(slug: string): LinkableWork | Project | undefined {
  return getProject(slug) ?? standaloneWork.find((work) => work.slug === slug);
}
