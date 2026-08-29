import type { DrawFn } from "@/components/scene/CanvasStage";
import { box, ease, mix, paint, project, ramp, rgba, type Camera, type Face } from "@/components/scene/projector";

/**
 * The projected scenes, as draw functions.
 *
 * Four figures that need depth but not a GPU. Each is a few dozen flat faces and some lines,
 * which is exactly what the projector is for - and keeping them here, as pure functions of
 * (context, progress), means each one is a single readable thing rather than a component tree.
 *
 * They share a camera philosophy deliberately: a long lens, a low three-quarter angle that
 * settles as the scene resolves, and yaw held well away from zero so depth actually maps to
 * screen width. What differs between them is geometry, never style - a reader should be able to
 * tell the projects apart from the shapes alone.
 */

function token(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** The shared camera move: a small swing, settling lower as the scene resolves. */
function settle(base: Camera, progress: number, width: number): Camera {
  return {
    ...base,
    yaw: base.yaw + progress * 0.3,
    pitch: mix(0.34, 0.14, ease(ramp(progress, 0.1, 0.75))),
    focal: (base.focal * Math.min(width, 1600)) / 1100,
  };
}

/*
 * MLOps deliberately has no projected scene.
 *
 * One was built - gates as planes receding into depth, with the artifact held at the evaluation
 * gate - and then removed after looking at it. The pipeline's host is a wide, short box sitting
 * directly behind its stage labels, so the gate planes cropped against the top edge and crossed
 * the text. The existing DOM figure, a rail of numbered gates with the artifact travelling along
 * it, says the same thing more clearly in that space. Depth was not worth the clarity.
 */

/* ============================================================================================
 * Current engineering - one capture, three derived forms
 *
 * The Canvas version of the branching figure. Same geometry and the same argument as the WebGL
 * one it replaces: a capture above, three forms beneath it arranged to match what each form is
 * for, and a check returning from each to the capture. Synthetic throughout - it names nothing.
 * ========================================================================================== */

const FORMS = [-2.4, 0, 2.4];
const PER_FORM = 16;

export const drawBranch: DrawFn = (context, { progress, width, height, camera: base }) => {
  const accent = token("--accent-systems", "#8fd05a");
  const ink = token("--stage-ink", "#f2f0e8");
  const dim = token("--stage-ink-soft", "#9aa7b2");
  const cam = settle(base, progress, width);

  const ingest = ease(ramp(progress, 0.04, 0.24));
  const branch = ramp(progress, 0.22, 0.62);
  const verify = ease(ramp(progress, 0.6, 0.86));

  const faces: Face[] = [];

  /* The capture: one object, held still, that everything below is derived from. */
  faces.push(
    ...box(
      { x: 0, y: 1.45, z: 0 },
      { x: 0.9 * ingest, y: 1.2 * ingest, z: 0.12 },
      rgba(ink, 0.92),
      rgba(ink, 0.6),
    ),
  );

  for (let f = 0; f < FORMS.length; f += 1) {
    for (let u = 0; u < PER_FORM; u += 1) {
      const index = f * PER_FORM + u;
      const t = ease(Math.max(0, Math.min(1, branch * FORMS.length * PER_FORM - index * 0.7)));
      if (t <= 0) continue;

      /* Each form arranges its units the way that form is actually organised. */
      let target = { x: FORMS[f], y: -0.9, z: 0 };
      if (f === 0) {
        // Records: an ordered grid. Structure is the point.
        target = { x: FORMS[f] + ((u % 4) - 1.5) * 0.3, y: -1.35 + Math.floor(u / 4) * 0.3, z: 0 };
      } else if (f === 1) {
        // Vectors: positions in a volume. Placement carries meaning.
        const a = Math.sin(u * 12.9898) * 43758.5453;
        const c = Math.sin(u * 78.233) * 12345.6789;
        const frac = (n: number) => n - Math.floor(n);
        target = {
          x: FORMS[f] + (frac(a) - 0.5) * 1.3,
          y: -1.3 + (u / PER_FORM) * 1.0,
          z: (frac(c) - 0.5) * 1.6,
        };
      } else {
        // Graph: a ring with a hub. Relationships, not order.
        const angle = (u / PER_FORM) * Math.PI * 2;
        const radius = u % 5 === 0 ? 0.22 : 0.7;
        target = {
          x: FORMS[f] + Math.cos(angle) * radius,
          y: -0.85 + Math.sin(angle) * radius * 0.45,
          z: Math.sin(angle) * radius,
        };
      }

      faces.push(
        ...box(
          {
            x: mix(0, target.x, t),
            y: mix(1.45, target.y, t),
            z: mix(0, target.z, t),
          },
          { x: 0.16, y: 0.16, z: 0.16 },
          rgba(verify > 0.5 ? accent : dim, 0.55 + verify * 0.3),
          rgba(verify > 0.5 ? accent : dim, 0.8),
        ),
      );
    }
  }

  paint(context, faces, cam, width, height);

  /* The check that travels back to what it is compared against. */
  if (verify > 0) {
    for (const x of FORMS) {
      const a = project({ x, y: -0.4, z: 0 }, cam, width, height);
      const b = project({ x: 0, y: 1.2, z: 0 }, cam, width, height);
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(mix(a.x, b.x, verify), mix(a.y, b.y, verify));
      context.strokeStyle = rgba(accent, 0.6 * verify);
      context.lineWidth = 1.3;
      context.setLineDash([4, 4]);
      context.stroke();
      context.setLineDash([]);
    }
  }
};
