import {
  axis,
  axisPercent,
  closestGap,
  commonBand,
  commonBandText,
  dataset,
  results,
  separated,
  separatedGap,
  widestSd,
  withInterval,
  withoutInterval,
} from "@/content/water-chapter";

import { beat, caption, focus, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * Water quality: a ranking, and then the error bars that dissolve it.
 *
 * The object is a single horizontal F1 axis and five models on it, and the whole sequence is that
 * one row of marks being re-measured. It opens on the order the README publishes - five models
 * ranked by a single split - and closes with three of them sharing a band of F1 that any of them
 * could be sitting in. Nothing is replaced; the marks move, and moving is the argument.
 *
 *   rest   the five models at their single-split F1, in the order the table ranks them
 *   0.10   the cross-validated means slide in beneath them
 *   0.24   the one-standard-deviation intervals open
 *   0.40   the band consistent with all three contenders shades across them
 *   0.56   the tuned model, bolded by the README, has no interval to draw
 *   0.70   the one model the run does separate, and by how much
 *   0.84   the closest gap against the widest fold-to-fold spread
 *
 * Every number is computed in `@/content/water-chapter` from the repository's committed
 * `results/model_results.json`, including the common band, which is an intersection rather than a
 * transcription - so a re-run that separates the models would close the band on its own.
 */

const BANDS = {
  wide: { title: 0.14, rows: 0.26, rowStep: 0.1, foot: 0.8 },
  tall: { title: 0.1, rows: 0.18, rowStep: 0.075, foot: 0.86 },
} as const;

/** Where a value sits on the drawn axis, as a fraction of its width. */
const at = (value: number) => axisPercent(value) / 100;

function draw(s: Surface, progress: number, p: Palette) {
  const cv = beat(progress, 0.1, 0.22);
  const bars = beat(progress, 0.24, 0.36);
  const band = beat(progress, 0.4, 0.52);
  const missing = beat(progress, 0.56, 0.66);
  const apart = beat(progress, 0.7, 0.8);
  const spread = beat(progress, 0.84, 0.95);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const axisW = s.portrait ? s.w * 0.74 : f.r * 1.8;
  const x0 = s.portrait ? (s.w - axisW) * 0.62 : f.x - axisW * 0.46;
  const x1 = x0 + axisW;
  const type = s.unit * (s.portrait ? 0.021 : 0.019);
  const px = (value: number) => x0 + at(value) * axisW;

  /* ---- the axis ---- */
  const ay = s.h * (b.rows - 0.06);
  s.line(x0, ay, x1, ay, { stroke: p.line, width: 1 });
  for (const tick of [axis.from, (axis.from + axis.to) / 2, axis.to]) {
    const x = px(tick);
    s.line(x, ay - s.unit * 0.008, x, ay, { stroke: p.line, width: 1 });
    s.text(x, ay - s.unit * 0.016, tick.toFixed(2), {
      size: type * 0.85,
      fill: p.soft,
      alpha: 0.75,
      mono: true,
      anchor: "middle",
    });
  }
  s.text(x0, s.h * b.title, `F1 over ${dataset.samples} generated samples`, {
    size: type * 0.9,
    fill: p.soft,
    alpha: 0.85,
    mono: true,
  });

  /*
   * The band every contender could be sitting in.
   *
   * Drawn behind the rows rather than over them: it is the ground the argument stands on by the
   * end, not an annotation laid on top of it.
   */
  if (band > 0.02) {
    const from = px(commonBand.from);
    const to = px(commonBand.to);
    const top = s.h * b.rows - s.unit * 0.03;
    const height = s.h * b.rowStep * (withInterval.length - 0.4);
    s.rect(from, top, (to - from) * band, height, { fill: p.accent, alpha: band * 0.3 });
    s.line(from, top, from, top + height, { stroke: p.accent, width: 2, alpha: band * 0.8 });
    s.line(to, top, to, top + height, { stroke: p.accent, width: 2, alpha: band * 0.8 });
  }

  /* ---- the five models ---- */
  /*
   * Ordered by the single-split F1 the README ranks on, so the opening frame is the table as
   * published. The cross-validated marks then arrive beside those positions rather than
   * re-sorting the rows, because a row that moves and a row that is re-ranked read the same and
   * only one of them is happening.
   */
  const ranked = [...results].sort((a, c) => c.f1 - a.f1);
  ranked.forEach((model, i) => {
    const y = s.h * b.rows + i * s.h * b.rowStep;
    const isSeparated = model.name === separated.name;
    const noInterval = model.cvMean === undefined;

    s.text(x0 - s.unit * 0.016, y, model.name, {
      size: type,
      fill: noInterval && missing > 0.3 ? p.warn : p.ink,
      alpha: 0.9,
      mono: true,
      anchor: "end",
      baseline: "middle",
    });

    /*
     * The published single-split value, which then travels to the cross-validated one.
     *
     * Drawing the two as separate marks and fading between them was the first version, and it
     * barely moved: measured against production, the whole scene changed two per cent end to end
     * where the reference chapter changes nine. Re-measuring a model is a mark moving, so the mark
     * moves, and the ghost it left is kept so the distance stays readable.
     */
    const landed = model.cvMean === undefined ? px(model.f1) : px(model.cvMean);
    const travelled = px(model.f1) + (landed - px(model.f1)) * cv;
    s.circle(px(model.f1), y, s.unit * 0.0055, { fill: p.soft, alpha: 0.28 * cv });
    s.circle(travelled, y, s.unit * 0.0075, {
      fill: p.soft,
      alpha: 0.85 - cv * 0.5,
    });

    if (model.cvMean === undefined) {
      /*
       * No interval was recorded for the tuned model, and the figure says so rather than drawing
       * a point with no spread - which would read as a model measured precisely.
       */
      if (missing > 0.02) {
        s.text(px(model.f1) + s.unit * 0.016, y, "no interval recorded", {
          size: type * 0.85,
          fill: p.warn,
          alpha: missing,
          mono: true,
          baseline: "middle",
        });
      }
      return;
    }

    /* Narrowed together: the artefact records a mean and a spread as a pair or records neither. */
    const sd = model.cvSd ?? 0;
    const mean = px(model.cvMean);
    const lo = px(model.cvMean - sd);
    const hi = px(model.cvMean + sd);

    if (bars > 0.02) {
      /*
       * Filled, not a hairline.
       *
       * Drawn as a two-pixel rule first, and measured: at the thumbnail scale the motion audit
       * works in, a line that thin averages into the ground and the whole figure read as static
       * against the reference chapters. The interval is an amount of uncertainty, so giving it
       * area is also the more honest drawing of it.
       */
      const half = (hi - lo) * 0.5 * bars;
      const thick = s.unit * (s.portrait ? 0.034 : 0.03);
      const tone = isSeparated && apart > 0.3 ? p.accent : p.ink;
      s.rect(mean - half, y - thick * 0.5, half * 2, thick, { fill: tone, alpha: bars * 0.55 });
      for (const end of [mean - half, mean + half]) {
        s.line(end, y - s.unit * 0.014, end, y + s.unit * 0.014, {
          stroke: tone,
          width: 2,
          alpha: bars * 0.85,
        });
      }
    }

    if (cv > 0.02) {
      s.circle(mean, y, s.unit * 0.009 * cv, {
        fill: isSeparated && apart > 0.3 ? p.accent : p.warn,
        alpha: cv,
      });
      s.text(mean, y - s.unit * 0.026, model.cvMean.toFixed(3), {
        size: type * 0.85,
        fill: p.ink,
        alpha: cv * 0.9,
        mono: true,
        anchor: "middle",
      });
    }
  });

  /*
   * What the band rules out, drawn over the rows it rules out.
   *
   * The band is 0.0055 of F1 on an axis 0.2 wide, so as a shaded sliver it is true to the
   * measurement and nearly invisible as a picture. What the beat actually says is that everything
   * outside those five thousandths is inconsistent with at least one contender, so the excluded
   * ranges are what closes in and the sliver is what the three are left standing in. Drawn after
   * the rows because it has to dim them: an exclusion that leaves the excluded marks at full
   * strength is a decoration rather than an argument.
   */
  /*
   * It lifts again for the two beats that need what it is covering: the model the README bolds
   * with no interval to show, and the model that sits clear of the band on purpose. Dimming is
   * the argument while the argument is about the band, and in the way once it is not.
   */
  const excluded = band * (1 - missing * 0.6) * (1 - apart * 0.92);
  if (excluded > 0.02) {
    const top = s.h * (b.rows - 0.08);
    const height = s.h * b.rowStep * (ranked.length + 0.2);
    for (const [from, to] of [
      [x0, px(commonBand.from)],
      [px(commonBand.to), x1],
    ] as const) {
      s.rect(from, top, to - from, height, { fill: p.ground, alpha: excluded * 0.78 });
    }
  }

  /* ---- the one model the run does separate ---- */
  if (apart > 0.02) {
    const i = ranked.findIndex((m) => m.name === separated.name);
    const y = s.h * b.rows + i * s.h * b.rowStep;
    s.text(x1 + s.unit * 0.014, y, `clear by ${separatedGap.toFixed(3)}`, {
      size: type * 0.85,
      fill: p.accent,
      alpha: apart,
      mono: true,
      baseline: "middle",
    });
  }

  /* ---- the closest gap against the widest spread ---- */
  if (spread > 0.02) {
    const y = s.h * b.foot;
    const scale = axisW * 0.85;
    const gapW = (closestGap / (axis.to - axis.from)) * scale;
    const sdW = (widestSd.cvSd / (axis.to - axis.from)) * scale;
    s.rect(x0, y, gapW * spread, s.unit * 0.055, { fill: p.ink, alpha: spread * 0.8 });
    s.text(x0 + gapW + s.unit * 0.012, y + s.unit * 0.016, `closest gap ${closestGap.toFixed(3)}`, {
      size: type * 0.85,
      fill: p.ink,
      alpha: spread,
      mono: true,
      baseline: "middle",
    });
    const y2 = y + s.unit * 0.085;
    s.rect(x0, y2, sdW * spread, s.unit * 0.055, { fill: p.warn, alpha: spread * 0.75 });
    s.text(x0 + sdW + s.unit * 0.012, y2 + s.unit * 0.016, `fold spread ${widestSd.cvSd.toFixed(4)}`, {
      size: type * 0.85,
      fill: p.warn,
      alpha: spread,
      mono: true,
      baseline: "middle",
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (spread > 0.05) {
    say("the spread between folds is wider", spread, p.warn);
    say("than the gap being ranked on", spread * 0.85, p.soft, 1);
  } else if (apart > 0.05) {
    say(`${separated.name} is the one it separates`, apart * (1 - spread * 0.8), p.accent);
  } else if (missing > 0.05) {
    say(`${withoutInterval.length} of ${results.length} was bolded with no interval`, missing * (1 - apart * 0.8), p.warn);
  } else if (band > 0.05) {
    say(`one F1 between ${commonBandText.from} and ${commonBandText.to}`, band * (1 - missing * 0.8), p.accent);
    say(`is consistent with all ${commonBand.models}`, band * 0.85 * (1 - missing * 0.8), p.soft, 1);
  } else if (bars > 0.05) {
    say(`${dataset.folds}-fold spread, one standard deviation`, bars * (1 - band * 0.8), p.ink);
  } else if (cv > 0.05) {
    say("cross-validated, not one split", cv * (1 - bars * 0.8), p.warn);
  } else {
    say("ranked on a single split", 1 - cv * 0.9, p.soft);
  }
}

export const water: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "Five models on one F1 axis, in the order the repository's table ranks them by a single split. Cross-validated means then arrive beside those single-split points and one-standard-deviation intervals open across them, drawn from the committed results file. A shaded band spans the range of F1 consistent with all three of the tree- and kernel-based contenders at once, which is the finding: their intervals overlap, so this run did not establish the order the table presents. The tuned XGBoost, which the README bolds as competitive, is marked as having no interval recorded at all. Logistic regression is the single model the run does separate, clear of the next by 0.0944. The sequence closes by drawing the closest gap between neighbouring contenders against the widest fold-to-fold standard deviation in the run, with the spread the longer of the two.",
  palette: palette("flow"),
  draw,
};
