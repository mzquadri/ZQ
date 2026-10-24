import { detector, drift, rescored, runs, seasonal, seasonalFix } from "@/content/drift-chapter";

import type { DriftKey } from "./states";

/**
 * The numbers beside the frame, each read out of an artefact the repository exports.
 *
 * Where prose and artefact disagree the artefact wins, which is that project's own source
 * hierarchy - and the last state names the two figures left out because no artefact holds them.
 */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function Readout({ state }: { state: DriftKey }) {
  if (state === "baseline" || state === "retrain" || state === "refused") {
    return (
      <dl className="world-readout">
        {runs.map((run) => (
          <Row
            key={run.key}
            label={run.label}
            value={`MAE ${run.mae} — ${run.promoted ? "promoted" : "refused"}`}
            tone={run.promoted ? "good" : "warn"}
          />
        ))}
        <Row label="Why the third is refused" value={runs[2].reason} tone="warn" />
        <Row
          label="Champion re-scored on the new window"
          value={String(rescored.championOnNewWindow)}
        />
      </dl>
    );
  }

  if (state === "measured") {
    return (
      <dl className="world-readout">
        <Row label="Target distance" value={String(drift.target)} tone="warn" />
        <Row label="Its threshold" value={String(drift.targetThreshold)} />
        <Row
          label="Feature columns that crossed"
          value={`${Math.round(drift.featureShare * drift.featureColumns)} of ${drift.featureColumns} — ${drift.movedColumn}`}
        />
      </dl>
    );
  }

  if (state === "detector") {
    return (
      <dl className="world-readout">
        <Row label="Detector" value={`${detector.name}, delta ${detector.delta}`} />
        <Row
          label="Alarms on the control window"
          value={`${detector.controlAlarms} over ${detector.controlRows.toLocaleString("en-GB")} rows`}
          tone="good"
        />
        <Row label="First alarm" value={`row ${detector.firstAlarmRow.toLocaleString("en-GB")}`} />
        <Row label="Chosen" value="On the control window alone, without looking at 2012" tone="good" />
      </dl>
    );
  }

  if (state === "seasonal") {
    return (
      <dl className="world-readout">
        {seasonal.map((entry) => (
          <Row
            key={entry.rows}
            label={`${entry.rows} rows — ${entry.days} days, ${entry.months}`}
            value={entry.before === entry.after ? entry.after : `${entry.before} → ${entry.after}`}
            tone={entry.before === entry.after ? undefined : "good"}
          />
        ))}
        <Row
          label="The false alarm it removed"
          value={`day ${seasonalFix.falseAlarmAtDay}; the real signal moved from day ${seasonalFix.realSignalWasDay} to day ${seasonalFix.realSignalNowDay}`}
          tone="good"
        />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row
        label="Mean hourly ridership, and the rise derived from it"
        value="In prose and a config comment; no script computes them"
        tone="warn"
      />
      <Row
        label="The registry version the champion alias ends on"
        value="The step table and the exported registry disagree, so neither is published"
        tone="warn"
      />
      <Row label="Rule" value="Where prose and artefact disagree, the artefact wins" />
    </dl>
  );
}
