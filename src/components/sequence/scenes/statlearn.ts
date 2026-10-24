import {
  baseline,
  correctOf,
  gradientChecks,
  ledger,
  learningRate,
  runs,
  searchMarginPoints,
  testPoints,
  text,
} from "@/content/statlearn-chapter";

import { beat, caption, clamp01, focus, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * Statistical learning: an axis ruled in the only unit it can resolve.
 *
 * The object is an accuracy axis with sixty ticks on it, one per held-out point, and that ruling
 * is the whole argument. Every accuracy in the report is a count of correct answers out of sixty,
 * so the axis cannot distinguish anything finer than one tick - and the gap the report's most
 * interesting result turns on is exactly one tick wide.
 *
 *   rest   the ruler, and the five runs marked on it
 *   0.10   the majority class drawn as a wall across the axis
 *   0.24   the untouched configuration, which does not clear it
 *   0.38   the learning-rate sweep, four orders of magnitude
 *   0.52   Bayesian optimisation against random search, one tick apart
 *   0.66   the two independent checks on the hand-derived gradients
 *   0.82   the ledger underneath all of it
 *
 * A marker walks the runs in the order the report reaches them, so the sequence is read as a
 * sequence of attempts rather than as a finished table.
 */

const BANDS = {
  wide: { ruler: 0.3, runs: 0.38, runStep: 0.062, checks: 0.69, ledger: 0.86 },
  tall: { ruler: 0.22, runs: 0.29, runStep: 0.055, checks: 0.62, ledger: 0.8 },
} as const;

/* The axis covers the whole range a count out of sixty can take. */
const AXIS = { from: 0.3, to: 0.85 } as const;

function draw(s: Surface, progress: number, p: Palette) {
  const wall = beat(progress, 0.1, 0.22);
  const below = beat(progress, 0.24, 0.36);
  const swept = beat(progress, 0.38, 0.5);
  const margin = beat(progress, 0.52, 0.64);
  const checks = beat(progress, 0.66, 0.78);
  const led = beat(progress, 0.82, 0.94);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const axisW = s.portrait ? s.w * 0.78 : f.r * 1.8;
  const x0 = s.portrait ? (s.w - axisW) * 0.58 : f.x - axisW * 0.46;
  const x1 = x0 + axisW;
  const type = s.unit * (s.portrait ? 0.021 : 0.018);
  const px = (accuracy: number) =>
    x0 + clamp01((accuracy - AXIS.from) / (AXIS.to - AXIS.from)) * axisW;

  /* ---- the ruler: one tick per held-out point ---- */
  const ry = s.h * b.ruler;
  for (let i = 0; i <= testPoints; i += 1) {
    const accuracy = i / testPoints;
    if (accuracy < AXIS.from || accuracy > AXIS.to) continue;
    const x = px(accuracy);
    const major = i % 5 === 0;
    s.line(x, ry, x, ry + s.unit * (major ? 0.018 : 0.01), {
      stroke: p.line,
      width: 1,
      alpha: major ? 0.9 : 0.5,
    });
  }
  s.line(x0, ry, x1, ry, { stroke: p.line, width: 1 });
  /* The axis is truncated, so it says where it starts: the bars are read against the ticks. */
  s.text(x0, ry + s.unit * 0.034, AXIS.from.toFixed(2), {
    size: type * 0.8,
    fill: p.soft,
    alpha: 0.7,
    mono: true,
  });
  s.text(x1, ry + s.unit * 0.034, AXIS.to.toFixed(2), {
    size: type * 0.8,
    fill: p.soft,
    alpha: 0.7,
    mono: true,
    anchor: "end",
  });
  s.text(x0, ry - s.unit * 0.014, `one tick is one of ${testPoints} held-out points`, {
    size: type * 0.85,
    fill: p.soft,
    alpha: 0.85,
    mono: true,
  });

  /* ---- the majority-class wall ---- */
  {
    const on = 0.3 + wall * 0.7;
    const x = px(baseline.accuracy);
    s.line(x, ry, x, s.h * (b.runs + b.runStep * runs.length), {
      stroke: p.ink,
      width: 2,
      alpha: on * 0.85,
    });
    s.text(x + s.unit * 0.01, ry + s.unit * 0.03, `${correctOf(baseline)}/${testPoints} by guessing`, {
      size: type * 0.85,
      fill: p.ink,
      alpha: on,
      mono: true,
    });
  }

  /*
   * The runs, in the order the report reaches them, with a marker walking down the list.
   *
   * The walk is what makes this a sequence of attempts rather than a finished table: at any scroll
   * position exactly one run is current, and the reader arrives at the one-tick margin having just
   * watched four earlier attempts land.
   */
  const current = Math.min(runs.length - 1, Math.floor(progress * runs.length));
  runs.forEach((run, i) => {
    const y = s.h * (b.runs + i * b.runStep);
    const x = px(run.accuracy);
    const isCurrent = i === current;
    const failing = run.accuracy < baseline.accuracy;
    const colour = run.kind === "baseline" ? p.ink : failing ? p.warn : p.accent;

    /* The bar runs from the axis floor to the run's accuracy, so length is the count. */
    s.rect(x0, y, x - x0, s.unit * 0.02, {
      fill: colour,
      alpha: (isCurrent ? 0.55 : 0.25) * (run.kind === "baseline" ? 0.5 : 1),
    });
    s.circle(x, y + s.unit * 0.01, s.unit * (isCurrent ? 0.009 : 0.006), {
      fill: colour,
      alpha: isCurrent ? 1 : 0.7,
    });
    s.text(x0 - s.unit * 0.014, y + s.unit * 0.01, run.label, {
      size: type * 0.85,
      fill: isCurrent ? p.ink : p.soft,
      alpha: isCurrent ? 1 : 0.7,
      mono: true,
      anchor: "end",
      baseline: "middle",
    });
    s.text(x + s.unit * 0.012, y + s.unit * 0.01, `${correctOf(run)}/${testPoints}`, {
      size: type * 0.9,
      fill: colour,
      alpha: isCurrent ? 1 : 0.75,
      mono: true,
      baseline: "middle",
    });

    /* The untouched configuration, marked as below the wall rather than merely low. */
    if (run.key === "default" && below > 0.02) {
      s.line(x, y + s.unit * 0.01, px(baseline.accuracy), y + s.unit * 0.01, {
        stroke: p.warn,
        width: 2,
        alpha: below,
        dash: [4, 3],
      });
      s.text(x, y - s.unit * 0.016, `${text.belowBaseline} below doing nothing`, {
        size: type * 0.82,
        fill: p.warn,
        alpha: below,
        mono: true,
      });
    }

    /* The sweep, labelled with the factor rather than the rate. */
    if (run.key === "sweep" && swept > 0.02) {
      s.text(x + s.unit * 0.012, y + s.unit * 0.032, `learning rate x${text.lrFactor}`, {
        size: type * 0.8,
        fill: p.accent,
        alpha: swept * 0.9,
        mono: true,
      });
    }
  });

  /* ---- the one-tick margin between the two searches ---- */
  if (margin > 0.02) {
    const bayes = runs.findIndex((r) => r.key === "bayes");
    const random = runs.findIndex((r) => r.key === "random");
    const yb = s.h * (b.runs + bayes * b.runStep) + s.unit * 0.01;
    const yr = s.h * (b.runs + random * b.runStep) + s.unit * 0.01;
    const xb = px(runs[bayes].accuracy);
    const xr = px(runs[random].accuracy);
    s.poly(
      [
        [xb, yb],
        [xb + (xr - xb) * margin, yb],
        [xb + (xr - xb) * margin, yr],
        [xr, yr],
      ],
      { stroke: p.warn, width: 2, alpha: margin },
    );
    s.text(xr + s.unit * 0.014, (yb + yr) / 2, `${searchMarginPoints} test point`, {
      size: type * 0.95,
      fill: p.warn,
      alpha: margin,
      mono: true,
      baseline: "middle",
    });
  }

  /* ---- the two gradient checks ---- */
  if (checks > 0.02) {
    const y = s.h * b.checks;
    gradientChecks.forEach((check, i) => {
      const on = beat(checks, i * 0.25, i * 0.25 + 0.6);
      if (on <= 0.02) return;
      /*
       * On a log scale, because the two differ by eight orders of magnitude and that distance is
       * the finding: one is limited by a step size, the other is float64 round-off.
       */
      const decades = Math.log10(check.value);
      const span = (decades + 20) / 12;
      s.rect(x0, y + i * s.unit * 0.04, axisW * clamp01(span) * on, s.unit * 0.014, {
        fill: i === 0 ? p.accent : p.soft,
        alpha: on * 0.7,
      });
      s.text(x0, y + i * s.unit * 0.04 - s.unit * 0.012, check.label, {
        size: type * 0.78,
        fill: p.soft,
        alpha: on * 0.85,
        mono: true,
      });
      s.text(x1, y + i * s.unit * 0.04 + s.unit * 0.007, check.value.toExponential(1), {
        size: type * 0.82,
        fill: i === 0 ? p.accent : p.soft,
        alpha: on,
        mono: true,
        anchor: "end",
        baseline: "middle",
      });
    });
  }

  /* ---- the ledger underneath ---- */
  if (led > 0.02) {
    s.text(x0, s.h * b.ledger, `${ledger.values} reported values, ${ledger.problems} problems, none transcribed`, {
      size: type * 0.85,
      fill: p.accent,
      alpha: led * 0.9,
      mono: true,
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (led > 0.05) {
    say("every number traced to the cell that made it", led, p.accent);
  } else if (checks > 0.05) {
    say("the hand-derived gradients, checked twice", checks * (1 - led * 0.8), p.accent);
  } else if (margin > 0.05) {
    say(`the clever search lost by ${searchMarginPoints} point`, margin * (1 - checks * 0.8), p.warn);
    say("which this axis cannot resolve further", margin * 0.85 * (1 - checks * 0.8), p.soft, 1);
  } else if (swept > 0.05) {
    say(`the rate was wrong by ${text.lrFactor}x`, swept * (1 - margin * 0.8), p.accent);
  } else if (below > 0.05) {
    say("the default settings lose to guessing", below * (1 - swept * 0.8), p.warn);
  } else if (wall > 0.05) {
    say(`${correctOf(baseline)} of ${testPoints}, with no model at all`, wall * (1 - below * 0.8), p.ink);
  } else {
    say(`${testPoints} held-out points`, 1 - wall * 0.9, p.soft);
  }

  /* Keeps the import used while the rate itself is only ever shown as a factor. */
  void learningRate;
}

export const statlearn: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "An accuracy axis ruled at one tick per held-out point, sixty of them, which is the finest distinction the coursework's test set can make. Five runs are marked against it as counts rather than percentages. A wall is drawn where guessing the majority class lands, at 32 of 60, and the untouched default configuration sits below it - 23 of 60, losing to having no model at all. A learning-rate sweep of four orders of magnitude lifts it to 47. Bayesian optimisation and a random search of the same budget then land one tick apart, 47 against 48, with the random search ahead: a margin this axis cannot resolve any further. Two independent checks on the hand-derived backpropagation follow on a log scale, eight orders of magnitude apart, because one is limited by a finite-difference step size and the other is float64 round-off. The sequence closes on the provenance ledger underneath all of it: 126 reported values across 11 problems, none of them transcribed by hand.",
  palette: palette("corpus"),
  draw,
};
