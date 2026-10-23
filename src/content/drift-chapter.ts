/**
 * The drift platform's own numbers.
 *
 * Every figure here is read out of an artefact the repository exports, not out
 * of its prose, because the two do not always agree. Where they disagree the
 * artefact wins, which is the source hierarchy in docs/PORTFOLIO_INTEGRITY.md.
 *
 * Sources, by file in mzquadri/drift-aware-ml-platform:
 *
 *   results/mlflow_training_runs.json  the three runs, their metrics, and the
 *                                      promotion reason each one was given
 *   results/drift_latency.json         the streaming-detector sweep, including
 *                                      the control window where any alarm is a
 *                                      false alarm by construction
 *   src/mlplatform/config.py           the thresholds the policy compares against
 *   docs/MLFLOW_RUN.md                 the transcript of the run that produced
 *                                      the two drift scores
 *
 * Two figures the repository carries are deliberately absent. Mean hourly
 * ridership "144 to 235", and the 63% rise derived from it, are written in the
 * README's prose and in a config comment; the README says plainly that no
 * script computes them and no results file holds them. They are a description
 * of the dataset rather than an output, so they are not published here as
 * measurements.
 *
 * The registry version the champion alias ends on is also absent. The README's
 * step table says version 4 and the exported registry says the alias points at
 * version 2. Rather than pick one, the page says what the alias is *for* and
 * leaves the number out, since it carries no argument.
 */

export const repository = "https://github.com/mzquadri/drift-aware-ml-platform";

/** What the monitor measured, comparing 2012 against the same seasons in 2011. */
export const drift = {
  /** Normed Wasserstein distance between the two marginal distributions of the target. */
  target: 0.679,
  /** Share of the eleven feature columns that crossed their own per-column threshold. */
  featureShare: 0.09,
  featureColumns: 11,
  /** The one column that moved. */
  movedColumn: "humidity",
  targetThreshold: 0.2,
  columnThreshold: 0.1,
} as const;

/**
 * The three training runs, in the order they happened.
 *
 * `refused` is the interesting one: the same model, offered twice, is turned
 * down the second time because it is not better than itself.
 */
export const runs = [
  {
    key: "first",
    label: "Train on 2011",
    mae: 51.49,
    r2: 0.6211,
    baselineMae: 98.94,
    rows: 1729,
    promoted: true,
    reason: "no champion registered yet, promoting the first model that clears the baseline",
  },
  {
    key: "retrain",
    label: "Retrain including 2012",
    mae: 95.48,
    r2: 0.6224,
    baselineMae: 174.98,
    rows: 3476,
    promoted: true,
    reason: "challenger MAE 95.48 beats champion 116.57 by at least 2%",
  },
  {
    key: "refused",
    label: "Offer the same model again",
    mae: 95.48,
    r2: 0.6224,
    baselineMae: 174.98,
    rows: 3476,
    promoted: false,
    reason: "challenger MAE 95.48 is not 2% better than champion 95.48 (needed <= 93.57)",
  },
] as const;

/** The 2011 champion, re-scored on the 2012 window rather than on the window it was fitted to. */
export const rescored = {
  championOnNewWindow: 116.57,
  challengerOnNewWindow: 95.48,
  promotionMargin: 0.02,
  baselineMargin: 0.35,
} as const;

/**
 * The streaming detector, calibrated on the control window alone.
 *
 * `delta` 1e-5 is the most sensitive setting that stays silent on 2011, where
 * the champion was trained and an alarm is therefore false by construction. It
 * was chosen without looking at 2012.
 */
export const detector = {
  name: "ADWIN",
  delta: 1e-5,
  controlAlarms: 0,
  controlRows: 1729,
  firstAlarmRow: 1855,
  currentRows: 8734,
  /** The window monitor already in the service crosses its threshold in this span. */
  windowMonitorFrom: 1855,
  windowMonitorTo: 2500,
} as const;

/**
 * The seasonal-coverage defect, and what fixing it changed.
 *
 * A 500-row window is January only, and it was being compared against a
 * reference spanning twelve months, so six calendar columns "drifted" for
 * reasons that were seasonal rather than real.
 */
export const seasonal = [
  { rows: 500, days: 21, months: "Jan", before: "retrain", after: "declines" },
  { rows: 720, days: 30, months: "Jan", before: "retrain", after: "declines" },
  { rows: 1000, days: 42, months: "Jan to Feb", before: "retrain", after: "retrain" },
  { rows: 8734, days: 364, months: "all", before: "retrain", after: "retrain" },
] as const;

export const seasonalFix = {
  falseAlarmAtDay: 21,
  realSignalWasDay: 104,
  realSignalNowDay: 42,
  minWindowRows: 500,
} as const;
