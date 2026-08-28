import {
  calibration,
  event,
  inputExperiment,
  limits,
  outputExperiment,
  project,
  ratingCurve,
  sensitivity,
  verdict,
} from "@/content/hydrology-world";

/**
 * The comparison, drawn once and completely.
 *
 * What a phone gets, what a reader who declined motion gets, and what is in the document before
 * any JavaScript runs. The two panels are on one shared discharge scale on purpose - that is the
 * whole finding, and putting them on separate axes would destroy it. The precipitation band is
 * not missing from the left panel; it is there, at its true width, and its true width is a hair.
 */

const W = 480;
const H = 150;
const PAD = { left: 34, right: 10, top: 12, bottom: 22 };

const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

/* One scale for both panels, taken from the widest thing either has to show. */
const Q_MAX = Math.max(...event.map((p) => p[4]));

const px = (t: number) => PAD.left + t * INNER_W;
const py = (q: number) => PAD.top + INNER_H - (q / Q_MAX) * INNER_H;

/** The stage band: the fitted curve evaluated 25 cm either side, exactly as the repository does. */
const stageBand = [
  ...event.map((p) => `${px(p[0])},${py(p[4])}`),
  ...[...event].reverse().map((p) => `${px(p[0])},${py(p[3])}`),
].join(" ");

/**
 * The precipitation band, at the ratio the repository measured between the two mean objective
 * losses. It is 356 times narrower than the band beside it, and drawing it any wider would be the
 * one lie this figure could tell.
 */
const RAIN_RATIO = inputExperiment.meanLoss / outputExperiment.meanLoss;
const rainBand = [
  ...event.map((p) => `${px(p[0])},${py(p[2] + (p[4] - p[2]) * RAIN_RATIO)}`),
  ...[...event]
    .reverse()
    .map((p) => `${px(p[0])},${py(p[2] - (p[2] - p[3]) * RAIN_RATIO)}`),
].join(" ");

const line = event.map((p) => `${px(p[0])},${py(p[2])}`).join(" ");

function Panel({
  band,
  caption,
  label,
  tone,
}: {
  band: string;
  caption: string;
  label: string;
  tone: "rain" | "stage";
}) {
  return (
    <figure className="hydrology-flat-panel" data-tone={tone}>
      <svg
        aria-label={caption}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox={`0 0 ${W} ${H}`}
      >
        <line
          className="hydrology-flat-axis"
          x1={PAD.left}
          x2={PAD.left}
          y1={PAD.top}
          y2={PAD.top + INNER_H}
        />
        <line
          className="hydrology-flat-axis"
          x1={PAD.left}
          x2={W - PAD.right}
          y1={PAD.top + INNER_H}
          y2={PAD.top + INNER_H}
        />
        <polygon className="hydrology-flat-band" points={band} />
        <polyline className="hydrology-flat-line" points={line} />
        <text className="hydrology-flat-axis-label" x={2} y={PAD.top + 8}>
          Q
        </text>
        <text
          className="hydrology-flat-axis-label"
          x={W - PAD.right}
          y={H - 6}
          textAnchor="end"
        >
          time
        </text>
      </svg>
      <figcaption>
        <strong>{label}</strong>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}

export default function HydrologyWorldFlat() {
  return (
    <div className="hydrology-flat">
      <div className="hydrology-flat-pair">
        <Panel
          band={rainBand}
          caption={`${inputExperiment.series.toLocaleString("en-GB")} precipitation series. NSE ${calibration.referenceNse} becomes ${inputExperiment.nseMean}; ${inputExperiment.betterByChance} of them came out better than the reference by chance.`}
          label="Perturb the rain"
          tone="rain"
        />
        <Panel
          band={stageBand}
          caption={`${outputExperiment.series.toLocaleString("en-GB")} series from moving the measured water level ±25 cm. NSE ${calibration.referenceNse} becomes ${outputExperiment.nseMean}; ${outputExperiment.betterByChance} of them beat the reference.`}
          label="Perturb the ruler"
          tone="stage"
        />
      </div>

      <p className="hydrology-flat-note">
        Both panels are on the same discharge scale, and both bands are drawn at their measured
        widths. Moving the water level costs <strong>{verdict.lossRatio}×</strong> more than moving
        the rainfall, because discharge is never measured directly — it is inferred from stage
        through a fitted curve whose local exponent rises from {verdict.exponentAtBase} to{" "}
        {verdict.exponentAtPeak} as the river rises, so one fixed gauge error buys{" "}
        {verdict.bandRatio}× more error at the flood peak than at baseflow. Refitting the model
        to each corrupted series recovers {outputExperiment.compensationPct}% of the loss and still
        never beats the reference: you cannot calibrate your way out of an error in the thing you
        are calibrating against.
      </p>

      <p className="hydrology-flat-method">
        The chain behind those two panels: {project.model}, a {project.modelKind.toLowerCase()}{" "}
        model with {project.parameters} parameters, calibrated by{" "}
        <strong>{calibration.method}</strong> over {calibration.generations} generations and{" "}
        {calibration.evaluations.toLocaleString("en-GB")} model evaluations; then sensitivity
        analysis, locally around that optimum and globally with{" "}
        <strong>Sobol</strong> indices under Saltelli sampling; then the two perturbation studies
        above. The two Sobol configurations disagree about which parameter dominates —{" "}
        {sensitivity.narrow.top} sampled narrowly against {sensitivity.full.top} sampled across the
        full space — and their total indices sum to {sensitivity.full.sumTotal} rather than 1,
        so most of the variance sits in interactions rather than in any single parameter.
      </p>

      <dl className="hydrology-flat-figures">
        <div>
          <dt>Calibrated baseline</dt>
          <dd>NSE {calibration.referenceNse}</dd>
        </div>
        <div>
          <dt>After precipitation noise</dt>
          <dd>NSE {inputExperiment.nseMean}</dd>
        </div>
        <div>
          <dt>After rating-curve error</dt>
          <dd>NSE {outputExperiment.nseMean}</dd>
        </div>
        <div>
          <dt>Rating curve fit</dt>
          <dd>R² {ratingCurve.r2}</dd>
        </div>
      </dl>

      <ul className="hydrology-flat-limits">
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
