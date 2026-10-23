import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { experiment, gate, results, split, tests } from "../src/content/mlops-world";
import { canonicalMlopsEvidence } from "../src/content/portfolio";

/*
 * The MLOps numbers on this site are a hand-copied mirror of `EXPECTED` in
 * `scripts/check_reference_run.py` in the MLOps-End-to-End-Pipeline repository, pinned to
 * one commit. That dict is the documented result over there: CI runs the pipeline and
 * asserts a fresh run against it, so it is the right thing to mirror.
 *
 * Unlike the gateway and InsureAssist mirrors, this one had **not** drifted: it pinned
 * `ada5465` and stated `bundleFormat: "1.1"`, which is exactly what that commit carries.
 * The guard is here so it stays that way, not because it had failed.
 *
 * The fixture is the pinned `EXPECTED` dict, extracted from the file with `ast` rather
 * than retyped, and it records the commit it came from. It is a copy rather than a fetch
 * because this suite runs offline, and a test that reaches GitHub fails for reasons that
 * have nothing to do with this repository.
 */

interface Fixture {
  _source: string;
  bundle_format_version: string;
  dataset: { key: string; kind: string; license: string; sha256: string };
  metric_tolerance: number;
  metrics: Record<string, number>;
  split: {
    random_state: number;
    stratified: boolean;
    test_rows: number;
    train_rows: number;
    validation_rows: number;
  };
}

const fixture = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "tests", "fixtures", "mlops-documented-result.json"),
    "utf8",
  ),
) as Fixture;

test("the dataset and bundle format match the pinned documented result", () => {
  assert.equal(experiment.dataset, fixture.dataset.key, "dataset key does not match");
  assert.equal(experiment.datasetKind, fixture.dataset.kind, "dataset kind does not match");
  assert.equal(experiment.licence, fixture.dataset.license, "dataset licence does not match");
  assert.equal(
    experiment.bundleFormat,
    fixture.bundle_format_version,
    "bundle format does not match the pinned file",
  );

  /* The site shows a short hash; it has to be a real prefix of the pinned one. */
  assert.ok(
    fixture.dataset.sha256.startsWith(experiment.datasetSha256),
    `datasetSha256 ${experiment.datasetSha256} is not a prefix of ${fixture.dataset.sha256}`,
  );
});

test("the test counts partition the suite", () => {
  /*
   * The markers partition it, so the parts must account for the whole. This is the check
   * the generator's old literal did not have: 93 offline plus 6 container came to 99 and
   * read as self-consistent while the real total was 164 and five network tests existed
   * that it did not count at all.
   */
  assert.equal(
    tests.offline + tests.network + tests.container,
    tests.total,
    `counts do not add up: ${tests.offline} + ${tests.network} + ${tests.container} != ${tests.total}`,
  );
  for (const [name, value] of Object.entries(tests)) {
    assert.ok(Number.isInteger(value) && value > 0, `${name} is not a positive integer`);
  }
});

test("the split matches the pinned documented result", () => {
  assert.equal(split.train, fixture.split.train_rows, "train rows do not match");
  assert.equal(split.validation, fixture.split.validation_rows, "validation rows do not match");
  assert.equal(split.test, fixture.split.test_rows, "test rows do not match");
  assert.equal(split.randomState, fixture.split.random_state, "random state does not match");
  assert.equal(split.stratified, fixture.split.stratified, "stratified flag does not match");
});

test("the published metrics match the pinned documented result", () => {
  const pairs: [number, number, string][] = [
    [results.accuracy, fixture.metrics.accuracy, "accuracy"],
    [results.f1Weighted, fixture.metrics.f1_weighted, "f1_weighted"],
    [results.rocAuc, fixture.metrics.roc_auc, "roc_auc"],
    [results.prAuc, fixture.metrics.pr_auc, "pr_auc"],
    [results.baselineAccuracy, fixture.metrics.baseline_accuracy, "baseline_accuracy"],
    [
      results.accuracyOverBaseline,
      fixture.metrics.accuracy_over_baseline,
      "accuracy_over_baseline",
    ],
  ];
  for (const [mine, theirs, name] of pairs) {
    assert.equal(mine, theirs, `${name} does not match the pinned file`);
  }

  assert.equal(
    results.tolerance,
    fixture.metric_tolerance,
    "the stated tolerance is not the one the checker applies",
  );
});

test("the gate mirrors the four checks the pipeline composes", () => {
  /*
   * Four, not three. The repository composes accuracy, f1_weighted,
   * accuracy_over_baseline and latency_p95 under `all()`. A reader counting the three
   * threshold names in the config misses latency_p95, whose threshold is max_latency_ms.
   */
  assert.equal(gate.length, 4, "the gate must mirror all four checks");

  const byKey = new Map<string, (typeof gate)[number]>(gate.map((check) => [check.key, check]));
  for (const key of ["accuracy", "f1_weighted", "accuracy_over_baseline", "latency_p95"]) {
    assert.ok(byKey.has(key), `the gate is missing ${key}`);
  }

  /* Three metric checks read their observed value from the same documented result. */
  assert.equal(byKey.get("accuracy")?.value, fixture.metrics.accuracy);
  assert.equal(byKey.get("f1_weighted")?.value, fixture.metrics.f1_weighted);
  assert.equal(
    byKey.get("accuracy_over_baseline")?.value,
    fixture.metrics.accuracy_over_baseline,
  );

  /* Every check must state a direction, and the margin check must be the >= kind. */
  for (const check of gate) {
    assert.ok([">=", "<="].includes(check.comparison), `${check.key} has no comparison`);
  }
  assert.equal(byKey.get("accuracy_over_baseline")?.comparison, ">=");
  assert.equal(byKey.get("latency_p95")?.comparison, "<=");
});

test("the fixture names the commit the site actually pins", () => {
  assert.match(canonicalMlopsEvidence.commit, /^[0-9a-f]{40}$/);
  const short = canonicalMlopsEvidence.commit.slice(0, 7);
  assert.ok(
    fixture._source.includes(short),
    `the fixture was taken from ${fixture._source}, but the site pins ${short}`,
  );
});

test("every MLOps evidence link uses the pinned commit", () => {
  const { commit, repository, ...links } = canonicalMlopsEvidence;

  /*
   * Only the /blob/ links are pinned. `actions` is the live workflow-runs view, which is a
   * status page rather than a source for a published number, so it carries no commit.
   */
  const entries = Object.entries(links).filter(
    ([, href]) => typeof href === "string" && (href as string).includes("/blob/"),
  );
  assert.ok(entries.length > 0, "there must be evidence links to check");
  for (const [name, href] of entries) {
    assert.ok(
      (href as string).startsWith(`${repository}/blob/${commit}/`),
      `${name} does not cite the pinned commit: ${href}`,
    );
  }
});
