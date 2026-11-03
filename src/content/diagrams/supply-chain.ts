import type { ProjectDiagram } from "./types";

/**
 * Three analyses off one table, and an audit that points back at one of them.
 *
 * The modules are the repository's own: `data_ingestion.py` validates the schema and profiles
 * every column before anything reads it, `kpi_engine.py` carries the three KPI views,
 * `demand_forecasting.py` splits chronologically rather than at random, `inventory_optimizer.py`
 * computes EOQ and a reorder point, and `supplier_scoring.py` normalises five components into one
 * number.
 *
 * The weighting audit is drawn as an artifact with a path back to the scorecard rather than as a
 * box in the flow, because that is what it is: not a stage the dashboard runs, but a reading of
 * the scorecard's own weights against the functions they weight. `aggregate_supplier_metrics`
 * defines the late-delivery rate as one minus the on-time rate, and inverting a min-max
 * normalisation of one minus a series returns the series exactly - so two of the five components
 * are equal for every supplier. Drawing it inline would imply the dashboard knows; it does not,
 * which is the finding.
 */
export const supplyChainDiagram: ProjectDiagram = {
  slug: "supply-chain",
  title: "One table, three analyses, and two components that are one",
  caption:
    "The three analyses are genuinely independent readings of the same order table. The scorecard is not: two of its five weighted components normalise to the same series, which the audit path is drawn to show.",
  accent: "var(--accent-pipeline)",
  nodes: [
    {
      id: "orders",
      label: "Order table",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      tools: ["pandas"],
      note: "Schema validated and every column profiled before use.",
    },
    {
      id: "kpis",
      label: "KPI engine",
      kind: "process",
      col: 1,
      row: 0,
      stages: [1],
      note: "Overview, shipping and financial views over the same rows.",
    },
    {
      id: "scorecard",
      label: "Supplier scorecard",
      kind: "process",
      col: 1,
      row: 1,
      stages: [4],
      note: "Five components, min-max normalised, combined by weight.",
    },
    {
      id: "forecast",
      label: "Demand forecast",
      kind: "process",
      col: 1,
      row: 2,
      stages: [2],
      tools: ["statsmodels"],
      note: "Chronological holdout, measured against naive baselines.",
    },
    {
      id: "inventory",
      label: "Inventory policy",
      kind: "process",
      col: 2,
      row: 2,
      stages: [3],
      tools: ["SciPy"],
      note: "EOQ, safety stock and reorder point at a service level.",
    },
    /*
     * Parked on its own row rather than beside the scorecard. Column 2 has to stay clear at rows 0
     * and 1 so the KPI and scorecard edges can reach the dashboard without crossing a box.
     */
    {
      id: "audit",
      label: "Weighting audit",
      kind: "artifact",
      col: 2,
      row: 3,
      note: "Reads the weights against the functions they weight.",
    },
    {
      id: "dashboard",
      label: "Dashboard",
      kind: "sink",
      col: 3,
      row: 1,
      tools: ["Plotly Dash"],
      note: "Publishes no business metric; the repository versions code only.",
    },
  ],
  edges: [
    { from: "orders", to: "kpis", kind: "data" },
    { from: "orders", to: "scorecard", kind: "data" },
    { from: "orders", to: "forecast", kind: "data" },
    { from: "forecast", to: "inventory", kind: "data", label: "demand input" },
    { from: "scorecard", to: "audit", kind: "control", label: "weights" },
    { from: "kpis", to: "dashboard", kind: "data" },
    { from: "scorecard", to: "dashboard", kind: "data" },
    { from: "inventory", to: "dashboard", kind: "data" },
    { from: "audit", to: "scorecard", kind: "feedback", label: "two of five are one signal" },
  ],
};
