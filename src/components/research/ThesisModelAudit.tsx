import {
  architecture,
  architectureSource,
  baselines,
  baselinesSource,
  graph,
  trials,
  trialsSource,
  uncertaintyQuality,
} from "@/content/thesis-world";

/**
 * What the surrogate is, and what beats it.
 *
 * Both figures here come out of a second audit of the thesis work, this time against the
 * implementation repository rather than the document one. Neither was on the site before, and the
 * second is the more important: the page previously showed the graph model's scores and the
 * uncertainty work built on them without ever mentioning that a gradient-boosted tree on the same
 * features and the same held-out split scores higher than any graph model in the study.
 *
 * Leaving that out is the kind of omission this portfolio exists to avoid, so it is not a footnote
 * here - it is the taller bar, at the top, with the surrogate below it.
 */

const R2_MAX = 0.8;

export function ThesisArchitecture() {
  return (
    <figure className="chart-figure research-figure">
      <figcaption>
        <strong>Architecture</strong>
        Five features per road segment, twice through a PointNet against each end of the segment,
        then attention over the neighbourhood, and a graph convolution for the single number out.
      </figcaption>

      <ol className="arch-chain" aria-hidden="true">
        {architecture.map((layer, i) => (
          <li className="arch-stage" key={layer.stage + i} data-kind={layer.stage.split(",")[0]}>
            <span className="arch-index">{String(i + 1).padStart(2, "0")}</span>
            <span className="arch-name">{layer.stage}</span>
            <span className="arch-detail">{layer.detail}</span>
            {"note" in layer && layer.note ? <span className="arch-note">{layer.note}</span> : null}
          </li>
        ))}
      </ol>

      <div className="research-table-wrap">
        <table className="research-data-table">
          <caption>
            Layer sizes read from {architectureSource}, not from the write-up
          </caption>
          <thead>
            <tr>
              <th scope="col">Stage</th>
              <th scope="col">Shape</th>
            </tr>
          </thead>
          <tbody>
            {architecture.map((layer, i) => (
              <tr key={layer.stage + i}>
                <th scope="row">{layer.stage}</th>
                <td>{layer.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export function ThesisBaselineComparison() {
  const width = 720;
  const left = 190;
  const barW = (r2: number) => ((width - left - 90) * r2) / R2_MAX;

  return (
    <figure className="chart-figure research-figure">
      <figcaption>
        <strong>Technical question</strong>
        On the same five features and the same held-out scenarios, does the graph surrogate predict
        better than an ordinary tabular model?
      </figcaption>

      <div className="chart-visual" aria-hidden="true">
        <svg viewBox={`0 0 ${width} ${baselines.length * 46 + 54}`}>
          <g className="chart-grid">
            {[0, 0.2, 0.4, 0.6, 0.8].map((tick) => (
              <path
                key={tick}
                d={`M${left + barW(tick)} 16V${baselines.length * 46 + 8}`}
              />
            ))}
          </g>
          {baselines.map((model, i) => (
            <g key={model.name} data-family={model.family}>
              <rect
                className="bar"
                x={left}
                y={i * 46 + 20}
                width={barW(model.r2)}
                height="22"
              />
              <text className="bar-label" x={left - 12} y={i * 46 + 36} textAnchor="end">
                {model.name}
              </text>
              <text className="bar-value" x={left + barW(model.r2) + 10} y={i * 46 + 36}>
                {model.r2.toFixed(4)}
              </text>
            </g>
          ))}
          <g className="chart-labels">
            {[0, 0.2, 0.4, 0.6, 0.8].map((tick) => (
              <text key={tick} x={left + barW(tick)} y={baselines.length * 46 + 28} textAnchor="middle">
                {tick}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <p className="research-note">
        No. A gradient-boosted tree reaches R&sup2; {baselines[0].r2.toFixed(4)} against the best
        graph model&rsquo;s {baselines[1].r2.toFixed(4)}, and trains in about three minutes rather
        than hours. The graph model earns its place a different way: on ranking its own errors, MC
        dropout on the weaker network reaches Spearman {uncertaintyQuality[0].spearman.toFixed(4)}{" "}
        against the ensemble&rsquo;s {uncertaintyQuality[1].spearman.toFixed(4)}, which is what the
        selective-review result is built on. The tree carries no notion of the network at all.
      </p>

      <div className="research-table-wrap">
        <table className="research-data-table">
          <caption>
            All rows: 80/10/10 scenario-level split, seed 42, {graph.scenarios} held-out scenarios,{" "}
            {graph.totalNodes.toLocaleString("en-GB")} test nodes. Source: {baselinesSource}
          </caption>
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">R&sup2;</th>
              <th scope="col">MAE (veh/h)</th>
              <th scope="col">RMSE (veh/h)</th>
            </tr>
          </thead>
          <tbody>
            {baselines.map((model) => (
              <tr key={model.name} data-family={model.family}>
                <th scope="row">{model.name}</th>
                <td>{model.r2.toFixed(4)}</td>
                <td>{model.mae.toFixed(4)}</td>
                <td>{model.rmse.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export function ThesisTrialLog() {
  const scored = trials.filter((t) => !t.excluded);
  const worst = Math.min(...scored.map((t) => t.r2));
  const best = Math.max(...scored.map((t) => t.r2));

  return (
    <figure className="chart-figure research-figure">
      <figcaption>
        <strong>What did not work</strong>
        Eight runs, in order. The two that weight the loss toward the large changes are the clearest
        result in the table, and neither was pursued.
      </figcaption>

      <ol className="trial-log" aria-hidden="true">
        {trials.map((trial) => {
          const height = trial.excluded
            ? 0
            : ((trial.r2 - worst) / Math.max(1e-6, best - worst)) * 100;
          return (
            <li
              key={trial.id}
              data-excluded={trial.excluded ? "" : undefined}
              data-best={trial.r2 === best && !trial.excluded ? "" : undefined}
            >
              <span className="trial-bar" style={{ height: `${Math.max(4, height)}%` }} />
              <span className="trial-id">{trial.id}</span>
              <span className="trial-r2">{trial.excluded ? "—" : trial.r2.toFixed(3)}</span>
            </li>
          );
        })}
      </ol>

      <div className="research-table-wrap">
        <table className="research-data-table">
          <caption>Source: {trialsSource}</caption>
          <thead>
            <tr>
              <th scope="col">Run</th>
              <th scope="col">What changed</th>
              <th scope="col">R&sup2;</th>
              <th scope="col">Split</th>
            </tr>
          </thead>
          <tbody>
            {trials.map((trial) => (
              <tr key={trial.id}>
                <th scope="row">{trial.id}</th>
                <td>
                  {trial.change}
                  {"note" in trial && trial.note ? <em> — {trial.note}</em> : null}
                </td>
                <td>{trial.excluded ? "not comparable" : trial.r2.toFixed(4)}</td>
                <td>{trial.split}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
