import Link from "next/link";
import { repositoryUrl, type EcosystemRepository } from "@/content/ecosystem";
import { getProject } from "@/content/portfolio";
import { strongWork } from "@/content/strong-work";
import styles from "./EcosystemGrid.module.css";
import { ArrowLabel } from "@/components/Icon";

export function RepositoryCard({ repository }: { repository: EcosystemRepository }) {
  const caseStudy = repository.caseStudySlug ? getProject(repository.caseStudySlug) : undefined;
  /*
   * Where a repository has been read module by module, the card can open into how it actually
   * runs. A description and a boundary say what a repository is and is not; they do not say what
   * happens inside it, and for the work that is neither a flagship nor a learning exercise that
   * was the whole of what this index offered.
   *
   * A disclosure rather than a route: these are real projects and they are not eight-chapter
   * projects, and giving each one a page would say otherwise.
   */
  const detail = strongWork.find((work) => work.repository === repository.name);

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.category} data-category={repository.category}>
          {repository.category}
        </span>
        <span className={styles.language}>{repository.language}</span>
      </div>

      <h3 className={styles.title}>
        <a href={repositoryUrl(repository)}>
          <ArrowLabel>{repository.title}</ArrowLabel>
        </a>
      </h3>
      <p className={styles.repoName}>{repository.name}</p>
      <p className={styles.description}>{repository.description}</p>
      <p className={styles.boundary}>{repository.boundary}</p>

      <ul aria-label={`${repository.title} focus areas`} className={styles.topics}>
        {repository.topics.map((topic) => (
          <li key={topic}>{topic}</li>
        ))}
      </ul>

      {detail ? (
        <details className={styles.detail}>
          <summary>How it runs</summary>

          <ol className={styles.flow}>
            {detail.flow.map((step) => (
              <li key={step.module}>
                <code>{step.module}</code>
                <span>{step.does}</span>
              </li>
            ))}
          </ol>

          <dl className={styles.stack}>
            {detail.stack.map((entry) => (
              <div key={entry.role}>
                <dt>{entry.role}</dt>
                <dd>{entry.tool}</dd>
              </div>
            ))}
          </dl>

          {/* Whether there are numbers, and where there are not, the repository's own reason. */}
          <p className={styles.evidenceState} data-state={detail.evidence.kind}>
            {detail.evidence.kind === "measured"
              ? "Publishes tracked metrics."
              : detail.evidence.kind === "demonstrated"
                ? "Establishes a working path. Claims no accuracy."
                : `Publishes no metric. ${detail.evidence.reason}`}
          </p>
        </details>
      ) : null}

      {/*
        The language already sits in the card head; repeating it in the foot was a leftover from
        removing the commit date this row used to carry.
      */}
      <div className={styles.cardFoot}>
        {caseStudy ? (
          <Link className={styles.caseLink} href={`/work/${caseStudy.slug}`}>
<ArrowLabel kind="forward">Case study</ArrowLabel>
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function RepositoryCardGrid({ repositories }: { repositories: readonly EcosystemRepository[] }) {
  return (
    <div className={styles.grid}>
      {repositories.map((repository) => (
        <RepositoryCard key={repository.name} repository={repository} />
      ))}
    </div>
  );
}

export function EcosystemGroups({
  groups,
}: {
  groups: readonly { id: string; summary: string; repositories: readonly EcosystemRepository[] }[];
}) {
  return (
    <div className={styles.groups}>
      {groups.map((group) => (
        <section aria-labelledby={`ecosystem-${group.id.toLowerCase()}`} className={styles.group} key={group.id}>
          <div className={styles.groupHead}>
            <h3 id={`ecosystem-${group.id.toLowerCase()}`}>{group.id}</h3>
            <p>{group.summary}</p>
          </div>
          <RepositoryCardGrid repositories={group.repositories} />
        </section>
      ))}
    </div>
  );
}

export function SnapshotNote() {
  return (
    <p className={styles.snapshot}>
      Repository details are a reviewed offline snapshot. This page makes no request to GitHub, publishes no
      contribution counts or activity dates, and renders identically if GitHub is unavailable.
    </p>
  );
}
