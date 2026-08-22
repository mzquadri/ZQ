import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { site } from "@/content/portfolio";
import { createPageMetadata } from "@/lib/metadata";
import { ArrowLabel, ExternalArrow } from "@/components/Icon";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description:
    "Contact Mohd Zamin Quadri about full-time machine learning, Applied AI, GNN, MLOps, and scientific computing roles.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PageShell current="/contact">
      <header className="contact-hero section-wrap">
        <p className="kicker">Contact / Full-time opportunities</p>
        <h1>Let&apos;s discuss the problem, the evidence, and the engineering.</h1>
        <p>
          I&apos;m based in {site.location}. {site.availability}, and I&apos;m open to conversations
          about Machine Learning Engineering, Applied AI, reliable ML,
          scientific computing, GNNs, MLOps, and data/AI engineering.
        </p>
      </header>

      <section className="section-wrap contact-grid" aria-labelledby="contact-options">
        <div>
          <p className="section-index"><span>01</span>Contact options</p>
          <h2 id="contact-options">Choose the shortest useful path.</h2>
          <p>
            LinkedIn is the primary conversation channel; GitHub provides the technical record.
            This site uses no form, tracking, or personal-data collection.
          </p>
        </div>
        <div className="contact-links">
          <a href={site.linkedin}>
            <span>LinkedIn</span>
            <strong>Professional conversation</strong><ExternalArrow />
          </a>
          <a href={site.github}>
            <span>GitHub</span>
            <strong>Repositories and technical work</strong><ExternalArrow />
          </a>
        </div>
      </section>

      <section className="section-wrap contact-note">
        <div>
          <p className="section-index"><span>02</span>The record itself</p>
          <h2>The site is the evidence.</h2>
        </div>
        <div>
          <p>
            The case studies, research record, and repository index carry the detail a
            conversation usually needs: what was built, how it was checked, and where the claim
            stops. Starting there is faster than a summary document.
          </p>
          <p className="resume-footnote">
            A condensed record is also available as an{" "}
            <Link href={site.resume.htmlPath}>HTML resume</Link> or a{" "}
            <a href={site.resume.pdfPath} download>PDF export</a>. Both are generated from the same
            approved facts and publish no email, phone number, street address, private identifier,
            or disputed employment date.
          </p>
        </div>
      </section>

      <section className="closing-section section-wrap">
        <p className="kicker">Before contacting</p>
        <h2>Need a quick technical overview?</h2>
        <p>The case studies are designed to answer what I built, how it was checked, and where it stops.</p>
        <Link className="button button-primary" href="/work"><ArrowLabel kind="forward">Review selected work</ArrowLabel></Link>
      </section>
    </PageShell>
  );
}
