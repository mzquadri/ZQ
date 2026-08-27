import Link from "next/link";

import { PROJECT_WORLDS } from "@/components/cinema/project-worlds";
import type { Project } from "@/content/portfolio";

/*
 * The opening of a case study.
 *
 * The page argues visually before it explains, so the project's own figure is the first thing
 * under the title - the same figure the homepage chapter used, in the same accent, so arriving
 * here feels like following a thread rather than landing somewhere unrelated.
 *
 * Only the hero is staged. Everything below it stays on paper, because the rest of a case study
 * is long-form technical reading - evidence tables, limitations, what the work does not show -
 * and a dark ground with oversized type is the wrong surface for that. The visual budget goes
 * where a reader is deciding whether to keep reading, not where they already are.
 */

export default function CaseHero({ project, children }: { project: Project; children: React.ReactNode }) {
  const world = PROJECT_WORLDS[project.slug];

  return (
    <header
      className="case-stage"
      data-scale={world?.scale ?? "compact"}
      style={world ? ({ "--accent": world.accent } as React.CSSProperties) : undefined}
    >
      <div className="case-stage-inner">
        <div className="case-stage-copy">
          <Link className="case-back" href="/work">
            All work
          </Link>

          <p className="case-stage-eyebrow">{project.eyebrow}</p>
          <h1 className="case-stage-title">{project.title}</h1>
          <p className="case-stage-summary">{project.summary}</p>

          <dl className="case-stage-facts">
            <div>
              <dt>Role</dt>
              <dd>{project.projectRole}</dd>
            </div>
            <div>
              <dt>Classification</dt>
              <dd>{project.classification}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
            {project.institution ? (
              <div>
                <dt>Institution</dt>
                <dd>{project.institution}</dd>
              </div>
            ) : null}
          </dl>

          {/* Repository link or the confidential notice - whichever the project's shape allows. */}
          {children}
        </div>

        {/*
         * A project without a world renders no figure rather than a placeholder. The confidential
         * draft is the case that matters here: it has no public figure by design, and an empty
         * frame would imply one is missing rather than withheld.
         */}
        {world ? (
          <figure className="case-stage-figure">
            {world.scene(project)}
            <figcaption>{world.figureNote}</figcaption>
          </figure>
        ) : null}
      </div>
    </header>
  );
}
