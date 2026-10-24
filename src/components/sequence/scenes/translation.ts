import { differences, missedByTheCount, model, resolvedCount, totalCount } from "@/content/translation-chapter";

import { beat, caption, focus, mix, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * Keras against PyTorch: five differences, four of them closed.
 *
 * The object is a list of the five places the two frameworks disagree, and the sequence is four of
 * them crossing to a "handled" column while the fifth stays where it is. That fifth - the order
 * kernels reduce in, which differs between frameworks and between devices - is not a defect anyone
 * can fix, and the whole point of the project is that it is named as the floor rather than
 * absorbed into a result.
 *
 *   rest   the five differences, and why each one exists
 *   0.12   four of them cross to the handled column, one at a time
 *   0.38   the fifth does not: it is the floor
 *   0.50   the parameter count both models are asserted to have
 *   0.64   what that count does not catch
 *   0.78   the subset the comparison runs on
 *   0.90   the result that exists, and the one that does not
 *
 * There is deliberately no Keras accuracy. The repository's results directory holds a `.gitkeep`
 * and its own table records that number as pending, so the closing beat draws an empty slot rather
 * than inventing the one result the project has not produced.
 */

const BANDS = {
  wide: { rows: 0.22, rowStep: 0.075, count: 0.62, subset: 0.74, result: 0.9 },
  tall: { rows: 0.16, rowStep: 0.062, count: 0.54, subset: 0.68, result: 0.84 },
} as const;

function draw(s: Surface, progress: number, p: Palette) {
  const crossing = beat(progress, 0.12, 0.36);
  const floor = beat(progress, 0.38, 0.48);
  const counted = beat(progress, 0.5, 0.62);
  const missed = beat(progress, 0.64, 0.76);
  const subset = beat(progress, 0.78, 0.88);
  const result = beat(progress, 0.9, 0.98);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const span = s.portrait ? s.w * 0.84 : f.r * 1.95;
  const x0 = s.portrait ? (s.w - span) / 2 : f.x - span * 0.5;
  const x1 = x0 + span;
  const type = s.unit * (s.portrait ? 0.02 : 0.017);

  /* Two columns: where a difference starts, and where a handled one ends up. */
  const fromX = x0;
  const toX = x0 + span * (s.portrait ? 0.42 : 0.52);

  s.text(fromX, s.h * b.rows - s.unit * 0.032, "the difference", {
    size: type * 0.82,
    fill: p.soft,
    alpha: 0.8,
    mono: true,
  });
  s.text(toX, s.h * b.rows - s.unit * 0.032, "what was done about it", {
    size: type * 0.82,
    fill: p.soft,
    alpha: 0.8 * Math.max(crossing, 0.3),
    mono: true,
  });

  differences.forEach((difference, i) => {
    const y = s.h * (b.rows + i * b.rowStep);
    /*
     * Each resolved difference crosses on its own sub-beat, in order, so the reader counts four
     * of them going over. The unresolved one is driven by `floor` instead and never leaves.
     */
    const resolvedAmount = difference.resolved
      ? beat(crossing, i * 0.2, i * 0.2 + 0.55)
      : 0;
    const colour = difference.resolved ? p.accent : p.warn;
    const x = mix(fromX, toX, resolvedAmount);

    s.text(x, y, difference.what, {
      size: type,
      fill: colour,
      alpha: 0.95,
      mono: true,
    });
    /* The reason stays in the left column: it is why the difference exists, not what was done. */
    if (resolvedAmount < 0.5) {
      s.text(fromX, y + s.unit * 0.024, difference.why.slice(0, s.portrait ? 44 : 62), {
        size: type * 0.72,
        fill: p.soft,
        alpha: (1 - resolvedAmount * 2) * 0.75,
        mono: true,
      });
    }
    if (resolvedAmount > 0.4) {
      s.text(x1, y, difference.handled, {
        size: type * 0.9,
        fill: p.accent,
        alpha: (resolvedAmount - 0.4) / 0.6,
        mono: true,
        anchor: "end",
      });
    }
    if (!difference.resolved && floor > 0.02) {
      s.text(x1, y, difference.handled, {
        size: type * 0.9,
        fill: p.warn,
        alpha: floor,
        mono: true,
        anchor: "end",
      });
      s.line(fromX, y + s.unit * 0.042, x1, y + s.unit * 0.042, {
        stroke: p.warn,
        width: 1.5,
        alpha: floor * 0.7,
      });
    }
  });

  /* ---- the parameter count, asserted on both sides ---- */
  if (counted > 0.02) {
    const y = s.h * b.count;
    s.text(x0, y, `${model.parameters.toLocaleString("en-GB")} parameters`, {
      size: type * 1.5,
      fill: p.ink,
      alpha: counted,
      mono: true,
    });
    s.text(x0, y + s.unit * 0.034, "asserted on every push, with no data and no fit", {
      size: type * 0.8,
      fill: p.soft,
      alpha: counted * 0.85,
      mono: true,
    });
  }

  /* ---- what the count does not catch ---- */
  if (missed > 0.02) {
    const y = s.h * b.count + s.unit * 0.07;
    s.text(x1, y, missedByTheCount.what, {
      size: type * 0.95,
      fill: p.warn,
      alpha: missed,
      mono: true,
      anchor: "end",
    });
    s.text(x1, y + s.unit * 0.03, "dropout carries no weights, so the count still lands", {
      size: type * 0.76,
      fill: p.soft,
      alpha: missed * 0.85,
      mono: true,
      anchor: "end",
    });
  }

  /* ---- the subset the comparison runs on ---- */
  if (subset > 0.02) {
    const y = s.h * b.subset;
    const parts = [
      { label: "train", value: model.trainImages },
      { label: "validation", value: model.validationImages },
      { label: "test", value: model.testImages },
    ];
    const total = parts.reduce((t, part) => t + part.value, 0);
    let run = 0;
    parts.forEach((part, i) => {
      const on = beat(subset, i * 0.2, i * 0.2 + 0.6);
      const w = (part.value / total) * span;
      if (on > 0.02) {
        s.rect(x0 + run, y, w * on, s.unit * 0.022, {
          fill: i === 2 ? p.soft : p.accent,
          alpha: on * 0.55,
        });
        s.text(x0 + run + s.unit * 0.006, y + s.unit * (i === 1 ? 0.072 : 0.042), `${part.label} ${part.value.toLocaleString("en-GB")}`, {
          size: type * 0.74,
          fill: i === 2 ? p.soft : p.accent,
          alpha: on * 0.9,
          mono: true,
        });
      }
      run += w;
    });
  }

  /* ---- the result that exists, and the one that does not ---- */
  if (result > 0.02) {
    const y = s.h * b.result;
    s.text(x0, y, `PyTorch ${model.pytorchAccuracy}`, {
      size: type * 1.1,
      fill: p.accent,
      alpha: result,
      mono: true,
    });
    /* An empty slot, drawn as one. The repository has not produced this number. */
    const bx = x0 + span * 0.42;
    s.rect(bx, y - s.unit * 0.022, s.unit * 0.12, s.unit * 0.032, {
      stroke: p.warn,
      width: 1,
      alpha: result * 0.8,
      dash: [4, 4],
    });
    s.text(bx + s.unit * 0.06, y - s.unit * 0.006, "pending", {
      size: type * 0.82,
      fill: p.warn,
      alpha: result * 0.9,
      mono: true,
      anchor: "middle",
      baseline: "middle",
    });
    s.text(bx + s.unit * 0.14, y, "Keras", {
      size: type * 1.1,
      fill: p.warn,
      alpha: result,
      mono: true,
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (result > 0.05) {
    say("one number, and a slot left empty", result, p.warn);
  } else if (subset > 0.05) {
    say(`${model.subsetTotal.toLocaleString("en-GB")} images, the same indices both sides`, subset * (1 - result * 0.8), p.accent);
  } else if (missed > 0.05) {
    say("the count is a floor, not a proof", missed * (1 - subset * 0.8), p.warn);
  } else if (counted > 0.05) {
    say("both models, to the parameter", counted * (1 - missed * 0.8), p.ink);
  } else if (floor > 0.05) {
    say("the fifth cannot be corrected for", floor * (1 - counted * 0.8), p.warn);
  } else if (crossing > 0.05) {
    say(`${resolvedCount} of ${totalCount} handled`, crossing * (1 - floor * 0.8), p.accent);
  } else {
    say(`${totalCount} places the frameworks differ`, 1 - crossing * 0.9, p.soft);
  }
}

export const translation: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "Five places where Keras and PyTorch disagree, listed with the reason each difference exists. Four of them cross the frame one at a time into a handled column: weight decay halved to 5e-5 because the two frameworks apply the penalty at different points, OneCycle reimplemented per batch because Keras has none, channel dropout swapped for SpatialDropout2D, and augmentation matched by definition rather than by draw because two random streams cannot be made to produce the same crops. The fifth stays where it is and is underlined in the warning colour: kernel reduction order differs between frameworks and between devices, and is accepted as the floor on any comparison of this kind. The parameter count both models are asserted to have follows, 815,018, checked on every push with no data and no fit, together with what that count does not catch - two dropout rates rather than one, which changes the regularisation and leaves the count unmoved because dropout carries no weights. The sequence closes on the split the comparison runs over and on the two results: PyTorch at 64.26, and an empty dashed slot marked pending where the Keras number would go.",
  palette: palette("pipeline"),
  draw,
};
