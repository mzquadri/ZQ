import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import { site } from "@/content/portfolio";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Provider identification under Paragraph 5 DDG.",
  alternates: { canonical: "/impressum" },
};

/*
 * Provider identification.
 *
 * The obligation is Paragraph 5 DDG, not Paragraph 5 TMG: the
 * Digitale-Dienste-Gesetz replaced the Telemediengesetz on 14 May 2024, and
 * anything still citing the TMG predates that.
 *
 * **The address is deliberately not filled in.** A full Impressum needs a
 * ladungsfaehige Anschrift, meaning somewhere legal documents can actually be
 * served; a Postfach is explicitly not enough. The only address available is a
 * private home address, and publishing one is permanent: it is indexed,
 * archived and cannot be retracted. That is the owner's decision to make, not
 * mine, so the line is marked rather than guessed at, and the reasoning is in
 * docs/IMPRESSUM_ASSESSMENT.md.
 *
 * The page is published incomplete on purpose. An Impressum that is visibly
 * missing one field is better than no page at all, and far better than a page
 * that quietly omits the field and reads as complete.
 */
export default function ImpressumPage() {
  return (
    <PageShell current="/impressum">
      <section className="legal section-wrap">
        <header>
          <p className="kicker">Angaben gemaess Paragraph 5 DDG</p>
          <h1>Impressum</h1>
        </header>

        <h2>Provider</h2>
        <address className="legal-address">
          {site.name}
          <br />
          <mark className="legal-missing">
            Postal address not yet published. See the note below.
          </mark>
          <br />
          {site.location}
        </address>

        <h2>Contact</h2>
        <p>
          Email: <a href={`mailto:${site.email}`}>{site.email}</a>
          <br />
          Web: <a href={site.domain}>{site.domain}</a>
        </p>

        <h2>Responsible for the content</h2>
        <p>
          {site.name}, at the address above.{" "}
          <span className="legal-term">(Paragraph 18 Abs. 2 MStV)</span>
        </p>

        <h2>VAT</h2>
        <p>
          No VAT identification number under{" "}
          <span className="legal-term">Paragraph 27 a UStG</span>: this is a
          personal portfolio and no goods or services are offered through it.
        </p>

        <h2>About the missing address</h2>
        <p className="legal-note">
          Paragraph 5 DDG requires an address at which legal documents can be
          served. The only one available is a private residence, and a home
          address on a public page is indexed and archived permanently. The
          owner is deciding between publishing it and using a c/o business
          address, which is the usual arrangement for exactly this situation.
          Until then this page states what it is missing rather than reading as
          though it were complete.
        </p>

        <h2>Dispute resolution</h2>
        <p>
          The European Commission provides a platform for online dispute
          resolution at{" "}
          <a href="https://ec.europa.eu/consumers/odr/" rel="noopener noreferrer" target="_blank">
            ec.europa.eu/consumers/odr
          </a>
          . I am neither obliged nor willing to take part in dispute resolution
          proceedings before a consumer arbitration board.
        </p>

        <h2>Liability for links</h2>
        <p>
          This site links to external pages over whose content I have no
          control. Responsibility for that content rests with its respective
          providers. The linked pages were checked for apparent legal violations
          at the time of linking; none was evident. Continuous monitoring without
          concrete evidence of an infringement is not reasonable, and any link
          will be removed promptly if one becomes known.
        </p>
      </section>
    </PageShell>
  );
}
