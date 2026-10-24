import {
  components,
  distinctSignals,
  duplicated,
  duplicatedWeight,
  formulas,
  independent,
  notPublished,
  weightText,
} from "@/content/supply-chain-chapter";

import { beat, caption, focus, mix, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * Supply chain: one bar, and two segments of it that are the same number.
 *
 * The object is the supplier scorecard's weighting, drawn at true proportion, and the sequence is
 * that bar discovering something about itself. Two of its five segments are normalised from
 * `on_time_rate` and from `1 - on_time_rate`, and inverting a min-max normalisation of one minus a
 * series returns the series exactly - so they are one signal under two names, carrying 55% of the
 * composite between them.
 *
 * The collapse is the whole drawing: the two segments slide together and merge, and what is left
 * is a four-signal scorecard where the largest independent component is 20%.
 *
 *   rest   the five weights at true proportion, as one bar
 *   0.10   what each one is normalised from
 *   0.24   the two that read the same column light
 *   0.40   they slide together and merge into one segment
 *   0.56   what the scorecard is actually left with
 *   0.70   the inventory formulas, which are classical and are not in question
 *   0.84   what the repository does not publish
 *
 * `duplicatedWeight` and `distinctSignals` are computed in the content module from the weights
 * themselves, so re-weighting the scorecard moves both the bar and the sentence under it.
 */

const BANDS = {
  wide: { bar: 0.26, barHeight: 0.1, sources: 0.46, formulas: 0.64, withheld: 0.78 },
  tall: { bar: 0.2, barHeight: 0.08, sources: 0.36, formulas: 0.64, withheld: 0.8 },
} as const;

function draw(s: Surface, progress: number, p: Palette) {
  const sources = beat(progress, 0.1, 0.22);
  const lit = beat(progress, 0.24, 0.36);
  const merge = beat(progress, 0.4, 0.54);
  const left = beat(progress, 0.56, 0.66);
  const classical = beat(progress, 0.7, 0.8);
  const withheld = beat(progress, 0.84, 0.95);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const barW = s.portrait ? s.w * 0.8 : f.r * 1.85;
  const x0 = s.portrait ? (s.w - barW) / 2 : f.x - barW * 0.5;
  const by = s.h * b.bar;
  const bh = s.h * b.barHeight;
  const type = s.unit * (s.portrait ? 0.021 : 0.018);

  /*
   * Lay the duplicated components out adjacently so they have somewhere to merge to.
   *
   * In `DEFAULT_WEIGHTS` they happen to be first and second already, but relying on that would
   * make the drawing silently wrong if the order ever changed. The two duplicates are placed
   * first explicitly, and the independents follow in their own order.
   */
  const order = [...duplicated, ...independent];
  const offsets: number[] = [];
  let run = 0;
  for (const component of order) {
    offsets.push(run);
    run += component.weight;
  }

  /* Where the merged segment ends up: the whole duplicated share, at the start of the bar. */
  const mergedWidth = duplicatedWeight * barW;

  order.forEach((component, i) => {
    const isDuplicate = Boolean(component.duplicate);
    const from = offsets[i] * barW;
    const width = component.weight * barW;

    /*
     * The second duplicate slides back over the first and both end as one block. The first stays
     * where it is and grows; the second shrinks to nothing as it arrives.
     */
    const x = isDuplicate && i === 1 ? mix(x0 + from, x0, merge) : x0 + from;
    const w = isDuplicate
      ? i === 0
        ? mix(width, mergedWidth, merge)
        : mix(width, 0, merge)
      : width;

    if (w <= 0.5) return;

    const emphasised = isDuplicate && lit > 0.15;
    s.rect(x, by, w, bh, {
      fill: emphasised ? p.warn : p.accent,
      alpha: emphasised ? 0.55 + lit * 0.2 : 0.4,
    });
    s.rect(x, by, w, bh, {
      stroke: emphasised ? p.warn : p.accent,
      width: 1,
      alpha: 0.9,
    });

    /* The percentage sits inside its own segment while there is room for it. */
    const pct = `${Math.round(component.weight * 100)}%`;
    const showMerged = isDuplicate && i === 0 && merge > 0.5;
    if (w > s.unit * 0.05) {
      s.text(x + w / 2, by + bh / 2, showMerged ? weightText.duplicated : pct, {
        size: type * (showMerged ? 1.3 : 1),
        fill: p.ink,
        alpha: 0.95,
        mono: true,
        anchor: "middle",
        baseline: "middle",
      });
    }

    /* Names below, angled out of each other's way by alternating the row. */
    const nameAlpha = isDuplicate && i === 1 ? 1 - merge : 1;
    if (nameAlpha > 0.02) {
      s.text(x + w / 2, by + bh + s.unit * 0.028 + (i % 2) * s.unit * 0.03, component.label, {
        size: type * 0.82,
        fill: emphasised ? p.warn : p.soft,
        alpha: nameAlpha * 0.95,
        mono: true,
        anchor: "middle",
      });
    }

    /*
     * What the two duplicated components are normalised from, which is the evidence for the whole
     * claim - and only those two.
     *
     * Listing the source of all five filled a hundred pixels with three lines nothing depends on,
     * and pushed the finding underneath into them. The other three components are not in
     * question; the bar already names them.
     */
    if (sources > 0.02 && isDuplicate && nameAlpha > 0.02) {
      const sy = s.h * b.sources + i * s.unit * 0.034;
      const on = beat(sources, i * 0.2, i * 0.2 + 0.7) * nameAlpha;
      if (on > 0.02) {
        s.text(x0, sy, component.label, {
          size: type * 0.82,
          fill: p.warn,
          alpha: on * 0.9,
          mono: true,
        });
        s.text(x0 + barW, sy, component.source, {
          size: type * 0.82,
          fill: p.warn,
          alpha: on,
          mono: true,
          anchor: "end",
        });
      }
    }
  });

  /* ---- what the scorecard is left with ---- */
  if (left > 0.02) {
    const y = s.h * (b.sources + 0.09);
    s.text(x0, y, `${distinctSignals} distinct signals, not ${components.length}`, {
      size: type * 1.15,
      fill: p.warn,
      alpha: left,
      mono: true,
    });
    s.text(x0, y + s.unit * 0.034, `largest independent component ${weightText.largestIndependent}`, {
      size: type * 0.88,
      fill: p.soft,
      alpha: left * 0.9,
      mono: true,
    });
  }

  /* ---- the classical formulas, which are not what is in question ---- */
  if (classical > 0.02) {
    const y = s.h * b.formulas;
    formulas.forEach((formula, i) => {
      const on = beat(classical, i * 0.2, i * 0.2 + 0.6);
      if (on <= 0.02) return;
      s.text(x0, y + i * s.unit * 0.034, formula.body, {
        size: type * 0.85,
        fill: p.accent,
        alpha: on * 0.9,
        mono: true,
      });
      s.text(x0 + barW, y + i * s.unit * 0.034, formula.label, {
        size: type * 0.8,
        fill: p.soft,
        alpha: on * 0.75,
        mono: true,
        anchor: "end",
      });
    });
  }

  /* ---- what is not published ---- */
  if (withheld > 0.02) {
    s.text(x0, s.h * b.withheld, `no dataset, no forecast artefact, no verified metric`, {
      size: type * 0.85,
      fill: p.warn,
      alpha: withheld * 0.9,
      mono: true,
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (withheld > 0.05) {
    say(`${notPublished.length} things it does not publish`, withheld, p.warn);
    say("the weights are in source, and checkable", withheld * 0.85, p.soft, 1);
  } else if (classical > 0.05) {
    say("the inventory maths is textbook", classical * (1 - withheld * 0.8), p.accent);
  } else if (left > 0.05) {
    say(`${weightText.duplicated} of the score is one signal`, left * (1 - classical * 0.8), p.warn);
  } else if (merge > 0.05) {
    say("one minus a series, normalised back", merge * (1 - left * 0.8), p.warn);
    say("is the series", merge * 0.85 * (1 - left * 0.8), p.soft, 1);
  } else if (lit > 0.05) {
    say("these two read the same column", lit * (1 - merge * 0.8), p.warn);
  } else if (sources > 0.05) {
    say("what each component is normalised from", sources * (1 - lit * 0.8), p.soft);
  } else {
    say(`${components.length} weighted components`, 1 - sources * 0.9, p.soft);
  }
}

export const supply: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "The supplier scorecard's five weights drawn as one bar at true proportion: delivery reliability at 30 per cent, quality at 25, cost efficiency at 20, lead time at 15 and flexibility at 10. The column each component is normalised from is then listed beside it, and two of them light: delivery reliability is min-max normalised from on-time rate ascending, and quality from late delivery rate descending, where late delivery rate is defined as one minus on-time rate. Inverting a min-max normalisation of one minus a series returns the series, so these are one signal under two names. The two segments slide together and merge into a single block carrying 55 per cent of the composite, leaving a scorecard with four distinct signals rather than five and a largest independent component of 20 per cent. The classical inventory formulas the repository implements follow - economic order quantity, safety stock and reorder point - as the part that is not in question, and the sequence closes on what the repository does not publish: no dataset, no forecast artefact and no verified business metric.",
  palette: palette("pipeline"),
  draw,
};
