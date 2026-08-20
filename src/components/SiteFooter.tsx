import Link from "next/link";
import { site } from "@/content/portfolio";

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
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a href={site.linkedin}>
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
