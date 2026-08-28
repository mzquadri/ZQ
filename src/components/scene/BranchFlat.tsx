/**
 * The flat branching figure.
 *
 * Lifted out of the old WebGL wrapper so the projected canvas can use exactly the same drawing as
 * its resting state. This is the complete figure: one capture, three derived forms, and a check
 * returning from each form to the capture. Synthetic throughout - it names no system.
 */

const BOX = { width: 640, height: 360 } as const;
const FORMS = [
  { x: 150, label: "records" },
  { x: 320, label: "vectors" },
  { x: 490, label: "graph" },
] as const;

export default function BranchFlat() {
  return (
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
  );
}
