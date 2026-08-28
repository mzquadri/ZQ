import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * The reliable-knowledge sequence.
 *
 * A machine taken apart and put back together. It opens sealed, exposes the one thing at its centre
 * that cannot be rebuilt, separates the three derived representations around it, runs verification
 * *backwards* from each of them to that centre, breaks one, shows the health verdict change, throws
 * the broken branch away and rebuilds it from evidence, then closes.
 *
 * The reverse direction is the signature. Almost every pipeline diagram points one way, source to
 * output, and stops there; the interesting engineering is the return path that asks whether what
 * was stored still agrees with what it came from.
 */

export type ReliableKey =
  | "sealed"
  | "core"
  | "capture"
  | "split"
  | "structured"
  | "semantic"
  | "relational"
  | "verify"
  | "mismatch"
  | "health"
  | "rebuild"
  | "settled"
  | "limits";

export const STATES: readonly WorldState<ReliableKey>[] = [
  {
    key: "sealed",
    from: 0.0,
    to: 0.07,
    label: "A sealed machine",
    caption: "One assembly. From outside, a knowledge system either answers or it does not.",
  },
  {
    key: "core",
    from: 0.07,
    to: 0.15,
    label: "The core",
    caption: "At the centre, the one thing that cannot be rebuilt from anything else.",
  },
  {
    key: "capture",
    from: 0.15,
    to: 0.22,
    label: "Capture",
    caption: "Before anything is transformed, what arrived is kept exactly, and fingerprinted.",
  },
  {
    key: "split",
    from: 0.22,
    to: 0.32,
    label: "Three derived views",
    caption: "Not stages in a sequence. Three simultaneous descriptions of the same thing, all disposable.",
  },
  {
    key: "structured",
    from: 0.32,
    to: 0.4,
    label: "Structured records",
    caption: "Explicit state: ordered records with stable identities, answerable exactly.",
  },
  {
    key: "semantic",
    from: 0.4,
    to: 0.48,
    label: "Semantic index",
    caption: "Passages placed so that distance means similarity. Approximate by construction.",
  },
  {
    key: "relational",
    from: 0.48,
    to: 0.56,
    label: "Relationship graph",
    caption: "Entities and connections, keeping the structure flat records flatten away.",
  },
  {
    key: "verify",
    from: 0.56,
    to: 0.66,
    label: "Verification runs backwards",
    caption: "Every derived view is asked the same question: do you still agree with the evidence?",
  },
  {
    key: "mismatch",
    from: 0.66,
    to: 0.75,
    label: "One branch drifts",
    caption: "A derived view answers from an older build. Nothing about it looks broken from inside.",
  },
  {
    key: "health",
    from: 0.75,
    to: 0.83,
    label: "The verdict changes",
    caption: "Health is a conjunction of invariants, so the useful output names which one failed.",
  },
  {
    key: "rebuild",
    from: 0.83,
    to: 0.91,
    label: "Rebuild",
    caption: "The derived branch is discarded and reconstructed from evidence. The core never moves.",
  },
  {
    key: "settled",
    from: 0.91,
    to: 0.96,
    label: "Verified, and visible",
    caption: "All four invariants hold again, and the machine can say so about itself.",
  },
  {
    key: "limits",
    from: 0.96,
    to: 1.0,
    label: "What this is not",
    caption: "A synthetic model of a class of problem. No architecture, technology or scale from any real system.",
  },
];

export const { at, active } = choreograph(STATES);

/**
 * The camera, one keyframe per state.
 *
 * Mechanical rather than atmospheric, because the subject is a machine. It starts outside the
 * closed assembly, pushes in as the housing opens, holds close and nearly level while each module
 * is inspected, tracks along the verification paths on the return leg, drops for the fault, pulls
 * out for the rebuild so the whole assembly is in frame while one part of it reforms, and settles
 * back outside.
 *
 * Yaw runs continuously negative across the sequence, so the whole thing is one move around the
 * machine rather than a series of cuts back to the same side.
 */
export const SHOTS: Record<ReliableKey, { height: number; distance: number; look: number; yaw: number }> = {
  sealed: { height: 1.6, distance: 8.6, look: 0.0, yaw: -0.25 },
  core: { height: 0.9, distance: 5.4, look: 0.0, yaw: -0.5 },
  capture: { height: 1.1, distance: 5.0, look: 0.05, yaw: -0.75 },
  split: { height: 3.4, distance: 10.2, look: 0.1, yaw: -1.0 },
  structured: { height: 1.3, distance: 6.2, look: 0.15, yaw: -1.35 },
  semantic: { height: 1.5, distance: 6.6, look: 0.15, yaw: -2.35 },
  relational: { height: 1.4, distance: 6.4, look: 0.15, yaw: -3.35 },
  verify: { height: 2.8, distance: 9.4, look: 0.1, yaw: -3.9 },
  mismatch: { height: 1.2, distance: 8.2, look: 0.2, yaw: -4.35 },
  health: { height: 2.4, distance: 8.8, look: 0.95, yaw: -4.6 },
  rebuild: { height: 3.6, distance: 10.6, look: 0.05, yaw: -4.9 },
  settled: { height: 2.2, distance: 9.4, look: 0.8, yaw: -5.2 },
  limits: { height: 1.4, distance: 9.8, look: 0.0, yaw: -5.5 },
};
