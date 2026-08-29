import Link from "next/link";

import ChapterSeam from "@/components/cinema/ChapterSeam";
import FrameSequence from "@/components/frames/FrameSequence";
import { SEQUENCES } from "@/components/frames/sequences";
import { PROJECT_WORLDS, WORLD_ORDER } from "@/components/cinema/project-worlds";
import { getProject } from "@/content/portfolio";

/*
 * The reel.
 *
 * This was a stack of case-study cards: title, small figure, summary, metric, link. Measured, the
 * chapters came out between 0.78 and 1.47 viewports each, which is why the page read as a list -
 * a reader never spent a whole screen with any one project, and the figure was always sharing the
 * frame with three paragraphs.
 *
 * A flagship chapter is now a full stage. The scene takes the viewport, and the words over it are
 * the four a visitor needs in order to decide whether to go further: what it is, the question it
 * answers, the one measured line that answers it, and the way in. Everything else - the method,
 * the evidence, the limitations - is one click away on a page built to carry it.
 *
 * Supporting work keeps the compact treatment on purpose. Giving every project the same weight
 * would flatten exactly the distinction a reader is trying to make.
 */

function WorkChapter({ slug, index, last }: { slug: string; index: number; last: boolean }) {
  const world = PROJECT_WORLDS[slug];
  if (!world) return null;

  /* Most chapters are portfolio projects; reliable knowledge systems is its own route. */
  const project = getProject(slug) ?? null;

  const sequence = SEQUENCES[slug];

  /*
   * A chapter with a rendered sequence is a different shape from a chapter with a figure. The
   * sequence takes the whole frame and the plate sits over it, which is the composition every
   * reference for this rebuild uses: full-bleed object, title and one result at the lower left,
   * and scroll as the thing that opens it.
   */
  if (sequence) {
    return (
      <>
        <article
          className="chapter chapter-sequence"
          data-scale={world.scale}
          id={`work-${slug}`}
          style={{ "--accent": world.accent } as React.CSSProperties}
        >
          <FrameSequence
            count={sequence.count}
            height={sequence.height}
            label={sequence.label}
            src={sequence.src}
            travel={sequence.travel}
            viewTransitionName={`world-${slug}`}
            width={sequence.width}
          >
            <div className="chapter-plate">
              <p className="chapter-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")} / {String(WORLD_ORDER.length).padStart(2, "0")}
              </p>
              <p className="chapter-eyebrow">{world.eyebrow}</p>
              <h3 className="chapter-title">
                <Link className="chapter-link mz-interactive" href={world.href}>
                  {world.title}
                </Link>
              </h3>
              <p className="chapter-question">{world.question}</p>
              {project ? <p className="chapter-project">{project.title}</p> : null}
              {world.evidence.value ? (
                <p className="chapter-metric">
                  <span>{world.evidence.label}</span>
                  <strong>{world.evidence.value}</strong>
                </p>
              ) : null}
              <Link className="chapter-more mz-interactive" href={world.href}>
                Enter this world
              </Link>
            </div>
          </FrameSequence>
        </article>

        {world.seam && !last ? <ChapterSeam seam={world.seam} /> : null}
      </>
    );
  }

  return (
    <>
      <article
        className="chapter"
        data-scale={world.scale}
        id={`work-${slug}`}
        style={{ "--accent": world.accent } as React.CSSProperties}
      >
        {/*
          The figure carries a view-transition name matching the one on its detail route, so a
          browser that supports the API animates this object into the next page rather than
          cutting to an unrelated composition.
        */}
        <figure className="chapter-stage" style={{ viewTransitionName: `world-${slug}` }}>
          {world.scene(project)}
        </figure>

        <div className="chapter-plate">
          <p className="chapter-index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")} / {String(WORLD_ORDER.length).padStart(2, "0")}
          </p>
          <p className="chapter-eyebrow">{world.eyebrow}</p>
          <h3 className="chapter-title">
            <Link className="chapter-link mz-interactive" href={world.href}>
              {world.title}
            </Link>
          </h3>
          <p className="chapter-question">{world.question}</p>

          {/*
            The exhibition title states the finding, which is what makes a reel readable - but a
            visitor still has to be able to tell which project they are looking at, so the project's
            own name stays on the plate underneath it.
          */}
          {project ? <p className="chapter-project">{project.title}</p> : null}

          {world.evidence.value ? (
            <p className="chapter-metric">
              <span>{world.evidence.label}</span>
              <strong>{world.evidence.value}</strong>
            </p>
          ) : null}

          <Link className="chapter-more mz-interactive" href={world.href}>
            Enter this world
          </Link>
        </div>

        <p className="chapter-note">{world.figureNote}</p>
      </article>

      {world.seam && !last ? <ChapterSeam seam={world.seam} /> : null}
    </>
  );
}

export default function WorkChapters() {
  return (
    <div className="chapters">
      {WORLD_ORDER.map((slug, i) => (
        <WorkChapter index={i} key={slug} last={i === WORLD_ORDER.length - 1} slug={slug} />
      ))}
    </div>
  );
}
