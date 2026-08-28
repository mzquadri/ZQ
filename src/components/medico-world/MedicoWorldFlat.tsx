import { findings, limits, sources } from "@/content/medico-world";
import { coverage, maskMatrix } from "./geometry";

/**
 * The label-coverage matrix, drawn once and completely.
 *
 * This is what a phone gets, what a reader who declined motion gets, and what is in the document
 * before any JavaScript runs - and it is the single most useful picture of this project, not a
 * consolation prize for the 3D scene. Three corpora down the side, fourteen findings across, and a
 * filled cell wherever a source can actually speak to a finding.
 *
 * The gaps are the point. CheXpert covers seven of the fourteen; the pneumonia set covers one.
 * Everything unfilled is masked out of the loss rather than treated as a negative, because "this
 * corpus never mentions emphysema" and "this chest has no emphysema" are not the same statement.
 */

const CELL = 20;
const GAP = 3;
const LEFT = 132;
const TOP = 16;

export default function MedicoWorldFlat() {
  const width = LEFT + findings.length * (CELL + GAP) + 8;
  const height = TOP + sources.length * (CELL + GAP) + 46;

  return (
    <div className="medico-flat">
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
                    {finding.display} · {source.name} ·{" "}
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
            {findings.length} findings, left to right in the model&rsquo;s output order
          </text>
        </svg>
        <figcaption>
          A filled cell is a finding the source actually labels. CheXpert supplies{" "}
          {coverage[0].covered} of {findings.length}; the pneumonia set supplies{" "}
          {coverage[2].covered}. Everything unfilled is masked out of the loss, because a corpus
          saying nothing about a finding is not the same as a chest not having it.
        </figcaption>
      </figure>

      <ul className="medico-flat-limits">
        {limits.map((limit) => (
          <li key={limit.label}>
            <strong>{limit.label}</strong>
            <span>{limit.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
