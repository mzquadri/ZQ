import Link from "next/link";

import { chapters, closing, problemClasses } from "@/content/cinema";
import { getPublishedWriting } from "@/content/writing/repository";
import WritingCard from "@/components/writing/WritingCard";
import { site, thesis } from "@/content/portfolio";
import { getProject } from "@/content/portfolio";

/*
 * The sections after the work index.
 *
 * These carry the same dark stage as the index above them so the homepage reads as one continuous
 * document rather than two designs stapled together, and they use the same scrub vocabulary.
 *
 * Each is a preview rather than a copy: enough of the research, the tutorials, the roles and the
 * closing to tell a reader whether the page behind it is the one they came for. Everything
 * visible here is either already-approved public text taken from the truth registry, or a
 * synthetic figure that names nothing - no service, dataset, topic, store or identifier appears
 * anywhere in it.
 */

function SectionHead({ chapter }: { chapter: { index: string; eyebrow: string; title: string; introduction: string } }) {
  return (
    <header className="cine-section-head">
      <p className="cine-section-index" aria-hidden="true">{chapter.index}</p>
      <p className="cine-section-eyebrow">{chapter.eyebrow}</p>
      <h2 className="cine-section-title">{chapter.title}</h2>
      <p className="cine-section-lede">{chapter.introduction}</p>
    </header>
  );
}

/* -------------------------------------------------------------------------------------------
 * Research. Deliberately quieter than the engineering sections - fewer moving parts, more
 * numbers, and the limitations link given equal weight to the results.
 * ----------------------------------------------------------------------------------------- */
export function ResearchSection() {
  const project = getProject("transport-uq");
  const metrics = project?.evidence.slice(0, 4) ?? [];

  return (
    <section className="cine-section cine-research" id="research">
      <div className="cine-section-inner">
        <SectionHead chapter={chapters.research} />

        <p className="research-standfirst">
          {thesis.status} at {thesis.institution} — {thesis.program}.
        </p>

        <dl className="research-metrics">
          {metrics.map((metric, i) => (
            <div className="research-metric" key={metric.label} style={{ "--i": i } as React.CSSProperties}>
              <dt>{metric.label}</dt>
              <dd className="research-metric-value">{metric.value}</dd>
              <dd className="research-metric-note">{metric.note}</dd>
            </div>
          ))}
        </dl>

        <p className="cine-section-action">
          <Link className="chapter-more mz-interactive" href="/research/thesis">
            Read the research record and its limitations
          </Link>
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------------------------
 * Experience, written as problem classes rather than as a list of job titles.
 * ----------------------------------------------------------------------------------------- */
export function ExperienceSection() {
  return (
    <section className="cine-section cine-experience" id="experience">
      <div className="cine-section-inner">
        <SectionHead chapter={chapters.experience} />

        <ol className="problem-list">
          {problemClasses.map((entry, i) => (
            <li className="problem" key={entry.id} style={{ "--i": i } as React.CSSProperties}>
              <p className="problem-stage">{entry.stage}</p>
              <h3 className="problem-title">{entry.problem}</h3>
              <p className="problem-detail">{entry.detail}</p>
              <ol className="problem-verbs" aria-label="Steps">
                {entry.verbs.map((verb) => (
                  <li key={verb}>{verb}</li>
                ))}
              </ol>
            </li>
          ))}
        </ol>

        {/*
         * The roles themselves are not repeated here.
         *
         * They were, as organisation and title, immediately under the problem classes - which is
         * the same record /about renders in full, with the period each role ran for and the
         * discipline grouping that makes five roles readable. Two renderings of one list, and the
         * shorter one was the one a visitor met first.
         *
         * What stays is the framing the homepage adds and /about does not: the classes of problem,
         * in the order I met them. The record is one link away.
         */}

        <p className="cine-section-action">
          <Link className="chapter-more mz-interactive" href="/about">
            Experience and education context
          </Link>
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------------------------
 * Learn, as a preview rather than a library.
 *
 * The homepage never offered a way into the tutorials, so the only route to them was the
 * navigation. Three entries is enough to say what kind of writing this is and to get a reader who
 * wants it to the index; the index itself is /learn.
 * ----------------------------------------------------------------------------------------- */
export function HomeLearn() {
  const latest = getPublishedWriting().slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section className="cine-section cine-learn" id="learn">
      <div className="cine-section-inner">
        <SectionHead chapter={chapters.learn} />

        <div className="home-learn-grid">
          {latest.map((entry) => (
            <WritingCard entry={entry} key={entry.slug} />
          ))}
        </div>

        <p className="cine-section-action">
          <Link className="chapter-more mz-interactive" href="/learn">
            Every tutorial
          </Link>
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------------------------
 * The ending.
 * ----------------------------------------------------------------------------------------- */
export function ClosingSection() {
  return (
    <section className="cine-closing" id="contact">
      <div className="cine-closing-inner">
        <p className="cine-closing-line">{closing.line}</p>
        <p className="cine-closing-support">{closing.support}</p>
        <p className="cine-closing-availability">{site.availability}</p>
        <div className="cine-actions">
          <Link className="cine-cta mz-interactive" href="/contact">Contact</Link>
          <Link className="cine-cta cine-cta-quiet mz-interactive" href="/work#ecosystem">Repositories</Link>
          <a className="cine-cta cine-cta-quiet mz-interactive" href={site.github}>GitHub</a>
          <a className="cine-cta cine-cta-quiet mz-interactive" href={site.linkedin}>LinkedIn</a>
        </div>
      </div>
    </section>
  );
}
