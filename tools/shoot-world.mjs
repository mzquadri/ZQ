/**
 * Frames across an exploded world's track.
 *
 * Scrolls the world into view first so the renderer mounts, then measures: the tall track is only
 * reserved for readers the scene actually runs for, so measuring before mount reads the collapsed
 * height and every frame lands in the wrong place.
 *
 * Usage: node tools/shoot-world.mjs <route> <out> [frames] [width] [height]
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const route = process.argv[2] ?? "/research/thesis";
const out = process.argv[3] ?? "world";
const FRAMES = Number(process.argv[4] ?? 10);
const W = Number(process.argv[5] ?? 1440);
const H = Number(process.argv[6] ?? 900);

await mkdir(out, { recursive: true });
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto(`http://127.0.0.1:3400${route}`, { waitUntil: "networkidle" });
await p.evaluate(() => document.querySelector(".world-track, .thesis-world-track")?.scrollIntoView());
await p.waitForTimeout(2200);

const box = await p.evaluate(() => {
  const t = document.querySelector(".world-track, .thesis-world-track");
  if (!t) return null;
  const r = t.getBoundingClientRect();
  const host = t.closest(".world-stage, .thesis-world");
  return { top: r.top + window.scrollY, height: r.height, mode: host?.getAttribute("data-mode") };
});
console.log("track:", JSON.stringify(box));
if (!box) { await b.close(); process.exit(0); }

const travel = box.height - H;
for (let i = 0; i < FRAMES; i += 1) {
  const f = i / (FRAMES - 1);
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(box.top + travel * f));
  await p.waitForTimeout(650);
  await p.screenshot({ path: `${out}/${String(i).padStart(2, "0")}.png` });
}
await b.close();
