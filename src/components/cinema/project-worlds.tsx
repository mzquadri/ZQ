import type { ReactNode } from "react";

import BranchFlat from "@/components/scene/BranchFlat";
import { BranchCanvas } from "@/components/scene/ProjectedCanvases";
import {
  EnsembleScene,
  FeatureMapScene,
  GraphSurrogateScene,
  HorizonScene,
  PipelineScene,
  RetrievalScene,
} from "@/components/cinema/scenes";
import MedicoMatrix from "@/components/medico-world/MedicoMatrix";
import { getProject, type Project } from "@/content/portfolio";

/*
 * The exhibition manifest: what each chapter of the homepage reel is.
 *
 * This used to be a smaller table describing a figure and an accent, because the homepage was a
 * list of case-study cards and the figure was decoration above a summary. It is now the running
 * order of a reel, so it carries what a chapter needs to stand on its own: the one engineering
 * question the project answers, the one measured line that answers it, and the seam that carries
 * the eye into the next chapter.
 *
 * Two entries here were previously bolted on elsewhere. Reliable knowledge systems was a section
 * further down the page, after the reel had already ended; medico was appended after the sequence
 * closed. Both are flagship work with complete detail worlds, and both now sit in the running
 * order at the position the work deserves rather than where the page happened to grow.
 *
 * The order is deliberate and is not the order of the case studies: research, then current
 * engineering, then the applied systems, then the three studies about measurement and error. A
 * visitor who stops a third of the way in has still seen what I do now.
 */

export interface ProjectWorld {
  accent: string;
  /** The exhibition title. Shorter than the case-study title, and states the finding. */
  title: string;
  eyebrow: string;
  /** The one question the project answers. Not a summary of it. */
  question: string;
  /** One measured line. Never written here - taken from the project's evidence registry. */
  evidence: { label: string; value: string };
  href: string;
  /** One line naming what the figure does. Not a restatement of the project summary. */
  figureNote: string;
  scale: "flagship" | "compact";
  scene: (project: Project | null) => ReactNode;
  /**
   * The handoff into the next chapter.
   *
   * `from` and `to` name the two objects and the seam between the chapters draws one becoming the
   * other. These are only written where the reading is honest - a junction really is a thing other
   * values are derived from, in the same sense a captured source is. Where no such reading exists,
   * the field is omitted and the two chapters simply meet.
   */
  seam?: { from: string; to: string; note: string };
}

/** Evidence lines come from the portfolio registry, so a chapter cannot drift from its case study. */
function evidenceOf(slug: string, index = 0) {
  const item = getProject(slug)?.evidence[index];
  return item ? { label: item.label, value: item.value } : { label: "", value: "" };
}

