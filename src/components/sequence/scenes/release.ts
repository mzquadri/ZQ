import { adoption, frames, markets, milestones, sheet, tickCount } from "@/content/release-chapter";

import { beat, caption, focus, mix, palette, type Palette, type SceneDefinition } from "../scene";
import type { Surface } from "../surface";

/**
 * Release tracking: a sheet too wide to read, becoming four frames.
 *
 * The object is a row of column ticks, and the sequence is those ticks migrating into four groups.
 * That migration is the work: the fields were not reduced or removed, they were regrouped by
 * subject instead of by the order the sheet happened to grow in, and a form that fits on a screen
 * is the result rather than the method.
 *
 *   rest   the sheet's columns, as one unreadable run of ticks
 *   0.10   its dimensions, both stated as approximate because the source states them so
 *   0.24   the ticks take a colour per subject, still in sheet order
 *   0.40   they migrate into their four groups
 *   0.58   the four frames close around them
 *   0.72   the milestone annotations the release data carries
 *   0.86   what the report does not record
 *
 * Nothing here is an employer measurement. The public case study carries no source, no field
 * values, no part numbers and no screenshots, and records no count of departments, no time saved
 * and no error rate - which is why the closing beat says so rather than quoting an impact.
 */

const BANDS = {
  wide: { ticks: 0.3, frames: 0.46, frameHeight: 0.15, milestones: 0.72, notes: 0.88 },
  tall: { ticks: 0.24, frames: 0.36, frameHeight: 0.14, milestones: 0.7, notes: 0.84 },
} as const;

/**
 * Which subject each drawn tick belongs to.
 *
 * Deliberately not a claim: the case study does not publish the column list, so this is a declared
 * allocation rather than a measured one - four unequal groups that sum to the number of ticks
 * drawn, interleaved across the sheet so the migration reads as regrouping rather than slicing.
 *
 * The first attempt drew the group from `hash01`, which is the site's stable pseudo-random, and it
 * put all forty-four ticks into two of the four frames: the other two closed around nothing. An
 * allocation that has to come out exactly right is not a job for a random number, however stable.
 */
const GROUP_SIZES = [14, 12, 10, 8];

const GROUP = (() => {
  const slots: { group: number; at: number }[] = [];
  GROUP_SIZES.forEach((size, group) => {
    for (let k = 0; k < size; k += 1) slots.push({ group, at: (k + 0.5) / size });
  });
  /* Sorted by position-within-group, which interleaves the four runs evenly across the sheet. */
  slots.sort((a, b) => a.at - b.at);
  return slots.slice(0, tickCount).map((slot) => slot.group);
})();

