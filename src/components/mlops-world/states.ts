import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * The model release machine.
 *
 * One artifact travels the whole length of this sequence and is the only thing that does. It is
 * assembled from a dataset, sealed, carried to a gate of four checks, refused once, sent back,
 * rebuilt, passed, registered to staging, promoted to production, mounted into a service, and then
 * watched. The camera follows the artifact rather than touring the machine.
 *
 * Every stage exists in the repository. There is no orchestration layer, no cluster and no cloud
 * here because there is none there: the release path is a bundle on disk, a registry directory with
 * stages, and one service that mounts exactly one production bundle.
 */

export type MlopsKey =
  | "sealed"
  | "data"
  | "training"
  | "artifact"
  | "gate"
  | "rejected"
  | "rebuilt"
  | "passed"
  | "staging"
  | "promotion"
  | "serving"
  | "monitoring"
  | "limits";

export const STATES: readonly WorldState<MlopsKey>[] = [
  {
    key: "sealed",
    from: 0.0,
    to: 0.07,
    label: "The machine, closed",
    caption: "Training a model is the easy part. This is everything around it.",
  },
  {
    key: "data",
    from: 0.07,
    to: 0.15,
    label: "Data, checked first",
    caption: "Downloaded, checksum-verified, then measured for nulls, duplicates and class balance.",
  },
  {
    key: "training",
    from: 0.15,
    to: 0.23,
    label: "Fitting, in one place only",
    caption: "A single function is allowed to fit. Everywhere else transforms, which makes leakage testable.",
  },
  {
    key: "artifact",
    from: 0.23,
    to: 0.31,
    label: "The bundle",
    caption: "Model, transformers, metrics and lineage sealed together with a checksum manifest.",
  },
  {
    key: "gate",
    from: 0.31,
    to: 0.42,
    label: "Four checks",
    caption: "The gate is a conjunction. Any one failing is enough to stop the artifact here.",
  },
  {
    key: "rejected",
    from: 0.42,
    to: 0.52,
    label: "Refused",
    caption: "The margin over the baseline falls short. The gate stays shut and the candidate goes no further.",
  },
  {
    key: "rebuilt",
    from: 0.52,
    to: 0.6,
    label: "Back to the start",
    caption: "A rejected candidate is not patched. Another one is built and measured from scratch.",
  },
  {
    key: "passed",
    from: 0.6,
    to: 0.69,
    label: "All four hold",
    caption: "Accuracy, weighted F1, margin over baseline, and latency. Only now can it be registered.",
  },
  {
    key: "staging",
    from: 0.69,
    to: 0.77,
    label: "Staging",
    caption: "Registering requires an evaluated bundle whose gate passed. Production cannot be registered directly.",
  },
  {
    key: "promotion",
    from: 0.77,
    to: 0.85,
    label: "Promotion",
    caption: "A separate, deliberate step. The previous production version is archived rather than overwritten.",
  },
  {
    key: "serving",
    from: 0.85,
    to: 0.92,
    label: "Serving",
    caption: "One service over exactly one production bundle. It starts unready and answers 503 until a model loads.",
  },
  {
    key: "monitoring",
    from: 0.92,
    to: 0.97,
    label: "Watched, modestly",
    caption: "A counter endpoint, and the honesty to call it that rather than a monitoring system.",
  },
  {
    key: "limits",
    from: 0.97,
    to: 1.0,
    label: "What it is not",
    caption: "A reference implementation. No production traffic has ever hit it.",
  },
];

export const { at, active } = choreograph(STATES);

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one tracks. The other worlds orbit a subject, stand in front of one, or
 * fly through a stack; here the artifact moves along a rail from left to right and the camera moves
 * with it, so the reader is travelling the length of a machine rather than inspecting a still
 * object. It stops when the artifact stops - the gate, the refusal - and only pulls back for the
 * two states where the whole machine matters: the rebuild, and the ending.
 */
export const SHOTS: Record<MlopsKey, { height: number; distance: number; look: number; track: number }> = {
  sealed: { height: 1.9, distance: 9.4, look: 0.0, track: 0.0 },
  data: { height: 1.2, distance: 5.6, look: 0.1, track: -4.6 },
  training: { height: 1.0, distance: 5.0, look: 0.15, track: -3.0 },
  artifact: { height: 0.8, distance: 3.9, look: 0.15, track: -1.4 },
  gate: { height: 0.9, distance: 4.6, look: 0.2, track: 0.2 },
  rejected: { height: 0.7, distance: 4.2, look: 0.15, track: 0.6 },
  rebuilt: { height: 3.2, distance: 10.4, look: 0.1, track: -1.6 },
  passed: { height: 0.9, distance: 4.6, look: 0.2, track: 0.4 },
  staging: { height: 1.0, distance: 4.8, look: 0.2, track: 2.2 },
  promotion: { height: 1.1, distance: 5.2, look: 0.2, track: 3.6 },
  serving: { height: 1.0, distance: 4.8, look: 0.15, track: 5.2 },
  monitoring: { height: 2.0, distance: 7.6, look: 0.1, track: 3.4 },
  limits: { height: 2.6, distance: 11.0, look: 0.0, track: 0.0 },
};
