"use client";

import dynamic from "next/dynamic";

import Stage3D from "@/components/scene/Stage3D";

/**
 * The public engineering figure.
 *
 * Flat first: one capture at the top, three derived forms beneath it, and a check returning from
 * each form to the capture. That drawing is the whole idea and is what a reader sees on a phone,
 * without WebGL, or with reduced motion. The spatial version adds only that the three forms are
 * siblings at the same remove from the source rather than three stages of a pipeline.
 *
 * Synthetic throughout. Nothing here names a system, and the section states so in text beneath it.
 */

const RepresentationBranchScene = dynamic(() => import("./RepresentationBranchScene"), {
  ssr: false,
  loading: () => null,
});

const BOX = { width: 640, height: 360 } as const;
const FORMS = [
  { x: 150, label: "records" },
  { x: 320, label: "vectors" },
  { x: 490, label: "graph" },
] as const;

export default function RepresentationBranchCanvas() {
  return (
    <Stage3D
      className="branch-stage"
      label="One captured source at the top, three derived forms beneath it - ordered records, positions in a space, and a graph of relationships - with a check returning from each form to the source it must agree with."
      fallback={
        <svg
          className="scene-svg branch-flat"
          role="presentation"
          viewBox={`0 0 ${BOX.width} ${BOX.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <rect className="branch-source" height={54} rx={3} width={92} x={274} y={26} />
          {FORMS.map((form) => (
            <g key={form.label}>
              <path className="branch-link" d={`M320 80 C320 150, ${form.x} 150, ${form.x} 214`} />
              <path
                className="branch-return"
                d={`M${form.x + 26} 214 C${form.x + 26} 150, 346 150, 346 80`}
              />
              <rect className="branch-form" height={92} rx={3} width={104} x={form.x - 52} y={214} />
            </g>
          ))}
        </svg>
      }
    >
      {({ active, progress, onDegrade }) => (
        <div className="branch-canvas">
          <RepresentationBranchScene active={active} onDegrade={onDegrade} progress={progress} />
        </div>
      )}
    </Stage3D>
  );
}
