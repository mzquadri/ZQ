import Link from "next/link";
import { site } from "@/content/portfolio";
import { ArrowLabel } from "@/components/Icon";

/*
 * The last thing on every page.
 *
 * It used to carry two links and a disclaimer, which meant a reader who reached the bottom of a
 * case study had to navigate back up to find out who wrote it or how to reach them. The footer
 * now closes the identity: name, role and location on the left, and on the right the things
 * someone at the end of a page actually wants - the work, the architecture, and the two
 * channels.
 *
 * The address is written out rather than hidden behind the word "Email". A mailto whose text is a
 * label cannot be copied by someone who does not have a mail client bound to their browser, which
 * on a work machine is most people.
 */
export default function SiteFooter() {
  const year = new Date().getUTCFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <p className="footer-mark">MZQ / {year}</p>
          <p className="footer-identity">
            <strong>{site.name}</strong>
            <span>{site.role}</span>
            <span>{site.location}</span>
          </p>
          <p className="footer-note">
            Evidence-led ML engineering. No tracking, cookies, or contact-form data.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="footer-links">
          {/* Certificates moved into the main navigation, so it is not repeated
              here. About and Architecture are second visits, not first ones. */}
          <Link href="/work">Selected work</Link>
          <Link href="/architecture">Architecture</Link>
          <Link href="/about">About</Link>
          <a href={"mailto:" + site.email}>
            <ArrowLabel>{site.email}</ArrowLabel>
          </a>
          <a href={site.github}>
            <ArrowLabel>GitHub</ArrowLabel>
          </a>
          <a href={site.linkedin}>
            <ArrowLabel>LinkedIn</ArrowLabel>
          </a>
        </nav>
      </div>
      {/*
        * Datenschutz sits below the rest, quieter than the navigation above it.
        * It has to be reachable from every page, which is why it is here, but
        * nobody arrives looking for it.
        *
        * There is no Impressum link. The page is written and withheld until a
        * c/o address exists, because an Impressum that announces a missing
        * field is worse than no Impressum: its whole purpose is to be the
        * complete statement of who is responsible. See docs/withheld/.
        */}
      <div className="footer-legal">
        <Link href="/datenschutz">Datenschutz</Link>
      </div>
    </footer>
  );
}
