import Link from "next/link";
import { repositoryUrl } from "@/content/ecosystem";
import { focusThemes, getBuildingThreads } from "@/content/focus";
import styles from "./CurrentFocus.module.css";
import { ExternalArrow } from "@/components/Icon";

interface CurrentFocusProps {
  latest?: {
    title: string;
    path: string;
    description: string;
    label: string;
  };
}

export default function CurrentFocus({ latest }: CurrentFocusProps) {
  const threads = getBuildingThreads();

  return (
    <div className={styles.focus}>
      <div className={styles.themes}>
        {focusThemes.map((theme) => (
          <article className={styles.theme} key={theme.id}>
            <h3>{theme.title}</h3>
            <p>{theme.summary}</p>
            <ul aria-label={`${theme.title} evidence`}>
              {theme.evidence.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <aside className={styles.building} aria-labelledby="currently-building">
        <h3 className={styles.buildingTitle} id="currently-building">
          Currently building
        </h3>
        <p className={styles.buildingLede}>
          The next evidence gate for each active repository. These are stated commitments, not
          completed results.
        </p>
        <ol className={styles.threads}>
          {threads.map((thread) => (
            <li key={thread.id}>
              <a className={styles.threadRepo} href={repositoryUrl(thread.detail)}>
                {thread.detail.name} <ExternalArrow />
              </a>
              <p>{thread.nextEvidenceGate}</p>
            </li>
          ))}
        </ol>

        {latest ? (
          <div className={styles.latest}>
            <p className={styles.latestLabel}>{latest.label}</p>
            <Link className={styles.latestTitle} href={latest.path}>
              {latest.title}
            </Link>
            <p className={styles.latestDescription}>{latest.description}</p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
