import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { finding, metricsSource, models, split } from "../src/content/streamflow-world";

/*
 * The streamflow numbers on this site were a hand-copied mirror of a file that no longer
 * exists.
 *
 * `tools/gen-streamflow-world.py` fetched `results/forecast_results.json` and
 * `results/xgboost_model.pkl` from that repository. Both were removed upstream: the first
 * replaced by `results/benchmark.json`, the second untracked entirely. So the generator
 * could not run, nothing re-checked the numbers, and two of the three published models had
 * drifted to the earlier reference run's values: XGBoost at RMSE 3.71 against an actual
 * 3.1233, SARIMAX at 13.536 against an actual 4.679. `metricsSource` still named the
 * missing file, so a reader following the citation got a 404.
 *
 * Worse than either wrong number, the two baselines that carry the result were absent, so
 * the page showed XGBoost at R2 0.985 beside a baseline at -11.69 and read as a success.
 * The repository's finding is the opposite.
 *
 * The fixture is the published blocks of `results/benchmark.json`, copied verbatim, and
 * compared field by field. It is a copy rather than a fetch because this suite runs
 * offline.
 */

interface Metric {
  rmse: number;
  mae: number;
  r2: number;
  nse: number;
  mape_percent: number;
  n: number;
}

interface Fixture {
  _source: string;
  daily: Record<string, Metric>;
  monthly: Record<string, Metric>;
  split: { train_days: number; test_days: number; scored_daily_rows: number };
  best_daily: string;
  xgboost_beats_persistence: boolean;
  robustness: { xgboost_beats_persistence_count: number; seeds_tested: number };
  mechanism: { daily_change_std: number };
}

const fixture = JSON.parse(
  readFileSync(path.join(process.cwd(), "tests", "fixtures", "streamflow-benchmark.json"), "utf8"),
) as Fixture;

/** Site key to the name the benchmark file uses, and which table it comes from. */
const MAPPING: [string, "daily" | "monthly", string][] = [
  ["ridge", "daily", "ridge_on_features"],
  ["persistence", "daily", "persistence"],
  ["xgboost", "daily", "xgboost"],
  ["naive", "daily", "day_of_year_mean"],
  ["sarimax", "monthly", "sarimax"],
];

const round = (value: number, places: number) => {
  const f = 10 ** places;
  return Math.round(value * f) / f;
};

test("every published model matches the benchmark file it is taken from", () => {
  for (const [key, table, name] of MAPPING) {
    const mine = models.find((m) => m.key === key);
    assert.ok(mine, `the site no longer publishes ${key}`);
    const theirs = fixture[table][name];
    assert.ok(theirs, `the benchmark file has no ${table}.${name}`);

    for (const field of ["rmse", "mae", "r2", "nse"] as const) {
      assert.equal(
        mine[field],
        round(theirs[field], 4),
        `${key} ${field} does not match ${table}.${name} in the benchmark file`,
      );
    }
    assert.equal(
      mine.mape,
      round(theirs.mape_percent, 4),
      `${key} mape does not match ${table}.${name}`,
    );
  }
});

test("the two baselines that carry the result are published", () => {
  /*
   * The guard against the defect this file exists for. XGBoost's score beside a
   * day-of-year mean reads as a success; it is only readable next to the baseline that
   * beats it, and next to the one method that beats that baseline.
   */
  for (const key of ["persistence", "ridge"]) {
    assert.ok(models.some((m) => m.key === key), `${key} must be published, not just XGBoost`);
  }

  const by = (key: string) => models.find((m) => m.key === key)!;
  assert.ok(
    by("persistence").rmse < by("xgboost").rmse,
    "persistence must be shown beating XGBoost, which is the repository's finding",
  );
  assert.ok(
    by("ridge").rmse < by("persistence").rmse,
    "ridge must be shown beating persistence",
  );
});

test("the finding agrees with the benchmark file", () => {
  assert.equal(
    finding.xgboostBeatsPersistence,
    fixture.xgboost_beats_persistence,
    "the stated finding contradicts the benchmark file",
  );
  assert.equal(finding.seedsTested, fixture.robustness.seeds_tested);
  assert.equal(
    finding.seedsWhereXgboostWins,
    fixture.robustness.xgboost_beats_persistence_count,
  );
  assert.equal(finding.dailyChangeStd, fixture.mechanism.daily_change_std);

  /* best_daily is a benchmark key; the site shows a label. Check they refer to one thing. */
  assert.equal(fixture.best_daily, "ridge_on_features");
  assert.equal(finding.bestDaily, models.find((m) => m.key === "ridge")!.label);
});

test("the split matches, and the daily rows are the scored ones", () => {
  assert.equal(split.trainDays, fixture.split.train_days, "train days do not match");
  assert.equal(split.testDays, fixture.split.test_days, "test days do not match");

  /*
   * Every daily row published must be the number actually scored, not the raw test length.
   * The feature models lose the first 365 rows to their longest lag and the baselines are
   * rescored to match, so a table quoting different counts per row would be comparing
   * different tasks without saying so.
   */
  const scored = `${fixture.split.scored_daily_rows} daily values`;
  for (const [key, table] of MAPPING.map(([k, t]) => [k, t] as const)) {
    if (table !== "daily") continue;
    assert.equal(
      models.find((m) => m.key === key)!.scoredOn,
      scored,
      `${key} does not state the scored row count`,
    );
  }
});

test("the citation names a file the repository actually publishes", () => {
  assert.equal(
    metricsSource,
    "results/benchmark.json",
    "metricsSource must name the file that exists; forecast_results.json was removed upstream",
  );
  assert.ok(
    fixture._source.includes(metricsSource),
    `the fixture came from ${fixture._source}, which does not name ${metricsSource}`,
  );
});
