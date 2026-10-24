/**
 * Frames across an exploded world's track.
 *
 * Scrolls the world into view first so the renderer mounts, then measures: the tall track is only
 * reserved for readers the scene actually runs for, so measuring before mount reads the collapsed
 * height and every frame lands in the wrong place.
 *
 * Pass --gpu to photograph the world itself. Without it this launches SwiftShader, which is the
 * software rasteriser every world on this site correctly refuses to mount on - so a default run
 * frames the flat figure and nothing else, which is a useful thing to check and is not what the
 * name of this tool suggests it does.
 *
 * Usage: node tools/shoot-world.mjs <route> <out> [frames] [width] [height] [--gpu] [--origin url]
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const GPU = process.argv.includes("--gpu");
const originFlag = process.argv.indexOf("--origin");
const ORIGIN = originFlag === -1 ? "http://127.0.0.1:3400" : process.argv[originFlag + 1];
const route = process.argv[2] ?? "/research/thesis";
const out = process.argv[3] ?? "world";
const FRAMES = Number(process.argv[4] ?? 10);
const W = Number(process.argv[5] ?? 1440);
const H = Number(process.argv[6] ?? 900);

await mkdir(out, { recursive: true });
const b = await chromium.launch({
  args: GPU
    ? ["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"]
    : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto(`${ORIGIN}${route}`, { waitUntil: "networkidle" });
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
