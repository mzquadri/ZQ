import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  changeRules,
  checkLevels,
  countIllustration,
  generationRecords,
  generations,
  representations,
  showcase,
} from "../src/content/systems-showcase";

/*
 * The public showcase sits on a published route, so its content is held to the same standard as
 * anything else the site publishes - and additionally to the rule that it must not read as a
 * picture of a private system.
 */

const EMPLOYER_TERMS = [
  "legal", "statute", "law", "corpus", "BP-IT", "bp-itcs", "gesetze", "CELEX",
  "verification gate", "re-ingestion", "preprocessor", "entity producer",
];

function everyString(): string[] {
  return [
    showcase.eyebrow, showcase.title, showcase.introduction, showcase.note,
    ...representations.flatMap((r) => [r.role, r.name, r.holds, r.derivedFrom, r.checkedBy]),
    ...countIllustration.flatMap((c) => [c.store, c.total, c.detail]),
    ...changeRules.flatMap((r) => [r.change, r.outcome, r.detail]),
    ...generations.flatMap((g) => [g.name, g.note]),
    ...generationRecords.map((r) => r.label),
    ...checkLevels.flatMap((l) => [l.name, l.rulesOut, l.stillOpen]),
  ];
}

test("the showcase names no employer, domain, or private system", () => {
  const text = everyString().join(" ").toLowerCase();
  for (const term of EMPLOYER_TERMS) {
    assert.ok(!text.includes(term.toLowerCase()), `showcase copy mentions "${term}"`);
  }
});

test("the showcase publishes no endpoint and no quantity", () => {
  for (const value of everyString()) {
    assert.ok(
      !/https?:|\bhttp\b|localhost|\.(?:internal|local|lan|corp)\b|\b\d{1,3}(?:\.\d{1,3}){3}\b/i.test(value),
      `showcase copy leaks an endpoint: ${value}`,
    );
    // Illustrative amounts are words, so a numeral here would read as a measurement.
    assert.equal(value.match(/\d{2,}/g), null, `showcase copy publishes a number: ${value}`);
  }
});

test("it says plainly that it is a model rather than a system", () => {
  assert.match(showcase.note.toLowerCase(), /illustrative|synthetic/);
  assert.match(showcase.introduction.toLowerCase(), /illustrative|model/);
});

test("the model is complete enough to teach the idea", () => {
  assert.deepEqual(representations.map((r) => r.id), ["records", "vectors", "graph"]);
  assert.equal(representations.filter((r) => r.role === "Canonical").length, 1);
  assert.deepEqual(
    changeRules.map((r) => r.disposition),
    ["retained", "added", "replaced", "pruned"],
  );
  assert.deepEqual(generations.map((g) => g.id), ["history", "previous", "current"]);
  assert.ok(checkLevels.length >= 4, "the comparison ladder needs enough levels to show escalation");
  for (const level of checkLevels) {
    assert.ok(level.rulesOut.trim().length > 0, `${level.name} states nothing it rules out`);
    assert.ok(level.stillOpen.trim().length > 0, `${level.name} states nothing it leaves open`);
  }
});

test("the public showcase imports nothing from the confidential case study", () => {
  for (const file of [
    "src/content/systems-showcase.ts",
    "src/components/systems-showcase/SystemsShowcase.tsx",
  ]) {
    const source = readFileSync(resolve(file), "utf8");
    assert.ok(!/legal-kb/.test(source), `${file} reaches into confidential content`);
  }
});

test("the shared scene geometry carries no words at all", () => {
  const source = readFileSync(resolve("src/content/scene-geometry.ts"), "utf8");
  // Labels are what would leak; coordinates cannot. Comments are allowed, string data is not.
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const strings = withoutComments.match(/"[^"]*"|'[^']*'/g) ?? [];
  const dataStrings = strings.filter((s) => !/^["'](unit|external|unresolved|self|[a-z])["']$/.test(s));
  assert.deepEqual(dataStrings, [], `scene geometry carries label strings: ${dataStrings.join(", ")}`);
});
