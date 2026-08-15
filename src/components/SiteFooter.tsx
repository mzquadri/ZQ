import Link from "next/link";
import { site } from "@/content/portfolio";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <p className="footer-mark">MZQ / 2026</p>
          <p className="footer-note">
            Evidence-led ML engineering. No tracking, cookies, or contact-form data.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="footer-links">
          <Link href="/work">Selected work</Link>
          <a href={site.github} rel="noreferrer" target="_blank">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a href={site.linkedin} rel="noreferrer" target="_blank">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
