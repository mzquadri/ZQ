/**
 * Verify that every external link this site publishes actually resolves.
 *
 * The premise of this portfolio is that a claim is worth what its evidence is worth, and every
 * case study offers links pinned to a commit so a reader can check a number themselves. That
 * guarantee is only as good as the links: a repository that is deleted, renamed or made private
 * turns a page of citations into a page of 404s, and nothing in the build notices.
 *
 * Not hypothetical. One repository disappeared and its eleven pinned evidence URLs went dead on
 * the live site while every local gate - lint, typecheck, content validation, the whole Playwright
 * suite, axe, both privacy scanners - kept passing. None of them can see outside the repository.
 *
 * Why this imports the content modules rather than grepping them
 * --------------------------------------------------------------
 * The first version extracted URLs with a regular expression, which cannot see through a template
 * literal: `${repository}/blob/${commit}/README.md` is not a URL until something evaluates it. So
 * it checked eleven pinned paths by checking the one base URL they were built from, and would have
 * reported success for a repository that existed but had lost the pinned commit. Importing the
 * modules and walking their exported values resolves every link exactly as the page renders it.
 *
 * Deliberately NOT part of `npm run check` or CI. It depends on the network and on GitHub being
 * up, and a build that goes red because a third party is having a bad morning teaches people to
 * ignore red. Run it before a release, and whenever a repository moves.
 *
 * Usage: npx tsx tools/check-evidence-links.ts [--quiet]
 */

import * as ecosystem from "../src/content/ecosystem";
import * as focus from "../src/content/focus";
import * as portfolio from "../src/content/portfolio";
import * as research from "../src/content/research";
import * as truth from "../src/content/truth";
import * as hydrologyWorld from "../src/content/hydrology-world";
import * as mlopsWorld from "../src/content/mlops-world";
import * as streamflowWorld from "../src/content/streamflow-world";

const QUIET = process.argv.includes("--quiet");

/** Every module whose exported strings can end up as an href on a page. */
const MODULES: Record<string, unknown> = {
  ecosystem,
  focus,
  hydrologyWorld,
  mlopsWorld,
  portfolio,
  research,
  streamflowWorld,
  truth,
};

/**
 * Walk exported values and collect every absolute URL, remembering where it came from.
 *
 * Depth-limited and cycle-safe: content modules are plain data, but a stray back-reference should
 * fail this tool rather than hang it.
 */
function collect(value: unknown, path: string, seen: Set<unknown>, out: Map<string, Set<string>>) {
  if (value === null || value === undefined) return;
  if (typeof value === "string") {
    if (/^https?:\/\//.test(value)) {
      if (!out.has(value)) out.set(value, new Set());
      out.get(value)!.add(path);
    }
    return;
  }
  if (typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, i) => collect(item, `${path}[${i}]`, seen, out));
    return;
  }
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    collect(item, `${path}.${key}`, seen, out);
  }
}

const urls = new Map<string, Set<string>>();
for (const [name, module] of Object.entries(MODULES)) {
  collect(module, name, new Set(), urls);
}

/*
 * 999 is LinkedIn refusing an automated request and 403/429 are usually the same thing from behind
 * a bot filter. Reporting those as breakage would make this noisy on every run and it would be
 * switched off within a week - the failure mode the header warns about. They are reported as
 * unverifiable rather than silently passed.
 */
const BLOCKED = new Set([403, 429, 999]);

type Result = { url: string; status: number; where: string[] };

/* Wrapped rather than top-level: tsx compiles this to CJS, where top-level await is not allowed. */
async function main() {
  const results: Result[] = [];

  for (const [url, where] of urls) {
    let status = 0;
    try {
      /* HEAD first; some hosts answer HEAD with 405, so fall back to a ranged GET. */
      let response = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (response.status === 405 || response.status === 501) {
        response = await fetch(url, { headers: { Range: "bytes=0-0" }, redirect: "follow" });
      }
      status = response.status;
    } catch {
      /* DNS failure, TLS failure, connection refused - all equally broken from a reader's side. */
      status = -1;
    }
    results.push({ status, url, where: [...where] });
  }

  const blocked = results.filter((r) => BLOCKED.has(r.status));
  const broken = results.filter((r) => !BLOCKED.has(r.status) && (r.status < 200 || r.status >= 400));

  if (!QUIET) {
    console.log(
      `checked ${results.length} published links (${results.length - broken.length} resolve)`,
    );
    if (blocked.length) {
      console.log(`${blocked.length} could not be verified (the host blocks automated requests):`);
      for (const entry of blocked) console.log(`    ${entry.status}  ${entry.url}`);
    }
  }

  if (broken.length) {
    console.error(`
BROKEN LINKS (${broken.length})`);
    for (const entry of broken) {
      console.error(`  ${entry.status === -1 ? "ERR" : entry.status}  ${entry.url}`);
      for (const where of entry.where.slice(0, 4)) console.error(`        cited at ${where}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log("every published link resolves");
}

void main();
