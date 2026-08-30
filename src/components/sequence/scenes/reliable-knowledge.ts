import { invariants, representations } from "@/content/reliable-knowledge-world";

import {
  beat,
  blend,
  caption,
  focus,
  palette,
  type Palette,
  type SceneDefinition,
} from "../scene";
import type { Surface } from "../surface";

/**
 * Reliable knowledge systems: what stays, and what can be thrown away.
 *
 * Everything here is orthogonal - rectangles, right-angled cables, no diagonal anywhere. That is a
 * deliberate contrast with the transport chapter above it, which is nothing but diagonals, and it
 * is also the honest shape of the subject: this is a system of stores and the routes between them,
 * not a field of measurements.
 *
 *   rest   the evidence core, three derived representations, cables at rest
 *   0.06   capture: a document arrives and is fingerprinted
 *   0.18   the three derived views separate outward - they come *from* the core
 *   0.34   verification runs backward, each derived view checked against the core
 *   0.48   one view drifts out of alignment
 *   0.60   four gates evaluate. Three hold. Consistent does not.
 *   0.72   the failing view detaches and falls
 *   0.82   it is rebuilt from the core
 *   0.94   the gates restore
 *
 * The rule the whole scene exists to show: **the core never moves.** Not by a pixel, through the
 * drift, the detach and the rebuild - and a registration mark is drawn on it so a reader can see
 * that it has not, rather than being told. Three of these four things are disposable. One is not.
 *
 * Public-safe by construction. Every label comes from the published synthetic model; no service,
 * store, schema, endpoint or quantity from any real system appears here or could be inferred from
 * it.
 */

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function boxes(s: Surface) {
  const f = focus(s);
  if (s.portrait) {
    const coreW = f.r * 1.05;
    const coreH = f.r * 0.46;
    /* Clear of the gate bar above it: the core's own label was landing inside it. */
    const core: Box = { x: f.x - coreW / 2, y: f.y - f.r * 0.68, w: coreW, h: coreH };
    const dw = f.r * 0.56;
    const dh = f.r * 0.42;
    const derived: Box[] = [0, 1, 2].map((i) => ({
      x: f.x + (i - 1) * (dw + f.r * 0.1) - dw / 2,
      y: f.y + f.r * 0.24,
      w: dw,
      h: dh,
    }));
    return { f, core, derived, vertical: true };
  }
  const coreW = f.r * 0.4;
  const coreH = f.r * 1.28;
  const core: Box = { x: f.x - f.r * 0.98, y: f.y - coreH / 2 + f.r * 0.08, w: coreW, h: coreH };
  const dw = f.r * 0.86;
  const dh = f.r * 0.3;
  const derived: Box[] = [0, 1, 2].map((i) => ({
    x: f.x + f.r * 0.24,
    y: f.y + (i - 1) * f.r * 0.52 - dh / 2 + f.r * 0.08,
    w: dw,
    h: dh,
  }));
  return { f, core, derived, vertical: false };
}

/** A right-angled route from the core to a derived view. Never a diagonal. */
function cable(
  s: Surface,
  from: Box,
  to: Box,
  vertical: boolean,
  paint: { stroke: string; width: number; alpha: number },
) {
  const pts: [number, number][] = vertical
    ? (() => {
        const sx = from.x + from.w / 2;
        const sy = from.y + from.h;
        const tx = to.x + to.w / 2;
        const mid = (sy + to.y) / 2;
        return [
          [sx, sy],
          [sx, mid],
          [tx, mid],
          [tx, to.y],
        ];
      })()
    : (() => {
        const sx = from.x + from.w;
        const sy = from.y + from.h / 2;
        const ty = to.y + to.h / 2;
        const mid = (sx + to.x) / 2;
        return [
          [sx, sy],
          [mid, sy],
          [mid, ty],
          [to.x, ty],
        ];
      })();
  s.poly(pts, paint);
  return pts;
}

/** A token travelling a routed cable, used for both capture and verification. */
function travel(pts: [number, number][], t: number): [number, number] {
  const lengths = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = lengths.reduce((a, b) => a + b, 0) || 1;
  let d = t * total;
  for (let i = 0; i < lengths.length; i += 1) {
    if (d <= lengths[i]) {
      const k = lengths[i] === 0 ? 0 : d / lengths[i];
      return [
        pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k,
        pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k,
      ];
    }
    d -= lengths[i];
  }
  return pts[pts.length - 1];
}

