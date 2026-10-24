import {
  exclusivePercent,
  outcomes,
  splits,
  task,
  templateCount,
  text,
  tracks,
  vocabulary,
} from "@/content/nlp-chapter";

import { beat, caption, focus, mix, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * News classification: a junction with three exits, one of them deliberately shut.
 *
 * The object is the loader's branch. A request for AG News has three possible outcomes and the
 * interesting one is the default: when the download fails the loader raises rather than quietly
 * substituting the synthetic fixture it ships. The fixture is reachable only by saying so on the
 * command line.
 *
 * The second half of the scene is why. The fixture's vocabulary is counted per class, and 86 per
 * cent of its words appear in exactly one class - so a bag of words separates it perfectly and any
 * score measured on it would be a description of the template list rather than a result.
 *
 *   rest   the junction, its three exits, and the request entering it
 *   0.10   the default exit lights: raises, and stops
 *   0.24   the gated exit, reachable only with --synthetic
 *   0.38   the fixture's four classes open as vocabulary bars
 *   0.52   the exclusive share of each, and the total
 *   0.68   the two tracks the project compares, evaluated the same way
 *   0.82   the split discipline
 *
 * A token travels the junction as the reader scrolls, taking the default exit, which is what makes
 * the refusal something that happens rather than something labelled.
 */

const BANDS = {
  wide: { junction: 0.26, exits: 0.2, bars: 0.52, barHeight: 0.16, tracks: 0.78 },
  tall: { junction: 0.2, exits: 0.16, bars: 0.44, barHeight: 0.14, tracks: 0.72 },
} as const;

function draw(s: Surface, progress: number, p: Palette) {
  const stops = beat(progress, 0.1, 0.22);
  const gated = beat(progress, 0.24, 0.36);
  const opens = beat(progress, 0.38, 0.5);
  const share = beat(progress, 0.52, 0.64);
  const compared = beat(progress, 0.68, 0.78);
  const discipline = beat(progress, 0.82, 0.94);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const width = s.portrait ? s.w * 0.8 : f.r * 1.8;
  const x0 = s.portrait ? (s.w - width) / 2 : f.x - width * 0.5;
  const x1 = x0 + width;
  const type = s.unit * (s.portrait ? 0.021 : 0.018);

  /* ---- the junction ---- */
  const jx = x0 + width * 0.3;
  const jy = s.h * b.junction;
  s.line(x0, jy, jx, jy, { stroke: p.line, width: 2 });
  s.text(x0, jy - s.unit * 0.018, `load ${task.dataset}`, {
    size: type * 0.9,
    fill: p.soft,
    alpha: 0.9,
    mono: true,
  });

  const exitY = (i: number) => jy + (i - 1) * s.h * b.exits * 0.5;
  outcomes.forEach((outcome, i) => {
    const y = exitY(i);
    const isDefault = outcome.kind === "stop";
    const isGated = outcome.kind === "gated";
    const on = isDefault ? 0.4 + stops * 0.6 : isGated ? 0.3 + gated * 0.7 : 0.45;
    const colour = isDefault ? p.warn : isGated ? p.soft : p.accent;

    /* Each exit leaves the junction at its own angle, then runs flat to its label. */
    s.poly(
      [
        [jx, jy],
        [jx + width * 0.1, y],
        [x1 - width * 0.26, y],
      ],
      { stroke: colour, width: isDefault ? 2.5 : 1.5, alpha: on, dash: isGated ? [5, 4] : undefined },
    );
    s.text(x1 - width * 0.24, y, outcome.label, {
      size: type * 0.9,
      fill: colour,
      alpha: on,
      mono: true,
      baseline: "middle",
    });
    s.text(x1 - width * 0.24, y + s.unit * 0.026, outcome.detail, {
      size: type * 0.75,
      fill: p.soft,
      alpha: on * 0.8,
      mono: true,
    });

    /* The barrier on the gated exit: it exists, and it is not reachable by accident. */
    if (isGated && gated > 0.1) {
      const bx = jx + width * 0.1;
      s.line(bx, y - s.unit * 0.016, bx, y + s.unit * 0.016, {
        stroke: p.warn,
        width: 2,
        alpha: gated,
      });
    }
  });

  /*
   * The request itself, travelling the junction and taking the default exit.
   *
   * It rides the whole sequence rather than one beat, so there is always something in motion under
   * the reader's scroll, and what it does - arriving at a junction and stopping - is the argument.
   */
  {
    const t = progress;
    const stopY = exitY(1);
    const x = t < 0.35 ? mix(x0, jx, t / 0.35) : mix(jx, jx + width * 0.1, Math.min(1, (t - 0.35) / 0.3));
    const y = t < 0.35 ? jy : mix(jy, stopY, Math.min(1, (t - 0.35) / 0.3));
    s.circle(x, y, s.unit * 0.009, { fill: t > 0.62 ? p.warn : p.ink, alpha: 0.95 });
  }

  /* ---- the fixture's vocabulary, per class ---- */
  if (opens > 0.02) {
    const by = s.h * b.bars;
    const bh = s.h * b.barHeight;
    const step = width / vocabulary.length;
    vocabulary.forEach((entry, i) => {
      const on = beat(opens, i * 0.14, i * 0.14 + 0.6);
      if (on <= 0.02) return;
      const x = x0 + i * step;
      const w = step * 0.62;
      const total = bh * on;
      s.rect(x, by + bh - total, w, total, { fill: p.soft, alpha: on * 0.3 });
      /* The exclusive part is drawn inside the whole, because it is a share of it. */
      if (share > 0.02) {
        const ex = total * (entry.exclusive / entry.words) * share;
        s.rect(x, by + bh - ex, w, ex, { fill: p.warn, alpha: share * 0.75 });
        s.text(x + w / 2, by + bh - ex - s.unit * 0.012, `${Math.round(exclusivePercent(entry))}%`, {
          size: type * 0.82,
          fill: p.warn,
          alpha: share,
          mono: true,
          anchor: "middle",
        });
      }
      s.text(x + w / 2, by + bh + s.unit * 0.026, entry.label, {
        size: type * 0.8,
        fill: p.soft,
        alpha: on * 0.9,
        mono: true,
        anchor: "middle",
      });
    });
    s.text(x0, by - s.unit * 0.018, `${templateCount} templates, words that name their own class`, {
      size: type * 0.85,
      fill: p.soft,
      alpha: opens * 0.85,
      mono: true,
    });
    if (share > 0.4) {
      s.text(x1, by - s.unit * 0.018, text.exclusiveShare, {
        size: type * 1.3,
        fill: p.warn,
        alpha: share,
        mono: true,
        anchor: "end",
      });
    }
  }

  /* ---- the two tracks ---- */
  if (compared > 0.02) {
    const y = s.h * b.tracks;
    tracks.forEach((track, i) => {
      const on = beat(compared, i * 0.25, i * 0.25 + 0.65);
      if (on <= 0.02) return;
      const x = x0 + i * (width * 0.5);
      s.text(x, y, track.label, { size: type, fill: p.accent, alpha: on, mono: true });
      s.text(x, y + s.unit * 0.028, track.detail, {
        size: type * 0.76,
        fill: p.soft,
        alpha: on * 0.8,
        mono: true,
      });
    });
  }

  /* ---- split discipline ---- */
  if (discipline > 0.02) {
    s.text(x0, s.h * (b.tracks + 0.1), `${splits.length} rules about which split is touched when`, {
      size: type * 0.82,
      fill: p.accent,
      alpha: discipline * 0.9,
      mono: true,
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (discipline > 0.05) {
    say("the held-out split is touched once", discipline, p.accent);
  } else if (compared > 0.05) {
    say("both tracks, evaluated the same way", compared * (1 - discipline * 0.8), p.accent);
  } else if (share > 0.05) {
    say(`${text.exclusiveShare} of the vocabulary gives the class away`, share * (1 - compared * 0.8), p.warn);
    say("a score on it would describe the templates", share * 0.85 * (1 - compared * 0.8), p.soft, 1);
  } else if (opens > 0.05) {
    say(`${task.classes.length} classes, ${templateCount} sentences`, opens * (1 - share * 0.8), p.soft);
  } else if (gated > 0.05) {
    say("the fallback exists, behind a flag", gated * (1 - opens * 0.8), p.soft);
  } else if (stops > 0.05) {
    say("the default is to produce nothing", stops * (1 - gated * 0.8), p.warn);
  } else {
    say("three ways out of one request", 1 - stops * 0.9, p.soft);
  }
}

export const nlp: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "A junction with three exits, drawn from the loader's own branch. A request to load AG News travels into it as the reader scrolls and takes the default exit, which raises and stops: when the download fails the loader produces nothing rather than silently substituting the synthetic fixture it ships. A third exit leads to that fixture and carries a barrier across it, because it is reachable only by passing --synthetic explicitly. The reason follows as four bars, one per class, each showing the fixture's distinct vocabulary with the exclusive part filled inside it: 34 of World's 41 words, 38 of Sports' 44, 39 of Business' 43 and 35 of Sci/Tech's 41, which is 86 per cent of the whole vocabulary appearing in exactly one class. A bag of words would separate that perfectly, so a score measured on it would describe the template list rather than any model. The sequence closes on the two tracks the project compares - TF-IDF classifiers and a fine-tuned DistilBERT, evaluated the same way - and on the three rules governing which split is touched when.",
  palette: palette("retrieval"),
  draw,
};
