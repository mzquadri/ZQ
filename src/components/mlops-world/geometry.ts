import { dataChecks, gate, split, stages } from "@/content/mlops-world";

/**
 * The machine's layout.
 *
 * A single rail running left to right, with stations along it in the order the pipeline actually
 * executes. Counts come from the repository - four gate checks, three data checks, four registry
 * stages - and the positions are spacing decisions.
 *
 * The rail is straight and horizontal on purpose. A model release path is a sequence with one way
 * through and one place it can stop, and curving it or branching it decoratively would suggest
 * choices the code does not offer.
 */

function hash(n: number) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32;
}

export const jitter = (n: number) => hash(n) - 0.5;

/** Where each station sits along the rail. */
export const STATIONS = {
  data: -4.6,
  training: -3.0,
  artifact: -1.4,
  gate: 0.4,
  staging: 2.2,
  promotion: 3.6,
  serving: 5.2,
} as const;

export const RAIL = { from: -5.6, to: 6.2, y: 0 } as const;

/** The rejection siding: where a refused candidate is diverted to, below and behind the rail. */
export const SIDING = { x: 1.0, y: -1.15, z: 1.1 } as const;

/**
 * The dataset, drawn as rows.
 *
 * Three groups in the real proportion of the split - 1,800 train, 600 validation, 600 test - at a
 * scale that fits a screen. The ratio is the fact; the count of cubes is not.
 */
export const ROWS = 60;
export const rows = Array.from({ length: ROWS }, (_, i) => {
  const total = split.train + split.validation + split.test;
  const trainCut = Math.round((split.train / total) * ROWS);
  const validationCut = trainCut + Math.round((split.validation / total) * ROWS);
  const group = i < trainCut ? 0 : i < validationCut ? 1 : 2;
  return {
    index: i,
    group,
    col: i % 10,
    row: Math.floor(i / 10),
    /* A few rows fail the input checks and are dropped before anything is fitted. */
    dropped: hash(i * 733) > 0.93,
  };
});

/** The four gate checks, as physical plates the artifact has to pass through. */
export const gateChecks = gate.map((check, i) => ({
  ...check,
  index: i,
  /* Stacked vertically at the gate so all four are visible as one conjunction. */
  y: (i - (gate.length - 1) / 2) * 0.46,
}));

/** The three input checks, drawn before the rail proper begins. */
export const inputChecks = dataChecks.map((check, i) => ({
  ...check,
  index: i,
  y: (i - (dataChecks.length - 1) / 2) * 0.4,
}));

/** Registry stages, as slots in a rack. Production is one slot and only one thing occupies it. */
export const registrySlots = stages.map((stage, i) => ({
  ...stage,
  index: i,
  y: ((stages.length - 1) / 2 - i) * 0.42,
}));

/**
 * The failing check on the rejected pass.
 *
 * The margin over the baseline, because the repository names it as the check that carries the real
 * meaning - an accuracy floor alone is uninformative without the class balance. A candidate that
 * clears accuracy and F1 but not the margin is the interesting failure, not an obviously bad model.
 */
export const FAILING_CHECK = "accuracy_over_baseline";
export const failingIndex = gate.findIndex((check) => check.key === FAILING_CHECK);
