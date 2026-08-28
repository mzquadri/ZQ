/**
 * Final QA capture.
 *
 * Frames every important route at the widths a real visitor uses, with motion left on, and writes
 * a per-route strip of scroll positions rather than one enormous full-page image - the question
 * being asked is "what does this look like as you scroll", which a single tall PNG cannot answer.
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const ORIGIN = process.argv[2] ?? "https://mzquadri.de";
const OUT = process.argv[3] ?? "qa";
const ONLY = process.argv.slice(4);

const ROUTES = [
  "/", "/work", "/work/transport-uq", "/work/insureassist-rag",
  "/work/mlops-reference-pipeline", "/work/hydrology-uq",
  "/work/streamflow-forecasting", "/work/cifar10-cnn",
  "/research", "/research/thesis", "/about", "/resume", "/contact", "/learn",
];

const SIZES = [
  { name: "1440", width: 1440, height: 900, frames: [0, 0.16, 0.33, 0.5, 0.68, 0.85, 1] },
  { name: "390", width: 390, height: 844, frames: [0, 0.25, 0.5, 0.75, 1], mobile: true },
  { name: "768", width: 768, height: 1024, frames: [0, 0.4, 0.8] },
  { name: "320", width: 320, height: 800, frames: [0, 0.5, 1] },
];

const wanted = ONLY.length ? SIZES.filter((s) => ONLY.includes(s.name)) : SIZES;
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

for (const size of wanted) {
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    isMobile: Boolean(size.mobile),
    hasTouch: Boolean(size.mobile),
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  for (const route of ROUTES) {
    const slug = route === "/" ? "home" : route.slice(1).replace(/\//g, "-");
    const response = await page.goto(ORIGIN + route, { waitUntil: "networkidle" }).catch(() => null);
    if (!response || !response.ok()) {
      console.log(`!! ${slug} @${size.name} -> ${response ? response.status() : "no response"}`);
      continue;
    }
    await page.waitForTimeout(600);

    for (const [i, f] of size.frames.entries()) {
      /* Stepped, so intersection-gated layers actually mount before the frame is taken. */
      await page.evaluate((frac) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: Math.round(max * frac), behavior: "instant" });
      }, f);
      await page.waitForTimeout(650);
      await page.screenshot({ path: `${OUT}/${size.name}-${slug}-${i}.png` });
    }
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    console.log(`${slug.padEnd(28)} @${size.name}  height=${h}px  frames=${size.frames.length}`);
  }
  await context.close();
}

await browser.close();
