import { architecture, evaluation, findings, sources } from "@/content/medico-world";

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
 * Medico: three corpora that disagree about what they can label.
 *
 * This chapter is deliberately the quietest in the reel. It is almost monochrome - the accent
 * appears on perhaps a dozen marks in the whole sequence - because a chest film is a grey image
 * and because a glowing medical interface would be making a confidence claim the repository does
 * not support. Everything else on the page is a coloured instrument; this one is a light box.
 *
 *   rest   a synthetic thorax, drawn as contours
 *   0.08   the label space appears: three sources against fourteen findings
 *   0.22   masking. Every cell a source cannot speak to goes dark, and most of them do
 *   0.38   the grayscale adapter: three input channels averaged into one
 *   0.50   the backbone, at its real depths - 6, 12, 24 and 16 layers
 *   0.66   the head: 1024 features to 512 to fourteen
 *   0.78   fourteen outputs
 *   0.90   and no numbers in any of them
 *
 * Nothing here is a patient image. The thorax is drawn from anatomical primitives - ribs as arcs
 * about the spine, a diaphragm dome, a mediastinal column - and carries no finding of any kind,
 * because an invented opacity on a portfolio page would be exactly the wrong sort of realism.
 *
 * The final beat is the honest one. The repository implements a mask-aware per-finding evaluation
 * and selects on the worst class rather than the mean, and it publishes no output at all, so the
 * fourteen channels end the sequence empty. That is the result.
 */

const DENSE = architecture.filter((a) => a.kind === "dense") as readonly {
  name: string;
  layers: number;
}[];

/** Which of the fourteen findings each source can actually label. */
const COVERAGE = sources.map((src) =>
  findings.map((f) =>
    src.labels.length === 0 ? true : (src.labels as readonly string[]).includes(f.name),
  ),
);

/** A synthetic thorax, as contours. No corpus sample, no scan, and no pathology. */
function thorax(s: Surface, p: Palette, cx: number, cy: number, r: number, alpha: number) {
  if (alpha <= 0.01) return;
  /* Raised after watching the reel at reading speed: at 0.75 the film read as an empty frame. */
  const ink = { stroke: p.soft, width: 1.5, alpha: alpha * 0.95 };

  /* Chest wall, as two mirrored curves. */
  for (const side of [-1, 1]) {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 16; i += 1) {
      const t = i / 16;
      const y = cy - r * 0.92 + t * r * 1.84;
      const half = r * (0.66 - Math.max(0, t - 0.55) * 0.34 - Math.max(0, 0.2 - t) * 0.9);
      pts.push([cx + side * half, y]);
    }
    s.poly(pts, ink);
  }

  /* Mediastinal column and the heart border bulging into the left field. */
  s.line(cx, cy - r * 0.8, cx, cy + r * 0.45, { stroke: p.soft, width: 2.4, alpha: alpha * 0.7 });
  const heart: [number, number][] = [];
  for (let i = 0; i <= 12; i += 1) {
    const t = i / 12;
    const a = Math.PI * (0.5 + t);
    heart.push([cx - Math.sin(a) * r * 0.3 - r * 0.02, cy + Math.cos(a) * r * 0.28 + r * 0.12]);
  }
  s.poly(heart, { stroke: p.soft, width: 1.4, alpha: alpha * 0.78 });

  /* Diaphragm domes. */
  for (const side of [-1, 1]) {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 10; i += 1) {
      const t = i / 10;
      const x = cx + side * (r * 0.08 + t * r * 0.55);
      pts.push([x, cy + r * 0.5 + Math.pow(t, 2) * r * 0.22]);
    }
    s.poly(pts, { stroke: p.soft, width: 1.6, alpha: alpha * 0.85 });
  }

  /*
   * Ribs. `y + k x^2` is constant along a downward-opening parabola, so a band in that coordinate
   * curves away from the spine the way a rib does. They stop at the mediastinum, where a real film
   * obscures them.
   */
  for (let i = 0; i < 7; i += 1) {
    for (const side of [-1, 1]) {
      const pts: [number, number][] = [];
      for (let j = 0; j <= 10; j += 1) {
        const t = j / 10;
        const x = cx + side * (r * 0.13 + t * r * 0.52);
        const k = (x - cx) / r;
        pts.push([x, cy - r * 0.62 + i * r * 0.17 + k * k * r * 0.42]);
      }
      s.poly(pts, { stroke: p.soft, width: 1.1, alpha: alpha * 0.52 });
    }
  }
}

