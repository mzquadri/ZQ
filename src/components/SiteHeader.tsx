import Link from "next/link";
import { navigation, site } from "@/content/portfolio";

interface SiteHeaderProps {
  current?: string;
}

export default function SiteHeader({ current }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="header-inner">
        <Link className="wordmark" href="/" aria-label={`${site.name}, home`}>
          <span aria-hidden="true">MZQ</span>
          <span className="wordmark-name">Mohd Zamin Quadri</span>
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
