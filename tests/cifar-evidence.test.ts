import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { chapter, chapterClasses } from "../src/content/cifar-chapter";
import { confusion, perClass, project, result, structure } from "../src/content/cifar-world";

/*
 * The CIFAR evidence on this site was the one featured project with no pinned commit.
 *
 * `tools/gen-cifar-world.py` fetched from `main`, so the generated numbers described
 * whatever that branch held when the generator last ran, and nothing recorded which
 * commit that was. A reader following an evidence link reached today's `main`, which
 * is not necessarily the file the published number came from. The same generator also
 * cached by path and never revalidated, so a later run could reuse bytes fetched
 * before the branch moved.
 *
 * Nothing had drifted when this test was written, and that is the point of adding it
 * then rather than later: every published value below was checked against the file it
 * cites and matched. Three of the five mirrors reviewed before this one had drifted,
 * and in each case nothing could see it because every check compared the site's copy
 * of a number with itself.
 *
 * So the fixture is `results/test_results.json` at the pinned commit, copied verbatim
 * apart from the `_source` line, and compared field by field. It is a copy rather than
 * a fetch because this suite runs offline. Moving `project.commit` without replacing
 * the fixture fails the last test here.
 */

interface Fixture {
  _source: string;
  test_accuracy: number;
  test_loss: number;
  best_val_accuracy: number;
  best_epoch: number;
  total_epochs: number;
  training_time_s: number;
  n_parameters: number;
  per_class_accuracy: Record<string, number>;
}

const fixture = JSON.parse(
  readFileSync(path.join(process.cwd(), "tests", "fixtures", "cifar-test-results.json"), "utf8"),
) as Fixture;

test("the headline result matches the results file it cites", () => {
  assert.equal(result.testAccuracy, fixture.test_accuracy, "test accuracy does not match");
  assert.equal(result.testLoss, fixture.test_loss, "test loss does not match");
  assert.equal(
    result.bestValAccuracy,
    fixture.best_val_accuracy,
    "best validation accuracy does not match",
  );
  assert.equal(result.bestEpoch, fixture.best_epoch, "best epoch does not match");
  assert.equal(result.source, "results/test_results.json", "the citation names another file");
});

test("the parameter count matches, and it is the one the repository verifies", () => {
  /*
   * Worth checking separately from the metrics: upstream builds the nn.Module and counts
   * these, and fails its own check if the total moves. 815,018 is therefore a measured
   * number on both sides rather than a figure copied twice.
   */
  assert.equal(project.parameters, fixture.n_parameters, "parameter count does not match");
  assert.equal(project.parameters, 815018);
});

test("every per-class accuracy matches, for all ten classes", () => {
  assert.equal(perClass.length, 10, "ten classes must be published");
  for (const entry of perClass) {
    const theirs = fixture.per_class_accuracy[entry.cls];
    assert.ok(theirs !== undefined, `the results file has no class ${entry.cls}`);
    assert.equal(entry.accuracy, theirs, `${entry.cls} accuracy does not match the results file`);
  }

  for (const entry of chapterClasses) {
    assert.equal(
      entry.accuracy,
      fixture.per_class_accuracy[entry.cls],
      `the homepage chapter's ${entry.cls} bar does not match the results file`,
    );
  }
});

test("the confusion matrix agrees with the per-class accuracies it was transcribed beside", () => {
  /*
   * The matrix is the one value on this page not read from a JSON file: upstream tracks
   * the figure, not the array behind it, so it was transcribed. These are the checks that
   * make a transcription trustworthy, re-run here rather than trusted from the generator.
   */
  assert.equal(confusion.length, 10);
  for (const [i, row] of confusion.entries()) {
    assert.equal(row.length, 10, `row ${i} is not ten wide`);
    assert.equal(
      row.reduce((a, b) => a + b, 0),
      1000,
      `row ${i} does not sum to the 1,000 test images per class`,
    );
    const cls = perClass[i].cls;
    assert.equal(
      row[i] / 10,
      fixture.per_class_accuracy[cls],
      `the diagonal for ${cls} disagrees with its recorded accuracy`,
    );
  }

  const trace = confusion.reduce((sum, row, i) => sum + row[i], 0);
  assert.equal(trace / 100, fixture.test_accuracy, "the trace does not give the test accuracy");
});

test("the aggregate is published next to the spread that makes it readable", () => {
  /*
   * The repository's own stated lesson, and this site's stated limitation, is that 64.26%
   * is the mean of a wide spread. Publishing the headline without the worst class would
   * repeat on this page the overstatement the repository exists to avoid.
   */
  const values = Object.values(fixture.per_class_accuracy);
  const best = Math.max(...values);
  const worst = Math.min(...values);

  assert.equal(structure.bestAccuracy, best, "the best class accuracy does not match");
  assert.equal(structure.worstAccuracy, worst, "the worst class accuracy does not match");
  assert.equal(
    structure.spread,
    Math.round((best - worst) * 10) / 10,
    "the published spread is not the real distance between best and worst",
  );
  assert.equal(chapter.worstAccuracy, worst, "the chapter's worst class does not match");
  assert.equal(chapter.bestAccuracy, best, "the chapter's best class does not match");
  assert.equal(chapter.testAccuracy, fixture.test_accuracy);
});

test("the largest confusion the page names is the largest one in the matrix", () => {
  let largest = { from: "", to: "", count: -1 };
  for (const [i, row] of confusion.entries()) {
    for (const [j, count] of row.entries()) {
      if (i !== j && count > largest.count) {
        largest = { from: perClass[i].cls, to: perClass[j].cls, count };
      }
    }
  }

  assert.equal(chapter.topFrom, largest.from, "the chapter names the wrong source class");
  assert.equal(chapter.topTo, largest.to, "the chapter names the wrong predicted class");
  assert.equal(chapter.topCount, largest.count, "the chapter's count is not the largest cell");
});

test("the evidence is pinned to a commit, and the fixture came from that commit", () => {
  /*
   * The defect this file was added for. Without a pin there is no way to tell which
   * commit a published number describes, and an evidence link resolves to whatever the
   * branch holds now. With one, a moved pin and a stale fixture fail here together.
   */
  assert.match(
    project.commit,
    /^[0-9a-f]{40}$/,
    "project.commit must be a full commit SHA, not a branch name or a short hash",
  );
  assert.ok(
    fixture._source.includes(project.commit),
    `the fixture came from ${fixture._source}, which is not the pinned commit ${project.commit}`,
  );
  assert.ok(
    fixture._source.includes(project.metricsSource),
    `the fixture does not name ${project.metricsSource}, which the page cites`,
  );
});
