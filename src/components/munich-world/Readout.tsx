import {
  blockMonths,
  bootstrapDraws,
  dataset,
  marginShareLost,
  marginSurvives,
  seriesTotal,
  testMonths,
  testRows,
  windows,
} from "@/content/munich-chapter";

import type { MunichKey } from "./states";

/** The numbers beside the frame, read out of the repository's pinned run artefacts. */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

const [published, ordinary] = windows;
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export default function Readout({ state }: { state: MunichKey }) {
  if (state === "window" || state === "interval") {
    return (
      <dl className="world-readout">
        <Row label="Test window" value={published.testYears} />
        <Row label="Scaled MAE" value={`${published.scaledMae} against ${published.naiveScaledMae} naive`} />
        <Row label="Margin" value={pct(published.margin)} tone="good" />
        <Row
          label="Moving-block interval"
          value={`${published.low.toFixed(3)} to ${published.high.toFixed(3)}`}
          tone="good"
        />
        <Row label="Draws" value={`${bootstrapDraws.toLocaleString("en-GB")}, ${blockMonths}-month blocks`} />
      </dl>
    );
  }

  if (state === "series") {
    return (
      <dl className="world-readout">
        <Row label="Series beaten" value={`${published.seriesWon} of ${seriesTotal}`} tone="good" />
        <Row label="Held-out months" value={String(testMonths)} />
        <Row label="Rows scored" value={String(testRows)} />
        <Row label="Trend window" value={`${published.trendWindowYears} years`} />
      </dl>
    );
  }

  if (state === "ordinary" || state === "crosses" || state === "count") {
    return (
      <dl className="world-readout">
        <Row label="Test window" value={ordinary.testYears} />
        <Row label="Scaled MAE" value={`${ordinary.scaledMae} against ${ordinary.naiveScaledMae} naive`} tone="warn" />
        <Row label="Margin" value={pct(ordinary.margin)} tone="warn" />
        <Row
          label="Moving-block interval"
          value={`${ordinary.low.toFixed(3)} to ${ordinary.high.toFixed(3)}`}
          tone="warn"
        />
        <Row label="Series beaten" value={`${ordinary.seriesWon} of ${seriesTotal}`} tone="warn" />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row
        label="Does the published margin survive"
        value={marginSurvives ? "Yes" : "No"}
        tone={marginSurvives ? "good" : "warn"}
      />
      <Row label="Share of it the ordinary window costs" value={`${(marginShareLost * 100).toFixed(0)}%`} tone="warn" />
      <Row
        label="Observations"
        value={`${dataset.monthlyObservations.toLocaleString("en-GB")} monthly, ${dataset.firstYear} to ${dataset.lastYear}`}
      />
      <Row label="Source" value={dataset.source} />
    </dl>
  );
}
