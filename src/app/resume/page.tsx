import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import PageShell from "@/components/PageShell";
import { EducationList, ExperienceList } from "@/components/CareerProfile";
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
      <article className="resume section-wrap">
        <header className="resume-header">
          <div>
            <p className="kicker">Resume / Verified public record</p>
            <h1>{site.name}</h1>
            <p className="resume-positioning">{site.positioning}</p>
            <p className="resume-focus">{capabilities.map((capability) => capability.title).join(" / ")}</p>
          </div>
          <div className="resume-contact" aria-label="Public profile links">
            <span>{site.location}</span>
            <a href={site.domain}>mzquadri.de</a>
            <a href={site.github}>github.com/mzquadri</a>
            <a href={site.linkedin}>LinkedIn</a>
          </div>
        </header>

        <div className="resume-download">
          <a className="button button-primary" href={site.resume.pdfPath} download>
            Download PDF resume
          </a>
          <p>No email, phone number, street address, or disputed employment dates are published.</p>
        </div>

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
