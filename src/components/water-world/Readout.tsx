import {
  closestGap,
  commonBand,
  commonBandText,
  dataset,
  results,
  separated,
  separatedGap,
  widestSd,
  withInterval,
  withoutInterval,
} from "@/content/water-chapter";

import type { WaterKey } from "./states";

/** The numbers beside the frame, computed from the committed results file. */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function Readout({ state }: { state: WaterKey }) {
  if (state === "ranked") {
    return (
      <dl className="world-readout">
        {results.map((model) => (
          <Row key={model.name} label={model.name} value={`F1 ${model.f1}`} />
        ))}
      </dl>
    );
  }

  if (state === "crossval" || state === "intervals") {
    return (
      <dl className="world-readout">
        {withInterval.map((model) => (
          <Row
            key={model.name}
            label={model.name}
            value={`${model.cvMean.toFixed(4)} ± ${model.cvSd.toFixed(4)}`}
          />
        ))}
        {withoutInterval.map((model) => (
          <Row key={model.name} label={model.name} value="no interval recorded" tone="warn" />
        ))}
      </dl>
    );
  }

  if (state === "band" || state === "through") {
    return (
      <dl className="world-readout">
        <Row
          label="Consistent with all three"
          value={`F1 between ${commonBandText.from} and ${commonBandText.to}`}
          tone="warn"
        />
        <Row label="Models it covers" value={String(commonBand.models)} tone="warn" />
        <Row label="Folds" value={String(dataset.folds)} />
      </dl>
    );
  }

  if (state === "separated") {
    return (
      <dl className="world-readout">
        <Row label="The one it separates" value={separated.name} tone="good" />
        <Row label="Clear of the next by" value={separatedGap.toFixed(4)} tone="good" />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="Closest gap being ranked on" value={closestGap.toFixed(4)} />
      <Row label="Widest fold-to-fold spread" value={`${widestSd.cvSd.toFixed(4)} (${widestSd.name})`} tone="warn" />
      <Row label="Which is larger" value="The spread" tone="warn" />
    </dl>
  );
}
