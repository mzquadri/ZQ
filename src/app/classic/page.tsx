import type { Metadata } from "next";
import Link from "next/link";

import ThemeToggle from "@/components/ThemeToggle";
import { projects, site, thesis } from "@/content/portfolio";
import { places } from "@/content/world-atlas";

export const metadata: Metadata = {
  title: "Classic view",
  description:
    "Everything the 3D world shows, on one scrolling page: the work, the results, education, certificates and how to get in touch.",
};

/**
 * The classic view.
 *
 * The same content as the world, as a plain scrolling page with no WebGL and
 * no animation. It is not a lesser version kept for people with old machines:
 * it is the fast way to read the site, it is what a phone opens, and the world
 * links to it from a button that is on screen the whole time.
 *
 * Everything here is read from the content modules the rest of the site uses,
 * so a number corrected in one place is corrected on both views at once.
 */
export default function ClassicPage() {
  const featured = places;
  const certifications = site.certifications;

  return (
    <main className="classic">
      <div className="classic-top">
        <Link className="classic-back" href="/world">
          Open the 3D world
        </Link>
        <ThemeToggle />
      </div>

      <h1>{site.name}</h1>
      <p className="classic-standfirst">
        {site.positioning} Based in {site.location}. {site.availability}.
      </p>

      <section id="work" aria-labelledby="work-heading">
        <h2 id="work-heading">Work</h2>
        {featured.map((place) => (
          <article className="classic-entry" key={place.id}>
            <div className="classic-entry-head">
              <h3>{place.name}</h3>
              <span className="classic-when">{place.kind}</span>
            </div>
            <p className="classic-body">{place.detail}</p>
            <span className="classic-result">{place.headline}</span>
          </article>
        ))}
      </section>

      <section id="experience" aria-labelledby="experience-heading">
        <h2 id="experience-heading">Experience</h2>
        {site.experience.map((role) => (
          <article className="classic-entry" key={role.id}>
            <div className="classic-entry-head">
              <h3>{role.organization}</h3>
              <span className="classic-when">{role.period}</span>
            </div>
            <p className="classic-role">
              {role.title}. {role.location}.
            </p>
            {role.practice ? <p className="classic-body">{role.practice}</p> : null}
          </article>
        ))}
      </section>

      <section id="education" aria-labelledby="education-heading">
        <h2 id="education-heading">Education</h2>
        {site.education.map((record) => (
          <article className="classic-entry" key={record.id}>
            <div className="classic-entry-head">
              <h3>{record.institution}</h3>
              <span className="classic-when">{record.period}</span>
            </div>
            <p className="classic-role">
              {record.credential}. {record.location}.
            </p>
            {record.status ? <p className="classic-body">{record.status}</p> : null}
          </article>
        ))}
        <article className="classic-entry">
          <div className="classic-entry-head">
            <h3>Master&apos;s thesis</h3>
            <span className="classic-when">{thesis.status}</span>
          </div>
          <p className="classic-body">{thesis.title}</p>
        </article>
      </section>

      <section id="repositories" aria-labelledby="repositories-heading">
        <h2 id="repositories-heading">Public repositories</h2>
        {projects.map((project) => (
          <article className="classic-entry" key={project.slug}>
            <div className="classic-entry-head">
              <h3>{project.title}</h3>
              <span className="classic-when">{project.classification}</span>
            </div>
            <p className="classic-body">{project.summary}</p>
          </article>
        ))}
      </section>

      <section id="certificates" aria-labelledby="certificates-heading">
        <h2 id="certificates-heading">Certificates</h2>
        {certifications.map((credential) => (
          <article className="classic-entry" key={credential.id}>
            <div className="classic-entry-head">
              <h3>{credential.title}</h3>
              <span className="classic-when">{credential.awarded}</span>
            </div>
            <p className="classic-role">
              {credential.issuer}.{" "}
              <a href={credential.credentialUrl} rel="noreferrer noopener" target="_blank">
                Verify
              </a>
            </p>
          </article>
        ))}
      </section>

      <section id="contact" aria-labelledby="contact-heading">
        <h2 id="contact-heading">Contact</h2>
        <ul className="classic-links">
          <li>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li>
            <a href={site.linkedin} rel="noreferrer noopener" target="_blank">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={site.github} rel="noreferrer noopener" target="_blank">
              GitHub
            </a>
          </li>
          <li>
            <Link href="/">Full site</Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
