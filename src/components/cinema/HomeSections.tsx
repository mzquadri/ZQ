import Link from "next/link";

import { VerbScene } from "@/components/cinema/scenes";
import { BranchCanvas } from "@/components/scene/ProjectedCanvases";
import BranchFlat from "@/components/scene/BranchFlat";
import { chapters, closing, problemClasses } from "@/content/cinema";
import { site, thesis } from "@/content/portfolio";
import { getProject } from "@/content/portfolio";

/*
 * The sections after the work sequence.
 *
 * These carry the same dark stage as the chapters so the homepage reads as one continuous
 * document rather than two designs stapled together, and they use the same scrub vocabulary.
 *
 * On the current-employer section specifically: everything visible is either already-approved
 * public text taken from the truth registry, or a synthetic figure that names nothing. The four
 * verbs are a general description of what data platforms have to do; they are not a system's
 * architecture, and no service, dataset, topic, store or identifier appears anywhere in it.
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
 * Current engineering. Four verbs, each with a small synthetic mark.
 * ----------------------------------------------------------------------------------------- */
export function EngineeringSection() {
  const verbs = problemClasses[0].verbs;

  return (
    <section className="cine-section cine-engineering" id="engineering">
      <div className="cine-section-inner">
        <SectionHead chapter={chapters.engineering} />

        <BranchCanvas flat={<BranchFlat />} />

        <ol className="verb-track" aria-label="Four things a data platform has to do">
          {verbs.map((verb, i) => (
            <li className="verb" key={verb} style={{ "--i": i } as React.CSSProperties}>
              <span className="verb-mark" aria-hidden="true">
                <VerbScene verb={verb} />
              </span>
              <p className="verb-name">{verb}</p>
            </li>
          ))}
        </ol>

        <p className="cine-note">
          Illustrative model. Synthetic throughout; it describes a class of problem rather than any
          particular system.
        </p>

        <p className="cine-section-action">
          <Link className="chapter-more mz-interactive" href="/work#systems">
            See the systems showcase
          </Link>
        </p>
      </div>
    </section>
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
         * The approved public record, unchanged. Roles and the one sanitised practice line come
         * from the truth registry; nothing is added to them here.
         */}
        <ul className="role-list" aria-label="Roles">
          {site.experience.map((record) => (
            <li className="role" key={record.id}>
              <p className="role-org">{record.organization}</p>
              <p className="role-title">{record.title}</p>
              {"practice" in record && record.practice ? (
                <p className="role-practice">{record.practice}</p>
              ) : null}
            </li>
          ))}
        </ul>

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
