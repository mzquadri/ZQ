/** Frames at explicit pixel offsets, for reading one chapter closely. */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const [origin, route, out, offsets, widthArg, heightArg] = process.argv.slice(2);
const W = Number(widthArg ?? 1440), H = Number(heightArg ?? 900);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const context = await browser.newContext({ viewport: { width: W, height: H }, isMobile: W < 500, hasTouch: W < 500, deviceScaleFactor: 1 });
const page = await context.newPage();
await page.goto(origin + route, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
for (const raw of offsets.split(",")) {
  const y = Number(raw);
  await page.evaluate((t) => window.scrollTo({ top: t, behavior: "instant" }), y);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/y${y}.png` });
  console.log(`captured y=${y}`);
}
await browser.close();
