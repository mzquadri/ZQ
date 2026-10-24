import { classes, counted, notClaimed, sharePercent } from "@/content/authorship-chapter";

import { beat, caption, focus, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * Authorship: what a commit count can establish, and the point past which it cannot.
 *
 * The object is five measured commit shares, and the sequence is those measurements being
 * converted into a claim and then bounded. There is no system diagram here and no architecture,
 * because the subject of the repository is not the systems - it is the question of what may
 * honestly be said about work that was not all one person's.
 *
 *   rest   the five shares, as measured
 *   0.10   the one with no share of its own, which is what makes the rest legible
 *   0.24   the four authorship classes the shares inform
 *   0.42   and do not decide: two classifications disagree with the counts deliberately
 *   0.58   the four claims the repository refuses to make, struck through
 *   0.78   why the services are unnamed
 *
 * The components are deliberately unnamed. Their names are internal service names and this site's
 * privacy scan forbids them - correctly, and at no cost to the figure, whose subject is the shape
 * of the distribution rather than which service is which. Two of them reached production for about
 * fifteen minutes before that scan caught them; PROGRESS.md records the whole incident.
 */

const BANDS = {
  wide: { shares: 0.2, shareStep: 0.058, classes: 0.56, notClaimed: 0.78, note: 0.93 },
  tall: { shares: 0.15, shareStep: 0.048, classes: 0.46, notClaimed: 0.66, note: 0.86 },
} as const;

function draw(s: Surface, progress: number, p: Palette) {
  const zero = beat(progress, 0.1, 0.22);
  const classed = beat(progress, 0.24, 0.4);
  const disagree = beat(progress, 0.42, 0.56);
  const refused = beat(progress, 0.58, 0.76);
  const unnamed = beat(progress, 0.78, 0.92);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const span = s.portrait ? s.w * 0.78 : f.r * 1.8;
  const x0 = s.portrait ? (s.w - span) * 0.6 : f.x - span * 0.46;
  const x1 = x0 + span;
  const type = s.unit * (s.portrait ? 0.02 : 0.017);

  /* ---- the five measured shares ---- */
  counted.forEach((component, i) => {
    const y = s.h * (b.shares + i * b.shareStep);
    const share = sharePercent(component) / 100;
    const isZero = component.mine === 0;
    /*
     * The zero row is the one that makes the others mean anything: a component listed as somebody
     * else's is what separates this from self-description, so it brightens rather than fades.
     */
    const on = isZero ? 0.35 + zero * 0.65 : 0.85;
    const w = span * 0.62 * share;

    s.text(x0 - s.unit * 0.014, y + s.unit * 0.011, component.name, {
      size: type * 0.82,
      fill: isZero ? p.warn : p.soft,
      alpha: on,
      mono: true,
      anchor: "end",
      baseline: "middle",
    });
    /* The track is the whole component; the fill is the share of it that is mine. */
    s.rect(x0, y, span * 0.62, s.unit * 0.022, { fill: p.line, alpha: 0.5 });
    if (w > 0.5) s.rect(x0, y, w, s.unit * 0.022, { fill: p.accent, alpha: 0.65 });
    s.text(x0 + span * 0.62 + s.unit * 0.012, y + s.unit * 0.011, `${component.mine}/${component.total}`, {
      size: type * 0.82,
      fill: isZero ? p.warn : p.ink,
      alpha: on,
      mono: true,
      baseline: "middle",
    });
    if (isZero && zero > 0.2) {
      s.text(x1, y + s.unit * 0.011, "none of it", {
        size: type * 0.8,
        fill: p.warn,
        alpha: (zero - 0.2) / 0.8,
        mono: true,
        anchor: "end",
        baseline: "middle",
      });
    }
  });

  /* ---- the four classes ---- */
  if (classed > 0.02) {
    const y = s.h * b.classes;
    classes.forEach((entry, i) => {
      const on = beat(classed, i * 0.16, i * 0.16 + 0.6);
      if (on <= 0.02) return;
      const ry = y + i * s.unit * 0.042;
      /* Strongest claim first, drawn as a descending bar so the ranking is visible as one. */
      const w = span * (1 - i * 0.18);
      s.rect(x0, ry, w * on, s.unit * 0.004, { fill: p.accent, alpha: on * 0.7 });
      s.text(x0, ry + s.unit * 0.022, entry.label, {
        size: type * 0.85,
        fill: p.accent,
        alpha: on,
        mono: true,
      });
    });
  }

  /* ---- what the counts do not decide ---- */
  if (disagree > 0.02) {
    s.text(x1, s.h * b.classes - s.unit * 0.026, "two classifications disagree with the counts", {
      size: type * 0.78,
      fill: p.warn,
      alpha: disagree * 0.95,
      mono: true,
      anchor: "end",
    });
    s.text(x1, s.h * b.classes, "deliberately, and say so", {
      size: type * 0.78,
      fill: p.soft,
      alpha: disagree * 0.85,
      mono: true,
      anchor: "end",
    });
  }

  /* ---- the four claims it refuses to make ---- */
  if (refused > 0.02) {
    const y = s.h * b.notClaimed;
    notClaimed.forEach((claim, i) => {
      const on = beat(refused, i * 0.16, i * 0.16 + 0.6);
      if (on <= 0.02) return;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = x0 + col * span * 0.52;
      const ry = y + row * s.unit * 0.042;
      s.text(x, ry, claim.label, {
        size: type * 0.82,
        fill: p.soft,
        alpha: on * 0.75,
        mono: true,
      });
      /* Struck through: each is a sentence the repository could have written and chose not to. */
      s.line(x, ry - s.unit * 0.005, x + span * 0.44 * on, ry - s.unit * 0.005, {
        stroke: p.warn,
        width: 1.5,
        alpha: on * 0.9,
      });
    });
  }

  /* ---- why the services are unnamed ---- */
  if (unnamed > 0.02) {
    s.text(x0, s.h * b.note, "the names are internal; the shape is the point either way", {
      size: type * 0.8,
      fill: p.warn,
      alpha: unnamed * 0.9,
      mono: true,
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (unnamed > 0.05) {
    say("a count is evidence of weight", unnamed, p.soft);
    say("not of authorship", unnamed * 0.85, p.warn, 1);
  } else if (refused > 0.05) {
    say(`${notClaimed.length} things it will not say`, refused * (1 - unnamed * 0.8), p.warn);
  } else if (disagree > 0.05) {
    say("the counts inform the classes", disagree * (1 - refused * 0.8), p.ink);
    say("they do not decide them", disagree * 0.85 * (1 - refused * 0.8), p.warn, 1);
  } else if (classed > 0.05) {
    say(`${classes.length} classes, strongest first`, classed * (1 - disagree * 0.8), p.accent);
  } else if (zero > 0.05) {
    say("one of them is nobody's but theirs", zero * (1 - classed * 0.8), p.warn);
  } else {
    say(`${counted.length} components, measured`, 1 - zero * 0.9, p.soft);
  }
}

export const authorship: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "Five components with the share of their commit history that is mine drawn inside the whole, measured rather than described: 466 of 498, 144 of 167, 123 of 148, 77 of 94, and then one at 0 of 56. That last row is marked as none of it, and it is what makes the other four legible as something more than self-description. Four authorship classes follow, strongest claim first, as descending bars - and beside them the statement that two classifications in the repository disagree with these counts deliberately, because a commit count informs a claim about authorship without deciding it. The four claims the repository refuses to make are then drawn struck through, each one a sentence it could have written and chose not to. The sequence closes on why the components are unnamed: their names are internal service names, and the subject of the figure is the shape of the distribution rather than which service is which.",
  palette: palette("steel"),
  draw,
};
