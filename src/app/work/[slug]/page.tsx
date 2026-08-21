import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import PageShell from "@/components/PageShell";
import { HeldOutResultFigure, ReferenceRunTerminal } from "@/components/MlopsVisuals";
import { MlopsPipeline, SelectiveRiskChart, ThesisPipeline } from "@/components/ResearchVisuals";
import { getProject, projects, site } from "@/content/portfolio";
import { createPageMetadata } from "@/lib/metadata";
import { ExternalArrow } from "@/components/Icon";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return createPageMetadata({
    title: project.title,
    description: project.summary,
    path: `/work/${project.slug}`,
    type: "article",
    imagePath: `/work/${project.slug}/opengraph-image`,
    imageAlt: `${project.title} — ${project.classification} case study`,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <PageShell current="/work">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.summary,
          dateCreated: project.year,
          author: project.authors.map((author) => ({ "@type": "Person", ...author })),
          creditText: project.projectRole,
          sourceOrganization: project.institution
            ? { "@type": "Organization", name: project.institution }
            : undefined,
          url: `${site.domain}/work/${project.slug}`,
          codeRepository: project.repository,
          genre: project.classification,
        }}
      />
      <article>
        <header className="case-hero section-wrap">
          <Link className="back-link" href="/work">← All work</Link>
          <div className="case-meta">
            <span className="classification">{project.classification}</span>
            <span>{project.year}</span>
          </div>
          <p className="kicker">{project.eyebrow}</p>
          <h1>{project.title}</h1>
          <p className="case-summary">{project.summary}</p>
          <dl className="case-facts">
            <div>
              <dt>Role</dt>
              <dd>{project.projectRole}</dd>
            </div>
            <div>
              <dt>Authorship</dt>
              <dd>{project.authors.map((author) => author.name).join(", ")}</dd>
            </div>
            {project.institution ? (
              <div>
                <dt>Institution</dt>
                <dd>{project.institution}</dd>
              </div>
            ) : null}
          </dl>
          <a className="button button-primary" href={project.repository}>
            Inspect repository <ExternalArrow />
          </a>
        </header>

        <section className="section-wrap case-section two-column-copy">
          <div>
            <p className="section-index"><span>01</span>Problem</p>
            <h2>Why this work exists</h2>
            <p>{project.problem}</p>
          </div>
          <div>
            <p className="section-index"><span>02</span>Contribution</p>
            <h2>What I can claim</h2>
            <p>{project.contribution}</p>
          </div>
        </section>

        {project.slug === "transport-uq" ? (
          <section className="section-wrap visual-section" aria-label="Thesis system and result">
            <ThesisPipeline />
            <SelectiveRiskChart />
          </section>
        ) : null}

        {project.slug === "mlops-reference-pipeline" ? (
          <section className="section-wrap visual-section" aria-label="MLOps architecture and held-out result">
            <MlopsPipeline />
            <ReferenceRunTerminal />
            <HeldOutResultFigure />
          </section>
        ) : null}

        <section className="section-wrap case-section">
          <p className="section-index"><span>03</span>System</p>
          <h2>Workflow and decisions</h2>
          {project.systemSummary ? <p className="system-summary">{project.systemSummary}</p> : null}
          <ol className="workflow-list">
            {project.workflow.map((step, index) => (
              <li key={step}>
                <span>{(index + 1).toString().padStart(2, "0")}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
          <ul className="tool-list case-tools" aria-label="Technologies used">
            {project.tools.map((tool) => <li key={tool}>{tool}</li>)}
          </ul>
        </section>

        <section className="section-wrap case-section evidence-section">
          <p className="section-index"><span>04</span>Evidence</p>
          <h2>What is actually versioned</h2>
          <div className="metric-grid">
            {project.evidence.map((metric) => (
              <div className="metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.note}</p>
              </div>
            ))}
          </div>
        </section>

        {project.artifacts ? (
          <section className="section-wrap case-section artifact-section">
            <p className="section-index"><span>05</span>Inspection points</p>
            <h2>Go directly to the evidence</h2>
            <div className="artifact-links">
              {project.artifacts.map((artifact) => (
                <a href={artifact.href} key={artifact.href}>
                  <strong>{artifact.label}</strong>
                  <span>{artifact.note}</span>
                  <ExternalArrow />
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section-wrap case-section quality-grid">
          <div>
            <p className="section-index"><span>{project.artifacts ? "06" : "05"}</span>Quality controls</p>
            <h2>How the work is checked</h2>
            <ul className="editorial-list positive-list">
              {project.quality.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="limitation-panel">
            <p className="section-index"><span>{project.artifacts ? "07" : "06"}</span>Limitations</p>
            <h2>Where the evidence stops</h2>
            <ul className="editorial-list">
              {project.limitations.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="case-learning section-wrap">
          <p className="kicker">What this changed in my practice</p>
          <blockquote>{project.learned}</blockquote>
          {project.nextStep ? <p className="next-step"><strong>Next evidence milestone:</strong> {project.nextStep}</p> : null}
          <div className="case-actions">
            {project.researchPath ? (
              <Link className="text-link" href={project.researchPath}>
                Scientific research record <span aria-hidden="true">→</span>
              </Link>
            ) : null}
            <a className="text-link" href={project.repository}>
              Source and documentation <ExternalArrow />
            </a>
            <Link className="text-link" href="/contact">
              Discuss relevant work <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </article>
    </PageShell>
  );
}
