import Link from "next/link";
import { ArrowLabel } from "@/components/Icon";
import { getRepoAssemblies, PART_KIND_LABEL } from "@/content/assembly";
import ShowcaseCanvas from "./ShowcaseCanvas";
import styles from "./RepoShowcase.module.css";

/**
 * Flagship repository showcase.
 *
 * The strip below is the content of record. It is server-rendered, always present, and
 * carries every fact the 3D layer can show - each part's label, what kind of registry
 * field it came from, the repository it belongs to and its language. The canvas is an
 * additional band above it, not a replacement for it, so nothing is hidden
 * when WebGL runs and nothing is missing when it does not.
 */
export default function RepoShowcase() {
  const assemblies = getRepoAssemblies();

  return (
    <div className={styles.showcase}>
      <ShowcaseCanvas assemblies={assemblies} />

      <ol className={styles.strip} data-showcase="flagship">
        {assemblies.map((assembly) => (
          <li className={styles.card} key={assembly.name}>
            <div className={styles.cardHead}>
              <span className={styles.category} data-category={assembly.category}>
                {assembly.category}
              </span>
              <span className={styles.language}>{assembly.language}</span>
            </div>

            <h3 className={styles.title}>
              <a href={assembly.href}>
                <ArrowLabel>{assembly.title}</ArrowLabel>
              </a>
            </h3>
            <p className={styles.repoName}>{assembly.name}</p>
            <p className={styles.description}>{assembly.description}</p>

            <dl className={styles.parts}>
              {assembly.parts.map((part) => (
                <div className={styles.part} data-kind={part.kind} key={part.id}>
                  <dt>{PART_KIND_LABEL[part.kind]}</dt>
                  <dd>{part.label}</dd>
                </div>
              ))}
            </dl>

            <div className={styles.cardFoot}>
              <p className={styles.updated}>{assembly.language}</p>
              {assembly.caseStudyHref ? (
                <Link className={styles.caseLink} href={assembly.caseStudyHref}>
                  <ArrowLabel kind="forward">Case study</ArrowLabel>
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
