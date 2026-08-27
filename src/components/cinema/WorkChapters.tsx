import Link from "next/link";
import type { ReactNode } from "react";

import {
  EnsembleScene,
  FeatureMapScene,
  GraphSurrogateScene,
  HorizonScene,
  PipelineScene,
  RetrievalScene,
} from "@/components/cinema/scenes";
import { getProject, type Project } from "@/content/portfolio";

/*
 * The selected-work sequence.
 *
 * Each project is a full-bleed chapter with its own accent and its own figure, and the figure is
 * the thing the reader meets first. The text underneath is short on purpose: a hiring manager
 * should be able to take the point from the picture and one sentence, and anyone who wants the
 * evidence follows the link to the case study, which is where the numbers and the limitations
 * live. Progressive disclosure rather than a wall.
 *
 * Visual budget is deliberately unequal. The thesis and the two reference implementations get a
 * full stage; the smaller experiments get a compact one. Giving every project the same treatment
 * would flatten exactly the distinction a reader is trying to make.
 */

interface Chapter {
  slug: string;
  /** The accent world this project owns, so a single frame identifies it. */
  accent: string;
  /** One line naming what the figure is doing - not a repeat of the project summary. */
  figureNote: string;
  scale: "flagship" | "compact";
  scene: (project: Project) => ReactNode;
}

/* CIFAR-10's label set is public and fixed; naming four of them is a fact about the dataset. */
const CIFAR_CLASSES = ["airplane", "automobile", "bird", "cat"] as const;

const CHAPTERS: readonly Chapter[] = [
  {
    slug: "transport-uq",
    accent: "var(--accent-graph)",
    figureNote:
      "A breadth-first wavefront over a fixed road network, then a ring per junction standing for how far the information had to travel to reach it.",
    scale: "flagship",
    scene: () => <GraphSurrogateScene />,
  },
  {
    slug: "insureassist-rag",
    accent: "var(--accent-retrieval)",
    figureNote:
      "Retrieval and generation kept on opposite sides of the frame, with the answer physically tethered to the passages it was built from.",
    scale: "flagship",
    scene: () => <RetrievalScene />,
  },
  {
    slug: "mlops-reference-pipeline",
    accent: "var(--accent-pipeline)",
    figureNote:
      "Each stage is a gate rather than a conveyor: the artifact stops until something lets it through.",
    scale: "flagship",
    scene: (project) => <PipelineScene stages={project.workflow} />,
  },
  {
    slug: "hydrology-uq",
    accent: "var(--accent-flow)",
    figureNote:
      "Where an interval comes from: members disagreeing, and the disagreement summarised into a band.",
    scale: "compact",
    scene: () => <EnsembleScene />,
  },
  {
    slug: "streamflow-forecasting",
    accent: "var(--accent-flow)",
    figureNote:
      "A forecast is nearly tight at the moment of issue and necessarily loose far out, so the horizon opens.",
    scale: "compact",
    scene: () => <HorizonScene />,
  },
  {
    slug: "cifar10-cnn",
    accent: "var(--accent-vision)",
    figureNote: "Detail traded for meaning, one layer at a time.",
    scale: "compact",
    scene: () => <FeatureMapScene classes={CIFAR_CLASSES} />,
  },
];

function WorkChapter({ chapter, index }: { chapter: Chapter; index: number }) {
  const project = getProject(chapter.slug);
  if (!project) return null;

  /* One headline result, taken from the evidence registry rather than written here. */
  const headline = project.evidence[0];

  return (
    <article
      className="chapter"
      data-scale={chapter.scale}
      id={`work-${project.slug}`}
      style={{ "--accent": chapter.accent } as React.CSSProperties}
    >
      <div className="chapter-inner">
        <header className="chapter-head">
          <p className="chapter-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</p>
          <p className="chapter-eyebrow">{project.eyebrow}</p>
          <h3 className="chapter-title">
            <Link className="chapter-link" href={`/work/${project.slug}`}>{project.title}</Link>
          </h3>
        </header>

        <figure className="chapter-figure">
          {chapter.scene(project)}
          <figcaption>{chapter.figureNote}</figcaption>
        </figure>

        <div className="chapter-copy">
          <p className="chapter-summary">{project.summary}</p>

          {headline ? (
            <p className="chapter-metric">
              <span>{headline.label}</span>
              <strong>{headline.value}</strong>
            </p>
          ) : null}

          <p className="chapter-meta">
            <span>{project.classification}</span>
            <span>{project.year}</span>
          </p>

          <Link className="chapter-more mz-interactive" href={`/work/${project.slug}`}>
            Read the case study
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function WorkChapters() {
  return (
    <div className="chapters">
      {CHAPTERS.map((chapter, i) => (
        <WorkChapter chapter={chapter} index={i} key={chapter.slug} />
      ))}
    </div>
  );
}
