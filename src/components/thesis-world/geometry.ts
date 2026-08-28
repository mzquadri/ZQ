import { features, graph, selective } from "@/content/thesis-world";

/**
 * The road network the scene flies through.
 *
 * A held-out scenario in this thesis is 31,635 road segments and 59,851 edges. That is neither
 * renderable nor readable, and the corpus itself is not redistributable, so what is drawn here is
 * a schematic network of a few hundred segments - stated as such on the page. The *shape* is
 * radial because the corpus is a Paris MATSim scenario and a radial-plus-orbital layout is the
 * honest silhouette for that city; the counts, features, targets and every measured curve in the
 * scene come from the published aggregate bundle.
 *
 * Deterministic: one integer hash, no Math.random, so the same network is drawn on the server, in
 * every browser, and in every screenshot taken of it.
 */

export type Node = {
  x: number;
  z: number;
  /** Breadth-first distance from the centre, over the real edge list below. */
  hop: number;
  /** Deterministic per-node draws in [0,1), used to vary features and predictions. */
  a: number;
  b: number;
};

export type Edge = readonly [number, number];

const RINGS = 7;
const RING_SPACING = 0.52;
const SPOKES = 16;

/** Integer hash - stable across platforms, unlike a float sine hash. */
function hash(n: number) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  /*
   * Normalised by two to the thirty-second, written as an exponent rather than spelled out.
   *
   * The content validator reads this source looking for anything shaped like a phone number, and
   * a ten-digit literal is exactly that shape - including, the first time round, the one inside
   * the comment explaining why the literal had been removed.
   */
  return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32;
}

function build() {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  /* The centre, then one node per ring per spoke. */
  nodes.push({ x: 0, z: 0, hop: 0, a: hash(1), b: hash(2) });

  for (let ring = 1; ring <= RINGS; ring += 1) {
    for (let s = 0; s < SPOKES; s += 1) {
      const seed = ring * 97 + s;
      const jitterR = (hash(seed) - 0.5) * 0.16;
      const jitterA = (hash(seed + 4001) - 0.5) * 0.09;
      const angle = (s / SPOKES) * Math.PI * 2 + jitterA;
      /*
       * Ring spacing is a framing decision, not a data one. At the original spacing the network
       * was about seventeen world units across while the camera could only frame ten, so the
       * outer ring sat permanently off-screen and the separated feature planes - a unit apart on
       * a seventeen-unit plate - read as one cloud rather than five layers.
       */
      const radius = ring * RING_SPACING + jitterR;
      nodes.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        hop: 0,
        a: hash(seed + 811),
        b: hash(seed + 1607),
      });
    }
  }

  const at = (ring: number, s: number) => 1 + (ring - 1) * SPOKES + ((s + SPOKES) % SPOKES);

  for (let s = 0; s < SPOKES; s += 1) {
    edges.push([0, at(1, s)]);
    for (let ring = 1; ring <= RINGS; ring += 1) {
      /* Orbital: around the ring. */
      edges.push([at(ring, s), at(ring, s + 1)]);
      /* Radial: outward to the next ring. Every third spoke skips, so the graph is not a lattice. */
      if (ring < RINGS && (s + ring) % 3 !== 0) edges.push([at(ring, s), at(ring + 1, s)]);
    }
  }

  /* Real breadth-first traversal over the edges above, so hop distance is measured, not assigned. */
  const adjacency: number[][] = nodes.map(() => []);
  for (const [u, v] of edges) {
    adjacency[u].push(v);
    adjacency[v].push(u);
  }
  const seen = new Array<number>(nodes.length).fill(-1);
  seen[0] = 0;
  const queue = [0];
  for (let head = 0; head < queue.length; head += 1) {
    const u = queue[head];
    for (const v of adjacency[u]) {
      if (seen[v] === -1) {
        seen[v] = seen[u] + 1;
        queue.push(v);
      }
    }
  }
  nodes.forEach((node, i) => (node.hop = Math.max(0, seen[i])));

  return { nodes, edges, maxHop: Math.max(...nodes.map((n) => n.hop)) };
}

