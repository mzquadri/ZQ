import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { site } from "@/content/portfolio";
import { createPageMetadata } from "@/lib/metadata";

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
          <h2 id="contact-options">Use a channel that actually works.</h2>
          <p>
            No contact form is used: this site does not collect, store, or claim to send
            personal information. A public email is intentionally omitted until a durable
            address is confirmed.
          </p>
        </div>
        <div className="contact-links">
          <a href={site.linkedin}>
            <span>LinkedIn</span>
            <strong>Professional conversation</strong>
            <span aria-hidden="true">↗</span>
          </a>
          <a href={site.github}>
            <span>GitHub</span>
            <strong>Repositories and technical work</strong>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className="section-wrap contact-note">
        <div>
          <p className="section-index"><span>02</span>CV status</p>
          <h2>No broken download and no placeholder document.</h2>
        </div>
        <p>
          An approved redacted CV is not currently available in this repository, so the old
          404 download link has been removed. A reviewed PDF can be added later without
          exposing an address, phone number, birth date, identifiers, signatures, or private
          references.
        </p>
      </section>

      <section className="closing-section section-wrap">
        <p className="kicker">Before contacting</p>
        <h2>Need a quick technical overview?</h2>
        <p>The case studies are designed to answer what I built, how it was checked, and where it stops.</p>
        <Link className="button button-primary" href="/work">Review selected work <span aria-hidden="true">→</span></Link>
      </section>
    </PageShell>
  );
}
