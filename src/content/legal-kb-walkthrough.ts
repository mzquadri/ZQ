/**
 * The guided walkthrough: what it says, where it looks, and which state each scene holds.
 *
 * This file is the whole timeline. The scenes themselves own no schedule - they render whatever
 * `data-step` they are handed - so a step here is the only place that decides what a visitor sees
 * at a given moment. That is deliberate: the same table has to drive the guided run, keyboard
 * stepping, and later a deterministic recording, and three timelines that agree today would not
 * agree for long.
 *
 * A step may hold several beats. A beat is one scene at one state for one duration, which is how
 * a step can show an arc - totals agree, a substitution happens, the totals still agree - while
 * remaining a single step to a visitor pressing Next.
 *
 * Captions are written to be read aloud. They are the source for a later voiceover and for
 * on-screen captions, so they are short, plain, and make one point each.
 */

/** Every scene the walkthrough can drive. Matches the `scene` prop passed to `SceneReveal`. */
export const walkthroughScenes = ["fanout", "count", "generations", "ladder"] as const;

export type WalkthroughScene = (typeof walkthroughScenes)[number];

export interface WalkthroughBeat {
  /** Which scene changes. Omitted for a step that only scrolls and narrates. */
  scene?: WalkthroughScene;
  /** The deterministic state that scene holds. Same number, same picture, every time. */
  state?: number;
  /** How long this beat holds, in milliseconds. */
  hold: number;
}

export interface WalkthroughStep {
  id: string;
  title: string;
  /** One or two sentences. Read aloud in about the step's own duration. */
  caption: string;
  /**
   * CSS selector for what the visitor should be looking at.
   *
   * The stage rather than the whole figure: a figure carries its caption, its legend and its
   * bounding note, and scrolling to all of that puts the legend on screen instead of the thing
   * the step is describing.
   */
  target: string;
  beats: readonly WalkthroughBeat[];
}

export const walkthroughSteps: readonly WalkthroughStep[] = [
  {
    id: "problem",
    title: "Stored is not the same as correct",
    caption:
      "Two stores can report the same number of records and still hold different content. Remove one unit, add another, and the total never moves.",
    target: ".legal-count-stage",
    beats: [
      { scene: "count", state: 1, hold: 3000 },
      { scene: "count", state: 2, hold: 3500 },
      { scene: "count", state: 3, hold: 6000 },
    ],
  },
  {
    id: "source",
    title: "One source, captured",
    caption:
      "The published document is captured before anything is parsed. Those exact bytes become the fixed subject that every later claim is measured against.",
    target: ".legal-fanout-stage",
    beats: [
      { scene: "fanout", state: 0, hold: 2000 },
      { scene: "fanout", state: 1, hold: 4000 },
      { scene: "fanout", state: 2, hold: 4500 },
    ],
  },
  {
    id: "representations",
    title: "Three representations",
    caption:
      "One capture becomes a relational record, a vector space and a reference graph. They are parallel views of the same source, and each has exactly one writing service.",
    target: ".legal-fanout-grid",
    beats: [{ scene: "fanout", state: 3, hold: 10500 }],
  },
  {
    id: "measurement",
    title: "Measured, not assumed",
    caption:
      "Each representation is compared against the capture rather than against the others. The mark records that a comparison happened, not that the data became correct.",
    target: ".legal-fanout-grid",
    beats: [{ scene: "fanout", state: 4, hold: 11000 }],
  },
  {
    id: "change",
    title: "When the source changes",
    caption:
      "On an amended source the current state converges: unchanged units retained, new ones added, changed ones replaced, removed ones pruned. The captured evidence behind it does not move.",
    target: ".legal-generations",
    beats: [
      { scene: "generations", state: 1, hold: 3500 },
      { scene: "generations", state: 2, hold: 3500 },
      { scene: "generations", state: 3, hold: 8000 },
    ],
  },
  {
    id: "confidence",
    title: "Classes of evidence",
    caption:
      "Evidence accumulates in classes and each rules out something different. No class becomes proof: every level also states what it still leaves open.",
    target: ".legal-ladder-stage",
    beats: [
      { scene: "ladder", state: 1, hold: 1600 },
      { scene: "ladder", state: 3, hold: 2000 },
      { scene: "ladder", state: 5, hold: 2000 },
      { scene: "ladder", state: 7, hold: 8000 },
    ],
  },
  {
    id: "contribution",
    title: "What I contributed",
    caption:
      "The platform existed already. My contribution was the verification and convergence work that made its current state measurable, and the reporting path that made it observable.",
    target: ".two-column-copy > div:last-child",
    beats: [{ hold: 10000 }],
  },
  {
    id: "lesson",
    title: "The instrument proved its author wrong",
    caption:
      "The strongest test came when this layer invalidated my own earlier reading. The measurement stayed; the claim had to be withdrawn and re-measured.",
    // The annotation, not the whole section: the blockquote above it is long enough that
    // top-aligning the section leaves the closing mark below the fold on a phone.
    target: ".legal-closing",
    beats: [{ hold: 11000 }, { hold: 3500 }],
  },
];

/** Total run time, used for the launcher's estimate and for the later recording pass. */
export function walkthroughDurationMs(): number {
  return walkthroughSteps.reduce(
    (total, step) => total + step.beats.reduce((sum, beat) => sum + beat.hold, 0),
    0,
  );
}

/**
 * The state every driven scene holds at a given step and beat.
 *
 * Scenes the walkthrough has already passed keep the last state it gave them; scenes it has not
 * reached yet sit at their initial state. That makes any (step, beat) pair reproducible from the
 * table alone, with no dependence on what happened to be on screen beforehand - which is what a
 * recorder will need, and what makes stepping backwards land on the same picture as stepping
 * forwards.
 */
export function sceneStatesAt(stepIndex: number, beatIndex: number): Record<WalkthroughScene, number> {
  const states: Record<WalkthroughScene, number> = { fanout: 0, count: 0, generations: 0, ladder: 0 };
  for (let step = 0; step <= stepIndex && step < walkthroughSteps.length; step += 1) {
    const last = step === stepIndex ? beatIndex : walkthroughSteps[step].beats.length - 1;
    for (let beat = 0; beat <= last; beat += 1) {
      const current = walkthroughSteps[step].beats[beat];
      if (current?.scene && current.state !== undefined) states[current.scene] = current.state;
    }
  }
  return states;
}
