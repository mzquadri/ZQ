/**
 * Quick stills of the world, for looking at it while it is being built.
 *
 * Separate from record-world.mjs because a still is cheap and a take is not:
 * framing, lighting and whether a structure reads at all are all answerable
 * from one frame, and iterating on them through a thirty-second recording
 * wastes a minute each time.
 *
 *   node tools/world-stills.mjs [baseUrl] [outDir]
 */

import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3001";
const OUT = resolve(process.argv[3] ?? "../_portfolio-work/prototype/stills");
const SIZE = { width: 1440, height: 900 };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage({ viewport: SIZE, deviceScaleFactor: 1 });

  // The dev overlay sits in the bottom-left corner, exactly where the way out
  // of the world is, and it intercepts the click. Hidden for stills only; the
  // take is filmed against a production server, which has no overlay at all.
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }).catch(() => {});

  await page.goto(`${BASE}/world?world=force`, { waitUntil: "networkidle" });
  await page.waitForSelector(".world-places button", { timeout: 30_000 });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await wait(2600);
  await page.screenshot({ path: join(OUT, "a-overview-light.png") });

  const buttons = page.locator(".world-places button");
  for (const [i, name] of [
    [0, "thesis"],
    [1, "bpit"],
    [3, "gateway"],
    [5, "teaching"],
  ]) {
    await buttons.nth(i).click();
    await wait(2400);
    await page.screenshot({ path: join(OUT, `b-${name}-light.png`) });
  }

  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  await wait(1600);
  await page.screenshot({ path: join(OUT, "c-teaching-dark.png") });
  await buttons.nth(0).click();
  await wait(2400);
  await page.screenshot({ path: join(OUT, "d-thesis-dark.png") });

  await page.goto(`${BASE}/classic`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await wait(700);
  await page.screenshot({ path: join(OUT, "e-classic-dark.png") });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
  });
  await wait(500);
  await page.screenshot({ path: join(OUT, "f-classic-light.png") });

  await browser.close();
  console.log(`stills in ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
