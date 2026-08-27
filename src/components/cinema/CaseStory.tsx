import { PROJECT_WORLDS } from "@/components/cinema/project-worlds";
import { caseStories } from "@/content/case-stories";
import type { Project } from "@/content/portfolio";

/*
 * The narrative section of a case study.
 *
 * The project's own figure is pinned while the argument scrolls beside it. That is the whole
 * point of the layout: the reader is not shown a diagram and then told about it in a paragraph
 * somewhere below - the figure stages itself as the sentence explaining it arrives, on a scroll
 * head they control.
 *
 * The figure is the same one the homepage chapter and the case hero use. Reusing it is deliberate
 * rather than lazy: a reader who arrived from the homepage has already seen this shape, so the
 * case study can spend its attention on the argument instead of re-teaching the picture.
 *
 * The caveat at the end is inside the narrative rather than deferred to a limitations section,
 * because a figure that has just made an argument is exactly where its limits are load-bearing.
 */

export default function CaseStory({ project }: { project: Project }) {
  const story = caseStories[project.slug];
  const world = PROJECT_WORLDS[project.slug];
  if (!story || !world) return null;

  return (
    <section
      aria-labelledby={`story-${project.slug}`}
      className="case-story"
      style={{ "--accent": world.accent } as React.CSSProperties}
    >
      <div className="case-story-inner">
        <header className="case-story-head">
          <p className="case-story-eyebrow">Method</p>
          <h2 className="case-story-title" id={`story-${project.slug}`}>{story.title}</h2>
          <p className="case-story-intro">{story.intro}</p>
        </header>

        <div className="case-story-body">
          {/* The pinned stage. Sticky rather than fixed, so it releases at the end of the track. */}
          <div className="case-story-stage">
            <div className="case-story-figure">{world.scene(project)}</div>
          </div>

          <ol className="case-story-beats">
            {story.beats.map((beat, i) => (
              <li className="case-story-beat" key={beat.verb} style={{ "--i": i } as React.CSSProperties}>
                <p className="case-story-verb">{beat.verb}</p>
                <p className="case-story-text">{beat.text}</p>
              </li>
            ))}
            <li className="case-story-caveat">
              <p className="case-story-verb">What this does not show</p>
              <p className="case-story-text">{story.caveat}</p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
