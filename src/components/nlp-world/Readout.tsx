import {
  exclusivePercent,
  outcomes,
  splits,
  task,
  templateCount,
  text,
  tracks,
  vocabulary,
} from "@/content/nlp-chapter";

import type { NlpKey } from "./states";

/**
 * The numbers beside the frame.
 *
 * Counted from the fixture's own template list in the content module rather than asserted, so a
 * changed fixture changes these rows and the columns in the scene together.
 */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function Readout({ state }: { state: NlpKey }) {
  if (state === "request" || state === "closed" || state === "gated") {
    return (
      <dl className="world-readout">
        {outcomes.map((outcome) => (
          <Row
            key={outcome.key}
            label={outcome.label}
            value={outcome.detail}
            tone={outcome.kind === "stop" ? "warn" : outcome.kind === "go" ? "good" : undefined}
          />
        ))}
      </dl>
    );
  }

  if (state === "fixture" || state === "exclusive" || state === "separable") {
    return (
      <dl className="world-readout">
        {vocabulary.map((entry) => (
          <Row
            key={entry.label}
            label={entry.label}
            value={`${entry.exclusive} of ${entry.words} words exclusive, ${Math.round(exclusivePercent(entry))}%`}
            tone="warn"
          />
        ))}
        <Row label="Across the fixture" value={`${text.exclusiveShare} of ${templateCount} sentences' vocabulary`} tone="warn" />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      {tracks.map((track) => (
        <Row key={track.key} label={track.label} value={track.detail} />
      ))}
      <Row label="Classes" value={task.classes.join(", ")} />
      <Row label="Split discipline" value={`${splits.length} rules`} tone="good" />
    </dl>
  );
}
