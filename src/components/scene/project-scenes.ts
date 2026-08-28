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
 * Hydrology - an ensemble becoming an interval
 *
 * Members run away from the reader into the horizon, agreeing at the start and separating
 * through the middle. The envelope is drawn last, over the members that produced it, so the
 * order of the argument is visible: the spread exists first and the band is a summary of it.
 * ========================================================================================== */

const MEMBERS = 11;
const STEPS = 30;

/** Deterministic member trajectories. Fixed expressions, so every render is identical. */
function memberY(member: number, t: number) {
  const spread = Math.sin(t * Math.PI) * (member - (MEMBERS - 1) / 2) * 0.14;
  return Math.sin(t * Math.PI * 2.1) * 0.9 + Math.sin(t * 9 + member) * 0.07 + spread;
}

export const drawEnsemble: DrawFn = (context, { progress, width, height, camera: base }) => {
  const accent = token("--accent-flow", "#5fb0d8");
  const ink = token("--stage-ink", "#f2f0e8");
  const cam = settle(base, progress, width);

  const draw = ease(ramp(progress, 0.04, 0.42));
  const summarise = ease(ramp(progress, 0.5, 0.82));
  const span = 15;

  const at = (member: number, i: number) => {
    const t = i / STEPS;
    return { x: 0, y: memberY(member, t), z: (t - 0.5) * span };
  };

  /* Every member, faint, so the disagreement is the visible thing first. */
  const visible = Math.max(2, Math.round(STEPS * draw));
  for (let m = 0; m < MEMBERS; m += 1) {
    context.beginPath();
    for (let i = 0; i <= visible; i += 1) {
      const q = project(at(m, i), cam, width, height);
      if (i === 0) context.moveTo(q.x, q.y);
      else context.lineTo(q.x, q.y);
    }
    context.strokeStyle = rgba(accent, 0.2 + 0.24 * (1 - summarise));
    context.lineWidth = 1.1;
    context.stroke();
  }

  /* The envelope: the outermost members, closed into a surface. */
  if (summarise > 0) {
    const upper: { x: number; y: number }[] = [];
    const lower: { x: number; y: number }[] = [];
    for (let i = 0; i <= visible; i += 1) {
      const t = i / STEPS;
      const half = Math.sin(t * Math.PI) * ((MEMBERS - 1) / 2) * 0.14 * summarise;
      const centre = Math.sin(t * Math.PI * 2.1) * 0.9;
      const z = (t - 0.5) * span;
      upper.push(project({ x: 0, y: centre + half, z }, cam, width, height));
      lower.push(project({ x: 0, y: centre - half, z }, cam, width, height));
    }
    context.beginPath();
    upper.forEach((q, i) => (i === 0 ? context.moveTo(q.x, q.y) : context.lineTo(q.x, q.y)));
    for (let i = lower.length - 1; i >= 0; i -= 1) context.lineTo(lower[i].x, lower[i].y);
    context.closePath();
    context.fillStyle = rgba(accent, 0.14 * summarise);
    context.fill();
    context.strokeStyle = rgba(accent, 0.5 * summarise);
    context.lineWidth = 1.3;
    context.stroke();
  }

  /* What actually happened, cutting through the ensemble. */
  if (summarise > 0.4) {
    context.beginPath();
    for (let i = 0; i <= visible; i += 1) {
      const t = i / STEPS;
      const q = project(
        { x: 0, y: Math.sin(t * Math.PI * 2.1) * 0.9 + Math.sin(t * 5.5) * 0.12, z: (t - 0.5) * span },
        cam,
        width,
        height,
      );
      if (i === 0) context.moveTo(q.x, q.y);
      else context.lineTo(q.x, q.y);
    }
    context.strokeStyle = rgba(ink, 0.75);
    context.lineWidth = 1.8;
    context.setLineDash([5, 4]);
    context.stroke();
    context.setLineDash([]);
  }
};

/* ============================================================================================
 * Streamflow - the horizon as depth
 *
 * Deliberately not the ensemble. Here the depth axis *is* lead time: everything nearer the
 * reader is observed, the issue point is a plane across the scene, and beyond it the interval
 * opens as it recedes. The cone is the whole claim - uncertainty is a function of how far ahead
 * you are looking, and that is a statement about distance, which is what depth is for.
 * ========================================================================================== */

export const drawHorizon: DrawFn = (context, { progress, width, height, camera: base }) => {
  const accent = token("--accent-flow", "#5fb0d8");
  const ink = token("--stage-ink", "#f2f0e8");
  const cam = settle(base, progress, width);

  const history = ease(ramp(progress, 0.04, 0.3));
  const issue = ease(ramp(progress, 0.28, 0.42));
  const open = ease(ramp(progress, 0.4, 0.86));

  const span = 16;
  const ISSUE_Z = -1.5;
  const observedY = (z: number) => Math.sin((z + span / 2) * 0.55) * 0.55;

  /* Observed history, up to the moment of issue. */
  context.beginPath();
  const from = -span / 2;
  const steps = 26;
  for (let i = 0; i <= steps * history; i += 1) {
    const z = mix(from, ISSUE_Z, i / steps);
    const q = project({ x: 0, y: observedY(z), z }, cam, width, height);
    if (i === 0) context.moveTo(q.x, q.y);
    else context.lineTo(q.x, q.y);
  }
  context.strokeStyle = rgba(ink, 0.85);
  context.lineWidth = 2.2;
  context.stroke();

  /* The issue point, as a plane standing across the scene. */
  if (issue > 0) {
    const gate = box(
      { x: 0, y: 0, z: ISSUE_Z },
      { x: 0.06, y: 1.9 * issue, z: 0.06 },
      rgba(ink, 0.3),
      rgba(ink, 0.55),
    );
    paint(context, gate, cam, width, height);
  }

  /*
   * The cone. Half-width grows with the square of lead time, so the opening accelerates - which
   * is the point: each step forward compounds what the previous one did not pin down.
   */
  if (open > 0) {
    const upper: { x: number; y: number }[] = [];
    const lower: { x: number; y: number }[] = [];
    const end = mix(ISSUE_Z, span / 2, open);
    for (let i = 0; i <= steps; i += 1) {
      const z = mix(ISSUE_Z, end, i / steps);
      const lead = (z - ISSUE_Z) / (span / 2 - ISSUE_Z);
      const half = 0.03 + lead * lead * 1.15;
      const centre = observedY(ISSUE_Z) + Math.sin(lead * 2.1) * 0.3;
      upper.push(project({ x: 0, y: centre + half, z }, cam, width, height));
      lower.push(project({ x: 0, y: centre - half, z }, cam, width, height));
    }
    context.beginPath();
    upper.forEach((q, i) => (i === 0 ? context.moveTo(q.x, q.y) : context.lineTo(q.x, q.y)));
    for (let i = lower.length - 1; i >= 0; i -= 1) context.lineTo(lower[i].x, lower[i].y);
    context.closePath();
    context.fillStyle = rgba(accent, 0.16);
    context.fill();
    context.strokeStyle = rgba(accent, 0.55);
    context.lineWidth = 1.3;
    context.stroke();

    /* Lead-time ticks, so the widening is read against distance rather than felt vaguely. */
    for (let k = 1; k <= 4; k += 1) {
      const z = mix(ISSUE_Z, span / 2, k / 4);
      if (z > end) break;
      const a = project({ x: 0, y: -1.15, z }, cam, width, height);
      const b = project({ x: 0, y: -0.95, z }, cam, width, height);
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.strokeStyle = rgba(ink, 0.35);
      context.lineWidth = 1;
      context.stroke();
    }
  }
};

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
