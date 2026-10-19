/**
 * Build, serve and screenshot in one reliable step.
 *
 *   node tools/review.mjs / /experience /research
 *   node tools/review.mjs --no-build /
 *
 * Written because chaining `build && start && curl-until-up && screenshot` in a
 * shell kept going wrong in ways that cost more time than the work: a server
 * from the previous round still holding the port, a `next start` racing a build
 * that had just deleted `.next`, and an `until` loop waiting forever on a
 * server that had already exited. This owns the whole sequence, so each step
 * genuinely finishes before the next begins, and it always frees its own port.
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";

const args = process.argv.slice(2);
const skipBuild = args.includes("--no-build");
const routes = args.filter((a) => !a.startsWith("--"));
if (routes.length === 0) routes.push("/");

const PORT = 3219;
const OUT = "tools/shots";
const env = { ...process.env, HIDE_DRAFTS: "1" };

function freePort(port) {
  // Windows: whoever is listening gets stopped, including a stray from a prior run.
  spawnSync(
    "powershell",
    ["-NoProfile", "-Command",
      `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | ` +
      `ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }`],
    { stdio: "ignore" },
  );
}

function run(cmd, cmdArgs, label) {
  const r = spawnSync(cmd, cmdArgs, { env, stdio: "inherit", shell: true });
  if (r.status !== 0) {
    console.error(`\n${label} failed with exit ${r.status}`);
    process.exit(r.status ?? 1);
  }
}

await mkdir(OUT, { recursive: true });

if (!skipBuild) {
  console.log("building");
  // The stale generated types are removed first; a build that inherits them
  // type-checks routes that no longer exist.
  spawnSync("powershell", ["-NoProfile", "-Command",
    "Remove-Item -Recurse -Force .next/types, tsconfig.tsbuildinfo -ErrorAction SilentlyContinue"],
    { stdio: "ignore" });
  run("npm", ["run", "build"], "build");
}

freePort(PORT);

console.log(`serving on ${PORT}`);
const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  env, stdio: ["ignore", "pipe", "pipe"], shell: true,
});

let serverLog = "";
server.stdout.on("data", (d) => { serverLog += d.toString(); });
server.stderr.on("data", (d) => { serverLog += d.toString(); });

const stop = () => { try { freePort(PORT); server.kill(); } catch { /* already gone */ } };
process.on("exit", stop);

// Poll until it answers, and give up rather than hang if the server died.
const deadline = Date.now() + 90_000;
let up = false;
while (Date.now() < deadline) {
  if (server.exitCode !== null) break;
  try {
    const res = await fetch(`http://localhost:${PORT}/`);
    if (res.ok) { up = true; break; }
  } catch { /* not listening yet */ }
  await new Promise((r) => setTimeout(r, 500));
}

if (!up) {
  console.error("server never came up. Its output:\n" + serverLog.slice(-1200));
  stop();
  process.exit(1);
}

/*
 * Warm every route before the browser sees it.
 *
 * `next start` answers the readiness probe long before it has served anything,
 * and the first request to a route pays for work the later ones do not. On a
 * loaded machine that first request took longer than Playwright's navigation
 * timeout, so the screenshot step failed on a page that was fine. Fetching each
 * route once first moves that cost out of the measurement.
 */
for (const route of routes) {
  try {
    const res = await fetch(`http://localhost:${PORT}${route}`);
    const body = await res.text();
    console.log(`  warm ${route} ${res.status} ${(body.length / 1024).toFixed(0)} KB`);
  } catch (err) {
    console.log(`  warm ${route} FAILED ${err.message}`);
  }
}

run("node", ["tools/shoot-local.mjs", `http://localhost:${PORT}`, OUT, ...routes], "screenshots");
stop();
console.log("done");
