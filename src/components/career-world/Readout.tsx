import {
  adapterCount,
  employerCount,
  languagePenalties,
  overridden,
  probe,
  rejections,
  text,
  weights,
  weightTotal,
} from "@/content/career-chapter";

import type { CareerKey } from "./states";

/**
 * The numbers beside the frame.
 *
 * Read from the engine's defaults and the shipped example profile, so the bars and these rows are
 * the same configuration rather than two accounts of it.
 */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function Readout({ state }: { state: CareerKey }) {
  if (state === "weights" || state === "ceilings") {
    return (
      <dl className="world-readout">
        <Row label="Components" value={`${weights.length}, totalling ${weightTotal}`} />
        <Row label="Largest" value={`${weights[0].label} ${weights[0].weight}`} />
        <Row label="Smallest" value={`${weights[weights.length - 1].label} ${weights[weights.length - 1].weight}`} />
      </dl>
    );
  }

  if (state === "penalties" || state === "through") {
    return (
      <dl className="world-readout">
        {overridden.map((component) => (
          <Row
            key={component.key}
            label={component.label}
            value={`term ${component.weight}, penalty ${component.penalty} - ${component.penaltyFor}`}
            tone="warn"
          />
        ))}
        <Row label="Penalties over their own term" value={`${overridden.length} of ${weights.length}`} tone="warn" />
      </dl>
    );
  }

  if (state === "ladder") {
    return (
      <dl className="world-readout">
        {languagePenalties.map((step, i) => (
          <Row
            key={step.key}
            label={step.label}
            value={`${step.points} points`}
            tone={i === languagePenalties.length - 1 ? "warn" : undefined}
          />
        ))}
      </dl>
    );
  }

  if (state === "rejects") {
    return (
      <dl className="world-readout">
        {rejections.map((rejection) => (
          <Row key={rejection.key} label={rejection.label} value={rejection.detail} />
        ))}
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="Adapters" value={String(adapterCount)} />
      <Row label="Employers reached" value={String(employerCount)} tone="good" />
      <Row
        label="Probed away"
        value={`${probe.missing} of ${probe.candidates}, ${text.probeShare}`}
        tone="warn"
      />
    </dl>
  );
}
