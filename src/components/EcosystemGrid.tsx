import Link from "next/link";
import {
  ecosystemSnapshot,
  repositoryUrl,
  type EcosystemRepository,
} from "@/content/ecosystem";
import { getProject } from "@/content/portfolio";
import styles from "./EcosystemGrid.module.css";
import { ExternalArrow } from "@/components/Icon";

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function RepositoryCard({ repository }: { repository: EcosystemRepository }) {
  const caseStudy = repository.caseStudySlug ? getProject(repository.caseStudySlug) : undefined;

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
          {repository.title} <ExternalArrow />
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

      <div className={styles.cardFoot}>
        <p className={styles.updated}>
          Last public commit <time dateTime={repository.lastCommit}>{formatDate(repository.lastCommit)}</time>
        </p>
        {caseStudy ? (
          <Link className={styles.caseLink} href={`/work/${caseStudy.slug}`}>
            Case study <span aria-hidden="true">→</span>
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
      Repository details are a reviewed snapshot recorded on{" "}
      <time dateTime={ecosystemSnapshot.observedAt}>{formatDate(ecosystemSnapshot.observedAt)}</time>. This page makes
      no request to GitHub, publishes no contribution counts, and renders identically if GitHub is unavailable.
    </p>
  );
}
