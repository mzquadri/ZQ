import { frames, milestones, tickCount } from "@/content/release-chapter";

/**
 * The layout of the release-tracking world.
 *
 * Everything drawn here comes from `@/content/release-chapter`, which is read from the public
 * case-study repository and nothing else. There is no employer source, no internal system, no
 * field value, no part number, no supplier, no department name and no screenshot in this world,
 * because there is none of that in the repository it is built from.
 *
 * What there is: a sheet stated as roughly 600 rows by 130 columns, four subject groups the
 * fields were regrouped into, six milestone annotation codes, two markets, and an explicit
 * absence - the report records no count of departments, no time saved and no error rate.
 */

/** Ticks drawn along the sheet. A drawing convention, declared as such in the content module. */
export const TICKS = tickCount;
export const TICK_GAP = 0.42;
export const TICK = { width: 0.16, height: 3.2, depth: 0.14 } as const;

/** The run the sheet opens as, wider than any shot can hold - which is the point of the beat. */
export const SHEET_WIDTH = (TICKS - 1) * TICK_GAP;

/**
 * Which subject each drawn tick belongs to.
 *
 * A declared allocation rather than a measured one: the case study does not publish the column
 * list, so these are four unequal groups that sum to the number of ticks drawn, interleaved
 * across the sheet so the migration reads as regrouping rather than as slicing a run into
 * quarters. The same allocation the flat scene uses, and for the same reason it is written out
 * rather than drawn from the site's stable pseudo-random: an allocation that has to come out
 * exactly right is not a job for a random number, however stable.
 */
const GROUP_SIZES = [14, 12, 10, 8];

export const GROUP: readonly number[] = (() => {
  const slots: { group: number; at: number }[] = [];
  GROUP_SIZES.forEach((size, group) => {
    for (let k = 0; k < size; k += 1) slots.push({ group, at: (k + 0.5) / size });
  });
  slots.sort((a, b) => a.at - b.at);
  return slots.slice(0, TICKS).map((slot) => slot.group);
})();

/** Where each of the four frames stands, as a two-by-two in the floor plane. */
export const FRAMES = frames.map((frame, i) => ({
  key: frame.key,
  label: frame.label,
  x: (i % 2 === 0 ? -1 : 1) * 3.4,
  z: (i < 2 ? -1 : 1) * 2.6,
  size: GROUP_SIZES[i],
}));

/** Where a tick lands once it has been regrouped: its frame, and its slot inside it. */
export const LANDING = (() => {
  const used = FRAMES.map(() => 0);
  return GROUP.map((group) => {
    const frame = FRAMES[group];
    const slot = used[group];
    used[group] += 1;
    const centred = slot - (frame.size - 1) / 2;
    return { x: frame.x + centred * TICK_GAP, z: frame.z };
  });
})();

/** The half-extent of a frame's outline, so the four boxes that draw it can be placed. */
export const frameHalf = (size: number) => ({
  x: ((size - 1) * TICK_GAP) / 2 + 0.5,
  z: TICK.depth / 2 + 0.5,
});

/** The milestone codes the release data carries, as marks standing above the frames. */
export const MILESTONES = milestones.map((code, i) => ({
  code,
  x: (i - (milestones.length - 1) / 2) * 1.5,
  y: TICK.height + 1.4,
}));
