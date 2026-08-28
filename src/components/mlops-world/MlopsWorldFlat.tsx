import { gate, limits, results, stages } from "@/content/mlops-world";
import { failingIndex } from "./geometry";

/**
 * The gate, drawn once and completely.
 *
 * What a phone gets, what a reader who declined motion gets, and what is in the document before any
 * JavaScript runs. It is the strongest single figure this project has: four checks, each with its
 * threshold and the value the reference run actually achieved, and the one that would refuse a
 * candidate if it fell short.
 *
 * Two scales, because the four checks are not commensurable - three are fractions between 0 and 1,
 * and latency is milliseconds against a 100 ms ceiling. Plotting them on one axis would make the
 * latency bar meaningless. Each row is drawn against its own threshold instead, which is how the
 * code evaluates them anyway: independently, then `all()`.
 */

const W = 460;
const ROW = 44;
const LABEL = 150;
const TRACK = 230;
const BAR = 14;

export default function MlopsWorldFlat() {
  const height = 30 + gate.length * ROW + 30;

  /* Each check is drawn as a fraction of its own threshold, capped so a huge margin stays legible. */
  const fraction = (value: number, threshold: number, comparison: string) =>
    comparison === "<=" ? Math.min(1, value / threshold) : Math.min(1.35, value / threshold);

  return (
    <div className="mlops-flat">
      <figure className="mlops-flat-figure">
        <svg
          aria-label={`The promotion gate: ${gate
            .map((c) => `${c.label} ${c.comparison} ${c.threshold}, measured ${c.value}`)
            .join("; ")}. A candidate that fails any one of the four cannot be registered.`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          viewBox={`0 0 ${W} ${height}`}
        >
          {gate.map((check, i) => {
            const top = 24 + i * ROW;
            const width = fraction(check.value, check.threshold, check.comparison) * TRACK;
            const mark = check.comparison === "<=" ? TRACK : TRACK / 1.35;
            return (
              <g data-failing={i === failingIndex ? "" : undefined} key={check.key}>
                <text className="mlops-flat-name" x={LABEL - 10} y={top + 11}>
                  {check.label}
                </text>
                <rect className="mlops-flat-track" height={BAR} width={TRACK} x={LABEL} y={top} />
                <rect className="mlops-flat-bar" height={BAR} width={width} x={LABEL} y={top} />
                {/* The threshold, as a line the bar has to clear or stay under. */}
                <line
                  className="mlops-flat-threshold"
                  x1={LABEL + mark}
                  x2={LABEL + mark}
                  y1={top - 4}
                  y2={top + BAR + 4}
                />
                <text className="mlops-flat-value" x={LABEL + TRACK + 8} y={top + 11}>
                  {check.value}
                </text>
                <text className="mlops-flat-rule" x={LABEL} y={top + BAR + 13}>
                  {check.comparison} {check.threshold}
                </text>
              </g>
            );
          })}
        </svg>
        <figcaption>
          Four checks, evaluated independently and then combined with <code>all()</code>. A candidate
          that fails any one of them cannot be registered to staging, and production cannot be
          registered directly at all &mdash; it is reachable only by promoting something already in
          staging. Held-out accuracy {results.accuracy} against a majority-class baseline of{" "}
          {results.baselineAccuracy}; the margin between them is the check that carries the meaning.
        </figcaption>
      </figure>

      <ol className="mlops-flat-stages">
        {stages.map((stage) => (
          <li key={stage.key}>
            <strong>{stage.label}</strong>
            <span>{stage.note}</span>
          </li>
        ))}
      </ol>

      <ul className="mlops-flat-limits">
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
