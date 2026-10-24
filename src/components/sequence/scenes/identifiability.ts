import {
  activations,
  comparison,
  diagnostics,
  figure,
  references,
  symmetries,
} from "@/content/identifiability-chapter";

import { beat, caption, focus, mix, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * Identifiability: one network, relabelled, and the question of whether it is the same one.
 *
 * The object is a pair of two-layer networks, and the sequence is the second one being built out
 * of the first in front of the reader - its hidden units sliding into a new order, then two of
 * them flipping sign. Both compute the same function afterwards, which is the whole subject: if
 * two networks agree on every input, their parameters need not be the same.
 *
 * The motion is the argument here more directly than in any other scene on the site. A
 * permutation is a thing that happens to positions, so it is drawn as positions moving.
 *
 *   rest   the two networks, the second already in its permuted order
 *   0.10   the relabelling, drawn as the correspondence between them
 *   0.26   the sign flips, on the matched pairs that carry them
 *   0.42   both are evaluated and agree
 *   0.58   an unrelated network goes through the same check and fails it
 *   0.72   what the diagnostics actually look for
 *   0.86   what the repository does not claim
 *
 * No number here is a measurement. The repository versions no configuration, no trained model and
 * no numerical finding, and says so; the four hidden units and the permutation `[2, 0, 3, 1]` are
 * a fixed layout for the drawing, declared as such in the content module.
 */

const BANDS = {
  wide: { nets: 0.34, netHeight: 0.3, checks: 0.72, notes: 0.88 },
  tall: { nets: 0.26, netHeight: 0.24, checks: 0.64, notes: 0.82 },
} as const;

function draw(s: Surface, progress: number, p: Palette) {
  const relabel = beat(progress, 0.1, 0.24);
  const signs = beat(progress, 0.26, 0.4);
  const agree = beat(progress, 0.42, 0.56);
  const fails = beat(progress, 0.58, 0.7);
  const diag = beat(progress, 0.72, 0.84);
  const notes = beat(progress, 0.86, 0.96);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const span = s.portrait ? s.w * 0.84 : f.r * 1.9;
  const x0 = s.portrait ? (s.w - span) / 2 : f.x - span * 0.5;
  const type = s.unit * (s.portrait ? 0.021 : 0.018);

  const netW = span * 0.4;
  const netTop = s.h * b.nets;
  const netH = s.h * b.netHeight;
  const unitY = (slot: number) => netTop + (slot + 0.5) * (netH / figure.hidden);

  /** One network: an input, four hidden units in some order, and an output. */
  const network = (
    left: number,
    order: readonly number[],
    flips: readonly boolean[],
    flipAmount: number,
    alpha: number,
  ) => {
    const inX = left;
    const hidX = left + netW * 0.45;
    const outX = left + netW;
    const midY = netTop + netH / 2;

    s.circle(inX, midY, s.unit * 0.02, { fill: p.raised, stroke: p.soft, width: 3, alpha: alpha * 0.9 });
    s.circle(outX, midY, s.unit * 0.02, { fill: p.raised, stroke: p.soft, width: 3, alpha: alpha * 0.9 });

    for (let unit = 0; unit < figure.hidden; unit += 1) {
      const slot = order.indexOf(unit);
      const y = unitY(slot);
      const flipped = flips[unit] ? flipAmount : 0;
      /* A sign flip is drawn as the pair of edges inverting, not as a colour change. */
      const edge = mix(1, -1, flipped);
      s.line(inX, midY, hidX, y, {
        stroke: edge < 0 ? p.warn : p.accent,
        width: 4,
        alpha: alpha * 0.8,
      });
      s.line(hidX, y, outX, midY, {
        stroke: edge < 0 ? p.warn : p.accent,
        width: 4,
        alpha: alpha * 0.8,
      });
      s.circle(hidX, y, s.unit * 0.028, {
        fill: flipped > 0.5 ? p.warn : p.raised,
        stroke: flipped > 0.5 ? p.warn : p.accent,
        width: 3,
        alpha,
      });
      s.text(hidX, y, String(unit + 1), {
        size: type * 1.05,
        fill: flipped > 0.5 ? p.ground : p.ink,
        alpha,
        mono: true,
        anchor: "middle",
        baseline: "middle",
      });
    }
  };

  /* The first network keeps the identity order; the second slides into the permuted one. */
  const identity = [0, 1, 2, 3];
  const moving = identity.map((_, i) => mix(i, figure.permutation.indexOf(i), relabel));
  const movingOrder = [...identity].sort((a, c) => moving[a] - moving[c]);

  network(x0, identity, [false, false, false, false], 0, 1);
  network(x0 + span - netW, movingOrder, figure.flipped, signs, 1);

  s.text(x0, netTop - s.unit * 0.026, "a network", {
    size: type * 0.9,
    fill: p.soft,
    alpha: 0.9,
    mono: true,
  });
  s.text(x0 + span, netTop - s.unit * 0.026, "the same function", {
    size: type * 0.9,
    fill: agree > 0.3 ? p.accent : p.soft,
    alpha: 0.9,
    mono: true,
    anchor: "end",
  });

  /* ---- the correspondence between them ---- */
  if (relabel > 0.02) {
    for (let unit = 0; unit < figure.hidden; unit += 1) {
      const fromY = unitY(unit);
      const toY = unitY(movingOrder.indexOf(unit));
      const fromX = x0 + netW * 0.45 + s.unit * 0.02;
      const toX = x0 + span - netW + netW * 0.45 - s.unit * 0.02;
      s.line(fromX, fromY, mix(fromX, toX, relabel), mix(fromY, toY, relabel), {
        stroke: p.soft,
        width: 2.5,
        alpha: relabel * 0.6,
        dash: [5, 6],
      });
    }
    s.text(
      x0 + span / 2,
      netTop + netH + s.unit * 0.04,
      symmetries.map((sym) => sym.label).join(", then "),
      {
        size: type * 0.82,
        fill: signs > 0.3 ? p.warn : p.soft,
        alpha: Math.max(relabel, signs) * 0.9,
        mono: true,
        anchor: "middle",
      },
    );
  }

  /* ---- the two comparisons ---- */
  if (agree > 0.02) {
    const y = s.h * b.checks;
    comparison.forEach((entry, i) => {
      const on = i === 0 ? agree : fails;
      if (on <= 0.02) return;
      const cy = y + i * s.unit * 0.05;
      s.circle(x0 + s.unit * 0.01, cy, s.unit * 0.014, {
        fill: entry.agrees ? p.accent : p.warn,
        alpha: on,
      });
      s.text(x0 + s.unit * 0.03, cy, entry.label, {
        size: type * 0.88,
        fill: p.ink,
        alpha: on * 0.95,
        mono: true,
        baseline: "middle",
      });
      s.text(x0 + span, cy, entry.agrees ? "agrees" : "rejected", {
        size: type * 0.88,
        fill: entry.agrees ? p.accent : p.warn,
        alpha: on,
        mono: true,
        anchor: "end",
        baseline: "middle",
      });
    });
  }

  /* ---- what the diagnostics look for ---- */
  if (diag > 0.02) {
    const y = s.h * (b.checks + 0.12);
    diagnostics.forEach((item, i) => {
      const on = beat(diag, i * 0.18, i * 0.18 + 0.6);
      if (on <= 0.02) return;
      s.text(x0, y + i * s.unit * 0.03, item, {
        size: type * 0.78,
        fill: p.soft,
        alpha: on * 0.85,
        mono: true,
      });
    });
  }

  /* ---- what is not claimed ---- */
  if (notes > 0.02) {
    s.text(x0, s.h * b.notes, `${activations.length} activation families, no trained model published`, {
      size: type * 0.82,
      fill: p.warn,
      alpha: notes * 0.9,
      mono: true,
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (notes > 0.05) {
    say(`the conditions live in ${references.length} cited papers`, notes, p.soft);
    say("not in this prototype", notes * 0.85, p.warn, 1);
  } else if (diag > 0.05) {
    say("finite checks, on sampled inputs", diag * (1 - notes * 0.8), p.soft);
  } else if (fails > 0.05) {
    say("and the check can fail", fails * (1 - diag * 0.8), p.warn);
  } else if (agree > 0.05) {
    say("same answers, every sampled input", agree * (1 - fails * 0.8), p.accent);
  } else if (signs > 0.05) {
    say("two of them flip sign", signs * (1 - agree * 0.8), p.warn);
  } else if (relabel > 0.05) {
    say("relabel the hidden units", relabel * (1 - signs * 0.8), p.ink);
  } else {
    say(`${figure.hidden} hidden units, in some order`, 1 - relabel * 0.9, p.soft);
  }
}

export const identifiability: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "Two small networks side by side, each an input, four hidden units and an output. As the sequence runs, the second network's hidden units slide into a new order - the permutation two, zero, three, one - with faint leaders showing which unit went where, and then two of them flip sign, drawn as their pair of edges inverting from the accent colour to the warning one. The two networks compute the same function afterwards, which is the subject: agreeing on every input does not make two parameter sets the same. Two checks are then listed, the permuted and sign-flipped network agreeing and an unrelated network being rejected by the same comparison, so the test is shown to be capable of failing. The diagnostics it runs follow - exact and near-exact hidden-unit clones, sampled non-degeneracy, inactive contributions on sampled inputs - and the sequence closes on what is not claimed: three activation families are implemented, no trained model or numerical finding is published, and the formal conditions live in the three cited papers rather than in this prototype.",
  palette: palette("corpus"),
  draw,
};
