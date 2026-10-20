"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";


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

/*
 * Six, in the order someone reads them rather than the order they were built.
 *
 * `/work` keeps its URL and is labelled "Projects": the eight case studies live
 * under it as `/work/<slug>`, and renaming the route would break every link to
 * them, including the ones on the GitHub profile. A label that does not match
 * its path is a smaller cost than a dead link.
 *
 * `/learn` is labelled "Writing" for the same reason. "Learn" described a
 * teaching surface that the thirteen pieces there are not; they are notes on
 * engineering problems, and a visitor looking for them looks for writing.
 *
 * `/architecture`, `/drive` and `/work/repositories` are reachable from the
 * footer rather than here. They are second visits, not first ones, and a seven
 * item bar starts wrapping at the width a laptop actually has.
 */
const NAV = [
  { href: "/experience", label: "Experience" },
  { href: "/research", label: "Research" },
  { href: "/work", label: "Projects" },
  { href: "/certificates", label: "Certificates" },
  { href: "/learn", label: "Writing" },
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

    /*
     * Everything behind the sheet leaves the tab order while it is open.
     *
     * The sheet covers the page and the page kept its focusable elements, so
     * Tab walked straight out of the menu into twenty-six links and buttons
     * that were underneath an opaque panel: focus vanished, and the only way
     * back was to Tab through the whole document. `inert` is the one mechanism
     * that removes an element from the tab order, from the accessibility tree
     * and from pointer events together, which is exactly what "the rest of the
     * page is not here right now" means.
     *
     * The header is left alone deliberately. The close button lives in it, and
     * a modal that disables its own dismiss control is worse than no modal.
     */
    const header = sheetRef.current?.closest("header");
    const muted = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== header && !el.inert,
    );
    for (const el of muted) el.inert = true;

    sheetRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      for (const el of muted) el.inert = false;
    };
  }, [open, close]);

  return (
    <header className="rail" data-open={open ? "" : undefined}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <span aria-hidden="true" className="rail-progress" />

      <div className="rail-inner">
        {/*
          * No `aria-label` here.
          *
          * It used to carry `aria-label="Mohd Zamin Quadri, home"` while the
          * visible text is "MZQ". That fails the label-in-name rule: someone
          * using voice control says what they can see, "MZQ", and nothing
          * matches, so the control is unreachable by voice. The accessible name
          * now comes from the content, which contains both the initials and the
          * full name, and the initials are no longer hidden from it.
          */}
        <Link className="rail-mark" href="/">
          <span>MZQ</span>
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

        {/* One instance, visible at every width. See the note in rail.css. */}
        <div className="rail-theme">
          <ThemeToggle />
        </div>

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

      {/*
        * `role="dialog"` and `aria-modal`, which the comment at the top of this
        * file has claimed since it was written while the element was a plain
        * div with a label on it. A screen reader announced it as a group, gave
        * no indication that the page behind it had gone away, and offered none
        * of the dialog navigation a user expects from something that covers the
        * screen. `aria-modal` is only honest now that the rest of the body is
        * actually inert while it is open; the two belong together.
        */}
      <div
        aria-label="Site navigation"
        aria-modal={open ? true : undefined}
        className="rail-sheet"
        data-open={open ? "" : undefined}
        id={sheetId}
        inert={!open}
        ref={sheetRef}
        role="dialog"
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
        {/*
          * No theme control here. There is one in the bar at every width, and
          * it stays visible while this is open, so a second copy was two
          * buttons with the same accessible name on the same screen.
          */}
        <p className="rail-sheet-foot">
          <a href={identity.github}>GitHub</a>
          <a href={identity.linkedin}>LinkedIn</a>
        </p>
      </div>
    </header>
  );
}
