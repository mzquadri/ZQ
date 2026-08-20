import Link from "next/link";
import { EducationList, ExperienceList } from "@/components/CareerProfile";
import PageShell from "@/components/PageShell";
import ProjectList from "@/components/ProjectList";
import { ConfidenceProtocol, ThesisPipeline } from "@/components/ResearchVisuals";
import SectionHeading from "@/components/SectionHeading";
import { capabilities, getFeaturedProjects, getProject, site, thesis } from "@/content/portfolio";

export default function Home() {
  const thesisProject = getProject("transport-uq")!;

  return (
    <PageShell>
      <section className="hero recruiter-hero section-wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="kicker">AI/ML engineering / Munich</p>
          <h1 id="hero-title">Reliable models. <em>Usable systems.</em></h1>
          <p className="hero-intro">{site.positioning}</p>
          <p className="supporting-identity">{site.supportingIdentity}</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/work">
              Examine selected work <span aria-hidden="true">↗</span>
            </Link>
            <Link className="button button-secondary" href={site.resume.htmlPath}>
              View resume
            </Link>
            <Link className="text-link" href="/contact">
              Contact <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="availability"><span aria-hidden="true" />{site.availability}</p>
        </div>
        <div className="hero-visual">
          <div className="hero-visual-label">How I turn model output into a decision</div>
          <ConfidenceProtocol />
        </div>
      </section>

      <section className="proof-strip" aria-label="What I build">
        <div>Reliable ML systems</div>
        <div>Grounded AI services</div>
        <div>Testable ML pipelines</div>
        <div>Scientific software</div>
      </section>

      <section className="section-wrap">
        <SectionHeading
          index="01"
          eyebrow="Selected work"
          title="Systems with inspectable evidence"
          introduction="Research, reference implementations, and prototypes are labelled separately. Each case states my role, the versioned evidence, and where the claim stops."
        />
        <ProjectList projects={getFeaturedProjects()} />
        <div className="section-action">
          <Link className="button button-secondary" href="/work">View all case studies</Link>
        </div>
      </section>

      <section className="section-wrap thesis-spotlight">
        <SectionHeading
          index="02"
          eyebrow="Research"
          title="Confidence for a fast transport surrogate"
          introduction={`${thesis.status} at ${thesis.institution}. The study asks what evidence is needed before a fast GNN approximation informs transport-policy review.`}
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
          <Link className="text-link" href="/research/thesis">
            Read the research record and limitations <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="section-wrap career-section">
        <SectionHeading
          index="03"
          eyebrow="Experience"
          title="Across AI engineering, research, and technical computing"
          introduction="Titles below are approved for publication. Disputed historical dates and unverified impact figures are intentionally omitted."
        />
        <ExperienceList />
        <div className="section-action">
          <Link className="text-link" href="/about">Experience and education context <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="section-wrap capabilities-section">
        <SectionHeading
          index="04"
          eyebrow="Capabilities"
          title="Grouped by the work they enable"
          introduction="No self-rated percentages. Every capability points to a case study where it was applied and bounded."
        />
        <div className="capability-grid">
          {capabilities.map((capability) => (
            <article key={capability.title}>
              <h3>{capability.title}</h3>
              <p>{capability.summary}</p>
              <div className="proof-links">
                {capability.proof.map((slug) => {
                  const project = getProject(slug)!;
                  return <Link key={slug} href={`/work/${slug}`}>{project.title} <span aria-hidden="true">↗</span></Link>;
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-wrap education-section">
        <SectionHeading
          index="05"
          eyebrow="Education & academic roles"
          title="Mathematics, computation, and explanation"
          introduction="Formal mathematics underpins the modelling work. The approved record also includes TUM student research assistant roles in programming, visualization, and numerical methods."
        />
        <EducationList />
      </section>

      <section className="closing-section section-wrap">
        <p className="kicker">{site.location} / Full-time opportunities</p>
        <h2>Need an engineer who treats evidence as part of the system?</h2>
        <p>{site.availability}. Start with the work, the concise resume, or a professional profile.</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/contact">Contact <span aria-hidden="true">→</span></Link>
          <Link className="button button-secondary" href={site.resume.htmlPath}>View resume</Link>
        </div>
      </section>
    </PageShell>
  );
}
