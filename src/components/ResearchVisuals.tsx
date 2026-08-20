import { researchEvidence } from "@/content/research";

export function ThesisPipeline() {
  const stages = [
    ["01", "Simulate", "Capacity-reduction policy scenarios"],
    ["02", "Represent", "One graph node per road link"],
    ["03", "Approximate", "PointNet + TransformerConv + GAT"],
    ["04", "Quantify", "Dropout, ensembles, and intervals"],
    ["05", "Decide", "Calibrate, retain, or route to review"],
  ] as const;

  return (
    <figure className="pipeline-figure research-figure">
      <figcaption>
        <strong>Technical question</strong>
        How does an expensive transport simulation become a confidence-aware review decision?
      </figcaption>
      <ol>
        {stages.map(([index, title, detail]) => (
          <li key={index}>
            <span>{index}</span>
            <strong>{title}</strong>
            <small>{detail}</small>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function ResearchMethodMatrix() {
  return (
    <figure className="method-matrix research-figure">
      <figcaption>
        <strong>Technical question</strong>
        Which reliability question does each method answer?
      </figcaption>
      <div className="method-matrix-grid">
        {researchEvidence.methods.map((method, index) => (
          <article key={method.name}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{method.name}</h3>
            <p className="method-question">{method.question}</p>
            <dl>
              <div><dt>Mechanism</dt><dd>{method.mechanism}</dd></div>
              <div><dt>Finding</dt><dd>{method.finding}</dd></div>
              <div><dt>Status</dt><dd>{method.status}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      <p className="figure-note">
        Accuracy, ranking, spread, calibration, and coverage are different properties. A stronger
        score in one column does not establish the others.
      </p>
    </figure>
  );
}

export function CalibrationComparison() {
  const scaleMax = 0.4;

  return (
    <figure className="calibration-figure research-figure">
      <figcaption>
        <strong>Technical question</strong>
        Did uncertainty scaling reduce expected calibration error under each named protocol?
      </figcaption>
      <div className="calibration-grid">
        {researchEvidence.calibrationProtocols.map((protocol) => {
          const prefix = protocol.approximate ? "≈" : "";
          return (
            <article key={protocol.id}>
              <p className="calibration-label">{protocol.label}</p>
              <h3>{protocol.split}</h3>
              <div className="calibration-bars" aria-hidden="true">
                <div><span style={{ width: `${(protocol.beforeEce / scaleMax) * 100}%` }} /></div>
                <div><span style={{ width: `${(protocol.afterEce / scaleMax) * 100}%` }} /></div>
              </div>
              <dl>
                <div><dt>Before ECE</dt><dd>{prefix}{protocol.beforeEce.toFixed(3)}</dd></div>
                <div><dt>After ECE</dt><dd>{prefix}{protocol.afterEce.toFixed(3)}</dd></div>
                <div><dt>Scale</dt><dd>{prefix}{protocol.temperature.toFixed(3)}</dd></div>
              </dl>
              <p>{protocol.evidence}.</p>
            </article>
          );
        })}
      </div>
      <p className="figure-note">
        ECE is expected calibration error; lower is better. These protocols use different units
        and splits, so their values are shown as separate records rather than one combined trend.
      </p>
    </figure>
  );
}

export function MarginalCoverageFigure() {
  return (
    <figure className="coverage-figure research-figure">
      <figcaption>
        <strong>Technical question</strong>
        Did split conformal intervals reach their nominal marginal coverage on the evaluated split?
      </figcaption>
      <div className="coverage-grid">
        {researchEvidence.marginalCoverage.map((item) => (
          <article key={item.nominalPct}>
            <span>Nominal {item.nominalPct}%</span>
            <strong>{item.observedPct.toFixed(2)}%</strong>
            <p>Observed empirical marginal coverage</p>
          </article>
        ))}
      </div>
      <p className="figure-note">
        Submission-era reported result from a 50/50 scenario split. Marginal coverage does not
        guarantee the same coverage for every scenario, road link, uncertainty stratum, or city.
      </p>
    </figure>
  );
}

export function MlopsPipeline() {
  const stages = [
    ["01", "Validate", "Check, fingerprint, and version input data"],
    ["02", "Transform", "Fit features once for training and serving"],
    ["03", "Evaluate", "Track runs and apply the promotion gate"],
    ["04", "Register", "Package an immutable model bundle"],
    ["05", "Serve", "Load the approved bundle behind FastAPI"],
  ] as const;

  return (
    <figure className="system-flow">
      <figcaption>Reference lifecycle, with an explicit contract between each stage</figcaption>
      <ol>
        {stages.map(([index, title, detail]) => (
          <li key={index}>
            <span>{index}</span>
            <strong>{title}</strong>
            <small>{detail}</small>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function SelectiveRiskChart() {
  const points = researchEvidence.selectiveRisk.points;
  const x = (retention: number) => 82 + ((retention - 10) / 90) * 592;
  const y = (mae: number) => 262 - (mae / 4.1) * 194;

  return (
    <figure className="chart-figure research-figure">
      <figcaption>
        <strong>Technical question</strong>
        How does accepted-set error change at six audited review-capacity choices?
      </figcaption>
      <div className="chart-visual" aria-hidden="true">
        <svg viewBox="0 0 720 320">
          <g className="chart-grid">
            <path d="M78 44V262H680" />
            <path d="M78 215H680M78 168H680M78 120H680M78 73H680" />
          </g>
          <g className="chart-labels">
            <text x="66" y="266">0</text>
            <text x="52" y="219">1</text>
            <text x="52" y="172">2</text>
            <text x="52" y="124">3</text>
            <text x="52" y="77">4</text>
            {points.map((point) => (
              <text x={x(point.retentionPct)} y="287" textAnchor="middle" key={point.retentionPct}>
                {point.retentionPct}%
              </text>
            ))}
            <text x="286" y="313">Predictions retained</text>
            <text transform="translate(17 216) rotate(-90)">Accepted-set MAE (veh/h)</text>
          </g>
          <g className="chart-points">
            {points.map((point) => (
              <g data-retention={point.retentionPct} key={point.retentionPct}>
                <circle cx={x(point.retentionPct)} cy={y(point.mae)} r="7" />
                <text x={x(point.retentionPct)} y={y(point.mae) - 15} textAnchor="middle">
                  {point.mae.toFixed(2)}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
      <div className="research-table-wrap">
        <table className="research-data-table">
          <caption>Six selected audited operating points; values are observed, not interpolated</caption>
          <thead><tr><th scope="col">Retained</th><th scope="col">Accepted-set MAE</th><th scope="col">Review queue</th></tr></thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.retentionPct}>
                <th scope="row">{point.retentionPct}%</th>
                <td>{point.mae.toFixed(2)} veh/h</td>
                <td>{point.review.toLocaleString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="figure-note">
        {researchEvidence.selectiveRisk.boundary} Rows outside the retained set enter a review
        queue; the analysis does not label them wrong or unsafe.
      </p>
    </figure>
  );
}

export function ConfidenceProtocol() {
  const stages = [
    ["01", "Predict", "Estimate policy response"],
    ["02", "Measure", "Quantify model uncertainty"],
    ["03", "Calibrate", "Test coverage and ranking"],
    ["04", "Decide", "Retain or route to review"],
  ] as const;

  return (
    <ol className="confidence-protocol" aria-label="Evidence to decision protocol">
      {stages.map(([index, title, detail], position) => (
        <li className={position === stages.length - 1 ? "protocol-accent" : undefined} key={index}>
          <span>{index}</span>
          <strong>{title}</strong>
          <small>{detail}</small>
        </li>
      ))}
    </ol>
  );
}
