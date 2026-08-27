import Link from "next/link";

import { PROJECT_WORLDS, WORLD_ORDER } from "@/components/cinema/project-worlds";
import { getProject } from "@/content/portfolio";

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

function WorkChapter({ slug, index }: { slug: string; index: number }) {
  const project = getProject(slug);
  const world = PROJECT_WORLDS[slug];
  if (!project || !world) return null;

  /* One headline result, taken from the evidence registry rather than written here. */
  const headline = project.evidence[0];

  return (
    <article
      className="chapter"
      data-scale={world.scale}
      id={`work-${project.slug}`}
      style={{ "--accent": world.accent } as React.CSSProperties}
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
          {world.scene(project)}
          <figcaption>{world.figureNote}</figcaption>
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
      {WORLD_ORDER.map((slug, i) => (
        <WorkChapter index={i} key={slug} slug={slug} />
      ))}
    </div>
  );
}
