import { findings, sources } from "@/content/medico-world";
import { coverage, maskMatrix } from "./geometry";

/**
 * Label coverage by source, on its own.
 *
 * The same figure the project route uses as its static state, without the boundary list beneath
 * it - on the homepage the chapter states the boundary in its own copy, and repeating it under the
 * picture would say the same thing twice in the space of one screen.
 */

const CELL = 20;
const GAP = 3;
const LEFT = 132;
const TOP = 16;

export default function MedicoMatrix() {
  const width = LEFT + findings.length * (CELL + GAP) + 8;
  const height = TOP + sources.length * (CELL + GAP) + 46;

  return (
    <div className="medico-matrix">
      <figure className="medico-flat-figure">
        <svg
          aria-label={`Label coverage by source. ${sources
            .map((s, i) => `${s.name} supplies ${coverage[i].covered} of ${findings.length} findings`)
            .join(". ")}. Findings a source does not supply are masked out of the loss rather than treated as negative.`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          viewBox={`0 0 ${width} ${height}`}
        >
          {sources.map((source, s) => (
            <g key={source.key}>
              <text className="medico-flat-source" x={LEFT - 10} y={TOP + s * (CELL + GAP) + CELL * 0.72}>
                {source.name}
              </text>
              {findings.map((finding, f) => (
                <rect
                  className="medico-flat-cell"
                  data-on={maskMatrix[s][f] === 1 ? "" : undefined}
                  height={CELL}
                  key={finding.name}
                  rx={2}
                  width={CELL}
                  x={LEFT + f * (CELL + GAP)}
                  y={TOP + s * (CELL + GAP)}
                >
                  <title>
                    {finding.display} &middot; {source.name} &middot;{" "}
                    {maskMatrix[s][f] === 1 ? "supplied" : "not supplied, masked"}
                  </title>
                </rect>
              ))}
              <text
                className="medico-flat-count"
                x={LEFT + findings.length * (CELL + GAP) + 2}
                y={TOP + s * (CELL + GAP) + CELL * 0.72}
              >
                {coverage[s].covered}
              </text>
            </g>
          ))}
          <text className="medico-flat-axis" x={LEFT} y={height - 22}>
            {findings.length} findings, in the model&rsquo;s output order
          </text>
        </svg>
      </figure>
    </div>
  );
}
