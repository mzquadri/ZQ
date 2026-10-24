import { bypass, configurations, controls, limits, stages, verdict } from "@/content/gateway-world";
import { COUNTS, OVERLAP } from "./geometry";

import type { GatewayKey } from "./states";

/**
 * The numbers beside the frame.
 *
 * The scene carries shape - depth, who wrote what, what got through - and deliberately carries no
 * type at all. Everything quantitative lives here, in the DOM, where it is selectable, readable by
 * a screen reader and legible at any zoom. A WebGL caption would be none of those.
 *
 * Every figure is read from `@/content/gateway-world`, which reads them from files the repository
 * generates and commits rather than from its own prose.
 */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

const percent = (share: number) => `${(share * 100).toFixed(1)}%`;

export default function Readout({ state }: { state: GatewayKey }) {
  if (state === "boundary" || state === "authors" || state === "scannable") {
    const scannableCount = stages.filter((stage) => stage.scannable).length;
    return (
      <dl className="world-readout">
        <Row label="Moments" value={String(stages.length)} />
        <Row label="Scannable ahead" value={`${scannableCount} of ${stages.length}`} tone="warn" />
      </dl>
    );
  }

  if (state === "traffic") {
    return (
      <dl className="world-readout">
        <Row label="Cases" value={String(verdict.cases)} />
        <Row label="Attacks" value={`${verdict.attacks} across ${verdict.attackClasses} classes`} />
        <Row label="Benign" value={String(verdict.benign)} tone="good" />
      </dl>
    );
  }

  if (state === "controls" || state === "depth") {
    const total = controls.reduce((t, control) => t + control.caught, 0);
    return (
      <dl className="world-readout">
        <Row label="Controls" value={String(verdict.controls)} />
        <Row label="Catches recorded" value={`${total} over ${verdict.attacks} attacks`} />
        <Row label="Caught more than once" value={String(OVERLAP)} tone="good" />
      </dl>
    );
  }

  if (state === "compare" || state === "refused") {
    return (
      <dl className="world-readout">
        {configurations.map((configuration) => (
          <Row
            key={configuration.key}
            label={configuration.label}
            value={`${percent(configuration.caught)} caught, ${percent(configuration.falseBlock)} wrongly blocked`}
            tone={configuration.key === "gateway" ? "good" : undefined}
          />
        ))}
      </dl>
    );
  }

  if (state === "cost") {
    return (
      <dl className="world-readout">
        {configurations.map((configuration) => (
          <Row
            key={configuration.key}
            label={configuration.label}
            value={`${configuration.micros} microseconds`}
            tone={configuration.key === "gateway" ? "good" : undefined}
          />
        ))}
      </dl>
    );
  }

  if (state === "bypass") {
    return (
      <dl className="world-readout">
        <Row label="Found by" value={bypass.found} tone="warn" />
        <Row label="What" value={bypass.what} />
        <Row label="Fixed by" value={bypass.fix} tone="good" />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="Caught" value={`${COUNTS.caught} of ${verdict.attacks}`} />
      <Row label="Missed" value={String(COUNTS.missed)} tone="warn" />
      <Row label="Stated limits" value={String(limits.length)} tone="warn" />
    </dl>
  );
}
