import { corpus, forms, generation, results, run } from "@/content/insureassist-world";

import {
  beat,
  caption,
  focus,
  hash01,
  palette,
  type Palette,
  type SceneDefinition,
} from "../scene";
import type { Surface } from "../surface";

/**
 * InsureAssist: the right words, out of the wrong document.
 *
 * Three federal flood-policy forms share a skeleton and a great deal of word-for-word wording, and
 * differ in substance. That is the entire difficulty of the project, and it is the one thing this
 * scene has to make obvious before it says anything else - so the three forms are drawn as three
 * genuinely identical rectangles of identical text, distinguishable only by a number in the corner.
 * A reader should find them hard to tell apart, because so does the retriever.
 *
 *   rest   three forms, side by side, indistinguishable
 *   0.06   a question arrives
 *   0.16   passages lift out of all three
 *   0.30   the nearest passage is chosen
 *   0.42   it is traced home - and it came from the wrong form
 *   0.56   provenance holds: every passage keeps the form it came from
 *   0.66   the evidence packet forms from the top five
 *   0.78   generation receives the packet, and the answer stays tethered to it
 *   0.90   and the questions it should refuse, it does not
 *
 * The failure is a replay, not an illustration. Question nfip-005 is one of the eighteen held-out
 * questions in the tracked reference run: it needs the General Property Form, and rank one came
 * back from the Dwelling Form. Eight of the eighteen do that, which is what the tracked
 * top-document figure of 0.5556 is counting.
 */

const QUESTION = run.find((q) => q.id === "nfip-005")!;
const WRONG_AT_ONE = run.filter((q) => !q.topFormCorrect).length;
const FORM_INDEX = new Map(forms.map((f, i) => [f.id, i]));

/** Rows of "text". Identical between the three forms on purpose - that is the subject. */
const LINES = 13;

/** Short enough to sit under a form without running into its neighbour. */
const SHORT = ["Dwelling", "General Property", "RCBAP"] as const;

