import { axisMax, languagePenalties, rejections, weights } from "@/content/career-chapter";

/**
 * The layout of the career world.
 *
 * One unit of height is one point of the score, scaled by `POINT`. That is the whole reason the
 * scene works: a penalty and a weight are measured in the same unit by the engine, so they must be
 * measured in the same unit here, and a penalty taller than its own term is then a fact about the
 * picture rather than a claim made over it.
 */

/** Height per score point. The axis has to hold the largest penalty, not the largest weight. */
export const POINT = 3.6 / axisMax;

export const BAR = { width: 0.62, depth: 0.62, gap: 1.02 } as const;

export interface Term {
  readonly key: string;
  readonly label: string;
  readonly weight: number;
  readonly height: number;
  readonly penalty: number;
  readonly penaltyHeight: number;
  /** True where the flat penalty is larger than the term it sits beside. */
  readonly overruns: boolean;
  readonly x: number;
}

export const TERMS: readonly Term[] = weights.map((weight, i) => ({
  key: weight.key,
  label: weight.label,
  weight: weight.weight,
  height: weight.weight * POINT,
  penalty: weight.penalty ?? 0,
  penaltyHeight: (weight.penalty ?? 0) * POINT,
  overruns: weight.penalty !== undefined && weight.penalty > weight.weight,
  x: (i - (weights.length - 1) / 2) * BAR.gap,
}));

export const OVERRUNNING = TERMS.filter((term) => term.overruns);

/** The language ladder, which is the same axis seen as three steps. */
export const LADDER = languagePenalties.map((step, i) => ({
  key: step.key,
  label: step.label,
  points: step.points,
  height: step.points * POINT,
  x: (i - 1) * 0.84,
}));

/** The four conditions that discard a posting outright, as gates rather than as deductions. */
export const GATES = rejections.map((rejection, i) => ({
  key: rejection.key,
  label: rejection.label,
  x: (i - (rejections.length - 1) / 2) * 1.7,
}));