function draw(s: Surface, progress: number, p: Palette) {
  const sized = beat(progress, 0.1, 0.22);
  const coloured = beat(progress, 0.24, 0.38);
  const migrate = beat(progress, 0.4, 0.56);
  const framed = beat(progress, 0.58, 0.7);
  const marked = beat(progress, 0.72, 0.84);
  const notes = beat(progress, 0.86, 0.96);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const span = s.portrait ? s.w * 0.84 : f.r * 1.95;
  const x0 = s.portrait ? (s.w - span) / 2 : f.x - span * 0.5;
  const x1 = x0 + span;
  const type = s.unit * (s.portrait ? 0.021 : 0.018);

  const COLOURS = [p.accent, p.soft, p.warn, p.ink];

  /* ---- the sheet, as a run of column ticks ---- */
  const ty = s.h * b.ticks;
  const tickH = s.unit * 0.05;

  /* Where a tick ends up: its slot inside its own group's frame. */
  const frameW = span / (s.portrait ? 2 : frames.length);
  const frameH = s.h * b.frameHeight / (s.portrait ? 2 : 1);

  const destination = (i: number) => {
    const group = GROUP[i];
    const col = s.portrait ? group % 2 : group;
    const row = s.portrait ? Math.floor(group / 2) : 0;
    const within = GROUP.slice(0, i).filter((g) => g === group).length;
    const perRow = 6;
    return {
      x: x0 + col * frameW + frameW * 0.12 + (within % perRow) * (frameW * 0.13),
      y:
        s.h * b.frames +
        row * (frameH + s.unit * 0.04) +
        frameH * 0.3 +
        Math.floor(within / perRow) * s.unit * 0.034,
    };
  };

  for (let i = 0; i < tickCount; i += 1) {
    const startX = x0 + (i / (tickCount - 1)) * span;
    const to = destination(i);
    const x = mix(startX, to.x, migrate);
    const y = mix(ty, to.y, migrate);
    const colour = coloured > 0.05 ? COLOURS[GROUP[i]] : p.soft;
    const alpha = mix(0.45, 0.9, Math.max(coloured, migrate));
    s.line(x, y - tickH * (1 - migrate * 0.6) * 0.5, x, y + tickH * (1 - migrate * 0.6) * 0.5, {
      stroke: colour,
      width: migrate > 0.5 ? 3 : 1.5,
      alpha,
      cap: "round",
    });
  }

  /* ---- the sheet's dimensions ---- */
  {
    const on = 0.3 + sized * 0.7;
    s.text(x0, ty - s.unit * 0.05, `about ${sheet.columns} columns`, {
      size: type * 0.9,
      fill: p.warn,
      alpha: on * (1 - migrate * 0.8),
      mono: true,
    });
    s.text(x1, ty - s.unit * 0.05, `about ${sheet.rows} rows`, {
      size: type * 0.9,
      fill: p.warn,
      alpha: on * (1 - migrate * 0.8),
      mono: true,
      anchor: "end",
    });
    s.line(x0, ty - s.unit * 0.03, x1, ty - s.unit * 0.03, {
      stroke: p.warn,
      width: 1,
      alpha: on * 0.4 * (1 - migrate * 0.8),
    });
  }

  /* ---- the four frames ---- */
  if (framed > 0.02) {
    frames.forEach((frame, i) => {
      const on = beat(framed, i * 0.14, i * 0.14 + 0.6);
      if (on <= 0.02) return;
      const col = s.portrait ? i % 2 : i;
      const row = s.portrait ? Math.floor(i / 2) : 0;
      const fx = x0 + col * frameW + frameW * 0.05;
      const fy = s.h * b.frames + row * (frameH + s.unit * 0.04);
      s.rect(fx, fy, frameW * 0.9, frameH, {
        stroke: COLOURS[i],
        width: 1.5,
        alpha: on * 0.8,
      });
      s.text(fx + frameW * 0.05, fy + s.unit * 0.028, frame.label, {
        size: type * 0.8,
        fill: COLOURS[i],
        alpha: on,
        mono: true,
      });
    });
  }

  /* ---- the milestone annotations ---- */
  if (marked > 0.02) {
    const y = s.h * b.milestones;
    const step = span / milestones.length;
    milestones.forEach((milestone, i) => {
      const on = beat(marked, i * 0.1, i * 0.1 + 0.6);
      if (on <= 0.02) return;
      const x = x0 + i * step + step * 0.5;
      s.circle(x, y, s.unit * 0.014, { stroke: p.accent, width: 1.5, alpha: on * 0.9 });
      s.text(x, y, milestone, {
        size: type * 0.78,
        fill: p.accent,
        alpha: on,
        mono: true,
        anchor: "middle",
        baseline: "middle",
      });
    });
    s.text(x0, y - s.unit * 0.034, `${milestones.length} milestone annotations, each with its own comment`, {
      size: type * 0.8,
      fill: p.soft,
      alpha: marked * 0.85,
      mono: true,
    });
  }

  /* ---- what the report does not record ---- */
  if (notes > 0.02) {
    s.text(x0, s.h * b.notes, "no count, no time saved, no error rate recorded", {
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
    say(adoption.builtFor, notes, p.soft);
    say(`taken up by ${adoption.takenUpBy}`, notes * 0.85, p.accent, 1);
  } else if (marked > 0.05) {
    say(`${markets} markets, one form`, marked * (1 - notes * 0.8), p.accent);
  } else if (framed > 0.05) {
    say(`${frames.length} frames, grouped by subject`, framed * (1 - marked * 0.8), p.accent);
  } else if (migrate > 0.05) {
    say("regrouped, not reduced", migrate * (1 - framed * 0.8), p.ink);
  } else if (coloured > 0.05) {
    say("every field belongs somewhere", coloured * (1 - migrate * 0.8), p.ink);
  } else if (sized > 0.05) {
    say("too wide to read in one pass", sized * (1 - coloured * 0.8), p.warn);
  } else {
    say("one sheet, one row per release", 1 - sized * 0.9, p.soft);
  }
}

export const release: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "A long unbroken run of column ticks standing for a tracking sheet about 130 columns wide and about 600 rows deep, both stated as approximate because the case study states them so. The ticks take a colour each as they are assigned to a subject, still in the order the sheet grew in, and then migrate across the frame into four groups: department and location, part and supplier, cost and drawings, milestones and lead time. Four frames close around them, which is the point of the work - the fields were regrouped rather than reduced, so a form that fits on a screen is the result rather than the method. The six milestone annotations the release data carries are drawn as labelled marks, each carrying its own comment field. The sequence closes on what the internship report does not record: no count of departments, no time saved and no error rate, so the only adoption claim made is the report's own wording, that it was built for a single department and subsequently enlarged to accommodate numerous departments.",
  palette: palette("vision"),
  draw,
};