function draw(s: Surface, progress: number, p: Palette) {
  const ask = beat(progress, 0.06, 0.14);
  const lift = beat(progress, 0.16, 0.28);
  const choose = beat(progress, 0.3, 0.4);
  const trace = beat(progress, 0.42, 0.52);
  const provenance = beat(progress, 0.56, 0.64);
  const packet = beat(progress, 0.66, 0.75);
  const generate = beat(progress, 0.78, 0.87);
  const refuse = beat(progress, 0.9, 0.98);

  const f = focus(s);
  const fw = s.portrait ? f.r * 0.56 : f.r * 0.5;
  const fh = fw * (s.portrait ? 1.08 : 1.34);
  const gap = fw * 0.22;
  const totalW = fw * 3 + gap * 2;
  const fx0 = f.x - totalW / 2;
  const fy = f.y - fh * (s.portrait ? 1.05 : 1.02);

  /* ---- the three forms ---- */
  forms.forEach((form, i) => {
    const x = fx0 + i * (fw + gap);
    /* The one the answer actually needed, and the one it came from. */
    const needed = FORM_INDEX.get(QUESTION.relevant[0]) === i;
    const camefrom = FORM_INDEX.get(QUESTION.retrievedForms[0]) === i;

    const known = trace * (camefrom ? 1 : 0) + provenance * 0.4;
    const edge = camefrom && trace > 0.3 ? p.warn : needed && trace > 0.3 ? p.accent : p.line;

    s.rect(x, fy, fw, fh, { fill: p.raised, alpha: 0.85 });
    s.rect(x, fy, fw, fh, {
      stroke: edge,
      width: known > 0.2 ? 1.8 : 1,
      alpha: 0.55 + known * 0.45,
    });

    /* Identical text. Same seed for every form, so the three really are the same shape. */
    for (let r = 0; r < LINES; r += 1) {
      const w = fw * (0.62 + hash01(r * 31) * 0.26);
      s.line(x + fw * 0.1, fy + fh * ((r + 1.2) / (LINES + 2)), x + fw * 0.1 + w, fy + fh * ((r + 1.2) / (LINES + 2)), {
        stroke: p.soft,
        width: 1,
        alpha: 0.24,
      });
    }

    /*
     * The number, then the name beneath it, both centred on the form. Set side by side they ran
     * into the next column - "General Property Form" is wider than a form is - and three labels
     * colliding is a poor way to make the point that three documents are hard to tell apart.
     */
    s.text(x + fw / 2, fy + fh + s.unit * 0.036, String(i + 1), {
      size: s.unit * 0.03,
      fill: edge === p.line ? p.soft : edge,
      alpha: 0.9,
      mono: true,
      weight: 700,
      anchor: "middle",
    });
    s.text(x + fw / 2, fy + fh + s.unit * 0.062, SHORT[i], {
      size: s.unit * 0.019,
      fill: edge === p.line ? p.soft : edge,
      alpha: 0.85,
      mono: true,
      anchor: "middle",
    });
  });

  /* ---- the question ---- */
  if (ask > 0.01) {
    const qy = fy - s.unit * 0.06;
    s.line(f.x - f.r * 0.5 * ask, qy, f.x + f.r * 0.5 * ask, qy, {
      stroke: p.ink,
      width: 1.5,
      alpha: ask * 0.8,
      cap: "round",
    });
    s.text(f.x, qy - s.unit * 0.022, `one question · ${QUESTION.category.replace("_", " ")}`, {
      size: s.unit * 0.022,
      fill: p.ink,
      alpha: ask * (1 - packet * 0.7),
      mono: true,
      anchor: "middle",
    });
  }

  /* ---- passages lift out, and the ranked list forms below ---- */
  /* Clear of the two-line form captions beneath the documents. */
  const ry = fy + fh + s.unit * (s.portrait ? 0.095 : 0.125);
  const rowH = s.unit * (s.portrait ? 0.028 : 0.036);
  const listW = totalW;

  if (lift > 0.01) {
    QUESTION.retrievedForms.slice(0, 5).forEach((formId, rank) => {
      const fi = FORM_INDEX.get(formId)!;
      const appear = beat(lift, rank * 0.12, rank * 0.12 + 0.55);
      if (appear <= 0.02) return;

      /* Each passage starts inside the form it came from and travels down into the ranked list. */
      const sx = fx0 + fi * (fw + gap) + fw * 0.5;
      const sy = fy + fh * (0.3 + rank * 0.1);
      const tx = fx0 + listW * 0.06;
      const ty = ry + rank * rowH * 1.25;
      const t = choose > 0.01 ? Math.min(1, choose * 1.4) : 0;
      const x = sx + (tx - sx) * t;
      const y = sy + (ty - sy) * t;

      const isTop = rank === 0;
      const wrong = FORM_INDEX.get(QUESTION.retrievedForms[0]) !== FORM_INDEX.get(QUESTION.relevant[0]);
      const colour = isTop && wrong && trace > 0.3 ? p.warn : p.accent;
      const rowW = listW * (0.88 - rank * 0.03);

      s.rect(x, y, t > 0.5 ? rowW : fw * 0.8, rowH, {
        fill: p.raised,
        alpha: appear * 0.9,
      });
      s.rect(x, y, t > 0.5 ? rowW : fw * 0.8, rowH, {
        stroke: colour,
        width: isTop && choose > 0.5 ? 1.8 : 1,
        alpha: appear * (isTop ? 1 : 0.5),
      });
      /* Text lines inside the passage - the same shape whichever form it came from. */
      for (let k = 0; k < 2; k += 1) {
        const lw = (t > 0.5 ? rowW : fw * 0.8) * (0.5 + hash01(rank * 17 + k) * 0.3);
        s.line(x + rowH * 0.3, y + rowH * (0.35 + k * 0.3), x + rowH * 0.3 + lw, y + rowH * (0.35 + k * 0.3), {
          stroke: p.soft,
          width: 1,
          alpha: appear * 0.3,
        });
      }

      /*
       * Provenance: the number of the form this passage actually came from, kept with it. This is
       * the whole answer to the problem - the text does not say which form it is from, so the
       * system has to carry that separately and never lose it.
       */
      if (provenance > 0.02 || (isTop && trace > 0.02)) {
        const show = isTop ? Math.max(trace, provenance) : provenance;
        s.text(x + (t > 0.5 ? rowW : fw * 0.8) - rowH * 0.35, y + rowH * 0.62, String(fi + 1), {
          size: s.unit * 0.024,
          fill: colour,
          alpha: show,
          mono: true,
          weight: 700,
          anchor: "end",
        });
      }

      /* The trace: a line from the top passage back up to the form it came from. */
      if (isTop && trace > 0.02) {
        s.line(x + rowW * 0.5, y, sx, fy + fh, {
          stroke: p.warn,
          width: 1.2,
          alpha: trace * 0.8,
          dash: [5, 4],
        });
      }
    });
  }

  /*
   * ---- evidence packet, generation, and the tether between them ----
   *
   * Desktop only. On a phone the forms, the ranked list, the packet and the answer stack past the
   * plate, and the honest fix is a shorter story rather than a smaller one: a phone ends on the
   * traced wrong form, which is this chapter's whole signature, and the packet and the tether are
   * left to the detail route.
   */
  if (packet > 0.02 && !s.portrait) {
    const px = fx0 + listW * 0.02;
    const py = ry - rowH * 0.35;
    const ph = rowH * 1.25 * 5 + rowH * 0.5;
    s.rect(px, py, listW * 0.92, ph, {
      stroke: p.accent,
      width: 1.2,
      alpha: packet * 0.7,
      dash: [7, 5],
    });
    s.text(px, py - s.unit * 0.018, `evidence packet · top 5 of ${corpus.chunks} passages`, {
      size: s.unit * 0.021,
      fill: p.accent,
      alpha: packet * 0.9,
      mono: true,
    });

    if (generate > 0.02) {
      const ay = py + ph + s.unit * (s.portrait ? 0.045 : 0.075);
      const aw = listW * 0.92 * generate;
      s.rect(px, ay, aw, rowH * 1.1, { fill: p.raised, alpha: generate * 0.9 });
      s.rect(px, ay, aw, rowH * 1.1, { stroke: p.ink, width: 1.2, alpha: generate });
      s.text(px + rowH * 0.3, ay + rowH * 0.7, "answer", {
        size: s.unit * 0.022,
        fill: p.ink,
        alpha: generate,
        mono: true,
      });
      /* Tethers. The answer stays physically attached to the passages it was built from. */
      for (let rank = 0; rank < 5; rank += 1) {
        const ty = ry + rank * rowH * 1.25 + rowH * 0.5;
        s.line(px + listW * (0.3 + rank * 0.12), ay, px + listW * (0.3 + rank * 0.12), ty, {
          stroke: p.accent,
          width: 1,
          alpha: generate * 0.45,
        });
      }
    }
  }

  /*
   * ---- one line of type ----
   *
   * The shared caption anchor assumes a scene that has finished by two-thirds of the frame. This
   * one has not: on a phone the forms, the ranked list, the packet and the answer stack almost to
   * the plate, so the line is pushed down to sit just above it instead of landing on it.
   */
  const c = caption(s);
  const cy = s.portrait ? Math.max(c.y, ry + rowH * 1.25 * 5 + s.unit * 0.11) : c.y;
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, cy + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (refuse > 0.05) {
    say(`unanswerable questions refused: ${generation.unanswerableRejection.toFixed(0)} of 4`, refuse, p.warn);
    say(`unsupported citations: ${generation.unsupportedCitationRate.toFixed(0)} of ${generation.citationsChecked}`, refuse * 0.85, p.soft, 1);
  } else if (generate > 0.05 && !s.portrait) say("every sentence stays attached to a passage", generate * (1 - refuse), p.ink);
  else if (packet > 0.05) say("provenance travels with the text", packet * (1 - (s.portrait ? refuse : generate) * 0.8), p.ink);
  else if (trace > 0.05) {
    const got = (FORM_INDEX.get(QUESTION.retrievedForms[0]) ?? 0) + 1;
    const want = (FORM_INDEX.get(QUESTION.relevant[0]) ?? 0) + 1;
    say(
      s.portrait ? `form ${got}. the answer is in form ${want}.` : `rank one came from form ${got}. the answer is in form ${want}.`,
      trace * (1 - packet * 0.8),
      p.warn,
    );
    say(`${WRONG_AT_ONE} of ${run.length} do this · top-document ${results.topDocument.toFixed(4)}`, trace * 0.85 * (1 - packet * 0.8), p.soft, 1);
  } else if (choose > 0.05) say("nearest passage wins", choose * (1 - trace * 0.8), p.ink);
  else if (lift > 0.05) say(`${corpus.chunks} passages, three forms`, lift * (1 - choose * 0.8), p.ink);
  else say("three forms. same skeleton, different substance.", 1 - ask * 0.9, p.soft);
}

export const insureassist: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3.6,
  portraitTravel: 2.9,
  rest: 0,
  label:
    "Three federal flood-policy forms drawn as three identical blocks of text, distinguishable only by a number. A question arrives, passages lift out of all three and settle into a ranked list, and the top-ranked passage is traced back to the form it came from: the wrong one. Eight of the eighteen held-out questions in the tracked run do this, which is what a top-document accuracy of 0.5556 counts. Provenance is then shown travelling with every passage, an evidence packet forms from the top five, and the generated answer stays tethered to the passages it was built from.",
  palette: palette("corpus"),
  draw,
};
