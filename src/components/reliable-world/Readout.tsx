"use client";

import {
  actions,
  boundaries,
  disclosure,
  failureModes,
  invariants,
  principles,
  representations,
  scale,
} from "@/content/reliable-knowledge-world";
import type { ReliableKey } from "./states";

/**
 * The explanation, as HTML over the canvas.
 *
 * On this world it carries more weight than on the others. The scene is deliberately abstract -
 * it has to be - so the words are what stop it from being three glowing boxes. Every string comes
 * from the public-safe content module, which was written by hand from a classification pass and
 * contains no employer architecture, technology, identifier or scale.
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

function List({
  items,
  tone,
}: {
  items: readonly { label: string; note: string }[];
  tone?: string;
}) {
  return (
    <ol className="world-readout-list">
      {items.map((item) => (
        <li data-on="" data-tone={tone} key={item.label}>
          <code>{item.label}</code>
          <span>{item.note}</span>
        </li>
      ))}
    </ol>
  );
}

const rep = (key: string) => representations.find((r) => r.key === key);

export default function Readout({ state }: { state: ReliableKey }) {
  switch (state) {
    case "sealed":
      return (
        <Rows
          items={[
            { label: "Model", note: disclosure.short, value: "Synthetic" },
            { label: "Parts", note: "one core, three derived", value: "Four representations" },
            { label: "Answers", note: "which is the only thing visible from outside", value: "Yes or no" },
          ]}
        />
      );

    case "core":
    case "capture": {
      const evidence = rep("evidence");
      return (
        <Rows
          items={[
            { label: "At the centre", note: evidence?.holds, value: evidence?.label ?? "" },
            { label: "Rebuildable", note: "everything around it is", value: "No" },
            { label: "Why it is first", note: "before transforming anything, keep what arrived", value: "Capture" },
          ]}
        />
      );
    }

    case "split":
      return (
        <ol className="world-readout-list">
          {representations.map((representation) => (
            <li
              data-on=""
              data-tone={representation.kind === "immutable" ? "positive" : undefined}
              key={representation.key}
            >
              <code>
                {representation.label}
                {representation.rebuildable ? "" : " · not rebuildable"}
              </code>
              <span>{representation.holds}</span>
            </li>
          ))}
        </ol>
      );

    case "structured":
    case "semantic":
    case "relational": {
      const current = rep(state);
      const counts: Record<string, string> = {
        structured: `${scale.records} records`,
        semantic: `${scale.vectorPoints} points`,
        relational: `${scale.graphNodes} nodes, ${scale.graphEdges} edges`,
      };
      return (
        <Rows
          items={[
            { label: "Holds", value: current?.label ?? "", note: current?.holds },
            { label: "Good for", value: current?.note ?? "" },
            { label: "Drawn here", value: counts[state], note: "chosen to be legible, not to imply a scale" },
          ]}
        />
      );
    }

    case "verify":
      return (
        <>
          <List items={invariants.map((i) => ({ label: i.label, note: i.question }))} />
          <p className="world-note">
            Most diagrams of a system like this point one way. The interesting direction is the
            other one.
          </p>
        </>
      );

    case "mismatch":
      return <List items={failureModes} tone="uncertain" />;

    case "health":
      return (
        <>
          <List
            items={invariants.map((i) => ({ label: i.label, note: i.note }))}
            tone={undefined}
          />
          <p className="world-note">
            A single indicator answers none of these. The output that is worth having names the term
            that failed.
          </p>
        </>
      );

    case "rebuild":
      return (
        <>
          <ol className="world-readout-list">
            {actions.map((action) => (
              <li data-on="" key={action.key}>
                <code>{action.label}</code>
                <span>{action.effect}</span>
              </li>
            ))}
          </ol>
          <p className="world-note">
            Both are things a person presses. Nothing here runs on a timer, because a schedule hides
            the moment a decision was made.
          </p>
        </>
      );

    case "settled":
      return <List items={principles} tone="positive" />;

    default:
      return (
        <>
          <List items={boundaries} tone="uncertain" />
          <p className="world-note">{disclosure.long}</p>
        </>
      );
  }
}
