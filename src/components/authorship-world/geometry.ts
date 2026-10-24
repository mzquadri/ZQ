import { classes, counted, notClaimed, sharePercent } from "@/content/authorship-chapter";

/**
 * The layout of the authorship world.
 *
 * Every dimension is derived from the commit counts rather than chosen, so the picture cannot
 * drift from the table it is drawn from. The one thing that is a drawing decision - how much of a
 * component's total is allowed to become height - is stated here as a constant rather than buried
 * in the scene.
 */

/** The largest total, which sets the scale everything else is measured against. */
const MAX_TOTAL = Math.max(...counted.map((component) => component.total));

/** How tall the largest component stands. Everything else is proportional to it. */
const TALLEST = 3.4;

export const COLUMN = { width: 0.9, depth: 0.9, gap: 1.45 } as const;

export interface Volume {
  readonly name: string;
  readonly mine: number;
  readonly total: number;
  /** Full height, standing for the whole of that component's history. */
  readonly height: number;
  /** The lit part, standing for the share that is mine. Zero for the one that is nobody's but theirs. */
  readonly lit: number;
  readonly share: number;
  readonly x: number;
  readonly zero: boolean;
}

export const VOLUMES: readonly Volume[] = counted.map((component, i) => {
  const height = (component.total / MAX_TOTAL) * TALLEST;
  const share = sharePercent(component) / 100;
  return {
    name: component.name,
    mine: component.mine,
    total: component.total,
    height,
    lit: height * share,
    share,
    x: (i - (counted.length - 1) / 2) * COLUMN.gap,
    zero: component.mine === 0,
  };
});

/**
 * The four claim tiers the volumes sort toward, strongest first.
 *
 * Their heights are a ranking rather than a measurement - the repository ranks its four classes
 * and publishes no number for them - so they are evenly spaced, which is what an ordering looks
 * like when it is not pretending to be a scale.
 */
export const TIERS = classes.map((entry, i) => ({
  key: entry.key,
  label: entry.label,
  y: TALLEST * (1.15 - i * 0.26),
  width: 7.4 - i * 1.1,
}));

/**
 * Which tier each volume sorts into, and which two of them disagree with their own counts.
 *
 * The repository is explicit that two classifications disagree with the commit counts
 * deliberately. It does not publish which, so this marks the two whose share would most obviously
 * predict a different tier - the near-complete one that is not the strongest claim, and the zero -
 * and the scene says only that two disagree, never which two are which.
 */
export const TIER_OF = VOLUMES.map((volume, i) => Math.min(TIERS.length - 1, i));
export const DISAGREES = VOLUMES.map((volume) => volume.zero || volume.share > 0.93);

export const REFUSALS = notClaimed.map((claim, i) => ({
  key: claim.key,
  label: claim.label,
  y: TALLEST * (0.95 - i * 0.3),
}));
