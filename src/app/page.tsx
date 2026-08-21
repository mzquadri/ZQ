import Link from "next/link";
import { EducationList, ExperienceList } from "@/components/CareerProfile";
import CurrentFocus from "@/components/CurrentFocus";
import { RepositoryCardGrid, SnapshotNote } from "@/components/EcosystemGrid";
import PageShell from "@/components/PageShell";
import ProjectList from "@/components/ProjectList";
import { ConfidenceProtocol, ThesisPipeline } from "@/components/ResearchVisuals";
import SectionHeading from "@/components/SectionHeading";
import SystemGraph from "@/components/SystemGraph";
import WritingCard from "@/components/writing/WritingCard";
import { ecosystemRepositories, getEcosystemHighlights } from "@/content/ecosystem";
import { capabilities, getFeaturedProjects, getProject, site, thesis } from "@/content/portfolio";
import { getPublishedLearnWriting } from "@/content/writing/repository";

export default function Home() {
  const thesisProject = getProject("transport-uq")!;
  const writing = getPublishedLearnWriting();
  const latest = writing[0];

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
            <Link className="button button-secondary" href="/research/thesis">
              Read the research
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

      <section className="section-wrap focus-section reveal-section">
        <SectionHeading
          index="01"
          eyebrow="Current focus"
          title="What I am working on now"
          introduction="Three engineering themes, each pointing at a public artifact, plus the next evidence gate for every repository that is still moving."
        />
        <CurrentFocus
          latest={
            latest
              ? {
                  title: latest.title,
                  path: latest.path,
                  description: latest.description,
                  label: `Latest writing / ${latest.readingTime} min read`,
                }
              : undefined
          }
        />
      </section>

      <section className="section-wrap reveal-section">
        <SectionHeading
          index="02"
          eyebrow="Selected work"
          title="Systems with inspectable evidence"
          introduction="Research, reference implementations, and prototypes are labelled separately. Each case states my role, the versioned evidence, and where the claim stops."
        />
        <ProjectList projects={getFeaturedProjects()} />
        <div className="section-action">
          <Link className="button button-secondary" href="/work">View the full portfolio</Link>
        </div>
      </section>

      {/* No reveal animation here: a transform on the section would become the containing
          block for the sticky graph viewport inside it. */}
      <section className="section-wrap systems-section">
        <SectionHeading
          index="03"
          eyebrow="How the work connects"
          title="From data to a decision someone can act on"
          introduction="An interactive map of the engineering path I work along. Select any node to see what it means here and which public artifact backs it. Dashed nodes are directions of study with no public project yet."
        />
        <SystemGraph />
      </section>

      <section className="section-wrap thesis-spotlight reveal-section">
        <SectionHeading
          index="04"
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

      <section className="section-wrap ecosystem-section reveal-section">
        <SectionHeading
          index="05"
          eyebrow="Open source"
          title="The repositories behind the claims"
          introduction={`${ecosystemRepositories.length} public repositories are catalogued with their category, focus areas, and evidence boundary. These are the flagship and actively maintained ones.`}
        />
        <RepositoryCardGrid repositories={getEcosystemHighlights()} />
        <SnapshotNote />
        <div className="section-action">
          <Link className="button button-secondary" href="/work#ecosystem">
            Browse every public repository
          </Link>
          <a className="text-link" href={site.github}>
            GitHub profile <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className="section-wrap career-section reveal-section">
        <SectionHeading
          index="06"
          eyebrow="Experience"
          title="Across AI engineering, research, and technical computing"
          introduction="Titles below are approved for publication. Confidential work is described at an abstract level only. Disputed historical dates and unverified impact figures are intentionally omitted."
        />
        <ExperienceList />
        <div className="section-action">
          <Link className="text-link" href="/about">Experience and education context <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="section-wrap capabilities-section reveal-section">
        <SectionHeading
          index="07"
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

      {writing.length > 0 ? (
        <section className="section-wrap writing-section reveal-section">
          <SectionHeading
            index="08"
            eyebrow="Learn"
            title="Explaining the reasoning, not only the result"
            introduction="Technical tutorials and notes that connect a mathematical idea to the engineering decision it changes."
          />
          <div className="writing-grid">
            {writing.slice(0, 3).map((entry) => <WritingCard entry={entry} key={entry.slug} />)}
          </div>
          <div className="section-action">
            <Link className="text-link" href="/learn">All tutorials and notes <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      ) : null}

      <section className="section-wrap education-section reveal-section">
        <SectionHeading
          index="09"
          eyebrow="Education & academic roles"
          title="Mathematics, computation, and explanation"
          introduction="Formal mathematics underpins the modelling work. The approved record also includes TUM student research assistant roles in programming, visualization, and numerical methods."
        />
        <EducationList />
      </section>

      <section className="closing-section section-wrap">
        <p className="kicker">{site.location} / Full-time opportunities</p>
        <h2>Need an engineer who treats evidence as part of the system?</h2>
        <p>{site.availability}. Start with the case studies, the research record, or the open-source ecosystem.</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/contact">Contact <span aria-hidden="true">→</span></Link>
          <Link className="button button-secondary" href="/work">Selected work</Link>
        </div>
      </section>
    </PageShell>
  );
}
