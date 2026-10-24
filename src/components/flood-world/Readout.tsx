import {
  bias,
  events,
  gapOverCalendar,
  generator,
  generatorDefect,
  model,
  scores,
  split,
} from "@/content/flood-chapter";

import type { FloodKey } from "./states";

/** The numbers beside the frame, read out of the repository's pinned reference run. */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

const pct = (share: number) => `${(share * 100).toFixed(2)}%`;

export default function Readout({ state }: { state: FloodKey }) {
  if (state === "generated") {
    return (
      <dl className="world-readout">
        <Row label="Days" value={generator.days.toLocaleString("en-GB")} />
        <Row label="Seasonal share of variance" value={pct(generator.seasonalShare)} />
        <Row label="Rain share" value={pct(generator.rainShare)} />
        <Row label="Unpredictable noise" value={pct(generator.noiseShare)} tone="warn" />
      </dl>
    );
  }

  if (state === "ceiling") {
    return (
      <dl className="world-readout">
        <Row label="Best score available" value={String(scores.ceiling)} tone="good" />
        <Row label="Why" value="The noise term is independent day to day" />
        <Row label="Seed" value={String(generator.seed)} />
      </dl>
    );
  }

  if (state === "network") {
    return (
      <dl className="world-readout">
        <Row label="Architecture" value={model.architecture} />
        <Row label="Parameters" value={model.parameters.toLocaleString("en-GB")} />
        <Row label="Input window" value={`${model.window} days`} />
        <Row label="NSE" value={String(scores.lstm)} tone="good" />
        <Row label="Split" value={`${split.strategy}, ${split.scoredRows} rows scored`} />
      </dl>
    );
  }

  if (state === "calendar" || state === "gap") {
    return (
      <dl className="world-readout">
        <Row label="Calendar-day table" value={String(scores.calendar)} />
        <Row label="Yesterday's value" value={String(scores.persistence)} />
        <Row label="Linear regression" value={String(scores.linear)} />
        <Row label="What the network buys over the table" value={String(gapOverCalendar)} tone="warn" />
      </dl>
    );
  }

  if (state === "events") {
    return (
      <dl className="world-readout">
        <Row label={`Days above ${events.thresholdM3s}`} value={String(events.total)} />
        <Row
          label="Network, on those days"
          value={`precision ${events.lstm.precision}, recall ${events.lstm.recall}`}
        />
        <Row
          label="Yesterday's value, on those days"
          value={`F1 ${events.persistence.f1} against ${events.lstm.f1}`}
          tone="warn"
        />
        <Row label="Bias below the threshold" value={`${bias.belowThreshold} m³/s`} />
        <Row label="Bias above it" value={`${bias.aboveThreshold} m³/s`} tone="warn" />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="Gauge" value="None - the catchment is generated" tone="warn" />
      <Row
        label="A defect found and fixed first"
        value={`the floor held ${pct(generatorDefect.floorFractionBefore)} of days, now ${pct(generatorDefect.floorFractionAfter)}`}
      />
      <Row
        label="Which changed the rain share"
        value={`${pct(generatorDefect.rainShareBefore)} to ${pct(generatorDefect.rainShareAfter)}`}
      />
    </dl>
  );
}
