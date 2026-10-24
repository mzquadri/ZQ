import {
  breakEven,
  cells,
  defaultCut,
  stages,
  valueBand,
  valueOfFlagging,
  valueOfHolding,
} from "@/content/claims-chapter";

/**
 * The layout of the insurance-claims world.
 *
 * Probability along x, expected value along y, and two surfaces whose intersection is the whole
 * finding. Both expectations are linear in one probability, so both are flat planes, so they meet
 * along a straight line rather than at a point - and that line, standing in space at 3.23%, is the
 * only threshold the repository's cost matrix justifies.
 *
 * Every position comes from `@/content/claims-chapter`, where the break-even is solved from the
 * four signed values rather than written down. Changing a cost moves the surfaces, and the
 * intersection follows them, because it is computed from the same place they are.
 */

/** The probability axis, drawn end to end. */
export const AXIS_WIDTH = 14;
/** How deep the two surfaces run. They are constant in z - the value depends on one number only. */
export const DEPTH = 5;
/** Expected value, in currency units, per drawn unit of height. */
export const VALUE_PER_UNIT = 200;

export const px = (probability: number) => (probability - 0.5) * AXIS_WIDTH;
export const py = (value: number) => value / VALUE_PER_UNIT;

/**
 * A surface, as the two heights its ends sit at.
 *
 * Stored as endpoints rather than as a slope and an offset, because that is how it is drawn and
 * because a reader checking the figure against the matrix checks the ends.
 */
export interface Surface {
  readonly key: "act" | "hold";
  readonly label: string;
  readonly atZero: number;
  readonly atOne: number;
}

export const SURFACES: readonly Surface[] = [
  { key: "act", label: "act on it", atZero: valueOfFlagging(0), atOne: valueOfFlagging(1) },
  { key: "hold", label: "leave it alone", atZero: valueOfHolding(0), atOne: valueOfHolding(1) },
];

/** Where a surface sits at a given probability, in drawn units. */
export const heightAt = (surface: Surface, probability: number) =>
  py(surface.atZero + (surface.atOne - surface.atZero) * probability);

/** The line the two surfaces meet along: the justified cut. */
export const CROSSING = {
  x: px(breakEven),
  y: heightAt(SURFACES[0], breakEven),
} as const;

/** The cut nearly everything defaults to, drawn on the same axis for comparison. */
export const HABIT = { x: px(defaultCut) } as const;

/**
 * The four signed values, as columns standing at the end of the axis they set.
 *
 * A true positive and a false positive are both outcomes of acting, so they belong to the surface
 * that rises; a false negative and a true negative belong to the one that falls. Placing each
 * column under the end its value anchors is what makes the slopes legible as consequences rather
 * than as a chosen gradient.
 */
export const COLUMNS = cells.map((cell) => {
  const acting = cell.key === "tp" || cell.key === "fp";
  const atOne = cell.key === "tp" || cell.key === "fn";
  return {
    key: cell.key,
    label: cell.label,
    value: cell.value,
    x: atOne ? px(1) : px(0),
    z: acting ? -DEPTH * 0.34 : DEPTH * 0.34,
    height: py(cell.value),
  };
});

/** The three things the pipeline keeps apart, as gates the axis runs through. */
export const GATES = stages.map((stage, i) => ({
  key: stage.key,
  label: stage.label,
  x: px(0.12 + i * 0.3),
}));

/** The vertical extent the surfaces cover, for framing. */
export const VALUE_SPAN = {
  low: py(valueBand.low),
  high: py(valueBand.high),
} as const;