function draw(s: Surface, progress: number, p: Palette) {
  const grid = beat(progress, 0.08, 0.18);
  const mask = beat(progress, 0.22, 0.34);
  const adapt = beat(progress, 0.38, 0.46);
  const backbone = beat(progress, 0.5, 0.62);
  const head = beat(progress, 0.66, 0.74);
  const outputs = beat(progress, 0.78, 0.86);
  const empty = beat(progress, 0.9, 0.98);

  const f = focus(s);

  /* The film withdraws as the label space takes over. One object becoming the next, never a cut. */
  const filmAlpha = 1 - grid * 0.72;
  const filmX = f.x - grid * f.r * (s.portrait ? 0 : 0.62);
  const filmY = f.y - (s.portrait ? grid * f.r * 0.5 : 0);
  thorax(s, p, filmX, filmY, f.r * (0.82 - grid * 0.28), filmAlpha);

  /* ---- the label space: three sources against fourteen findings ---- */
  if (grid > 0.02) {
    const cols = findings.length;
    const gw = s.portrait ? s.w * 0.78 : f.r * 1.24;
    const cell = gw / cols;
    const gx = s.portrait ? (s.w - gw) / 2 : f.x + f.r * 0.06;
    const gy = s.portrait ? f.y - f.r * 0.1 : f.y - cell * 2.2;

    COVERAGE.forEach((row, ri) => {
      row.forEach((covered, ci) => {
        const x = gx + ci * cell;
        const y = gy + ri * cell * 1.25;
        const appear = beat(grid, (ri * cols + ci) / (cols * 3) * 0.5, (ri * cols + ci) / (cols * 3) * 0.5 + 0.5);
        if (appear <= 0.02) return;
        /* Masked cells are not dimmed - they are removed from the loss entirely. */
        const off = !covered ? mask : 0;
        s.rect(x + cell * 0.1, y, cell * 0.8, cell * 0.8, {
          fill: covered ? blend(p.raised, p.accent, 0.45 * (1 - off)) : p.raised,
          stroke: covered && off < 0.5 ? p.accent : p.line,
          width: 1,
          alpha: appear * (1 - off * 0.72),
        });
      });
      s.text(gx - s.unit * 0.014, gy + ri * cell * 1.25 + cell * 0.42, sources[ri].name, {
        size: s.unit * 0.02,
        fill: p.soft,
        alpha: grid * 0.9,
        mono: true,
        anchor: "end",
        baseline: "middle",
      });
      s.text(gx + gw + s.unit * 0.014, gy + ri * cell * 1.25 + cell * 0.42, sources[ri].approxImages, {
        size: s.unit * 0.02,
        fill: p.soft,
        alpha: grid * 0.7,
        mono: true,
        baseline: "middle",
      });
    });

    s.text(gx, gy - s.unit * 0.022, `14 findings`, {
      size: s.unit * 0.02,
      fill: p.soft,
      alpha: grid * 0.8,
      mono: true,
    });
  }

  /* ---- the model, assembled left to right beneath the label space ---- */
  const my = s.portrait ? f.y + f.r * 0.9 : f.y + f.r * 0.62;
  const mx0 = s.portrait ? s.w * 0.12 : f.x - f.r * 0.62;
  const span = s.portrait ? s.w * 0.76 : f.r * 1.7;

  /* Grayscale adapter: three channels averaged into one. */
  if (adapt > 0.02) {
    const x = mx0;
    for (let i = 0; i < 3; i += 1) {
      const gap = (1 - adapt) * s.unit * 0.022;
      s.rect(x - s.unit * 0.012, my + (i - 1) * gap - s.unit * 0.012, s.unit * 0.024, s.unit * 0.024, {
        stroke: p.soft,
        width: 1,
        alpha: adapt * (i === 1 ? 1 : 1 - adapt * 0.8),
      });
    }
    s.text(x, my + s.unit * 0.05, "1 channel", {
      size: s.unit * 0.018,
      fill: p.soft,
      alpha: adapt * 0.8,
      mono: true,
      anchor: "middle",
    });
  }

  /* Backbone, at its real depths. Each tick is a layer the torchvision block actually has. */
  if (backbone > 0.02) {
    const total = DENSE.reduce((a, b) => a + b.layers, 0);
    let cursor = mx0 + span * 0.12;
    DENSE.forEach((block, bi) => {
      const w = (span * 0.62 * block.layers) / total;
      const on = beat(backbone, bi * 0.18, bi * 0.18 + 0.5);
      for (let i = 0; i < block.layers; i += 1) {
        const x = cursor + (w * (i + 0.5)) / block.layers;
        const t = i / Math.max(1, block.layers - 1);
        const hh = s.unit * (0.018 + 0.014 * Math.sin(t * Math.PI));
        s.line(x, my - hh, x, my + hh, {
          stroke: p.soft,
          width: 1,
          alpha: on * 0.75,
        });
      }
      s.text(cursor + w / 2, my + s.unit * 0.05, String(block.layers), {
        size: s.unit * 0.018,
        fill: p.soft,
        alpha: on * 0.8,
        mono: true,
        anchor: "middle",
      });
      cursor += w + span * 0.02;
    });
  }

  /* Head: 1024 to 512 to fourteen. */
  if (head > 0.02) {
    const x = mx0 + span * 0.82;
    ["1024", "512", "14"].forEach((label, i) => {
      const on = beat(head, i * 0.22, i * 0.22 + 0.5);
      const hh = s.unit * (0.032 - i * 0.008);
      s.line(x + i * s.unit * 0.05, my - hh, x + i * s.unit * 0.05, my + hh, {
        stroke: i === 2 ? p.accent : p.soft,
        width: 2,
        alpha: on,
        cap: "round",
      });
      s.text(x + i * s.unit * 0.05, my + s.unit * 0.05, label, {
        size: s.unit * 0.018,
        fill: i === 2 ? p.accent : p.soft,
        alpha: on * 0.85,
        mono: true,
        anchor: "middle",
      });
    });
  }

  /* ---- fourteen outputs, and nothing in them ---- */
  if (outputs > 0.02) {
    const ow = s.portrait ? s.w * 0.78 : f.r * 1.24;
    const ox = s.portrait ? (s.w - ow) / 2 : f.x + f.r * 0.06;
    const oy = s.portrait ? f.y + f.r * 1.25 : f.y + f.r * 1.02;
    const step = ow / findings.length;
    findings.forEach((_, i) => {
      const on = beat(outputs, (i / findings.length) * 0.5, (i / findings.length) * 0.5 + 0.5);
      if (on <= 0.02) return;
      const x = ox + i * step + step * 0.5;
      /* A channel with an axis and no value. The evaluation exists; its output does not. */
      s.line(x, oy, x, oy + s.unit * 0.052, {
        stroke: empty > 0.3 ? p.warn : p.accent,
        width: 1,
        alpha: on * (0.35 + empty * 0.4),
        dash: empty > 0.3 ? [3, 3] : undefined,
      });
    });
    s.line(ox, oy + s.unit * 0.052, ox + ow, oy + s.unit * 0.052, {
      stroke: p.line,
      width: 1,
      alpha: outputs,
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (empty > 0.05) say(evaluation.publishedNote.toLowerCase(), empty, p.warn);
  else if (outputs > 0.05) say("fourteen findings, one head", outputs * (1 - empty), p.ink);
  else if (backbone > 0.05) say("6 - 12 - 24 - 16 dense layers", backbone * (1 - head * 0.8), p.ink);
  else if (adapt > 0.05) say("three input channels averaged into one", adapt * (1 - backbone * 0.8), p.ink);
  else if (mask > 0.05) say("what a source cannot label is masked, not guessed", mask, p.ink);
  else if (grid > 0.05) say("three corpora, fourteen findings", grid * (1 - mask * 0.8), p.ink);
  else say("synthetic film. no patient data, no finding.", 1 - grid * 2, p.soft);
}

export const medico: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3.4,
  portraitTravel: 2.8,
  rest: 0,
  label:
    "A synthetic chest radiograph drawn as contours, carrying no pathology of any kind. It gives way to a grid of three training corpora against fourteen findings, where every cell a corpus cannot label goes dark: masked rather than guessed. A grayscale adapter averages three input channels into one, a DenseNet backbone assembles at its real depths of six, twelve, twenty-four and sixteen layers, and a head reduces 1024 features to 512 and then to fourteen outputs. The fourteen output channels end the sequence empty, because the repository publishes no validated numbers.",
  palette: palette("pipeline"),
  draw,
};
