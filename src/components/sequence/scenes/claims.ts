import {
  breakEven,
  breakEvenText,
  cells,
  costs,
  defaultCut,
  stages,
  valueBand,
  valueOfFlagging,
  valueOfHolding,
} from "@/content/claims-chapter";

import { beat, caption, focus, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * Insurance claims: two straight lines, and where they cross.
 *
 * The object is a pair of lines over probability of claiming, and the point of the scene is how
 * little it takes to draw them. There is no model here and no dataset - the repository publishes
 * neither, and says so - but a cost matrix and a calibrated probability determine the decision
 * boundary in closed form, so the whole argument is four numbers and the intersection they imply.
 *
 *   rest   the two value lines over probability, and the axis they cross on
 *   0.08   the four cells of the cost matrix that set their slopes
 *   0.22   the crossing is marked: the only threshold this matrix justifies
 *   0.38   one half, where nearly everything defaults, is marked beside it
 *   0.54   the distance between the two, as a ratio
 *   0.70   the three stages the pipeline keeps apart - rank, calibrate, cut
 *   0.86   what is not claimed: no data, no model, no evaluation
 *
 * `breakEven` is solved in `@/content/claims-chapter` from the four signed values rather than
 * written down, so the mark and the caption cannot disagree, and changing a cost moves the line.
 */

const BANDS = {
  wide: { plotTop: 0.24, plotHeight: 0.4, matrix: 0.08, stages: 0.76 },
  tall: { plotTop: 0.2, plotHeight: 0.28, matrix: 0.06, stages: 0.66 },
} as const;

function draw(s: Surface, progress: number, p: Palette) {
  const matrix = beat(progress, 0.08, 0.2);
  const cross = beat(progress, 0.22, 0.34);
  const half = beat(progress, 0.38, 0.5);
  const ratio = beat(progress, 0.54, 0.66);
  const staged = beat(progress, 0.7, 0.82);
  const limits = beat(progress, 0.86, 0.96);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const plotW = s.portrait ? s.w * 0.76 : f.r * 1.7;
  const x0 = s.portrait ? (s.w - plotW) / 2 : f.x - plotW * 0.5;
  const x1 = x0 + plotW;
  const top = s.h * b.plotTop;
  const height = s.h * b.plotHeight;
  const bottom = top + height;
  const type = s.unit * (s.portrait ? 0.021 : 0.019);

  /* Value maps to the plot's height; the axis spans the worst and best outcomes in the matrix. */
  const vy = (value: number) =>
    bottom - ((value - valueBand.low) / (valueBand.high - valueBand.low)) * height;
  const pxAt = (probability: number) => x0 + probability * plotW;

  /* ---- the frame, and the zero line ---- */
  s.line(x0, bottom, x1, bottom, { stroke: p.line, width: 1 });
  s.line(x0, top, x0, bottom, { stroke: p.line, width: 1 });
  const zero = vy(0);
  s.line(x0, zero, x1, zero, { stroke: p.line, width: 1, dash: [3, 5] });
  s.text(x0 - s.unit * 0.01, zero, "0", {
    size: type * 0.85,
    fill: p.soft,
    alpha: 0.7,
    mono: true,
    anchor: "end",
    baseline: "middle",
  });
  s.text(x0, bottom + s.unit * 0.075, "probability of claiming", {
    size: type * 0.88,
    fill: p.soft,
    alpha: 0.8,
    mono: true,
  });
  s.text(x1, bottom + s.unit * 0.075, "1.0", {
    size: type * 0.85,
    fill: p.soft,
    alpha: 0.7,
    mono: true,
    anchor: "end",
  });

  /*
   * The two lines. Both are straight because both are expectations linear in one probability,
   * which is exactly why a single crossing exists and why it can be solved rather than searched.
   */
  const flagging: [number, number][] = [
    [pxAt(0), vy(valueOfFlagging(0))],
    [pxAt(1), vy(valueOfFlagging(1))],
  ];
  const holding: [number, number][] = [
    [pxAt(0), vy(valueOfHolding(0))],
    [pxAt(1), vy(valueOfHolding(1))],
  ];
  s.poly(flagging, { stroke: p.accent, width: 2.5 });
  s.poly(holding, { stroke: p.warn, width: 2.5 });
  s.text(x1 - s.unit * 0.012, vy(valueOfFlagging(1)) - s.unit * 0.018, "act on it", {
    size: type * 0.9,
    fill: p.accent,
    alpha: 0.95,
    mono: true,
    anchor: "end",
  });
  s.text(x1 - s.unit * 0.012, vy(valueOfHolding(1)) - s.unit * 0.034, "leave it alone", {
    size: type * 0.9,
    fill: p.warn,
    alpha: 0.95,
    mono: true,
    anchor: "end",
  });

  /*
   * A cursor that sweeps the whole probability axis as the reader scrolls.
   *
   * Without it this scene barely moved. The two lines are straight and complete in the resting
   * frame - they have to be, that frame is what ships in the HTML - so every beat after it was an
   * annotation fading in, and the picture changed two per cent from end to end against the nine
   * the reference chapter manages.
   *
   * The sweep is not decoration bolted on to fix a number. It is the one thing a reader actually
   * wants to do with a pair of crossing lines: take a probability and find out which action wins.
   * The marker rides whichever line is higher, so the moment it crosses 3.23% the answer flips
   * under the reader's own scroll, and the flip is the argument of the page.
   */
  {
    const probability = progress;
    const x = pxAt(probability);
    const flag = valueOfFlagging(probability);
    const hold = valueOfHolding(probability);
    const winning = flag >= hold;
    const y = vy(winning ? flag : hold);
    s.line(x, top, x, bottom, { stroke: p.ink, width: 1, alpha: 0.28 });
    s.circle(x, y, s.unit * 0.011, { fill: winning ? p.accent : p.warn, alpha: 0.95 });
    /* The probability and the verdict. The two line-end labels are the legend; this is the read. */
    s.text(x, top - s.unit * 0.016, `${(probability * 100).toFixed(0)}% ${winning ? "act" : "hold"}`, {
      size: type * 0.9,
      fill: winning ? p.accent : p.warn,
      alpha: 0.95,
      mono: true,
      anchor: x > (x0 + x1) / 2 ? "end" : "start",
    });
  }

  /* ---- the four cells that set the slopes ---- */
  if (matrix > 0.02) {
    const mx = x0;
    const my = s.h * b.matrix;
    cells.forEach((cell, i) => {
      const on = beat(matrix, i * 0.16, i * 0.16 + 0.5);
      if (on <= 0.02) return;
      const column = i % 2;
      const row = Math.floor(i / 2);
      const cw = s.unit * (s.portrait ? 0.3 : 0.26);
      const x = mx + column * cw;
      const y = my + row * s.unit * 0.042;
      const good = cell.value > 0;
      s.text(x, y, cell.label, {
        size: type * 0.82,
        fill: p.soft,
        alpha: on * 0.9,
        mono: true,
      });
      s.text(x + cw - s.unit * 0.02, y, `${cell.value > 0 ? "+" : ""}${cell.value}`, {
        size: type * 0.9,
        fill: good ? p.accent : cell.value === 0 ? p.soft : p.warn,
        alpha: on,
        mono: true,
        anchor: "end",
      });
    });
  }

  /* ---- the crossing ---- */
  if (cross > 0.02) {
    const x = pxAt(breakEven);
    const y = vy(valueOfFlagging(breakEven));
    s.line(x, top, x, bottom, { stroke: p.ink, width: 1.5, alpha: cross * 0.8, dash: [4, 4] });
    s.circle(x, y, s.unit * 0.009 * cross, { fill: p.ink, alpha: cross });
    s.text(x + s.unit * 0.012, top + s.unit * 0.016, `${breakEvenText.percent}%`, {
      size: type * 1.1,
      fill: p.ink,
      alpha: cross,
      mono: true,
    });
  }

  /* ---- one half, for comparison ---- */
  if (half > 0.02) {
    const x = pxAt(defaultCut);
    s.line(x, top, x, bottom, { stroke: p.soft, width: 1.5, alpha: half * 0.7, dash: [2, 6] });
    s.text(x + s.unit * 0.012, top + s.unit * 0.016, "0.5", {
      size: type,
      fill: p.soft,
      alpha: half,
      mono: true,
    });
    /*
     * The span between the two cuts, drawn as a span. The distance is the finding - everything a
     * default threshold leaves on the table lies between these two lines.
     */
    if (ratio > 0.02) {
      const from = pxAt(breakEven);
      const y = bottom + s.unit * 0.014;
      s.line(from, y, from + (x - from) * ratio, y, {
        stroke: p.ink,
        width: 2,
        alpha: ratio,
        cap: "round",
      });
      s.text((from + x) / 2, y + s.unit * 0.026, `${breakEvenText.ratio} times out`, {
        size: type * 0.9,
        fill: p.ink,
        alpha: ratio,
        mono: true,
        anchor: "middle",
      });
    }
  }

  /* ---- the three stages the pipeline keeps apart ---- */
  if (staged > 0.02) {
    const sy = s.h * b.stages;
    stages.forEach((stage, i) => {
      const on = beat(staged, i * 0.2, i * 0.2 + 0.55);
      if (on <= 0.02) return;
      const step = plotW / stages.length;
      const x = x0 + i * step;
      s.rect(x, sy, step * 0.88, s.unit * 0.004, { fill: p.accent, alpha: on * 0.7 });
      s.text(x, sy + s.unit * 0.026, stage.label, {
        size: type * 0.95,
        fill: p.accent,
        alpha: on,
        mono: true,
      });
      /*
       * The labels only. Each stage's note is a full sentence and the column it would sit in is a
       * third of the plot, so all three ran into each other - and there is no text wrapping on
       * this surface. The notes belong to the page's prose; the figure keeps the three words that
       * make the separation visible.
       */
    });
  }

  /* ---- what the repository does not claim ---- */
  if (limits > 0.02) {
    s.text(x0, s.h * (b.stages + 0.075), "no versioned data, model or evaluation is published", {
      size: type * 0.85,
      fill: p.warn,
      alpha: limits * 0.9,
      mono: true,
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (limits > 0.05) {
    say("the matrix is illustrative", limits, p.warn);
    say("and the arithmetic is still exact", limits * 0.85, p.soft, 1);
  } else if (staged > 0.05) {
    say("rank, calibrate, then cut", staged * (1 - limits * 0.8), p.accent);
  } else if (ratio > 0.05) {
    say(`one half is ${breakEvenText.ratio} times the justified cut`, ratio * (1 - staged * 0.8), p.ink);
  } else if (half > 0.05) {
    say("nearly everything defaults to one half", half * (1 - ratio * 0.8), p.soft);
  } else if (cross > 0.05) {
    say(`they cross once, at ${breakEvenText.percent}%`, cross * (1 - half * 0.8), p.ink);
  } else if (matrix > 0.05) {
    say(`a missed claim costs ${Math.abs(costs.falseNegative)}`, matrix * (1 - cross * 0.8), p.warn);
    say(`an unnecessary look costs ${Math.abs(costs.falsePositive)}`, matrix * 0.85 * (1 - cross * 0.8), p.soft, 1);
  } else {
    say("two actions, one probability", 1 - matrix * 0.9, p.soft);
  }
}

export const claims: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "Two straight lines over probability of claiming: the expected value of acting on a policy and the expected value of leaving it alone. The four signed values of the repository's illustrative cost matrix appear as the quantities that set their slopes - five hundred for a claim caught early, minus fifty for an unnecessary investigation, minus a thousand for a claim missed, nothing for a policy correctly left alone. The lines cross exactly once, at 3.23 per cent, which is the only threshold the matrix justifies and is solved from those four numbers rather than searched for. One half, where nearly every classifier defaults, is marked beside it, and the span between the two is drawn and labelled as 15.5 times out. The sequence closes on the three things the pipeline keeps apart - rank, calibrate, cut - and on the statement that no versioned data, trained model or evaluation report is published, so nothing here is a measured result.",
  palette: palette("systems"),
  draw,
};
