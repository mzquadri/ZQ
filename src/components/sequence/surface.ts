/**
 * One drawing API, two backends.
 *
 * The first flagship sequence shipped as ninety pre-rendered WebP frames, which is what the video
 * references do - they decompose a rendered video and scrub the images. It worked, and it cost
 * 1.4 MB for one chapter. Eight chapters that way is roughly eleven megabytes of raster for
 * pictures that are, in every case here, a few hundred lines and circles.
 *
 * So the frames are gone and the same drawing runs twice instead:
 *
 *   - on the **server**, into an SVG string, which is the resting composition. It is in the HTML,
 *     so it needs no request, cannot shift the layout, is sharp at any size, and is the whole
 *     picture for a reduced-motion reader and for a browser with no JavaScript.
 *   - in the **browser**, onto a canvas, redrawn at the scroll position. No decode, no fetch, no
 *     frame budget spent on anything but the pixels that changed.
 *
 * A scene therefore writes its picture once, against this interface, and gets both. The cost of a
 * sequence drops to the bytes of its own SVG - single-digit kilobytes - and the picture is
 * resolution-independent, which ninety fixed-width frames never were.
 *
 * Coordinates are whatever the surface says they are: every scene lays out against `s.w` and `s.h`
 * rather than constants, which is what lets the same drawing serve a wide desktop stage and a tall
 * phone one without a second implementation.
 */

export interface Paint {
  stroke?: string;
  fill?: string;
  /** Stroke width in surface units. */
  width?: number;
  alpha?: number;
  /** Dash pattern in surface units. */
  dash?: readonly number[];
  cap?: "butt" | "round";
  /** Close a polygon before stroking or filling it. */
  close?: boolean;
}

export interface TextPaint {
  size: number;
  fill: string;
  alpha?: number;
  anchor?: "start" | "middle" | "end";
  /** Uppercase mono labels are the site's instrument voice; the default is the display face. */
  mono?: boolean;
  weight?: number;
  /** Vertical alignment against y. Defaults to the alphabetic baseline. */
  baseline?: "middle" | "hanging" | "alphabetic";
}

export interface Surface {
  readonly w: number;
  readonly h: number;
  /** True when the stage is taller than it is wide, so a scene can restack rather than shrink. */
  readonly portrait: boolean;
  /** Shortest side, for sizing anything that must stay legible in either orientation. */
  readonly unit: number;
  line(x1: number, y1: number, x2: number, y2: number, paint: Paint): void;
  poly(points: readonly (readonly [number, number])[], paint: Paint): void;
  circle(cx: number, cy: number, r: number, paint: Paint): void;
  rect(x: number, y: number, w: number, h: number, paint: Paint): void;
  text(x: number, y: number, value: string, paint: TextPaint): void;
}

/*
 * The two faces. Canvas needs a font string, SVG needs a family, and both have to resolve to the
 * same faces the rest of the page uses or a label drawn in a scene will not match the label beside
 * it. These read the variables the layout already sets.
 */
const MONO = 'var(--font-geist-mono), Consolas, "Courier New", monospace';
const SANS = 'var(--font-geist-sans), system-ui, Arial, sans-serif';

/* Canvas cannot resolve a CSS variable, so it gets the concrete fallbacks. */
const CANVAS_MONO = 'ui-monospace, Consolas, "Courier New", monospace';
const CANVAS_SANS = 'system-ui, -apple-system, Segoe UI, Arial, sans-serif';

function round(value: number) {
  /* Two decimals is under a thousandth of a stage and roughly halves the SVG. */
  return Math.round(value * 100) / 100;
}

/* ---------------------------------------------------------------------------------------------
 * Canvas.
 * ------------------------------------------------------------------------------------------- */

export class CanvasSurface implements Surface {
  readonly w: number;
  readonly h: number;
  readonly portrait: boolean;
  readonly unit: number;
  private readonly c: CanvasRenderingContext2D;

  constructor(context: CanvasRenderingContext2D, w: number, h: number) {
    this.c = context;
    this.w = w;
    this.h = h;
    this.portrait = h > w;
    this.unit = Math.min(w, h);
  }

  private apply(paint: Paint) {
    const c = this.c;
    c.globalAlpha = paint.alpha ?? 1;
    c.lineWidth = paint.width ?? 1;
    c.lineCap = paint.cap ?? "butt";
    c.lineJoin = "round";
    c.setLineDash(paint.dash ? [...paint.dash] : []);
  }

  private finish(paint: Paint) {
    const c = this.c;
    if (paint.fill) {
      c.fillStyle = paint.fill;
      c.fill();
    }
    if (paint.stroke) {
      c.strokeStyle = paint.stroke;
      c.stroke();
    }
    c.globalAlpha = 1;
    c.setLineDash([]);
  }

  line(x1: number, y1: number, x2: number, y2: number, paint: Paint) {
    const c = this.c;
    this.apply(paint);
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    this.finish({ ...paint, fill: undefined });
  }

