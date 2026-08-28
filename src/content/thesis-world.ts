/**
 * The thesis, as measured.
 *
 * Every number in this file is copied out of the safe aggregate evidence bundle published in
 * the thesis repository - `analysis_outputs/thesis_intelligence.json`, generated 2026-08-15 from
 * audited source commit fdb4ef0 - and nothing in it is estimated, smoothed or invented. That
 * bundle is classified in its own metadata as a safe aggregate export: no row-level records, no
 * pickle payloads, no absolute paths. The row-level prediction arrays it was computed from stay
 * access-controlled and are not reproduced here.
 *
 * This module exists because the cinematic scene is driven by the real curves. The reliability
 * curve bends the way it does because the model really is that badly calibrated before
 * temperature scaling; the selective-risk curve falls the way it does because those are the
 * measured accepted-set errors. A scene drawn from plausible-looking shapes would be a lie told
 * more convincingly than a paragraph could tell it.
 *
 * Floats are rounded to four decimals for transport. Everything else is verbatim.
 */

/** One held-out policy scenario, as the model actually saw it. */
export const graph = {
  scenarios: 100,
  nodesPerScenario: 31635,
  edgesPerScenario: 59851,
  totalNodes: 3163500,
  totalEdges: 5985100,
} as const;

/** The five input features, in the order the model receives them. */
export const features = [
  { name: "VOL_BASE_CASE", meaning: "Base-case road-segment car volume", unit: "veh/h" },
  { name: "CAPACITY_BASE_CASE", meaning: "Base-case car capacity; zero where cars are not permitted", unit: "veh/h" },
  { name: "CAPACITY_REDUCTION", meaning: "Policy car capacity minus base-case car capacity; reductions are negative", unit: "veh/h" },
  { name: "FREESPEED", meaning: "Policy-scenario free-flow speed where cars are permitted", unit: "source network units" },
  { name: "LENGTH", meaning: "Base-case road-segment length", unit: "source network units" },
] as const;

/*
 * The target is the reason this problem is hard, and the distribution says so plainly: the median
 * change is exactly zero, more than a quarter of all values are exact zeros, and the tail runs far
 * further negative than positive. A surrogate can score well by predicting "nothing happens".
 */
export const target = {
  label: "Change in road-segment car volume",
  unit: "veh/h",
  mean: 0.439,
  median: 0.0,
  std: 11.1956,
  skewness: -6.2136,
  min: -230.381,
  max: 173.0,
  q01: -34.6429,
  q05: -8.3095,
  q25: -0.4762,
  q75: 2.0476,
  q95: 12.2857,
  q99: 26.381,
  exactZeros: 872540,
  zeroFraction: 0.2758,
  distinctValues: 8865,
} as const;

/*
 * PointNetTransfGAT, read off the submitted model definition. The head emits one value per node,
 * which is what makes this a node-level regression over 31,635 road segments at a time.
 */
export const layers = [
  { name: "PointNetConv", kind: "point", note: "Local and global MLPs over each segment and its neighbours, with position" },
  { name: "TransformerConv", kind: "attention", note: "Four attention heads; each head a quarter of the channel width" },
  { name: "GATConv", kind: "attention", note: "Graph attention down to 64 channels" },
  { name: "GATConv head", kind: "head", note: "64 channels to one predicted change per segment" },
] as const;

/*
 * Reliability before calibration. `nominal` is the interval the model claims; `empirical` is the
 * share of held-out values that actually fell inside it. At a nominal 90% the raw Gaussian
 * interval contains under half the truth - the single most important measured fact on the page.
 */
export const reliabilityRaw = [
  { nominal: 0.1, empirical: 0.0477 },
  { nominal: 0.1944, empirical: 0.0923 },
  { nominal: 0.2889, empirical: 0.1362 },
  { nominal: 0.3833, empirical: 0.1797 },
  { nominal: 0.4778, empirical: 0.2234 },
  { nominal: 0.5722, empirical: 0.2691 },
  { nominal: 0.6667, empirical: 0.3183 },
  { nominal: 0.7611, empirical: 0.3746 },
  { nominal: 0.8556, empirical: 0.4438 },
  { nominal: 0.95, empirical: 0.5483 },
] as const;

/** The same curve after temperature scaling, on the tracked 20/80 graph-level protocol. */
export const calibration = {
  protocol: "20/80 graph-level (first 20 cal, last 80 eval)",
  temperature: 2.7025,
  eceBefore: 0.2687,
  eceAfter: 0.0479,
  improvementPct: 82.19,
  status: "tracked and dashboard-reproducible",
  nominal: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95],
  before: [0.0479, 0.095, 0.1414, 0.1873, 0.2341, 0.2834, 0.3375, 0.4012, 0.486, 0.5489],
  after: [0.1256, 0.2372, 0.3388, 0.4342, 0.5227, 0.6016, 0.6705, 0.7328, 0.7952, 0.8329],
} as const;

/*
 * Selective prediction: sort by uncertainty, keep the most confident share, send the rest to
 * review. These are the measured errors of the accepted set at each retention level.
 */
