import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { insureAssistBenchmark } from "../src/content/insureassist-benchmark";
import { canonicalInsureAssistEvidence } from "../src/content/portfolio";

/*
 * The InsureAssist numbers on this site are a hand-copied mirror of eval/reference_run.json
 * in the insureassist-rag-mlops repository, pinned to one commit.
 *
 * Until 2026-10-23 nothing checked the mirror against what it cites, and it had drifted in a
 * way no internal check could see: the file pinned 526495a and published `total: 40`,
 * `unanswerable: 8`, `dev: 18`, `test: 22`. That commit is dated 2026-09-24 and already
 * carried 50 labels, 18 unanswerable, split 23 and 27. `answerable: 32` was correct
 * throughout, and every retrieval metric was correct, which is exactly why it read as fine.
 *
 * So the pinned blocks are committed verbatim as a fixture and compared field by field.
 * Moving the pin means regenerating the fixture; moving it without one fails here.
 *
 * The fixture is a copy rather than a fetch on purpose: this suite runs offline, and a test
 * that reaches GitHub fails for reasons that have nothing to do with this repository.
 */

const fixturePath = path.join(
  process.cwd(),
  "tests",
  "fixtures",
  "insureassist-reference-run.json",
);

interface Fixture {
  _source: string;
  questions: { total: number; answerable: number; unanswerable: number; by_split: { dev: number; test: number } };
  corpus: { documents: number; chunks: number; words: number };
  metrics: Record<string, number>;
}

const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as Fixture;

/* The site publishes three decimal places; the artefact carries four. */
const to3 = (value: number) => Math.round(value * 1000) / 1000;

test("the question set matches the pinned reference run", () => {
  const q = insureAssistBenchmark.questions;
  assert.equal(q.total, fixture.questions.total, "question total does not match the pinned file");
  assert.equal(q.answerable, fixture.questions.answerable, "answerable count does not match");
  assert.equal(q.unanswerable, fixture.questions.unanswerable, "unanswerable count does not match");
  assert.equal(q.dev, fixture.questions.by_split.dev, "dev split does not match");
  assert.equal(q.test, fixture.questions.by_split.test, "test split does not match");

  /* The halves have to add up, whatever the fixture says. */
  assert.equal(
    q.answerable + q.unanswerable,
    q.total,
    "the question halves do not sum to the stated total",
  );
  assert.equal(q.dev + q.test, q.total, "the splits do not sum to the stated total");
});

test("the corpus matches the pinned reference run", () => {
  const c = insureAssistBenchmark.corpus;
  assert.equal(c.documents, fixture.corpus.documents, "document count does not match");
  assert.equal(c.chunks, fixture.corpus.chunks, "chunk count does not match");
  assert.equal(c.words, fixture.corpus.words, "word count does not match");
});

test("the published retrieval figures match the pinned reference run", () => {
  const s = insureAssistBenchmark.selected;
  assert.equal(s.hitRate5, to3(fixture.metrics["hit_rate@5"]), "hit rate at 5 does not match");
  assert.equal(s.mrr, to3(fixture.metrics.mrr), "MRR does not match");
  assert.equal(
    s.topDocumentAccuracy,
    to3(fixture.metrics.top_document_accuracy),
    "top-document accuracy does not match",
  );

  const cit = insureAssistBenchmark.citations;
  assert.equal(cit.precision, to3(fixture.metrics["precision@5"]), "citation precision does not match");
  assert.equal(cit.recall, to3(fixture.metrics["recall@5"]), "citation recall does not match");
});

test("the fixture names the commit the site actually pins", () => {
  assert.match(canonicalInsureAssistEvidence.commit, /^[0-9a-f]{40}$/);

  /*
   * The fixture records which commit it was taken from. If the pin moves and the fixture
   * is not regenerated, the two disagree here even when every number above still happens
   * to match, which is the case that would otherwise slip through.
   */
  const short = canonicalInsureAssistEvidence.commit.slice(0, 7);
  assert.ok(
    fixture._source.includes(short),
    `the fixture was taken from ${fixture._source}, but the site pins ${short}`,
  );
});

test("every InsureAssist evidence link uses the pinned commit", () => {
  const { commit, repository, ...links } = canonicalInsureAssistEvidence;
  const prefix = `${repository}/blob/${commit}/`;
  const entries = Object.entries(links).filter(([, href]) => typeof href === "string");
  assert.ok(entries.length > 0, "there must be evidence links to check");
  for (const [name, href] of entries) {
    if (!(href as string).includes("/blob/")) continue;
    assert.ok(
      (href as string).startsWith(prefix),
      `${name} does not cite the pinned commit: ${href}`,
    );
  }
});
