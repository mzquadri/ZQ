"use client";

import { calibration, features, graph, layers, selective, target, trial8 } from "@/content/thesis-world";
import { scale } from "./geometry";
import type { StateKey } from "./states";

/**
 * What the frame is showing, in words and numbers.
 *
 * The scene carries shape; this carries quantity. Keeping them apart is deliberate. Text drawn
 * inside a WebGL canvas cannot be selected, cannot be read by a screen reader, does not respond to
 * the reader's font size, and costs a whole text-rendering library to draw badly - so every number
 * here is ordinary HTML sitting over the canvas, and every one of them is read from the published
 * aggregate bundle rather than typed in.
 *
 * It is also the answer to "granular": a reader who wants the five feature names, the four layers,
 * or the measured coverage at a nominal ninety percent gets them here, at the moment the scene is
 * showing that part, without a paragraph having to interrupt the sequence.
 */

const HALF = selective.find((s) => s.retention === 50);
const NOMINAL_90 = calibration.nominal.indexOf(0.9);

function Row({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="thesis-readout-row">
      <dt>{label}</dt>
      <dd>
        <strong>{value}</strong>
        {note ? <span>{note}</span> : null}
      </dd>
    </div>
  );
}

export default function Readout({ state, progress }: { state: StateKey; progress: number }) {
  switch (state) {
    case "network":
    case "scenario":
      return (
        <dl className="thesis-readout">
          <Row
            label="Road segments per scenario"
            note={`${scale.scenarioEdges.toLocaleString("en-GB")} edges`}
            value={scale.scenarioNodes.toLocaleString("en-GB")}
          />
          <Row
            label="Held-out scenarios"
            note={`${trial8.rows.toLocaleString("en-GB")} node-level predictions`}
            value={`${graph.scenarios}`}
          />
          <Row
            label="Drawn here"
            note="schematic; the corpus is not redistributable"
            value={`${scale.drawnNodes} segments`}
          />
        </dl>
      );

    case "features":
      /* Each name lights as its plane arrives, so the legend and the stack stay in step. */
      return (
        <ol className="thesis-readout-list">
          {features.map((feature, i) => {
            const arrived = progress > 0.21 + (i / features.length) * 0.11;
            return (
              <li data-on={arrived ? "" : undefined} key={feature.name}>
                <code>{feature.name}</code>
                <span>{feature.meaning}</span>
              </li>
            );
          })}
        </ol>
      );

    case "model":
      return (
        <ol className="thesis-readout-list">
          {layers.map((layer) => (
            <li data-on="" key={layer.name}>
              <code>{layer.name}</code>
              <span>{layer.note}</span>
            </li>
          ))}
        </ol>
      );

    case "prediction":
      return (
        <dl className="thesis-readout">
          <Row label="Median change" note={`of ${target.unit}`} value={`${target.median}`} />
          <Row
            label="Exactly zero"
            note={`${target.exactZeros.toLocaleString("en-GB")} of ${trial8.rows.toLocaleString("en-GB")}`}
            value={`${(target.zeroFraction * 100).toFixed(2)}%`}
          />
          <Row label="Skewness" note="the tail runs negative" value={`${target.skewness}`} />
        </dl>
      );

    case "uncertainty":
      return (
        <dl className="thesis-readout">
          <Row label="Method" value={trial8.method} />
          <Row
            label="Claimed 90%, delivered"
            note="the raw interval is far too narrow"
            value={`${(trial8.rawCoverage90 * 100).toFixed(1)}%`}
          />
          <Row label="Uncertainty ranks error" note="Spearman rho" value={`${trial8.spearmanRho}`} />
        </dl>
      );

    case "calibration":
      return (
        <dl className="thesis-readout">
          <Row label="Temperature" note={calibration.protocol} value={`${calibration.temperature}`} />
          <Row
            label="Calibration error"
            note={`${calibration.improvementPct}% lower`}
            value={`${calibration.eceBefore} to ${calibration.eceAfter}`}
          />
          <Row
            label="Claimed 90%, delivered"
            note="better, and still not ninety"
            value={`${(calibration.after[NOMINAL_90] * 100).toFixed(1)}%`}
          />
        </dl>
      );

    case "selective":
      return (
        <dl className="thesis-readout">
          <Row
            label="Kept without review"
            note={`${HALF?.accepted.toLocaleString("en-GB")} segments`}
            value="50%"
          />
          <Row
            label="Error of the kept half"
            note={`down from ${trial8.mae} ${target.unit}`}
            value={`${HALF?.mae} ${target.unit}`}
          />
          <Row label="Reduction" note="not solved - routed to a person" value={`${HALF?.reductionPct}%`} />
        </dl>
      );

    default:
      return (
        <dl className="thesis-readout">
          <Row label="Network" value="One city, one corpus" />
          <Row label="Intervention" value="One family: capacity reduction" />
          <Row label="Model" value="One family: PointNetTransfGAT" />
        </dl>
      );
  }
}
