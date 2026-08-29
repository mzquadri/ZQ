import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * A leaderboard, taken apart.
 *
 * The benchmark's headline is a three-row table: XGBoost R2 0.979, SARIMAX 0.721, seasonal naive
 * -11.69. Read as a ranking it says gradient boosting is thirty times better than classical
 * statistics. Read against the code it says something else entirely - the three rows are not
 * scored on the same task, on the same resolution, or with the same information available.
 *
 * So this world is not a forecast cone, and deliberately so. There is no horizon here: every
 * prediction in the repository is one step ahead with yesterday's measured discharge supplied as
 * an input feature. Drawing a widening cone over it would invent the one thing the project is
 * careful to say it never tested.
 *
 * The sequence is the dismantling. Table, then the series, then what wrote the series, then each
 * row opened up in turn until the table cannot be read as a ranking any more.
 */

export type StreamflowKey =
  | "table"
  | "series"
  | "written"
  | "split"
  | "naive"
  | "drift"
  | "sarimax"
  | "xgboost"
  | "features"
  | "onestep"
  | "peaks"
  | "incomparable"
  | "limits";

export const STATES: readonly WorldState<StreamflowKey>[] = [
  {
    key: "table",
    from: 0.0,
    to: 0.07,
    label: "Three numbers",
    caption: "A benchmark result, in the shape everyone reads first.",
  },
  {
    key: "series",
    from: 0.07,
    to: 0.15,
    label: "Fifteen years, daily",
    caption: "5,475 days of streamflow. Seasonal, autocorrelated, and drifting upward.",
  },
  {
    key: "written",
    from: 0.15,
    to: 0.23,
    label: "The river was written",
    caption: "Not measured. Forty lines of NumPy with a fixed seed, and the recursion is public.",
  },
  {
    key: "split",
    from: 0.23,
    to: 0.3,
    label: "Cut by date",
    caption: "First thirteen years to train, last two to test. Never shuffled.",
  },
  {
    key: "naive",
    from: 0.3,
    to: 0.38,
    label: "The baseline, laid over the test",
    caption: "Same-day-of-year mean from the training years. It sits below the truth all year.",
  },
  {
    key: "drift",
    from: 0.38,
    to: 0.47,
    label: "The gap is a constant",
    caption: "Its error is almost exactly the level the series climbed between the two periods.",
  },
  {
    key: "sarimax",
    from: 0.47,
    to: 0.55,
    label: "A different resolution",
    caption: "SARIMAX is not scored on days. The two test years collapse to monthly means.",
  },
  {
    key: "xgboost",
    from: 0.55,
    to: 0.63,
    label: "Prediction on top of truth",
    caption: "The two lines are hard to separate. That is the result the table reports.",
  },
  {
    key: "features",
    from: 0.63,
    to: 0.72,
    label: "What it is looking at",
    caption: "Yesterday and the day before carry 94% of the model. Rainfall carries 0.0007.",
  },
  {
    key: "onestep",
    from: 0.72,
    to: 0.79,
    label: "One step, with the answer supplied",
    caption: "Every point is next-day, given the discharge already measured the day before.",
  },
  {
    key: "peaks",
    from: 0.79,
    to: 0.86,
    label: "Where it is worst",
    caption: "It undershoots the high days. A tenth of the test carries a third of the error.",
  },
  {
    key: "incomparable",
    from: 0.86,
    to: 0.93,
    label: "Three different questions",
    caption: "Daily with the answer, monthly forecast blind, and a mean with no trend term.",
  },
  {
    key: "limits",
    from: 0.93,
    to: 1.0,
    label: "What the benchmark is for",
    caption: "It tests an evaluation pipeline honestly. It is not evidence about a river.",
  },
];

const readers = choreograph(STATES);
export const at = readers.at;
export const active = readers.active;

/**
 * Camera keyframes.
 *
 * `elevation` runs 1 for straight down to 0 for side-on. It stays low throughout, and there is a
 * reason it has to: the series carries its information in Y, so looking down at it from overhead
 * collapses the one axis worth seeing. An early cut opened on a near-plan view and the fifteen-year
 * record rendered as a flat scratch.
 *
 * The move that distinguishes this world from the hydrology one is therefore `travel`, not
 * rotation. That world swung around a static volume; this one walks the length of a bench, which
 * is the right verb for a sequence.
 *
 * `travel` slides the camera along the time axis so the split, the test window and the zoom are
 * arrived at rather than cut to.
 *
 * `look` is the height the camera aims at, and it has to be a per-shot value rather than one
 * constant: the series drifts upward by design, so the two test years sit much higher in world
 * space than the training years do. A fixed aim point framed the early states correctly and let
 * the test window run off the top of the screen.
 */
export const SHOTS: Record<
  StreamflowKey,
  { elevation: number; travel: number; distance: number; height: number; look: number }
> = {
  table: { elevation: 0.12, travel: 0.0, distance: 8.2, height: 1.2, look: 1.15 },
  series: { elevation: 0.34, travel: 0.0, distance: 9.2, height: 1.9, look: 1.5 },
  written: { elevation: 0.3, travel: -0.6, distance: 8.4, height: 1.8, look: 1.5 },
  split: { elevation: 0.22, travel: 1.1, distance: 8.0, height: 1.7, look: 1.55 },
  naive: { elevation: 0.14, travel: 3.6, distance: 5.4, height: 2.4, look: 2.35 },
  drift: { elevation: 0.1, travel: 3.7, distance: 4.8, height: 2.4, look: 2.35 },
  sarimax: { elevation: 0.24, travel: 3.6, distance: 5.6, height: 2.5, look: 2.35 },
  xgboost: { elevation: 0.08, travel: 3.7, distance: 4.6, height: 2.45, look: 2.4 },
  features: { elevation: 0.2, travel: 0.0, distance: 7.8, height: 1.3, look: 1.2 },
  onestep: { elevation: 0.06, travel: 0.0, distance: 5.8, height: 1.6, look: 1.55 },
  peaks: { elevation: 0.05, travel: 0.6, distance: 4.9, height: 1.9, look: 1.85 },
  incomparable: { elevation: 0.6, travel: 3.4, distance: 9.4, height: 3.4, look: 2.1 },
  limits: { elevation: 0.35, travel: 0.0, distance: 10.4, height: 1.5, look: 1.4 },
};
