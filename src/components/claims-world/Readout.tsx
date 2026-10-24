import {
  breakEvenText,
  calibration,
  cells,
  defaultCut,
  models,
  selectionMethods,
  stages,
} from "@/content/claims-chapter";

import type { ClaimsKey } from "./states";

/** The numbers beside the frame. All four are the repository's; the cut is solved from them. */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

const signed = (n: number) => `${n > 0 ? "+" : ""}${n}`;

export default function Readout({ state }: { state: ClaimsKey }) {
  if (state === "surfaces") {
    return (
      <dl className="world-readout">
        <Row label="Actions" value="Act on the policy, or leave it alone" />
        <Row label="What decides between them" value="The chance it claims, and what each outcome costs" />
        <Row label="Models compared upstream" value={models.join(", ")} />
      </dl>
    );
  }

  if (state === "matrix") {
    return (
      <dl className="world-readout">
        {cells.map((cell) => (
          <Row
            key={cell.key}
            label={cell.label}
            value={signed(cell.value)}
            tone={cell.value > 0 ? "good" : cell.value < 0 ? "warn" : undefined}
          />
        ))}
      </dl>
    );
  }

  if (state === "crossing") {
    return (
      <dl className="world-readout">
        <Row label="The only cut these four numbers justify" value={`${breakEvenText.percent}%`} tone="good" />
        <Row label="Found by" value="Setting the two expectations equal and solving" />
        <Row label="Data involved" value="None" />
      </dl>
    );
  }

  if (state === "habit" || state === "ratio") {
    return (
      <dl className="world-readout">
        <Row label="Where a classifier cuts by default" value={String(defaultCut)} tone="warn" />
        <Row label="Where this matrix cuts" value={`${breakEvenText.percent}%`} tone="good" />
        <Row label="Out by" value={`${breakEvenText.ratio} times`} tone="warn" />
      </dl>
    );
  }

  if (state === "stages") {
    return (
      <dl className="world-readout">
        {stages.map((stage) => (
          <Row key={stage.key} label={stage.label} value={stage.note} />
        ))}
        <Row
          label="Calibrated with"
          value={`${calibration.methods.join(" or ")}, scored on ${calibration.score} over ${calibration.folds} folds`}
        />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="Ways the cut can be chosen" value={selectionMethods.map((m) => m.label).join(", ")} />
      <Row label="Published data, model or evaluation" value="None" tone="warn" />
      <Row
        label="So what this figure is"
        value="Arithmetic on an illustrative matrix, not a measured result"
        tone="warn"
      />
    </dl>
  );
}
