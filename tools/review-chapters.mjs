/**
 * Captures each project chapter at the end of its own scroll span, which is where its figure is
 * fully composed. Sampling mid-chapter would show partial scenes and make every review ambiguous.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "media/chapters";
const origin = process.argv[3] ?? "http://127.0.0.1:3400";
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({
  viewport: { width, height },
  reducedMotion: "no-preference",
  deviceScaleFactor: 2,
});

const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(`${origin}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

const chapters = await page.locator(".chapter").evaluateAll((els) =>
  els.map((el) => ({
    id: el.id,
    top: el.getBoundingClientRect().top + window.scrollY,
    height: el.getBoundingClientRect().height,
  })),
);

console.log(`found ${chapters.length} chapters`);

for (const c of chapters) {
  // Park the chapter so it has fully passed its own `contain` span: its figure is then composed.
  await page.evaluate((y) => window.scrollTo(0, y), c.top + c.height - height * 0.9);
  await page.waitForTimeout(700);
  const el = page.locator(`#${c.id}`);
  await el.screenshot({ path: `${out}/${width}-${c.id}.png` });
  console.log(`  ${c.id}`);
}

const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
);
console.log(`overflow=${overflow} errors=${errors.length}`);
if (errors.length) console.log(errors.slice(0, 3).join("\n"));

await browser.close();
