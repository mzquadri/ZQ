/**
 * A very small 3D projector for Canvas 2D.
 *
 * Why this exists rather than another three.js scene: every WebGL scene on this site uses
 * `meshBasicMaterial` - flat, unlit colour. No lighting, no shadows, no textures, no shaders. So
 * the renderer was only ever providing two things, a perspective transform and a depth sort, and
 * both of those are a few dozen lines of arithmetic. Three.js is 875KB; this is a rounding error.
 *
 * That trade is not free and is not always right. It is right for scenes made of a few hundred
 * flat-shaded faces and lines, which is what the figures below are. It would be wrong the moment
 * a scene wants real materials, thousands of instances, or anything the GPU is actually for -
 * which is why the three richest scenes on the site remain WebGL and are not ported to this.
 *
 * Everything here is pure and deterministic: same inputs, same pixels, on every machine.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Camera {
  /** Distance of the eye from the origin along +z. */
  distance: number;
  /** Focal length in pixels at unit depth; larger is a longer lens. */
  focal: number;
  /** Rotation about the vertical axis, radians. */
  yaw: number;
  /** Rotation about the horizontal axis, radians. Positive tips the far side up. */
  pitch: number;
}

export interface Projected {
  x: number;
  y: number;
  /** Camera-space depth. Larger is further away; used for sorting and for scale. */
  depth: number;
  /** Perspective divisor, useful for scaling point sizes and line widths. */
  scale: number;
}

/**
 * World point to screen point.
 *
 * Yaw then pitch, then a single perspective divide. The order matters and is fixed: yaw first
 * keeps the horizon level however far the scene is tipped, which is what stops a rotating figure
 * from feeling like it is tumbling.
 */
export function project(point: Vec3, camera: Camera, width: number, height: number): Projected {
  const cosYaw = Math.cos(camera.yaw);
  const sinYaw = Math.sin(camera.yaw);
  const x1 = point.x * cosYaw - point.z * sinYaw;
  const z1 = point.x * sinYaw + point.z * cosYaw;

  const cosPitch = Math.cos(camera.pitch);
  const sinPitch = Math.sin(camera.pitch);
  const y2 = point.y * cosPitch - z1 * sinPitch;
  const z2 = point.y * sinPitch + z1 * cosPitch;

  const depth = z2 + camera.distance;
  // Clamped rather than allowed to explode: a point behind the eye should degrade, not scream.
  const scale = camera.focal / Math.max(0.35, depth);

  return {
    x: width / 2 + x1 * scale,
    y: height / 2 - y2 * scale,
    depth,
    scale,
  };
}

/** A face to be filled, carried with its sort key. */
export interface Face {
  points: Vec3[];
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  /** Overrides the computed centroid depth when a face needs to sit in front of its neighbours. */
  bias?: number;
}

/**
 * Painter's algorithm.
 *
 * Faces are sorted by centroid depth and drawn back to front. This is exactly wrong for
 * interpenetrating geometry and exactly right for the kind of scene here - separated boxes,
 * planes and ribbons that never pass through each other. Choosing geometry a painter's sort can
 * handle is cheaper than paying for a depth buffer.
 */
export function paint(
  context: CanvasRenderingContext2D,
  faces: Face[],
  camera: Camera,
  width: number,
  height: number,
) {
  const prepared = faces
    .map((face) => {
      const projected = face.points.map((p) => project(p, camera, width, height));
      const depth =
        face.bias ?? projected.reduce((sum, p) => sum + p.depth, 0) / Math.max(1, projected.length);
      return { face, projected, depth };
    })
    .sort((a, b) => b.depth - a.depth);

  for (const item of prepared) {
    if (item.projected.length < 2) continue;
    context.beginPath();
    context.moveTo(item.projected[0].x, item.projected[0].y);
    for (let i = 1; i < item.projected.length; i += 1) {
      context.lineTo(item.projected[i].x, item.projected[i].y);
    }
    if (item.face.fill) {
      context.closePath();
      context.fillStyle = item.face.fill;
      context.fill();
    }
    if (item.face.stroke) {
      context.strokeStyle = item.face.stroke;
      context.lineWidth = item.face.lineWidth ?? 1;
      context.stroke();
    }
  }
}

/** The six faces of an axis-aligned box, ready to paint. */
export function box(centre: Vec3, size: Vec3, fill: string, stroke?: string): Face[] {
  const hx = size.x / 2;
  const hy = size.y / 2;
  const hz = size.z / 2;
  const corner = (sx: number, sy: number, sz: number): Vec3 => ({
    x: centre.x + hx * sx,
    y: centre.y + hy * sy,
    z: centre.z + hz * sz,
  });

  const c = {
    a: corner(-1, -1, -1), b: corner(1, -1, -1), cc: corner(1, 1, -1), d: corner(-1, 1, -1),
    e: corner(-1, -1, 1), f: corner(1, -1, 1), g: corner(1, 1, 1), h: corner(-1, 1, 1),
  };

  return [
    { points: [c.a, c.b, c.cc, c.d], fill, stroke },
    { points: [c.e, c.f, c.g, c.h], fill, stroke },
    { points: [c.a, c.e, c.h, c.d], fill, stroke },
    { points: [c.b, c.f, c.g, c.cc], fill, stroke },
    { points: [c.d, c.cc, c.g, c.h], fill, stroke },
    { points: [c.a, c.b, c.f, c.e], fill, stroke },
  ];
}

/** Linear interpolation, clamped. Used everywhere a stage eases into the next. */
export const mix = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));

/** Normalised position of `v` within `[from, to]`. */
export const ramp = (v: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (v - from) / (to - from)));

/** Smoothstep. */
export const ease = (t: number) => t * t * (3 - 2 * t);

/** `rgb()` with alpha, from a CSS custom property that has already been resolved to a hex. */
export function rgba(hex: string, alpha: number) {
  const value = hex.trim().replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const n = Number.parseInt(full || "888888", 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
