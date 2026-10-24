import type { ReactNode } from "react";

import BranchFlat from "@/components/scene/BranchFlat";
import { BranchCanvas } from "@/components/scene/ProjectedCanvases";
import {
  DriftScene,
  EnsembleScene,
  FeatureMapScene,
  GraphSurrogateScene,
  HorizonScene,
  MarginIntervalScene,
  ModalSplitScene,
  ParityScene,
  FloodScene,
  BatteryScene,
  ClaimsThresholdScene,
  WaterIntervalScene,
  IdentifiabilityScene,
  ReleaseScene,
  TranslationScene,
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
 * further down the page, after the sequence had already ended; medico was appended after it
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
    title: "Uncertainty Quantification for Traffic Prediction (Project)",
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
      from: "uncertainty",
      to: "judgement",
      note: "A measure of how unsure a model is becomes the one control that is allowed to be unsure.",
    },
  },

  "mcp-policy-gateway": {
    accent: "var(--accent-steel)",
    title: "MCP Policy Gateway",
    eyebrow: "Current engineering / Agent security",
    question:
      "A tool description can be scanned before anyone calls it. The document that tool returns cannot; it does not exist yet. So what is worth putting at the boundary itself, and what does it cost in refused legitimate calls?",
    evidence: evidenceOf("mcp-policy-gateway"),
    href: "/work/mcp-policy-gateway",
    figureNote:
      "Three lanes of traffic reach a boundary and get three different answers: pass, stop, or strip and continue.",
    scale: "flagship",
    /*
     * No legacy figure. This project was added after the procedural scene runtime, so SCENES is
     * the only rendering it has ever had. The field is required by the manifest, so it returns
     * nothing rather than pretending to a second figure.
     */
    scene: () => null,
    seam: {
      from: "boundary",
      to: "capture",
      note: "A record of what was allowed to cross becomes the captured source everything downstream is checked against.",
    },
  },

  "reliable-knowledge-systems": {
    accent: "var(--accent-retrieval)",
    title: "Legal Knowledge Base",
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
    title: "AI Radiologist",
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
    title: "InsureAssist",
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
    title: "MLOps Pipeline",
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

  "nn-identifiability": {
    accent: "var(--accent-corpus)",
    title: "Same Answers, Different Weights",
    eyebrow: "Academic seminar / Mathematics",
    question:
      "Two networks with identical weights do the same thing. The interesting question is the reverse: if two networks agree on every input, must their parameters be the same?",
    evidence: evidenceOf("nn-identifiability"),
    href: "/work/nn-identifiability",
    figureNote:
      "What the code constructs: one network, the same network with its hidden units relabelled and two of them sign-flipped, and the verdict of comparing them.",
    scale: "compact",
    scene: () => <IdentifiabilityScene />,
    seam: {
      from: "weights",
      to: "ceiling",
      note: "Parameters that cannot be recovered becomes a score that cannot be exceeded.",
    },
  },

  "water-quality": {
    accent: "var(--accent-flow)",
    title: "The Ranking the Run Does Not Support",
    eyebrow: "Synthetic demonstration / Classification",
    question:
      "Five models, a table ordering them by score, and a clear winner in bold. The same run also recorded how much each model moved between folds - so how many of those places are real?",
    evidence: evidenceOf("water-quality"),
    href: "/work/water-quality",
    figureNote:
      "Cross-validated F1 with one-standard-deviation intervals. The shaded column is the range consistent with all three contenders at once.",
    scale: "compact",
    scene: () => <WaterIntervalScene />,
  },

  "insurance-claims-threshold": {
    accent: "var(--accent-systems)",
    title: "A Probability Is Not a Decision",
    eyebrow: "Research pipeline / Classification",
    question:
      "A claims model gives every policy a number. Someone still has to decide which numbers are worth acting on - and the cost of being wrong is wildly different in the two directions, so where does the line actually belong?",
    evidence: evidenceOf("insurance-claims-threshold"),
    href: "/work/insurance-claims-threshold",
    figureNote:
      "The value of acting on a policy and the value of leaving it alone, over its probability of claiming. They cross once, and nowhere near one half.",
    scale: "compact",
    scene: () => <ClaimsThresholdScene />,
  },

  "battery-soc": {
    accent: "var(--accent-steel)",
    title: "The Gauge Drifts Before the Battery Does",
    eyebrow: "Research prototype / Time series",
    question:
      "A lithium-ion cell has no fuel gauge, so charge has to be inferred from voltage, current and temperature. What happens to that inference when the cell ages and the voltage curve it was calibrated against quietly moves?",
    evidence: evidenceOf("battery-soc"),
    href: "/work/battery-soc",
    figureNote:
      "The generator's own voltage formula at two cycle counts, evaluated rather than drawn, with the charge a fresh-cell lookup gives away marked between the two curves.",
    scale: "compact",
    scene: () => <BatteryScene />,
  },

  "flood-lstm": {
    accent: "var(--accent-flow)",
    title: "What the Network Adds Over a Calendar",
    eyebrow: "Synthetic demonstration / Time series",
    question:
      "On a signal whose composition is known exactly, does a network reading a weather window beat the simplest thing you would try first? It does, by 0.019, and the honest version of the result is that number rather than the headline.",
    evidence: evidenceOf("flood-lstm"),
    href: "/work/flood-lstm",
    figureNote:
      "An axis from nothing to the ceiling that independent noise imposes. The calendar and the network land almost on top of each other, and the axis is not truncated to hide it.",
    scale: "compact",
    scene: () => <FloodScene />,
    seam: {
      from: "ceiling",
      to: "frames",
      note: "A limit nothing can beat becomes a sheet nobody could read.",
    },
  },

  "audi-release-tracking": {
    accent: "var(--accent-vision)",
    title: "A Wide Sheet, and Four Frames",
    eyebrow: "Employer engineering / Internship",
    question:
      "The answer was already in the sheet. Finding it meant reading across a screen that did not fit on a screen, many times a day, and the column order was an accident of how the sheet had grown.",
    evidence: evidenceOf("audi-release-tracking"),
    href: "/work/audi-release-tracking",
    figureNote:
      "What the work actually produced: a sheet too wide to read becoming four frames grouped by subject rather than by column order.",
    scale: "compact",
    scene: () => <ReleaseScene />,
    seam: {
      from: "frames",
      to: "translation",
      note: "Fields regrouped for a reader becomes a model rebuilt for a second framework.",
    },
  },

  "keras-pytorch-parity": {
    accent: "var(--accent-pipeline)",
    title: "A Translation, Not a Race",
    eyebrow: "Reproducible experiment / Frameworks",
    question:
      "Rebuilding a model in a second framework is easy to do loosely. The useful question is which differences between the two cannot be removed at all, and what each one costs.",
    evidence: evidenceOf("keras-pytorch-parity"),
    href: "/work/keras-pytorch-parity",
    figureNote:
      "The five differences between the frameworks and how each was handled. Four were corrected for; the reduction order of the kernels is the floor.",
    scale: "compact",
    scene: () => <TranslationScene />,
    seam: {
      from: "translation",
      to: "share",
      note: "Two implementations of one model becomes one measurement across thirty-five countries.",
    },
  },

  "eurostat-modal-split": {
    accent: "var(--accent-flow)",
    title: "Twenty-Four Years, Half a Point",
    eyebrow: "Reproducible experiment / Official statistics",
    question:
      "The share of inland passenger distance taken by car in the EU was 82.0 per cent in 2000. In 2024 it is 82.5. The finding is the absence of a finding, which is harder to publish than a trend.",
    evidence: evidenceOf("eurostat-modal-split"),
    href: "/work/eurostat-modal-split",
    figureNote:
      "One axis of car share carrying both comparisons: what 24 years of policy moved, and what differs between two countries in a single year.",
    scale: "compact",
    scene: () => <ModalSplitScene />,
    seam: {
      from: "share",
      to: "series",
      note: "A share that did not move becomes a series measured every month to see whether anything does.",
    },
  },

  "bm25-rrf-java": {
    accent: "var(--accent-corpus)",
    title: "Two Implementations, One Ranking",
    eyebrow: "Reference implementation / Retrieval",
    question:
      "Rewriting BM25 in another language is not the hard part. Getting it to return the same order, when two of the scores differ in the fourth decimal, is.",
    evidence: evidenceOf("bm25-rrf-java"),
    href: "/work/bm25-rrf-java",
    figureNote:
      "One real ranking from the parity fixture. The top two are four thousandths apart, which is the pair a different summation order would swap.",
    scale: "compact",
    scene: () => <ParityScene />,
    seam: {
      from: "ranking",
      to: "evidence",
      note: "An order two implementations agree on becomes a packet that has to carry where it came from.",
    },
  },

  "munich-accident-forecasting": {
    /*
     * Teal, which this site reserves for measurement, rather than the steel the
     * neighbouring chapters use. The figure's whole job is to separate a margin
     * that survived resampling from one that did not, and against a neutral grey
     * interval the steel accent was close enough to read as the same colour.
     */
    accent: "var(--accent-graph)",
    title: "A Published Margin That Does Not Survive an Ordinary Year",
    eyebrow: "Reproducible experiment / Forecasting",
    question:
      "The model beats its baseline by 23.4 per cent. Run the same protocol three years earlier and the sign flips, because the baseline on the published window repeats a pandemic.",
    evidence: evidenceOf("munich-accident-forecasting"),
    href: "/work/munich-accident-forecasting",
    figureNote:
      "Two runs of one protocol on one axis through zero. The published margin stays clear of it; the ordinary-years margin crosses it, and crossing it is the finding.",
    scale: "compact",
    scene: () => <MarginIntervalScene />,
    seam: {
      from: "series",
      to: "axis",
      note: "Fifteen years measured every month becomes one margin measured against nothing.",
    },
  },

  "drift-aware-platform": {
    accent: "var(--accent-systems)",
    title: "A Retraining Loop That Watches the Target",
    eyebrow: "Reference implementation / Monitoring",
    question:
      "The monitor you would build first watches the inputs. Here the inputs barely move, and the thing being predicted moves enormously.",
    evidence: evidenceOf("drift-aware-platform"),
    href: "/work/drift-aware-platform",
    figureNote:
      "Two drift scores on one scale, each against the threshold it is tested against. The features stop short of their line; the target runs well past its own.",
    scale: "compact",
    scene: () => <DriftScene />,
    seam: {
      from: "axis",
      to: "rail",
      note: "The line a measurement is plotted against becomes the line a release travels along.",
    },
  },

  "hydrology-uq": {
    accent: "var(--accent-flow)",
    title: "Uncertainty in a Hydrological Model",
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
    title: "Streamflow Forecasting Benchmark",
    eyebrow: "Scientific computing / Benchmark",
    question:
      "A leaderboard invites one reading: rank the rows. These three were not scored on the same task, and the gap between the questions is wider than the gap between the models.",
    evidence: evidenceOf("streamflow-forecasting"),
    href: "/work/streamflow-forecasting",
    figureNote:
      "R2 0.979 in the repository's earlier run, one step ahead with yesterday's measurement supplied. The two lines overlap because of what the model was given; the current run shows simply repeating yesterday's value scores higher.",
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
    title: "CIFAR-10 Image Classifier",
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
 * The running order.
 *
 * It was the homepage reel's order. The reel is gone and the order survived it, because it is the
 * order the index presents these in and the order the seams between detail routes assume.
 *
 * Research, then what I do now, then the applied systems, then the three studies about measurement
 * and error. Not the order of the case studies and not alphabetical: it is the order that makes
 * the strongest opening.
 */
export const WORLD_ORDER: readonly string[] = [
  "transport-uq",
  "mcp-policy-gateway",
  "reliable-knowledge-systems",
  "medico",
  "insureassist-rag",
  "mlops-reference-pipeline",
  "hydrology-uq",
  "streamflow-forecasting",
  "cifar10-cnn",
];
