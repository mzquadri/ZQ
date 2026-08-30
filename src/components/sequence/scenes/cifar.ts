import { classNames, confusion, primaryRow, result, structure } from "@/content/cifar-world";

import {
  beat,
  mix as mixNum,
  blend,
  caption,
  focus,
  palette,
  type Palette,
  type SceneDefinition,
} from "../scene";
import type { Surface } from "../surface";

/**
 * CIFAR: one number covering ten.
 *
 * The object is a matrix, and nothing else in the reel is. Ten by ten, every cell a real count
 * from the tracked confusion matrix, and the whole sequence is that one grid being read in six
 * different ways rather than being replaced by anything.
 *
 *   rest   the matrix, complete and dim. Every count is on screen from the first frame
 *   0.08   the diagonal: what it got right
 *   0.20   and the mass that is not on it
 *   0.32   the block structure separates - vehicles above, animals below
 *   0.44   one row lifts out: the thousand real cats, and where they went
 *   0.56   per-class accuracy fans out, 33.5 to 82.0
 *   0.68   the headline is drawn across them at 64.26
 *   0.82   the boundary the model actually learned is not one of the ten it was asked for
 *
 * Per-class accuracy is computed from the matrix in this file rather than transcribed, so the
 * picture and the number cannot drift apart: each row of the tracked matrix sums to a thousand
 * test images, and the diagonal over that sum is the recall the repository reports.
 */

const N = classNames.length;
const ROW_TOTAL = confusion[0].reduce((a, b) => a + b, 0);
const ACCURACY = confusion.map((row, i) => (row[i] / ROW_TOTAL) * 100);
const MAX_CELL = Math.max(...confusion.flatMap((row, i) => row.filter((_, j) => i !== j)));
const CAT = classNames.indexOf("cat");
/* The label set has a seam in it: four of the ten are vehicles and six are animals. */
const VEHICLES = ["airplane", "automobile", "ship", "truck"];
const IS_VEHICLE = (i: number) => VEHICLES.includes(classNames[i]);

/*
 * The order the grid moves into when the blocks separate: four vehicles, then six animals.
 *
 * Nudging each row a little way by group was tried first and it read as scatter, because the
 * vehicles are 0, 1, 8 and 9 - the two ends of the label set - so half of them drifted through the
 * animals to get anywhere. Reordering the axes instead makes the block structure a block.
 */
const ORDER = [...classNames.keys()].sort((a, b) => {
  const g = Number(IS_VEHICLE(b)) - Number(IS_VEHICLE(a));
  return g !== 0 ? g : a - b;
});
const SLOT = classNames.map((_, i) => ORDER.indexOf(i));

