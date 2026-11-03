import { adoption, frames, markets, milestones, sheet } from "@/content/release-chapter";

import type { ReleaseKey } from "./states";

/**
 * The numbers beside the frame.
 *
 * Every line is from the public case-study repository. There is no field name, no value, no part,
 * no supplier and no department here, because that repository publishes none of them - and the
 * last state says what the report does not record rather than filling the gap with an impact.
 */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function Readout({ state }: { state: ReleaseKey }) {
  if (state === "sheet" || state === "scale") {
    return (
      <dl className="world-readout">
        <Row label="Rows" value={`about ${sheet.rows}`} />
        <Row label="Columns" value={`about ${sheet.columns}`} />
        <Row label="Both approximate because" value="the case study publishes them that way" />
      </dl>
    );
  }

  if (state === "subject" || state === "migrate" || state === "frames") {
    return (
      <dl className="world-readout">
        {frames.map((frame) => (
          <Row key={frame.key} label="Frame" value={frame.label} />
        ))}
        <Row label="Fields dropped" value="None - they are regrouped, not reduced" tone="good" />
      </dl>
    );
  }

  if (state === "milestones") {
    return (
      <dl className="world-readout">
        <Row label="Milestone codes carried" value={milestones.join(", ")} />
        <Row label="Each one" value="carries its own comment" />
        <Row label="Markets" value={String(markets)} />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="What the report says" value={adoption.reportWording} />
      <Row label="Departments counted" value="Not recorded" tone="warn" />
      <Row label="Time saved" value="Not recorded" tone="warn" />
      <Row label="Error rate" value="Not recorded" tone="warn" />
    </dl>
  );
}
