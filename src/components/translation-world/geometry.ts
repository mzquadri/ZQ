import { differences, model } from "@/content/translation-chapter";

/**
 * The layout of the translation world.
 *
 * Two frameworks as two walls facing each other across a gap, and the five differences between
 * them as spans across it. Four of the spans close; one does not, and the one that does not is
 * the floor on any comparison of this kind rather than a defect in the work.
 *
 * The parameter count is a beam laid between the walls at a fixed height. It never moves, which
 * is the point of the last two beats: it is asserted on every push and it is a floor rather than
 * a proof, so a difference it cannot see leaves it exactly where it was.
 */

export const WALL = { width: 0.9, height: 7.4, depth: 4.0 } as const;
/** The two frameworks, one either side of the gap the differences span. */
export const SIDES = { pytorch: -4.2, keras: 4.2 } as const;

export interface Span {
  readonly key: string;
  readonly what: string;
  readonly handled: string;
  readonly resolved: boolean;
  readonly y: number;
}

/** One span per difference, stacked up the gap in the order the repository lists them. */
export const SPANS: readonly Span[] = differences.map((difference, i) => ({
  key: difference.key,
  what: difference.what,
  handled: difference.handled,
  resolved: difference.resolved,
  y: 1.4 + i * 1.2,
}));

/** Where the beam sits. Above every span, because nothing below it moves it. */
export const BEAM = { y: WALL.height + 0.9, width: SIDES.keras - SIDES.pytorch } as const;

/**
 * The trap, as a span that opens below the beam and closes without touching it.
 *
 * Two dropout rates where the reference has one. Dropout carries no weights, so the count still
 * lands on 815,018 and the assertion still passes - which is why the project calls the count a
 * floor and not a proof.
 */
export const TRAP = { y: 0.5 } as const;

/**
 * The two accuracies, as heights on a shared axis.
 *
 * Only one of them exists. `results/` in that repository holds a `.gitkeep` and the README records
 * the Keras figure as pending, so the Keras column is drawn as an outline standing on nothing
 * rather than as a bar with a number behind it.
 */
export const ACCURACY = {
  axis: 100,
  height: 5.2,
  pytorch: model.pytorchAccuracy,
  keras: model.kerasAccuracy,
} as const;

export const accuracyY = (percent: number) => (percent / ACCURACY.axis) * ACCURACY.height;
