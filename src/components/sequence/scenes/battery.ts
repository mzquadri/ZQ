import {
  benchmarkNeeds,
  capacity,
  detail,
  detailMagnification,
  generator,
  misread,
  misreadText,
  ocv,
  socRange,
  split,
  voltageBand,
} from "@/content/battery-chapter";

import { beat, caption, focus, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * Battery state of charge: two curves a few pixels apart, and what that gap costs.
 *
 * The object is the generator's own open-circuit-voltage curve, evaluated rather than drawn, at a
 * fresh cell and at the last cycle. Drawn honestly the two land almost on top of each other -
 * ageing lowers the whole curve by the same small amount at every state of charge - so the figure
 * keeps the honest plot and opens a magnified window beside it, labelled with how much it
 * magnifies and over what range. Exaggerating the gap would be a lie about the magnitude.
 *
 *   rest   the fresh curve, over the sampled range of charge
 *   0.10   the aged curve, at the last cycle
 *   0.24   how little separates them at this scale
 *   0.38   the magnified window opens
 *   0.52   what a gauge calibrated on the fresh curve reads instead
 *   0.66   the split, which is by cycle and is not shuffled
 *   0.82   what a benchmark would have to record before a score meant anything
 *
 * None of this is a battery measurement. The repository publishes none and says so; every curve
 * here is its deterministic demonstration generator, transcribed into the content module and
 * evaluated here.
 */

const BANDS = {
  wide: { plot: 0.22, plotHeight: 0.34, detail: 0.62, detailHeight: 0.14, needs: 0.96 },
  tall: { plot: 0.16, plotHeight: 0.26, detail: 0.5, detailHeight: 0.12, needs: 0.92 },
} as const;

const SAMPLES = 72;

function draw(s: Surface, progress: number, p: Palette) {
  const aged = beat(progress, 0.1, 0.22);
  const close = beat(progress, 0.24, 0.36);
  const zoom = beat(progress, 0.38, 0.5);
  const reads = beat(progress, 0.52, 0.64);
  const splitBeat = beat(progress, 0.66, 0.78);
  const needs = beat(progress, 0.82, 0.94);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const span = s.portrait ? s.w * 0.78 : f.r * 1.8;
  const x0 = s.portrait ? (s.w - span) / 2 : f.x - span * 0.5;
  const x1 = x0 + span;
  const type = s.unit * (s.portrait ? 0.02 : 0.017);

  const top = s.h * b.plot;
  const height = s.h * b.plotHeight;
  const bottom = top + height;
  const sx = (soc: number) => x0 + ((soc - socRange.from) / (socRange.to - socRange.from)) * span;
  const vy = (volts: number) =>
    bottom - ((volts - voltageBand.low) / (voltageBand.high - voltageBand.low)) * height;

  /** The generator's curve at a given cycle, evaluated at `SAMPLES` points. */
  const curve = (cycle: number): [number, number][] =>
    Array.from({ length: SAMPLES }, (_, i) => {
      const soc = socRange.from + (i / (SAMPLES - 1)) * (socRange.to - socRange.from);
      return [sx(soc), vy(ocv(soc, cycle))] as [number, number];
    });

  /* ---- the frame ---- */
  s.line(x0, bottom, x1, bottom, { stroke: p.line, width: 1 });
  s.line(x0, top, x0, bottom, { stroke: p.line, width: 1 });
  s.text(x0, bottom + s.unit * 0.034, "state of charge", {
    size: type * 0.82,
    fill: p.soft,
    alpha: 0.8,
    mono: true,
  });
  s.text(x0 - s.unit * 0.012, top, "volts", {
    size: type * 0.8,
    fill: p.soft,
    alpha: 0.75,
    mono: true,
    anchor: "end",
  });

  /* ---- the two curves, drawn to scale ---- */
  s.poly(curve(1), { stroke: p.accent, width: 2.5 });
  s.poly(curve(generator.cycles), { stroke: p.warn, width: 2, alpha: 0.4 + aged * 0.6 });
  s.text(x1, vy(ocv(socRange.to, 1)) - s.unit * 0.016, "cycle 1", {
    size: type * 0.8,
    fill: p.accent,
    alpha: 0.95,
    mono: true,
    anchor: "end",
  });
  if (aged > 0.02) {
    s.text(x1, vy(ocv(socRange.to, generator.cycles)) + s.unit * 0.04, `cycle ${generator.cycles}`, {
      size: type * 0.8,
      fill: p.warn,
      alpha: aged,
      mono: true,
      anchor: "end",
    });
  }

  /* ---- how little separates them ---- */
  if (close > 0.02) {
    const x = sx(misread.truth);
    s.line(x, vy(ocv(misread.truth, 1)), x, vy(ocv(misread.truth, generator.cycles)), {
      stroke: p.ink,
      width: 2,
      alpha: close,
    });
    s.text(x + s.unit * 0.012, (vy(ocv(misread.truth, 1)) + vy(ocv(misread.truth, generator.cycles))) / 2, `${misreadText.volts} V`, {
      size: type * 0.82,
      fill: p.ink,
      alpha: close,
      mono: true,
      baseline: "middle",
    });
  }

  /* ---- the magnified window ---- */
  if (zoom > 0.02) {
    const dy = s.h * b.detail;
    const dh = s.h * b.detailHeight;
    const dx = (soc: number) => x0 + ((soc - detail.from) / (detail.to - detail.from)) * span;
    /* The detail has its own voltage scale; it is a window, and it says so. */
    const lo = ocv(detail.from, generator.cycles);
    const hi = ocv(detail.to, 1);
    const dvy = (volts: number) => dy + dh - ((volts - lo) / (hi - lo)) * dh;

    const wl = sx(detail.from);
    const wr = sx(detail.to);
    s.rect(wl, top, (wr - wl) * zoom, height, { stroke: p.accent, width: 1, alpha: zoom * 0.6 });
    /* Anchored right: the plot's own axis label sits at `x0` on this exact baseline, and the two
     * printed over each other into an unreadable smear. */
    s.text(x1, dy - s.unit * 0.026, `${detail.from} to ${detail.to} of charge, magnified ${detailMagnification}x`, {
      size: type * 0.8,
      fill: p.accent,
      alpha: zoom * 0.9,
      mono: true,
      anchor: "end",
    });

    const detailCurve = (cycle: number): [number, number][] =>
      Array.from({ length: SAMPLES }, (_, i) => {
        const soc = detail.from + (i / (SAMPLES - 1)) * (detail.to - detail.from);
        return [dx(soc), dvy(ocv(soc, cycle))] as [number, number];
      });
    /*
     * The band between the two curves, filled.
     *
     * This region is the whole of what ageing costs, and at the magnification the window already
     * declares it is the one thing in the figure with any area to it. Drawn as two strokes the
     * detail panel changed under a per cent end to end against the reference chapters' three to
     * five; what a reader is meant to see is a gap opening, and a gap is a region.
     */
    s.poly([...detailCurve(1), ...detailCurve(generator.cycles).reverse()], {
      fill: p.warn,
      close: true,
      alpha: zoom * 0.28,
    });
    s.poly(detailCurve(1), { stroke: p.accent, width: 2.5, alpha: zoom });
    s.poly(detailCurve(generator.cycles), { stroke: p.warn, width: 2.5, alpha: zoom });

    /* What a lookup built on the fresh curve gives away when the cell has aged. */
    if (reads > 0.02) {
      const trueX = dx(misread.truth);
      const readX = dx(misread.reads);
      const v = ocv(misread.truth, generator.cycles);
      s.line(trueX, dvy(ocv(misread.truth, 1)), trueX, dvy(v), {
        stroke: p.ink,
        width: 1.5,
        alpha: reads * 0.7,
        dash: [3, 3],
      });
      s.line(trueX, dvy(v), trueX + (readX - trueX) * reads, dvy(v), {
        stroke: p.ink,
        width: 2.5,
        alpha: reads,
        cap: "round",
      });
      s.circle(readX, dvy(v), s.unit * 0.008, { fill: p.ink, alpha: reads });
      s.text((trueX + readX) / 2, dvy(v) - s.unit * 0.018, `${misreadText.points} points of charge`, {
        size: type * 0.9,
        fill: p.ink,
        alpha: reads,
        mono: true,
        anchor: "middle",
      });
      s.text(trueX, dy + dh + s.unit * 0.026, `${misread.atSoc}% true`, {
        size: type * 0.76,
        fill: p.soft,
        alpha: reads * 0.9,
        mono: true,
        anchor: "middle",
      });
      s.text(readX, dy + dh + s.unit * 0.026, `reads ${misreadText.reads}%`, {
        size: type * 0.76,
        fill: p.ink,
        alpha: reads * 0.9,
        mono: true,
        anchor: "middle",
      });
    }
  }

  /* ---- the split, which is by cycle ---- */
  if (splitBeat > 0.02) {
    const y = s.h * (b.detail + b.detailHeight + 0.1);
    const w = span * ((generator.cycles - split.testCycles) / generator.cycles);
    s.rect(x0, y, w * splitBeat, s.unit * 0.018, { fill: p.accent, alpha: splitBeat * 0.5 });
    s.rect(x0 + w, y, (span - w) * splitBeat, s.unit * 0.018, { fill: p.warn, alpha: splitBeat * 0.6 });
    s.text(x0, y + s.unit * 0.038, `cycles ${split.trainFrom} to ${split.trainTo}`, {
      size: type * 0.76,
      fill: p.accent,
      alpha: splitBeat * 0.9,
      mono: true,
    });
    s.text(x1, y + s.unit * 0.038, `${split.testCycles} held out, not shuffled`, {
      size: type * 0.76,
      fill: p.warn,
      alpha: splitBeat * 0.9,
      mono: true,
      anchor: "end",
    });
  }

  /* ---- what a benchmark would need ---- */
  if (needs > 0.02) {
    s.text(x0, s.h * b.needs, `${benchmarkNeeds.length} things a score would have to record first`, {
      size: type * 0.8,
      fill: p.warn,
      alpha: needs * 0.9,
      mono: true,
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (needs > 0.05) {
    say("no benchmark is published, deliberately", needs, p.warn);
  } else if (splitBeat > 0.05) {
    say("split by cycle, never shuffled", splitBeat * (1 - needs * 0.8), p.accent);
  } else if (reads > 0.05) {
    say(`the gauge gives away ${misreadText.points} points`, reads * (1 - splitBeat * 0.8), p.ink);
  } else if (zoom > 0.05) {
    say(`magnified ${detailMagnification}x, and labelled`, zoom * (1 - reads * 0.8), p.accent);
  } else if (close > 0.05) {
    say(`${misreadText.volts} volts, at half charge`, close * (1 - zoom * 0.8), p.ink);
  } else if (aged > 0.05) {
    say(`${capacity.fadePercent}% of capacity gone by cycle ${generator.cycles}`, aged * (1 - close * 0.8), p.warn);
  } else {
    say("the generator's own voltage curve", 1 - aged * 0.9, p.soft);
  }
}

export const battery: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "The synthetic generator's open-circuit-voltage curve, evaluated rather than sketched, drawn across the sampled range of state of charge. A second curve is added for the last cycle, and at this scale the two are nearly indistinguishable - ageing lowers the whole curve by the same amount at every state of charge - so the distance between them at half charge is marked and labelled as 0.020 volts. Because the honest plot cannot show what that costs, a magnified window opens beneath it over 0.44 to 0.56 of charge, labelled with its magnification. In that window a gauge calibrated on the fresh curve is traced: at a true 50 per cent the aged cell sits lower, and reading that voltage against the fresh lookup returns 47.6 per cent instead, giving away 2.4 points of charge. The temporal split follows - the last fifty cycles held out, by cycle number, nothing shuffled, because two samples a second apart inside one discharge are nearly the same row. The sequence closes on the seven things the repository says a benchmark would have to record before any score meant anything, none of which it publishes.",
  palette: palette("steel"),
  draw,
};
