/**
 * Geometry for the cinematic scenes.
 *
 * Coordinates only. No labels, no captions, no quantities - every string that a reader will see
 * lives in a content module that the privacy validator can read, and nothing in this file is a
 * measurement of anything. The curves below are generated from fixed closed-form expressions so
 * that they are identical on every render and on every machine; they describe the *shape* of a
 * forecast with an uncertainty envelope, which is a form, not a result.
 *
 * This mirrors `scene-geometry.ts`, which carries the same guarantee for the public showcase.
 */

/** Deterministic pseudo-noise. Fixed constants, no RNG, so the scene never changes between builds. */
function wobble(t: number, seed: number): number {
  return (
    Math.sin(t * 5.2 + seed * 1.7) * 0.42 +
    Math.sin(t * 11.9 + seed * 3.1) * 0.19 +
    Math.sin(t * 23.3 + seed * 0.9) * 0.08
  );
}

export const SERIES = { points: 96, width: 1000, height: 320 } as const;

export interface SeriesSample {
  x: number;
  /** The central prediction. */
  y: number;
  /** Half-width of the envelope before calibration - deliberately too wide. */
  rawBand: number;
  /** Half-width after calibration. Narrower, and varying with local difficulty. */
  calBand: number;
  /** The observation the prediction is checked against. */
  observed: number;
  /** Whether the observation falls inside the calibrated envelope. */
  covered: boolean;
  /** Model confidence at this point, 0-1. Drives the selective-prediction stage. */
  confidence: number;
}

function buildSeries(): SeriesSample[] {
  const out: SeriesSample[] = [];
  for (let i = 0; i < SERIES.points; i += 1) {
    const t = i / (SERIES.points - 1);
    const x = t * SERIES.width;

    // A signal with a trend, a seasonal term, and a rough patch in the middle third.
    const trend = 34 * t;
    const season = Math.sin(t * Math.PI * 3.1) * 46;
    const difficulty = Math.exp(-(((t - 0.55) / 0.16) ** 2));
    const y = SERIES.height * 0.52 - trend + season + wobble(t, 1) * 14;

    // Before calibration the envelope is uniformly wide: it does not know where it is uncertain.
    const rawBand = 62;
    // After calibration it tracks difficulty - wide where the signal is hard, tight where it is not.
    const calBand = 15 + difficulty * 46 + Math.abs(wobble(t, 4)) * 9;

    const observed = y + wobble(t, 7) * (12 + difficulty * 34);
    const covered = Math.abs(observed - y) <= calBand;
    const confidence = Math.max(0, Math.min(1, 1 - difficulty * 0.92 - Math.abs(wobble(t, 2)) * 0.16));

    out.push({ x, y, rawBand, calBand, observed, covered, confidence });
  }
  return out;
}

export const series: readonly SeriesSample[] = buildSeries();

/** Path helpers. Rounded so the emitted SVG is byte-stable between builds. */
const r = (n: number) => Math.round(n * 100) / 100;

export function linePath(key: "y" | "observed"): string {
  return series.map((s, i) => `${i === 0 ? "M" : "L"}${r(s.x)} ${r(s[key])}`).join(" ");
}

export function bandPath(key: "rawBand" | "calBand"): string {
  const top = series.map((s, i) => `${i === 0 ? "M" : "L"}${r(s.x)} ${r(s.y - s[key])}`).join(" ");
  const bottom = [...series]
    .reverse()
    .map((s) => `L${r(s.x)} ${r(s.y + s[key])}`)
    .join(" ");
  return `${top} ${bottom} Z`;
}

/** The points a selective-prediction rule would keep, and the ones it would decline to answer. */
export const CONFIDENCE_FLOOR = 0.62;

export const seriesMarks = series
  .filter((_, i) => i % 4 === 0)
  .map((s) => ({
    x: r(s.x),
    y: r(s.observed),
    covered: s.covered,
    kept: s.confidence >= CONFIDENCE_FLOOR,
  }));

/* ------------------------------------------------------------------------------------------- *
 * A transport-shaped graph: a small road network with a few high-degree junctions. Positions are
 * fixed rather than force-laid, so the layout is identical every time and can be reasoned about.
 * ------------------------------------------------------------------------------------------- */

export const GRAPH = { width: 1000, height: 560 } as const;

export interface GraphNode {
  id: number;
  x: number;
  y: number;
  /** Hop distance from the source node, which is what the propagation animation steps through. */
  hop: number;
}

const NODE_SEED: readonly (readonly [number, number])[] = [
  [0.5, 0.5], [0.34, 0.36], [0.66, 0.36], [0.34, 0.64], [0.66, 0.64],
  [0.2, 0.22], [0.5, 0.18], [0.8, 0.22], [0.12, 0.5], [0.88, 0.5],
  [0.2, 0.78], [0.5, 0.82], [0.8, 0.78], [0.06, 0.32], [0.94, 0.32],
  [0.06, 0.68], [0.94, 0.68], [0.28, 0.06], [0.72, 0.06], [0.28, 0.94],
  [0.72, 0.94], [0.42, 0.26], [0.58, 0.26], [0.42, 0.74], [0.58, 0.74],
];

const EDGE_SEED: readonly (readonly [number, number])[] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [1, 21], [2, 22], [3, 23], [4, 24],
  [1, 5], [1, 8], [2, 7], [2, 9], [3, 10], [3, 8], [4, 12], [4, 9],
  [5, 13], [5, 17], [6, 21], [6, 22], [7, 14], [7, 18], [8, 15], [9, 16],
  [10, 15], [10, 19], [11, 23], [11, 24], [12, 16], [12, 20], [21, 6], [22, 6],
  [23, 11], [24, 11], [13, 8], [14, 9], [17, 6], [18, 6], [19, 11], [20, 11],
];

function buildGraph() {
  const nodes: GraphNode[] = NODE_SEED.map(([fx, fy], id) => ({
    id,
    x: r(fx * GRAPH.width),
    y: r(fy * GRAPH.height),
    hop: -1,
  }));

  // Breadth-first from node 0, so `hop` is a real distance and the propagation is not hand-waved.
  const adjacency = new Map<number, number[]>();
  for (const [a, b] of EDGE_SEED) {
    adjacency.set(a, [...(adjacency.get(a) ?? []), b]);
    adjacency.set(b, [...(adjacency.get(b) ?? []), a]);
  }
  nodes[0].hop = 0;
  const queue = [0];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const next of adjacency.get(current) ?? []) {
      if (nodes[next].hop === -1) {
        nodes[next].hop = nodes[current].hop + 1;
        queue.push(next);
      }
    }
  }

  const edges = EDGE_SEED.map(([a, b]) => ({
    a,
    b,
    /* An edge belongs to the wavefront that first crosses it. */
    hop: Math.max(nodes[a].hop, nodes[b].hop),
  }));

  return { nodes, edges };
}

const graph = buildGraph();
export const graphNodes: readonly GraphNode[] = graph.nodes;
export const graphEdges: readonly { a: number; b: number; hop: number }[] = graph.edges;
export const graphMaxHop = Math.max(...graph.nodes.map((n) => n.hop));
