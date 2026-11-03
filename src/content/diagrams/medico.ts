import type { ProjectDiagram } from "./types";

/**
 * A classifier whose hardest design decision is about absence.
 *
 * Deliberately carries no `tools` and no `stages`. This work is not in the project registry -
 * `work-routes.ts` explains why - so there is no `tools` list for `validate:content` to check a
 * claim against and no `workflow` for a stage index to point into. A field that cannot be
 * validated is a field that can quietly become wrong, so the honest thing is to leave both empty
 * rather than to assert technologies on a page whose whole argument is about not claiming more
 * than the evidence supports.
 *
 * The structure is from `medico/splits.py` and `ai-radiologist/`. Two decisions are worth the
 * drawing.
 *
 * Splits are by patient and not by image, because a chest appears more than once and splitting by
 * image puts the same patient on both sides of the evaluation. It is a gate rather than a step
 * because getting it wrong does not raise an error - it produces a better number.
 *
 * The masking gate is the project. Three corpora disagree about which findings they annotate at
 * all, and a report that never mentions a finding has not ruled it out. Training as though silence
 * meant absence would teach the model that unlabelled is negative, so channels a corpus cannot
 * speak to drop out of the loss instead. The return path says what that commits you to: silence is
 * not absence, and the corpora have to be read that way from the start.
 *
 * It ends in a terminal box that publishes nothing, which is accurate. There are no trained
 * weights, no held-out metrics and no clinical validation.
 */
export const medicoDiagram: ProjectDiagram = {
  slug: "medico",
  title: "Fourteen channels, and the ones a corpus cannot speak to",
  caption:
    "A report that never mentions a finding has not ruled it out. Channels a corpus cannot label drop out of the loss rather than counting as negative - and the split is by patient, because splitting by image would quietly improve the score.",
  accent: "var(--accent-pipeline)",
  nodes: [
    {
      id: "corpora",
      label: "Three chest corpora",
      kind: "source",
      col: 0,
      row: 1,
      note: "They disagree about which findings they annotate at all.",
    },
    {
      id: "splits",
      label: "Split by patient",
      kind: "gate",
      col: 1,
      row: 1,
      note: "Not by image. One chest appears more than once.",
    },
    {
      id: "model",
      label: "Multi-label classifier",
      kind: "process",
      col: 2,
      row: 1,
      note: "Fourteen finding channels, each decided independently.",
    },
    {
      id: "masked",
      label: "Unlabelled channels masked",
      kind: "gate",
      col: 3,
      row: 0,
      note: "A finding a corpus cannot label drops out rather than counting as absent.",
    },
    {
      id: "saliency",
      label: "Saliency",
      kind: "artifact",
      col: 3,
      row: 2,
      note: "Where the evidence for a channel was read from.",
    },
    {
      id: "nothing",
      label: "No published result",
      kind: "sink",
      col: 4,
      row: 1,
      note: "No trained weights, no held-out metrics, no clinical validation.",
    },
  ],
  edges: [
    { from: "corpora", to: "splits", kind: "data" },
    { from: "splits", to: "model", kind: "data" },
    { from: "model", to: "masked", kind: "control" },
    { from: "model", to: "saliency", kind: "data" },
    { from: "masked", to: "nothing", kind: "data" },
    { from: "saliency", to: "nothing", kind: "data" },
    { from: "masked", to: "corpora", kind: "feedback", label: "silence is not absence" },
  ],
};
