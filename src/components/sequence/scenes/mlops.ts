import { gate, results, split, stages } from "@/content/mlops-world";

import {
  beat,
  blend,
  caption,
  focus,
  mix,
  palette,
  type Palette,
  type SceneDefinition,
} from "../scene";
import type { Surface } from "../surface";

/**
 * MLOps: one bundle, and the four things it has to survive.
 *
 * The object here is a single artifact and it persists through the whole sequence. It is built,
 * carried to the gate, refused, carried back, rebuilt, passed, and finally moved into staging and
 * then production - and it is the same rectangle the entire time, at a position the reader can
 * follow. Nothing else in the reel moves one object along a track like this; every other chapter
 * either opens something in place or fills a field.
 *
 *   rest   an empty track, four gate plates, three registry stages
 *   0.06   training: the split is drawn, 1800 / 600 / 600
 *   0.18   a candidate bundle takes shape
 *   0.30   it travels to the gate
 *   0.40   the four checks evaluate against their thresholds
 *   0.50   one refuses, and the candidate is diverted rather than scored anyway
 *   0.62   a second candidate is built and returns
 *   0.72   all four hold
 *   0.82   staging
 *   0.92   promoted to production
 *
 * The refusal is a staged demonstration of the gate's real logic, not a recorded incident. The
 * repository's tracked run passes all four checks; what is shown failing is the margin-over-
 * baseline check, which is the one the repository says carries the meaning, and it is shown
 * failing so that a reader can see what the gate is for. The thresholds and the passing values are
 * the real ones.
 */

const MARGIN = gate.findIndex((g) => g.key === "accuracy_over_baseline");

/** Short enough to sit over a gate plate without touching the next one. */
const SHORT = ["accuracy", "F1", "margin", "p95"] as const;

