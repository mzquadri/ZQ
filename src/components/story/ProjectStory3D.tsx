import Link from "next/link";

import { ExternalArrow } from "@/components/Icon";
import { projectStories } from "@/content/project-stories";

import styles from "./ProjectStory3D.module.css";

/**
 * Problem, why, result: three planes the reader flies through.
 *
 * The depth is CSS 3D and the scrub is a CSS scroll timeline, so this costs no WebGL and no script,
 * runs at every width, and reverses on the way back up. Without scroll timelines, or under reduced
 * motion, the same three cards simply sit in a row.
 */
export default function ProjectStory3D({
  slug,
  repository,
  accent,
}: {
  slug: string;
  repository?: string;
  accent?: string;
}) {
  const story = projectStories[slug];
  if (!story) return null;

  const route = story.evidence.startsWith("/");
  const href = route ? story.evidence : repository ? `${repository}/blob/HEAD/${story.evidence}` : undefined;

  return (
    <section
      aria-label="The project in three steps"
      className={styles.track}
      style={accent ? ({ "--accent": accent } as React.CSSProperties) : undefined}
    >
      <div className={styles.stage}>
        <ol className={styles.scene}>
          <li className={styles.card} data-step="1">
            <p className={styles.kicker}>Problem</p>
            <p className={styles.line}>{story.problem}</p>
          </li>

          <li className={styles.card} data-step="2">
            <p className={styles.kicker}>Why it mattered</p>
            <p className={styles.line}>{story.why}</p>
            <ol aria-label="How it works" className={styles.flow}>
              {story.flow.map((step, i) => (
                <li key={step} style={{ "--i": i } as React.CSSProperties}>{step}</li>
              ))}
            </ol>
          </li>

          <li className={styles.card} data-step="3">
            <p className={styles.kicker}>Result</p>
            <p className={styles.value}>{story.result.value}</p>
            <p className={styles.label}>{story.result.label}</p>
            {href && route ? (
              <Link className={styles.evidence} href={href}>See the evidence</Link>
            ) : href ? (
              <a className={styles.evidence} href={href}>
                See the evidence on GitHub<ExternalArrow />
              </a>
            ) : null}
          </li>
        </ol>
      </div>
    </section>
  );
}
