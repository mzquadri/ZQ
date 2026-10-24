import { axis, axisPercent, coverage, euCarShare, rail, source, spread } from "@/content/modal-split-chapter";

import { beat, caption, focus, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * Eurostat modal split: two spans on one axis.
 *
 * The object is a single axis of car share, and the whole argument is a comparison of two
 * distances drawn on it. One is what twenty-four years of European transport policy moved the EU
 * aggregate: half a point. The other is how far apart two countries are in a single year: thirty
 * points. Putting both on the same axis is the finding, and it is why the axis is one axis rather
 * than two panels.
 *
 *   rest   the axis, and the EU aggregate at both ends of the comparison
 *   0.10   the span those twenty-four years cover
 *   0.26   the countries open across the same axis
 *   0.42   the spread between the highest and the lowest, in one year
 *   0.58   the two spans drawn against each other
 *   0.72   Germany's position in that distribution
 *   0.86   where rail did gain, and the largest single gain
 *
 * The axis starts at 60 rather than 0 because every observed value is above it. That is a
 * decision, so the scene states it on the axis rather than leaving it to be noticed.
 */

const BANDS = {
  wide: { axis: 0.3, countries: 0.46, compare: 0.66, rail: 0.86 },
  tall: { axis: 0.24, countries: 0.4, compare: 0.6, rail: 0.8 },
} as const;

function draw(s: Surface, progress: number, p: Palette) {
  const moved = beat(progress, 0.1, 0.24);
  const opens = beat(progress, 0.26, 0.4);
  const spreadBeat = beat(progress, 0.42, 0.56);
  const compare = beat(progress, 0.58, 0.7);
  const germany = beat(progress, 0.72, 0.84);
  const railBeat = beat(progress, 0.86, 0.96);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const axisW = s.portrait ? s.w * 0.8 : f.r * 1.9;
  const x0 = s.portrait ? (s.w - axisW) / 2 : f.x - axisW * 0.5;
  const x1 = x0 + axisW;
  const type = s.unit * (s.portrait ? 0.02 : 0.017);
  const px = (share: number) => x0 + (axisPercent(share) / 100) * axisW;

  /* ---- the axis, with its truncation declared ---- */
  const ay = s.h * b.axis;
  s.line(x0, ay, x1, ay, { stroke: p.line, width: 1.5 });
  for (let v = axis.min; v <= axis.max; v += 10) {
    const x = px(v);
    s.line(x, ay, x, ay + s.unit * 0.012, { stroke: p.line, width: 1, alpha: 0.8 });
    s.text(x, ay + s.unit * 0.034, String(v), {
      size: type * 0.8,
      fill: p.soft,
      alpha: 0.75,
      mono: true,
      anchor: "middle",
    });
  }
  s.text(x0, ay - s.unit * 0.09, `car share of inland passenger transport, axis from ${axis.min}`, {
    size: type * 0.85,
    fill: p.soft,
    alpha: 0.85,
    mono: true,
  });

  /* ---- the EU aggregate at both ends ---- */
  {
    const from = px(euCarShare.from);
    const to = px(euCarShare.to);
    const on = 0.4 + moved * 0.6;
    s.circle(from, ay, s.unit * 0.008, { fill: p.soft, alpha: on });
    s.circle(to, ay, s.unit * 0.009, { fill: p.accent, alpha: on });
    /* Half a point apart on this axis is six pixels, so the two years stagger rather than collide. */
    s.text(from, ay - s.unit * 0.042, String(euCarShare.fromYear), {
      size: type * 0.8,
      fill: p.soft,
      alpha: on,
      mono: true,
      anchor: "middle",
    });
    s.text(to, ay - s.unit * 0.024, String(euCarShare.toYear), {
      size: type * 0.8,
      fill: p.accent,
      alpha: on,
      mono: true,
      anchor: "middle",
    });
    if (moved > 0.02) {
      s.text(to + s.unit * 0.016, ay, `+${euCarShare.changePoints} in ${euCarShare.years} years`, {
        size: type * 0.9,
        fill: p.accent,
        alpha: moved,
        mono: true,
        baseline: "middle",
      });
    }
  }

  /* ---- the countries, across the same axis ---- */
  if (opens > 0.02) {
    const cy = s.h * b.countries;
    const lo = px(spread.lowest.share);
    const hi = px(spread.highest.share);
    s.line(lo, cy, lo + (hi - lo) * opens, cy, {
      stroke: p.warn,
      width: 2.5,
      alpha: opens * 0.9,
      cap: "round",
    });
    s.circle(lo, cy, s.unit * 0.008, { fill: p.warn, alpha: opens });
    s.circle(lo + (hi - lo) * opens, cy, s.unit * 0.008, { fill: p.warn, alpha: opens });
    s.text(lo, cy + s.unit * 0.028, `${spread.lowest.country} ${spread.lowest.share}`, {
      size: type * 0.8,
      fill: p.warn,
      alpha: opens * 0.95,
      mono: true,
    });
    if (spreadBeat > 0.02) {
      s.text(hi, cy + s.unit * 0.028, `${spread.highest.country} ${spread.highest.share}`, {
        size: type * 0.8,
        fill: p.warn,
        alpha: spreadBeat * 0.95,
        mono: true,
        anchor: "end",
      });
      s.text((lo + hi) / 2, cy - s.unit * 0.022, `${spread.points} points, in ${coverage.comparisonYear}`, {
        size: type * 1.05,
        fill: p.warn,
        alpha: spreadBeat,
        mono: true,
        anchor: "middle",
      });
    }
  }

  /*
   * The two spans, against each other and from a common origin.
   *
   * This is the one place the drawing leaves the axis, because the comparison is between two
   * lengths rather than between two positions, and reading a length is much harder when the two
   * start in different places.
   */
  if (compare > 0.02) {
    const y = s.h * b.compare;
    const scale = axisW / (axis.max - axis.min);
    const policy = euCarShare.changePoints * scale;
    const border = spread.points * scale;
    s.rect(x0, y, border * compare, s.unit * 0.024, { fill: p.warn, alpha: compare * 0.6 });
    s.text(x0 + border + s.unit * 0.012, y + s.unit * 0.012, `${spread.points} across countries`, {
      size: type * 0.85,
      fill: p.warn,
      alpha: compare,
      mono: true,
      baseline: "middle",
    });
    const y2 = y + s.unit * 0.05;
    s.rect(x0, y2, Math.max(policy * compare, 1.5), s.unit * 0.024, {
      fill: p.accent,
      alpha: compare * 0.8,
    });
    s.text(x0 + Math.max(policy, s.unit * 0.01) + s.unit * 0.012, y2 + s.unit * 0.012, `${euCarShare.changePoints} over ${euCarShare.years} years`, {
      size: type * 0.85,
      fill: p.accent,
      alpha: compare,
      mono: true,
      baseline: "middle",
    });
  }

  /* ---- Germany's position ---- */
  if (germany > 0.02) {
    const x = px(spread.germany.share);
    const cy = s.h * b.countries;
    s.line(x, cy - s.unit * 0.02, x, cy + s.unit * 0.02, {
      stroke: p.ink,
      width: 2,
      alpha: germany,
    });
    s.text(x, cy + s.unit * 0.052, `Germany ${spread.germany.share}, ${spread.germany.rank} of ${spread.germany.of}`, {
      size: type * 0.8,
      fill: p.ink,
      alpha: germany,
      mono: true,
      anchor: "middle",
    });
  }

  /* ---- where rail gained ---- */
  if (railBeat > 0.02) {
    s.text(x0, s.h * b.rail, `rail gained in ${rail.gainedIn} of ${rail.of}, most in ${rail.largest.country} at +${rail.largest.points}`, {
      size: type * 0.82,
      fill: p.accent,
      alpha: railBeat * 0.9,
      mono: true,
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (railBeat > 0.05) {
    say("the movement that did happen", railBeat, p.accent);
    say("was national, not continental", railBeat * 0.85, p.soft, 1);
  } else if (germany > 0.05) {
    say(`Germany is ${spread.germany.rank}th of ${spread.germany.of}`, germany * (1 - railBeat * 0.8), p.ink);
  } else if (compare > 0.05) {
    say(`${Math.round(spread.points / euCarShare.changePoints)} times the policy span`, compare * (1 - germany * 0.8), p.warn);
  } else if (spreadBeat > 0.05) {
    say(`${spread.points} points apart, in one year`, spreadBeat * (1 - compare * 0.8), p.warn);
  } else if (opens > 0.05) {
    say(`${coverage.countries} countries, same axis`, opens * (1 - spreadBeat * 0.8), p.soft);
  } else if (moved > 0.05) {
    say(`${euCarShare.years} years moved it ${euCarShare.changePoints}`, moved * (1 - opens * 0.8), p.accent);
  } else {
    say(`${source.publisher} ${source.dataset}`, 1 - moved * 0.9, p.soft);
  }
}

export const modalSplit: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "One axis of car share of inland passenger transport, running from 60 to 100 with the truncation stated on the axis because every observed value lies above 60. The EU aggregate is marked at both ends of the comparison, 82.0 in 2000 and 82.5 in 2024, and the distance between them is labelled as half a point in twenty-four years. A second span then opens across the same axis for a single year, from Hungary at 66.9 to Montenegro at 97.8, which is 30.9 points. The two distances are then redrawn from a common origin so their lengths can be compared directly, and the country spread is about sixty-two times the policy span. Germany is marked at 84.1, twelfth of thirty-four. The sequence closes on the movement that did occur: rail gained share in 14 of 32 countries, the largest single gain being Switzerland at 7.3 points.",
  palette: palette("flow"),
  draw,
};
