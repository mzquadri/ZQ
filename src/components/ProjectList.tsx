import Link from "next/link";
import type { Project } from "@/content/portfolio";

interface ProjectListProps {
  projects: readonly Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  return (
    <ol className="project-list">
      {projects.map((project, index) => (
        <li key={project.slug}>
          <article className="project-row">
            <div className="project-number" aria-hidden="true">
              {(index + 1).toString().padStart(2, "0")}
            </div>
            <div className="project-main">
              <div className="project-meta">
                <span className="classification">{project.classification}</span>
                <span>{project.year}</span>
              </div>
              <h3>
                <Link href={`/work/${project.slug}`}>{project.title}</Link>
              </h3>
              <p>{project.summary}</p>
              <p className="project-role">{project.projectRole}</p>
              <ul className="tool-list" aria-label={`${project.title} technologies`}>
                {project.tools.slice(0, 5).map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </div>
            <Link
              className="row-action"
              href={`/work/${project.slug}`}
              aria-label={`Read case study: ${project.title}`}
            >
              <span>Case study</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </article>
        </li>
      ))}
    </ol>
  );
}