export const PROJECT_WORLDS: Readonly<Record<string, ProjectWorld>> = {
  "transport-uq": {
    accent: "var(--accent-graph)",
    title: "When can a surrogate stand in for a simulation?",
    eyebrow: "Master's thesis / Transport",
    question:
      "A graph network answers in milliseconds what a traffic simulator takes hours to compute. The question is not whether it is fast. It is when it may be believed.",
    evidence: evidenceOf("transport-uq"),
    href: "/work/transport-uq",
    figureNote:
      "Information spreads through a fixed road network, then each junction carries how unsure the surrogate is there.",
    scale: "flagship",
    scene: () => <GraphSurrogateScene />,
    seam: {
      from: "junction",
      to: "source",
      note: "A node other values are derived from becomes a source other representations are derived from.",
    },
  },

  "reliable-knowledge-systems": {
    accent: "var(--accent-retrieval)",
    title: "Keeping derived state honest",
    eyebrow: "Current engineering / Synthetic model",
    question:
      "One captured source becomes an index, a graph and a cache. Days later, is any of them still telling the truth about it?",
    evidence: { label: "Public-safe model", value: "Synthetic throughout" },
    href: "/work/reliable-knowledge-systems",
    figureNote:
      "One capture, three derived forms, and a check that runs backwards from each of them to the evidence.",
    scale: "flagship",
    scene: () => <BranchCanvas flat={<BranchFlat />} />,
    seam: {
      from: "representation",
      to: "image",
      note: "A derived plate becomes the plate a diagnosis would be derived from.",
    },
  },

  medico: {
    accent: "var(--accent-pipeline)",
    title: "Uncertain is not negative",
    eyebrow: "Research prototype / Medical imaging",
    question:
      "A chest report that never mentions a finding has not ruled it out. Training a classifier as though it had is the mistake this project is about.",
    evidence: { label: "Published performance", value: "None" },
    href: "/work/medico",
    figureNote:
      "Fourteen finding channels lift off a chest image. The ones a corpus cannot label drop away rather than counting as absent.",
    scale: "flagship",
    scene: () => <MedicoMatrix />,
    seam: {
      from: "image",
      to: "page",
      note: "One plate of pixels becomes one page of text, and both have to be identified before they are used.",
    },
  },

  "insureassist-rag": {
    accent: "var(--accent-corpus)",
    title: "The right provision from the wrong policy",
    eyebrow: "Reference implementation / Retrieval",
    question:
      "Three policy forms differ by a few words. The nearest passage can be the correct clause taken from the wrong document, and read exactly like the answer.",
    evidence: evidenceOf("insureassist-rag"),
    href: "/work/insureassist-rag",
    figureNote:
      "The nearest passage can be the right provision from the wrong policy form. Three near-duplicate forms make that the whole problem.",
    scale: "flagship",
    scene: () => <RetrievalScene />,
    seam: {
      from: "evidence",
      to: "artifact",
      note: "A packet that has to carry where it came from becomes a bundle that has to earn where it is going.",
    },
  },

  "mlops-reference-pipeline": {
    accent: "var(--accent-systems)",
    title: "An unqualified model cannot reach release",
    eyebrow: "Reference implementation / Delivery",
    question:
      "Promotion is not the next box along a diagram. It is a conjunction of four checks, and one short check stops the candidate where it stands.",
    evidence: evidenceOf("mlops-reference-pipeline"),
    href: "/work/mlops-reference-pipeline",
    figureNote:
      "Promotion is a conjunction of four checks, not the next box along. One short check and the candidate stops here.",
    scale: "flagship",
    scene: (project) => <PipelineScene stages={project?.workflow ?? []} />,
    seam: {
      from: "rail",
      to: "axis",
      note: "The line a release travels along becomes the line a measurement is plotted against.",
    },
  },

  "hydrology-uq": {
    accent: "var(--accent-flow)",
    title: "Two perturbations, one that matters",
    eyebrow: "TUM project seminar / Hydrology",
    question:
      "Disturb the rain and a calibrated model barely notices. Disturb the ruler the river was measured with and the calibration collapses.",
    evidence: evidenceOf("hydrology-uq"),
    href: "/work/hydrology-uq",
    figureNote:
      "Two perturbations of one calibrated event, on one scale. The rain barely moves it; the ruler the discharge was measured with moves it 356 times as far.",
    scale: "compact",
    scene: () => <EnsembleScene />,
    seam: {
      from: "hydrograph",
      to: "series",
      note: "One event measured through a curve becomes fifteen years measured every day.",
    },
  },

  "streamflow-forecasting": {
    accent: "var(--accent-flow)",
    title: "Three numbers, three different questions",
    eyebrow: "Scientific computing / Benchmark",
    question:
      "A leaderboard invites one reading: rank the rows. These three were not scored on the same task, and the gap between the questions is wider than the gap between the models.",
    evidence: evidenceOf("streamflow-forecasting"),
    href: "/work/streamflow-forecasting",
    figureNote:
      "R² 0.979 on synthetic data, one step ahead with yesterday's measurement supplied. The two lines overlap because of what the model was given.",
    scale: "compact",
    scene: () => <HorizonScene />,
    seam: {
      from: "window",
      to: "grid",
      note: "A window over time becomes a grid over space, and both are read a few cells at a time.",
    },
  },

  "cifar10-cnn": {
    accent: "var(--accent-vision)",
    title: "One number covering ten",
    eyebrow: "Deep learning experiment / Vision",
    question:
      "Sixty-four percent is the mean of ten very different numbers, and the boundary the model learned best is not one of the ten it was asked for.",
    evidence: evidenceOf("cifar10-cnn"),
    href: "/work/cifar10-cnn",
    figureNote:
      "One number covering ten very different ones: 64.26% overall, from 33.5% on cat to 82.0% on automobile.",
    scale: "compact",
    scene: () => <FeatureMapScene />,
  },
};

/**
 * The running order of the reel.
 *
 * Research, then what I do now, then the applied systems, then the three studies about measurement
 * and error. Not the order of the case studies and not alphabetical: it is the order that makes
 * the strongest opening.
 */
export const WORLD_ORDER: readonly string[] = [
  "transport-uq",
  "reliable-knowledge-systems",
  "medico",
  "insureassist-rag",
  "mlops-reference-pipeline",
  "hydrology-uq",
  "streamflow-forecasting",
  "cifar10-cnn",
];
