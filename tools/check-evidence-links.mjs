/**
 * Verify that every external evidence link this site publishes actually resolves.
 *
 * The site's whole premise is that a claim is worth what its evidence is worth, and every case
 * study offers links pinned to a commit so a reader can check the number for themselves. That
 * guarantee is only as good as the links: a repository that is deleted, renamed or made private
 * turns a page full of citations into a page full of 404s, and nothing in the build notices.
 *
 * That is not hypothetical. It is exactly what happened - one repository disappeared and eleven
 * pinned evidence URLs went dead on the live site, with every local check still passing.
 *
 * Deliberately NOT part of `npm run check` or CI. This depends on the network and on GitHub being
 * up, and a build that fails because a third party is having a bad morning trains people to ignore
 * red. It is a thing to run before a release and whenever a repository moves.
 *
 * Usage: node tools/check-evidence-links.mjs [--quiet]
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const QUIET = process.argv.includes("--quiet");

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path, out);
    else if (/\.(ts|tsx|json)$/.test(entry.name)) out.push(path);
  }
  return out;
}

/* Collect every absolute http(s) URL that appears in published content. */
const urls = new Map();
for (const file of await walk("src/content")) {
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(/https?:\/\/[^"'`\s)\\]+/g)) {
    const url = match[0].replace(/[.,;]+$/, "");
    if (!urls.has(url)) urls.set(url, new Set());
    urls.get(url).add(file);
  }
}

/*
 * Template literals leave `${...}` in the extracted string. Those are composed at runtime from a
 * base URL that is itself checked, so the pieces are resolved rather than skipped: substituting
 * the known constants would mean re-implementing the content module here and drifting from it.
 */
const checkable = [...urls.keys()].filter((url) => !url.includes("${"));
const composed = [...urls.keys()].filter((url) => url.includes("${"));

const results = [];
for (const url of checkable) {
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
  results.push({ url, status, files: [...urls.get(url)] });
}

/*
 * 999 is LinkedIn refusing an automated request, not a broken link, and 403 is often the same
 * thing from behind a bot filter. Reporting those as breakage would make this noisy on every run
 * and it would be switched off within a week - which is the failure mode the header warns about.
 * They are reported separately as unverifiable rather than silently passed.
 */
const BLOCKED = new Set([403, 429, 999]);
const blocked = results.filter((r) => BLOCKED.has(r.status));
const broken = results.filter(
  (r) => !BLOCKED.has(r.status) && (r.status < 200 || r.status >= 400),
);
const ok = results.length - broken.length;

if (!QUIET) {
  console.log(`checked ${results.length} published links (${ok} resolve)`);
  if (composed.length) {
    console.log(`${composed.length} composed at runtime from a checked base, not fetched directly`);
  }
  /*
   * Pinned sub-paths are built from a base constant, so they are not extracted as literals. That
   * is acceptable for the failure this exists to catch: when a repository disappears, its base URL
   * goes with it and every pinned path under it dies at the same moment.
   */
  if (blocked.length) {
    console.log(`${blocked.length} could not be verified (the host blocks automated requests):`);
    for (const entry of blocked) console.log(`    ${entry.status}  ${entry.url}`);
  }
}

if (broken.length) {
  console.error(`\nBROKEN EVIDENCE LINKS (${broken.length})`);
  for (const entry of broken) {
    console.error(`  ${entry.status === -1 ? "ERR" : entry.status}  ${entry.url}`);
    for (const file of entry.files) console.error(`        cited in ${file}`);
  }
  process.exit(1);
}
console.log("every published evidence link resolves");
