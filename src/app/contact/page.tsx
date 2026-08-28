import type { Metadata } from "next";
import Link from "next/link";

import { ClosingMark } from "@/components/cinema/PageStages";
import { ClosingCanvas } from "@/components/scene/PersonalCanvases";
import PageShell from "@/components/PageShell";
import { closing } from "@/content/cinema";
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
 * list of links: one statement at full size, the availability underneath it, and the two channels
 * that actually work. The mark beside it is a ring drawing itself closed - the site spends its
 * whole length arguing that a system should say where it stops knowing, and the final thing on it
 * is a boundary being drawn.
 *
 * No form. There is nothing to collect, and a form would imply otherwise.
 */

export default function ContactPage() {
  return (
    <PageShell current="/contact">
      <section className="ending" id="main-ending">
        <div className="ending-inner">
          <div className="ending-copy">
            <p className="ending-eyebrow">Contact / Full-time opportunities</p>
            <h1 className="ending-line">{closing.line}</h1>
            <p className="ending-support">
              I work at the boundary between modelling and systems, and I am most useful where a
              result has to survive being checked. If that is the kind of engineering you need, the
              case studies and the research record are the fastest way to judge whether it is any
              good.
            </p>

            <p className="ending-availability">
              {site.availability} · {site.location}
            </p>

            <ul className="ending-channels contact-links">
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

            <p className="ending-note resume-footnote">
              No form, no tracking, no cookies, and no contact-form data. A condensed record is
              available as an <Link href={site.resume.htmlPath}>HTML resume</Link> or a{" "}
              <a href={site.resume.pdfPath} download>PDF export</a>; both are generated from the
              same approved facts and publish no email, phone number, street address, private
              identifier, or disputed employment date.
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
