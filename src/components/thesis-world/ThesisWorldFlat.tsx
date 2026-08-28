import { calibration, selective, trial8 } from "@/content/thesis-world";

/**
 * The thesis result, at rest.
 *
 * This is what a phone gets, what a reader who asked for less motion gets, and what is in the
 * document before any JavaScript runs. It is not a placeholder for the 3D scene - it is the same
 * two measured curves the scene spends its whole length arriving at, drawn once and completely.
 *
 * Left: reliability. Nominal coverage against what the held-out data actually delivered, before
 * and after temperature scaling. The distance from the diagonal is the finding.
 *
 * Right: selective risk. Accepted-set error against how much of the network is kept. Both are
 * plotted straight from the published arrays, so the flat figure and the surface cannot disagree.
 */

const W = 340;
const H = 240;
const PAD = 34;

function ReliabilityFigure() {
  const x = (v: number) => PAD + v * (W - PAD * 2);
  const y = (v: number) => H - PAD - v * (H - PAD * 2);
  const path = (values: readonly number[]) =>
    values.map((v, i) => `${i === 0 ? "M" : "L"}${x(calibration.nominal[i]).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  return (
    <figure className="thesis-flat-figure">
      <svg
        aria-label={`Reliability before and after temperature scaling. At a nominal 90 percent interval the raw model covered ${Math.round(
          calibration.before[8] * 100,
        )} percent of held-out values; after calibration it covered ${Math.round(calibration.after[8] * 100)} percent.`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox={`0 0 ${W} ${H}`}
      >
        {/* Perfect calibration: what the model claims is what it delivers. */}
        <path className="thesis-flat-ideal" d={`M${x(0)} ${y(0)} L${x(1)} ${y(1)}`} />
        <path className="thesis-flat-before" d={path(calibration.before)} />
        <path className="thesis-flat-after" d={path(calibration.after)} />
        {calibration.nominal.map((n, i) => (
          <circle className="thesis-flat-dot" cx={x(n)} cy={y(calibration.after[i])} key={n} r={2.6} />
        ))}
        <text className="thesis-flat-axis" x={x(0)} y={H - 12}>
          claimed
        </text>
        <text className="thesis-flat-axis" textAnchor="end" x={x(1)} y={H - 12}>
          1.0
        </text>
      </svg>
      <figcaption>
        Claimed coverage against delivered coverage. Below the line is over-confidence: at a nominal
        90% the raw interval held {(calibration.before[8] * 100).toFixed(1)}% of the truth, and one
        temperature of {calibration.temperature} moved it to {(calibration.after[8] * 100).toFixed(1)}%.
      </figcaption>
    </figure>
  );
}

function SelectiveFigure() {
  const maxMae = selective[selective.length - 1].mae;
  const x = (retention: number) => PAD + (retention / 100) * (W - PAD * 2);
  const y = (mae: number) => H - PAD - (mae / maxMae) * (H - PAD * 2);
  const half = selective.find((s) => s.retention === 50);

  return (
    <figure className="thesis-flat-figure">
      <svg
        aria-label={`Accepted-set error against retention. Keeping the most confident 50 percent of segments lowers mean absolute error from ${maxMae} to ${half?.mae} vehicles per hour.`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox={`0 0 ${W} ${H}`}
      >
        <path
          className="thesis-flat-after"
          d={selective
            .map((s, i) => `${i === 0 ? "M" : "L"}${x(s.retention).toFixed(1)} ${y(s.mae).toFixed(1)}`)
            .join(" ")}
        />
        {half ? (
          <>
            <path className="thesis-flat-ideal" d={`M${x(50)} ${y(0)} L${x(50)} ${y(maxMae)}`} />
            <circle className="thesis-flat-mark" cx={x(50)} cy={y(half.mae)} r={4} />
          </>
        ) : null}
        <text className="thesis-flat-axis" x={x(0)} y={H - 12}>
          keep 0%
        </text>
        <text className="thesis-flat-axis" textAnchor="end" x={x(100)} y={H - 12}>
          keep everything
        </text>
      </svg>
      <figcaption>
        Error of the kept set as more of the network is accepted without review. Keeping the most
        confident half lowers mean absolute error from {maxMae} to {half?.mae} veh/h, a{" "}
        {half?.reductionPct}% reduction. The other half is not solved, it is sent to a person.
      </figcaption>
    </figure>
  );
}

export default function ThesisWorldFlat() {
  return (
    <div className="thesis-flat">
      <ReliabilityFigure />
      <SelectiveFigure />
      <p className="thesis-flat-scope">
        {trial8.method}, {trial8.scope}: {trial8.rows.toLocaleString("en-GB")} held-out node-level
        predictions. Uncertainty ranks error at Spearman &rho; {trial8.spearmanRho}.
      </p>
    </div>
  );
}
