"use client";

import {
  dataChecks,
  dataFailurePolicy,
  decisions,
  experiment,
  gate,
  limits,
  results,
  split,
  stack,
  stages,
  tests,
} from "@/content/mlops-world";
import { failingIndex } from "./geometry";
import type { MlopsKey } from "./states";

/**
 * Stage names, thresholds and measured values, as HTML over the canvas.
 *
 * Every number is generated from the repository's own machine-readable sources - the EXPECTED block
 * its CI asserts against a real run, and the config where the thresholds live. Nothing is typed
 * into this component, which is the same discipline the repository applies to its own README.
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

/** The four gate checks with their measured values, and whether each one clears its threshold. */
function GateList({ failing }: { failing?: boolean }) {
  return (
    <ol className="world-readout-list">
      {gate.map((check, i) => {
        const blocked = failing && i === failingIndex;
        return (
          <li data-on="" data-tone={blocked ? "uncertain" : "positive"} key={check.key}>
            <code>
              {check.label} {check.comparison} {check.threshold}
            </code>
            <span>
              {blocked ? "held short of the threshold on this candidate" : `measured ${check.value}`}
              {" · "}
              {check.note}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function Readout({ state }: { state: MlopsKey }) {
  switch (state) {
    case "sealed":
      return (
        <Rows
          items={[
            { label: "Task", note: experiment.model, value: experiment.task },
            { label: "Lifecycle stages", note: "data through serving, in one repository", value: "Nine" },
            { label: "Tests", note: `${tests.offline} offline, ${tests.container} in a container`, value: `${tests.total}` },
          ]}
        />
      );

    case "data":
      return (
        <>
          <ol className="world-readout-list">
            {dataChecks.map((check) => (
              <li data-on="" key={check.label}>
                <code>
                  {check.label} · {check.threshold}
                </code>
                <span>{check.note}</span>
              </li>
            ))}
          </ol>
          <p className="world-note">
            On failure the policy is <code>{dataFailurePolicy}</code>: a degenerate dataset stops the
            run rather than producing a flattering score on it. The dataset itself is downloaded and
            verified against a pinned checksum ({experiment.datasetSha256}…), never redistributed.
          </p>
        </>
      );

    case "training":
      return (
        <Rows
          items={[
            {
              label: "Split",
              note: `stratified, seed ${split.randomState}`,
              value: `${split.train} / ${split.validation} / ${split.test}`,
            },
            { label: "Fitting", note: "everywhere else only transforms", value: "One function" },
            { label: "Licence", note: experiment.datasetKind, value: experiment.licence },
          ]}
        />
      );

    case "artifact":
      return (
        <Rows
          items={[
            { label: "Bundle format", note: "model, transformers, metrics, lineage", value: experiment.bundleFormat },
            { label: "Written", note: "with a checksum manifest", value: "Atomically" },
            { label: "Promotion unit", note: "they move together or not at all", value: "The bundle" },
          ]}
        />
      );

    case "gate":
      return <GateList />;

    case "rejected":
      return (
        <>
          {/*
            The distinction this state has to carry. Every other state on this page reports the
            repository's tracked run; this one holds a condition short on purpose so the refusal
            path is visible at all. Without saying so, an animation of a gate closing reads as a
            deployment that failed, which is not something this repository recorded.
          */}
          <p className="world-note" data-demonstration="">
            Gate logic demonstration &mdash; not a recorded failure. The tracked reference run
            clears all four checks; the margin is held below its threshold here so the refusal path
            can be seen.
          </p>
          <GateList failing />
          <p className="world-note">
            The gate is <code>all()</code> over the four. One short check is enough, and the margin
            over the majority-class baseline is the one that carries the meaning: an accuracy floor
            alone says nothing without the class balance.
          </p>
        </>
      );

    case "rebuilt":
      return (
        <Rows
          items={[
            { label: "Still the demonstration", note: "the reference run never reaches this branch", value: "Staged" },
            { label: "Rejected candidate", note: "no partial credit, no patching", value: "Discarded" },
            { label: "Next candidate", note: "the same checks, from the same data", value: "Built again" },
            { label: "Thresholds come from", note: "never from the split the gate is applied to", value: "Validation" },
          ]}
        />
      );

    case "passed":
      return (
        <>
          <GateList />
          <p className="world-note">
            Held out: accuracy {results.accuracy}, weighted F1 {results.f1Weighted}, ROC-AUC{" "}
            {results.rocAuc}, against a majority-class baseline of {results.baselineAccuracy}. CI
            asserts these against an actual run within ±{results.tolerance}.
          </p>
        </>
      );

    case "staging":
    case "promotion":
      return (
        <ol className="world-readout-list">
          {stages.map((stage) => (
            <li
              data-on=""
              data-tone={stage.key === "production" ? "positive" : undefined}
              key={stage.key}
            >
              <code>{stage.label}</code>
              <span>{stage.note}</span>
            </li>
          ))}
        </ol>
      );

    case "serving":
      return (
        <Rows
          items={[
            { label: "Serves", note: "mounted at run time, so promoting needs no rebuild", value: "One bundle" },
            { label: "Liveness", note: "answers while the process is alive", value: "/health" },
            { label: "Readiness", note: "503 until a model is genuinely usable", value: "/ready" },
          ]}
        />
      );

    case "monitoring":
      return (
        <>
          <ol className="world-readout-list">
            {stack.map((item) => (
              <li data-on="" key={item.name}>
                <code>{item.name}</code>
                <span>{item.note}</span>
              </li>
            ))}
          </ol>
          <p className="world-note">
            Monitoring is a counter endpoint. The repository calls it that rather than a monitoring
            system, which is the distinction most of these projects blur.
          </p>
        </>
      );

    default:
      return (
        <>
          <ol className="world-readout-list">
            {limits.map((limit) => (
              <li data-on="" data-tone="uncertain" key={limit.label}>
                <code>{limit.label}</code>
                <span>{limit.note}</span>
              </li>
            ))}
          </ol>
          <p className="world-note">
            {decisions.length} design decisions carry most of the weight, each written up with its
            alternatives and failure modes in the repository.
          </p>
        </>
      );
  }
}