function draw(s: Surface, progress: number, p: Palette) {
  const capture = beat(progress, 0.06, 0.16);
  const separate = beat(progress, 0.18, 0.3);
  const verify = beat(progress, 0.34, 0.44);
  const drift = beat(progress, 0.48, 0.56);
  const gate = beat(progress, 0.6, 0.68);
  const detach = beat(progress, 0.72, 0.8);
  const rebuild = beat(progress, 0.82, 0.9);
  const restore = beat(progress, 0.94, 0.99);

  const { f, core, derived, vertical } = boxes(s);
  /* The index that drifts. The semantic view: similarity-based, and the one that cannot answer exactly. */
  const BAD = 1;

  /* ---- derived views, and the cables that made them ---- */
  derived.forEach((d, i) => {
    const out = separate * (vertical ? f.r * 0.12 : f.r * 0.14);
    const push = vertical ? { x: (i - 1) * out, y: out * 0.5 } : { x: out, y: (i - 1) * out * 0.6 };

    const broken = i === BAD;
    /* Drift moves it out of alignment; detach drops it; rebuild returns it to exactly where it was. */
    const slip = broken ? drift * f.r * 0.16 * (1 - rebuild) : 0;
    const fall = broken ? detach * (1 - rebuild) * f.r * 1.4 : 0;
    const box: Box = {
      x: d.x + push.x + slip,
      y: d.y + push.y + fall,
      w: d.w,
      h: d.h,
    };

    const health = broken ? 1 - drift * (1 - rebuild) : 1;
    const colour = blend(p.warn, p.accent, health);
    const fade = broken ? 1 - detach * (1 - rebuild) * 0.75 : 1;

    const route = cable(s, core, d, vertical, {
      stroke: blend(p.line, colour, 0.25 + separate * 0.4),
      width: 1.2,
      alpha: (0.5 + separate * 0.4) * (broken ? 1 - detach * (1 - rebuild) : 1),
    });

    /* Verification travels back along the cable, from the derived view to the core. */
    if (verify > 0.02 && verify < 0.999) {
      const [vx, vy] = travel(route, 1 - verify);
      s.circle(vx, vy, s.unit * 0.008, { fill: p.ink, alpha: 0.9 });
    }

    s.rect(box.x, box.y, box.w, box.h, { fill: p.raised, alpha: 0.9 * fade });
    s.rect(box.x, box.y, box.w, box.h, {
      stroke: colour,
      width: broken && drift > 0.4 ? 1.8 : 1.2,
      alpha: fade,
      dash: broken && drift > 0.4 && rebuild < 0.5 ? [6, 5] : undefined,
    });

    /* Contents, as rows. A derived view holds many small things; the core holds one whole thing. */
    const rows = 4;
    for (let r = 0; r < rows; r += 1) {
      const ry = box.y + box.h * ((r + 1) / (rows + 1));
      const grown = rebuild > 0.02 && broken ? beat(rebuild, r / rows * 0.6, r / rows * 0.6 + 0.4) : 1;
      s.line(box.x + box.w * 0.08, ry, box.x + box.w * (0.08 + 0.6 * grown), ry, {
        stroke: colour,
        width: 1,
        alpha: 0.45 * fade * (broken && rebuild > 0.02 ? grown : 1),
      });
    }

    s.text(box.x + box.w * 0.08, box.y - s.unit * 0.016, representations[i + 1].label, {
      size: s.unit * 0.022,
      fill: colour,
      alpha: 0.9 * fade,
      mono: true,
    });
  });

  /* ---- the core. It does not move. ---- */
  s.rect(core.x, core.y, core.w, core.h, { fill: p.raised });
  s.rect(core.x, core.y, core.w, core.h, { stroke: p.ink, width: 1.6, alpha: 0.95 });
  /* Solid fill, not rows: it is one whole thing, and it is the only thing that is not rebuildable. */
  for (let i = 0; i < 7; i += 1) {
    const y = core.y + core.h * ((i + 1) / 8);
    s.line(core.x + core.w * 0.16, y, core.x + core.w * 0.84, y, {
      stroke: p.ink,
      width: 1,
      alpha: 0.3,
    });
  }
  /*
   * A registration mark. It is here so that a reader watching a view fall away and come back can
   * see for themselves that the thing it was rebuilt from never shifted.
   */
  const mx = core.x + core.w / 2;
  const my = core.y + core.h / 2;
  const t = s.unit * 0.026;
  s.line(mx - t, my, mx + t, my, { stroke: p.ink, width: 1, alpha: 0.55 });
  s.line(mx, my - t, mx, my + t, { stroke: p.ink, width: 1, alpha: 0.55 });
  s.circle(mx, my, t * 0.55, { stroke: p.ink, width: 1, alpha: 0.55 });

  s.text(core.x, core.y - s.unit * 0.018, representations[0].label, {
    size: s.unit * 0.024,
    fill: p.ink,
    mono: true,
  });

  /* Capture: the document arriving, and the fingerprint taken at the moment it lands. */
  if (capture > 0.01 && capture < 0.999) {
    const from = vertical ? [core.x + core.w / 2, core.y - f.r * 0.8] : [core.x - f.r * 0.5, my];
    const x = from[0] + (mx - from[0]) * capture;
    const y = from[1] + (my - from[1]) * capture;
    s.rect(x - t * 0.7, y - t * 0.9, t * 1.4, t * 1.8, { fill: p.ink, alpha: 1 - capture * 0.2 });
  }

  /*
   * ---- the four gates ----
   *
   * A status bar across the top, not a row underneath. The verdict is the most important thing in
   * the frame and it was competing with the plate's own type for the bottom of the stage; up here
   * it reads first and the system reads beneath it, which is also the right order to read them in.
   */
  const gw = vertical ? f.r * 0.44 : f.r * 0.42;
  const gy = s.h * (vertical ? 0.035 : 0.05);
  const gx0 = f.x - (gw * 4 + gw * 0.09 * 3) / 2;
  invariants.forEach((inv, i) => {
    const x = gx0 + i * (gw + gw * 0.09);
    const appear = beat(gate, i * 0.16, i * 0.16 + 0.5);
    if (appear <= 0.02) return;
    /* Consistent is the one that fails: a derived view no longer agrees with the record. */
    const fails = inv.key === "consistent" && gate > 0.3 && restore < 0.5;
    const colour = fails ? p.warn : p.accent;
    s.rect(x, gy, gw, s.unit * 0.05, {
      stroke: colour,
      width: 1.2,
      alpha: appear * (fails ? 1 : 0.75),
      fill: fails ? undefined : p.raised,
    });
    if (fails) {
      /* A cross, drawn as two right angles rather than a diagonal X, in keeping with the language. */
      s.line(x + gw * 0.12, gy + s.unit * 0.025, x + gw * 0.24, gy + s.unit * 0.025, {
        stroke: p.warn,
        width: 2,
        alpha: appear,
      });
    } else {
      s.line(x + gw * 0.12, gy + s.unit * 0.025, x + gw * 0.2, gy + s.unit * 0.038, {
        stroke: colour,
        width: 1.6,
        alpha: appear,
      });
      s.line(x + gw * 0.2, gy + s.unit * 0.038, x + gw * 0.32, gy + s.unit * 0.014, {
        stroke: colour,
        width: 1.6,
        alpha: appear,
      });
    }
    s.text(x + gw * 0.4, gy + s.unit * 0.032, inv.label, {
      size: s.unit * 0.021,
      fill: colour,
      alpha: appear * 0.95,
      mono: true,
    });
  });

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (restore > 0.05) say("four gates hold again", restore, p.accent);
  else if (rebuild > 0.05) say("rebuilt from evidence that never moved", rebuild, p.ink);
  else if (detach > 0.05) say("the derived view is discarded, not repaired", detach, p.warn);
  else if (gate > 0.05) say("consistent: a derived view no longer agrees", gate * (1 - detach), p.warn);
  else if (drift > 0.05) say("one representation drifts", drift, p.warn);
  else if (verify > 0.05) say("every derived view is checked against the record", verify * (1 - drift), p.ink);
  else if (separate > 0.05) say("three views, all rebuildable", separate * (1 - verify * 0.8), p.ink);
  else if (capture > 0.05) say("captured once, fingerprinted at capture", capture, p.ink);
}

export const reliableKnowledge: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3.4,
  portraitTravel: 2.8,
  rest: 0,
  label:
    "An immutable core of captured evidence, with three derived representations connected to it by right-angled routes: structured records, a semantic index and a relationship graph. Verification runs from each derived view back to the core; the semantic index drifts out of alignment, the consistency gate fails, the drifted view detaches and is rebuilt from the core, and all four gates return. The core does not move at any point. Everything shown is a public synthetic model.",
  /*
   * Steel, not the chapter's amber. This scene's whole subject is a check that fails, and amber is
   * this site's failure colour everywhere else - so the healthy system is instrument-coloured and
   * amber is reserved for the gate that does not hold. The plate above it keeps the chapter hue.
   */
  palette: palette("steel"),
  draw,
};
