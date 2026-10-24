import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * A junction with three exits, and a door that is shut on purpose.
 *
 * The project's decision worth a page is a refusal: when the dataset will not download, the loader
 * raises rather than quietly substituting the synthetic fixture it ships. So the world is built
 * around a thing that does not happen. A request arrives, finds the road closed, and stops - and
 * the reader watches it stop rather than reading that it would.
 *
 * The second half is why. The fixture's vocabulary is counted per class and 86 per cent of its
 * words appear in exactly one class, so the four classes physically separate into four columns
 * with almost nothing shared between them. A bag of words would cut that cleanly, which is the
 * point: a score measured there would describe the template list.
 */

export type NlpKey =
  | "request"
  | "closed"
  | "gated"
  | "fixture"
  | "exclusive"
  | "separable"
  | "tracks";

export const STATES: readonly WorldState<NlpKey>[] = [
  {
    key: "request",
    from: 0.0,
    to: 0.13,
    label: "One request, three ways out",
    caption: "Load AG News. The junction has an exit for success, one for failure and one for the fixture.",
  },
  {
    key: "closed",
    from: 0.13,
    to: 0.3,
    label: "The default produces nothing",
    caption: "When the download fails the loader raises. It does not quietly substitute anything.",
  },
  {
    key: "gated",
    from: 0.3,
    to: 0.44,
    label: "The fallback exists, behind a flag",
    caption: "The synthetic fixture is reachable only by passing --synthetic on the command line.",
  },
  {
    key: "fixture",
    from: 0.44,
    to: 0.57,
    label: "Twenty sentences",
    caption: "Five hand-written templates per class, and every distinct word in them counted.",
  },
  {
    key: "exclusive",
    from: 0.57,
    to: 0.71,
    label: "Most of them give the class away",
    caption: "34 of World's 41 words, 38 of Sports' 44, 39 of Business' 43, 35 of Sci/Tech's 41.",
  },
  {
    key: "separable",
    from: 0.71,
    to: 0.86,
    label: "Which a bag of words cuts perfectly",
    caption: "86% of the vocabulary is exclusive, so a score on this fixture describes the templates.",
  },
  {
    key: "tracks",
    from: 0.86,
    to: 1.0,
    label: "Two tracks, evaluated the same way",
    caption: "TF-IDF classifiers and a fine-tuned DistilBERT, with the held-out split touched once.",
  },
];

export const { at, active } = choreograph(STATES);

/**
 * The camera, one keyframe per state.
 *
 * Its own language: this one approaches and then stops, which is the subject. It comes down the
 * road toward the junction, halts where the request halts, and only afterwards lifts to look at
 * the vocabulary from above - because separability is a thing you see from overhead and not from
 * the road.
 */
export const SHOTS: Record<
  NlpKey,
  { height: number; distance: number; swing: number; tilt: number; look: number }
> = {
  request: { height: 1.2, distance: 10.0, swing: 0.0, tilt: 0.04, look: -1.0 },
  closed: { height: 0.9, distance: 7.2, swing: 0.6, tilt: 0.03, look: -1.2 },
  gated: { height: 1.0, distance: 7.0, swing: -1.4, tilt: 0.04, look: -0.8 },
  fixture: { height: 3.4, distance: 12.6, swing: 0.0, tilt: 0.3, look: 4.6 },
  exclusive: { height: 4.6, distance: 12.8, swing: 0.0, tilt: 0.46, look: 5.2 },
  separable: { height: 5.6, distance: 13.4, swing: 0.0, tilt: 0.58, look: 5.2 },
  tracks: { height: 2.4, distance: 11.4, swing: 0.0, tilt: 0.18, look: 1.6 },
};
