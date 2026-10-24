import { closestGap, config, exactTie, sample, sampleMax } from "@/content/parity-chapter";

/**
 * The layout of the parity world.
 *
 * BM25 score runs up the vertical axis and the five hits of the fixture's first question stand on
 * it, drawn twice: once for each implementation. The two stacks are identical, which is the whole
 * assertion - and the reason the assertion is hard is the distance between the top two blocks.
 *
 * Every number is the fixture's, verbatim. The chunk identifiers are shortened for display only,
 * exactly as the content module shortens them, and nothing here is rounded: 18.337068 against
 * 18.332857 is four thousandths, and four thousandths is what the world draws.
 */

export const SCORE_HEIGHT = 7;
export const py = (score: number) => (score / sampleMax) * SCORE_HEIGHT;

/** The two implementations, one either side of the axis they have to agree on. */
export const LANES = { java: -2.4, python: 2.4 } as const;

export const HITS = sample.hits.map((hit, i) => ({
  rank: hit.rank,
  id: hit.id,
  form: hit.form,
  score: hit.score,
  y: py(hit.score),
  /* Stacked away from the axis in rank order, so the top two are adjacent and everything else
   * is visibly further down than the gap being argued about. */
  x: i * 0.0,
}));

/** The pair the whole design exists to keep in order. */
export const CLOSEST = {
  upper: py(sample.hits[0].score),
  lower: py(sample.hits[1].score),
  gap: closestGap,
} as const;

/** The limiting case: two chunks that score identically to every digit a double carries. */
export const TIE = {
  questionId: exactTie.questionId,
  score: exactTie.score,
  y: py(exactTie.score),
} as const;

/**
 * The three constraints the Java side accepts to keep the order, as blocks on a shelf.
 *
 * Each is a thing it is not allowed to do, which is why they are drawn as objects rather than as
 * a list: an inverted index is faster and it is refused, and refusing it is the work.
 */
export const GUARDS = [
  { key: "loop", label: "keeps the Python loop order" },
  { key: "index", label: "refuses an inverted index" },
  { key: "log", label: "uses StrictMath.log" },
].map((guard, i) => ({ ...guard, x: (i - 1) * 2.4 }));

/** The depth the two ranking stacks are compared across. */
export const BLOCK = { width: 1.5, height: 0.34, depth: 1.5 } as const;

/** Where the fixture's own size is drawn, below the stacks it is drawn from. */
export const FIXTURE_Y = -1.8;

export const CONFIG = config;
