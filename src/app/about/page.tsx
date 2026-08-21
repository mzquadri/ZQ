import type { Metadata } from "next";
import Link from "next/link";
import { EducationList, ExperienceList } from "@/components/CareerProfile";
import PageShell from "@/components/PageShell";
import ProfilePortrait from "@/components/ProfilePortrait";
import { capabilities, getProject, site, thesis } from "@/content/portfolio";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description:
    "Working approach and evidence-backed capabilities across reliable ML, GNNs, MLOps, AI applications, and scientific computing.",
  path: "/about",
});

const principles = [
  {
    title: "Evidence before adjectives",
    copy: "A result should name its dataset, protocol, metric, and limitation. If the artifact is missing, the claim is not promoted.",
  },
  {
    title: "Reliability is a system property",
    copy: "Model quality includes calibration, failure modes, data contracts, monitoring boundaries, and the human decision around a prediction.",
  },
  {
    title: "Small, inspectable interfaces",
    copy: "I prefer explicit pipeline stages, typed service contracts, deterministic fixtures, and tests that make assumptions visible.",
  },
  {
    title: "Scope is part of the result",
    copy: "Research, coursework, prototypes, synthetic demonstrations, and deployed systems answer different questions and should be labelled accordingly.",
  },
] as const;

export default function AboutPage() {
  return (
    <PageShell current="/about">
      <header className="page-hero section-wrap">
        <div className="about-identity">
          <ProfilePortrait variant="feature" />
          <p className="portrait-caption">
            <strong>{site.name}</strong>
            <span>{site.role}</span>
            <span>{site.location}</span>
          </p>
        </div>
        <p className="kicker">About / Working approach</p>
        <h1>Mathematical care, practical engineering.</h1>
        <p>
          I work at the boundary between modelling and systems: understanding what a model
          can support, then building the data, evaluation, and software path that makes that
          evidence useful.
        </p>
      </header>

      <section className="section-wrap about-profile">
        <div>
          <p className="section-index"><span>01</span>Current focus</p>
          <h2>Applied ML with research depth</h2>
        </div>
        <div className="prose-large">
          <p>
            My recent work centres on uncertainty-aware graph neural network surrogates,
            calibration, conformal prediction, and selective review. Alongside that research,
            I build reference ML pipelines and grounded AI service prototypes to exercise the
            operational side of model development.
          </p>
          <p>
            My Master&apos;s thesis, <cite>{thesis.title}</cite>, was submitted at {thesis.institution}.
            The available record states: {thesis.status}. No later education status is published.
          </p>
          <p>
            I am based in {site.location}. {site.availability}, including roles across Machine
            Learning Engineering, Applied AI, reliable ML, scientific computing, GNNs, MLOps,
            and data/AI engineering.
          </p>
        </div>
      </section>

      <section className="section-wrap career-section">
        <p className="section-index"><span>02</span>Experience</p>
        <h2 className="standalone-heading">Professional and research roles</h2>
        <p className="section-lede">
          These approved titles establish the public record without inferring disputed dates,
          private client details, or unsupported impact figures.
        </p>
        <ExperienceList />
      </section>

      <section className="section-wrap education-section">
        <p className="section-index"><span>03</span>Education and academic roles</p>
        <h2 className="standalone-heading">Mathematics carried into computation</h2>
        <p className="section-lede">
          The approved public record includes TUM student research assistant titles in programming,
          visualization, and numerical methods. No duties beyond those titles are inferred.
        </p>
        <EducationList />
      </section>

      <section className="section-wrap principles-section">
        <p className="section-index"><span>04</span>Principles</p>
        <h2 className="standalone-heading">How I approach technical work</h2>
        <div className="principle-grid">
          {principles.map((principle, index) => (
            <article key={principle.title}>
              <span aria-hidden="true">{(index + 1).toString().padStart(2, "0")}</span>
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-wrap capability-detail">
        <p className="section-index"><span>05</span>Capabilities with proof</p>
        <h2 className="standalone-heading">What I can contribute</h2>
        <div className="capability-table">
          {capabilities.map((capability) => (
            <div key={capability.title}>
              <h3>{capability.title}</h3>
              <p>{capability.summary}</p>
              <ul>
                {capability.proof.map((slug) => {
                  const project = getProject(slug)!;
                  return <li key={slug}><Link href={`/work/${slug}`}>{project.title}</Link></li>;
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="closing-section section-wrap">
        <p className="kicker">Next</p>
        <h2>The clearest version of this is the work itself.</h2>
        <p>
          Each case study states the problem, the evidence, and the limitation. The repository
          index shows the same standard applied to smaller projects.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/work">Selected work <span aria-hidden="true">→</span></Link>
          <Link className="button button-secondary" href="/contact">Contact</Link>
        </div>
        <p className="resume-footnote">
          A condensed record is available as an <Link href={site.resume.htmlPath}>HTML resume</Link>,
          generated from the same approved facts as this site.
        </p>
      </section>
    </PageShell>
  );
}
