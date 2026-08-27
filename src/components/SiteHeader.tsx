"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";


/*
 * The global rail.
 *
 * A compact fixed bar rather than a full-screen menu on desktop: navigation is something people
 * use to get somewhere, and a decorative overlay taxes every one of those trips. The active route
 * is marked with a rule under its label, and the reading-progress line above it is a scroll-driven
 * CSS animation - no scroll listener, no JavaScript, and simply absent where unsupported.
 *
 * On phones the links do not fit, so they move into a sheet. That is the only JavaScript the
 * navigation uses: open state, Escape to close, focus moved into the sheet and returned to the
 * button afterwards, and background scroll locked while it is open. The sheet is a real dialog to
 * a screen reader rather than a div that happens to cover the page, and `inert` keeps it out of
 * the tab order when closed without depending on an animation having finished.
 */

const NAV = [
  { href: "/work", label: "Work" },
  { href: "/research", label: "Research" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
] as const;

/*
 * Identity arrives as props, deliberately.
 *
 * This is a client component, so anything it imports is bundled and shipped. Importing the
 * content module for three strings pulled the entire project list into a chunk loaded by every
 * page - confidential draft included. The privacy boundary is not only about what is rendered.
 */
export interface SiteIdentity {
  name: string;
  github: string;
  linkedin: string;
}

export default function SiteHeader({ current, identity }: { current?: string; identity: SiteIdentity }) {
  const pathname = usePathname();
  /*
   * The sheet remembers which route it was opened on, and is open only while the reader is still
   * there. Navigating anywhere closes it for free - no effect, no cascading render, and it also
   * covers browser back/forward, which an onClick handler on the links would miss.
   */
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt !== null && openedAt === pathname;
  const setOpen = useCallback(
    (next: boolean | ((value: boolean) => boolean)) => {
      setOpenedAt((current) => {
        const isOpen = current !== null && current === pathname;
        const wanted = typeof next === "function" ? next(isOpen) : next;
        return wanted ? (pathname ?? "/") : null;
      });
    },
    [pathname],
  );
  const sheetId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  /** A route is active when it is the route or a child of it, so a case study still marks Work. */
  const isActive = useCallback(
    (href: string) => {
      const path = current ?? pathname ?? "/";
      return path === href || path.startsWith(`${href}/`);
    },
    [current, pathname],
  );

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, [setOpen]);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    sheetRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <header className="rail" data-open={open ? "" : undefined}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <span aria-hidden="true" className="rail-progress" />

      <div className="rail-inner">
        <Link className="rail-mark" href="/" aria-label={`${identity.name}, home`}>
          <span aria-hidden="true">MZQ</span>
          <span className="rail-name">Mohd Zamin Quadri</span>
        </Link>

        <nav aria-label="Primary navigation" className="rail-nav">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="rail-link"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          aria-controls={sheetId}
          aria-expanded={open}
          className="rail-toggle"
          onClick={() => setOpen((value) => !value)}
          ref={buttonRef}
          type="button"
        >
          <span aria-hidden="true" className="rail-toggle-mark" />
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <div
        aria-label="Site navigation"
        className="rail-sheet"
        data-open={open ? "" : undefined}
        id={sheetId}
        inert={!open}
        ref={sheetRef}
      >
        <ul>
          {NAV.map((item, i) => (
            <li key={item.href} style={{ "--i": i } as React.CSSProperties}>
              <Link
                aria-current={isActive(item.href) ? "page" : undefined}
                href={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="rail-sheet-foot">
          <a href={identity.github}>GitHub</a>
          <a href={identity.linkedin}>LinkedIn</a>
        </p>
      </div>
    </header>
  );
}
