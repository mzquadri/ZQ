/**
 * Supply chain analytics: a weighting that counts one signal twice.
 *
 * The repository publishes no business metric. It versions source and
 * notebooks only, with no dataset, no processed data, no forecast artefact
 * and no verified figures, and it says so: it makes no claim about any fill
 * rate, on-time-delivery rate, region or forecast accuracy.
 *
 * What it does contain is a supplier scorecard with five weighted
 * components, and the weights are in source. Reading them against the
 * functions they weight turns up something the README only half flags.
 *
 * `score_delivery_reliability` min-max normalises `on_time_rate`, ascending.
 * `score_quality` min-max normalises `late_delivery_rate`, descending. The
 * aggregation defines `late_delivery_rate = 1 - on_time_rate`, and inverting
 * a min-max normalisation of one minus a series returns the original series
 * exactly. The two components are therefore the same number under two names,
 * and together they carry 55% of the composite.
 *
 * The README already warns that the quality-like score is derived from late
 * delivery and must not be read as a supplier-quality assessment. This goes
 * one step further and says what that costs the scorecard.
 */

export const repository = "https://github.com/mzquadri/Supply-Chain-Analytics-Dashboard";

export interface ScoreComponent {
  readonly key: string;
  readonly label: string;
  readonly weight: number;
  /** The column or expression the component is normalised from. */
  readonly source: string;
  /** True where the component is a restatement of another one. */
  readonly duplicate?: true;
}

/** `DEFAULT_WEIGHTS` and the functions each one weights. */
export const components: readonly ScoreComponent[] = [
  {
    key: "delivery_reliability",
    label: "delivery reliability",
    weight: 0.3,
    source: "on_time_rate, ascending",
    duplicate: true,
  },
  {
    key: "quality_score",
    label: "quality",
    weight: 0.25,
    source: "late_delivery_rate, descending",
    duplicate: true,
  },
  {
    key: "cost_efficiency",
    label: "cost efficiency",
    weight: 0.2,
    source: "profit_margin less 0.3 of avg_discount",
  },
  { key: "lead_time_score", label: "lead time", weight: 0.15, source: "avg_lead_time, descending" },
  { key: "flexibility", label: "flexibility", weight: 0.1, source: "total_orders, ascending" },
];

export const duplicated = components.filter((c) => c.duplicate);
export const independent = components.filter((c) => !c.duplicate);

/** The share of the composite that one signal carries, under two names. */
export const duplicatedWeight = duplicated.reduce((t, c) => t + c.weight, 0);

/** What the scorecard is left with once the duplicate is collapsed. */
export const distinctSignals = independent.length + 1;

export const weightText = {
  duplicated: `${Math.round(duplicatedWeight * 100)}%`,
  largestIndependent: `${Math.round(Math.max(...independent.map((c) => c.weight)) * 100)}%`,
} as const;

/** The classical inventory formulas the optimiser implements, verbatim. */
export const formulas = [
  { key: "eoq", label: "order quantity", body: "EOQ = sqrt(2 D S / H)" },
  { key: "ss", label: "safety stock", body: "SS = z sqrt(LT sigma_d^2 + d^2 sigma_LT^2)" },
  { key: "rop", label: "reorder point", body: "ROP = d LT + SS" },
] as const;

export const serviceLevelDefault = 0.95;

/** What the repository withholds, in its own terms. */
export const notPublished = [
  "the source dataset",
  "a processed dataset",
  "trained forecast artefacts",
  "verified business metrics",
] as const;

/** The modules behind the dashboard. */
export const modules = [
  "ingestion and data quality",
  "KPI calculation",
  "demand forecasting against naive baselines",
  "inventory optimisation",
  "supplier scoring",
] as const;
