/**
 * Stop a known-vulnerable framework version from coming back quietly.
 *
 * This exists because of GHSA-p293-qw3h-jr36 and GHSA-2xp9-vwfh-vxw4, two critical advisories
 * against Next.js `>=16.0.0 <16.3.3` that this repository shipped for a while on 16.3.1. Nothing
 * announced them: `npm audit` had to be run and read, and the integrity document meanwhile
 * recorded a clean result measured weeks earlier.
 *
 * What this check is, and is not:
 *
 *   it is      an offline assertion that the installed version of a package meets the minimum
 *              patch recorded for its release line, so a downgrade, a stale lockfile, or a
 *              revert cannot reintroduce a version we have already been bitten by
 *   it is not  a replacement for `npm audit`, which is the only thing that learns about new
 *              advisories. CI runs that separately, and it is the real safety net
 *
 * The minimum is declared per release line rather than as a single version, so upgrading within
 * the line does not require editing this file and pinning 16.3.5 forever is not the mechanism. A
 * newer line than any recorded here passes with a notice: a check that blocked every upgrade
 * until someone amended a table would be routed around within a month, and `npm audit` covers
 * the case it would be guarding.
 *
 *     npm run check:security
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface Floor {
  /** Release line, as `major.minor`. */
  line: string;
  /** Lowest patch known to be free of the advisories below. */
  minimum: string;
  advisories: string[];
  note: string;
}

/**
 * Minimum safe patch per release line. Add a line when a new advisory lands, rather than raising
 * an existing entry past what the advisory actually requires.
 */
const FLOORS: Record<string, Floor[]> = {
  next: [
    {
      line: "16.3",
      minimum: "16.3.5",
      advisories: ["GHSA-p293-qw3h-jr36", "GHSA-2xp9-vwfh-vxw4"],
      note: "Unauthenticated RCE on Windows-hosted servers, and RCE in the Image Optimization API for AVIF input. Affects >=16.0.0 <16.3.3; 16.3.5 is the release this repository moved to.",
    },
  ],
  sharp: [
    {
      line: "0.35",
      minimum: "0.35.4",
      advisories: ["GHSA-rgj7-g3m4-5g8c"],
      note: "libheif vulnerabilities reachable through sharp, which arrives as a transitive dependency of Next.js rather than a direct one.",
    },
  ],
};

const failures: string[] = [];
const notes: string[] = [];

/** Numeric comparison, so 16.3.10 sorts above 16.3.5 rather than below it as a string would. */
function compare(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i += 1) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  }
  return 0;
}

for (const [pkg, floors] of Object.entries(FLOORS)) {
  let version: string;
  try {
    version = JSON.parse(
      readFileSync(resolve("node_modules", pkg, "package.json"), "utf8"),
    ).version;
  } catch {
    notes.push(`${pkg} is not installed; nothing to check`);
    continue;
  }

  const [major, minor, ...rest] = version.split(".");
  if (rest.length === 0) {
    failures.push(`${pkg} reports an unreadable version: ${version}`);
    continue;
  }
  const line = `${major}.${minor}`;
  const floor = floors.find((f) => f.line === line);

  if (!floor) {
    const highest = floors.reduce((a, b) => (compare(a.minimum, b.minimum) >= 0 ? a : b));
    if (compare(version, highest.minimum) > 0) {
      notes.push(`${pkg} ${version} is newer than any recorded line; npm audit covers it`);
    } else {
      failures.push(
        `${pkg} ${version} is on line ${line}, which predates the recorded floor ${highest.minimum} (${highest.advisories.join(", ")})`,
      );
    }
    continue;
  }

  if (compare(version, floor.minimum) < 0) {
    failures.push(
      `${pkg} ${version} is below the minimum safe ${floor.minimum} for the ${floor.line} line\n` +
        `      ${floor.advisories.join(", ")}\n` +
        `      ${floor.note}`,
    );
  } else {
    notes.push(`${pkg} ${version} meets the ${floor.line} minimum of ${floor.minimum}`);
  }
}

for (const note of notes) console.log(`  ok    ${note}`);

if (failures.length) {
  console.error("\nDependency security check failed:\n");
  for (const message of failures) console.error(`  - ${message}`);
  console.error(
    "\nInstall the patched release rather than lowering the floor. If an advisory has been\n" +
      "withdrawn or reassessed, remove its entry from FLOORS with the reasoning in the commit.",
  );
  process.exit(1);
}

console.log("\nDependency security: all recorded advisory floors are met.");
