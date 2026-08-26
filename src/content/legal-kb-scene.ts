/**
 * Geometry for the legal knowledge platform figures.
 *
 * Coordinates and dispositions, held as data so that every render is identical and can be
 * screenshotted, recorded and compared. Scene *state* is not modelled here: it is a `data-step`
 * number that `SceneReveal` writes onto the DOM, which is what a later guided walkthrough will
 * drive and what the tests already read.
 *
 * Nothing here describes real content. Positions are arbitrary and the quantities are the
 * smallest number that still reads as "a set", chosen so a figure stays legible rather than to
 * represent anything measured.
 */

/* --- Geometry ---------------------------------------------------------------------------- */

/**
 * A deliberately small lattice for the vector representation.
 *
 * Sixteen points on a jittered grid, generated once from a fixed table rather than at random:
 * a cloud that changes between renders cannot be screenshotted, recorded, or compared. It reads
 * as "a set of positions in a space", which is the whole claim being made.
 */
export const vectorPoints: ReadonlyArray<readonly [number, number, number]> = [
  [-0.62, 0.48, 0.12], [-0.18, 0.62, -0.24], [0.26, 0.51, 0.3], [0.64, 0.36, -0.16],
  [-0.7, 0.06, -0.28], [-0.24, 0.18, 0.34], [0.2, 0.09, -0.1], [0.66, -0.04, 0.22],
  [-0.58, -0.32, 0.18], [-0.14, -0.22, -0.3], [0.3, -0.36, 0.08], [0.6, -0.18, -0.26],
  [-0.42, -0.62, -0.14], [0.02, -0.58, 0.26], [0.44, -0.66, -0.2], [0.72, 0.6, 0.04],
];

/**
 * A small reference graph with one relationship that does not resolve.
 *
 * The unresolved node is the point of including a graph at all: a reference whose target is not
 * identifiable is drawn hollow and kept hollow, rather than being attached to a plausible
 * neighbour. Synthetic labels throughout.
 */
export interface GraphNode {
  id: string;
  label: string;
  position: readonly [number, number, number];
  kind: "unit" | "external" | "unresolved";
}

export interface GraphEdge {
  from: string;
  to: string;
  kind: "self" | "external" | "unresolved";
}

export const graphNodes: readonly GraphNode[] = [
  { id: "a", label: "Unit A", position: [-0.55, 0.5, 0], kind: "unit" },
  { id: "b", label: "Unit B", position: [0.35, 0.58, 0.18], kind: "unit" },
  { id: "c", label: "Unit C", position: [0.62, -0.12, -0.14], kind: "unit" },
  { id: "d", label: "Unit D", position: [-0.62, -0.28, 0.2], kind: "unit" },
  { id: "x", label: "External document", position: [0.05, -0.66, -0.05], kind: "external" },
  { id: "u", label: "Unresolved target", position: [-0.05, 0.05, 0.34], kind: "unresolved" },
];

export const graphEdges: readonly GraphEdge[] = [
  { from: "a", to: "b", kind: "self" },
  { from: "b", to: "c", kind: "self" },
  { from: "d", to: "a", kind: "self" },
  { from: "c", to: "x", kind: "external" },
  { from: "a", to: "u", kind: "unresolved" },
];

/* --- Generations, for the source-change scene -------------------------------------------- */

export interface GenerationPlane {
  id: "evidence" | "previous" | "current";
  name: string;
  note: string;
}

/** Front to back is expressed in CSS; the order here is the order they are rendered in. */
export const generationPlanes: readonly GenerationPlane[] = [
  {
    id: "evidence",
    name: "Retained source evidence",
    note: "Captured bytes for every version measured so far. Nothing here is rewritten.",
  },
  {
    id: "previous",
    name: "Previous current state",
    note: "What was being served until the amended source arrived.",
  },
  {
    id: "current",
    name: "New current state",
    note: "What is served now, after converging on the amended source.",
  },
];

export type Disposition = "retained" | "added" | "replaced" | "pruned";

export interface GenerationUnit {
  id: string;
  label: string;
  disposition: Disposition;
  /** Column position on the plane. */
  column: number;
}

/** Six units, one of each interesting outcome, laid out in a fixed order. */
export const generationUnits: readonly GenerationUnit[] = [
  { id: "u1", label: "Unit one", disposition: "retained", column: 0 },
  { id: "u2", label: "Unit two", disposition: "replaced", column: 1 },
  { id: "u3", label: "Unit three", disposition: "retained", column: 2 },
  { id: "u4", label: "Unit four", disposition: "pruned", column: 3 },
  { id: "u5", label: "Unit five", disposition: "retained", column: 4 },
  { id: "u6", label: "Unit six", disposition: "added", column: 5 },
];

/**
 * The ordering trade-off each derived store makes when it converges.
 *
 * Stated as the choice rather than as a procedure, because the interesting part is which
 * intermediate state each store is willing to be caught in.
 */
export interface ConvergenceOrder {
  store: "Vector representation" | "Reference graph";
  first: string;
  then: string;
  intermediate: string;
  why: string;
}

export const convergenceOrders: readonly ConvergenceOrder[] = [
  {
    store: "Vector representation",
    first: "Write the current records",
    then: "Remove the obsolete ones",
    intermediate: "briefly a superset",
    why: "Removing first would open a window with nothing to search. A short overlap is recoverable; a hole is not.",
  },
  {
    store: "Reference graph",
    first: "Clear obsolete current relationships",
    then: "Merge the current ones",
    intermediate: "briefly sparser",
    why: "Merging first would leave a relationship that the amended source no longer supports. A relationship owned by another document is untouched either way.",
  },
];
