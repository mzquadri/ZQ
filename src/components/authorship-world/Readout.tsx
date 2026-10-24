import { classes, counted, notClaimed, sharePercent } from "@/content/authorship-chapter";

import type { AuthorshipKey } from "./states";

/**
 * The numbers beside the frame.
 *
 * The scene carries shape and nothing else - no text at all - so every quantity lives here, in the
 * DOM, selectable and legible at any zoom. The components stay unnamed for the same reason they
 * are unnamed in the scene: their names are internal service names, and the subject is the shape
 * of the distribution rather than which service is which.
 */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function Readout({ state }: { state: AuthorshipKey }) {
  if (state === "volumes" || state === "share") {
    return (
      <dl className="world-readout">
        {counted
          .filter((component) => component.mine > 0)
          .map((component) => (
            <Row
              key={component.name}
              label={component.name}
              value={`${component.mine} of ${component.total}, ${Math.round(sharePercent(component))}%`}
            />
          ))}
      </dl>
    );
  }

  if (state === "zero") {
    const zero = counted.find((component) => component.mine === 0);
    return (
      <dl className="world-readout">
        <Row label="The fifth" value={zero ? `${zero.mine} of ${zero.total}` : "none"} tone="warn" />
        <Row label="Why it is here" value="A component listed as somebody else's" />
      </dl>
    );
  }

  if (state === "classes" || state === "judged") {
    return (
      <dl className="world-readout">
        {classes.map((entry, i) => (
          <Row key={entry.key} label={`${i + 1}. ${entry.label}`} value={entry.detail} />
        ))}
      </dl>
    );
  }

  if (state === "refused") {
    return (
      <dl className="world-readout">
        {notClaimed.map((claim) => (
          <Row key={claim.key} label={claim.label} value={claim.detail} tone="warn" />
        ))}
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="Components measured" value={String(counted.length)} />
      <Row label="Named" value="None; the names are internal" tone="warn" />
      <Row label="What a count is" value="Evidence of weight, not of authorship" />
    </dl>
  );
}
