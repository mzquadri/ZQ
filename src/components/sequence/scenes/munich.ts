import {
  axis,
  axisPercent,
  blockMonths,
  bootstrapDraws,
  dataset,
  marginSurvives,
  seriesTotal,
  testMonths,
  windows,
} from "@/content/munich-chapter";

import { beat, caption, focus, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * Munich accidents: one axis through zero, and which side an interval lands on.
 *
 * The object is a margin axis with zero on it, and the sequence puts two runs of one protocol on
 * that axis in turn. The published window clears zero. The same protocol run over two ordinary
 * years does not - its interval crosses it - and crossing zero is the finding, because an interval
 * spanning zero is a result that has not established its own sign.
 *
 *   rest   the axis, zero marked, and the published margin on it
 *   0.10   its interval opens
 *   0.26   the ordinary-years run arrives beneath it
 *   0.42   its interval opens too, and crosses zero
 *   0.56   how many of the seven series each window won
 *   0.70   why these are the block bootstrap bounds and not the narrower pair
 *   0.84   the data underneath both
 *
 * The intervals are the moving-block ones throughout. The repository runs both and says which to
 * believe: drawing months independently assumes monthly accident counts carry no memory, which is
 * false and makes the interval too narrow. Taking the narrower pair would have made the published
 * margin look better than its own author claims it is.
 */

const BANDS = {
  wide: { axis: 0.3, rows: 0.4, rowStep: 0.16, series: 0.72, note: 0.86 },
  tall: { axis: 0.24, rows: 0.33, rowStep: 0.14, series: 0.64, note: 0.8 },
} as const;

function draw(s: Surface, progress: number, p: Palette) {
  const published = beat(progress, 0.1, 0.24);
  const arrives = beat(progress, 0.26, 0.4);
  const crosses = beat(progress, 0.42, 0.54);
  const series = beat(progress, 0.56, 0.68);
  const why = beat(progress, 0.7, 0.82);
  const data = beat(progress, 0.84, 0.95);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const span = s.portrait ? s.w * 0.8 : f.r * 1.85;
  const x0 = s.portrait ? (s.w - span) / 2 : f.x - span * 0.5;
  const x1 = x0 + span;
  const type = s.unit * (s.portrait ? 0.02 : 0.017);
  const px = (value: number) => x0 + (axisPercent(value) / 100) * span;

  /* ---- the axis, and zero on it ---- */
  const ay = s.h * b.axis;
  s.line(x0, ay, x1, ay, { stroke: p.line, width: 1 });
  const zx = px(0);
  s.line(zx, ay - s.unit * 0.02, zx, s.h * (b.rows + b.rowStep) + s.unit * 0.05, {
    stroke: p.ink,
    width: 2,
    alpha: 0.85,
  });
  s.text(zx, ay - s.unit * 0.03, "0", {
    size: type * 0.9,
    fill: p.ink,
    alpha: 0.9,
    mono: true,
    anchor: "middle",
  });
  s.text(x0, ay - s.unit * 0.03, "worse than seasonal naive", {
    size: type * 0.78,
    fill: p.soft,
    alpha: 0.75,
    mono: true,
  });
  s.text(x1, ay - s.unit * 0.03, "better", {
    size: type * 0.78,
    fill: p.soft,
    alpha: 0.75,
    mono: true,
    anchor: "end",
  });

  /* ---- the two windows ---- */
  windows.forEach((window, i) => {
    const on = i === 0 ? 0.35 + published * 0.65 : arrives;
    if (on <= 0.02) return;
    const y = s.h * (b.rows + i * b.rowStep);
    const intervalOn = i === 0 ? published : crosses;
    const colour = window.clearsZero ? p.accent : p.warn;

    s.text(x0, y - s.unit * 0.03, window.label, {
      size: type * 0.85,
      fill: colour,
      alpha: on * 0.95,
      mono: true,
    });

    /* The interval first, as a band, then the point estimate on top of it. */
    if (intervalOn > 0.02) {
      const lo = px(window.low);
      const hi = px(window.high);
      const mid = px(window.margin);
      const left = mid + (lo - mid) * intervalOn;
      const right = mid + (hi - mid) * intervalOn;
      s.rect(left, y - s.unit * 0.016, right - left, s.unit * 0.032, {
        fill: colour,
        alpha: intervalOn * 0.2,
      });
      s.line(left, y, right, y, { stroke: colour, width: 2, alpha: intervalOn * 0.9 });
      for (const end of [left, right]) {
        s.line(end, y - s.unit * 0.014, end, y + s.unit * 0.014, {
          stroke: colour,
          width: 1.5,
          alpha: intervalOn * 0.9,
        });
      }
      s.text(left - s.unit * 0.01, y, window.low.toFixed(3), {
        size: type * 0.74,
        fill: p.soft,
        alpha: intervalOn * 0.85,
        mono: true,
        anchor: "end",
        baseline: "middle",
      });
      s.text(right + s.unit * 0.01, y, window.high.toFixed(3), {
        size: type * 0.74,
        fill: p.soft,
        alpha: intervalOn * 0.85,
        mono: true,
        baseline: "middle",
      });
    }

    s.circle(px(window.margin), y, s.unit * 0.009, { fill: colour, alpha: on });
    s.text(px(window.margin), y + s.unit * 0.03, window.margin.toFixed(4), {
      size: type * 0.9,
      fill: colour,
      alpha: on,
      mono: true,
      anchor: "middle",
    });

    /* The crossing, marked on the interval that does it. */
    if (!window.clearsZero && crosses > 0.3) {
      s.circle(zx, y, s.unit * 0.013, {
        stroke: p.warn,
        width: 2,
        alpha: (crosses - 0.3) / 0.7,
      });
    }
  });

  /* ---- how many series each window won ---- */
  if (series > 0.02) {
    const y = s.h * b.series;
    windows.forEach((window, i) => {
      const on = beat(series, i * 0.2, i * 0.2 + 0.7);
      if (on <= 0.02) return;
      const ry = y + i * s.unit * 0.04;
      const step = s.unit * 0.022;
      for (let k = 0; k < seriesTotal; k += 1) {
        const won = k < window.seriesWon;
        s.rect(x0 + k * step, ry, step * 0.7, s.unit * 0.014, {
          fill: won ? (window.clearsZero ? p.accent : p.warn) : p.line,
          alpha: on * (won ? 0.85 : 0.5),
        });
      }
      s.text(x0 + seriesTotal * step + s.unit * 0.01, ry + s.unit * 0.007, `${window.seriesWon} of ${seriesTotal} series`, {
        size: type * 0.78,
        fill: window.clearsZero ? p.accent : p.warn,
        alpha: on,
        mono: true,
        baseline: "middle",
      });
    });
  }

  /* ---- which bootstrap, and why ---- */
  if (why > 0.02) {
    s.text(x1, s.h * b.series, `${blockMonths}-month moving block, ${bootstrapDraws.toLocaleString("en-GB")} draws`, {
      size: type * 0.78,
      fill: p.soft,
      alpha: why * 0.9,
      mono: true,
      anchor: "end",
    });
    s.text(x1, s.h * b.series + s.unit * 0.028, "months carry memory, so the wider pair is the honest one", {
      size: type * 0.74,
      fill: p.soft,
      alpha: why * 0.8,
      mono: true,
      anchor: "end",
    });
  }

  /* ---- the data underneath ---- */
  if (data > 0.02) {
    s.text(x0, s.h * b.note, `${dataset.monthlyObservations} monthly observations, ${testMonths} months held out`, {
      size: type * 0.8,
      fill: p.soft,
      alpha: data * 0.9,
      mono: true,
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (data > 0.05) {
    say(`${dataset.firstYear} to ${dataset.lastYear}, one city`, data, p.soft);
  } else if (why > 0.05) {
    say("the narrower interval would have flattered it", why * (1 - data * 0.8), p.warn);
  } else if (series > 0.05) {
    say(`${windows[0].seriesWon} of ${seriesTotal}, then ${windows[1].seriesWon}`, series * (1 - why * 0.8), p.warn);
  } else if (crosses > 0.05) {
    say(marginSurvives ? "and it survives" : "the margin does not survive", crosses * (1 - series * 0.8), p.warn);
    say("an interval across zero has no sign", crosses * 0.85 * (1 - series * 0.8), p.soft, 1);
  } else if (arrives > 0.05) {
    say("the same protocol, ordinary years", arrives * (1 - crosses * 0.8), p.ink);
  } else if (published > 0.05) {
    say(`published margin ${windows[0].margin.toFixed(3)}`, published * (1 - arrives * 0.8), p.accent);
  } else {
    say("better than seasonal naive, or not", 1 - published * 0.9, p.soft);
  }

  /* The axis bounds are declared in the content module; referenced so they cannot drift. */
  void axis;
}

export const munich: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "One axis of improvement over a seasonal naive baseline, with zero drawn as a full-height line because which side of it a result lands on is the whole question. The published window, 2021 and 2022, sits at a margin of 0.2344 and its three-month moving-block bootstrap interval opens from 0.072 to 0.333, entirely clear of zero. The identical protocol run over 2018 and 2019 then arrives beneath it at a margin of minus 0.1553, and its interval opens from minus 0.368 to 0.069 - across zero, which is circled. An interval spanning zero has not established its own sign, so the published margin does not survive the move to ordinary years. How many of the seven series each window won follows, seven of seven against three of seven. The sequence notes that both intervals are the moving-block ones from ten thousand draws rather than the narrower independent pair, because monthly accident counts carry memory and the narrower interval would have flattered the published result, and closes on the data underneath: 1,932 monthly observations and 24 months held out.",
  palette: palette("graph"),
  draw,
};
