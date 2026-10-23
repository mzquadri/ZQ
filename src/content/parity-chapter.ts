/**
 * bm25-rrf-java: two implementations, one ranking.
 *
 * Read out of the repository's committed parity fixtures rather than its prose:
 *
 *   src/test/resources/parity/rankings.json   50 questions, the reference rankings
 *   src/test/resources/parity/chunks.json     the 314 chunks and the stamp
 *   src/test/resources/corpus/manifest.json   the corpus and its SHA-256
 *
 * The sample below is the first question in the fixture, verbatim, with the
 * chunk identifiers shortened for display only. Its top two scores differ by
 * about four thousandths, which is the reason the Java side keeps the Python
 * loop order, refuses an inverted index and uses StrictMath.log: a few units
 * in the last place is enough to swap a pair this close, and the test compares
 * order exactly.
 */

export const repository = "https://github.com/mzquadri/bm25-rrf-java";

export const config = {
  k1: 1.5,
  b: 0.75,
  rrfK: 60,
  chunkSize: 800,
  chunkOverlap: 120,
  candidateDepth: 20,
  rrfLimit: 10,
} as const;

export const parity = {
  questions: 50,
  chunks: 314,
  corpusFiles: 3,
  /** Relative tolerance allowed on scores. Order is compared exactly. */
  scoreTolerance: "1e-12",
  bm25Depth: 20,
  rrfDepth: 10,
} as const;

/** The first question in the fixture, and its BM25 ranking. */
export const sample = {
  questionId: "nfip-001",
  question:
    "Under the Dwelling Form, how long do I have to send a proof of loss after a flood loss?",
  hits: [
    { rank: 1, form: "dwelling", id: "b1e73cc5", score: 18.337068 },
    { rank: 2, form: "general property", id: "823f35c2", score: 18.332857 },
    { rank: 3, form: "rcbap", id: "032a6c69", score: 16.510989 },
    { rank: 4, form: "rcbap", id: "d026af40", score: 15.009405 },
    { rank: 5, form: "dwelling", id: "e5de6486", score: 14.320981 },
  ],
} as const;

/** The gap between the top two, which is the pair most at risk of swapping. */
export const closestGap = Math.round((18.337068 - 18.332857) * 1e6) / 1e6;

/**
 * Somewhere in the fixture two chunks score identically to every digit a
 * double carries. A tie is the limiting case of the problem the loop order
 * exists to solve.
 */
export const exactTie = { questionId: "nfip-010", score: 7.774848398829487 } as const;

export const corpus = {
  name: "NFIP Standard Flood Insurance Policy forms",
  citation: "44 CFR Part 61",
  retrievedAt: "2026-08-22",
} as const;

/** The widest and narrowest score in the sample, for laying the bars out. */
export const sampleMax = 18.337068;
export const sampleMin = 0;
