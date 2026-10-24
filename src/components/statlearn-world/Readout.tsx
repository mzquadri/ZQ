import {
  baseline,
  correctOf,
  gradientChecks,
  ledger,
  runs,
  searchMarginPoints,
  testPoints,
  text,
} from "@/content/statlearn-chapter";

import type { StatlearnKey } from "./states";

/**
 * The numbers beside the frame.
 *
 * Counts out of sixty rather than percentages, which is the unit the held-out set actually has.
 */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

const byKey = (key: string) => runs.find((run) => run.key === key);

export default function Readout({ state }: { state: StatlearnKey }) {
  if (state === "points") {
    return (
      <dl className="world-readout">
        <Row label="Held out" value={`${testPoints} points`} />
        <Row label="Finest distinction" value="One point" />
      </dl>
    );
  }

  if (state === "baseline" || state === "default") {
    const def = byKey("default");
    return (
      <dl className="world-readout">
        <Row label="Guessing the majority class" value={`${correctOf(baseline)} of ${testPoints}`} />
        {def ? (
          <Row label={def.label} value={`${correctOf(def)} of ${testPoints}`} tone="warn" />
        ) : null}
        <Row label="Below doing nothing by" value={text.belowBaseline} tone="warn" />
      </dl>
    );
  }

  if (state === "sweep") {
    const sweep = byKey("sweep");
    return (
      <dl className="world-readout">
        {sweep ? <Row label={sweep.label} value={`${correctOf(sweep)} of ${testPoints}`} tone="good" /> : null}
        <Row label="Learning rate changed by" value={`${text.lrFactor} times`} />
      </dl>
    );
  }

  if (state === "margin") {
    const bayes = byKey("bayes");
    const random = byKey("random");
    return (
      <dl className="world-readout">
        {bayes ? <Row label={bayes.label} value={`${correctOf(bayes)} of ${testPoints}`} /> : null}
        {random ? <Row label={random.label} value={`${correctOf(random)} of ${testPoints}`} tone="good" /> : null}
        <Row label="Margin" value={`${searchMarginPoints} test point`} tone="warn" />
      </dl>
    );
  }

  if (state === "checks") {
    return (
      <dl className="world-readout">
        {gradientChecks.map((check) => (
          <Row key={check.key} label={check.label} value={`${check.value.toExponential(1)} ${check.kind}`} />
        ))}
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="Reported values" value={String(ledger.values)} tone="good" />
      <Row label="Problems covered" value={String(ledger.problems)} />
      <Row label="Transcribed by hand" value="None" tone="good" />
    </dl>
  );
}
