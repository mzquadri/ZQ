import Link from "next/link";
import { ArrowLabel } from "@/components/Icon";
import type { Project } from "@/content/portfolio";

/**
 * Featured work cards.
 *
 * The previous treatment was four near-identical blocks of prose, so the section that
 * should show the strongest work had nothing to look at. Each card now leads with a
 * visual built from the project's own typed record: either the audited headline numbers
 * or the pipeline it actually runs. Nothing here is decorative and nothing is invented —
 * if a value is on screen it came from `evidence` or `workflow`.
 */

/** A project leads with numbers when its headline evidence is quantitative. */
function hasNumericEvidence(project: Project) {
  return /\d/.test(project.evidence[0]?.value ?? "");
}

function MetricStrip({ project }: { project: Project }) {
  return (
    <dl aria-label={`${project.title} headline evidence`} className="card-metrics">
      {project.evidence.slice(0, 2).map((metric) => (
        <div className="card-metric" key={metric.label}>
          <dt>
            <span>{metric.label}</span>
          </dt>
          <dd>
            <strong>{metric.value}</strong>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function FlowRail({ project }: { project: Project }) {
  // Four stages keep the rail readable; the case study carries the full sequence.
  const stages = project.workflow.slice(0, 4);
  return (
    <ol aria-label={`${project.title} pipeline`} className="card-flow">
      {stages.map((stage) => (
        <li key={stage}>
          <span>{stage}</span>
        </li>
      ))}
    </ol>
  );
}

export default function FeaturedWork({ projects }: { projects: readonly Project[] }) {
  return (
    <div className="featured-grid">
      {projects.map((project) => (
        <article className="featured-card" key={project.slug}>
          <div className="featured-visual">
            {hasNumericEvidence(project) ? (
              <MetricStrip project={project} />
            ) : (
              <FlowRail project={project} />
            )}
          </div>
          <div className="featured-body">
            <p className="featured-meta">
              <span>{project.classification}</span>
              <span>{project.year}</span>
            </p>
            <h3>
              <Link href={`/work/${project.slug}`}>{project.title}</Link>
            </h3>
            <p className="featured-summary">{project.summary}</p>
            <div className="featured-foot">
              <p className="featured-role">{project.projectRole}</p>
              <Link className="featured-link" href={`/work/${project.slug}`}>
                <ArrowLabel kind="forward">Case study</ArrowLabel>
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
