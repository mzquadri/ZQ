import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { ProfileSpine, StageHero } from "@/components/cinema/PageStages";
import PageShell from "@/components/PageShell";
import { EducationList, ExperienceList } from "@/components/CareerProfile";
import { problemClasses } from "@/content/cinema";
import { capabilities, getProject, resumeProjectSlugs, site, thesis } from "@/content/portfolio";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Resume",
  description: `Recruiter resume for ${site.name}: verified experience, education, selected ML systems, and technical capabilities.`,
  path: site.resume.htmlPath,
});

export default function ResumePage() {
  const selectedProjects = resumeProjectSlugs.map((slug) => getProject(slug)!);

  return (
    <PageShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: site.name,
            jobTitle: site.role,
            url: site.domain,
            sameAs: [site.github, site.linkedin],
          },
        }}
      />
      <StageHero
        accent="var(--accent-pipeline)"
        eyebrow="Resume / Verified public record"
        title={site.name}
        standfirst={site.positioning}
        meta={[
          { label: "Based in", value: site.location },
          { label: "Focus", value: capabilities.map((capability) => capability.title).join(" / ") },
        ]}
        figure={<ProfileSpine stages={[...problemClasses].reverse()} />}
      >
        <p className="page-stage-actions">
          <a className="cine-cta mz-interactive" href={site.resume.pdfPath} download>
            Download PDF
          </a>
          <a className="cine-cta cine-cta-quiet mz-interactive" href={site.github}>GitHub</a>
          <a className="cine-cta cine-cta-quiet mz-interactive" href={site.linkedin}>LinkedIn</a>
        </p>
        <p className="page-stage-note">
          No email, phone number, street address, or disputed employment dates are published.
        </p>
      </StageHero>

      <article className="resume section-wrap">

        <section className="resume-section" aria-labelledby="resume-experience">
          <h2 id="resume-experience">Experience</h2>
          <ExperienceList />
        </section>

        <section className="resume-section" aria-labelledby="resume-education">
          <h2 id="resume-education">Education</h2>
          <EducationList />
          <p className="resume-thesis"><span className="resume-emphasis">Thesis:</span> {thesis.title}. {thesis.status}.</p>
        </section>

        <section className="resume-section" aria-labelledby="resume-work">
          <h2 id="resume-work">Selected work</h2>
          <div className="resume-projects">
            {selectedProjects.map((project) => (
              <article key={project.slug}>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <p><span className="resume-emphasis">{project.evidence[0].value}</span> — {project.evidence[0].note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="resume-section resume-capability-section" aria-labelledby="resume-capabilities">
          <h2 id="resume-capabilities">Capabilities</h2>
          <div className="resume-capabilities">
            {capabilities.map((capability) => (
              <div key={capability.title}>
                <h3>{capability.title}</h3>
                <p>{capability.summary}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </PageShell>
  );
}
