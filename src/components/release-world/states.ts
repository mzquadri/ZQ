import { choreograph, type WorldState } from "@/components/worlds/choreography";

import { adoption, markets, milestones, sheet } from "@/content/release-chapter";

import { TICK } from "./geometry";

/**
 * A sheet too wide to read, becoming four frames.
 *
 * The object is a long run of column ticks and the sequence is those ticks migrating into four
 * groups. That migration is the work: no field was removed, they were regrouped by subject rather
 * than by the order the sheet happened to grow in, and a form that fits on a screen is the result
 * of that rather than the method.
 *
 * Built only from what the public case-study repository publishes. It carries no employer source,
 * no internal data, no part numbers, no suppliers, no field values, no screenshots and no
 * colleagues' names, and the department it was first built for is unnamed there - so it is
 * unnamed here. The closing beat is what the report does not record, because the report records
 * no count of departments, no time saved and no error rate, and a world that implied one would be
 * inventing it.
 */

export type ReleaseKey =
  | "sheet"
  | "scale"
  | "subject"
  | "migrate"
  | "frames"
  | "milestones"
  | "limits";

export const STATES: readonly WorldState<ReleaseKey>[] = [
  {
    key: "sheet",
    from: 0.0,
    to: 0.14,
    label: "One sheet, one row per release",
    caption: "Columns enough that finding the one you need means scrolling sideways past the rest.",
  },
  {
    key: "scale",
    from: 0.14,
    to: 0.28,
    label: `About ${sheet.rows} rows by ${sheet.columns} columns`,
    caption: "Both figures approximate, because the case study publishes them that way.",
  },
  {
    key: "subject",
    from: 0.28,
    to: 0.42,
    label: "Every column belongs to a subject",
    caption: "Where the release is, what part it is, what it costs, and when it is due.",
  },
  {
    key: "migrate",
    from: 0.42,
    to: 0.6,
    label: "So they are regrouped by subject",
    caption: "Nothing is dropped and nothing is summarised. The columns move; the sheet does not shrink.",
  },
  {
    key: "frames",
    from: 0.6,
    to: 0.74,
    label: "Which closes four frames around them",
    caption: "One screen each, in the order someone filling the form actually needs them.",
  },
  {
    key: "milestones",
    from: 0.74,
    to: 0.88,
    label: "With the milestone annotations kept",
    caption: `${milestones.length} codes, each carrying its own comment, across ${markets} markets.`,
  },
  {
    key: "limits",
    from: 0.88,
    to: 1.0,
    label: "What the report does not record",
    caption: `It says the interface was ${adoption.reportWording}. No count, no time saved, no error rate.`,
  },
];

export const { at, active } = choreograph(STATES);

/* A type alias, not an interface: `blendShots` blends every numeric field, and only an alias
 * carries the implicit index signature that lets it. */
export type Shot = {
  readonly height: number;
  readonly distance: number;
  /** Sideways offset from `target`, not an absolute x. */
  readonly swing: number;
  readonly look: number;
  readonly target: number;
  readonly aimY: number;
};

const MIDDLE = TICK.height / 2;

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one starts inside the sheet, close enough that the run leaves the frame
 * at both edges, and climbs out of it as the columns regroup. A sheet is unreadable because of
 * where you have to stand to use it, so the opening shot stands there.
 */
export const SHOTS: Record<ReleaseKey, Shot> = {
  sheet: { height: 0.2, distance: 6.0, swing: 0.0, look: 0.0, target: 0, aimY: MIDDLE },
  scale: { height: 1.0, distance: 9.0, swing: 1.0, look: 0.0, target: 0, aimY: MIDDLE },
  subject: { height: 1.6, distance: 14.0, swing: 1.5, look: 0.0, target: 0, aimY: MIDDLE },
  migrate: { height: 7.0, distance: 22.0, swing: 0.0, look: 0.0, target: 0, aimY: MIDDLE },
  frames: { height: 9.5, distance: 22.0, swing: 0.0, look: 0.0, target: 0, aimY: MIDDLE - 0.4 },
  milestones: { height: 3.0, distance: 19.0, swing: -3.5, look: -0.8, target: 0, aimY: MIDDLE + 1.8 },
  limits: { height: 5.0, distance: 26.0, swing: 0.0, look: 0.0, target: 0, aimY: MIDDLE },
};

/**
 * How far right of centre the subject is aimed, as a share of however wide the frame is.
 *
 * The caption sits behind a scrim in the stage's own colour, so anything drawn in the lower left
 * is dimmed without looking dimmed.
 */
export const PLATE_BIAS = 0.2;
