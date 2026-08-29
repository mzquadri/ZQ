import assert from "node:assert/strict";
import test from "node:test";

import { ecosystemRepositories } from "../src/content/ecosystem";
import { evidenceSplit, strongWork } from "../src/content/strong-work";

/*
 * The supporting movement is a claim about evidence, so it is tested as one.
 *
 * The section's argument is that two of these repositories publish tracked numbers and five
 * deliberately publish none. If a number ever appears under a repository that does not print it,
 * the section stops being true - and it would still look completely fine on screen, which is
 * exactly why it needs a test rather than a review.
 */

test("every staged repository exists in the audited index", () => {
  const known = new Set(ecosystemRepositories.map((repository) => repository.name));
  for (const work of strongWork) {
    assert.ok(known.has(work.repository), `${work.repository} is staged but not indexed`);
  }
});

test("each scene tells one story once", () => {
  const names = strongWork.map((work) => work.repository);
  assert.equal(new Set(names).size, names.length);

  for (const work of strongWork) {
    for (const [field, value] of Object.entries({
      premise: work.premise,
      input: work.input,
      transform: work.transform,
      limitation: work.limitation,
    })) {
      assert.ok(value.trim().length > 40, `${work.repository} has a thin ${field}`);
    }
    /* Every scene ends on where it stops. A limitation that reads as a boast is not one. */
    assert.ok(work.limitation.trim().endsWith("."), `${work.repository} limitation is unfinished`);
  }
});

test("a published number is on a shared axis and stays on it", () => {
  for (const work of strongWork) {
    if (work.evidence.kind !== "measured") continue;
    assert.ok(work.evidence.bars.length >= 2, `${work.repository} needs a comparison, not one bar`);
    for (const bar of work.evidence.bars) {
      /*
       * The bar's width *is* the value, so a value outside 0-1 would silently render off the end
       * of the track. Mixed-unit figures belong in the readouts, which have no axis to lie about.
       */
      assert.ok(bar.value > 0 && bar.value <= 1, `${work.repository}: ${bar.label} is off the axis`);
    }
    assert.ok(work.evidence.caveat.length > 40, `${work.repository} states no caveat`);
  }
});

test("a repository that publishes no metric shows no number", () => {
  for (const work of strongWork) {
    if (work.evidence.kind !== "withheld") continue;
    assert.ok(work.evidence.absent.length >= 3, `${work.repository} names too few absent quantities`);
    /*
     * The tightest guard in this file. A withheld scene must contain no score anywhere in its
     * prose either - the moment a decimal appears next to a repository that publishes none, the
     * page is asserting something the repository refused to.
     */
    const prose = [work.premise, work.input, work.transform, work.limitation, work.evidence.reason].join(" ");
    assert.doesNotMatch(prose, /\b0\.\d+\b/, `${work.repository} prints a score it does not have`);
  }
});

test("the section's own summary matches the repositories behind it", () => {
  const { measured, demonstrated, withheld } = evidenceSplit();
  assert.equal(measured.length + demonstrated.length + withheld.length, strongWork.length);
  /* The lede leads with these counts. They are derived, never typed, but the shape is asserted. */
  assert.equal(measured.length, 2);
  assert.equal(withheld.length, 5);
  assert.ok(withheld.length > measured.length, "the honest majority is the point of the section");
});
