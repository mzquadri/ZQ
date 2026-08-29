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

export function at(from: number, to: number, extra: React.CSSProperties = {}): Ranged {
  /*
   * Rounded because these are usually computed from a division, and binary floating point then
   * emits a long trailing run of digits into the stylesheet.
   */
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    style: {
      "--range": `contain ${round(from)}% contain ${round(to)}%`,
      ...extra,
    } as React.CSSProperties,
  };
}
