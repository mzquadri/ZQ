/**
 * A fine-grained sweep of one route, for reading a long scroll narrative frame by frame.
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const [origin, route, out, countArg, widthArg, heightArg] = process.argv.slice(2);
const COUNT = Number(countArg ?? 12);
const W = Number(widthArg ?? 1440);
const H = Number(heightArg ?? 900);

await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: W, height: H },
  isMobile: W < 500,
  hasTouch: W < 500,
  deviceScaleFactor: 1,
});
const page = await context.newPage();
await page.goto(origin + route, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

for (let i = 0; i < COUNT; i += 1) {
  const top = await page.evaluate((f) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = Math.round(max * f);
    window.scrollTo({ top: y, behavior: "instant" });
    return y;
  }, i / (COUNT - 1));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/${String(i).padStart(2, "0")}.png` });
  if (i === 0) console.log(`scrollHeight sample; viewport ${W}x${H}`);
  console.log(`frame ${String(i).padStart(2, "0")}  top=${top}`);
}

await browser.close();
