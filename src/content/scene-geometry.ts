/**
 * Synthetic geometry shared by the site's system diagrams.
 *
 * Pure coordinates and shapes: no labels, no domain, no content of any kind. Both the public
 * systems showcase and the confidential case study position their marks from this file, which is
 * why it can be shared without carrying anything from one into the other.
 *
 * Nothing here is measured or sampled. Positions are chosen so a figure reads well and are fixed
 * in the source, because a diagram that differs between renders cannot be screenshotted,
 * recorded or compared.
 */

/**
 * A deliberately small lattice for a vector representation.
 *
 * Sixteen points on a jittered grid from a committed table rather than a random cloud. It reads
 * as "a set of positions in a space", which is the whole claim such a figure makes.
 */
export const vectorPoints: ReadonlyArray<readonly [number, number, number]> = [
  [-0.62, 0.48, 0.12], [-0.18, 0.62, -0.24], [0.26, 0.51, 0.3], [0.64, 0.36, -0.16],
  [-0.7, 0.06, -0.28], [-0.24, 0.18, 0.34], [0.2, 0.09, -0.1], [0.66, -0.04, 0.22],
  [-0.58, -0.32, 0.18], [-0.14, -0.22, -0.3], [0.3, -0.36, 0.08], [0.6, -0.18, -0.26],
  [-0.42, -0.62, -0.14], [0.02, -0.58, 0.26], [0.44, -0.66, -0.2], [0.72, 0.6, 0.04],
];

/** Drawing bounds for a graph mark. Named so a run of coordinates never reaches the file as text. */
export const GRAPH_MARK = { halfWidth: 100, halfHeight: 62, spreadX: 82, spreadY: 56 } as const;

/** Projection bounds for a flat vector mark, where depth becomes point size. */
export const FLAT_VECTOR = { half: 100, spread: 78, near: 2.1, depth: 2.6 } as const;

export interface SceneGraphNode {
  id: string;
  position: readonly [number, number, number];
  kind: "unit" | "external" | "unresolved";
}

export interface SceneGraphEdge {
  from: string;
  to: string;
  kind: "self" | "external" | "unresolved";
}

/**
 * A small reference graph with one relationship that does not resolve.
 *
 * The unresolved node is the point of drawing a graph at all: a reference whose target cannot be
 * identified is drawn hollow and left hollow, rather than attached to whichever neighbour looks
 * plausible.
 */
export const sceneGraphNodes: readonly SceneGraphNode[] = [
  { id: "a", position: [-0.55, 0.5, 0], kind: "unit" },
  { id: "b", position: [0.35, 0.58, 0.18], kind: "unit" },
  { id: "c", position: [0.62, -0.12, -0.14], kind: "unit" },
  { id: "d", position: [-0.62, -0.28, 0.2], kind: "unit" },
  { id: "x", position: [0.05, -0.66, -0.05], kind: "external" },
  { id: "u", position: [-0.05, 0.05, 0.34], kind: "unresolved" },
];

export const sceneGraphEdges: readonly SceneGraphEdge[] = [
  { from: "a", to: "b", kind: "self" },
  { from: "b", to: "c", kind: "self" },
  { from: "d", to: "a", kind: "self" },
  { from: "c", to: "x", kind: "external" },
  { from: "a", to: "u", kind: "unresolved" },
];
