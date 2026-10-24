import {
  activations,
  comparison,
  diagnostics,
  figure,
  references,
  seminar,
  symmetries,
} from "@/content/identifiability-chapter";

import type { IdentKey } from "./states";

/** The numbers beside the frame. All of them describe the code, because that is all there is. */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function Readout({ state }: { state: IdentKey }) {
  if (state === "network" || state === "second") {
    return (
      <dl className="world-readout">
        <Row label="Hidden units" value={String(figure.hidden)} />
        <Row label="Activations the prototype builds with" value={activations.join(", ")} />
        <Row label="Trained" value="No - both networks are constructed" />
      </dl>
    );
  }

  if (state === "permute" || state === "sign") {
    return (
      <dl className="world-readout">
        {symmetries.map((symmetry) => (
          <Row key={symmetry.key} label={symmetry.label} value="applied" tone="good" />
        ))}
        <Row label="Relabelling used in the figure" value={figure.permutation.join(" → ")} />
        <Row
          label="Units flipped"
          value={String(figure.flipped.filter(Boolean).length)}
          tone="warn"
        />
      </dl>
    );
  }

  if (state === "agree" || state === "unrelated") {
    return (
      <dl className="world-readout">
        {comparison.map((row) => (
          <Row
            key={row.key}
            label={row.label}
            value={row.agrees ? "agrees on sampled inputs" : "does not"}
            tone={row.agrees ? "good" : "warn"}
          />
        ))}
        <Row label="Also checked" value="That the parameters align under the same relabelling" />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="Diagnostics" value={diagnostics.join("; ")} />
      <Row label="What it does not establish" value="Identifiability for any trained model or activation family" tone="warn" />
      <Row label="Where the conditions live" value={references.map((r) => `${r.author} ${r.year}`).join(", ")} />
      <Row label="Seminar" value={`${seminar.subject}, ${seminar.institution}`} />
    </dl>
  );
}
