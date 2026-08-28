/**
 * Scan for employer-internal detail reaching the public site.
 *
 * Two tiers, because "never publish this" and "never publish this *here*" are different claims and
 * collapsing them produces a check that cries wolf until someone switches it off.
 *
 * ALWAYS - internal repository names, the internal host, internal service names, internal table and
 * state names, and private local paths. None of these may appear anywhere in this repository, in
 * source or in build output. They identify topology and exist nowhere legitimately.
 *
 * BUILD ONLY - store technologies that appear in the confidential case study, which is a draft and
 * is excluded from production builds. They are legitimate in source, because that is where the
 * draft lives, and must not survive into anything a browser can fetch. Running this against a
 * production build is what makes that exclusion mechanical rather than a promise.
 *
 * Deliberately NOT listed: Qdrant. A public repository of mine genuinely uses it and says so, and a
 * check that forbade a technology outright would be flagging honest public work.
 *
 * Usage: node tools/privacy-scan.mjs               source, then build output if present
 *        node tools/privacy-scan.mjs --build-only  build output only
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

/** Never, anywhere. Internal identity and topology. */
const ALWAYS = [
  /bp-itcs-ibp/i,
  /lab-gitea/i,
  /\bglaux\b/i,
  /currency_observations/i,
  /currency_state/i,
  /law_verification_state/i,
  /verification_checks/i,
  /entity[-\s]producer/i,
  /entity[-\s]handler/i,
  /entity[-\s]reader/i,
  /knowledge-db-ingestion/i,
  /legal[-\s]kb[-\s](health|dashboard)/i,
  /C:\\Users\\/i,
  /\/home\/[a-z]+\//i,
];

/** Never in anything a browser can fetch. Present in source only via the excluded draft. */
const BUILD_ONLY = [/\bneo4j\b/i, /\bminio\b/i, /\bpostgres/i, /apache kafka/i, /bge-m3/i];

/*
 * Tests are not scanned in the source pass, and the reason is not convenience.
 *
 * A test whose job is to assert that a term never appears has to contain that term, so scanning
 * the suite flags every guard as a leak and the only way to keep the scanner quiet is to delete
 * the guards. Test files are also never served. The build pass below has no exceptions at all,
 * which is where the guarantee actually lives: if a forbidden term ever reaches something a
 * browser can fetch, it fails there.
 */
const SOURCE_ROOTS = ["src", "tools"];
const BUILD_ROOTS = [".next/server/app", ".next/static"];
/*
 * Files whose job is to forbid these terms necessarily contain them. Skipping them is not a hole:
 * the guard list in the showcase test asserts the terms are absent from rendered output, and this
 * scanner asserts they are absent from everything else.
 */
const SKIP = ["privacy-scan.mjs"];

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path, out);
    else out.push(path);
  }
  return out;
}

async function scan(roots, patterns, label) {
  const offences = [];
  for (const root of roots) {
    if (!(await stat(root).catch(() => null))) continue;
    for (const file of await walk(root)) {
      if (SKIP.some((s) => file.endsWith(s))) continue;
      if (!/\.(ts|tsx|js|mjs|css|html|json|txt|svg|map|rsc|meta|body)$/.test(file)) continue;
      const text = await readFile(file, "utf8").catch(() => null);
      if (!text) continue;
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) offences.push(`${label} ${file}: ${JSON.stringify(match[0])}`);
      }
    }
  }
  return offences;
}

const buildOnly = process.argv.includes("--build-only");
const offences = [];

if (!buildOnly) offences.push(...(await scan(SOURCE_ROOTS, ALWAYS, "[always]")));
offences.push(...(await scan(BUILD_ROOTS, ALWAYS, "[always]")));
offences.push(...(await scan(BUILD_ROOTS, BUILD_ONLY, "[build] ")));

if (offences.length) {
  console.error(`PRIVACY SCAN FAILED (${offences.length})`);
  for (const line of offences.slice(0, 40)) console.error("  " + line);
  process.exit(1);
}
console.log("privacy scan clean");
