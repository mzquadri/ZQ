/**
 * The InsureAssist held-out benchmark, in one place.
 *
 * Lifted out of portfolio.ts so that a client component can read a figure from
 * it without pulling the whole project catalogue into the browser bundle. That
 * catalogue carries the confidential draft, and the privacy scan caught it
 * shipping in a static chunk the moment the 3D world imported from it: the
 * route was a correct 404 and the strings were in the JavaScript anyway.
 *
 * Nothing about the numbers changed. portfolio.ts re-exports this so every
 * existing import keeps working.
 */
export const insureAssistBenchmark = {
  corpus: {
    documents: 3,
    chunks: 314,
    words: 35_639,
    source: "NFIP Standard Flood Insurance Policy forms, 44 CFR Part 61",
    licence: "17 U.S.C. 105 - US Government work, no copyright",
  },
  questions: { total: 40, answerable: 32, unanswerable: 8, dev: 18, test: 22 },
  architecture: "Hybrid: BGE dense + Okapi BM25, reciprocal rank fusion",
  /** Held-out test split, 18 answerable questions. */
  selected: { hitRate5: 0.556, mrr: 0.42, topDocumentAccuracy: 0.556 },
  baselines: {
    dense: { hitRate5: 0.5, mrr: 0.365, topDocumentAccuracy: 0.556 },
    bm25: { hitRate5: 0.611, mrr: 0.366, topDocumentAccuracy: 0.333 },
    /** The pre-selection starting point, at the original 600/100 chunking. */
    startingPoint: { hitRate5: 0.611, mrr: 0.366, topDocumentAccuracy: 0.167 },
  },
  citations: { precision: 0.111, recall: 0.463, unsupportedRate: 0 },
  abstention: { answerableAcceptance: 1, unanswerableRejection: 0 },
  tests: 224,
} as const;