function draw(s: Surface, progress: number, p: Palette) {
  const train = beat(progress, 0.06, 0.16);
  const build = beat(progress, 0.18, 0.28);
  const carry = beat(progress, 0.3, 0.38);
  const check = beat(progress, 0.4, 0.48);
  const refuse = beat(progress, 0.5, 0.58);
  const rebuild = beat(progress, 0.62, 0.7);
  const pass = beat(progress, 0.72, 0.8);
  const staging = beat(progress, 0.82, 0.89);
  const promote = beat(progress, 0.92, 0.99);

  const f = focus(s);
  const vertical = s.portrait;

  /*
   * The track the bundle runs along. Horizontal on a wide stage, vertical on a phone.
   *
   * It sits above centre rather than through it: the four gate labels need two lines of type each
   * and the registry needs a caption, and all of that has to clear the plate underneath.
   */
  const a0 = vertical ? f.y - f.r * 1.0 : f.x - f.r * 0.98;
  const a1 = vertical ? f.y + f.r * 1.05 : f.x + f.r * 1.05;
  const cross = vertical ? f.x : f.y - f.r * 0.34;

  const at = (t: number) => (vertical ? { x: cross, y: mix(a0, a1, t) } : { x: mix(a0, a1, t), y: cross });

  /* ---- the rail ---- */
  /* The rail is the object this chapter is about; at one pixel of --line it read as blank. */
  const railPaint = { stroke: p.soft, width: 1.6, alpha: 0.55 };
  if (vertical) s.line(cross, a0, cross, a1, railPaint);
  else s.line(a0, cross, a1, cross, railPaint);

  /* ---- training data: the split, drawn once and left behind ---- */
  if (train > 0.02) {
    const start = at(0);
    const total = split.train + split.validation + split.test;
    const bar = f.r * 0.5;
    const thick = s.unit * 0.022;
    let offset = 0;
    ([split.train, split.validation, split.test] as const).forEach((n, i) => {
        const w = (bar * n) / total;
        const on = beat(train, i * 0.2, i * 0.2 + 0.6);
        /* Above the rail head in both orientations, so it never lands on the headline. */
        const x = start.x - bar * 0.5 + offset;
        const y = start.y - s.unit * 0.115;
        s.rect(x, y, w * on, thick, { fill: i === 2 ? p.accent : p.soft, alpha: on * 0.7 });
        if (i === 2) {
          s.text(start.x - bar * 0.5, y - s.unit * 0.016, `${split.train} / ${split.validation} / ${split.test}`, {
            size: s.unit * 0.021,
            fill: p.soft,
            alpha: on * 0.85,
            mono: true,
          });
        }
      offset += w;
    });
  }

  /* ---- the four gate plates ---- */
  const gateT = 0.5;
  const plateSpan = vertical ? f.r * 0.9 : f.r * 0.5;
  /* Wide enough that four two-line labels do not run into each other. */
  const gateStep = vertical ? plateSpan * 0.42 : f.r * 0.36;
  gate.forEach((g, i) => {
    const centre = at(gateT);
    const off = (i - 1.5) * gateStep;
    const px = vertical ? centre.x - plateSpan * 0.5 : centre.x + off;
    const py = vertical ? centre.y + off : centre.y - plateSpan * 0.5;
    const len = plateSpan;
    const fails = i === MARGIN && refuse > 0.2 && rebuild < 0.5;
    const held = pass > 0.2 || (check > 0.2 && i !== MARGIN);
    const colour = fails ? p.warn : held ? p.accent : p.soft;
    const on = 0.55 + check * 0.45;

    /* A plate the bundle has to pass through: a bar across the track. */
    if (vertical) s.line(px, py, px + len, py, { stroke: colour, width: fails ? 3 : 2, alpha: on, cap: "round" });
    else s.line(px, py, px, py + len, { stroke: colour, width: fails ? 3 : 2, alpha: on, cap: "round" });

    /* Its threshold and its value, only once the check has run. */
    if (check > 0.05) {
      const tx = vertical ? px + len + s.unit * 0.014 : px;
      /* Label above the plate, value below it. Side by side they overprinted their neighbours. */
      const above = vertical ? py + s.unit * 0.006 : py - s.unit * 0.018;
      const below = vertical ? py + s.unit * 0.03 : py + len + s.unit * 0.03;
      s.text(tx, above, SHORT[i], {
        size: s.unit * 0.02,
        fill: colour,
        alpha: check * 0.95,
        mono: true,
        anchor: vertical ? "start" : "middle",
      });
      const shown = fails ? `< ${g.threshold}` : `${g.value}`;
      s.text(tx, below, shown, {
        size: s.unit * 0.019,
        fill: fails ? p.warn : p.soft,
        alpha: check * 0.85,
        mono: true,
        anchor: vertical ? "start" : "middle",
      });
    }
  });

  /* ---- the registry stages, at the end of the track ---- */
  const stageT = [0.78, 0.93];
  [stages[1], stages[2]].forEach((stage, i) => {
    const c = at(stageT[i]);
    const size = s.unit * 0.062;
    const reached = i === 0 ? staging : promote;
    s.rect(c.x - size / 2, c.y - size / 2, size, size, {
      fill: reached > 0.3 ? blend(p.raised, p.accent, 0.25) : p.raised,
      stroke: reached > 0.3 ? p.accent : p.soft,
      width: 1.4,
      alpha: 0.7 + reached * 0.3,
    });
    /* Staggered. Side by side at this spacing the two words overprinted each other. */
    s.text(c.x, c.y + size * (i === 0 ? 1.05 : 2.0), stage.label, {
      size: s.unit * 0.021,
      fill: reached > 0.3 ? p.accent : p.soft,
      alpha: 0.8 + reached * 0.2,
      mono: true,
      anchor: "middle",
    });
  });

  /* ---- the bundle. One object, followed the whole way. ---- */
  const first = refuse * (1 - rebuild);
  /*
   * Position along the track. It advances to the gate, is pushed back by the refusal, comes
   * forward again once rebuilt, then moves to staging and to production.
   */
  const t =
    build * 0.28 +
    carry * 0.22 -
    first * 0.3 +
    rebuild * 0.3 +
    pass * 0.06 +
    staging * 0.2 +
    promote * 0.15;
  const pos = at(Math.max(0, Math.min(1, t)));
  const size = s.unit * (0.03 + build * 0.02);
  /* Far enough off the rail to clear the gate labels it would otherwise sit on top of. */
  const diverted = first * s.unit * 0.17;
  const bx = vertical ? pos.x + diverted : pos.x;
  const by = vertical ? pos.y : pos.y - diverted;

  if (build > 0.02) {
    const colour = first > 0.3 ? p.warn : p.accent;
    /* The bundle: model, transformers, metrics, lineage - written together or not at all. */
    s.rect(bx - size, by - size * 0.72, size * 2, size * 1.44, {
      fill: p.raised,
      stroke: colour,
      width: 1.8,
      alpha: 0.6 + build * 0.4,
    });
    for (let r = 0; r < 4; r += 1) {
      const on = beat(Math.max(build, rebuild), r * 0.18, r * 0.18 + 0.5);
      s.line(
        bx - size * 0.66,
        by - size * 0.42 + r * size * 0.28,
        bx - size * 0.66 + size * 1.32 * on,
        by - size * 0.42 + r * size * 0.28,
        { stroke: colour, width: 1, alpha: 0.5 * on },
      );
    }
    /* The checksum mark: the bundle is one thing, and it is verifiable. */
    s.circle(bx, by, size * 0.2, { stroke: colour, width: 1, alpha: 0.5 });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (promote > 0.05) say("production is reached only by promotion from staging", promote, p.accent);
  else if (staging > 0.05) say("staging requires an evaluated bundle whose gate passed", staging * (1 - promote * 0.8), p.ink);
  else if (pass > 0.05) {
    say(`all four hold · accuracy ${results.accuracy}`, pass * (1 - staging * 0.8), p.accent);
    say(`margin over baseline ${results.accuracyOverBaseline.toFixed(4)}`, pass * 0.85 * (1 - staging * 0.8), p.soft, 1);
  } else if (rebuild > 0.05) say("a new candidate, not a lowered threshold", rebuild * (1 - pass * 0.8), p.ink);
  else if (refuse > 0.05) say("refused, and not scored anyway", refuse * (1 - rebuild * 0.8), p.warn);
  else if (check > 0.05) say("four checks, and all() over them", check * (1 - refuse * 0.8), p.ink);
  else if (build > 0.05) say("the bundle is the unit of promotion", build * (1 - check * 0.8), p.ink);
  else if (train > 0.05) say("one seed derives both splits", train * (1 - build * 0.8), p.ink);
}

export const mlops: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3.4,
  portraitTravel: 2.8,
  rest: 0,
  label:
    "A single model bundle travelling one track. The 1800/600/600 split is drawn, a candidate bundle is assembled, and it carries to a promotion gate of four plates: accuracy, weighted F1, margin over baseline, and p95 latency, each against its real threshold. The margin check refuses and the candidate is diverted rather than scored anyway; a second candidate is built, all four checks hold at the tracked values, and the bundle moves into staging and then to production, which is reachable only by promotion. The refusal is a staged demonstration of the gate's logic, not a recorded incident.",
  palette: palette("systems"),
  draw,
};
