import { axis, coverage, euCarShare, rail, source, spread } from "@/content/modal-split-chapter";

import { RATIO } from "./geometry";
import type { ModalKey } from "./states";

/** The numbers beside the frame, every one computed by the report from its pinned response. */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function Readout({ state }: { state: ModalKey }) {
  if (state === "axis") {
    return (
      <dl className="world-readout">
        <Row label="Axis" value={`${axis.min} to ${axis.max} per cent`} />
        <Row label="Why not zero" value="Every observed value is above 60; a zero baseline hides the comparison" />
        <Row label="Countries reporting" value={String(coverage.countries)} />
      </dl>
    );
  }

  if (state === "eu" || state === "moved") {
    return (
      <dl className="world-readout">
        <Row label={`EU car share, ${euCarShare.fromYear}`} value={`${euCarShare.from}%`} />
        <Row label={`EU car share, ${euCarShare.toYear}`} value={`${euCarShare.to}%`} />
        <Row label={`Change over ${euCarShare.years} years`} value={`${euCarShare.changePoints} points`} tone="warn" />
      </dl>
    );
  }

  if (state === "spread" || state === "germany") {
    return (
      <dl className="world-readout">
        <Row label={spread.highest.country} value={`${spread.highest.share}%`} />
        <Row label={spread.lowest.country} value={`${spread.lowest.share}%`} />
        <Row label={`Spread in ${coverage.comparisonYear}`} value={`${spread.points} points`} tone="warn" />
        <Row
          label="Germany"
          value={`${spread.germany.share}%, ${spread.germany.rank}th of ${spread.germany.of}`}
          tone="good"
        />
        <Row label="Place against time" value={`${RATIO} to one`} tone="warn" />
      </dl>
    );
  }

  if (state === "rail") {
    return (
      <dl className="world-readout">
        <Row label="Countries where rail gained" value={`${rail.gainedIn} of ${rail.of}`} tone="good" />
        <Row label="Largest shift" value={`${rail.largest.country}, ${rail.largest.points} points`} />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="Dataset" value={`${source.publisher} ${source.dataset}`} />
      <Row label="Retrieved" value={source.retrievedAt} />
      <Row label="SHA-256" value={`${source.sha256.slice(0, 16)}…`} />
      <Row
        label="Comparison year chosen by"
        value={`the most recent year holding 90% of peak coverage, which is ${coverage.comparisonYear}`}
      />
    </dl>
  );
}
