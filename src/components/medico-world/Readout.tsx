"use client";

import { config, evaluation, findings, labelStates, limits, lossTerms, preprocessing, sources } from "@/content/medico-world";
import { coverage } from "./geometry";
import type { MedicoKey } from "./states";

/**
 * The names and numbers, as HTML over the canvas.
 *
 * Fourteen finding names are the substance of this project, and a name drawn inside a WebGL canvas
 * cannot be selected, searched, resized or read aloud. Everything textual therefore lives here,
 * and everything here is parsed from the training script rather than typed.
 */

function Rows({ items }: { items: { label: string; value: string; note?: string }[] }) {
  return (
    <dl className="world-readout">
      {items.map((item) => (
        <div className="world-readout-row" key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            <strong>{item.value}</strong>
            {item.note ? <span>{item.note}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function Readout({ state }: { state: MedicoKey }) {
  switch (state) {
    case "radiograph":
      return (
        <Rows
          items={[
            { label: "Input", value: `${config.imageSize} x ${config.imageSize}`, note: "single channel, grayscale" },
            { label: "Image shown", value: "Synthetic", note: "no patient data is used or published" },
            { label: "Findings predicted", value: `${findings.length}`, note: "independent, multi-label" },
          ]}
        />
      );

    case "preprocess":
      return (
        <ol className="world-readout-list">
          {preprocessing.map((step) => (
            <li data-on="" key={step.step}>
              <code>{step.step}</code>
              <span>{step.note}</span>
            </li>
          ))}
        </ol>
      );

    case "sources":
      return (
        <ol className="world-readout-list">
          {sources.map((source, i) => (
            <li data-on="" key={source.key}>
              <code>
                {source.name} · {coverage[i].covered}/{findings.length}
              </code>
              <span>
                {source.approxImages} images · {source.split}
              </span>
            </li>
          ))}
        </ol>
      );

    case "labels":
      /* The fourteen, named, and which row is which - the scene draws rows, not row titles. */
      return (
        <>
          <ol className="world-readout-list">
            {sources.map((source, i) => (
              <li data-on="" key={source.key}>
                <code>
                  {source.name} · {coverage[i].covered} of {findings.length}
                </code>
              </li>
            ))}
          </ol>
          <ul className="world-chips">
            {findings.map((finding) => (
              <li key={finding.name}>{finding.display}</li>
            ))}
          </ul>
        </>
      );

    case "mask":
      return (
        <ol className="world-readout-list">
          {labelStates.map((s) => (
            <li data-on="" data-tone={s.key} key={s.key}>
              <code>{s.label}</code>
              <span>{s.note}</span>
            </li>
          ))}
        </ol>
      );

    case "network":
      return (
        <Rows
          items={[
            { label: "Backbone", value: "DenseNet-121", note: "torchvision, ImageNet initialised" },
            { label: "Dense blocks", value: "6 · 12 · 24 · 16", note: "a transition between each" },
            { label: "First convolution", value: "3 channels to 1", note: "RGB weights averaged for grayscale" },
          ]}
        />
      );

    case "reuse":
      return (
        <Rows
          items={[
            { label: "Inside a block", value: "Every layer sees all before it", note: "concatenated, not summed" },
            { label: "Widest block", value: "24 layers", note: "denseblock3" },
            { label: "Pooled features", value: "1024", note: "adaptive average pool" },
          ]}
        />
      );

    case "head":
      return (
        <Rows
          items={[
            { label: "Head", value: "1024 to 512 to 14", note: `dropout ${config.dropout}` },
            { label: "Outputs", value: `${findings.length} logits`, note: "one per finding, independent" },
            { label: "Values shown", value: "None", note: "no trained weights exist in the repository" },
          ]}
        />
      );

    case "loss":
      return (
        <>
          <p className="world-formula">
            {lossTerms.map((term, i) => (
              <span data-mask={i === lossTerms.length - 1 ? "" : undefined} key={term.term}>
                {term.term}
                {i < lossTerms.length - 1 ? <em>&times;</em> : null}
              </span>
            ))}
          </p>
          <Rows
            items={[
              { label: "Alpha", value: `${config.focalAlpha}`, note: "positives weighted 3:1" },
              { label: "Gamma", value: `${config.focalGamma}`, note: "easy examples down-weighted" },
              { label: "Smoothing", value: `${config.labelSmoothing}`, note: "for noisy medical labels" },
            ]}
          />
        </>
      );

    case "evaluation":
      return (
        <Rows
          items={[
            { label: "Metric", value: evaluation.metric, note: "certain labels only" },
            { label: "Checkpoint chosen on", value: "Worst class", note: `not the mean; ${evaluation.excluded} excluded as rare` },
            { label: "Published results", value: "None", note: "the pipeline exists; its output is not published" },
          ]}
        />
      );

    default:
      return (
        <ol className="world-readout-list">
          {limits.map((limit) => (
            <li data-on="" data-tone="uncertain" key={limit.label}>
              <code>{limit.label}</code>
              <span>{limit.note}</span>
            </li>
          ))}
        </ol>
      );
  }
}
