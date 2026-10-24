/**
 * Neural network identifiability: same function, different weights.
 *
 * This chapter carries no measurement, because the repository publishes none.
 * Its own scope section says that `experiments/` and `results/` intentionally
 * contain no versioned configurations, trained models or numerical findings,
 * and that it therefore makes no claim of experimentally establishing
 * identifiability for any trained model or activation family.
 *
 * What is described here is what the code does: it constructs a network
 * related to another by a hidden-unit permutation and a sign flip, checks that
 * the two agree numerically on sampled inputs, checks that their parameters
 * align under that relabelling, and rejects an unrelated network put through
 * the same comparison.
 *
 * The activation names below are the ones the prototype's own code uses. They
 * are not a statement of any theorem's hypotheses; the repository is explicit
 * that the formal conditions live in the cited papers rather than in it.
 */

export const repository =
  "https://github.com/mzquadri/Neural-Network-Identifiability-Analysis";

export const seminar = {
  institution: "Technical University of Munich",
  subject: "Mathematics of machine learning",
  supervisors: ["Prof. Massimo Fornasier", "Dr. Alessandro Scagliotti"],
} as const;

/** The activations the prototype builds networks with. */
export const activations = ["tanh", "sigmoid", "ReLU"] as const;

/**
 * The comparison the code runs. Two networks, one built from the other by
 * relabelling its hidden units and flipping signs, and a third unrelated one
 * put through the same test so that the check can fail.
 */
export const comparison = [
  { key: "same", label: "permuted and sign-flipped", agrees: true },
  { key: "unrelated", label: "an unrelated network", agrees: false },
] as const;

/** The transformations the prototype constructs and then verifies. */
export const symmetries = [
  { key: "permute", label: "relabel the hidden units" },
  { key: "sign", label: "flip signs in matched pairs" },
] as const;

/** What the diagnostics look for. Finite and numerical, on sampled inputs. */
export const diagnostics = [
  "exact and near-exact hidden-unit clones",
  "sampled non-degeneracy",
  "inactive contributions on sampled inputs",
] as const;

export const references = [
  { author: "Fefferman", year: 1994, title: "Reconstructing a Neural Net from Its Output" },
  {
    author: "Bona-Pellissier, Miche and Malgouyres",
    year: 2022,
    title: "Parameter Identifiability of Neural Networks with ReLU, Tanh, and Sigmoid Activations",
  },
  { author: "Petzka and Trimmel", year: 2020, title: "On the Identifiability of Neural Networks" },
] as const;

/**
 * A small fixed layout for the figure. Not a network that was trained.
 *
 * Typed as arrays of number and boolean rather than left to `as const`, which
 * would infer the literal values as the element type and make `indexOf` on a
 * plain number a type error.
 */
export const figure: {
  readonly hidden: number;
  readonly permutation: readonly number[];
  readonly flipped: readonly boolean[];
} = {
  hidden: 4,
  /** How the second network's hidden units are relabelled, for the drawing. */
  permutation: [2, 0, 3, 1],
  /** Which of them also carry a sign flip, for the drawing. */
  flipped: [false, true, false, true],
};
