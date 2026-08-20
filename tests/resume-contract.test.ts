import assert from "node:assert/strict";
import test from "node:test";

import {
  hasDeterministicResumePdfMetadata,
  normalizeResumePdfMetadata,
  sha256,
} from "../scripts/resume-contract";

test("resume PDF metadata normalization is deterministic", () => {
  const first = Buffer.from(
    "%PDF-1.4\n/CreationDate (D:20260820210101+00'00')\n/ModDate (D:20260820210101+00'00')\n",
    "latin1",
  );
  const second = Buffer.from(
    "%PDF-1.4\n/CreationDate (D:20260820210259+00'00')\n/ModDate (D:20260820210259+00'00')\n",
    "latin1",
  );
  const normalizedFirst = normalizeResumePdfMetadata(first);
  const normalizedSecond = normalizeResumePdfMetadata(second);

  assert.equal(sha256(normalizedFirst), sha256(normalizedSecond));
  assert.equal(normalizedFirst.length, first.length);
  assert.equal(hasDeterministicResumePdfMetadata(normalizedFirst), true);
});

test("resume PDF normalization fails closed when Chromium metadata changes", () => {
  assert.throws(() => normalizeResumePdfMetadata(Buffer.from("%PDF-1.4\n", "latin1")), /missing expected Chromium date/);
});
