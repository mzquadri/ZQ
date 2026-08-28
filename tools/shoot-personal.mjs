/**
 * Capture the three personal routes at the widths that matter.
 *
 * Motion is left ON here deliberately: these are the only shots that show whether the projected
 * layer mounts and where it sits. The reduced-motion pass is what the axe and reflow harnesses
 * already cover.
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = "http://localhost:3400";
const OUT = process.argv[2] ?? "shots-personal";
const ROUTES = ["/about", "/resume", "/contact"];
const SIZES = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const size of SIZES) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    const slug = route.slice(1) || "home";

    // Three depths, enough to see the scene start, run and settle.
    for (const [i, frac] of [0, 0.35, 0.7].entries()) {
      await page.evaluate((f) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: max * f, behavior: "instant" });
      }, frac);
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${OUT}/${slug}-${size.name}-${i}.png` });
    }

    const mode = await page.locator("[data-mode]").first().getAttribute("data-mode").catch(() => null);
    console.log(`${slug} @${size.name}  stage mode=${mode}`);
  }
  await page.close();
}

await browser.close();
