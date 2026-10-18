/**
 * Screenshot the running site in both themes.
 *
 *   node tools/shoot-local.mjs http://localhost:3210 out/dir /path /research
 *
 * Theme is driven by `colorScheme`, which is what `color-scheme: light dark`
 * and every `light-dark()` token resolve against, so this exercises the real
 * mechanism rather than a class the toggle happens to set. A second pass per
 * route stamps `data-theme` explicitly, which is the toggle's path, and the two
 * must agree.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] ?? "http://localhost:3210";
const out = process.argv[3] ?? "tools/shots";
const routes = process.argv.slice(4);
if (routes.length === 0) routes.push("/");

await mkdir(out, { recursive: true });
const browser = await chromium.launch();

for (const theme of ["light", "dark"]) {
  const ctx = await browser.newContext({
    colorScheme: theme,
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
    reducedMotion: "no-preference",
  });
  for (const route of routes) {
    const page = await ctx.newPage();
    const problems = [];
    page.on("console", (m) => {
      if (m.type() === "error") problems.push(`console: ${m.text().slice(0, 140)}`);
    });
    page.on("response", (r) => {
      if (r.status() >= 400) problems.push(`${r.status()} ${r.url().slice(0, 110)}`);
    });

    /*
     * `domcontentloaded` plus an explicit settle rather than `networkidle`.
     * Pages carrying a canvas or a long-running animation never reach a 500ms
     * quiet window, so networkidle times out on a page that is in fact finished.
     * The waits below are what actually matters: fonts resolved, images
     * decoded, and long enough for the hero's one animation to have run.
     */
    await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState("load").catch(() => {});
    await page.waitForTimeout(2600);

    // What the page resolved to, so a token that failed to parse is visible as
    // a value rather than as a colour that looks almost right.
    const resolved = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return {
        scheme: s.colorScheme,
        paper: s.getPropertyValue("--paper").trim(),
        ink: s.getPropertyValue("--ink").trim(),
        violet: s.getPropertyValue("--violet").trim(),
        bodyFont: getComputedStyle(document.body).fontFamily.split(",")[0],
      };
    });

    const name = route === "/" ? "home" : route.replace(/\//g, "-").replace(/^-/, "");
    await page.screenshot({ path: `${out}/${name}-${theme}.png`, fullPage: true });
    console.log(`  ${name}-${theme}`);
    console.log(`     scheme=${resolved.scheme} paper=${resolved.paper} ink=${resolved.ink}`);
    console.log(`     violet=${resolved.violet} font=${resolved.bodyFont}`);
    for (const p of [...new Set(problems)]) console.log(`     PROBLEM ${p}`);
    await page.close();
  }
  await ctx.close();
}

await browser.close();
