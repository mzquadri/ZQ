import { researchEvidence } from "@/content/portfolio";

export function ThesisPipeline() {
  const stages = [
    ["01", "Simulation", "MATSim policy scenarios"],
    ["02", "Surrogate", "PointNet + Transformer + GAT"],
    ["03", "Uncertainty", "MC Dropout / ensemble / CQR"],
    ["04", "Decision", "Calibrate, retain, or review"],
  ] as const;

  return (
    <figure className="pipeline-figure">
      <figcaption>Research system, from simulation to confidence-aware review</figcaption>
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
  const [low, middle, full] = researchEvidence.selectiveRisk.points;

  return (
    <figure className="chart-figure">
      <figcaption>
        Selective prediction: accepted-set MAE falls as uncertain predictions are routed to review
      </figcaption>
      <svg
        viewBox="0 0 720 320"
        role="img"
        aria-labelledby="risk-title risk-description"
      >
        <title id="risk-title">Accepted prediction fraction compared with mean absolute error</title>
        <desc id="risk-description">
          Mean absolute error is about {low.mae} vehicles per hour at {low.retentionPct} percent
          retention, {middle.mae} at {middle.retentionPct} percent retention, and {full.mae} when
          every prediction is accepted.
        </desc>
        <g className="chart-grid" aria-hidden="true">
          <path d="M78 44V262H680" />
          <path d="M78 207H680M78 152H680M78 98H680M78 44H680" />
        </g>
        <g className="chart-labels" aria-hidden="true">
          <text x="66" y="266">0</text>
          <text x="52" y="211">1</text>
          <text x="52" y="156">2</text>
          <text x="52" y="102">3</text>
          <text x="52" y="48">4</text>
          <text x="76" y="287">10%</text>
          <text x="330" y="287">50%</text>
          <text x="646" y="287">100%</text>
          <text x="287" y="313">Predictions accepted</text>
          <text transform="translate(17 216) rotate(-90)">MAE (veh/h)</text>
        </g>
        <path
          className="chart-line"
          d="M82 204 C160 191 245 169 350 137 C470 100 570 69 674 47"
          aria-hidden="true"
        />
        <g className="chart-points" aria-hidden="true">
          <circle cx="82" cy="204" r="7" />
          <circle cx="350" cy="137" r="7" />
          <circle cx="674" cy="47" r="7" />
          <text x="96" y="197">{low.mae.toFixed(2)}</text>
          <text x="364" y="130">{middle.mae.toFixed(2)}</text>
          <text x="610" y="39">{full.mae.toFixed(2)}</text>
        </g>
      </svg>
      <p className="figure-note">
        {researchEvidence.selectiveRisk.source}. Retention is a review-capacity choice, not
        proof that rejected predictions are incorrect.
      </p>
    </figure>
  );
}

export function ConfidenceProtocol() {
  return (
    <div className="confidence-protocol" aria-label="Evidence to decision protocol">
      <div>
        <span>01</span>
        <strong>Predict</strong>
        <small>Estimate policy response</small>
      </div>
      <div>
        <span>02</span>
        <strong>Measure</strong>
        <small>Quantify model uncertainty</small>
      </div>
      <div>
        <span>03</span>
        <strong>Calibrate</strong>
        <small>Test coverage and ranking</small>
      </div>
      <div className="protocol-accent">
        <span>04</span>
        <strong>Decide</strong>
        <small>Accept, review, or abstain</small>
      </div>
    </div>
  );
}
