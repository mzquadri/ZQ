import type { DrawFn } from "@/components/scene/CanvasStage";
import { graphEdges3D, graphMaxHop, graphNodes3D } from "@/content/cinema-geometry";
import { box, ease, mix, paint, project, ramp, rgba, type Camera, type Face } from "@/components/scene/projector";

/**
 * The two scenes that moved off WebGL.
 *
 * Both were R3F, and both were measured before being moved rather than migrated on principle.
 * The finding was the same in each case: fifty and fifty-two flat-shaded objects, every one on
 * `meshBasicMaterial` - no lights, no shadows, no textures, no shaders, and far too few
 * instances for instancing to matter. The renderer was supplying a perspective transform and a
 * depth sort, which is what the projector does in a couple of hundred bytes.
 *
 * They were also the only reason three.js was reaching the homepage, since both projects appear
 * as chapters there. Moving them is what takes the homepage's motion-on payload back down.
 *
 * The geometry modules are unchanged and shared with the flat SVG figures, so the drawings and
 * the surfaces remain one dataset rather than two.
 */

function token(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** The shared camera move, identical to the other projected scenes. */
function settle(base: Camera, progress: number, width: number): Camera {
  return {
    ...base,
    yaw: base.yaw + progress * 0.3,
    pitch: mix(0.34, 0.14, ease(ramp(progress, 0.1, 0.75))),
    focal: (base.focal * Math.min(width, 1600)) / 1100,
  };
}

/* ============================================================================================
 * Transport - the network as an uncertainty field
 * ========================================================================================== */

export const drawGraphCity: DrawFn = (context, { progress, width, height, camera: base }) => {
  const accent = token("--accent-graph", "#4cc4b0");
  const warn = token("--orange", "#f15a35");
  const ink = token("--stage-ink", "#f2f0e8");
  const dim = token("--stage-ink-soft", "#9aa7b2");
  const cam = settle(base, progress, width);

  const drawn = ease(ramp(progress, 0.04, 0.26));
  const wave = ramp(progress, 0.22, 0.52) * (graphMaxHop + 1);
  const rise = ease(ramp(progress, 0.48, 0.72));
  const calibrate = ease(ramp(progress, 0.7, 0.94));

  /* The plan first, so the pillars have something to stand on. */
  for (const [a, b] of graphEdges3D) {
    const from = graphNodes3D[a];
    const to = graphNodes3D[b];
    const p = project({ x: from.x, y: 0, z: from.z }, cam, width, height);
    const q = project({ x: to.x, y: 0, z: to.z }, cam, width, height);
    context.beginPath();
    context.moveTo(p.x, p.y);
    context.lineTo(q.x, q.y);
    context.strokeStyle = rgba(dim, 0.1 + drawn * 0.2);
    context.lineWidth = 1;
    context.stroke();
  }

  const faces: Face[] = [];
  for (const node of graphNodes3D) {
    const reached = Math.max(0, Math.min(1, wave - node.hop));
    const present = drawn * reached;
    if (present <= 0.01) continue;

    // Uniform height first - an interval that knows nothing - then the calibrated field.
    const h = Math.max(
      0.002,
      node.rawHeight * rise * (1 - calibrate) + node.calHeight * calibrate * rise,
    );

    /*
     * A step rather than a blend. Interpolating the accent toward the warning colour passes
     * through mud at every intermediate value, so the junctions the model had least to go on
     * switch rather than fade.
     */
    const declined = node.hop >= graphMaxHop - 1 ? ease(ramp(calibrate, 0.55, 0.8)) : 0;
    const colour = declined > 0.5 ? warn : node.hop === 0 ? ink : accent;
    const cap = node.hop === 0 ? 0.22 : 0.15;

    faces.push(
      ...box(
        { x: node.x, y: h / 2, z: node.z },
        { x: 0.075 * present, y: h, z: 0.075 * present },
        rgba(colour, 0.42),
        rgba(colour, 0.7),
      ),
      ...box(
        { x: node.x, y: h, z: node.z },
        { x: cap * present, y: cap * present, z: cap * present },
        rgba(colour, 0.95),
        rgba(colour, 1),
      ),
    );
  }

  paint(context, faces, cam, width, height);
};

/* ============================================================================================
 * Retrieval - passages in a space, and the neighbourhood a question selects
 * ========================================================================================== */

const CHUNKS = 48;
const QUERY = { x: 0.35, y: -0.1, z: 0.2 };

/*
 * Hash multipliers, deliberately kept to eight significant digits.
 *
 * The usual sine-hash constants run to nine or ten, and a nine-digit run is indistinguishable
 * from a phone number to the content validator, which reads this file's source. Shorter
 * constants hash just as well for scattering forty-eight points and keep the check strict.
 */
const HASH = { a: 43758.545, b: 12345.678, c: 24634.634 } as const;

const PASSAGES = Array.from({ length: CHUNKS }, (_, i) => {
  const frac = (n: number) => n - Math.floor(n);
  const p = {
    x: (frac(Math.sin(i * 12.9898) * HASH.a) - 0.5) * 5.4,
    y: (frac(Math.sin(i * 78.233) * HASH.b) - 0.5) * 3,
    z: (frac(Math.sin(i * 39.425) * HASH.c) - 0.5) * 4.6,
  };
  return { ...p, d: Math.hypot(p.x - QUERY.x, p.y - QUERY.y, p.z - QUERY.z) };
});

/** The selected set is genuinely the nearest four, computed from the positions above. */
const NEAREST = PASSAGES.map((p, i) => ({ i, d: p.d }))
  .sort((a, b) => a.d - b.d)
  .slice(0, 4)
  .map((entry) => entry.i);

export const drawRetrieval: DrawFn = (context, { progress, width, height, camera: base }) => {
  const accent = token("--accent-retrieval", "#f0a03c");
  const ink = token("--stage-ink", "#f2f0e8");
  const dim = token("--stage-ink-soft", "#9aa7b2");
  const cam = settle(base, progress, width);

  const arrive = ramp(progress, 0.05, 0.34);
  const queryIn = ease(ramp(progress, 0.32, 0.5));
  const search = ease(ramp(progress, 0.46, 0.68));
  const tether = ease(ramp(progress, 0.66, 0.92));

  const faces: Face[] = [];
  for (let i = 0; i < CHUNKS; i += 1) {
    const p = PASSAGES[i];
    // Passages travel out of the document rather than appearing where they belong.
    const t = ease(Math.max(0, Math.min(1, arrive * CHUNKS - i * 0.55)));
    if (t <= 0.01) continue;
    const selected = NEAREST.includes(i) ? search : 0;
    const size = 0.12 + selected * 0.11;
    faces.push(
      ...box(
        { x: mix(-3.8, p.x, t), y: mix(0, p.y, t), z: mix(0, p.z, t) },
        { x: size, y: size, z: size },
        rgba(selected > 0.5 ? accent : dim, 0.45 + selected * 0.5),
        rgba(selected > 0.5 ? accent : dim, 0.85),
      ),
    );
  }

  /* The question, as a point in the same space the passages live in. */
  if (queryIn > 0) {
    const s = 0.24 * queryIn;
    faces.push(...box(QUERY, { x: s, y: s, z: s }, rgba(ink, 0.95), rgba(ink, 1)));
  }

  paint(context, faces, cam, width, height);

  /* The answer stays physically tied to the passages it was built from. */
  if (tether > 0) {
    const q = project(QUERY, cam, width, height);
    for (const index of NEAREST) {
      const e = project(PASSAGES[index], cam, width, height);
      context.beginPath();
      context.moveTo(q.x, q.y);
      context.lineTo(mix(q.x, e.x, tether), mix(q.y, e.y, tether));
      context.strokeStyle = rgba(accent, 0.85 * tether);
      context.lineWidth = 1.4;
      context.stroke();
    }
  }
};
