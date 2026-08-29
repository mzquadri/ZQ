import { confusion, classNames, perClass, primary, primaryRow, stages } from "@/content/cifar-world";

/**
 * The network laid out along Z.
 *
 * Every other world on this site runs left to right and is watched from the side. This one runs
 * away from the reader, because that is the shape of the thing: a plate of pixels at the front and
 * a stack of progressively smaller, deeper volumes behind it. The camera travels down that axis
 * rather than around it.
 *
 * Sizes are proportional to the real tensor shapes, which the generator measured by pushing a
 * tensor through the repository's own module. The exponent below is the one liberty: at strict
 * proportionality a 4x4 stage is an eighth of the width of the input and reads as a speck, so the
 * contraction is compressed slightly while keeping the ordering and the ratios visible.
 */

/** Where each stage sits along the depth axis. */
export const STAGE_Z = [0, -2.3, -4.5, -6.6, -8.7] as const;

export const RAIL_Z = -10.6;

/** Physical width of a stage, from its spatial extent. */
const PLATE = 3.4;
/*
 * 0.85 rather than strict proportionality. At 1.0 the 4x4 block is an eighth of the input and
 * reads as a speck; at the 0.55 first tried, blocks 1 and 2 came out nearly the same size and the
 * contraction stopped being visible at all, which is the one thing this state exists to show.
 */
export const plateWidth = (spatial: number) => PLATE * Math.pow(spatial / 32, 0.85);

/** The four measured stages plus the input, with the geometry each one gets. */
export const layout = stages.map((s, i) => {
  const spatial = s.shape.length === 3 ? s.shape[1] : 1;
  const channels = s.shape.length === 3 ? s.shape[0] : s.shape[0];
  return {
    name: s.name,
    shape: s.shape,
    channels,
    spatial,
    params: s.params,
    z: STAGE_Z[i],
    /* The classifier has no spatial extent, so it is not a plate and must not be drawn as one:
       at a fixed 1.6 it came out wider than the 4x4 block before it and broke the contraction. */
    spatialStage: s.shape.length === 3,
    width: s.shape.length === 3 ? plateWidth(spatial) : plateWidth(4) * 0.72,
    /* A sampled set of planes. The true channel count is in the readout, never inferred from
       how many rectangles happen to be on screen. */
    planes: s.shape.length === 3 ? Math.min(channels, i === 0 ? 3 : 4 + i * 3) : 1,
  };
});

export const PIXELS = 32;

/** The real image, as rows of [r, g, b] in 0-255. */
export const pixels = primary.rows;

/** Tile size when the plate is exploded into physical cells. */
export const tileSize = PLATE / PIXELS;

export const pixelPosition = (row: number, col: number) => ({
  x: (col - (PIXELS - 1) / 2) * tileSize,
  y: ((PIXELS - 1) / 2 - row) * tileSize,
});

/**
 * The receptive field, as a path across the plate.
 *
 * Three by three with padding one, so every output position sees nine inputs. The path is a
 * plain raster scan - the point is locality, not the order.
 */
export const KERNEL = 3;
export const fieldPath = Array.from({ length: 28 }, (_, i) => {
  const step = i / 27;
  const row = Math.floor(step * 24) + 3;
  const col = Math.floor((step * 7.5 % 1) * 24) + 3;
  return { row, col };
});

/** The ten output rails, carrying where the 1,000 real test cats actually landed. */
export const rails = primaryRow.map((r, i) => ({
  cls: r.cls,
  count: r.count,
  x: (i - (primaryRow.length - 1) / 2) * 0.62,
  correct: r.cls === primary.cls,
}));

export const railMax = Math.max(...rails.map((r) => r.count));

/** Per-class accuracy bars, ordered as the dataset orders its classes. */
export const classBars = perClass.map((c, i) => ({
  ...c,
  x: (i - (perClass.length - 1) / 2) * 0.62,
}));

/** The confusion matrix as a grid of cells. */
export const CELL = 0.34;
export const matrix = confusion.flatMap((row, i) =>
  row.map((count, j) => ({
    i,
    j,
    count,
    diagonal: i === j,
    trueCls: classNames[i],
    predCls: classNames[j],
    x: (j - 4.5) * CELL,
    y: (4.5 - i) * CELL,
  })),
);

export const matrixMax = Math.max(...matrix.map((c) => c.count));

/** The single largest off-diagonal cell, which the confusion state points at. */
export const worstCell = matrix
  .filter((c) => !c.diagonal)
  .reduce((a, b) => (b.count > a.count ? b : a));
