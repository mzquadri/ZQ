import {
  bias,
  events,
  generator,
  generatorDefect,
  model,
  scores,
  split,
} from "@/content/flood-chapter";

import { beat, caption, clamp01, focus, mix, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * Flood LSTM: how little room there is, and how much of it the calendar already has.
 *
 * The object is one axis of R squared, drawn from zero to one, with the noise ceiling and four
 * methods marked on it. The composition is the argument: the ceiling and the three serious methods
 * land almost on top of each other near the right-hand end, and the axis is not truncated to make
 * that gap look larger than it is.
 *
 * Because it is not truncated, the gap has to be read some other way - so a magnified window opens
 * beneath it, labelled with how much it magnifies and over what range, which is the same device
 * the battery scene uses for the same reason. Honest plot, then a detail panel; never a rescaled
 * axis pretending to be the original.
 *
 *   rest   the full axis, the ceiling, and the four methods on it
 *   0.10   the ceiling: independent noise nothing can predict
 *   0.24   the calendar lookup - 365 numbers, no weather input
 *   0.38   the network
 *   0.50   the magnified window opens over the cluster
 *   0.64   what the network adds, in that window
 *   0.78   where the variance actually is
 *   0.90   the event half, where the bias is
 */

const BANDS = {
  wide: { axis: 0.26, detail: 0.5, detailHeight: 0.12, variance: 0.72, events: 0.88 },
  tall: { axis: 0.2, detail: 0.4, detailHeight: 0.1, variance: 0.64, events: 0.82 },
} as const;

/** The window the detail panel covers, chosen to contain the cluster and the ceiling. */
const DETAIL = { from: 0.89, to: 0.98 } as const;

const METHODS = [
  { key: "lstm", label: "LSTM", value: scores.lstm, lead: true },
  { key: "calendar", label: "calendar lookup", value: scores.calendar, lead: false },
  { key: "persistence", label: "yesterday's value", value: scores.persistence, lead: false },
  { key: "linear", label: "linear", value: scores.linear, lead: false },
] as const;

function draw(s: Surface, progress: number, p: Palette) {
  const ceiling = beat(progress, 0.1, 0.22);
  const calendar = beat(progress, 0.24, 0.36);
  const net = beat(progress, 0.38, 0.48);
  const zoom = beat(progress, 0.5, 0.62);
  const adds = beat(progress, 0.64, 0.76);
  const variance = beat(progress, 0.78, 0.88);
  const eventHalf = beat(progress, 0.9, 0.98);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const axisW = s.portrait ? s.w * 0.8 : f.r * 1.9;
  const x0 = s.portrait ? (s.w - axisW) / 2 : f.x - axisW * 0.5;
  const x1 = x0 + axisW;
  const type = s.unit * (s.portrait ? 0.021 : 0.018);
  const px = (value: number) => x0 + clamp01(value) * axisW;

  /* ---- the honest axis, zero to one ---- */
  const ay = s.h * b.axis;
  s.line(x0, ay, x1, ay, { stroke: p.line, width: 1.5 });
  for (let i = 0; i <= 10; i += 1) {
    const x = x0 + (i / 10) * axisW;
    s.line(x, ay, x, ay + s.unit * 0.012, { stroke: p.line, width: 1, alpha: 0.8 });
  }
  s.text(x0, ay + s.unit * 0.034, "0", { size: type * 0.85, fill: p.soft, alpha: 0.75, mono: true });
  s.text(x1, ay + s.unit * 0.034, "1", {
    size: type * 0.85,
    fill: p.soft,
    alpha: 0.75,
    mono: true,
    anchor: "end",
  });
  s.text(x0, ay - s.unit * 0.05, "R squared, axis not truncated", {
    size: type * 0.85,
    fill: p.soft,
    alpha: 0.85,
    mono: true,
  });

  /* The noise ceiling: nothing can go past it, so it is a wall rather than a mark. */
  {
    const on = 0.35 + ceiling * 0.65;
    const x = px(scores.ceiling);
    s.line(x, ay - s.unit * 0.04, x, ay + s.unit * 0.02, { stroke: p.ink, width: 2, alpha: on });
    s.text(x, ay - s.unit * 0.052, `ceiling ${scores.ceiling}`, {
      size: type * 0.82,
      fill: p.ink,
      alpha: on,
      mono: true,
      anchor: "end",
    });
  }

  METHODS.forEach((method, i) => {
    const on =
      method.key === "lstm" ? 0.3 + net * 0.7 : method.key === "calendar" ? 0.3 + calendar * 0.7 : 0.45;
    const x = px(method.value);
    s.circle(x, ay, s.unit * 0.008, { fill: method.lead ? p.accent : p.soft, alpha: on });
    /* Labels alternate above and below: four marks inside a tenth of the axis would collide. */
    const above = i % 2 === 0;
    s.text(x, ay + (above ? -s.unit * 0.022 : s.unit * 0.056), method.label, {
      size: type * 0.78,
      fill: method.lead ? p.accent : p.soft,
      alpha: on * 0.9,
      mono: true,
      anchor: "middle",
    });
  });

  /* ---- the magnified window ---- */
  if (zoom > 0.02) {
    const dy = s.h * b.detail;
    const dh = s.h * b.detailHeight;
    const magnification = Math.round(1 / (DETAIL.to - DETAIL.from));
    const dpx = (value: number) =>
      x0 + ((value - DETAIL.from) / (DETAIL.to - DETAIL.from)) * axisW;

    /* The window on the full axis, and the two leaders that show where it was cut from. */
    const wl = px(DETAIL.from);
    const wr = px(DETAIL.to);
    s.rect(wl, ay - s.unit * 0.018, (wr - wl) * zoom, s.unit * 0.036, {
      stroke: p.accent,
      width: 1,
      alpha: zoom * 0.8,
    });
    s.line(wl, ay + s.unit * 0.018, mix(wl, x0, zoom), dy - s.unit * 0.02, {
      stroke: p.accent,
      width: 1,
      alpha: zoom * 0.4,
    });
    s.line(wr, ay + s.unit * 0.018, mix(wr, x1, zoom), dy - s.unit * 0.02, {
      stroke: p.accent,
      width: 1,
      alpha: zoom * 0.4,
    });

    s.line(x0, dy, x1, dy, { stroke: p.line, width: 1.5, alpha: zoom });
    s.text(x0, dy - s.unit * 0.026, `${DETAIL.from} to ${DETAIL.to}, magnified ${magnification}x`, {
      size: type * 0.82,
      fill: p.accent,
      alpha: zoom * 0.9,
      mono: true,
    });

    const cx = dpx(scores.ceiling);
    s.line(cx, dy - dh * 0.5, cx, dy + dh * 0.3, { stroke: p.ink, width: 2, alpha: zoom });
    METHODS.forEach((method) => {
      if (method.value < DETAIL.from) return;
      const x = dpx(method.value);
      s.circle(x, dy, s.unit * 0.009, { fill: method.lead ? p.accent : p.soft, alpha: zoom });
      s.text(x, dy + s.unit * 0.03, String(method.value), {
        size: type * 0.8,
        fill: method.lead ? p.accent : p.soft,
        alpha: zoom * 0.9,
        mono: true,
        anchor: "middle",
      });
    });

    /* What the network adds over a table of 365 numbers, measured in that window. */
    if (adds > 0.02) {
      const from = dpx(scores.calendar);
      const to = dpx(scores.lstm);
      s.line(from, dy - dh * 0.42, from + (to - from) * adds, dy - dh * 0.42, {
        stroke: p.warn,
        width: 2.5,
        alpha: adds,
        cap: "round",
      });
      s.text((from + to) / 2, dy - dh * 0.55, `+${scores.lstm - scores.calendar > 0 ? "" : ""}${(scores.lstm - scores.calendar).toFixed(4)}`, {
        size: type * 0.95,
        fill: p.warn,
        alpha: adds,
        mono: true,
        anchor: "middle",
      });
    }
  }

  /* ---- where the variance actually is ---- */
  if (variance > 0.02) {
    const y = s.h * b.variance;
    const parts = [
      { label: "seasonal", share: generator.seasonalShare, colour: p.accent },
      { label: "rain", share: generator.rainShare, colour: p.soft },
      { label: "noise", share: generator.noiseShare, colour: p.warn },
    ];
    let run = 0;
    parts.forEach((part, i) => {
      const on = beat(variance, i * 0.2, i * 0.2 + 0.6);
      const w = part.share * axisW;
      if (on > 0.02) {
        s.rect(x0 + run, y, w * on, s.unit * 0.026, { fill: part.colour, alpha: on * 0.6 });
        s.text(x0 + run + (w * on) / 2, y + s.unit * 0.048, `${part.label} ${Math.round(part.share * 100)}%`, {
          size: type * 0.76,
          fill: part.colour,
          alpha: on * 0.9,
          mono: true,
          anchor: "middle",
        });
      }
      run += w;
    });
    s.text(x0, y - s.unit * 0.018, "share of the target's variance, by generator component", {
      size: type * 0.8,
      fill: p.soft,
      alpha: variance * 0.85,
      mono: true,
    });
  }

  /* ---- the event half ---- */
  if (eventHalf > 0.02) {
    const y = s.h * b.events;
    s.text(x0, y, `top ${events.total} days: F1 ${events.lstm.f1} against ${events.persistence.f1}`, {
      size: type * 0.85,
      fill: p.warn,
      alpha: eventHalf * 0.95,
      mono: true,
    });
    s.text(x1, y, `bias ${bias.aboveThreshold} above threshold`, {
      size: type * 0.85,
      fill: p.warn,
      alpha: eventHalf * 0.95,
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
  if (eventHalf > 0.05) {
    say("on the days that matter it under-predicts", eventHalf, p.warn);
  } else if (variance > 0.05) {
    say(`${Math.round(generator.seasonalShare * 100)}% of the signal is the calendar`, variance * (1 - eventHalf * 0.8), p.accent);
  } else if (adds > 0.05) {
    say(`the network adds ${(scores.lstm - scores.calendar).toFixed(4)}`, adds * (1 - variance * 0.8), p.warn);
    say(`over ${model.parameters.toLocaleString("en-GB")} parameters`, adds * 0.85 * (1 - variance * 0.8), p.soft, 1);
  } else if (zoom > 0.05) {
    say("the axis stays; the window magnifies", zoom * (1 - adds * 0.8), p.accent);
  } else if (net > 0.05) {
    say(`the LSTM, ${scores.lstm}`, net * (1 - zoom * 0.8), p.accent);
  } else if (calendar > 0.05) {
    say(`365 numbers get ${scores.calendar}`, calendar * (1 - net * 0.8), p.ink);
  } else if (ceiling > 0.05) {
    say(`nothing can pass ${scores.ceiling}`, ceiling * (1 - calendar * 0.8), p.ink);
  } else {
    say(`${generator.years} generated years, ${split.scoredRows} scored rows`, 1 - ceiling * 0.9, p.soft);
  }

  /* Referenced by the page's prose; kept imported so the two cannot drift apart silently. */
  void generatorDefect;
}

export const flood: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "One axis of R squared drawn from zero to one and deliberately not truncated. A wall marks the ceiling at 0.9691, which is the share of the target that is not independent noise and therefore cannot be predicted by anything. Four methods sit on the axis: a linear model far back at 0.701, and then yesterday's value at 0.9016, a calendar lookup of 365 daily means at 0.9025 and the LSTM at 0.9213, all three crowded into the last tenth. Because the axis is honest the gap cannot be read there, so a window over 0.89 to 0.98 opens beneath it, magnified eleven times and labelled as such, and in that window the distance between the calendar lookup and the network is drawn and measured: 0.0188, for 208,513 parameters against a table of 365 numbers. The generator's own variance decomposition follows - 77 per cent seasonal, 6 per cent rain, 3 per cent noise - which is why the calendar does so well. The sequence closes on the half that matters: on the top 54 days the network scores F1 0.74 against persistence's 0.741, and is biased 2.74 low above the threshold.",
  palette: palette("flow"),
  draw,
};
