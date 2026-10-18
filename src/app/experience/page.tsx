import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import { site } from "@/content/portfolio";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Roles at BP-IT Consulting, AUDI AG and the Technical University of Munich, with what each one involved and the tools it used.",
  alternates: { canonical: "/experience" },
};

/*
 * The roles, each one openable.
 *
 * Built on <details> rather than a click handler and a piece of state. The
 * element already does everything this needs: it opens on click and on Enter,
 * it is a disclosure to a screen reader without any ARIA, it is findable by the
 * browser's own in-page search even while closed, and it works before and
 * without JavaScript. The page is a server component as a result.
 *
 * The brief asks for the brittanychiang.com treatment, where an entry expands
 * on hover or click. Hover is deliberately not wired up: an entry that opens
 * under a passing cursor reflows the page while someone is reading further
 * down it, and there is no hover at all on the phones this is mostly read on.
 * Click and keyboard do the same thing, and that is the whole interaction.
 *
 * The first role starts open, because a page of four closed rows tells a
 * visitor nothing and makes them work to find out whether it is worth the
 * click.
 */
export default function ExperiencePage() {
  return (
    <PageShell current="/experience">
      <section className="xp section-wrap">
        <header className="xp-head">
          <h1>Experience</h1>
          <p className="xp-lede">
            Four roles. Every line below is on my CV, in the same words, and
            nothing here appears on one and not the other.
          </p>
        </header>

        <ol className="xp-list">
          {site.experience.map((role, index) => (
            <li className="xp-item" key={role.id}>
              <details className="xp-entry" name="experience" open={index === 0}>
                <summary className="xp-summary">
                  <span className="xp-role">
                    <span className="xp-title">{role.title}</span>
                    <span className="xp-org">{role.organization}</span>
                  </span>
                  <span className="xp-meta">
                    {role.period ? <span className="xp-period">{role.period}</span> : null}
                    {role.location ? <span className="xp-place">{role.location}</span> : null}
                  </span>
                </summary>

                <div className="xp-body">
                  {role.detail?.length ? (
                    <ul className="xp-detail">
                      {role.detail.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : null}

                  {role.tech?.length ? (
                    <ul className="xp-tech" aria-label={`Tools used at ${role.organization}`}>
                      {role.tech.map((tool) => (
                        <li key={tool}>{tool}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </details>
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  );
}
