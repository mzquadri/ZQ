import type { DrawFn } from "@/components/scene/CanvasStage";
import { ease, mix, project, ramp, rgba, type Camera } from "@/components/scene/projector";

/**
 * The three personal routes.
 *
 * Quieter than the project scenes by design. These pages are about a person rather than a system,
 * so each gets one idea drawn once - no staged argument, no five-beat sequence. They use the same
 * projector and the same camera language so they read as the same portfolio, and they are the
 * lightest scenes on the site.
 *
 * One thing separates them from the project scenes: these figures sit at the top of their page and
 * are on screen before anything has been scrolled. A scene whose drawing is spread across the whole
 * track is therefore never seen finished - it is caught half-built at rest, which is the opposite of
 * what the rest of the site does. So each of these completes inside the first third of its track and
 * spends the remainder settling the camera. Progress adds depth here; it does not add information.
 */

/** Drawing is done early; the rest of the track only moves the camera. */
const DRAWN_BY = 0.34;

function token(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/*
 * The page's own typeface, read off the body.
 *
 * `context.font` is parsed by the canvas, not by CSS, so a `var(--font-sans)` in that string
 * resolves to nothing and the label silently falls back to the platform UI font - close enough to
 * miss in a screenshot, wrong enough to look like a different site. Taking the computed family
 * keeps drawn text and set text the same face.
 */
function fontFamily() {
  if (typeof window === "undefined") return "system-ui, sans-serif";
  return getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
}

/** A circle of points on a plane tilted in space, so the disc reads as a disc. */
function ring(radius: number, steps: number, tilt: number, spin: number, offset: { x: number; y: number; z: number }) {
  const points: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    const cx = Math.cos(a) * radius;
    const cy = Math.sin(a) * radius;
    // Tilt about x, then spin about y, so each field sits at its own angle.
    const y = cy * Math.cos(tilt);
    const z = cy * Math.sin(tilt);
    points.push({
      x: offset.x + cx * Math.cos(spin) - z * Math.sin(spin),
      y: offset.y + y,
      z: offset.z + cx * Math.sin(spin) + z * Math.cos(spin),
    });
  }
  return points;
}

/* ============================================================================================
 * About - three fields, and the region where they meet
 *
 * The flat figure states the claim as a Venn diagram. This one gives the three fields their own
 * planes in space, which is the honest version of the same idea: they are not three areas of one
 * page, they are three different ways of looking at a problem, and the work is where all three
 * overlap. The centre is marked because the intersection is the point, not the circles.
 * ========================================================================================== */

/*
 * Three planes through one region, at equal tilt and a third of a turn apart.
 *
 * The symmetry is the point. Arbitrary tilts produced three ellipses that happened to overlap,
 * which reads as an accident; equal angles spun 120 degrees apart read as a construction, and the
 * shared centre reads as the thing being constructed. Each centre is pushed out along its own spin
 * direction by well under the radius, so all three still genuinely contain the origin.
 */
const RADIUS = 1.55;
const OFFSET = 0.62;

const FIELDS = [0, 1, 2].map((i) => {
  const spin = (i * Math.PI * 2) / 3;
  return {
    spin,
    tilt: 0.62,
    at: { x: Math.sin(spin) * OFFSET, y: Math.cos(spin) * OFFSET * 0.8, z: 0 },
    /* The same three words the flat figure carries. Dropping them would say strictly less. */
    label: ["Modelling", "Systems", "Evidence"][i],
  };
});

