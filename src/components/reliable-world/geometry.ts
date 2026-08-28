import { scale } from "@/content/reliable-knowledge-world";

/**
 * The synthetic machine.
 *
 * Every coordinate and every count here is invented for this page. Twelve records, twenty-four
 * points and a nine-node graph are legibility choices, not measurements, and they are stated as
 * such on the page. Nothing in this file is derived from, scaled from, or proportioned to any real
 * system.
 *
 * The layout carries one idea: the core sits at the centre and does not move, and the three derived
 * modules sit around it at equal radius, because they are siblings rather than a sequence. If they
 * were drawn in a row the picture would say "pipeline", which is exactly the wrong thing.
 */

function hash(n: number) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32;
}

export const jitter = (n: number) => hash(n) - 0.5;

/** The three derived modules, evenly spaced around the core. */
export const MODULES = ["structured", "semantic", "relational"] as const;
export type ModuleKey = (typeof MODULES)[number];

export const modules = MODULES.map((key, i) => {
  const angle = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
  return {
    key,
    index: i,
    angle,
    /* Closed radius and open radius: the housing shuts by pulling them back to the core. */
    closed: 0.55,
    open: 3.3,
    dir: { x: Math.cos(angle), z: Math.sin(angle) },
  };
});

/** Structured: an ordered grid of records with explicit fields. Machined, aligned, countable. */
export const records = Array.from({ length: scale.records }, (_, i) => ({
  index: i,
  col: i % 4,
  row: Math.floor(i / 4),
  /* One record is the one that drifts later. Fixed, so the fault is the same every time. */
  faulty: i === 6,
}));

/** Semantic: a small point field. Positions mean nothing beyond "this is a space". */
export const points = Array.from({ length: scale.vectorPoints }, (_, i) => {
  const a = hash(i * 31) * Math.PI * 2;
  const r = 0.25 + hash(i * 57) * 0.75;
  return {
    index: i,
    x: Math.cos(a) * r,
    y: (hash(i * 91) - 0.5) * 1.1,
    z: Math.sin(a) * r,
  };
});

/** Relational: a small connected graph. Nodes on a ring plus a centre, so the shape reads. */
export const graphNodes = Array.from({ length: scale.graphNodes }, (_, i) => {
  if (i === 0) return { index: 0, x: 0, y: 0, z: 0 };
  const a = ((i - 1) / (scale.graphNodes - 1)) * Math.PI * 2;
  const r = 0.85 + jitter(i * 13) * 0.22;
  return { index: i, x: Math.cos(a) * r, y: jitter(i * 7) * 0.35, z: Math.sin(a) * r };
});

export const graphEdges: readonly (readonly [number, number])[] = (() => {
  const edges: [number, number][] = [];
  const outer = scale.graphNodes - 1;
  for (let i = 1; i <= outer; i += 1) {
    edges.push([i, (i % outer) + 1]);
    if (i % 2 === 1) edges.push([0, i]);
  }
  return edges.slice(0, scale.graphEdges);
})();

/**
 * The four invariant lamps, read as a conjunction.
 *
 * `consistent` is the one that fails in the fault state, because that is the failure a single store
 * cannot see about itself: everything inside the drifted module is internally fine.
 */
export const FAILING_INVARIANT = "consistent";
