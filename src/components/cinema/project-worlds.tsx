import type { ReactNode } from "react";

import {
  EnsembleScene,
  FeatureMapScene,
  GraphSurrogateScene,
  HorizonScene,
  PipelineScene,
  RetrievalScene,
} from "@/components/cinema/scenes";
import type { Project } from "@/content/portfolio";

/*
 * One source of truth for what each project looks like.
 *
 * The homepage chapter and the case-study hero must agree - a reader who clicks through from a
 * teal graph on the homepage and lands on an orange page has been told the link went somewhere
 * else. Keeping the accent and the figure in one table is what makes that impossible to get
 * wrong by editing only one of the two places.
 *
 * A project with no entry here is not an error. The confidential draft has no figure by design,
 * and anything added later simply renders without one until someone decides what it should be.
 */

export interface ProjectWorld {
  accent: string;
  /** One line naming what the figure does. Not a restatement of the project summary. */
  figureNote: string;
  scale: "flagship" | "compact";
  scene: (project: Project) => ReactNode;
}

/* CIFAR-10's label set is public and fixed; naming four of them is a fact about the dataset. */
const CIFAR_CLASSES = ["airplane", "automobile", "bird", "cat"] as const;

export const PROJECT_WORLDS: Readonly<Record<string, ProjectWorld>> = {
  "transport-uq": {
    accent: "var(--accent-graph)",
    figureNote:
      "Information spreads through a fixed road network, then each junction carries how unsure the surrogate is there.",
    scale: "flagship",
    scene: () => <GraphSurrogateScene />,
  },
  "insureassist-rag": {
    accent: "var(--accent-retrieval)",
    figureNote:
      "A question lands among the passages, selects its nearest neighbours, and stays tied to the ones the answer was built from.",
    scale: "flagship",
    scene: () => <RetrievalScene />,
  },
  "mlops-reference-pipeline": {
    accent: "var(--accent-pipeline)",
    figureNote:
      "Each stage is a gate rather than a conveyor: the artifact stops until something lets it through.",
    scale: "flagship",
    scene: (project) => <PipelineScene stages={project.workflow} />,
  },
  "hydrology-uq": {
    accent: "var(--accent-flow)",
    figureNote:
      "Where an interval comes from: members disagreeing, and the disagreement summarised into a band.",
    scale: "compact",
    scene: () => <EnsembleScene />,
  },
  "streamflow-forecasting": {
    accent: "var(--accent-flow)",
    figureNote:
      "A forecast is nearly tight at the moment of issue and necessarily loose far out, so the horizon opens.",
    scale: "compact",
    scene: () => <HorizonScene />,
  },
  "cifar10-cnn": {
    accent: "var(--accent-vision)",
    figureNote: "Detail traded for meaning, one layer at a time.",
    scale: "compact",
    scene: () => <FeatureMapScene classes={CIFAR_CLASSES} />,
  },
};

/** The order the homepage walks them in. Flagships first, then the smaller experiments. */
export const WORLD_ORDER: readonly string[] = [
  "transport-uq",
  "insureassist-rag",
  "mlops-reference-pipeline",
  "hydrology-uq",
  "streamflow-forecasting",
  "cifar10-cnn",
];
