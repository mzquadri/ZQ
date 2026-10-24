import {
  adapterCount,
  axisMax,
  employerCount,
  languagePenalties,
  overridden,
  percentOfAxis,
  probe,
  rejections,
  text,
  weights,
  weightTotal,
} from "@/content/career-chapter";

import { beat, caption, focus, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * CareerOS: seven weights, and two penalties that are longer than the terms they belong to.
 *
 * The object is the scoring model drawn on one axis, and the whole argument is a question of
 * length. Each of the seven components can only ever move the score by its own weight, so a term
 * worth thirteen points cannot express "this job requires native German and you do not have it".
 * The flat penalties that fix that are drawn on the same axis as the weights, which is the only
 * way to see that two of them are longer than the bars they sit beside.
 *
 *   rest   the seven weights, at true proportion
 *   0.10   the two that carry a flat penalty are marked
 *   0.24   the penalties extend, on the same axis
 *   0.40   the two that overrun their own term
 *   0.54   the language ladder, whose top is the point
 *   0.68   the four conditions that actually discard a posting
 *   0.84   the adapters, and what the probe found
 *
 * Every number is read in `@/content/career-chapter` from the engine's defaults and the shipped
 * example profile, so the bars are the configuration rather than a picture of it.
 */

const BANDS = {
  wide: { rows: 0.2, rowStep: 0.058, ladder: 0.62, rejects: 0.78, adapters: 0.92 },
  tall: { rows: 0.15, rowStep: 0.048, ladder: 0.52, rejects: 0.68, adapters: 0.86 },
} as const;

function draw(s: Surface, progress: number, p: Palette) {
  const marked = beat(progress, 0.1, 0.22);
  const extend = beat(progress, 0.24, 0.38);
  const overrun = beat(progress, 0.4, 0.52);
  const ladder = beat(progress, 0.54, 0.66);
  const discards = beat(progress, 0.68, 0.8);
  const reach = beat(progress, 0.84, 0.95);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const span = s.portrait ? s.w * 0.78 : f.r * 1.8;
  const x0 = s.portrait ? (s.w - span) * 0.62 : f.x - span * 0.44;
  const x1 = x0 + span;
  const type = s.unit * (s.portrait ? 0.02 : 0.017);
  const px = (value: number) => (percentOfAxis(value) / 100) * span;

  /* ---- the seven weights, and the penalties on the same axis ---- */
  weights.forEach((weight, i) => {
    const y = s.h * (b.rows + i * b.rowStep);
    const hasPenalty = weight.penalty !== undefined;
    const isOverrun = overridden.some((o) => o.key === weight.key);
    const w = px(weight.weight);

    s.text(x0 - s.unit * 0.014, y + s.unit * 0.011, weight.label, {
      size: type * 0.85,
      fill: hasPenalty && marked > 0.3 ? p.warn : p.soft,
      alpha: 0.9,
      mono: true,
      anchor: "end",
      baseline: "middle",
    });
    s.rect(x0, y, w, s.unit * 0.022, {
      fill: hasPenalty && marked > 0.3 ? p.warn : p.accent,
      alpha: 0.5,
    });
    s.text(x0 + w + s.unit * 0.008, y + s.unit * 0.011, String(weight.weight), {
      size: type * 0.8,
      fill: p.soft,
      alpha: 0.85,
      mono: true,
      baseline: "middle",
    });

    /*
     * The penalty, drawn below its own weight and from the same origin.
     *
     * Same axis, same zero: that is what makes "longer than the term it belongs to" a thing the
     * reader sees rather than a thing the caption asserts.
     */
    if (hasPenalty && extend > 0.02) {
      const pw = px(weight.penalty ?? 0) * extend;
      const py = y + s.unit * 0.026;
      s.rect(x0, py, pw, s.unit * 0.014, { fill: p.warn, alpha: extend * 0.85 });
      s.text(x0 + pw + s.unit * 0.008, py + s.unit * 0.007, `${weight.penalty} ${weight.penaltyFor}`, {
        size: type * 0.76,
        fill: p.warn,
        alpha: extend,
        mono: true,
        baseline: "middle",
      });
      /* The overrun itself: the part of the penalty that the weighted term could not reach. */
      if (isOverrun && overrun > 0.02) {
        s.line(x0 + w, y + s.unit * 0.011, x0 + w, py + s.unit * 0.014, {
          stroke: p.ink,
          width: 1,
          alpha: overrun * 0.7,
          dash: [3, 3],
        });
        s.rect(x0 + w, py, (pw - w) * overrun, s.unit * 0.014, {
          stroke: p.ink,
          width: 1,
          alpha: overrun,
        });
      }
    }
  });

  /* ---- the language ladder ---- */
  if (ladder > 0.02) {
    const y = s.h * b.ladder;
    languagePenalties.forEach((step, i) => {
      const on = beat(ladder, i * 0.22, i * 0.22 + 0.6);
      if (on <= 0.02) return;
      const w = px(step.points) * on;
      const ly = y + i * s.unit * 0.03;
      const top = i === languagePenalties.length - 1;
      s.rect(x0, ly, w, s.unit * 0.016, { fill: top ? p.warn : p.soft, alpha: on * (top ? 0.85 : 0.5) });
      s.text(x0 + w + s.unit * 0.008, ly + s.unit * 0.008, `${step.label} ${step.points}`, {
        size: type * 0.76,
        fill: top ? p.warn : p.soft,
        alpha: on,
        mono: true,
        baseline: "middle",
      });
    });
  }

  /* ---- the four conditions that discard ---- */
  if (discards > 0.02) {
    const y = s.h * b.rejects;
    rejections.forEach((rejection, i) => {
      const on = beat(discards, i * 0.16, i * 0.16 + 0.6);
      if (on <= 0.02) return;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = x0 + col * span * 0.5;
      const ry = y + row * s.unit * 0.034;
      s.circle(x + s.unit * 0.006, ry, s.unit * 0.006, { fill: p.ink, alpha: on });
      s.text(x + s.unit * 0.02, ry, rejection.label, {
        size: type * 0.82,
        fill: p.ink,
        alpha: on * 0.95,
        mono: true,
        baseline: "middle",
      });
    });
  }

  /* ---- the adapters, and the probe ---- */
  if (reach > 0.02) {
    s.text(x0, s.h * b.adapters, `${adapterCount} adapters, ${employerCount} employers`, {
      size: type * 0.82,
      fill: p.accent,
      alpha: reach * 0.9,
      mono: true,
    });
    s.text(x1, s.h * b.adapters, `${probe.missing} of ${probe.candidates} probed away`, {
      size: type * 0.82,
      fill: p.warn,
      alpha: reach * 0.9,
      mono: true,
      anchor: "end",
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (reach > 0.05) {
    say(`${text.probeShare} of candidate employers did not answer`, reach, p.warn);
  } else if (discards > 0.05) {
    say(`only ${rejections.length} conditions discard a posting`, discards * (1 - reach * 0.8), p.ink);
    say("everything else is a penalty you can argue with", discards * 0.85 * (1 - reach * 0.8), p.soft, 1);
  } else if (ladder > 0.05) {
    say(`native German costs ${languagePenalties[2].points}`, ladder * (1 - discards * 0.8), p.warn);
  } else if (overrun > 0.05) {
    say(`${overridden.length} penalties outrun their own term`, overrun * (1 - ladder * 0.8), p.ink);
  } else if (extend > 0.05) {
    say(`the longest is ${axisMax}, and it is a penalty`, extend * (1 - overrun * 0.8), p.warn);
  } else if (marked > 0.05) {
    say("two of them needed something extra", marked * (1 - extend * 0.8), p.warn);
  } else {
    say(`${weights.length} components, ${weightTotal} points`, 1 - marked * 0.9, p.soft);
  }
}

export const career: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "The scoring model's seven weighted components drawn at true proportion on one axis - technical 26, location 20, freshness 16, experience 15, language 13, domain 6, education 4, totalling a hundred points. Two of them, location and language, are marked as carrying a flat penalty, and those penalties extend beneath their own bars from the same origin and on the same axis: 26 points for a role outside your location tiers, 30 for one requiring native German. Both are longer than the weighted term they sit beside, and the overrun is outlined - the part of the penalty the weighted term could never have reached, which is the whole reason a flat deduction exists. The language ladder follows, 8 points for B2, 22 for C1 and above, 30 for native. Then the only four conditions that discard a posting outright, each of which answers whether the opportunity exists rather than whether the candidate is good enough. The sequence closes on reach: nine adapters covering 87 employers, and a probe in which 102 of 279 candidate employers did not answer their own endpoint.",
  palette: palette("systems"),
  draw,
};
