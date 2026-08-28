import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * The medico sequence.
 *
 * A chest-X-ray classifier taken apart in the order the script actually processes an image: the
 * radiograph, what is done to it, where it came from, what its labels do and do not say, the
 * network, the head, the loss that decides which of those labels are allowed to teach anything,
 * the evaluation, and the four boundaries the repository states about itself.
 *
 * The label state is deliberately the longest stretch. It is the part of this project that is
 * genuinely unusual - three corpora that disagree about what they are even labelling - and it is
 * also the only honest centre for a scene about a model with no published results.
 */

export type MedicoKey =
  | "radiograph"
  | "preprocess"
  | "sources"
  | "labels"
  | "mask"
  | "network"
  | "reuse"
  | "head"
  | "loss"
  | "evaluation"
  | "limits";

export const STATES: readonly WorldState<MedicoKey>[] = [
  {
    key: "radiograph",
    from: 0.0,
    to: 0.08,
    label: "Radiograph",
    caption: "One grayscale chest image, 224 pixels square. Synthetic here: the corpora are not redistributable.",
  },
  {
    key: "preprocess",
    from: 0.08,
    to: 0.17,
    label: "Preprocessing",
    caption: "Resize, crop, CLAHE, flip, rotate, normalise - and validation uses the same chain minus the augmentation.",
  },
  {
    key: "sources",
    from: 0.17,
    to: 0.27,
    label: "Three sources",
    caption: "CheXpert, NIH ChestX-ray14 and a binary pneumonia set, split by patient rather than by image.",
  },
  {
    key: "labels",
    from: 0.27,
    to: 0.38,
    label: "Label space",
    caption: "Fourteen findings. Only one of the three sources can speak to all of them.",
  },
  {
    key: "mask",
    from: 0.38,
    to: 0.5,
    label: "What is unknown",
    caption: "Uncertain is not negative, and unlabelled is not negative. Both are masked out instead.",
  },
  {
    key: "network",
    from: 0.5,
    to: 0.61,
    label: "DenseNet-121",
    caption: "Four dense blocks of 6, 12, 24 and 16 layers, with a transition between each.",
  },
  {
    key: "reuse",
    from: 0.61,
    to: 0.7,
    label: "Feature reuse",
    caption: "Inside a block every layer receives the output of all the layers before it.",
  },
  {
    key: "head",
    from: 0.7,
    to: 0.78,
    label: "Head",
    caption: "1024 pooled features to 512 to fourteen logits - one per finding, all independent.",
  },
  {
    key: "loss",
    from: 0.78,
    to: 0.88,
    label: "Masked focal loss",
    caption: "Five terms multiplied together. The last one can zero the whole thing.",
  },
  {
    key: "evaluation",
    from: 0.88,
    to: 0.95,
    label: "Evaluation",
    caption: "AUC per finding over certain labels only, and the checkpoint is chosen on the worst class.",
  },
  {
    key: "limits",
    from: 0.95,
    to: 1.0,
    label: "Where it stops",
    caption: "A research prototype. No weights, no patient data, no held-out metrics, no clinical validation.",
  },
];

export const { at, active } = choreograph(STATES);

/**
 * The camera, one keyframe per state.
 *
 * Deliberately not the transport world's language. That one orbits a plan view of a city, because
 * a road network is a thing you look down on. A radiograph is a thing you stand in front of and
 * hold up to a light, so this starts square-on and stays close to frontal, drifting only far
 * enough off-axis to show that the layers have depth, then pushing through the blocks and settling
 * back to square-on for the boundaries at the end.
 */
export const SHOTS: Record<MedicoKey, { height: number; distance: number; look: number; yaw: number }> = {
  radiograph: { height: 0.0, distance: 6.6, look: 0.0, yaw: 0.0 },
  preprocess: { height: 0.9, distance: 8.4, look: 0.1, yaw: -0.34 },
  /*
   * The label states are shot nearly square-on.
   *
   * A matrix has to be read as a grid, and at a wide yaw the three source rows sheared into one
   * diagonal band - the reader could see coloured cells but not that there were three rows or
   * which findings lined up beneath each other. Angle is spent on the sources arriving, then the
   * camera straightens for the two states where the grid itself is the subject.
   */
  sources: { height: 1.6, distance: 9.6, look: 0.15, yaw: -0.26 },
  labels: { height: 0.45, distance: 8.2, look: 0.15, yaw: -0.06 },
  mask: { height: 0.35, distance: 7.8, look: 0.15, yaw: -0.03 },
  network: { height: 1.5, distance: 13.4, look: 0.0, yaw: -0.55 },
  reuse: { height: 0.9, distance: 6.4, look: 0.0, yaw: -0.78 },
  head: { height: 0.7, distance: 7.6, look: 0.0, yaw: -0.24 },
  loss: { height: 0.6, distance: 7.8, look: 0.1, yaw: -0.12 },
  evaluation: { height: 0.8, distance: 8.6, look: 0.1, yaw: -0.08 },
  limits: { height: 0.4, distance: 9.4, look: 0.0, yaw: 0.0 },
};
