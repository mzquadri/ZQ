import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/content/portfolio";

export const metadata: Metadata = createPageMetadata({
  title: "Certificates and volunteering",
  description:
    "Five certifications, each with the issuer's own verification page, plus volunteering with AIESEC in Munich and the European Youth Event 2023.",
  path: "/certificates",
});

/*
 * Credentials, and the thing that makes them worth publishing: every one links
 * to the issuer's own verification page.
 *
 * A certificate a reader cannot check is an assertion. All five links were
 * opened and read before they were added, and `_portfolio-work/CERTIFICATES.md`
 * is the single list the CV, the GitHub profile and this page all quote. The
 * closed set is the point: a README rewrite once replaced a verified list with
 * three plausible course names that had never been held, and set membership is
 * what catches that where substring matching does not.
 */
export default function CertificatesPage() {
  return (
    <PageShell current="/certificates">
      <section className="cred section-wrap">
        <header className="cred-head">
          <p className="kicker">Checkable, not asserted</p>
          <h1>Certificates and volunteering</h1>
          <p className="cred-lede">
            Five certifications. Each one links to the issuer&apos;s own
            verification page, because a credential you cannot check is a claim.
          </p>
        </header>

        <h2 className="cred-h2" id="certifications">
          Certifications
        </h2>
        <ul className="cred-list">
          {site.certifications.map((credential) => (
            <li className="cred-item" key={credential.id}>
              <div className="cred-main">
                <p className="cred-title">{credential.title}</p>
                <p className="cred-issuer">{credential.issuer}</p>
              </div>
              <div className="cred-side">
                <span className="cred-date">{credential.awarded}</span>
                {credential.credentialUrl ? (
                  <a
                    className="cred-verify"
                    href={credential.credentialUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Verify
                    <span className="visually-hidden"> {credential.title}</span>
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        <h2 className="cred-h2" id="volunteering">
          Volunteering
        </h2>
        <ul className="cred-list">
          {site.volunteering.map((entry) => (
            <li className="cred-item cred-item-block" key={entry.id}>
              <div className="cred-main">
                <p className="cred-title">{entry.role}</p>
                <p className="cred-issuer">{entry.organization}</p>
                <p className="cred-summary">{entry.summary}</p>
                {/*
                  * EYE 2023 produced two certificates from two different
                  * issuers, and only one of them is the European Parliament.
                  * Naming just the Parliament's would drop the delegation that
                  * actually sent him; naming just the delegation's would leave
                  * the Parliament's document unaccounted for. Both, or neither.
                  */}
                {entry.issuer ? <p className="cred-note">{entry.issuer}</p> : null}
              </div>
              <div className="cred-side">
                <span className="cred-date">{entry.period}</span>
                {entry.location ? <span className="cred-place">{entry.location}</span> : null}
              </div>
            </li>
          ))}
        </ul>

        <h2 className="cred-h2" id="languages">
          Languages
        </h2>
        <ul className="cred-langs">
          {site.languages.map((language) => (
            <li key={language.id}>
              <span className="cred-lang">{language.language}</span>
              <span className="cred-level">{language.level}</span>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
