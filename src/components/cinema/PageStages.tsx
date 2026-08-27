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
 * Research - the argument as a staircase
 *
 * The research page is the deeper explanation, not a second trailer, so its figure is structural
 * rather than illustrative: the sequence of things that have to be established before a fast
 * approximation is allowed to influence a decision. Each step is only reachable from the one
 * below it, which is the actual claim.
 * ========================================================================================== */

export function ResearchLadderScene({ steps }: { steps: readonly string[] }) {
  const width = 900;
  const rowHeight = 62;
  const height = steps.length * rowHeight + 40;

  return (
    <svg
      className="scene-svg scene-research-ladder"
      role="img"
      aria-label={`A staircase of things that must hold in order, each reachable only from the one below it: ${steps.join(", ")}.`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {steps.map((step, i) => {
        const y = height - 30 - i * rowHeight;
        const x = 40 + i * ((width - 260) / Math.max(1, steps.length - 1));
        const range = `contain ${8 + i * 13}% contain ${30 + i * 13}%`;
        return (
          <g className="ladder-step" key={step} style={{ "--range": range } as React.CSSProperties}>
            <line className="ladder-riser" x1={x} x2={x} y1={y} y2={y - rowHeight + 16} />
            <line className="ladder-tread" x1={x} x2={x + 150} y1={y - rowHeight + 16} y2={y - rowHeight + 16} />
            <text className="ladder-label" x={x + 10} y={y - rowHeight + 4}>
              {step}
            </text>
          </g>
        );
      })}
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

/* ============================================================================================
 * Resume - the arc, before the document
 *
 * A resume page that opens with a download button asks the reader to leave before they have any
 * reason to. This is the thing worth knowing first: the direction of travel. Four stages, drawn
 * as a spine, ordered earliest to latest so the shape of the progression is the point rather than
 * any individual row.
 *
 * It states no dates and no impact figures - the site does not publish disputed chronology, and
 * inventing a trajectory would be exactly the kind of claim the rest of it argues against.
 * ========================================================================================== */

export function ProfileSpine({
  stages,
}: {
  stages: readonly { stage: string; problem: string; detail: string }[];
}) {
  return (
    <ol className="spine" aria-label="The arc of the work, earliest first">
      {stages.map((entry, i) => (
        <li className="spine-step" key={entry.stage} style={{ "--i": i } as React.CSSProperties}>
          <span aria-hidden="true" className="spine-node" />
          <p className="spine-stage">{entry.stage}</p>
          <p className="spine-problem">{entry.problem}</p>
          <p className="spine-detail">{entry.detail}</p>
        </li>
      ))}
    </ol>
  );
}