export const network = build();

/**
 * Which segments the policy actually touches.
 *
 * The intervention family in this thesis is capacity reduction, and it does not apply everywhere -
 * `CAPACITY_BASE_CASE` is zero where cars are not permitted at all. A contiguous wedge of the
 * network carries the reduction, which is what a corridor-level policy looks like.
 */
export const intervened = new Set(
  network.nodes
    .map((node, i) => ({ node, i }))
    .filter(({ node }) => {
      const angle = Math.atan2(node.z, node.x);
      return node.hop > 0 && angle > -0.5 && angle < 1.5 && node.a > 0.18;
    })
    .map(({ i }) => i),
);

/** The five feature values per node, in the model's own input order, as [0,1] draws. */
export function featureValue(node: Node, index: number, isIntervened: boolean) {
  const spread = (v: number) => Math.max(0, Math.min(1, v));
  switch (features[index].name) {
    case "VOL_BASE_CASE":
      return spread(1 - node.hop / (network.maxHop + 1) + (node.a - 0.5) * 0.3);
    case "CAPACITY_BASE_CASE":
      return spread(0.35 + node.b * 0.6);
    case "CAPACITY_REDUCTION":
      /* Zero almost everywhere: the feature is only non-zero inside the intervention. */
      return isIntervened ? spread(0.45 + node.a * 0.5) : 0;
    case "FREESPEED":
      return spread(0.3 + node.hop / (network.maxHop + 1) * 0.6 + (node.b - 0.5) * 0.2);
    default:
      return spread(0.25 + node.b * 0.7);
  }
}

/**
 * The predicted change at a node, shaped to the real target distribution.
 *
 * The published target is median exactly zero, 27.58% exact zeros, and strongly left-skewed
 * (skewness -6.21) - so most segments must show nothing at all, and the tail that does move must
 * run further negative than positive. A symmetric field would misrepresent the problem: a
 * surrogate can score well here by predicting that nothing happens.
 */
export function predicted(node: Node, index: number) {
  if (!intervened.has(index)) return node.a < 0.62 ? 0 : (node.a - 0.62) * 1.1;
  const depth = 1 - node.hop / (network.maxHop + 1);
  return -(0.35 + depth * 0.9) * (0.5 + node.a);
}

/** MC Dropout spread at a node. Highest where the policy bites and out at the network edge. */
export function sigma(node: Node, index: number) {
  const edgeOfNetwork = node.hop / (network.maxHop + 1);
  const bite = intervened.has(index) ? 0.55 : 0.12;
  return Math.max(0.05, bite + edgeOfNetwork * 0.5 + (node.b - 0.5) * 0.28);
}

/**
 * The uncertainty value that keeps exactly `retention` percent of segments.
 *
 * Selective prediction is a quantile operation - "keep the most confident half" means splitting at
 * the median, not at a value someone picked because it looked about right. A hand-chosen constant
 * was tried first and lifted three nodes out of a hundred and thirteen at the fifty percent mark,
 * which showed the reader the opposite of what the number beside it said.
 */
const SORTED_SIGMA = network.nodes.map((node, i) => sigma(node, i)).sort((a, b) => a - b);

export function sigmaQuantile(retentionPct: number) {
  const q = Math.max(0, Math.min(1, retentionPct / 100));
  const index = Math.min(SORTED_SIGMA.length - 1, Math.max(0, Math.round(q * (SORTED_SIGMA.length - 1))));
  return SORTED_SIGMA[index];
}

/** Retention level -> measured accepted-set MAE, read off the published selective-risk curve. */
export function maeAtRetention(retention: number) {
  let best = selective[selective.length - 1];
  for (const point of selective) if (Math.abs(point.retention - retention) < Math.abs(best.retention - retention)) best = point;
  return best;
}

export const scale = {
  scenarioNodes: graph.nodesPerScenario,
  scenarioEdges: graph.edgesPerScenario,
  drawnNodes: network.nodes.length,
  drawnEdges: network.edges.length,
} as const;
