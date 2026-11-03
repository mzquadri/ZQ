import Link from "next/link";

import ArchDiagram, { ArchDiagramKey } from "@/components/diagram/ArchDiagram";
import type { ProjectDiagram } from "@/content/diagrams/types";
import type { PinnedStory } from "@/content/pinned-stories";

import styles from "./PinnedShowcase.module.css";

/**
 * A project's architecture, pinned while its argument scrolls beside it.
 *
 * This is `CaseStory` for the three pages that have no flat scene figure to pin. The diagram takes
 * that place and replaces the plain diagram section rather than repeating it, and its lines draw
 * across the reader's progress through the steps.
 */
export default function PinnedShowcase({
  diagram,
  story,
}: {
  diagram: ProjectDiagram;
  story: PinnedStory;
}) {
  const headingId = `showcase-${diagram.slug}`;
  const internal = story.link.href.startsWith("/");

  return (
    <section
      aria-labelledby={headingId}
      className="case-story"
      style={{ "--accent": diagram.accent } as React.CSSProperties}
    >
      <div className={`case-story-inner ${styles.inner}`}>
        <header className="case-story-head">
          <p className="case-story-eyebrow">How it works</p>
          <h2 className="case-story-title" id={headingId}>{story.title}</h2>
          <p className="case-story-intro">{story.intro}</p>
        </header>

        <div className={`case-story-body ${styles.body}`}>
          <div className="case-story-stage">
            <ArchDiagram diagram={diagram} pinned showKey={false} />
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
              {internal ? (
                <Link className="cine-cta mz-interactive" href={story.link.href}>{story.link.label}</Link>
              ) : (
                <a className="cine-cta mz-interactive" href={story.link.href}>{story.link.label}</a>
              )}
            </li>
          </ol>
        </div>

        <div className={styles.key}>
          <ArchDiagramKey diagram={diagram} />
        </div>
      </div>
    </section>
  );
}
