import Link from "next/link";

import { ExternalArrow } from "@/components/Icon";
import { projectStories } from "@/content/project-stories";

import styles from "./ProjectStory3D.module.css";

/**
 * Problem, how, result, tools: four planes the reader flies through.
 *
 * The depth is CSS 3D and the scrub is a CSS scroll timeline, so this costs no WebGL and no script,
 * runs at every width, and reverses on the way back up. Without scroll timelines, or under reduced
 * motion, the same four cards simply sit in a grid.
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
      aria-label="The project, step by step"
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
            <p className={styles.kicker}>How it was solved</p>
            <p className={styles.line}>{story.how}</p>
            <ol aria-label="The steps" className={styles.flow}>
              {story.flow.map((step, i) => (
                <li key={step} style={{ "--i": i } as React.CSSProperties}>{step}</li>
              ))}
            </ol>
          </li>

          <li className={styles.card} data-step="3">
            <p className={styles.kicker}>Result</p>
            <p className={styles.value}>{story.result.value}</p>
            <p className={styles.label}>{story.result.label}</p>
            {story.chart.length > 0 ? (
              <ul aria-label="The numbers" className={styles.chart}>
                {story.chart.map((bar, i) => (
                  <li key={bar.label} style={{ "--i": i, "--size": `${bar.size}%` } as React.CSSProperties}>
                    <span>{bar.label}</span>
                    <strong>{bar.shown}</strong>
                    <i aria-hidden="true" />
                  </li>
                ))}
              </ul>
            ) : null}
          </li>

          <li className={styles.card} data-step="4">
            <p className={styles.kicker}>Built with</p>
            {story.tools.length > 0 ? (
              <ul aria-label="Tools used" className={styles.tools}>
                {story.tools.map((tool, i) => (
                  <li key={tool} style={{ "--i": i } as React.CSSProperties}>{tool}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.label}>The named systems are on the architecture site.</p>
            )}
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
