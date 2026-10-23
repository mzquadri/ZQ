import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  configurations,
  controls,
  gatewaySource,
  limits,
  verdict,
} from "../src/content/gateway-world";
import { projects } from "../src/content/portfolio";

const contentDirectory = path.join(process.cwd(), "src", "content");
const readContent = (file: string) => readFileSync(path.join(contentDirectory, file), "utf8");

/*
 * The gateway numbers on this site are a hand-copied mirror of assets/results.json in the
 * mcp-policy-gateway repository, pinned to one commit. That is the right way to cite a result:
 * the pin makes the citation stable while the repository moves on. It also means nothing here is
 * recomputed, so the only thing that can keep the mirror honest is a check that its parts still
 * agree with each other.
 */

test("the pinned commit is written once and every evidence link uses it", () => {
  assert.match(gatewaySource.commit, /^[0-9a-f]{7,40}$/);

  /*
   * The commit used to be written six times: twice in gateway-world.ts and four more in
   * portfolio.ts, and the field documented as the pin was read by none of them. Bumping it would
   * have relabelled the citation while every link kept pointing at the old commit, resolving
   * perfectly and quoting different numbers. Only the declaration may name it literally.
   */
  const occurrences = (file: string) =>
    readContent(file).split(gatewaySource.commit).length - 1;
  assert.equal(occurrences("gateway-world.ts"), 1, "the commit must be declared exactly once");
  assert.equal(occurrences("portfolio.ts"), 0, "portfolio.ts must use gatewaySource.file()");

  const gateway = projects.find((project) => project.repository === gatewaySource.repository);
  assert.ok(gateway, "the gateway project must be in the portfolio");
  const artifacts = gateway.artifacts ?? [];
  assert.ok(artifacts.length > 0, "the gateway project must cite artifacts");
  for (const artifact of artifacts) {
    assert.ok(
      artifact.href.startsWith(`${gatewaySource.repository}/blob/${gatewaySource.commit}/`),
      `${artifact.label} does not cite the pinned commit: ${artifact.href}`,
    );
  }
});

test("the prose states the same catch rate as the table", () => {
  const gateway = configurations.find((configuration) => configuration.key === "gateway");
  assert.ok(gateway);

  /*
   * The limits section names the headline number in words. A prose number beside the data it
   * describes is the pair most likely to drift, because editing one reads as a wording change.
   */
  const stated = `${(gateway.caught * 100).toFixed(1)}%`;
  const mentions = limits.filter((limit) => limit.includes(stated));
  assert.equal(mentions.length, 1, `no limit states the catch rate as ${stated}`);
});

test("the published rates are rates, and the ranking the site argues holds", () => {
  for (const configuration of configurations) {
    for (const [name, value] of [
      ["caught", configuration.caught],
      ["falseBlock", configuration.falseBlock],
    ] as const) {
      assert.ok(
        value >= 0 && value <= 1,
        `${configuration.key} ${name} is ${value}, which is not a rate`,
      );
    }
    assert.ok(configuration.micros >= 0, `${configuration.key} cannot take negative time`);
  }

  const by = (key: string) => {
    const found = configurations.find((configuration) => configuration.key === key);
    assert.ok(found, `${key} is missing from the table`);
    return found;
  };

  /* The whole argument of the page: the gateway beats the filter on both axes at once. */
  assert.ok(by("gateway").caught > by("keyword").caught);
  assert.ok(by("gateway").falseBlock < by("keyword").falseBlock);
  assert.equal(by("baseline").caught, 0, "a baseline that catches something is not a baseline");
});

/*
 * The check the other tests in this file could not make.
 *
 * Everything below compares this site's copy of the gateway numbers with itself, which is why
 * `cases: 44`, `benign: 18` and `medianMicros: 99.6` sat here until 2026-10-23 while the pin above
 * them read `11c0017`. Those three are the numbers from `b6ebf71` of 2026-08-31; by `11c0017` the
 * corpus was already 47 cases with 21 benign. The page cited one commit and quoted another, each
 * part agreed with every other part, and every assertion passed.
 *
 * A mirror cannot be kept honest by internal agreement alone. So the pinned
 * `assets/summary.json` is committed verbatim as a fixture and compared field by field. Updating
 * the pin now means replacing the fixture, and a pin moved without it fails here.
 *
 * The fixture is a copy rather than a fetch on purpose: the test suite runs offline, and a test
 * that reaches GitHub would fail for reasons that have nothing to do with this repository.
 */
test("the published numbers match assets/summary.json at the pinned commit", () => {
  const fixture = JSON.parse(
    readFileSync(path.join(process.cwd(), "tests", "fixtures", "mcp-policy-gateway-summary.json"), "utf8"),
  ) as Record<string, number>;

  assert.equal(verdict.cases, fixture.corpus_cases, "corpus total does not match the pinned file");
  assert.equal(verdict.attacks, fixture.attacks, "attack count does not match the pinned file");
  assert.equal(verdict.benign, fixture.benign, "benign count does not match the pinned file");
  assert.equal(
    verdict.attackClasses,
    fixture.attack_classes,
    "attack class count does not match the pinned file",
  );
  assert.equal(verdict.controls, fixture.controls, "control count does not match the pinned file");
  assert.equal(
    verdict.medianMicros,
    fixture.median_micros,
    "median decision time does not match the pinned file",
  );

  const expected: Record<string, { caught: number; falseBlock: number }> = {
    baseline: { caught: fixture.baseline_caught, falseBlock: 0 },
    keyword: { caught: fixture.keyword_caught, falseBlock: fixture.keyword_false_block },
    gateway: { caught: fixture.gateway_caught, falseBlock: fixture.gateway_false_block },
  };

  for (const [key, want] of Object.entries(expected)) {
    const found = configurations.find((configuration) => configuration.key === key);
    assert.ok(found, `${key} is missing from the table`);
    assert.equal(found.caught, want.caught, `${key} catch rate does not match the pinned file`);
    assert.equal(
      found.falseBlock,
      want.falseBlock,
      `${key} false-block rate does not match the pinned file`,
    );
  }
});

test("the corpus totals, the control count and the timing agree across the page", () => {
  assert.equal(
    verdict.cases,
    verdict.attacks + verdict.benign,
    "the corpus halves do not add up to the total the page states",
  );
  assert.equal(verdict.controls, controls.length, "the stated control count is not the list length");

  const gateway = configurations.find((configuration) => configuration.key === "gateway");
  assert.ok(gateway);
  assert.equal(
    verdict.medianMicros,
    gateway.micros,
    "the headline decision time and the table row disagree",
  );

  /*
   * Per-control counts overlap, because several cases trip more than one control, so they sum to
   * more than the corpus. What none of them may do is beat the configuration they belong to.
   */
  const caught = Math.round(gateway.caught * verdict.attacks);
  for (const control of controls) {
    assert.ok(
      control.caught <= caught,
      `${control.name} claims ${control.caught} of ${verdict.attacks} attacks, more than the ` +
        `${caught} the gateway caught in total`,
    );
  }
});
