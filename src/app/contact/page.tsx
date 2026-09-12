import type { Metadata } from "next";
import Link from "next/link";

import { ClosingMark } from "@/components/cinema/PageStages";
import { ClosingCanvas } from "@/components/scene/PersonalCanvases";
import PageShell from "@/components/PageShell";
import { site } from "@/content/portfolio";
import { createPageMetadata } from "@/lib/metadata";
import { ExternalArrow } from "@/components/Icon";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description:
    "Contact Mohd Zamin Quadri about full-time machine learning, Applied AI, GNN, MLOps, and scientific computing roles.",
  path: "/contact",
});

/*
 * The ending of the site.
 *
 * Contact is the last page most readers reach, so it is written as a closing scene rather than a
 * list of links: one statement at full size, the availability underneath it, and the channels
 * that actually work. The mark beside it is a ring drawing itself closed - the site spends its
 * whole length arguing that a system should say where it stops knowing, and the final thing on it
 * is a boundary being drawn.
 *
 * Email and the CV are on this page now. Both were withheld before, and both objections were
 * answered rather than waived: the address is the one already carried by public commit history,
 * so publishing it discloses nothing new, and the CV is generated for the web from the same fact
 * registry the pages render, so it is a published document rather than a private one that has
 * been copied into a public place.
 *
 * Still no form. There is nothing to collect, and a form would imply otherwise.
 */

export default function ContactPage() {
  return (
    <PageShell current="/contact">
      <section className="ending" id="main-ending">
        <div className="ending-inner">
          <div className="ending-copy">
            <p className="ending-eyebrow">Contact / Full-time opportunities</p>
            <h1 className="ending-line">Open to work where the result has to hold up.</h1>
            <p className="ending-support">
              I work at the boundary between modelling and systems. The fastest way to judge
              whether that is useful to you is the evidence itself.
            </p>

            <p className="ending-availability">
              {site.availability} · {site.location}
            </p>

            <ul className="ending-channels contact-links">
              <li>
                <a href={"mailto:" + site.email}>
                  <span>Email</span>
                  <strong>{site.email}</strong>
                </a>
              </li>
              <li>
                <a href={site.cv} download>
                  <span>Curriculum vitae</span>
                  <strong>The record in one page, as a PDF</strong>
                </a>
              </li>
              <li>
                <a href={site.linkedin}>
                  <span>LinkedIn</span>
                  <strong>Professional conversation</strong>
                  <ExternalArrow />
                </a>
              </li>
              <li>
                <a href={site.github}>
                  <span>GitHub</span>
                  <strong>Repositories and the technical record</strong>
                  <ExternalArrow />
                </a>
              </li>
              <li>
                <Link href="/work">
                  <span>Selected work</span>
                  <strong>What was built, checked, and where it stops</strong>
                </Link>
              </li>
            </ul>

            <p className="ending-note">
              No form, no tracking, no cookies, and no contact-form data. Nothing on this site
              publishes a phone number, street address or private identifier, and the published CV
              carries none of them either.
            </p>
          </div>

          <div className="ending-mark" aria-hidden="true">
            <ClosingCanvas flat={<ClosingMark />} />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
