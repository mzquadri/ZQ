import type React from "react";

/**
 * The scroll-range primitive the whole exhibition shares.
 *
 * Every DOM-driven figure on this site stages itself by setting `--range`, which CSS reads through
 * `animation-range` on a scroll timeline. Keeping the helper in one module rather than one copy
 * per file is what makes the timing feel like one system: the seams between chapters, the figures
 * inside them and the hero all measure their progress the same way, and a browser without scroll
 * timelines gets the resting state - which is always the finished frame - from the same rule.
 */

export type Ranged = { style: React.CSSProperties };

/**
 * Stage an element within its chapter's scroll.
 *
 * This emitted `contain` ranges until it was measured. `contain` is the window in which the
 * timeline's *subject* sits entirely inside the scrollport, so it is only defined while the
 * subject is shorter than the viewport, and it collapses to a zero-length range the moment the
 * subject is taller. Every scene on this site is staged against `--chapter`, whose subject is
 * `.case-story-body`, and that element measures 1.28 to 1.87 times the viewport at 390, 768 and
 * 1440. So the range was zero-length at every breakpoint, every staged element sat at progress
 * 0 for the whole page, and all of it rendered as its finished state and stayed there. The
 * figures were not subtly wrong; they were not running at all.
 *
 * `cover` runs from the subject first touching the scrollport to it completely leaving, and is
 * well defined at any subject size. The percentages below are unchanged, because they were only
 * ever relative positions within the chapter and that is still what they are.
 */
export function at(from: number, to: number, extra: React.CSSProperties = {}): Ranged {
  /*
   * Rounded because these are usually computed from a division, and binary floating point then
   * emits a long trailing run of digits into the stylesheet.
   */
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    style: {
      "--range": `cover ${round(from)}% cover ${round(to)}%`,
      ...extra,
    } as React.CSSProperties,
  };
}

/**
 * The same idea for a scene that fills the viewport.
 *
 * `contain` measures the window in which a subject sits entirely inside the scrollport, so it is
 * only meaningful when the subject is shorter than the viewport - and it collapses to a zero-length
 * range exactly when the subject is 100vh, which silently freezes every element staged with it.
 *
 * `cover` runs from the subject first entering to it fully leaving, and stays well defined at any
 * size. A full-viewport scene fills the screen at exactly the 50% mark, and that is its rest
 * frame - so staging has to be *finished* by then, not centred on it. Ranges here end before 50%
 * and hold, which is what lets a reader stop on a scene and find it complete.
 */
export function over(from: number, to: number, extra: React.CSSProperties = {}): Ranged {
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    style: {
      "--range": `cover ${round(from)}% cover ${round(to)}%`,
      ...extra,
    } as React.CSSProperties,
  };
}