export const selective = [
  { retention: 10, mae: 1.0512, rmse: 2.7969, accepted: 316350, reviewed: 2847150, reductionPct: 73.38 },
  { retention: 15, mae: 1.4075, rmse: 3.2243, accepted: 474525, reviewed: 2688975, reductionPct: 64.35 },
  { retention: 20, mae: 1.6323, rmse: 3.4884, accepted: 632700, reviewed: 2530800, reductionPct: 58.66 },
  { retention: 25, mae: 1.7949, rmse: 3.6926, accepted: 790875, reviewed: 2372625, reductionPct: 54.54 },
  { retention: 30, mae: 1.926, rmse: 3.8566, accepted: 949050, reviewed: 2214450, reductionPct: 51.22 },
  { retention: 35, mae: 2.037, rmse: 4.0092, accepted: 1107225, reviewed: 2056275, reductionPct: 48.41 },
  { retention: 40, mae: 2.1364, rmse: 4.1375, accepted: 1265400, reviewed: 1898100, reductionPct: 45.89 },
  { retention: 45, mae: 2.2315, rmse: 4.2663, accepted: 1423575, reviewed: 1739925, reductionPct: 43.48 },
  { retention: 50, mae: 2.321, rmse: 4.3877, accepted: 1581750, reviewed: 1581750, reductionPct: 41.22 },
  { retention: 55, mae: 2.4123, rmse: 4.5152, accepted: 1739925, reviewed: 1423575, reductionPct: 38.9 },
  { retention: 60, mae: 2.5008, rmse: 4.6371, accepted: 1898100, reviewed: 1265400, reductionPct: 36.66 },
  { retention: 65, mae: 2.5931, rmse: 4.7678, accepted: 2056275, reviewed: 1107225, reductionPct: 34.32 },
  { retention: 70, mae: 2.6907, rmse: 4.9055, accepted: 2214450, reviewed: 949050, reductionPct: 31.85 },
  { retention: 75, mae: 2.7952, rmse: 5.0495, accepted: 2372625, reviewed: 790875, reductionPct: 29.2 },
  { retention: 80, mae: 2.9134, rmse: 5.216, accepted: 2530800, reviewed: 632700, reductionPct: 26.21 },
  { retention: 85, mae: 3.0513, rmse: 5.4141, accepted: 2688975, reviewed: 474525, reductionPct: 22.72 },
  { retention: 90, mae: 3.2264, rmse: 5.6796, accepted: 2847150, reviewed: 316350, reductionPct: 18.28 },
  { retention: 95, mae: 3.4806, rmse: 6.121, accepted: 3005325, reviewed: 158175, reductionPct: 11.85 },
  { retention: 100, mae: 3.9483, rmse: 7.2076, accepted: 3163500, reviewed: 0, reductionPct: 0.0 },
] as const;

/** Can the uncertainty find the worst errors at all? Ranking quality, by error percentile. */
export const errorDetection = [
  { percentile: 90, auroc: 0.7561, auprc: 0.3115, cutoff: 9.93 },
  { percentile: 95, auroc: 0.7764, auprc: 0.215, cutoff: 14.49 },
  { percentile: 99, auroc: 0.8339, auprc: 0.1001, cutoff: 28.0 },
] as const;

/** The audited Trial 8 run the scene is built around: MC Dropout, thirty stochastic passes. */
export const trial8 = {
  method: "MC Dropout (30 stochastic passes)",
  scope: "full cached 100-graph test set",
  rows: 3163500,
  r2: 0.5855, mae: 3.9483, rmse: 7.2076,
  meanSigma: 1.3689,
  spearmanRho: 0.4818,
  rawCoverage90: 0.4856,
  rawCoverage95: 0.5483,
} as const;

/** Every model compared on the held-out test split, with the coverage gate one of them fails. */
export const models = [
  { name: "T7 deterministic", r2: 0.5471, mae: 4.0601, rmse: 7.5343, coverage90: null, coverage95: null, gate: null },
  { name: "T8 deterministic", r2: 0.5957, mae: 3.9573, rmse: 7.1183, coverage90: null, coverage95: null, gate: null },
  { name: "Deep Ensemble", r2: 0.6841, mae: 3.4853, rmse: 6.2927, coverage90: null, coverage95: null, gate: null },
  { name: "T10 CQR midpoint", r2: 0.4057, mae: 4.1305, rmse: 8.6311, coverage90: 0.8947, coverage95: 0.9178, gate: "FAIL" },
  { name: "T11 frozen CQR midpoint", r2: 0.5835, mae: 4.3015, rmse: 7.2251, coverage90: 0.8982, coverage95: 0.9491, gate: "PASS" },
] as const;

/** What the evidence does not cover. Stated in the repository; restated here rather than softened. */
export const limits = [
  "One road network, one city, one corpus.",
  "One intervention family: capacity reduction.",
  "One model family: PointNetTransfGAT.",
  "Coverage is empirical and marginal over the evaluated split. Nodes within a scenario are dependent, so these are not per-scenario or deployment guarantees.",
] as const;

