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
      "The nearest passage can be the right provision from the wrong policy form. Three near-duplicate forms make that the whole problem.",
    scale: "flagship",
    scene: () => <RetrievalScene />,
  },
  "mlops-reference-pipeline": {
    accent: "var(--accent-pipeline)",
    figureNote:
      "Promotion is a conjunction of four checks, not the next box along. One short check and the candidate stops here.",
    scale: "flagship",
    scene: (project) => <PipelineScene stages={project.workflow} />,
  },
  "hydrology-uq": {
    accent: "var(--accent-flow)",
    figureNote:
      "Two perturbations of one calibrated event, on one scale. The rain barely moves it; the ruler the discharge was measured with moves it 356 times as far.",
    scale: "compact",
    scene: () => <EnsembleScene />,
  },
  "streamflow-forecasting": {
    accent: "var(--accent-flow)",
    figureNote:
      "R² 0.979 on synthetic data, one step ahead with yesterday's measurement supplied. The two lines overlap because of what the model was given.",
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
