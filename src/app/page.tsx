import Link from "next/link";
import { ExperienceList } from "@/components/CareerProfile";
import CurrentFocus from "@/components/CurrentFocus";
import { RepositoryCardGrid, SnapshotNote } from "@/components/EcosystemGrid";
import FeaturedWork from "@/components/FeaturedWork";
import { ExternalArrow, ForwardArrow } from "@/components/Icon";
import PageShell from "@/components/PageShell";
import { ConfidenceProtocol, ThesisPipeline } from "@/components/ResearchVisuals";
import SectionHeading from "@/components/SectionHeading";
import SystemGraph from "@/components/SystemGraph";
import { ecosystemRepositories, getEcosystemHighlights } from "@/content/ecosystem";
import { capabilities, getFeaturedProjects, getProject, site, thesis } from "@/content/portfolio";
import { getPublishedLearnWriting } from "@/content/writing/repository";

export default function Home() {
  const thesisProject = getProject("transport-uq")!;
  const latest = getPublishedLearnWriting()[0];

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
              Examine selected work <ForwardArrow />
            </Link>
            <Link className="button button-secondary" href="/research/thesis">
              Read the research
            </Link>
            <Link className="text-link" href="/contact">
              Contact <ForwardArrow />
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

      {/* Current focus now also carries the capability surface. The two sections asked the
          same question and answered it twice. */}
      <section className="section-wrap focus-section reveal-section">
        <SectionHeading
          index="01"
          eyebrow="Current focus"
          title="What I am working on now"
          introduction="Three engineering themes, each pointing at a public artifact, plus the next evidence gate for every repository that is still moving."
        />
        <CurrentFocus
          capabilities={capabilities}
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

      <section className="section-wrap featured-section reveal-section">
        <SectionHeading
          index="02"
          eyebrow="Selected work"
          title="Systems with inspectable evidence"
          introduction="Each card leads with the project's own audited result or the pipeline it runs. Research, reference implementations, and prototypes are labelled separately."
        />
        <FeaturedWork projects={getFeaturedProjects()} />
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
          introduction="Select any node to see what it means here and which public artifact backs it. Dashed nodes are directions of study with no public project yet."
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
            Read the research record and limitations <ForwardArrow />
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
            GitHub profile <ExternalArrow />
          </a>
        </div>
      </section>

      <section className="section-wrap career-section reveal-section">
        <SectionHeading
          index="06"
          eyebrow="Experience"
          title="Across AI engineering, research, and technical computing"
          introduction="Titles are approved for publication. Confidential work is described at an abstract level only. Disputed historical dates and unverified impact figures are intentionally omitted."
        />
        <ExperienceList />
        <div className="section-action">
          <Link className="text-link" href="/about">Experience and education context <ForwardArrow /></Link>
        </div>
      </section>

      <section className="closing-section section-wrap">
        <p className="kicker">{site.location} / Full-time opportunities</p>
        <h2>Need an engineer who treats evidence as part of the system?</h2>
        <p>{site.availability}. Start with the case studies, the research record, or the open-source ecosystem.</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/contact">Contact <ForwardArrow /></Link>
          <Link className="button button-secondary" href="/learn">Read the tutorials</Link>
        </div>
      </section>
    </PageShell>
  );
}
