/**
 * Is the operational snapshot still plausibly current?
 *
 * This exists because of a specific failure, not a hypothetical one: `docs/PORTFOLIO_INTEGRITY.md`
 * reported Node 20, Next.js 14 and React 18 well into September, on a repository running Node 24,
 * Next.js 16 and React 19. Nothing was dishonest about it - the numbers had simply been copied
 * forward instead of measured, and no check existed that could notice.
 *
 * What it can and cannot do is worth being clear about. It compares the versions the snapshot
 * states against the versions actually installed, and it requires a `Verified:` date that is not
 * absurdly old. It cannot tell whether a test count is right: asserting that would mean running
 * the suite from a documentation check, which is slower than the suite and would go stale in the
 * opposite direction. Staleness is detectable; correctness is not, and pretending otherwise would
 * produce a check that passes while the document is wrong.
 *
 *     npm run check:docs
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DOC = "docs/PORTFOLIO_INTEGRITY.md";
/** Long enough that a quiet quarter does not nag; short enough that a year cannot pass. */
const MAX_AGE_DAYS = 90;

const failures: string[] = [];
const fail = (message: string) => failures.push(message);

const doc = readFileSync(resolve(DOC), "utf8");

/* ---- the snapshot must say when it was verified ------------------------------------------ */
const verified = doc.match(/\*\*Verified:\s*(\d{4}-\d{2}-\d{2})\*\*/);
if (!verified) {
  fail(`${DOC} has no "**Verified: YYYY-MM-DD**" marker; an operational snapshot without a date is not a claim about today`);
} else {
  const when = new Date(`${verified[1]}T00:00:00Z`);
  if (Number.isNaN(when.getTime())) {
    fail(`${DOC} has an unparseable Verified date: ${verified[1]}`);
  } else {
    const days = Math.floor((Date.now() - when.getTime()) / 86_400_000);
    if (days < 0) fail(`${DOC} is verified in the future: ${verified[1]}`);
    else if (days > MAX_AGE_DAYS) {
      fail(
        `${DOC} was verified ${days} days ago (${verified[1]}); re-measure the snapshot and update the date`,
      );
    }
  }
}

/* ---- the versions it states must be the versions installed ------------------------------- */
function installed(pkg: string): string | null {
  try {
    return JSON.parse(readFileSync(resolve("node_modules", pkg, "package.json"), "utf8")).version;
  } catch {
    return null;
  }
}

/*
 * Major versions only. A patch bump is not documentation drift, and demanding the document track
 * one would guarantee it is wrong within a week - which is how a check teaches people to ignore it.
 */
const stated: Array<[label: string, pkg: string, pattern: RegExp]> = [
  ["Next.js", "next", /Next\.js (\d+)\.\d+\.\d+/],
  ["React", "react", /React (\d+)\.\d+\.\d+/],
  ["TypeScript", "typescript", /TypeScript (\d+)\.\d+\.\d+/],
  ["ESLint", "eslint", /ESLint (\d+)\.\d+\.\d+/],
  ["Playwright", "@playwright/test", /Playwright (\d+)\.\d+\.\d+/],
];

for (const [label, pkg, pattern] of stated) {
  const match = doc.match(pattern);
  const real = installed(pkg);
  if (!match) {
    fail(`${DOC} no longer states a ${label} version in its snapshot`);
    continue;
  }
  if (!real) continue; // Not installed here; nothing to compare against.
  const documented = match[1];
  const actual = real.split(".")[0];
  if (documented !== actual) {
    fail(`${DOC} says ${label} ${documented}.x; ${pkg} ${real} is installed`);
  }
}

/* ---- and the runtime it names must be the one the package requires ------------------------ */
const nodeStated = doc.match(/Node\.js (\d+)\.\d+\.\d+/);
const engines: string | undefined = JSON.parse(readFileSync(resolve("package.json"), "utf8")).engines?.node;
if (nodeStated && engines) {
  const required = engines.match(/(\d+)/);
  if (required && required[1] !== nodeStated[1]) {
    fail(`${DOC} says Node.js ${nodeStated[1]}.x; package.json requires "${engines}"`);
  }
}

if (failures.length) {
  console.error("Documentation freshness check failed:\n");
  for (const message of failures) console.error(`  - ${message}`);
  console.error(
    "\nThe snapshot in that document is meant to be measured, not carried forward. Re-run the\n" +
      "commands it names, update the figures and the Verified date, and commit the result.",
  );
  process.exit(1);
}

console.log(
  `Documentation freshness: ${DOC} verified ${verified?.[1]}, stated framework versions match what is installed.`,
);
