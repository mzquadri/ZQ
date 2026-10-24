/**
 * Battery state of charge: why the gauge drifts as the cell ages.
 *
 * This chapter carries no battery measurement, because the repository
 * publishes none and is explicit about it. Its own scope section says there is
 * no versioned source split, run configuration, model artifact or metric
 * report to substantiate a score table, and that synthetic-data results
 * demonstrate code execution only rather than estimation performance.
 *
 * So everything below is a statement about the code. The open-circuit-voltage
 * form and the degradation terms are transcribed from the deterministic
 * demonstration generator in `src/data_loader.py`, and the figure is drawn by
 * evaluating that transcription rather than by hand. The two Gaussian noise
 * terms the generator adds to voltage and temperature are omitted, which makes
 * `ocv` the mean curve of the generator rather than one of its samples.
 *
 * None of this describes a real lithium-ion cell. It describes the synthetic
 * cell the repository ships so that its pipeline can be developed and tested
 * without redistributing anyone's data.
 */

export const repository = "https://github.com/mzquadri/Battery-SOC-Estimation-ML";

/** Defaults of `generate_synthetic_battery_data` in `src/data_loader.py`. */
export const generator = {
  cycles: 200,
  pointsPerCycle: 500,
  nominalCapacity: 2.0,
  degradationRate: 0.001,
  seed: 42,
} as const;

/** Rows the default generator produces. */
export const rows = generator.cycles * generator.pointsPerCycle;

/**
 * `temporal_train_test_split` holds back the last `testCycles` cycles.
 *
 * The split is by cycle number and nothing is shuffled, which is the point: two
 * samples a second apart inside one discharge are nearly the same row, so a
 * random split would put almost every test row's twin in the training set and
 * report a score that means nothing.
 */
export const split = {
  testCycles: 50,
  trainFrom: 1,
  trainTo: generator.cycles - 50,
  testFrom: generator.cycles - 50 + 1,
  testTo: generator.cycles,
} as const;

/** Capacity fades linearly in the generator: nominal * (1 - rate * cycle). */
function capacityAt(cycle: number): number {
  return Math.max(generator.nominalCapacity * (1 - generator.degradationRate * cycle), 0.5);
}

export const capacity = {
  fresh: capacityAt(1),
  aged: capacityAt(generator.cycles),
  /** Percentage of nominal capacity lost by the last cycle. */
  fadePercent: Math.round((1 - capacityAt(generator.cycles) / generator.nominalCapacity) * 100),
} as const;

/**
 * The generator's open-circuit-voltage form, noise omitted.
 *
 * V = 3.4 + 0.5s + 0.2s^2 + 0.05 ln(s) - 0.02 ln(1-s) - 0.0001 * cycle
 *
 * The last term is the one this chapter is about. It does not depend on `s`, so
 * ageing lowers the whole curve by the same amount at every state of charge.
 */
export function ocv(soc: number, cycle: number): number {
  const s = Math.min(Math.max(soc, 0.01), 0.99);
  return (
    3.4 +
    0.5 * s +
    0.2 * s * s +
    0.05 * Math.log(s) -
    0.02 * Math.log(1 - s) -
    0.0001 * cycle
  );
}

/**
 * The sampled range of state of charge. The generator clips its own to [0.01, 0.99].
 *
 * Typed as numbers rather than left to `as const`, which would infer the
 * literals as the type and make the bisection below assign to `0.02`.
 */
export const socRange: { readonly from: number; readonly to: number } = {
  from: 0.02,
  to: 0.98,
};

/** Where the fresh curve starts and ends, which sets the voltage axis. */
export const voltageBand = {
  low: ocv(socRange.from, 1),
  high: ocv(socRange.to, 1),
} as const;

/** Read a state of charge off the fresh curve, by bisection. The curve is monotonic in `s`. */
function socFromFreshCurve(volts: number): number {
  let lo = socRange.from;
  let hi = socRange.to;
  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2;
    if (ocv(mid, 1) < volts) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const trueSoc = 0.5;
const agedVolts = ocv(trueSoc, generator.cycles);

/**
 * What ageing costs a gauge that was calibrated on a fresh cell.
 *
 * At the same real state of charge the aged cell sits `volts` lower. Read that
 * voltage against the fresh curve and it comes back as `reads` rather than
 * `truth`, because on this curve a volt is worth a fixed amount of charge and
 * the cell has quietly moved off the curve the lookup was built from.
 */
const readsSoc = socFromFreshCurve(agedVolts);

export const misread = {
  atSoc: Math.round(trueSoc * 100),
  volts: ocv(trueSoc, 1) - agedVolts,
  truth: trueSoc,
  reads: readsSoc,
  /** How many percentage points of charge the lookup gives away. */
  points: (trueSoc - readsSoc) * 100,
} as const;

/** Formatted for prose and for the figure, so the two cannot disagree. */
export const misreadText = {
  volts: misread.volts.toFixed(3),
  points: misread.points.toFixed(1),
  reads: (misread.reads * 100).toFixed(1),
} as const;

/** The regression models in `src/soc_regression.py`. */
export const models = [
  "SVR (RBF)",
  "Random Forest",
  "XGBoost",
  "LightGBM",
  "LSTM",
] as const;

/** What `evaluate_regression` reports. */
export const metrics = ["RMSE", "MAE", "R squared"] as const;

/** The families of engineered feature in `src/feature_engineering.py`. */
export const featureFamilies = [
  { key: "window", label: "rolling window statistics and slopes" },
  { key: "voltage", label: "dV/dt, curvature, dV/dQ and cutoff distances" },
  { key: "thermal", label: "dT/dt, deviation from ambient, an I squared R proxy" },
  { key: "energy", label: "power, cumulative watt hours, resistance from dV/dI" },
] as const;

/** The other analyses the repository carries beside regression. */
export const companions = [
  "K-Means and Gaussian-mixture clustering for operating regimes",
  "a genetic-optimised fuzzy estimator",
  "capacity fade, state of health, resistance and remaining useful life",
] as const;

/**
 * What the README says a benchmark would have to record before a score means
 * anything. Quoted as the repository lists them, because the list is the point.
 */
export const benchmarkNeeds = [
  "cell identifiers",
  "source-data version",
  "preprocessing parameters",
  "temporal split",
  "random seed",
  "dependency versions",
  "evaluation artefacts",
] as const;

/**
 * The window the magnified detail covers.
 *
 * Drawn to scale, the ageing term is about two percent of the voltage axis:
 * the two curves land a few pixels apart and the figure's whole claim becomes
 * one thick line. Exaggerating the gap would be a lie about the magnitude, so
 * the figure keeps the honest plot and puts a magnified window beside it,
 * labelled with how much it magnifies and over what range.
 */
const detailFrom = 0.44;
const detailTo = 0.56;

export const detail = {
  from: detailFrom,
  to: detailTo,
  /** The voltage the detail panel spans, against the full axis it is cut from. */
  volts: ocv(detailTo, 1) - ocv(detailFrom, generator.cycles),
  axisVolts: voltageBand.high - voltageBand.low,
} as const;

/** How much taller the gap reads in the detail than in the plot it is cut from. */
export const detailMagnification = Math.round(detail.axisVolts / detail.volts);
