import { detector, drift, rescored, runs, seasonal } from "@/content/drift-chapter";

/**
 * The layout of the drift world.
 *
 * Mean absolute error runs along x with better to the left, and the promotion gate is a wall on
 * that axis. The whole of the upper band is one idea: the gate moves every time a challenger is
 * promoted, so the third offer - the same model as the second - is refused for not being two per
 * cent better than itself.
 *
 * The lower band carries what the monitor measured and the defect that was found in it. Both are
 * different quantities from MAE and are drawn on their own scales, below the axis rather than on
 * it, so nothing invites reading one off the other.
 */

/* Wide enough to hold the two gates and the three challengers with room either side. */
export const MAE_AXIS = { from: 40, to: 130 } as const;
export const AXIS_WIDTH = 14;
/** Better is to the left, which is the direction the gate travels as the champion improves. */
export const px = (mae: number) =>
  ((mae - MAE_AXIS.from) / (MAE_AXIS.to - MAE_AXIS.from)) * AXIS_WIDTH - AXIS_WIDTH / 2;

/** The gate each offer had to pass, and where the challenger actually landed. */
export const OFFERS = runs.map((run, i) => {
  /*
   * Derived from the policy rather than listed: the first offer has no champion to beat, the
   * second must beat the 2011 champion re-scored on the new window, and the third must beat what
   * the second one became. The refusal is a consequence of the gate having moved.
   */
  const gate =
    i === 0
      ? run.baselineMae * (1 - rescored.baselineMargin)
      : (i === 1 ? rescored.championOnNewWindow : runs[1].mae) * (1 - rescored.promotionMargin);
  return {
    key: run.key,
    label: run.label,
    mae: run.mae,
    x: px(run.mae),
    gate,
    gateX: px(gate),
    promoted: run.promoted,
    reason: run.reason,
    y: 1.6 - i * 1.6,
  };
});

/** The eleven feature columns, one of which crossed its own threshold. */
export const COLUMNS = Array.from({ length: drift.featureColumns }, (_, i) => ({
  index: i,
  moved: i === 0,
  x: (i - (drift.featureColumns - 1) / 2) * 0.62,
}));

/** The target's distance against the threshold it had to cross, on its own scale. */
export const TARGET = {
  distance: drift.target,
  threshold: drift.targetThreshold,
  scale: 6.0,
} as const;

/** The four window sizes the seasonal defect was found with, and what each verdict became. */
export const WINDOWS = seasonal.map((entry, i) => ({
  rows: entry.rows,
  days: entry.days,
  months: entry.months,
  before: entry.before,
  after: entry.after,
  flipped: entry.before !== entry.after,
  x: (i - (seasonal.length - 1) / 2) * 2.0,
}));

/** Where the two lower bands sit, below the promotion axis they are not measured on. */
export const BANDS = { measured: -4.2, seasonal: -8.0 } as const;

export const DETECTOR = {
  controlRows: detector.controlRows,
  firstAlarmRow: detector.firstAlarmRow,
  currentRows: detector.currentRows,
  /** The control window as a share of the whole series, so silence over it has a visible extent. */
  controlShare: detector.controlRows / detector.currentRows,
  alarmShare: detector.firstAlarmRow / detector.currentRows,
  width: 11,
} as const;
