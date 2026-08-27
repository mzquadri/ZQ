/**
 * Visual review harness.
 *
 * Drives a real browser over the built site and captures each breakpoint, plus a set of frames
 * taken at fixed points along a pinned stage's scroll track so the scrubbed choreography can be
 * inspected as stills rather than trusted from the source.
 *
 * Usage: node tools/review-shots.mjs <outDir> [origin]
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "media/review";
const origin = process.argv[3] ?? "http://127.0.0.1:3400";
mkdirSync(out, { recursive: true });

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
];

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const problems = [];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    reducedMotion: "no-preference",
    deviceScaleFactor: 2,
  });

  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(`${origin}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);

  // Frames along the hero's pinned track. The track is several viewports tall, so sampling its
  // scroll span is the only way to see what the reader actually sees mid-sequence.
  const track = await page.evaluate(() => {
    const el = document.querySelector(".cine-hero");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, height: r.height };
  });

  if (!track) {
    problems.push(`${vp.name}: .cine-hero not found`);
  } else {
    const span = Math.max(0, track.height - vp.height);
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      await page.evaluate((y) => window.scrollTo(0, y), track.top + span * p);
      await page.waitForTimeout(650);
      await page.screenshot({ path: `${out}/${vp.name}-hero-${String(p * 100).padStart(3, "0")}.png` });
    }
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${vp.name}-home-full.png`, fullPage: true });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  if (overflow) problems.push(`${vp.name}: horizontal overflow`);
  if (errors.length) problems.push(`${vp.name}: ${errors.length} console errors -> ${errors[0]}`);

  console.log(`${vp.name}: overflow=${overflow} errors=${errors.length}`);
  await page.close();
}

// Reduced motion must land on a composed, readable stage - not a blank or mid-animation one.
const rm = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
  deviceScaleFactor: 2,
});
await rm.goto(`${origin}/`, { waitUntil: "networkidle" });
await rm.waitForTimeout(700);
await rm.screenshot({ path: `${out}/1440-home-reduced.png`, fullPage: true });
const beatsVisible = await rm.locator(".cine-beat").evaluateAll(
  (els) => els.filter((e) => getComputedStyle(e).visibility !== "hidden").length,
);
console.log(`reduced motion: visible caption beats = ${beatsVisible} (want all 5)`);
if (beatsVisible !== 5) problems.push(`reduced motion shows ${beatsVisible}/5 beats`);
await rm.close();

await browser.close();

console.log(problems.length ? `\nPROBLEMS:\n- ${problems.join("\n- ")}` : "\nno problems detected");