function draw(s: Surface, progress: number, p: Palette) {
  const diagonal = beat(progress, 0.08, 0.17);
  const errors = beat(progress, 0.2, 0.29);
  const blocks = beat(progress, 0.32, 0.42);
  const row = beat(progress, 0.44, 0.53);
  const fan = beat(progress, 0.56, 0.65);
  const mean = beat(progress, 0.68, 0.77);
  const seam = beat(progress, 0.82, 0.95);

  const f = focus(s);
  const size = Math.min(f.r * 1.2, s.portrait ? s.w * 0.76 : f.r * 1.2);
  const cell = size / N;
  const gx = s.portrait ? (s.w - size) / 2 : f.x - size * 0.5;
  /* High in the frame: the grid, the fan of per-class bars and their labels all stack below it. */
  const gy = f.y - size * (s.portrait ? 1.05 : 0.72);

  /* A slot's position, interpolated from matrix order into vehicle/animal order. */
  const slot = (i: number) => {
    const to = SLOT[i];
    const gap = to >= VEHICLES.length ? blocks * cell * 0.6 : 0;
    return mixNum(i, to, blocks) * cell + gap;
  };

  /* ---- the matrix ---- */
  for (let i = 0; i < N; i += 1) {
    for (let j = 0; j < N; j += 1) {
      const value = confusion[i][j];
      const isDiag = i === j;

      /* The cat row lifts clear of the rest of the grid. */
      const lift = i === CAT ? row * cell * 0.9 : 0;
      const x = gx + slot(j);
      const y = gy + slot(i) - lift;

      let alpha = 0.16;
      let colour = p.soft;
      if (isDiag) {
        alpha = 0.16 + diagonal * 0.74;
        colour = p.accent;
      } else if (errors > 0.02) {
        alpha = 0.1 + errors * 0.55 * (value / MAX_CELL);
        colour = p.warn;
      }
      /*
       * Within-group and across-group errors are coloured apart once the blocks have separated,
       * because that split is the finding: four fifths of the mistakes never leave their group.
       */
      if (!isDiag && blocks > 0.3 && IS_VEHICLE(i) !== IS_VEHICLE(j)) {
        colour = blend(p.warn, p.soft, blocks * 0.8);
      }
      if (i === CAT && row > 0.2 && !isDiag) alpha = Math.max(alpha, row * 0.55 * (value / 291));

      const k = isDiag ? value / ROW_TOTAL : value / MAX_CELL;
      const inset = cell * 0.5 * (1 - Math.min(1, 0.25 + k * 1.5));
      s.rect(x + inset, y + inset, cell - inset * 2, cell - inset * 2, {
        fill: colour,
        alpha,
      });
    }
  }

  /* ---- the cat row, once it has lifted ---- */
  if (row > 0.05) {
    const y = gy + slot(CAT) - row * cell * 0.9;
    s.text(gx - s.unit * 0.014, y + cell * 0.6, "cat", {
      size: s.unit * 0.024,
      fill: p.warn,
      alpha: row,
      mono: true,
      anchor: "end",
    });
    /* The three places a thousand real cats actually went. */
    const notable = [...primaryRow].sort((a, b) => b.count - a.count).slice(0, 3);
    notable.forEach((entry, k) => {
      const j = classNames.indexOf(entry.cls as (typeof classNames)[number]);
      if (j < 0) return;
      const x = gx + slot(j) + cell * 0.5;
      s.text(x, y - s.unit * 0.012, String(entry.count), {
        size: s.unit * 0.021,
        fill: k === 0 ? p.accent : p.warn,
        alpha: row * (1 - fan * 0.8),
        mono: true,
        anchor: "middle",
      });
    });
  }

  /* ---- per-class accuracy, fanned out below the grid ---- */
  if (fan > 0.02) {
    const by = gy + size + s.unit * (s.portrait ? 0.06 : 0.05);
    const bh = s.unit * (s.portrait ? 0.13 : 0.14);
    ACCURACY.forEach((acc, i) => {
      const on = beat(fan, (i / N) * 0.5, (i / N) * 0.5 + 0.5);
      if (on <= 0.02) return;
      const h = (acc / 100) * bh * on;
      const x = gx + slot(i);
      const extreme = acc === Math.max(...ACCURACY) || acc === Math.min(...ACCURACY);
      s.rect(x + cell * 0.18, by + bh - h, cell * 0.64, h, {
        fill: extreme ? p.ink : p.accent,
        alpha: on * (extreme ? 0.95 : 0.6),
      });
      if (extreme) {
        s.text(x + cell * 0.5, by + bh - h - s.unit * 0.012, acc.toFixed(1), {
          size: s.unit * 0.02,
          fill: p.ink,
          alpha: on,
          mono: true,
          anchor: "middle",
        });
        /* Above the bar, not below it: below, the ten labels sat on the frame's bottom edge. */
        s.text(x + cell * 0.5, by + bh - h - s.unit * 0.034, classNames[i], {
          size: s.unit * 0.018,
          fill: p.soft,
          alpha: on * 0.9,
          mono: true,
          anchor: "middle",
        });
      }
    });

    /* The headline, drawn across the ten it is the mean of. */
    if (mean > 0.02) {
      const my = by + bh - (result.testAccuracy / 100) * bh;
      s.line(gx, my, gx + size * mean, my, {
        stroke: p.warn,
        width: 2,
        alpha: mean,
        dash: [7, 5],
      });
      s.text(gx + size + s.unit * 0.012, my, `${result.testAccuracy}`, {
        size: s.unit * 0.026,
        fill: p.warn,
        alpha: mean,
        mono: true,
        baseline: "middle",
      });
    }
  }

  /* ---- the seam the model actually learned ---- */
  if (seam > 0.05) {
    const y = gy - s.unit * 0.03;
    s.text(gx, y, `vehicles ${structure.vehicleAccuracy}`, {
      size: s.unit * 0.024,
      fill: p.accent,
      alpha: seam,
      mono: true,
    });
    s.text(gx + size, y, `animals ${structure.animalAccuracy}`, {
      size: s.unit * 0.024,
      fill: p.warn,
      alpha: seam,
      mono: true,
      anchor: "end",
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row2 = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row2 * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (seam > 0.05) {
    say(`${(structure.withinGroupShare * 100).toFixed(0)}% of errors never leave their group`, seam, p.warn);
    say("the boundary it learned is not one of the ten", seam * 0.85, p.soft, 1);
  } else if (mean > 0.05) {
    say(`${result.testAccuracy} is the mean of these ten`, mean * (1 - seam * 0.8), p.warn);
    say(`spread ${structure.spread}`, mean * 0.8 * (1 - seam * 0.8), p.soft, 1);
  } else if (fan > 0.05) say(`${structure.worst} ${structure.worstAccuracy} · ${structure.best} ${structure.bestAccuracy}`, fan * (1 - mean * 0.8), p.ink);
  else if (row > 0.05) say("a thousand cats, and where they went", row * (1 - fan * 0.8), p.ink);
  else if (blocks > 0.05) say("vehicles and animals", blocks * (1 - row * 0.8), p.ink);
  else if (errors > 0.05) say("and everything it did not", errors * (1 - blocks * 0.8), p.warn);
  else if (diagonal > 0.05) say("what it got right", diagonal * (1 - errors * 0.8), p.accent);
  else say("ten classes, a thousand test images each", 1 - diagonal * 0.9, p.soft);
}

export const cifar: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3.2,
  portraitTravel: 2.7,
  rest: 0,
  label:
    "The tracked ten-by-ten confusion matrix, every cell a real count over a thousand test images per class. The diagonal lights, then the off-diagonal mass, then the grid separates into vehicles and animals; the cat row lifts clear, showing 335 correct against 291 sent to dog and 145 to frog. Per-class accuracy fans out beneath the grid from 33.5 for cat to 82.0 for automobile, with the headline 64.26 drawn across them as the mean it is, and the sequence closes on the split the model actually learned: 78 per cent on vehicles against 55.1 on animals, with 82 per cent of all errors staying inside their own group.",
  palette: palette("vision"),
  draw,
};
