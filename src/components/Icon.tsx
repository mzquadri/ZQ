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
