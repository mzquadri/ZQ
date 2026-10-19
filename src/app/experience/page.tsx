import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import { createPageMetadata } from "@/lib/metadata";
import { homeExperience } from "@/content/home-sections";

export const metadata: Metadata = createPageMetadata({
  title: "Experience",
  description:
    "Roles at BP-IT Consulting, AUDI AG and the Technical University of Munich, with what each one involved.",
  path: "/experience",
});

/*
 * The roles, each one openable.
 *
 * Reads the same `homeExperience` the home page does, deliberately. These were
 * two separate descriptions of four jobs, which is two things to keep true and
 * one of them will drift. A reader who sees a role described differently in two
 * places on the same site trusts neither description.
 *
 * Built on <details> rather than a click handler and a piece of state. The
 * element already opens on click and on Enter, is a disclosure to a screen
 * reader without any ARIA, is findable by the browser's own in-page search
 * while closed, and works before and without JavaScript.
 *
 * Hover is deliberately not wired up: an entry that opens under a passing
 * cursor reflows the page while someone is reading further down it, and there
 * is no hover at all on a phone.
 */
export default function ExperiencePage() {
  return (
    <PageShell current="/experience">
      <section className="xp section-wrap">
        <header className="xp-head">
          <h1>Experience</h1>
          <p className="xp-lede">
            Four roles. Every line below is on my CV, in the same words.
          </p>
        </header>

        <ol className="xp-list">
          {homeExperience.map((role, index) => (
            <li className="xp-item" key={`${role.organisation}-${role.role}`}>
              <details className="xp-entry" name="experience" open={index === 0}>
                <summary className="xp-summary">
                  <span className="xp-role">
                    <span className="xp-title">{role.role}</span>
                    <span className="xp-org">{role.organisation}</span>
                  </span>
                  <span className="xp-meta">
                    {/* No period on BP-IT, and nothing marked current: that role has ended. */}
                    {role.period ? <span className="xp-period">{role.period}</span> : null}
                    <span className="xp-place">{role.location}</span>
                  </span>
                </summary>

                <div className="xp-body">
                  <ul className="xp-detail">
                    {role.bullets.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  );
}
