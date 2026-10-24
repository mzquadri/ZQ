import {
  benchmarkNeeds,
  capacity,
  detail,
  detailMagnification,
  featureFamilies,
  generator,
  metrics,
  misreadText,
  models,
  rows,
  split,
} from "@/content/battery-chapter";

import type { BatteryKey } from "./states";

/** The numbers beside the frame. Every one is a property of the generator the repository ships. */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function Readout({ state }: { state: BatteryKey }) {
  if (state === "surface") {
    return (
      <dl className="world-readout">
        <Row label="Curve" value="3.4 + 0.5s + 0.2s² + 0.05 ln s − 0.02 ln(1−s) − 0.0001·cycle" />
        <Row label="Source" value="The generator in src/data_loader.py, noise omitted" />
        <Row label="Models it feeds" value={models.join(", ")} />
      </dl>
    );
  }

  if (state === "cycles" || state === "flat") {
    return (
      <dl className="world-readout">
        <Row label="Cycles" value={String(generator.cycles)} />
        <Row label="Rows" value={rows.toLocaleString("en-GB")} />
        <Row label="Capacity faded by the last cycle" value={`${capacity.fadePercent}%`} tone="warn" />
        <Row label="Voltage the ageing term costs" value={`${misreadText.volts} V`} tone="warn" />
      </dl>
    );
  }

  if (state === "detail") {
    return (
      <dl className="world-readout">
        <Row label="Window" value={`state of charge ${detail.from} to ${detail.to}`} />
        <Row label="Magnified" value={`${detailMagnification} times`} />
        <Row label="Why" value="Drawn to scale the two edges land a few pixels apart" />
      </dl>
    );
  }

  if (state === "misread") {
    return (
      <dl className="world-readout">
        <Row label="Where the cell actually is" value="50%" tone="good" />
        <Row label="What the fresh curve reads back" value={`${misreadText.reads}%`} tone="warn" />
        <Row label="Charge given away" value={`${misreadText.points} points`} tone="warn" />
      </dl>
    );
  }

  if (state === "split") {
    return (
      <dl className="world-readout">
        <Row label="Trained on cycles" value={`${split.trainFrom} to ${split.trainTo}`} />
        <Row label="Held back" value={`${split.testFrom} to ${split.testTo}`} tone="good" />
        <Row label="Shuffled" value="No - two samples a second apart are nearly the same row" />
        <Row label="Features engineered" value={featureFamilies.map((f) => f.label).join("; ")} />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="Reported metrics" value={metrics.join(", ")} />
      <Row label="Published benchmark" value="None" tone="warn" />
      <Row
        label="What one would have to record first"
        value={benchmarkNeeds.join(", ")}
        tone="warn"
      />
    </dl>
  );
}
