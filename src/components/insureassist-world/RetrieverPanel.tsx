"use client";

import { retrievers } from "@/content/insureassist-world";
import { at } from "./states";

/**
 * The comparison the project turns on, pinned to the viewport.
 *
 * Two paired bars per retriever: how often the right chunk is in the top five, and how often the
 * right form is at rank one. They point in opposite directions for BM25, which is the entire
 * finding - a retriever can be the best at finding relevant text and the worst at identifying
 * which of three near-identical documents it came from. No single number shows that, which is why
 * the selected architecture is the one that is second on the left and joint-first on the right.
 */

const W = 250;
const ROW = 40;
const LEFT = 8;
const TRACK = 150;
const BAR = 11;

export default function RetrieverPanel({ progress }: { progress: number }) {
  const appear = at(progress, "fusion");
  const leave = at(progress, "evidence");
  const shown = Math.min(appear, 1 - leave);
  if (shown <= 0.02) return null;

  const height = 26 + retrievers.length * ROW;

  return (
    <div className="insure-panel" style={{ opacity: shown }}>
      <svg aria-hidden="true" preserveAspectRatio="xMidYMid meet" viewBox={`0 0 ${W} ${height}`}>
        {retrievers.map((retriever, i) => {
          const top = 22 + i * ROW;
          return (
            <g data-selected={retriever.selected ? "" : undefined} key={retriever.key}>
              <text className="insure-panel-name" x={LEFT} y={top - 4}>
                {retriever.label}
                {retriever.selected ? " · selected" : ""}
              </text>
              <rect className="insure-panel-track" height={BAR} width={TRACK} x={LEFT} y={top} />
              <rect
                className="insure-panel-hit"
                height={BAR}
                width={retriever.hitAt5 * TRACK}
                x={LEFT}
                y={top}
              />
              <text className="insure-panel-value" x={LEFT + TRACK + 6} y={top + 9}>
                {retriever.hitAt5}
              </text>
              <rect className="insure-panel-track" height={BAR} width={TRACK} x={LEFT} y={top + BAR + 2} />
              <rect
                className="insure-panel-doc"
                height={BAR}
                width={retriever.topDocument * TRACK}
                x={LEFT}
                y={top + BAR + 2}
              />
              <text className="insure-panel-value" data-doc="" x={LEFT + TRACK + 6} y={top + BAR + 11}>
                {retriever.topDocument}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="insure-panel-key">
        <span>hit@5</span>
        <strong>top-document accuracy</strong>
      </p>
    </div>
  );
}
