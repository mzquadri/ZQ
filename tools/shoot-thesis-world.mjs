/** Frames across the thesis world track, at the states that matter. */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const out = process.argv[2] ?? "world";
const W = Number(process.argv[3] ?? 1440), H = Number(process.argv[4] ?? 900);
await mkdir(out, { recursive: true });
const b = await chromium.launch({ args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport:{width:W,height:H}, deviceScaleFactor:1 });
await p.goto("http://127.0.0.1:3400/research/thesis", { waitUntil:"networkidle" });
/* Scroll the world into view so the renderer mounts, then measure - the track is only tall for
   readers the scene actually runs for, so measuring before mount reads the collapsed height. */
await p.evaluate(() => document.querySelector(".thesis-world")?.scrollIntoView());
await p.waitForTimeout(2200);
const box = await p.evaluate(() => {
  const t = document.querySelector(".thesis-world-track");
  if (!t) return null;
  const r = t.getBoundingClientRect();
  return { top: r.top + window.scrollY, height: r.height, mode: t.closest(".thesis-world")?.getAttribute("data-mode") };
});
console.log("track:", JSON.stringify(box));
if (!box) { await b.close(); process.exit(0); }
const travel = box.height - H;
for (let i = 0; i <= 9; i += 1) {
  const f = i / 9;
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(box.top + travel * f));
  await p.waitForTimeout(650);
  await p.screenshot({ path: `${out}/${String(i).padStart(2,"0")}.png` });
}
const mode = await p.evaluate(() => document.querySelector(".thesis-world")?.getAttribute("data-mode"));
console.log("mode after scroll:", mode);
await b.close();
