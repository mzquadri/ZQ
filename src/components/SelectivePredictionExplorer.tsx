"use client";

import { useState } from "react";
import { researchEvidence } from "@/content/research";

const points = researchEvidence.selectiveRisk.points;

export default function SelectivePredictionExplorer() {
  const [selectedRetention, setSelectedRetention] = useState(50);
  const selected = points.find((point) => point.retentionPct === selectedRetention) ?? points[2];

  return (
    <figure className="selective-explorer research-figure">
      <figcaption>
        <strong>A useful model should know when not to be trusted.</strong>
        Step through six audited review-capacity choices. Every displayed result is an observed
        aggregate value; the control does not interpolate between points.
      </figcaption>

      <fieldset>
        <legend>Predictions retained</legend>
        <div className="retention-options">
          {points.map((point) => (
            <label key={point.retentionPct}>
              <input
                checked={selected.retentionPct === point.retentionPct}
                name="retention"
                onChange={() => setSelectedRetention(point.retentionPct)}
                type="radio"
                value={point.retentionPct}
              />
              <span>{point.retentionPct}%</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="selective-output" aria-live="polite" role="status">
        <div className="decision-bar" aria-label={`${selected.retentionPct}% retained and ${100 - selected.retentionPct}% routed to review`}>
          <span className="decision-accepted" style={{ width: `${selected.retentionPct}%` }}>
            Retained
          </span>
          <span className="decision-review">Review queue</span>
        </div>
        <dl>
          <div><dt>Retained</dt><dd>{selected.retentionPct}%</dd></div>
          <div><dt>Accepted-set MAE</dt><dd>{selected.mae.toFixed(2)} veh/h</dd></div>
          <div><dt>Lower than full retention</dt><dd>{selected.reductionPct.toFixed(1)}%</dd></div>
          <div><dt>Review queue</dt><dd>{selected.review.toLocaleString("en-US")}</dd></div>
        </dl>
      </div>

      <div className="research-table-wrap">
        <table className="research-data-table selective-table">
          <caption>All six observed operating points</caption>
          <thead>
            <tr><th scope="col">Retained</th><th scope="col">Retained rows</th><th scope="col">Review queue</th><th scope="col">MAE</th></tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr data-selected={point.retentionPct === selected.retentionPct || undefined} key={point.retentionPct}>
                <th scope="row">{point.retentionPct}%</th>
                <td>{point.accepted.toLocaleString("en-US")}</td>
                <td>{point.review.toLocaleString("en-US")}</td>
                <td>{point.mae.toFixed(2)} veh/h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="figure-note">
        Retrospective Trial 8 MC Dropout triage on the cached 100-graph archive. No random-review
        baseline is shown, and the operating points do not transfer automatically to a new model,
        network, intervention, or data distribution.
      </p>
    </figure>
  );
}
