import { boundaries, disclosure, invariants, representations } from "@/content/reliable-knowledge-world";

/**
 * The machine as a flat schematic, drawn once and completely.
 *
 * What a phone gets, what a reader who declined motion gets, and what is in the document before any
 * JavaScript runs. It carries the whole argument of the world in one figure: a core that cannot be
 * rebuilt, three derived representations around it, and a verification path from each one back to
 * the core rather than onward to an output.
 *
 * The arrows point inward on purpose. That is the entire point of the drawing.
 */

const W = 420;
const H = 300;
const CX = W / 2;
const CY = 150;
const R = 96;

const DERIVED = representations.filter((r) => r.rebuildable);

export default function ReliableWorldFlat() {
  /* Three modules on a ring around the core, evenly spaced, starting at the top. */
  const at = (i: number) => {
    const angle = (i / DERIVED.length) * Math.PI * 2 - Math.PI / 2;
    return { x: CX + Math.cos(angle) * R, y: CY + Math.sin(angle) * R };
  };

  return (
    <div className="reliable-flat">
      <figure className="reliable-flat-figure">
        <svg
          aria-label={`A synthetic schematic. At the centre, captured evidence, which cannot be rebuilt. Around it, ${DERIVED.map(
            (d) => d.label.toLowerCase(),
          ).join(", ")}, each derived from the evidence and each checked by a verification path that runs back to it.`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          viewBox={`0 0 ${W} ${H}`}
        >
          {DERIVED.map((module, i) => {
            const point = at(i);
            /* The verification path: module back to core, drawn as an arrow pointing inward. */
            const dx = CX - point.x;
            const dy = CY - point.y;
            const length = Math.hypot(dx, dy);
            const ux = dx / length;
            const uy = dy / length;
            const start = { x: point.x + ux * 30, y: point.y + uy * 30 };
            const end = { x: CX - ux * 34, y: CY - uy * 34 };
            return (
              <g key={module.key}>
                <path
                  className="reliable-flat-path"
                  d={`M${start.x.toFixed(1)} ${start.y.toFixed(1)} L${end.x.toFixed(1)} ${end.y.toFixed(1)}`}
                />
                <circle className="reliable-flat-head" cx={end.x} cy={end.y} r={3.2} />
                <circle className="reliable-flat-module" cx={point.x} cy={point.y} r={28} />
                <text className="reliable-flat-label" textAnchor="middle" x={point.x} y={point.y + 4}>
                  {module.label.split(" ")[0]}
                </text>
              </g>
            );
          })}

          <circle className="reliable-flat-ring" cx={CX} cy={CY} r={34} />
          <circle className="reliable-flat-core" cx={CX} cy={CY} r={26} />
          <text className="reliable-flat-core-label" textAnchor="middle" x={CX} y={CY + 4}>
            Evidence
          </text>

          <text className="reliable-flat-note" textAnchor="middle" x={CX} y={H - 14}>
            Verification runs inward, from each derived view back to the evidence
          </text>
        </svg>
        <figcaption>
          One capture at the centre, three derived views around it. The arrows run inward because
          the useful question is not whether the pipeline produced something, but whether what it
          produced still agrees with what it was built from. {disclosure.short}
        </figcaption>
      </figure>

      <ol className="reliable-flat-invariants">
        {invariants.map((invariant) => (
          <li key={invariant.key}>
            <strong>{invariant.label}</strong>
            <span>{invariant.question}</span>
          </li>
        ))}
      </ol>

      <ul className="reliable-flat-boundaries">
        {boundaries.map((boundary) => (
          <li key={boundary.label}>
            <strong>{boundary.label}</strong>
            <span>{boundary.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
