/**
 * Inline icons.
 *
 * These replace the `↗` character. U+2197 has an emoji presentation on Windows and
 * Android, so a link that should have carried a small ink-coloured arrow was rendering
 * a blue emoji tile instead — dozens of times per page. A variation selector fixes it
 * inconsistently across platforms; an inline SVG does not depend on font fallback at
 * all and inherits `currentColor`, so the arrow finally matches the text it belongs to.
 *
 * Every icon is decorative. Link text already carries the meaning, so each is marked
 * aria-hidden and contributes nothing to the accessible name.
 */

interface IconProps {
  className?: string;
}

/** Diagonal arrow marking a link that leaves this site. */
export function ExternalArrow({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className ? `icon ${className}` : "icon"}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="square"
      strokeWidth="1.6"
      viewBox="0 0 12 12"
    >
      <path d="M3.4 8.6 8.6 3.4" />
      <path d="M4.3 3.4h4.3v4.3" />
    </svg>
  );
}

/**
 * A label with its trailing arrow bound to the final word.
 *
 * An SVG is an atomic inline box, and browsers allow a line break immediately before one.
 * Deleting the whitespace in the markup is therefore not enough on its own: a long title
 * that filled its line still pushed the arrow onto a line by itself, which is what happened
 * to the repository and arXiv titles. Only the last word and the icon are held together,
 * so everything before them keeps wrapping normally — the alternative, `nowrap` on the whole
 * link, would force long titles to overflow instead.
 *
 * The label stays plain text in the accessible name; the arrow remains decorative and
 * aria-hidden, exactly as when it is used on its own.
 */
export function ArrowLabel({ children, kind = "external" }: { children: string; kind?: "external" | "forward" }) {
  const words = children.trim().split(/\s+/);
  const last = words.pop() ?? "";
  const Arrow = kind === "forward" ? ForwardArrow : ExternalArrow;

  return (
    <>
      {words.length > 0 ? `${words.join(" ")} ` : null}
      <span className="arrow-label">
        {last}
        <Arrow />
      </span>
    </>
  );
}

/** Rightward arrow for in-site continuation links. */
export function ForwardArrow({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className ? `icon ${className}` : "icon"}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="square"
      strokeWidth="1.6"
      viewBox="0 0 12 12"
    >
      <path d="M2 6h8" />
      <path d="M6.4 2.4 10 6l-3.6 3.6" />
    </svg>
  );
}
