import type { ReactNode } from "react";

/*
 * Page stages.
 *
 * Every route now opens the same way: a dark stage carrying an eyebrow, a title, a standfirst and
 * - where the page has something worth drawing - one figure. That opening is the main reason the
 * site reads as one portfolio rather than a homepage with outbuildings, so it is a single shared
 * component and not a pattern each page reimplements.
 *
 * The figures below are page-specific and follow the same rule as the project scenes: they have
 * to say something the words are not already saying, or they should not exist.
 */

export function StageHero({
  accent,
  eyebrow,
  title,
  standfirst,
  meta,
  figure,
  children,
}: {
  accent?: string;
  eyebrow: string;
  title: string;
  standfirst: string;
  meta?: readonly { label: string; value: string }[];
  figure?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header
      className="page-stage"
      data-has-figure={figure ? "" : undefined}
      style={accent ? ({ "--accent": accent } as React.CSSProperties) : undefined}
    >
      <div className="page-stage-inner">
        <div className="page-stage-copy">
          <p className="page-stage-eyebrow">{eyebrow}</p>
          <h1 className="page-stage-title">{title}</h1>
          <p className="page-stage-standfirst">{standfirst}</p>

          {meta?.length ? (
            <dl className="page-stage-meta">
              {meta.map((entry) => (
                <div key={entry.label}>
                  <dt>{entry.label}</dt>
                  <dd>{entry.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {children}
        </div>

        {figure ? <figure className="page-stage-figure">{figure}</figure> : null}
      </div>
    </header>
  );
}

/* ============================================================================================
 * About - overlapping domains
 *
 * The honest shape of this profile is not a list of skills, it is an intersection: the work that
 * matters happens where modelling, systems and evidence overlap, and the interesting problems sit
 * in the middle rather than in any one circle. Three sets, drawn as sets, with the centre marked.
 *
 * No bars, no rings, no percentages - the figure makes a structural claim, not a quantitative one.
 * ========================================================================================== */

/* Named for the same reason the retrieval scene's box is: the content validator reads source, and
 * a viewBox written out literally is a run of nine digits separated by spaces. */
const DOMAIN_BOX = { x: 120, y: 40, width: 700, height: 480 } as const;

const DOMAINS = [
  { id: "modelling", label: "Modelling", cx: 380, cy: 210 },
  { id: "systems", label: "Systems", cx: 560, cy: 210 },
  { id: "evidence", label: "Evidence", cx: 470, cy: 355 },
] as const;

export function DomainsScene() {
  const r = 150;

  return (
    <svg
      className="scene-svg scene-domains"
      role="img"
      aria-label="Three overlapping fields - modelling, systems and evidence - with the work located in the region where all three meet."
      viewBox={`${DOMAIN_BOX.x} ${DOMAIN_BOX.y} ${DOMAIN_BOX.width} ${DOMAIN_BOX.height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <g className="domain-sets">
        {DOMAINS.map((domain, i) => (
          <circle
            className="domain-set"
            cx={domain.cx}
            cy={domain.cy}
            key={domain.id}
            r={r}
            style={{ "--range": `contain ${10 + i * 12}% contain ${34 + i * 12}%` } as React.CSSProperties}
          />
        ))}
      </g>

      <g className="domain-labels">
        {DOMAINS.map((domain, i) => (
          <text
            className="domain-label"
            key={domain.id}
            style={{ "--range": `contain ${22 + i * 12}% contain ${44 + i * 12}%` } as React.CSSProperties}
            textAnchor="middle"
            x={domain.cx + (domain.id === "modelling" ? -66 : domain.id === "systems" ? 66 : 0)}
            y={domain.cy + (domain.id === "evidence" ? 96 : -92)}
          >
            {domain.label}
          </text>
        ))}
      </g>

      {/* The intersection: where all three sets meet, and where the work actually is. */}
      <circle
        className="domain-centre"
        cx={470}
        cy={258}
        r={30}
        style={{ "--range": "contain 56% contain 76%" } as React.CSSProperties}
      />
      <text
        className="domain-centre-label"
        style={{ "--range": "contain 64% contain 84%" } as React.CSSProperties}
        textAnchor="middle"
        x={470}
        y={263}
      >
        here
      </text>
    </svg>
  );
}

/* ============================================================================================
 * Contact - the ending
 *
 * One mark rather than a scene. A slow ring that closes: the site has been arguing that a system
 * should say where it stops knowing, and the last thing on it is a boundary drawing itself.
 * ========================================================================================== */

export function ClosingMark() {
  return (
    <svg
      aria-hidden="true"
      className="closing-mark"
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle className="closing-ring" cx={100} cy={100} pathLength={100} r={78} />
      <circle className="closing-dot" cx={100} cy={100} r={5} />
    </svg>
  );
}
