import { outcomes, templatesPerClass, tracks, vocabulary } from "@/content/nlp-chapter";

/**
 * The layout of the news-classification world.
 *
 * Two halves on one ground plane. The junction runs along z, so the request travels toward the
 * reader and stops where the loader stops it. The vocabulary sits beyond it as four columns of
 * word tokens, one per class, positioned so that the exclusive ones stay inside their own column
 * and the shared ones sit between - which is what makes separability something to look at rather
 * than a percentage to accept.
 */

export const ROAD = { from: -7.0, junction: -1.2, to: 3.4 } as const;

/** Where each exit ends up, and which one the loader takes by default. */
export const EXITS = outcomes.map((outcome, i) => ({
  key: outcome.key,
  label: outcome.label,
  kind: outcome.kind,
  /* Success runs on, the refusal stops short, the gated one turns aside. */
  x: i === 0 ? 0 : i === 1 ? 0 : -2.6,
  z: i === 0 ? ROAD.to : ROAD.junction + 0.5,
  blocked: outcome.kind === "stop",
  gated: outcome.kind === "gated",
}));

export const COLUMN_GAP = 2.3;

export interface Token {
  readonly cls: number;
  /** True where the word appears in exactly one class. */
  readonly exclusive: boolean;
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/* The deterministic hash the rest of the site uses, so the picture never varies by machine. */
function hash01(n: number) {
  let x = (n ^ 0x9e3779b9) >>> 0;
  x = Math.imul(x, 0x85ebca6b) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35) >>> 0;
  x ^= x >>> 16;
  return x / 2 ** 32;
}

/**
 * One token per distinct word in the fixture, grouped by class.
 *
 * Counts are the data; positions are the drawing. An exclusive word sits inside its own column, a
 * shared one sits off toward the middle - which is the only thing the arrangement claims, and it
 * is exactly what "appears in exactly one class" means.
 */
export const TOKENS: readonly Token[] = vocabulary.flatMap((entry, cls) => {
  const columnX = (cls - (vocabulary.length - 1) / 2) * COLUMN_GAP;
  return Array.from({ length: entry.words }, (_, i) => {
    const exclusive = i < entry.exclusive;
    const spreadX = exclusive ? 0.68 : 1.9;
    const seed = cls * 211 + i * 7;
    return {
      cls,
      exclusive,
      /* Shared words drift toward the middle of the whole set, which is where they belong. */
      x: columnX * (exclusive ? 1 : 0.42) + (hash01(seed) - 0.5) * spreadX,
      y: 0.12 + hash01(seed + 1) * 0.5,
      z: 5.2 + (hash01(seed + 2) - 0.5) * 2.4,
    };
  });
});

export const CLASS_X = vocabulary.map(
  (_, cls) => (cls - (vocabulary.length - 1) / 2) * COLUMN_GAP,
);

export const TRACK_X = tracks.map((_, i) => (i - (tracks.length - 1) / 2) * 3.0);

export const TEMPLATE_COUNT = templatesPerClass * vocabulary.length;
