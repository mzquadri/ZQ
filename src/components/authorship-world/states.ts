import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * Five volumes, and how much of each is mine.
 *
 * The hardest thing to show honestly about employer work is the part that was not yours, and the
 * usual failure is to show only the part that was. So the object here is five solids sized by the
 * whole of each component's history, with the share that is mine lit inside them - which means the
 * unlit part is drawn at full size, permanently, as the larger thing it often is.
 *
 * One of the five never lights at all. That volume is the reason the other four can be believed,
 * so it is the only one the camera stops on by itself.
 *
 * The components are unnamed. Their names are internal service names and the privacy scan forbids
 * them, which costs this figure nothing: its subject is the shape of a distribution rather than
 * which service is which.
 */

export type AuthorshipKey =
  | "volumes"
  | "share"
  | "zero"
  | "classes"
  | "judged"
  | "refused"
  | "unnamed";

export const STATES: readonly WorldState<AuthorshipKey>[] = [
  {
    key: "volumes",
    from: 0.0,
    to: 0.12,
    label: "Five components",
    caption: "Sized by the whole of each one's commit history, not by my part of it.",
  },
  {
    key: "share",
    from: 0.12,
    to: 0.28,
    label: "What is mine, lit inside",
    caption: "466 of 498, 144 of 167, 123 of 148, 77 of 94. The unlit part stays at full size.",
  },
  {
    key: "zero",
    from: 0.28,
    to: 0.42,
    label: "And one that never lights",
    caption: "0 of 56. A component listed as somebody else's is what makes the other four legible.",
  },
  {
    key: "classes",
    from: 0.42,
    to: 0.56,
    label: "Four classes of having built it",
    caption: "Strongest claim first. The counts inform where a component lands; they do not decide it.",
  },
  {
    key: "judged",
    from: 0.56,
    to: 0.7,
    label: "Two disagree with their own counts",
    caption: "Deliberately, and the repository says so. A commit count is evidence of weight, not of authorship.",
  },
  {
    key: "refused",
    from: 0.7,
    to: 0.86,
    label: "Four things it will not say",
    caption: "Each one a sentence the repository could have written and chose not to.",
  },
  {
    key: "unnamed",
    from: 0.86,
    to: 1.0,
    label: "Unnamed, and still legible",
    caption: "The names are internal. The shape of the distribution is the whole of the argument.",
  },
];

export const { at, active } = choreograph(STATES);

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one rises. It begins level with the volumes, lifts as the claim becomes a
 * judgement rather than a count, and ends looking down on the whole set - which is the position
 * the argument finishes in, since the last thing it says is about the shape rather than about any
 * one component.
 */
export const SHOTS: Record<
  AuthorshipKey,
  { height: number; distance: number; swing: number; tilt: number }
> = {
  /*
   * The five volumes span 6.7 units, so nothing may come closer than about eight or the outermost
   * one leaves the frame - which is what the first pass did to the largest component, the one the
   * whole figure opens on. `swing` is kept small for the same reason; only the beat that is
   * genuinely about one volume moves far enough off-centre to crop the others.
   */
  volumes: { height: 1.4, distance: 9.4, swing: 0.0, tilt: 0.07 },
  share: { height: 1.6, distance: 8.6, swing: -0.5, tilt: 0.1 },
  zero: { height: 1.2, distance: 7.4, swing: -2.4, tilt: 0.08 },
  classes: { height: 2.6, distance: 9.4, swing: 0.0, tilt: 0.2 },
  judged: { height: 3.0, distance: 8.6, swing: 1.6, tilt: 0.26 },
  refused: { height: 1.8, distance: 7.8, swing: 0.0, tilt: 0.12 },
  unnamed: { height: 4.4, distance: 12.0, swing: 0.0, tilt: 0.38 },
};
