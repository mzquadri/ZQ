import { existsSync } from "node:fs";
import { resolve } from "node:path";
import Image from "next/image";
import { site } from "@/content/portfolio";

/**
 * The profile portrait, with a deterministic fallback.
 *
 * The photograph is not committed yet, and a missing file must not break the build or
 * leave a broken image on the page. The existence check runs on the server at build
 * time, so a page either renders the real portrait or a generated monogram — never an
 * empty box and never a request for a file that is not there.
 *
 * The fallback is drawn from the existing theme tokens rather than a new palette, so it
 * reads as part of the design rather than as a missing asset.
 */

const PORTRAIT_PATH = "/images/zamin-profile.jpg";
const PORTRAIT_FILE = resolve("public", "images", "zamin-profile.jpg");

/** Evaluated once at build time. */
export const hasPortrait = existsSync(PORTRAIT_FILE);

type Variant = "hero" | "feature";

const SIZES: Record<Variant, number> = {
  hero: 132,
  feature: 208,
};

const MONOGRAM_INITIALS = "ZQ";

function Monogram({ size }: { size: number }) {
  return (
    <svg
      aria-hidden="true"
      className="portrait-monogram"
      focusable="false"
      height={size}
      role="img"
      viewBox="0 0 100 100"
      width={size}
    >
      <defs>
        <linearGradient id="portrait-gradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--paper-raised)" />
          <stop offset="55%" stopColor="var(--paper-deep)" />
          <stop offset="100%" stopColor="var(--teal)" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#portrait-gradient)" />
      <text
        dominantBaseline="central"
        fill="var(--ink)"
        fontFamily="var(--serif)"
        fontSize="38"
        fontWeight="500"
        letterSpacing="-1"
        textAnchor="middle"
        x="50"
        y="52"
      >
        {MONOGRAM_INITIALS}
      </text>
    </svg>
  );
}

interface ProfilePortraitProps {
  variant?: Variant;
  /** Only the hero portrait should preload; everything else is below the fold. */
  priority?: boolean;
}

export default function ProfilePortrait({
  variant = "hero",
  priority = false,
}: ProfilePortraitProps) {
  const size = SIZES[variant];

  return (
    <div className="portrait" data-variant={variant}>
      <div className="portrait-frame">
        {hasPortrait ? (
          <Image
            alt={`${site.name}, ${site.role}`}
            className="portrait-image"
            height={size}
            priority={priority}
            sizes={`${size}px`}
            src={PORTRAIT_PATH}
            width={size}
          />
        ) : (
          <Monogram size={size} />
        )}
      </div>
    </div>
  );
}
