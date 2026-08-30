import {
  configuration,
  failure,
  importances,
  lag1Autocorrelation,
  models,
  overview,
  overviewMax,
  overviewMin,
  split,
  topTwoShare,
  zoom,
} from "@/content/streamflow-world";

import {
  beat,
  caption,
  focus,
  mix,
  palette,
  type Palette,
  type SceneDefinition,
} from "../scene";
import type { Surface } from "../surface";

/**
 * Streamflow: a very good score, and the reason it is not impressive.
 *
 * The chapter above this one is also a line on a pair of axes, so this one has to be built to look
 * nothing like it. Hydrology is a static functional relationship with intervals projected through
 * it, vertically. This is a long horizontal ribbon of time with a window pulled out of it, and it
 * ends on a bar chart rather than a curve - because the bar chart is the actual finding.
 *
 *   rest   fifteen years of synthetic daily flow, and where the holdout begins
 *   0.08   one window is taken out of the test period
 *   0.20   the window is magnified: observed flow, day by day
 *   0.32   features are cut from it - seven lags, three rolling windows, 26 in all
 *   0.44   the prediction arrives on top of the observation
 *   0.56   and it is very close. R2 0.9786, MAE 2.865
 *   0.68   the top decile of flow is marked
 *   0.78   there, the model comes in under the peak
 *   0.88   and the reason: two features carry 94% of it, both of them yesterday's river
 *
 * One step ahead, and no further. There is no horizon, no forecast interval and no uncertainty
 * band in this scene, because the repository makes none of those claims: test features include
 * discharge observed at prior timestamps, and lag-1 autocorrelation on this series is 0.9941. The
 * final frame exists to make the score legible rather than impressive.
 */

const XGB = models.find((m) => m.key === "xgboost")!;
const SERIES = overview as readonly (readonly number[])[];
const WINDOW = zoom as readonly (readonly number[])[];