  poly(points: readonly (readonly [number, number])[], paint: Paint) {
    if (points.length === 0) return;
    const c = this.c;
    this.apply(paint);
    c.beginPath();
    points.forEach(([x, y], i) => (i === 0 ? c.moveTo(x, y) : c.lineTo(x, y)));
    if (paint.close) c.closePath();
    this.finish(paint);
  }

  circle(cx: number, cy: number, r: number, paint: Paint) {
    if (r <= 0) return;
    const c = this.c;
    this.apply(paint);
    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
    this.finish(paint);
  }

  rect(x: number, y: number, w: number, h: number, paint: Paint) {
    const c = this.c;
    this.apply(paint);
    c.beginPath();
    c.rect(x, y, w, h);
    this.finish(paint);
  }

  text(x: number, y: number, value: string, paint: TextPaint) {
    const c = this.c;
    c.globalAlpha = paint.alpha ?? 1;
    c.fillStyle = paint.fill;
    c.font = `${paint.weight ?? 400} ${paint.size}px ${paint.mono ? CANVAS_MONO : CANVAS_SANS}`;
    c.textAlign = paint.anchor === "middle" ? "center" : paint.anchor === "end" ? "right" : "left";
    c.textBaseline =
      paint.baseline === "middle" ? "middle" : paint.baseline === "hanging" ? "top" : "alphabetic";
    c.fillText(value, x, y);
    c.globalAlpha = 1;
    c.textAlign = "left";
    c.textBaseline = "alphabetic";
  }
}

/* ---------------------------------------------------------------------------------------------
 * SVG.
 *
 * Emits elements into an array that the server component joins into one `<svg>`. This runs once
 * per chapter per build, so it optimises for output size rather than speed: attributes are only
 * written when they differ from the SVG default.
 * ------------------------------------------------------------------------------------------- */

export class SvgSurface implements Surface {
  readonly w: number;
  readonly h: number;
  readonly portrait: boolean;
  readonly unit: number;
  private readonly out: string[] = [];

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.portrait = h > w;
    this.unit = Math.min(w, h);
  }

  private attrs(paint: Paint) {
    const parts: string[] = [];
    parts.push(paint.fill ? `fill="${paint.fill}"` : 'fill="none"');
    if (paint.stroke) parts.push(`stroke="${paint.stroke}"`);
    if (paint.stroke && paint.width !== undefined) parts.push(`stroke-width="${round(paint.width)}"`);
    if (paint.alpha !== undefined && paint.alpha < 1) parts.push(`opacity="${round(paint.alpha)}"`);
    if (paint.dash) parts.push(`stroke-dasharray="${paint.dash.map(round).join(" ")}"`);
    if (paint.cap === "round") parts.push('stroke-linecap="round"');
    if (paint.stroke) parts.push('stroke-linejoin="round"');
    return parts.join(" ");
  }

  line(x1: number, y1: number, x2: number, y2: number, paint: Paint) {
    this.out.push(
      `<line x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}" ${this.attrs({
        ...paint,
        fill: undefined,
      })}/>`,
    );
  }

  poly(points: readonly (readonly [number, number])[], paint: Paint) {
    if (points.length === 0) return;
    const d = points.map(([x, y]) => `${round(x)},${round(y)}`).join(" ");
    const tag = paint.close ? "polygon" : "polyline";
    this.out.push(`<${tag} points="${d}" ${this.attrs(paint)}/>`);
  }

  circle(cx: number, cy: number, r: number, paint: Paint) {
    if (r <= 0) return;
    this.out.push(
      `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" ${this.attrs(paint)}/>`,
    );
  }

  rect(x: number, y: number, w: number, h: number, paint: Paint) {
    this.out.push(
      `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(
        h,
      )}" ${this.attrs(paint)}/>`,
    );
  }

  text(x: number, y: number, value: string, paint: TextPaint) {
    const anchor = paint.anchor && paint.anchor !== "start" ? ` text-anchor="${paint.anchor}"` : "";
    const baseline =
      paint.baseline === "middle"
        ? ' dominant-baseline="central"'
        : paint.baseline === "hanging"
          ? ' dominant-baseline="hanging"'
          : "";
    const alpha = paint.alpha !== undefined && paint.alpha < 1 ? ` opacity="${round(paint.alpha)}"` : "";
    const weight = paint.weight && paint.weight !== 400 ? ` font-weight="${paint.weight}"` : "";
    this.out.push(
      `<text x="${round(x)}" y="${round(y)}" fill="${paint.fill}" font-size="${round(
        paint.size,
      )}" font-family="${paint.mono ? MONO : SANS}"${weight}${anchor}${baseline}${alpha}>${escapeText(
        value,
      )}</text>`,
    );
  }

  markup() {
    return this.out.join("");
  }

  /** Element count, so a scene can be held to a budget rather than trusted to be small. */
  size() {
    return this.out.length;
  }
}

function escapeText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
