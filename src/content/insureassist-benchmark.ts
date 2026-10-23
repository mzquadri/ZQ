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
  /**
   * From `questions` in the pinned `eval/reference_run.json`.
   *
   * Until 2026-10-23 this read `total: 40, unanswerable: 8, dev: 18, test: 22`. Those are
   * not the numbers at the commit this file pins: that commit is dated 2026-09-24 and
   * already carried 50 labels with 18 unanswerable, split 23 dev and 27 test. The page
   * cited one commit and published an earlier state's counts, and `answerable: 32` was
   * right throughout, which is what made it read as plausible.
   *
   * `tests/fixtures/insureassist-reference-run.json` is the pinned file's `questions`,
   * `corpus` and `retrieval.metrics` blocks, copied verbatim, and
   * `insureassist-evidence.test.ts` compares this object against it field by field.
   */
  questions: { total: 50, answerable: 32, unanswerable: 18, dev: 23, test: 27 },
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
  /**
   * Tests that run with no model, no database and no network.
   *
   * 447 of 456 collected. The other 9 are the container integration tests, which skip
   * unless `INSUREASSIST_INTEGRATION=1` is set; CI's `container-integration` job sets it
   * and runs them against a real image, so they are neither broken nor offline.
   *
   * This read 224, which matches no reachable state of that repository: the pinned commit
   * has 256 test functions and its main has 437. Unlike the figures above, this one is not
   * in any committed artefact, so no fixture can hold it. Re-derive it with
   * `pytest --collect-only -q` in `insureassist-rag-mlops` when the pin moves.
   */
  tests: 447,
} as const;
