/**
 * Keras against PyTorch on CIFAR-10: a translation, not a race.
 *
 * Read from the repository's README and asserted in its code:
 *
 *   model.py             the Keras translation and the hand-worked parameter count
 *   check_parameters.py  the count, asserted on every push, with no data and no fit
 *   data/cifar10_split_indices.json   the 15,000 indices, exported by running torch
 *
 * There is deliberately no Keras accuracy here. `results/` in that repository
 * contains only a `.gitkeep`, and the README's own table records the Keras test
 * accuracy as pending the Colab run. Publishing a number for it would be
 * inventing the one result the project has not produced.
 */

export const repository = "https://github.com/mzquadri/tf-keras-vs-pytorch-cifar10";

export const model = {
  /** Trainable parameters, asserted on every push rather than remembered. */
  parameters: 815018,
  trainImages: 13500,
  validationImages: 1500,
  subsetTotal: 15000,
  testImages: 10000,
  epochs: 12,
  /** The PyTorch run this is a translation of. */
  pytorchAccuracy: 64.26,
  kerasAccuracy: null,
} as const;

/**
 * The five differences between the frameworks, and what each one cost.
 *
 * `resolved` is the distinction the figure draws: four were corrected for, and
 * one is the irreducible floor on any comparison of this kind.
 */
export const differences = [
  {
    key: "decay",
    what: "Weight decay",
    why: "PyTorch adds the penalty to the gradient; Keras adds it to the loss, whose gradient carries a factor of two",
    handled: "halved to 5e-5",
    resolved: true,
  },
  {
    key: "schedule",
    what: "OneCycle schedule",
    why: "Keras has no OneCycle",
    handled: "reimplemented per batch",
    resolved: true,
  },
  {
    key: "dropout",
    what: "Channel dropout",
    why: "One framework drops whole channels, the other drops individual activations",
    handled: "SpatialDropout2D",
    resolved: true,
  },
  {
    key: "rng",
    what: "Augmentation draws",
    why: "Two random number streams cannot be made to draw the same crops and flips",
    handled: "definitions, not draws",
    resolved: true,
  },
  {
    key: "kernels",
    what: "Kernel reduction order",
    why: "Reduction orders differ between frameworks and between devices",
    handled: "accepted as the floor",
    resolved: false,
  },
] as const;

export const resolvedCount = differences.filter((d) => d.resolved).length;
export const totalCount = differences.length;

/**
 * The trap the parameter count does not catch, kept because it is the point of
 * the assertion being called a floor rather than a proof.
 */
export const missedByTheCount = {
  what: "two dropout rates, not one",
  detail:
    "The reference uses 0.25 in the conv blocks and 0.5 in the classifier head. Reusing the conv rate halves the regularisation in the head, and because dropout carries no weights the count still lands on 815,018.",
} as const;
