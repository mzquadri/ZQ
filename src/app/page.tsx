import Link from "next/link";
import PageShell from "@/components/PageShell";
import ProjectList from "@/components/ProjectList";
import { ConfidenceProtocol, ThesisPipeline } from "@/components/ResearchVisuals";
import SectionHeading from "@/components/SectionHeading";
import {
  capabilities,
  getFeaturedProjects,
  getProject,
  site,
  thesis,
} from "@/content/portfolio";

export default function Home() {
  const thesisProject = getProject("transport-uq")!;

  return (
    <PageShell>
      <section className="hero section-wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="kicker">Applied ML / Reliable systems / Scientific computing</p>
          <h1 id="hero-title">
            Building machine learning systems that know when to be <em>uncertain.</em>
          </h1>
          <p className="hero-intro">
            I&apos;m {site.name}, an applied ML engineer in Munich. My work connects
            uncertainty-aware modelling, graph neural networks, reproducible experiments,
            and the engineering needed to make evidence usable.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/work">
              Examine selected work <span aria-hidden="true">↗</span>
            </Link>
            <Link className="text-link" href="/contact">
              Discuss a full-time role <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="availability"><span aria-hidden="true" />{site.availability}</p>
        </div>
        <div className="hero-visual">
          <div className="hero-visual-label">A working protocol for reliable ML</div>
          <ConfidenceProtocol />
        </div>
      </section>

      <section className="proof-strip" aria-label="Focus areas">
        <div>Reliable ML</div>
        <div>Graph neural networks</div>
        <div>MLOps</div>
        <div>Scientific computing</div>
      </section>

      <section className="section-wrap thesis-spotlight">
        <SectionHeading
          index="01"
          eyebrow="Flagship research"
          title="Confidence for a fast transport surrogate"
          introduction={`${thesis.status} at ${thesis.institution}. The work asks a practical question: when a fast GNN replaces an expensive transport simulation, what evidence is needed before acting on its prediction?`}
        />
        <ThesisPipeline />
        <div className="metric-grid" aria-label="Selected thesis results">
          {thesisProject.evidence.slice(0, 4).map((metric) => (
            <div className="metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.note}</p>
            </div>
          ))}
        </div>
        <div className="section-action">
          <Link className="text-link" href="/research">
            Read the research record and limitations <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="section-wrap">
        <SectionHeading
          index="02"
          eyebrow="Selected systems"
          title="Work with inspectable evidence"
          introduction="Each case study states what the project is, what is versioned, and where the evidence stops."
        />
        <ProjectList projects={getFeaturedProjects()} />
        <div className="section-action">
          <Link className="button button-secondary" href="/work">
            View all case studies
          </Link>
        </div>
      </section>

      <section className="section-wrap capabilities-section">
        <SectionHeading
          index="03"
          eyebrow="Capabilities"
          title="Tools are useful when they connect to proof"
          introduction="No percentage bars. Each capability links back to work where it was applied and bounded."
        />
        <div className="capability-grid">
          {capabilities.map((capability) => (
            <article key={capability.title}>
              <h3>{capability.title}</h3>
              <p>{capability.summary}</p>
              <div className="proof-links">
                {capability.proof.map((slug) => {
                  const project = getProject(slug)!;
                  return (
                    <Link key={slug} href={`/work/${slug}`}>
                      {project.title} <span aria-hidden="true">↗</span>
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-section section-wrap">
        <p className="kicker">Available for full-time roles</p>
        <h2>Looking for an engineer who treats reliability as part of the model?</h2>
        <p>
          I&apos;m interested in Machine Learning Engineering, Applied AI, reliable ML,
          scientific computing, GNN, MLOps, and data/AI engineering roles.
        </p>
        <Link className="button button-primary" href="/contact">
          Start with the evidence <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
