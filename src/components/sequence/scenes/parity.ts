import { closestGap, config, corpus, exactTie, parity, sample, sampleMax } from "@/content/parity-chapter";

import { beat, caption, focus, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * BM25 parity: five scores, and the four thousandths between the top two.
 *
 * The object is one real ranking from the committed parity fixture, drawn as bars. The sequence
 * magnifies the gap between the first two until it is visible, because that gap - 0.004211 on
 * scores near eighteen - is the entire reason the Java side keeps the Python loop order, refuses
 * an inverted index and uses StrictMath.log. A few units in the last place would swap this pair,
 * and the test compares order exactly rather than within a tolerance.
 *
 *   rest   the five hits of the first fixture question, by BM25 score
 *   0.10   the scores, to six decimal places
 *   0.24   the top two separate out
 *   0.38   magnified until the gap is a visible distance
 *   0.52   what is compared exactly, and what is allowed a tolerance
 *   0.66   the exact tie elsewhere in the fixture, which is the limiting case
 *   0.80   the parameters, and the corpus the fixture was built from
 *
 * The identifiers are shortened for display and the question is the fixture's first, verbatim.
 */

const BANDS = {
  wide: { bars: 0.26, barStep: 0.072, detail: 0.64, rules: 0.8, corpus: 0.92 },
  tall: { bars: 0.2, barStep: 0.06, detail: 0.56, rules: 0.72, corpus: 0.86 },
} as const;

function draw(s: Surface, progress: number, p: Palette) {
  const scored = beat(progress, 0.1, 0.22);
  const separate = beat(progress, 0.24, 0.36);
  const magnified = beat(progress, 0.38, 0.5);
  const rules = beat(progress, 0.52, 0.64);
  const tie = beat(progress, 0.66, 0.78);
  const context = beat(progress, 0.8, 0.92);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const span = s.portrait ? s.w * 0.8 : f.r * 1.85;
  const x0 = s.portrait ? (s.w - span) / 2 : f.x - span * 0.5;
  const x1 = x0 + span;
  const type = s.unit * (s.portrait ? 0.02 : 0.017);
  const barW = span * 0.62;

  /* ---- the five hits ---- */
  sample.hits.forEach((hit, i) => {
    const y = s.h * (b.bars + i * b.barStep);
    const w = (hit.score / sampleMax) * barW;
    const top = i < 2;
    /* The top two lift apart slightly so the pair being compared reads as a pair. */
    const lift = top ? (i === 0 ? -1 : 1) * separate * s.unit * 0.014 : 0;
    s.rect(x0, y + lift, w, s.unit * 0.03, {
      fill: top ? p.accent : p.soft,
      alpha: top ? 0.4 + separate * 0.25 : 0.3,
    });
    s.text(x0 + s.unit * 0.008, y + lift + s.unit * 0.015, `${hit.rank}  ${hit.form}`, {
      size: type * 0.82,
      fill: p.ink,
      alpha: 0.9,
      mono: true,
      baseline: "middle",
    });
    if (scored > 0.02) {
      s.text(x0 + w + s.unit * 0.012, y + lift + s.unit * 0.015, hit.score.toFixed(6), {
        size: type * 0.88,
        fill: top ? p.accent : p.soft,
        alpha: scored,
        mono: true,
        baseline: "middle",
      });
    }
  });

  /* ---- the gap, magnified until it is a distance ---- */
  if (magnified > 0.02) {
    const dy = s.h * b.detail;
    /*
     * The magnified window is drawn as its own axis with its own label, never as a rescaling of
     * the bars above. The bars stay honest; the window says what it is.
     */
    const factor = Math.round(sampleMax / closestGap);
    s.line(x0, dy, x1, dy, { stroke: p.line, width: 1, alpha: magnified });
    const a = x0 + span * 0.2;
    const c2 = a + span * 0.5 * magnified;
    s.circle(a, dy, s.unit * 0.009, { fill: p.accent, alpha: magnified });
    s.circle(c2, dy, s.unit * 0.009, { fill: p.accent, alpha: magnified });
    s.line(a, dy, c2, dy, { stroke: p.accent, width: 2.5, alpha: magnified, cap: "round" });
    s.text((a + c2) / 2, dy - s.unit * 0.022, String(closestGap), {
      size: type * 1.2,
      fill: p.accent,
      alpha: magnified,
      mono: true,
      anchor: "middle",
    });
    s.text(x0, dy + s.unit * 0.032, `the top two, magnified about ${factor.toLocaleString("en-GB")}x`, {
      size: type * 0.8,
      fill: p.soft,
      alpha: magnified * 0.85,
      mono: true,
    });
  }

  /* ---- what is exact, and what has a tolerance ---- */
  if (rules > 0.02) {
    const y = s.h * b.rules;
    s.text(x0, y, "order: compared exactly", {
      size: type * 0.95,
      fill: p.accent,
      alpha: rules,
      mono: true,
    });
    s.text(x1, y, `scores: within ${parity.scoreTolerance}`, {
      size: type * 0.95,
      fill: p.soft,
      alpha: rules,
      mono: true,
      anchor: "end",
    });
  }

  /* ---- the exact tie ---- */
  if (tie > 0.02) {
    const y = s.h * b.rules + s.unit * 0.042;
    s.text(x0, y, `${exactTie.questionId}: two chunks at ${exactTie.score}`, {
      size: type * 0.82,
      fill: p.warn,
      alpha: tie * 0.95,
      mono: true,
    });
  }

  /* ---- the fixture and the corpus ---- */
  if (context > 0.02) {
    const y = s.h * b.corpus;
    s.text(x0, y, `${parity.questions} questions, ${parity.chunks} chunks, k1 ${config.k1} b ${config.b}`, {
      size: type * 0.8,
      fill: p.soft,
      alpha: context * 0.9,
      mono: true,
    });
    s.text(x1, y, corpus.citation, {
      size: type * 0.8,
      fill: p.soft,
      alpha: context * 0.8,
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
  if (context > 0.05) {
    say(`${parity.questions} rankings, compared position by position`, context, p.soft);
  } else if (tie > 0.05) {
    say("elsewhere, two chunks tie exactly", tie * (1 - context * 0.8), p.warn);
    say("which is the limiting case", tie * 0.85 * (1 - context * 0.8), p.soft, 1);
  } else if (rules > 0.05) {
    say("the order has no tolerance", rules * (1 - tie * 0.8), p.accent);
  } else if (magnified > 0.05) {
    say(`${closestGap} apart`, magnified * (1 - rules * 0.8), p.accent);
    say("a few units in the last place would swap them", magnified * 0.85 * (1 - rules * 0.8), p.soft, 1);
  } else if (separate > 0.05) {
    say("the pair most at risk", separate * (1 - magnified * 0.8), p.accent);
  } else if (scored > 0.05) {
    say("one real ranking from the fixture", scored * (1 - separate * 0.8), p.ink);
  } else {
    say(`${sample.hits.length} hits, by BM25`, 1 - scored * 0.9, p.soft);
  }
}

export const parityScene: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "The first question in the committed parity fixture and its five BM25 hits, drawn as bars in rank order with their scores to six decimal places: 18.337068 for a dwelling-form chunk, 18.332857 for a general-property one, then 16.510989, 15.009405 and 14.320981. The top two lift apart as the pair most at risk of swapping, and a magnified window opens beneath the bars - the bars themselves are never rescaled - showing the gap between them as a visible distance and labelling it 0.004211, about four thousand times smaller than the largest score on the chart. The rules the parity test applies follow: order is compared exactly, scores are allowed a relative tolerance of 1e-12. Then the limiting case, a question elsewhere in the fixture where two chunks score identically to every digit a double carries. The sequence closes on the scope of the comparison - fifty questions, 314 chunks, k1 1.5 and b 0.75 - and on the corpus it was built from, the NFIP standard flood insurance policy forms at 44 CFR Part 61.",
  palette: palette("corpus"),
  draw,
};
