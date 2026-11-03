import type { ProjectDiagram } from "@/content/diagrams/types";

import styles from "./ArchDiagram.module.css";
import { NODE_H, NODE_W, layout } from "./geometry";

/**
 * A project's architecture, as one drawing.
 *
 * This is a server component and it renders a complete SVG. There is no canvas, no renderer and
 * no client bundle: the figure a reader gets with JavaScript disabled is the same figure, in the
 * same position, carrying the same words. That is not a fallback - it is the drawing, and the
 * animation is a reading order laid over it.
 *
 * ### Why this is not a world
 *
 * The worlds on this site are each other's opposites on purpose; nineteen of them moving
 * identically would read as one template used nineteen times. An architecture diagram is the
 * exception that proves it. A reader comparing two projects' architectures is comparing the
 * systems, and any difference in how the two are *drawn* is noise in that comparison. So this
 * component owns the geometry, the type scale and the stroke weights, and a diagram file supplies
 * only grid cells and names.
 *
 * ### The animation
 *
 * Entirely CSS, through the classes `motion.css` already defines. Lines draw themselves with
 * `mz-connect`, which animates `stroke-dashoffset` from `--path-length` to zero; boxes arrive
 * with `mz-propagate`. Both ride `.mz-scrub`, so they are bound to scroll position rather than to
 * a clock - scrolling back up runs them backwards, because there is nothing to run backwards, only
 * a position to re-evaluate.
 *
 * Three properties come free from using the site's own machinery rather than a scroll library,
 * and all three are load-bearing:
 *
 *   - `motion.css` wraps those classes in `@supports (animation-timeline: view())`. A browser
 *     without scroll timelines never starts them, and the resting state of every element here is
 *     its finished state, so that browser gets the complete diagram.
 *   - The same file kills `animation-timeline` outright under `prefers-reduced-motion: reduce`.
 *     A reader who has asked for less motion gets the finished diagram, not a degraded one.
 *   - It runs off the main thread, so a page carrying several of these costs nothing to scroll.
 *
 * `pathLength={100}` normalises every path, so one `--path-length: 100` works for a 60px arrow and
 * a 900px return path alike. That is the convention the rest of the site's SVG already uses.
 */

/** Two lines at most. A box that needs three is a box that is doing two jobs. */
function wrap(text: string, max = 30): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
      if (lines.length === 2) break;
    } else {
      line = next;
    }
  }
  if (lines.length < 2 && line) lines.push(line);
  /* Say so rather than cutting mid-word and hoping nobody reads to the end. */
  if (lines.length === 2 && lines.join(" ").length < text.length) {
    lines[1] = `${lines[1].replace(/[,.]$/, "")}…`;
  }
  return lines;
}

export default function ArchDiagram({ diagram }: { diagram: ProjectDiagram }) {
  const { placed, edges, width, height } = layout(diagram);

  /* Scoped, because two diagrams can appear on one page and markers are document-global. */
  const uid = `arch-${diagram.slug}`;
  const captionId = `${uid}-caption`;

  const markerKinds = ["data", "control", "feedback", "refused"] as const;

  return (
    <figure className={styles.figure} style={{ "--diagram-accent": diagram.accent } as React.CSSProperties}>
      {/*
       * Named with aria-label, never a <title> child: React 19 treats <title> as document metadata
       * and hoists it, which is the hydration failure portfolio.spec.ts guards against.
       */}
      <svg
        aria-describedby={captionId}
        aria-label={diagram.title}
        className={styles.svg}
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          {markerKinds.map((kind) => (
            <marker
              id={`${uid}-arrow-${kind}`}
              key={kind}
              markerHeight="7"
              markerWidth="9"
              orient="auto-start-reverse"
              refX="8"
              refY="3.5"
              viewBox="0 0 9 7"
            >
              {/* Refused paths get an open head. The difference between "went here" and "was not
                  allowed to" must survive being printed in black and white. */}
              <path className={styles[`head_${kind}`]} d={kind === "refused" ? "M 0.5 0.5 L 8 3.5 L 0.5 6.5" : "M 0 0 L 9 3.5 L 0 7 Z"} />
            </marker>
          ))}
        </defs>

        <g className={`${styles.edges} mz-stagger`}>
          {edges.map(({ edge, d, label }, i) => {
            const kind = edge.kind ?? "data";
            return (
              <g key={`${edge.from}-${edge.to}-${i}`}>
                <path
                  className={`${styles.edge} ${styles[`edge_${kind}`]} mz-scrub`}
                  d={d}
                  markerEnd={`url(#${uid}-arrow-${kind})`}
                  pathLength={100}
                  style={
                    { "--mz-anim": "mz-connect", "--path-length": "100", "--i": `${i}` } as React.CSSProperties
                  }
                />
                {/*
                 * Deliberately not scrubbed. The shared keyframes move elements by `--lift-md`,
                 * which is a rem length; inside a viewBox that is user units, so a label would
                 * travel twenty units rather than twenty pixels and arrive from off the diagram.
                 * A four-word label does not need a scrub head anyway.
                 */}
                {edge.label ? (
                  <text className={styles.edgeLabel} textAnchor={label.anchor} x={label.x} y={label.y}>
                    {edge.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>

        <g className={`${styles.nodes} mz-stagger`}>
          {placed.map((node, i) => {
            const lines = node.note ? wrap(node.note) : [];
            return (
              <g
                className={`${styles.node} ${styles[`node_${node.kind}`]} mz-scrub`}
                key={node.id}
                style={{ "--mz-anim": "mz-propagate", "--i": `${i}` } as React.CSSProperties}
              >
                <rect height={NODE_H} rx="6" width={NODE_W} x={node.x} y={node.y} />
                <text className={styles.nodeLabel} x={node.x + 14} y={node.y + 26}>
                  {node.label}
                </text>
                {lines.map((line, li) => (
                  <text className={styles.nodeNote} key={li} x={node.x + 14} y={node.y + 46 + li * 13}>
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
      </svg>

      <figcaption className={styles.caption} id={captionId}>
        {diagram.caption}
      </figcaption>

      {/*
       * The figure in words.
       *
       * The label is a paragraph, not a heading. This component lands at different depths on
       * different pages, so any fixed level skips one somewhere and fails heading order.
       *
       * Always rendered, never behind a disclosure. It was a `<details>` for one draft, which was
       * wrong in both directions: on a narrow screen, where the drawing is withdrawn and this list
       * *is* the figure, a closed `<details>` left the reader with a summary and nothing else -
       * and CSS cannot open one, so the breakpoint could not fix it. On a wide screen a key that
       * has to be found is a key that is not read.
       *
       * It is also where the validated tool claims surface. A box in the drawing carries a name
       * and one line; the technologies it uses are checked against the project's own `tools`
       * registry by `validate:content`, and this is where that check becomes visible. It is the
       * only form of the diagram that survives being copied into a plain-text email.
       */}
      <div className={styles.key}>
        <p className={styles.keyHeading}>This diagram in words</p>
        <ol className={styles.keyList}>
          {placed.map((node) => (
            <li key={node.id}>
              <strong>{node.label}</strong> <span className={styles.keyKind}>{node.kind}</span>
              {node.note ? <> — {node.note}</> : null}
              {node.tools?.length ? (
                <div className={styles.keyTools}>{node.tools.join(" · ")}</div>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