function draw(s: Surface, progress: number, p: Palette) {
  const pick = beat(progress, 0.08, 0.17);
  const magnify = beat(progress, 0.2, 0.3);
  const features = beat(progress, 0.32, 0.42);
  const predict = beat(progress, 0.44, 0.54);
  const close = beat(progress, 0.56, 0.64);
  const peaks = beat(progress, 0.68, 0.76);
  const under = beat(progress, 0.78, 0.86);
  const lean = beat(progress, 0.88, 0.98);

  const f = focus(s);

  /* ---- the full record, as a ribbon ---- */
  const rw = s.portrait ? s.w * 0.8 : f.r * 1.75;
  const rx = s.portrait ? (s.w - rw) / 2 : f.x - rw * 0.44;
  const ry = s.portrait ? f.y - f.r * 0.72 : f.y - f.r * 0.78;
  const rh = s.unit * (s.portrait ? 0.12 : 0.15);
  const range = overviewMax - overviewMin;

  const ribbon: [number, number][] = SERIES.map((row) => [
    rx + row[0] * rw,
    ry + rh - ((row[1] - overviewMin) / range) * rh,
  ]);
  s.poly(ribbon, { stroke: p.soft, width: 1, alpha: 0.55 - magnify * 0.2 });

  /* Where the holdout starts. Chronological, never shuffled. */
  const splitX = rx + split.frac * rw;
  s.line(splitX, ry - s.unit * 0.012, splitX, ry + rh + s.unit * 0.012, {
    stroke: p.soft,
    width: 1,
    alpha: 0.5,
    dash: [4, 4],
  });
  s.text(splitX + s.unit * 0.008, ry - s.unit * 0.018, `${split.testYears}-year holdout`, {
    size: s.unit * 0.019,
    fill: p.soft,
    alpha: 0.7,
    mono: true,
  });

  /* ---- the window taken out of it ---- */
  const winX = rx + 0.9 * rw;
  const winW = rw * 0.08;
  if (pick > 0.02) {
    s.rect(winX, ry - s.unit * 0.008, winW, rh + s.unit * 0.016, {
      stroke: p.accent,
      width: 1.4,
      alpha: pick,
    });
  }

  /* ---- magnified: observed, then predicted on top of it ---- */
  const zw = s.portrait ? s.w * 0.8 : f.r * 1.75;
  const zx = s.portrait ? (s.w - zw) / 2 : f.x - zw * 0.44;
  const zy0 = s.portrait ? f.y - f.r * 0.32 : f.y - f.r * 0.28;
  const zh = s.unit * (s.portrait ? 0.24 : 0.3);

  if (magnify > 0.02) {
    /* The window opening out into the magnified panel. */
    /*
     * These two lines are the window opening out. They are the motion, not the picture, so they
     * withdraw once the magnified panel has arrived - left up, they read as two stray diagonals
     * crossing the whole frame.
     */
    const open = magnify * (1 - features);
    if (open > 0.02) {
      s.line(winX, ry + rh, mix(winX, zx, magnify), mix(ry + rh, zy0, magnify), {
        stroke: p.accent,
        width: 1,
        alpha: open * 0.4,
      });
      s.line(winX + winW, ry + rh, mix(winX + winW, zx + zw, magnify), mix(ry + rh, zy0, magnify), {
        stroke: p.accent,
        width: 1,
        alpha: open * 0.4,
      });
    }

    const vals = WINDOW.map((r) => r[1]);
    const lo = Math.min(...vals) - 4;
    const hi = Math.max(...vals) + 4;
    const zpy = (v: number) => zy0 + zh - ((v - lo) / (hi - lo)) * zh;

    const shown = Math.max(2, Math.floor(WINDOW.length * magnify));
    const obs: [number, number][] = WINDOW.slice(0, shown).map((r) => [zx + r[0] * zw, zpy(r[1])]);
    s.poly(obs, { stroke: p.ink, width: 1.6, alpha: 0.9 });

    /* The top decile, marked where it actually is. */
    if (peaks > 0.02) {
      const py = zpy(failure.peakThreshold);
      if (py > zy0 && py < zy0 + zh) {
        s.line(zx, py, zx + zw, py, { stroke: p.warn, width: 1, alpha: peaks * 0.6, dash: [5, 4] });
        s.text(zx + zw, py - s.unit * 0.012, `top decile · ${failure.peakThreshold}`, {
          size: s.unit * 0.019,
          fill: p.warn,
          alpha: peaks * 0.85,
          mono: true,
          anchor: "end",
        });
      }
    }

    if (predict > 0.02) {
      const pn = Math.max(2, Math.floor(WINDOW.length * predict));
      const pred: [number, number][] = WINDOW.slice(0, pn).map((r) => [zx + r[0] * zw, zpy(r[2])]);
      s.poly(pred, { stroke: p.accent, width: 1.6, alpha: 0.95 });

      /* Where it sits under the peak. Drawn only at the days that are actually in the top decile. */
      if (under > 0.02) {
        WINDOW.forEach((r) => {
          if (r[1] < failure.peakThreshold) return;
          const x = zx + r[0] * zw;
          s.line(x, zpy(r[1]), x, zpy(r[2]), { stroke: p.warn, width: 2, alpha: under * 0.8 });
        });
      }
    }
  }

  /* ---- features cut from the window ---- */
  if (features > 0.02 && lean < 0.3) {
    const fy = zy0 + zh + s.unit * 0.05;
    const lags = configuration.lags;
    lags.forEach((lag, i) => {
      const on = beat(features, i / lags.length * 0.5, i / lags.length * 0.5 + 0.5);
      const x = zx + (i + 0.5) * (zw / lags.length);
      s.line(x, fy, x, fy + s.unit * 0.03 * on, {
        stroke: p.accent,
        width: 1.4,
        alpha: on * 0.7 * (1 - lean * 3),
      });
      s.text(x, fy + s.unit * 0.052, String(lag), {
        size: s.unit * 0.018,
        fill: p.soft,
        alpha: on * 0.7 * (1 - lean * 3),
        mono: true,
        anchor: "middle",
      });
    });
    s.text(zx, fy + s.unit * 0.052, `${configuration.features} features`, {
      size: s.unit * 0.019,
      fill: p.soft,
      alpha: features * 0.8 * (1 - lean * 3),
      mono: true,
      anchor: "end",
    });
  }

  /* ---- the reason: two bars, and six that barely exist ---- */
  if (lean > 0.02) {
    const bw = s.portrait ? s.w * 0.74 : f.r * 1.5;
    const bx = s.portrait ? (s.w - bw) / 2 : f.x - bw * 0.42;
    const by = zy0 + zh + s.unit * 0.07;
    const bh = s.unit * (s.portrait ? 0.15 : 0.17);
    const step = bw / importances.length;
    importances.forEach((imp, i) => {
      const on = beat(lean, i / importances.length * 0.4, i / importances.length * 0.4 + 0.6);
      const h = imp.value * bh * 2 * on;
      const x = bx + i * step;
      const dominant = i < 2;
      s.rect(x, by + bh - h, step * 0.62, h, {
        fill: dominant ? p.warn : p.accent,
        alpha: on * (dominant ? 0.95 : 0.6),
      });
      if (dominant) {
        s.text(x + step * 0.31, by + bh - h - s.unit * 0.014, imp.value.toFixed(4), {
          size: s.unit * 0.02,
          fill: p.warn,
          alpha: on,
          mono: true,
          anchor: "middle",
        });
        s.text(x + step * 0.31, by + bh + s.unit * 0.028, `lag ${i + 1}`, {
          size: s.unit * 0.019,
          fill: p.warn,
          alpha: on,
          mono: true,
          anchor: "middle",
        });
      }
    });
    s.line(bx, by + bh, bx + bw, by + bh, { stroke: p.line, width: 1, alpha: lean });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (lean > 0.05) {
    say(`two features carry ${(topTwoShare * 100).toFixed(0)}% of it`, lean, p.warn);
    say(`lag-1 autocorrelation ${lag1Autocorrelation}`, lean * 0.85, p.soft, 1);
  } else if (under > 0.05) {
    say(`under the peak by ${Math.abs(failure.peakBias).toFixed(2)} on average`, under * (1 - lean * 0.8), p.warn);
    say(`worst ${failure.worstError} at ${failure.worstObserved}`, under * 0.8 * (1 - lean * 0.8), p.soft, 1);
  } else if (peaks > 0.05) say(`the top decile carries ${(failure.peakShareOfSquaredError * 100).toFixed(0)}% of the squared error`, peaks * (1 - under * 0.8), p.ink);
  else if (close > 0.05) {
    say(`R2 ${XGB.r2} · MAE ${XGB.mae}`, close * (1 - peaks * 0.8), p.ink);
    say("one step ahead. no horizon.", close * 0.8 * (1 - peaks * 0.8), p.soft, 1);
  } else if (predict > 0.05) say("one step ahead", predict * (1 - close * 0.8), p.ink);
  else if (features > 0.05) say(`lags ${configuration.lags.slice(0, 4).join(", ")} and more`, features * (1 - predict * 0.8), p.ink);
  else if (magnify > 0.05) say("120 days of the holdout", magnify * (1 - features * 0.8), p.ink);
  else if (pick > 0.05) say("one window out of the test period", pick * (1 - magnify * 0.8), p.ink);
  else say(`${split.trainYears} years train · ${split.testYears} years held out`, 1 - pick * 0.9, p.soft);
}

export const streamflow: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3.6,
  portraitTravel: 2.9,
  rest: 0,
  label:
    "Fifteen years of synthetic daily streamflow drawn as a ribbon, with the two-year chronological holdout marked. A 120-day window is taken out of the test period and magnified; lag and rolling-window features are cut from it, and a one-step-ahead prediction is laid over the observation, matching it closely at an R-squared of 0.9786. The top decile of flow is then marked, and the model is shown coming in under every peak in it. The sequence ends on the feature importances, where lag-1 and lag-2 together carry 94 per cent of the model, against a lag-1 autocorrelation of 0.9941.",
  palette: palette("pipeline"),
  draw,
};
