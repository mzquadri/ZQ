import { choreograph, type WorldState } from "@/components/worlds/choreography";

import { closestGap, corpus, exactTie, parity, sample } from "@/content/parity-chapter";

import { CLOSEST, SCORE_HEIGHT } from "./geometry";

/**
 * Two implementations, one ranking, and four thousandths of a point.
 *
 * The fixture's first question puts its top two chunks 0.004211 apart. A few units in the last
 * place of a floating-point sum is enough to swap a pair that close, and the parity test compares
 * order exactly - so the Java side keeps the Python loop order, refuses an inverted index and
 * uses StrictMath.log. Those three refusals are the work, and this world draws them as refusals.
 *
 * Somewhere else in the same fixture two chunks score identically to every digit a double
 * carries, which is the limiting case of the same problem rather than a separate one.
 */

export type ParityKey =
  | "ranking"
  | "both"
  | "close"
  | "tie"
  | "order"
  | "guards"
  | "fixture";

export const STATES: readonly WorldState<ParityKey>[] = [
  {
    key: "ranking",
    from: 0.0,
    to: 0.12,
    label: "One question, five hits",
    caption: `The first question in the fixture, and the chunks BM25 ranks for it.`,
  },
  {
    key: "both",
    from: 0.12,
    to: 0.28,
    label: "Ranked twice, by two implementations",
    caption: "Java beside Python, on the same corpus, with the same parameters.",
  },
  {
    key: "close",
    from: 0.28,
    to: 0.44,
    label: `The top two differ by ${closestGap}`,
    caption: `${sample.hits[0].score} against ${sample.hits[1].score}. A few units in the last place would swap them.`,
  },
  {
    key: "tie",
    from: 0.44,
    to: 0.58,
    label: "And one pair does not differ at all",
    caption: `In ${exactTie.questionId}, two chunks score ${exactTie.score} — identical to every digit a double carries.`,
  },
  {
    key: "order",
    from: 0.58,
    to: 0.72,
    label: "So the test compares order exactly",
    caption: `Scores are allowed ${parity.scoreTolerance} of relative tolerance. The ordering is allowed none.`,
  },
  {
    key: "guards",
    from: 0.72,
    to: 0.86,
    label: "Which costs three things",
    caption: "The Python loop order is kept, an inverted index is refused, and StrictMath.log is used.",
  },
  {
    key: "fixture",
    from: 0.86,
    to: 1.0,
    label: `${parity.questions} questions, ${parity.chunks} chunks`,
    caption: `Over ${corpus.name}, committed with its SHA-256 and the depth each stage is compared to.`,
  },
];

export const { at, active } = choreograph(STATES);

/* A type alias, not an interface: `blendShots` blends every numeric field, and only an alias
 * carries the implicit index signature that lets it. */
export type Shot = {
  readonly height: number;
  readonly distance: number;
  /** Sideways offset from `target`, not an absolute x. */
  readonly swing: number;
  readonly look: number;
  readonly target: number;
  readonly aimY: number;
};

const MIDDLE = SCORE_HEIGHT / 2;
const TOP_PAIR = (CLOSEST.upper + CLOSEST.lower) / 2;

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one dives at the gap. Four thousandths of eighteen points is invisible
 * at any distance that holds the whole ranking, so the beat that is about it goes and looks -
 * and the beat after it, about an exact tie, has nothing left to look at, which is the point.
 */
export const SHOTS: Record<ParityKey, Shot> = {
  ranking: { height: 0.8, distance: 15.0, swing: 0.0, look: 0.0, target: 0, aimY: MIDDLE },
  both: { height: 0.4, distance: 14.0, swing: 2.2, look: 0.0, target: 0, aimY: MIDDLE },
  /* Down to the pair itself, where four thousandths of a point is a visible distance. */
  close: { height: 0.1, distance: 2.4, swing: 0.3, look: 0.0, target: 0.4, aimY: TOP_PAIR },
  tie: { height: 0.08, distance: 2.0, swing: 0.2, look: 0.0, target: 0.4, aimY: TOP_PAIR },
  order: { height: 0.6, distance: 13.0, swing: -1.8, look: 0.0, target: 0, aimY: MIDDLE },
  guards: { height: 1.4, distance: 12.0, swing: 0.0, look: -0.6, target: 0, aimY: -1.6 },
  fixture: { height: 2.2, distance: 18.0, swing: 0.0, look: 0.0, target: 0, aimY: MIDDLE - 1.0 },
};

/**
 * How far right of centre the subject is aimed, as a share of however wide the frame is.
 *
 * The caption sits behind a scrim in the stage's own colour, so anything drawn in the lower left
 * is dimmed without looking dimmed.
 */
export const PLATE_BIAS = 0.2;
