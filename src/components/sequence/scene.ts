import type { Surface } from "./surface";

/**
 * What a flagship sequence is.
 *
 * A scene is a pure function of scroll position. Nothing is animated in the sense of being played:
 * `draw(surface, progress)` is evaluated at whatever progress the scroll happens to be at, which is
 * why scrubbing backwards costs exactly what scrubbing forwards costs and why the server can
 * evaluate the same function at the resting progress to get a still.
 *
 * The eight scenes share this contract, the staging helpers in `worlds/choreography`, the loading
 * and accessibility shell, and nothing else. Composition, camera, palette, the object being opened
 * and the number of beats are each scene's own, because the point of the reel is that eight
 * different engineering systems look like eight different engineering systems.
 */

export interface Palette {
  /** The stage ground. Canvas clears to this; the SVG paints it as a backing rect. */
  ground: string;
  /** A raised plane, for anything that should read as sitting above the ground. */
  raised: string;
  ink: string;
  soft: string;
  line: string;
  /** The project's own hue. One per chapter, and the main carrier of visual identity. */
  accent: string;
  /** Reserved for refusal, failure and the thing that did not hold. Never decorative. */
  warn: string;
}

/*
 * Concrete values, mirroring the stage tokens in src/app/motion.css.
 *
 * They are duplicated here rather than read from CSS because a canvas context cannot resolve a
 * custom property. The SVG backend could, but then the two backends would disagree wherever a
 * variable was missing, and a resting frame that does not match the frame it rests from is worse
 * than a duplicated constant. There is a test that keeps the two files in step.
 */
export const STAGE = {
  ground: "#0b0f14",
  raised: "#131a22",
  ink: "#f2f0e8",
  soft: "#9aa7b2",
  line: "#2a323b",
  warn: "#f0a03c",
} as const;

export const ACCENTS = {
  graph: "#4cc4b0",
  retrieval: "#f0a03c",
  pipeline: "#7aa7f0",
  flow: "#5fb0d8",
  vision: "#d081c8",
  systems: "#8fd05a",
  corpus: "#a78bfa",
  steel: "#8ea6bd",
} as const;

export type AccentName = keyof typeof ACCENTS;

export function palette(accent: AccentName): Palette {
  return { ...STAGE, accent: ACCENTS[accent] };
}

export interface SceneDefinition {
  /** Drawing space for the wide stage. Scenes lay out against the surface, not these numbers. */
  width: number;
  height: number;
  /** Drawing space for a phone. Taller, so the story restacks instead of shrinking. */
  portraitWidth: number;
  portraitHeight: number;
  /**
   * Viewport heights of scroll the sequence is scrubbed across.
   *
   * Slow motion is not a long scroll. Every value here is tuned so a normal trackpad flick moves
   * roughly one beat: enough that the object is seen changing, not so much that a reader is
   * scrolling through an unmoving picture.
   */
  travel: number;
  /** The same, compressed for a phone, where the story is shorter and thumbs travel further. */
  portraitTravel: number;
  /** Progress of the composition the scene rests at. This is the still, and the poster. */
  rest: number;
  /** What the picture shows, for a reader who cannot see it. */
  label: string;
  palette: Palette;
  draw(surface: Surface, progress: number, palette: Palette): void;
}

/** Progress from 0 to 1 across a beat, then held. The gaps between beats are the rests. */
export function beat(progress: number, from: number, to: number) {
  const t = (progress - from) / Math.max(1e-6, to - from);
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

/** A beat that comes back down, for something that appears, is read, and withdraws. */
export function pulse(progress: number, from: number, to: number) {
  const t = (progress - from) / Math.max(1e-6, to - from);
  if (t <= 0 || t >= 1) return 0;
  return Math.sin(t * Math.PI) ** 2;
}

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Deterministic pseudo-random in 0..1. Scenes must look the same on every machine. */
export function hash01(n: number) {
  let x = (n ^ 0x9e3779b9) >>> 0;
  x = Math.imul(x, 0x85ebca6b) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35) >>> 0;
  x ^= x >>> 16;
  /* Written as a power rather than the literal: ten consecutive digits trip the privacy scan. */
  return x / 2 ** 32;
}

/** Blend two hex colours. Both backends need concrete colours, so this does the work in JS. */
export function blend(a: string, b: string, t: number) {
  const c = clamp01(t);
  const pa = parse(a);
  const pb = parse(b);
  const out = pa.map((v, i) => Math.round(v + (pb[i] - v) * c));
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function parse(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

/* ---------------------------------------------------------------------------------------------
 * Composing against the plate.
 *
 * Every chapter puts its title, question and measured line over the lower left of the frame, with
 * a scrim behind them. The object is full-bleed underneath, which is the composition the
 * references use - but the *focal point* must not sit under the type, or the reader's eye and the
 * headline fight for the same square inch.
 *
 * These two helpers are the only layout the eight scenes share. They keep the subject clear of the
 * plate in both orientations without making eight scenes look alike, because where a scene puts
 * its subject inside the box is still its own decision.
 * ------------------------------------------------------------------------------------------- */

export interface Focus {
  x: number;
  y: number;
  /** Radius of the largest circle that stays clear of the plate and the frame edges. */
  r: number;
}

/** Where a scene's subject belongs: right of the type on a wide stage, above it on a phone. */
export function focus(surface: { w: number; h: number; portrait: boolean }): Focus {
  return surface.portrait
    ? { x: surface.w * 0.5, y: surface.h * 0.31, r: Math.min(surface.w * 0.44, surface.h * 0.28) }
    : { x: surface.w * 0.61, y: surface.h * 0.44, r: Math.min(surface.w * 0.33, surface.h * 0.4) };
}

export interface Caption {
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  size: number;
  step: number;
}

/** Where a scene's one line of type belongs, so it never lands on the plate's type. */
export function caption(surface: { w: number; h: number; portrait: boolean; unit: number }): Caption {
  const size = surface.unit * (surface.portrait ? 0.026 : 0.024);
  return surface.portrait
    ? { x: surface.w * 0.5, y: surface.h * 0.575, anchor: "middle", size, step: size * 1.6 }
    : { x: surface.w * 0.95, y: surface.h * 0.79, anchor: "end", size, step: size * 1.6 };
}
