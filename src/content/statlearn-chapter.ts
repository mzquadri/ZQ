/**
 * Statistical learning coursework: a report whose every number is traceable.
 *
 * Three problem sets from a TUM master's course. What makes this one worth a
 * page is not the topics - they are a standard syllabus - but the artefact
 * underneath: `Assignment_3/solution/results/reported_values.csv` lists every
 * number quoted in the report next to the cell that produced it, and no figure
 * or table anywhere in the repository is transcribed by hand.
 *
 * All the values below come from that file. Keeping a ledger like that is
 * mostly unglamorous, and its payoff is specific: the two results on this page
 * that are worth reading are both ones a hand-written report would have been
 * free to leave out.
 *
 * Problem sheets in the repository are the chair's own material and remain
 * their property; they are there for context only.
 */

export const repository = "https://github.com/mzquadri/Statistical-Learning-Transportation";

export const course = {
  title: "Statistical Learning and Data Analytics for Transportation Systems",
  programme: "M.Sc. Mathematics in Science and Engineering",
  institution: "Technical University of Munich",
} as const;

/** Rows in the provenance ledger, and how many problems it covers. */
export const ledger = { values: 126, problems: 11, assignments: 3 } as const;

/** The held-out set every accuracy below is measured on. */
export const testPoints = 60;
export const trainPoints = 140;

/** One correctly classified point, as a share of the test set. */
export const onePoint = 1 / testPoints;

/**
 * Two independent checks on the hand-derived backpropagation.
 *
 * The finite-difference figure is limited by the step size rather than by the
 * implementation, which is why it sits eight orders of magnitude above the
 * autograd comparison: the latter is float64 round-off and nothing else.
 */
export const gradientChecks = [
  { key: "autograd", label: "against PyTorch autograd", value: 2.7755575615628914e-17, kind: "max absolute difference" },
  { key: "finite", label: "against central differences", value: 5.096971201668568e-9, kind: "max relative error" },
] as const;

export interface Run {
  readonly key: string;
  readonly label: string;
  readonly accuracy: number;
  readonly note: string;
  /** Marks the run that did best, and the baseline it has to clear. */
  readonly kind?: "baseline" | "best";
}

/** Test accuracy, from the ledger, in the order the report reaches them. */
export const runs: readonly Run[] = [
  {
    key: "default",
    label: "the default settings",
    accuracy: 0.38333333333333336,
    note: "learning rate 0.001, twenty thousand epochs",
  },
  {
    key: "baseline",
    label: "guessing the majority class",
    accuracy: 0.5333333333333333,
    note: "no model at all",
    kind: "baseline",
  },
  {
    key: "sweep",
    label: "after a learning-rate sweep",
    accuracy: 0.7833333333333333,
    note: "learning rate 10, four orders of magnitude up",
  },
  {
    key: "bayes",
    label: "Bayesian optimisation",
    accuracy: 0.7833333333333333,
    note: `retrained on all ${140} training points`,
  },
  {
    key: "random",
    label: "random search",
    accuracy: 0.8,
    note: "the same budget, spent without a surrogate",
    kind: "best",
  },
];

const byKey = (k: string) => runs.find((r) => r.key === k) as Run;

export const baseline = byKey("baseline");
export const defaultRun = byKey("default");
export const bayesRun = byKey("bayes");
export const randomRun = byKey("random");

/** How far the untouched configuration sits below doing nothing. */
export const belowBaseline = baseline.accuracy - defaultRun.accuracy;

/** The margin the clever optimiser lost by, in test points rather than in percent. */
export const searchMarginPoints = Math.round(
  (randomRun.accuracy - bayesRun.accuracy) * testPoints
);

/** The learning rate the sweep settled on, against the one it started from. */
export const learningRate = { from: 0.001, to: 10 } as const;
export const learningRateFactor = learningRate.to / learningRate.from;

export const text = {
  belowBaseline: belowBaseline.toFixed(3),
  onePoint: onePoint.toFixed(4),
  lrFactor: learningRateFactor.toLocaleString("en-GB"),
} as const;

/** Correct count out of the held-out set, which is the honest unit here. */
export function correctOf(run: Run): number {
  return Math.round(run.accuracy * testPoints);
}

/** The syllabus, for the record. */
export const topics = [
  "multiple linear regression and model diagnostics",
  "PCA, logistic regression, SVMs and tree ensembles",
  "backpropagation by hand, Bayesian optimisation, sequence forecasting and Markov decision processes",
] as const;
