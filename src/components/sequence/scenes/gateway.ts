import { configurations, controls, stages } from "@/content/gateway-world";

import {
  beat,
  blend,
  caption,
  focus,
  mix,
  palette,
  type Palette,
  type SceneDefinition,
} from "../scene";
import type { Surface } from "../surface";

/**
 * The gateway: a boundary, and what crosses it.
 *
 * Every other chapter in the reel opens an object or fills a field. This one draws a *line* and
 * then shows things arriving at it from the left, which is the only honest picture of what the
 * project is: a checkpoint between two processes, where three different kinds of traffic get three
 * different answers.
 *
 * The composition is deliberately architectural rather than organic. Two vertical rails - the
 * client on the left, the downstream server on the right - with the boundary standing between
 * them. Traffic travels along a lane, meets the boundary, and either passes through to the right,
 * is stopped at the line, or is stripped and continues thinner than it arrived. Nothing here
 * grows, pulses or blooms; a security boundary that looked alive would be lying about what it is.
 *
 *   rest   the two rails and the closed boundary, with nothing in flight
 *   0.06   three lanes appear, labelled for the three moments a client trusts something
 *   0.18   traffic enters: a declaration, an argument set, a returned document
 *   0.32   the boundary resolves each one - pass, stop, strip
 *   0.46   the nine controls stack up along the boundary as the plates that did the work
 *   0.60   the plates that never touched honest traffic separate from the one that did
 *   0.74   the comparison: three bars, caught against refused
 *   0.88   the four pinned failures, drawn as gaps in an otherwise solid line
 *
 * The bar chart at 0.74 is the one moment the scene shows numbers, because the finding is a
 * comparison and a comparison is the one thing a shape cannot carry. Everything before it is the
 * mechanism; the bars are the result.
 */

const LANES = stages.length;
/** Ordered so the single non-decidable control is last, because 0.60 separates on exactly that. */
const PLATES = [...controls].sort((a, b) => Number(a.decidable) - Number(b.decidable)).reverse();

