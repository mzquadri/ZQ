import Link from "next/link";
import { site } from "@/content/portfolio";
import { ArrowLabel } from "@/components/Icon";

export default function SiteFooter() {
  const year = new Date().getUTCFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <p className="footer-mark">MZQ / {year}</p>
          <p className="footer-note">
            Evidence-led ML engineering. No tracking, cookies, or contact-form data.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="footer-links">
          <Link href="/work">Selected work</Link>
          <Link href="/learn">Learn</Link>
          <Link href={site.resume.htmlPath}>Resume</Link>
          <a href={site.github}>
            <ArrowLabel>GitHub</ArrowLabel>
          </a>
          <a href={site.linkedin}>
            <ArrowLabel>LinkedIn</ArrowLabel>
          </a>
        </nav>
      </div>
    </footer>
  );
}
