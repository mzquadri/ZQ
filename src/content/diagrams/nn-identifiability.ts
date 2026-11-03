import type { ProjectDiagram } from "./types";

/**
 * A test that has to fail on something, or it is not a test.
 *
 * `src/network_isomorphisms.py` constructs the relabelling, `identifiability_checks.py` runs the
 * two comparisons and `tests/test_isomorphisms.py` holds them.
 *
 * The two checks are drawn as separate gates because they ask genuinely different questions and
 * the interesting case is where they disagree. Two networks agreeing on every sampled input says
 * the functions match; their parameters aligning under the relabelling says the *weights* match
 * up to the symmetry. The question the project is about is whether the first implies the second,
 * so collapsing them into one "verify" box would erase the subject.
 *
 * The unrelated network is drawn as a second source entering the verdict, because that is the
 * part that makes the rest meaningful. A check that only ever sees pairs it should accept has not
 * been shown to be capable of rejecting anything, so an unrelated network goes through the
 * identical test and must fail it.
 */
export const identifiabilityDiagram: ProjectDiagram = {
  slug: "nn-identifiability",
  title: "Two networks, two different questions about sameness",
  caption:
    "Agreeing on every input and having matching parameters are different claims, which is why they are two gates rather than one. The unrelated network is there so the test is shown capable of rejecting something.",
  accent: "var(--accent-corpus)",
  nodes: [
    {
      id: "network",
      label: "A small network",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      tools: ["PyTorch"],
      note: "Fully connected, small enough to reason about exhaustively.",
    },
    {
      id: "transform",
      label: "Relabelled and flipped",
      kind: "process",
      col: 1,
      row: 1,
      stages: [1],
      tools: ["NumPy"],
      note: "Hidden units permuted, and two of them sign-flipped.",
    },
    {
      id: "functional",
      label: "Agree on inputs?",
      kind: "gate",
      col: 2,
      row: 0,
      stages: [2],
      note: "The two networks evaluated on sampled points.",
    },
    {
      id: "parametric",
      label: "Parameters align?",
      kind: "gate",
      col: 2,
      row: 2,
      stages: [3],
      note: "Under that exact relabelling, not up to anything looser.",
    },
    {
      id: "control",
      label: "Unrelated network",
      kind: "source",
      col: 2,
      row: 3,
      stages: [4],
      note: "Put through the identical test, and required to fail it.",
    },
    {
      id: "verdict",
      label: "Identified",
      kind: "artifact",
      col: 3,
      row: 1,
      tools: ["unittest"],
      note: "Both checks pass and the control fails, or the claim is not made.",
    },
  ],
  edges: [
    { from: "network", to: "transform", kind: "data" },
    { from: "transform", to: "functional", kind: "control" },
    { from: "transform", to: "parametric", kind: "control" },
    { from: "functional", to: "verdict", kind: "data" },
    { from: "parametric", to: "verdict", kind: "data" },
    { from: "control", to: "verdict", kind: "refused", label: "must not pass" },
    { from: "verdict", to: "network", kind: "feedback", label: "same answers, different weights" },
  ],
};
