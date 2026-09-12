/**
 * Viewport and accessibility sweep for a change under review.
 *
 * Written for the website pass that added the architecture gateway, the CV and contact. It frames
 * the routes that changed at the widths a reader actually uses, runs axe on each, and reports
 * horizontal overflow from the same run - so a layout regression and an accessibility regression
 * are caught in one pass rather than in two tools that disagree about which build they looked at.
 *
 * Usage: node tools/qa-pass.mjs <origin> <outDir>
 */
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

const ORIGIN = process.argv[2] ?? "http://localhost:3312";
const OUT = process.argv[3] ?? "qa";

const ROUTES = ["/", "/architecture", "/about", "/contact", "/work", "/research"];
const SIZES = [
  { name: "390", width: 390, height: 844, mobile: true },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
let failures = 0;

for (const size of SIZES) {
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    isMobile: Boolean(size.mobile),
    hasTouch: Boolean(size.mobile),
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });

  for (const route of ROUTES) {
    const page = await context.newPage();
    await page.goto(ORIGIN + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(350);

    const overflow = await page.evaluate(() => ({
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    const overflows = overflow.scrollWidth > overflow.viewport + 1;

    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const slug = route === "/" ? "home" : route.slice(1).replace(/\//g, "-");
    await page.screenshot({ path: `${OUT}/${slug}-${size.name}.png`, fullPage: false });

    const problems = [];
    if (overflows) problems.push(`overflow ${overflow.scrollWidth}>${overflow.viewport}`);
    if (violations.length) {
      problems.push(
        violations.map((v) => `${v.id}(${v.impact}, ${v.nodes.length})`).join(", "),
      );
    }
    if (problems.length) failures += 1;

    console.log(
      `  ${problems.length ? "FAIL" : "ok  "}  ${size.name.padEnd(5)} ${route.padEnd(16)} ` +
        (problems.length ? problems.join(" | ") : "no overflow, no axe violations"),
    );

    await page.close();
  }

  await context.close();
}

await browser.close();
console.log(failures ? `\n${failures} route/size combinations need attention` : "\nAll clean.");
process.exit(failures ? 1 : 0);