function draw(s: Surface, progress: number, p: Palette) {
  const lanes = beat(progress, 0.06, 0.16);
  const arrive = beat(progress, 0.18, 0.3);
  const resolve = beat(progress, 0.32, 0.44);
  const stack = beat(progress, 0.46, 0.58);
  const separate = beat(progress, 0.6, 0.72);
  const compare = beat(progress, 0.74, 0.86);
  const gaps = beat(progress, 0.88, 0.97);

  const f = focus(s);
  const c = caption(s);
  const unit = s.unit;

  /* The two rails. The boundary sits between them and is the only thing that never moves. */
  const left = f.x - f.r * (s.portrait ? 0.86 : 0.98);
  const right = f.x + f.r * (s.portrait ? 0.86 : 0.98);
  const boundary = f.x;
  const top = f.y - f.r * 0.82;
  const bottom = f.y + f.r * 0.82;

  s.line(left, top, left, bottom, { stroke: p.line, width: unit * 0.004 });
  s.line(right, top, right, bottom, { stroke: p.line, width: unit * 0.004 });
  s.text(left, top - unit * 0.028, "client", {
    fill: p.soft,
    size: unit * 0.021,
    anchor: "middle",
    mono: true,
  });
  s.text(right, top - unit * 0.028, "server", {
    fill: p.soft,
    size: unit * 0.021,
    anchor: "middle",
    mono: true,
  });

  /* The boundary itself: solid, and the brightest line in the frame. */
  s.line(boundary, top, boundary, bottom, {
    stroke: blend(p.line, p.accent, 0.35 + 0.65 * lanes),
    width: unit * (0.006 + 0.004 * lanes),
  });

  /* ------------------------------------------------------------------ lanes and traffic */
  const laneGap = (bottom - top) / (LANES + 1);
  for (let i = 0; i < LANES; i += 1) {
    const stage = stages[i];
    const y = top + laneGap * (i + 1);
    const reveal = beat(progress, 0.06 + i * 0.02, 0.16 + i * 0.02);
    if (reveal <= 0.01) continue;

    /* The lane, drawn only as far as it has been revealed. */
    s.line(left, y, mix(left, boundary, reveal), y, {
      stroke: p.line,
      width: unit * 0.0025,
      dash: [unit * 0.012, unit * 0.012],
    });

    if (!s.portrait) {
      s.text(left - unit * 0.014, y - unit * 0.008, stage.title.toLowerCase(), {
        fill: blend(p.line, p.soft, reveal),
        size: unit * 0.019,
        anchor: "end",
        mono: true,
      });
    }

    /* Traffic: a bar travelling the lane. Width carries how much content it is. */
    const enter = beat(progress, 0.18 + i * 0.035, 0.3 + i * 0.035);
    if (enter <= 0.01) continue;
    const w = unit * (0.05 + i * 0.012);
    const h = unit * 0.026;
    const x = mix(left + unit * 0.02, boundary - w - unit * 0.01, enter);

    /*
     * What the boundary does with each. Declarations pass with the poisoned one withheld,
     * arguments are stopped, results are stripped and continue thinner. Three answers, because
     * allow-or-deny is the design this project argues against.
     */
    const verdictShift = i === 0 ? resolve : i === 1 ? 0 : resolve;
    const past = i === 1 ? 0 : verdictShift;
    const thinned = i === 2 ? 1 - 0.42 * resolve : 1;
    const bx = past > 0 ? mix(x, boundary + unit * 0.02, past) : x;

    const tone =
      i === 1
        ? blend(p.soft, p.warn, resolve)
        : i === 2
          ? blend(p.soft, p.accent, resolve)
          : blend(p.soft, p.accent, resolve * 0.6);

    s.rect(bx, y - (h * thinned) / 2, w, h * thinned, { fill: tone, alpha: 0.85 });

    /* The one that is refused stops at the line and stays there. */
    if (i === 1 && resolve > 0.02) {
      s.line(boundary - unit * 0.006, y - h * 0.9, boundary - unit * 0.006, y + h * 0.9, {
        stroke: p.warn,
        width: unit * 0.005,
      });
    }
  }

  /* ------------------------------------------------------------------ the controls */
  if (stack > 0.01) {
    const plateH = ((bottom - top) * 0.92) / PLATES.length;
    for (let i = 0; i < PLATES.length; i += 1) {
      const plate = PLATES[i];
      const appear = beat(progress, 0.46 + i * 0.012, 0.58);
      if (appear <= 0.01) continue;

      const y = top + (bottom - top) * 0.04 + plateH * i;
      /*
       * 0.60 separates the eight decidable controls from the one that guesses. The decidable ones
       * hold the line; the judgement call steps off it, which is the point being made - the
       * false-positive story has exactly one owner.
       */
      const offset = plate.decidable ? 0 : separate * unit * 0.075;
      const w = unit * (0.016 + 0.01 * appear);

      s.rect(boundary - w / 2 + offset, y + plateH * 0.12, w, plateH * 0.72, {
        fill: plate.decidable
          ? blend(p.raised, p.accent, 0.25 + 0.35 * appear)
          : blend(p.raised, p.warn, 0.3 + 0.4 * separate),
        alpha: 0.9 * appear,
      });

      if (!s.portrait && appear > 0.5) {
        s.text(boundary + w + unit * 0.012 + offset, y + plateH * 0.56, plate.name, {
          fill: blend(p.line, plate.decidable ? p.soft : p.warn, (appear - 0.5) * 2),
          size: unit * 0.016,
          anchor: "start",
          mono: true,
        });
      }
    }
  }

  /* ------------------------------------------------------------------ the comparison */
  if (compare > 0.01) {
    const bw = f.r * (s.portrait ? 1.5 : 1.1);
    const bx = f.x - bw / 2;
    const by = bottom + unit * (s.portrait ? 0.05 : 0.035);
    const rowH = unit * 0.032;

    for (let i = 0; i < configurations.length; i += 1) {
      const cfg = configurations[i];
      const grow = beat(progress, 0.74 + i * 0.03, 0.86);
      const y = by + rowH * i * 1.5;

      /* Caught runs right from the centre line, refused runs left. Same scale, one axis. */
      const mid = bx + bw * 0.42;
      s.rect(mid, y, bw * 0.5 * cfg.caught * grow, rowH * 0.62, {
        fill: p.accent,
        alpha: 0.9,
      });
      s.rect(mid - bw * 0.36 * cfg.falseBlock * grow, y, bw * 0.36 * cfg.falseBlock * grow, rowH * 0.62, {
        fill: p.warn,
        alpha: 0.9,
      });

      if (grow > 0.4) {
        s.text(bx, y + rowH * 0.48, cfg.label, {
          fill: p.soft,
          size: unit * 0.018,
          anchor: "start",
          mono: true,
        });
        s.text(mid + bw * 0.5 * cfg.caught * grow + unit * 0.01, y + rowH * 0.48,
          `${Math.round(cfg.caught * 100)}%`, {
            fill: p.ink,
            size: unit * 0.018,
            anchor: "start",
            mono: true,
          });
      }
    }
  }

  /* ------------------------------------------------------------------ the pinned failures */
  if (gaps > 0.01) {
    /* Four gaps punched into the boundary: the cases that are known not to hold. */
    const positions = [0.22, 0.41, 0.63, 0.79];
    for (let i = 0; i < positions.length; i += 1) {
      const y = mix(top, bottom, positions[i]);
      const open = beat(progress, 0.88 + i * 0.02, 0.97);
      if (open <= 0.01) continue;
      const half = unit * 0.018 * open;
      s.line(boundary, y - half, boundary, y + half, {
        stroke: p.ground,
        width: unit * 0.014,
      });
      s.circle(boundary, y, unit * 0.005 * open, { fill: p.warn, alpha: open });
    }
  }

  /* ------------------------------------------------------------------ the line of type */
  const line =
    gaps > 0.5
      ? "four known failures, pinned by a test"
      : compare > 0.5
        ? "92.3% caught at 11.1% refused"
        : separate > 0.5
          ? "eight decidable, one that judges"
          : stack > 0.5
            ? "nine controls, three stages"
            : resolve > 0.5
              ? "pass, stop, or strip and continue"
              : arrive > 0.3
                ? "declarations, arguments, results"
                : "a boundary between two processes";

  s.text(c.x, c.y, line, { fill: p.soft, size: c.size, anchor: c.anchor, mono: true });
}

export const gateway: SceneDefinition = {
  width: 1600,
  height: 900,
  portraitWidth: 760,
  portraitHeight: 1180,
  travel: 5.4,
  portraitTravel: 3.8,
  rest: 0.5,
  label:
    "A boundary standing between a client and a downstream server. Three lanes of traffic reach " +
    "it: a declaration passes, an argument set is stopped at the line, a returned document is " +
    "stripped and continues thinner. Nine control plates stack along the boundary, and the one " +
    "that has to make a judgement steps off it. Three bars compare no gateway, a keyword filter " +
    "and the gateway on attacks caught against legitimate traffic refused.",
  palette: palette("steel"),
  draw,
};
