import {
  amplitudeOrderRecovered,
  cities,
  dataset,
  humidityAllOneWay,
  humidityAxis,
  humidityMiss,
  tempAxis,
  tempMiss,
  text,
} from "@/content/weather-chapter";

import { beat, caption, focus, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * Weather EDA: two zero lines, and which side the marks land on.
 *
 * The object is a pair of zero-centred axes - one per recovered statistic - and six cities marked
 * on each. The whole argument is a question about sign. On the temperature axis the six misses
 * scatter either side of zero, which is what recovering a configured value looks like. On the
 * humidity axis every one of them lands on the same side, which is not.
 *
 * That asymmetry is the only finding in the project that was not put in by hand, so the scene is
 * built so the reader sees it as a shape rather than reads it as a sentence.
 *
 *   rest   the temperature axis, six cities scattered across zero
 *   0.10   each mark joined to the value the generator was configured with
 *   0.24   the humidity axis opens beneath it
 *   0.38   its six marks arrive - every one of them to the right of zero
 *   0.52   the bias is named, with the range it covers
 *   0.66   the ranking check: configured seasonal swing against recovered spread
 *   0.82   what this can establish, and what it cannot
 *
 * Both axes are half-widths from `@/content/weather-chapter`, chosen there as round numbers above
 * the data rather than fitted to it, so a mark that moved would run off its axis rather than
 * quietly rescale it.
 */

const BANDS = {
  wide: { temp: 0.28, humidity: 0.54, rank: 0.72 },
  tall: { temp: 0.22, humidity: 0.42, rank: 0.66 },
} as const;

function draw(s: Surface, progress: number, p: Palette) {
  const configured = beat(progress, 0.1, 0.22);
  const opens = beat(progress, 0.24, 0.36);
  const marks = beat(progress, 0.38, 0.5);
  const bias = beat(progress, 0.52, 0.64);
  const ranked = beat(progress, 0.66, 0.78);
  const limits = beat(progress, 0.82, 0.94);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const axisW = s.portrait ? s.w * 0.76 : f.r * 1.7;
  const x0 = s.portrait ? (s.w - axisW) / 2 : f.x - axisW * 0.5;
  const mid = x0 + axisW / 2;
  const type = s.unit * (s.portrait ? 0.021 : 0.018);

  /**
   * One zero-centred axis with the six cities on it.
   *
   * `alpha` carries the beat so the axis can be drawn before its marks arrive: the humidity axis
   * opens empty and then fills, which is what makes "every one of them, the same side" land as a
   * thing that happened rather than a thing that was always there.
   */
  const axis = (
    y: number,
    half: number,
    value: (c: (typeof cities)[number]) => number,
    unit: string,
    alpha: number,
    markAlpha: number,
    oneWay: boolean,
  ) => {
    if (alpha <= 0.02) return;
    s.line(x0, y, x0 + axisW, y, { stroke: p.line, width: 2, alpha });
    /* Zero is the claim being tested, so it is the only tick drawn full height. */
    s.line(mid, y - s.unit * 0.05, mid, y + s.unit * 0.05, {
      stroke: p.ink,
      width: 3,
      alpha: alpha * 0.85,
    });
    s.text(mid, y + s.unit * 0.072, "0", {
      size: type * 0.85,
      fill: p.ink,
      alpha: alpha * 0.8,
      mono: true,
      anchor: "middle",
    });
    s.text(x0, y + s.unit * 0.072, `-${half}${unit}`, {
      size: type * 0.8,
      fill: p.soft,
      alpha: alpha * 0.7,
      mono: true,
    });
    s.text(x0 + axisW, y + s.unit * 0.072, `+${half}${unit}`, {
      size: type * 0.8,
      fill: p.soft,
      alpha: alpha * 0.7,
      mono: true,
      anchor: "end",
    });

    if (markAlpha <= 0.02) return;
    cities.forEach((city, i) => {
      const on = beat(markAlpha, (i / cities.length) * 0.4, (i / cities.length) * 0.4 + 0.6);
      if (on <= 0.02) return;
      const v = value(city);
      const x = mid + (v / half) * (axisW / 2);
      const lift = (i % 2 === 0 ? -1 : 1) * s.unit * 0.026;
      s.circle(x, y, s.unit * 0.019, {
        fill: oneWay ? p.warn : p.accent,
        alpha: on * 0.95,
      });
      /*
       * Joined to zero rather than labelled with the number. The length of the leader is the
       * miss, which is the quantity, and the city name is what a reader needs to tell them apart.
       */
      if (configured > 0.02) {
        /*
         * A bar rather than a rule. The six humidity misses sit between 2.20 and 2.53 on an axis
         * six points wide, so the marks barely move and the leaders are most of what this figure
         * has to change with: measured as hairlines the whole scene read as static against the
         * reference chapters. Area, and the quantity is still the length.
         */
        const grow = on * configured;
        const thick = s.unit * 0.042;
        s.rect(Math.min(mid, x), y - thick * 0.5, Math.abs(x - mid) * grow, thick, {
          fill: oneWay ? p.warn : p.accent,
          alpha: grow * 0.7,
        });
      }
      /*
       * Named on the axis that scatters, unnamed on the axis that does not.
       *
       * The six humidity misses fall between 2.20 and 2.53 on an axis six points wide, so their
       * marks are nearly coincident and six labels printed over each other into an unreadable
       * smear. That they are indistinguishable *is* the finding, and the bracket below carries the
       * range, so naming them individually would cost legibility to say something the picture
       * already says better.
       */
      if (!oneWay) {
        s.text(x, y + lift, city.city, {
          size: type * 0.8,
          fill: p.soft,
          alpha: on * 0.9,
          mono: true,
          anchor: "middle",
          baseline: "middle",
        });
      }
    });
  };

  /* ---- temperature: the axis that behaves ---- */
  s.text(x0, s.h * b.temp - s.unit * 0.08, "mean temperature, recovered less configured", {
    size: type * 0.88,
    fill: p.soft,
    alpha: 0.85,
    mono: true,
  });
  axis(s.h * b.temp, tempAxis, tempMiss, "C", 1, 1, false);

  /* ---- humidity: the axis that does not ---- */
  if (opens > 0.02) {
    s.text(x0, s.h * b.humidity - s.unit * 0.08, "mean humidity, recovered less configured", {
      size: type * 0.88,
      fill: p.soft,
      alpha: opens * 0.85,
      mono: true,
    });
    axis(s.h * b.humidity, humidityAxis, humidityMiss, "pts", opens, marks, bias > 0.2);
  }

  /* ---- the bias, named ---- */
  if (bias > 0.02 && humidityAllOneWay) {
    const y = s.h * b.humidity;
    /*
     * The half of the axis nothing landed on.
     *
     * "Every one of them, the same direction" is a statement about an absence, and an absence is
     * hard to see among six marks that are nearly coincident anyway. Shading the side that stayed
     * empty draws the absence itself, and it is derived from `humidityAllOneWay` rather than
     * asserted, so a run that scattered would not shade anything.
     */
    const empty = s.unit * 0.13;
    s.rect(x0, y - empty, (mid - x0) * bias, empty * 2, { fill: p.line, alpha: bias * 0.55 });
    s.text(x0 + (mid - x0) / 2, y - empty - s.unit * 0.022, "no city landed here", {
      size: type * 0.8,
      fill: p.soft,
      alpha: bias * 0.8,
      mono: true,
      anchor: "middle",
    });
    const lo = mid + (Number(text.humidityLow) / humidityAxis) * (axisW / 2);
    const hi = mid + (Number(text.humidityHigh) / humidityAxis) * (axisW / 2);
    s.rect(lo, y - s.unit * 0.07, (hi - lo) * bias, s.unit * 0.14, {
      fill: p.warn,
      alpha: bias * 0.38,
    });
    s.text(hi + s.unit * 0.014, y, `+${text.humidityLow} to +${text.humidityHigh}`, {
      size: type * 0.9,
      fill: p.warn,
      alpha: bias,
      mono: true,
      baseline: "middle",
    });
  }

  /* ---- the ranking check ---- */
  if (ranked > 0.02) {
    const y = s.h * b.rank;
    const byAmp = [...cities].sort((a, c) => c.setAmp - a.setAmp);
    const bySd = [...cities].sort((a, c) => c.foundTempSd - a.foundTempSd);
    const step = (axisW * 0.6) / cities.length;
    byAmp.forEach((city, i) => {
      const on = beat(ranked, i * 0.1, i * 0.1 + 0.55);
      if (on <= 0.02) return;
      const to = bySd.findIndex((c) => c.city === city.city);
      const fromX = x0 + i * step + step / 2;
      const toX = x0 + to * step + step / 2;
      const height = s.unit * 0.05;
      s.line(fromX, y, toX, y + height * on, {
        stroke: amplitudeOrderRecovered ? p.accent : p.warn,
        width: 7,
        alpha: on * 0.85,
      });
      s.circle(fromX, y, s.unit * 0.009, { fill: p.soft, alpha: on });
      s.circle(toX, y + height * on, s.unit * 0.013, { fill: p.accent, alpha: on });
    });
    s.text(x0, y - s.unit * 0.022, "configured swing", {
      size: type * 0.8,
      fill: p.soft,
      alpha: ranked * 0.85,
      mono: true,
    });
    s.text(x0, y + s.unit * 0.086, "recovered spread", {
      size: type * 0.8,
      fill: p.accent,
      alpha: ranked * 0.85,
      mono: true,
    });
  }

  /* ---- what it can and cannot establish ---- */
  if (limits > 0.02) {
    s.text(x0, s.h * (b.rank + 0.14), `${dataset.records} generated records, seed ${dataset.seed}`, {
      size: type * 0.82,
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
    say("it recovers its own generator", limits, p.warn);
    say("which is the only thing it can check", limits * 0.85, p.soft, 1);
  } else if (ranked > 0.05) {
    say(
      amplitudeOrderRecovered ? "the ordering survives too" : "the ordering does not survive",
      ranked * (1 - limits * 0.8),
      amplitudeOrderRecovered ? p.accent : p.warn,
    );
  } else if (bias > 0.05) {
    say("every city, the same direction", bias * (1 - ranked * 0.8), p.warn);
    say("which is not noise", bias * 0.85 * (1 - ranked * 0.8), p.soft, 1);
  } else if (marks > 0.05) {
    say("humidity misses, all six", marks * (1 - bias * 0.8), p.warn);
  } else if (opens > 0.05) {
    say("the second statistic", opens * (1 - marks * 0.8), p.soft);
  } else if (configured > 0.05) {
    say(`temperature, within ${text.worstTemp}C`, configured * (1 - opens * 0.8), p.accent);
  } else {
    say(`${cities.length} cities, ${dataset.years} years`, 1 - configured * 0.9, p.soft);
  }
}

export const weather: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "Two zero-centred axes, each testing a statistic the exploratory analysis recovered against the value its generator was configured with. On the temperature axis the six cities scatter either side of zero, none of them further out than 0.09 degrees, which is what recovering a configured value looks like. A second axis then opens for humidity and its six marks all land on the same side of zero, between 2.20 and 2.53 points high - the same direction for every city, which is a bias rather than noise and is the only finding in the project that was not put there by hand. A ranking check follows, joining the cities ordered by configured seasonal swing to the same cities ordered by recovered spread, and the order is preserved. The sequence closes by naming what the whole exercise rests on: 21,900 generated records at a fixed seed, so what it can establish is that the analysis reads its own input correctly, and nothing about any real city.",
  palette: palette("graph"),
  draw,
};
