/**
 * Geometry for the legal knowledge platform figures.
 *
 * The parts of this case study's figures that are specific to it. Shared marks - the vector
 * lattice, the reference graph, the drawing bounds - live in `scene-geometry.ts`, because the
 * public systems showcase draws the same shapes and neither should reach into the other.
 *
 * Scene *state* is not modelled here either: it is a `data-step` number that `SceneReveal` writes
 * onto the DOM, which is what the guided walkthrough drives and what the tests read.
 *
 * Nothing here describes real content. Positions are arbitrary and the quantities are the
 * smallest number that still reads as "a set", chosen so a figure stays legible rather than to
 * represent anything measured.
 */

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
