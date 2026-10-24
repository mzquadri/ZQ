import {
  components,
  distinctSignals,
  duplicated,
  formulas,
  notPublished,
  serviceLevelDefault,
  weightText,
} from "@/content/supply-chain-chapter";

import type { SupplyKey } from "./states";

/** The numbers beside the frame, read from the engine's own default weights. */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function Readout({ state }: { state: SupplyKey }) {
  if (state === "composite") {
    return (
      <dl className="world-readout">
        {components.map((component) => (
          <Row key={component.key} label={component.label} value={`${Math.round(component.weight * 100)}%`} />
        ))}
      </dl>
    );
  }

  if (state === "sources" || state === "converge" || state === "merge") {
    return (
      <dl className="world-readout">
        {duplicated.map((component) => (
          <Row key={component.key} label={component.label} value={component.source} tone="warn" />
        ))}
        <Row
          label="Why they are the same"
          value="Inverting a min-max normalisation of one minus a series returns the series"
          tone="warn"
        />
      </dl>
    );
  }

  if (state === "remaining") {
    return (
      <dl className="world-readout">
        <Row label="One signal, under two names" value={weightText.duplicated} tone="warn" />
        <Row label="Distinct signals" value={`${distinctSignals}, not ${components.length}`} tone="warn" />
        <Row label="Largest independent term" value={weightText.largestIndependent} />
      </dl>
    );
  }

  if (state === "classical") {
    return (
      <dl className="world-readout">
        {formulas.map((formula) => (
          <Row key={formula.key} label={formula.label} value={formula.body} />
        ))}
        <Row label="Default service level" value={`${Math.round(serviceLevelDefault * 100)}%`} />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      {notPublished.map((item) => (
        <Row key={item} label="Not published" value={item} tone="warn" />
      ))}
    </dl>
  );
}
