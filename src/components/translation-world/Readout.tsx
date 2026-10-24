import {
  differences,
  missedByTheCount,
  model,
  resolvedCount,
  totalCount,
} from "@/content/translation-chapter";

import type { TranslationKey } from "./states";

/** The numbers beside the frame. The Keras accuracy is absent here because it is absent there. */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function Readout({ state }: { state: TranslationKey }) {
  if (state === "two" || state === "count") {
    return (
      <dl className="world-readout">
        <Row label="Trainable parameters" value={model.parameters.toLocaleString("en-GB")} tone="good" />
        <Row label="Asserted" value="On every push, with no data and no fit" />
        <Row label="Subset" value={`${model.trainImages.toLocaleString("en-GB")} train, ${model.validationImages.toLocaleString("en-GB")} validation`} />
        <Row label="Epochs" value={String(model.epochs)} />
      </dl>
    );
  }

  if (state === "differences" || state === "resolved" || state === "floor") {
    return (
      <dl className="world-readout">
        {differences.map((difference) => (
          <Row
            key={difference.key}
            label={difference.what}
            value={difference.handled}
            tone={difference.resolved ? "good" : "warn"}
          />
        ))}
        <Row label="Closed" value={`${resolvedCount} of ${totalCount}`} />
      </dl>
    );
  }

  if (state === "missed") {
    return (
      <dl className="world-readout">
        <Row label="What the count does not catch" value={missedByTheCount.what} tone="warn" />
        <Row label="Why" value={missedByTheCount.detail} />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="PyTorch test accuracy" value={`${model.pytorchAccuracy}%`} tone="good" />
      <Row label="Keras test accuracy" value="Pending its run - the repository publishes none" tone="warn" />
      <Row label="Test images" value={model.testImages.toLocaleString("en-GB")} />
    </dl>
  );
}
