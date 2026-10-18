import type { Metadata } from "next";

import PageShell from "@/components/PageShell";
import { site } from "@/content/portfolio";

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "What this site collects, which is nothing: no cookies, no analytics, no third-party requests, and fonts served from this domain.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: true, follow: true },
};

/*
 * The privacy page.
 *
 * Mostly a list of absences, and that is the honest shape for it: this site
 * sets no cookie, runs no analytics, embeds nothing, and makes no request to a
 * third party from the reader's browser. A privacy policy that describes
 * elaborate data handling on a site that does none would be worse than none.
 *
 * Written in English, with the German legal terms named where they are the
 * terms that matter, because the page is read by both German and
 * non-German-speaking recruiters and the rest of the site is in English.
 */
export default function DatenschutzPage() {
  return (
    <PageShell current="/datenschutz">
      <section className="legal section-wrap">
        <header>
          <p className="kicker">Datenschutzerklaerung</p>
          <h1>Privacy</h1>
          <p className="legal-lede">
            This site collects nothing about you. The detail below says what that
            means in practice and what the one unavoidable exception is.
          </p>
        </header>

        <h2>What this site does not do</h2>
        <ul className="legal-list">
          <li>No cookies of any kind are set. There is no cookie banner because there is nothing to consent to.</li>
          <li>No analytics, no tracking pixels, no fingerprinting, no A/B testing.</li>
          <li>
            No third-party requests from your browser. Fonts, images and styles
            are served from this domain, so no font provider, CDN or social
            network learns that you visited.
          </li>
          <li>No contact form, so nothing you type is transmitted or stored.</li>
          <li>No account, no login, no profile.</li>
        </ul>

        <h2>The one thing stored in your browser</h2>
        <p>
          If you choose a colour theme, that choice is saved in your
          browser&apos;s local storage under the key <code>theme</code>, with the
          value <code>light</code> or <code>dark</code>. It never leaves your
          device and it is not readable by anyone else. Choosing{" "}
          <strong>System</strong> removes it. Clearing your browser data removes
          it. This is a preference, not an identifier: it holds one of two words
          and nothing that could distinguish you from anyone else who picked the
          same one.
        </p>

        <h2>Server logs</h2>
        <p>
          The site is hosted by Vercel Inc. Like any web host, its servers record
          technical request data, which typically includes the IP address, the
          time of the request, the page requested, and the browser&apos;s user
          agent string. This happens at the infrastructure level and is necessary
          to deliver the page to you at all. The legal basis is the legitimate
          interest in operating and securing the service,{" "}
          <span className="legal-term">Art. 6 Abs. 1 lit. f GDPR</span>. I do not
          read, analyse or export these logs, and nothing on this site joins them
          to anything else.
        </p>
        <p>
          Vercel acts as a processor and may transfer data to the United States
          under the EU-US Data Privacy Framework and standard contractual
          clauses. Their privacy notice is at{" "}
          <a href="https://vercel.com/legal/privacy-policy" rel="noopener noreferrer" target="_blank">
            vercel.com/legal/privacy-policy
          </a>
          .
        </p>

        <h2>Contact by email</h2>
        <p>
          If you write to me at{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>, your message and your
          address are processed in order to reply to you,{" "}
          <span className="legal-term">Art. 6 Abs. 1 lit. b and lit. f GDPR</span>
          . That mailbox is a Google account, so Google processes the message as
          the mail provider. I keep correspondence only as long as the
          conversation needs and delete it afterwards.
        </p>

        <h2>Your rights</h2>
        <p>
          Under the GDPR you may request access to your data{" "}
          <span className="legal-term">(Art. 15)</span>, correction{" "}
          <span className="legal-term">(Art. 16)</span>, erasure{" "}
          <span className="legal-term">(Art. 17)</span>, restriction of
          processing <span className="legal-term">(Art. 18)</span>, and data
          portability <span className="legal-term">(Art. 20)</span>, and you may
          object to processing based on legitimate interest{" "}
          <span className="legal-term">(Art. 21)</span>. In practice I hold
          nothing about you unless you have emailed me. You also have the right
          to complain to a supervisory authority; for Munich that is the{" "}
          <span className="legal-term">
            Bayerisches Landesamt fuer Datenschutzaufsicht
          </span>
          .
        </p>

        <h2>External links</h2>
        <p>
          This site links out to GitHub, LinkedIn, Coursera, Udemy, DataCamp and
          a number of repositories. Those pages are not covered by this notice
          and set their own cookies once you open them. Nothing is embedded from
          them here, so following a link is the only way your browser contacts
          them.
        </p>

        <h2>Responsible for this site</h2>
        <p>
          {site.name}, {site.location}. Contact:{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>. See also the{" "}
          <a href="/impressum">Impressum</a>.
        </p>
      </section>
    </PageShell>
  );
}