export const drawDomains: DrawFn = (context, { progress, width, height, camera: base }) => {
  const accent = token("--accent-graph", "#4cc4b0");
  const ink = token("--stage-ink", "#f2f0e8");
  const cam: Camera = {
    ...base,
    yaw: base.yaw + progress * 0.35,
    pitch: mix(0.18, 0.06, ease(ramp(progress, 0.1, 0.8))),
    focal: (base.focal * Math.min(width, 1600)) / 1100,
  };

  const drawn = ease(ramp(progress, 0.02, DRAWN_BY));
  const centre = ease(ramp(progress, DRAWN_BY * 0.7, DRAWN_BY * 1.6));

  const labels: { x: number; y: number; text: string; alpha: number }[] = [];

  FIELDS.forEach((field, i) => {
    const appear = ease(Math.max(0, Math.min(1, drawn * 3 - i * 0.7)));
    if (appear <= 0) return;
    const points = ring(RADIUS, 72, field.tilt, field.spin, field.at);
    const shown = Math.max(2, Math.round(points.length * appear));

    context.beginPath();
    for (let k = 0; k < shown; k += 1) {
      const q = project(points[k], cam, width, height);
      if (k === 0) context.moveTo(q.x, q.y);
      else context.lineTo(q.x, q.y);
    }
    if (appear >= 1) context.closePath();
    context.fillStyle = rgba(accent, 0.06);
    if (appear >= 1) context.fill();
    context.strokeStyle = rgba(accent, 0.5);
    context.lineWidth = 1.4;
    context.stroke();

    /*
     * The label is placed at the point of the ring furthest from the centre on screen, so it
     * follows its own plane as the camera turns and never lands inside the intersection.
     */
    const mid = project({ x: 0, y: 0, z: 0 }, cam, width, height);
    let best = { x: 0, y: 0, d: -1 };
    for (const point of points) {
      const q = project(point, cam, width, height);
      const d = Math.hypot(q.x - mid.x, q.y - mid.y);
      if (d > best.d) best = { x: q.x, y: q.y, d };
    }
    /* Pushed a little further out than the ring, then held inside the canvas so nothing clips. */
    const pad = 44;
    labels.push({
      x: Math.max(pad, Math.min(width - pad, best.x + (best.x - mid.x) * 0.14)),
      y: Math.max(14, Math.min(height - 14, best.y + (best.y - mid.y) * 0.14)),
      text: field.label,
      alpha: appear,
    });
  });

  /* The intersection: where the work actually is. */
  if (centre > 0) {
    const q = project({ x: 0, y: 0.05, z: 0.07 }, cam, width, height);
    const r = 10 + centre * 16;
    context.beginPath();
    context.arc(q.x, q.y, r, 0, Math.PI * 2);
    context.fillStyle = rgba(accent, 0.9 * centre);
    context.fill();
    context.beginPath();
    context.arc(q.x, q.y, r + 9 * centre, 0, Math.PI * 2);
    context.strokeStyle = rgba(ink, 0.3 * centre);
    context.lineWidth = 1;
    context.stroke();
  }

  /* Names last, over everything, so no ring stroke runs through a word. */
  context.font = `500 ${Math.max(13, Math.min(17, width * 0.036))}px ${fontFamily()}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (const label of labels) {
    context.fillStyle = rgba(ink, 0.72 * label.alpha);
    context.fillText(label.text, label.x, label.y);
  }
};


/* ============================================================================================
 * Contact - the closing boundary
 *
 * One ring, drawn once, in perspective rather than flat. The site spends its whole length arguing
 * that a system should say where it stops knowing; the last mark on it is a boundary being drawn,
 * and a boundary seen at an angle is more obviously a boundary than a circle is.
 * ========================================================================================== */

export const drawClosing: DrawFn = (context, { progress, width, height, camera: base }) => {
  const accent = token("--accent-graph", "#4cc4b0");
  const cam: Camera = {
    ...base,
    yaw: base.yaw + progress * 0.4,
    pitch: mix(0.62, 0.42, ease(ramp(progress, 0.2, 0.9))),
    /*
     * Scaled against the box rather than against a full-width stage. This figure sits in a narrow
     * column, and the divisor the wide scenes use shrank it to a token in the corner.
     */
    focal: (base.focal * Math.min(width, 900)) / 400,
  };

  const drawn = ease(ramp(progress, 0.04, DRAWN_BY));
  /*
   * The ring lies flat in the world, not upright facing the camera.
   *
   * Upright, perspective does almost nothing to a circle and it reads as a circle - the same mark
   * the flat figure already draws, for the cost of a canvas. Laid down and looked at from above,
   * it foreshortens into an ellipse, and a boundary you can see the plane of is more obviously a
   * boundary than an outline is.
   */
  const points = ring(1.6, 96, Math.PI / 2, 0, { x: 0, y: 0, z: 0 });
  const shown = Math.max(2, Math.round(points.length * drawn));

  context.beginPath();
  for (let i = 0; i < shown; i += 1) {
    const q = project(points[i], cam, width, height);
    if (i === 0) context.moveTo(q.x, q.y);
    else context.lineTo(q.x, q.y);
  }
  context.strokeStyle = rgba(accent, 0.8);
  context.lineWidth = 1.8;
  context.stroke();

  /* The centre: what the boundary is drawn around. */
  const c = project({ x: 0, y: 0, z: 0 }, cam, width, height);
  context.beginPath();
  context.arc(c.x, c.y, Math.max(2.5, 4 * drawn), 0, Math.PI * 2);
  context.fillStyle = rgba(accent, drawn);
  context.fill();
};
