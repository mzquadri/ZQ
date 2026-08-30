import Link from "next/link";

import { PROJECT_WORLDS } from "@/components/cinema/project-worlds";
import SceneIdentity from "@/components/sequence/SceneIdentity";
import { SCENES } from "@/components/sequence/scenes";
import type { Project } from "@/content/portfolio";

/*
 * The opening of a case study.
 *
 * The page argues visually before it explains, so the project's own object is the first thing
 * beside the title - and it is now literally the object the homepage chapter drew, at the same
 * resting beat, not a second figure of the same subject. Before this, transport opened on an
 * extruded bar field where the homepage had shown a flat isometric network with uncertainty on
 * it: recognisably the same topic and visibly not the same picture.
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
        {SCENES[project.slug] ? (
          /*
           * The shared-element name lives here, on the object, in the first viewport. It used to
           * sit on the world further down the page, so a browser was asked to animate a
           * full-viewport stage into something below the fold - which can only look like a fade.
           */
          <SceneIdentity
            caption={world?.figureNote}
            slug={project.slug}
            viewTransitionName={`world-${project.slug}`}
          />
        ) : world ? (
          <figure className="case-stage-figure">
            {world.scene(project)}
            <figcaption>{world.figureNote}</figcaption>
          </figure>
        ) : null}
      </div>
    </header>
  );
}
