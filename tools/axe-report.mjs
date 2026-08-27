/**
 * Compact accessibility report.
 *
 * The Playwright assertion prints the whole axe payload, which is unreadable once there are more
 * than a couple of violations. This groups them by rule and by the CSS class that actually needs
 * changing, and for contrast failures prints the measured ratio and the colours involved - which
 * is the only information needed to fix one.
 *
 * Usage: node tools/axe-report.mjs <origin> [route...]
 */
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const origin = process.argv[2] ?? "http://127.0.0.1:3400";
const routes = process.argv.slice(3);
const targets = routes.length ? routes : ["/"];

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

let total = 0;

for (const route of targets) {
  /* axe-core/playwright requires a context-backed page, not browser.newPage(). */
  /*
   * Reduced motion, deliberately. It is the strictest state for contrast: every scrubbed element
   * is composed at once rather than sitting transparent below the fold, so axe actually sees the
   * colours a reader will see. Auditing without it silently skips most of the page.
   */
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  const results = await new AxeBuilder({ page }).analyze();
  const count = results.violations.reduce((n, v) => n + v.nodes.length, 0);
  total += count;
  console.log(`\n=== ${route} — ${results.violations.length} rules, ${count} nodes ===`);

  for (const violation of results.violations) {
    console.log(`\n[${violation.impact}] ${violation.id}: ${violation.help}`);
    const byKey = new Map();
    for (const node of violation.nodes) {
      const cls = (node.html.match(/class="([^"]+)"/)?.[1] ?? node.html.slice(0, 40)).split(" ")[0];
      const data = node.any?.[0]?.data ?? {};
      const key = violation.id === "color-contrast"
        ? `${cls} | ratio ${data.contrastRatio} need ${data.expectedContrastRatio} | fg ${data.fgColor} on ${data.bgColor}`
        : cls;
      byKey.set(key, (byKey.get(key) ?? 0) + 1);
    }
    for (const [key, n] of [...byKey].sort((a, b) => b[1] - a[1])) {
      console.log(`   ${String(n).padStart(4)}x  ${key}`);
    }
  }
  await context.close();
}

console.log(`\nTOTAL violation nodes: ${total}`);
await browser.close();
