/**
 * Does anything keep painting after it leaves the screen?
 *
 * The continuous motion capture turned up an inversion worth explaining: the eight canvas
 * chapters hold ~60 fps and drop 3-5% of frames, while the plain prose sections *below* the reel
 * drop 7-11%. Heavier work running smoother than lighter work is not a rendering result, it is a
 * bookkeeping result - something above the fold line is still drawing while the reader has moved
 * on to text that draws nothing.
 *
 * So this counts paints per element, per phase, with nothing inferred. Both canvas APIs are
 * wrapped at their draw calls - 2D at clearRect and drawImage, WebGL at drawArrays and
 * drawElements - and every call is attributed to the canvas it landed on. Then the page is
 * scrolled well past everything and left alone. Any counter that keeps climbing during that
 * window belongs to something painting into a buffer nobody is looking at.
 *
 * Usage: node tools/audit-offscreen.mjs [route] [origin]
 */
import { chromium } from "@playwright/test";

const route = process.argv[2] ?? "/";
const origin = process.argv[3] ?? "http://127.0.0.1:3400";

const HOOK = `(() => {
  window.__paint = new Map();
  const bump = (canvas) => {
    if (!canvas) return;
    const key = canvas.className || canvas.id || canvas.tagName;
    const rec = window.__paint.get(canvas) ?? { key, count: 0 };
    rec.count += 1;
    rec.canvas = canvas;
    window.__paint.set(canvas, rec);
  };
  const wrap = (proto, names, get) => {
    for (const name of names) {
      const original = proto?.[name];
      if (typeof original !== "function") continue;
      proto[name] = function (...args) {
        bump(get(this));
        return original.apply(this, args);
      };
    }
  };
  wrap(CanvasRenderingContext2D.prototype, ["clearRect", "drawImage", "beginPath", "setTransform"], (ctx) => ctx.canvas);
  if (window.WebGLRenderingContext) {
    wrap(WebGLRenderingContext.prototype, ["drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced"], (gl) => gl.canvas);
  }
  if (window.WebGL2RenderingContext) {
    wrap(WebGL2RenderingContext.prototype, ["drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced"], (gl) => gl.canvas);
  }
  window.__snapshot = () => {
    const out = [];
    for (const rec of window.__paint.values()) {
      const r = rec.canvas.getBoundingClientRect();
      out.push({
        key: rec.key,
        count: rec.count,
        onScreen: r.bottom > 0 && r.top < innerHeight && r.width > 0,
        top: Math.round(r.top),
      });
    }
    return out;
  };
})();`;

/*
 * Launched against the real GPU on purpose.
 *
 * Headless Chromium defaults to SwiftShader, a software rasteriser. That is fine for asserting
 * what a page contains and useless for asserting how it moves: the first pass of this review
 * measured the WebGL detail routes at 8-20 fps and the finding was an artifact of rasterising
 * every fragment on the CPU. No reader has that machine. These flags hand rendering to the
 * actual adapter, which is the only configuration in which a frame time means anything.
 *
 * Draw-call counts are not affected either way - a call issued to a software rasteriser is still
 * a call - so the offscreen audit remains valid under the default launcher.
 */
const GPU = ["--use-gl=angle", "--use-angle=default", "--enable-gpu"];

const browser = await chromium.launch({ args: GPU });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "no-preference",
});
await context.addInitScript(HOOK);
const page = await context.newPage();
await page.goto(origin + route, { waitUntil: "load" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Walk the whole page once so every lazy scene has mounted and started. */
const height = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < height; y += 700) {
  await page.evaluate((to) => scrollTo(0, to), y);
  await sleep(260);
}

/* Park at the very bottom, where none of the scenes are on screen, and let it sit. */
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
await sleep(700);
const before = await page.evaluate(() => window.__snapshot());
const WINDOW_MS = 3000;
await sleep(WINDOW_MS);
const after = await page.evaluate(() => window.__snapshot());

console.log(`${route}  -- paints during ${WINDOW_MS} ms parked at the bottom\n`);
let offenders = 0;
for (let i = 0; i < after.length; i += 1) {
  const delta = after[i].count - (before[i]?.count ?? 0);
  const fps = (delta / (WINDOW_MS / 1000)).toFixed(1);
  const state = after[i].onScreen ? "on screen" : "OFF screen";
  if (!after[i].onScreen && delta > 3) offenders += 1;
  const flag = !after[i].onScreen && delta > 3 ? "  <-- still painting" : "";
  console.log(
    `  ${after[i].key.slice(0, 40).padEnd(42)} ${state}  ` +
      `total ${String(after[i].count).padStart(7)}  ` +
      `${String(delta).padStart(5)} paints  ${fps.padStart(6)}/s${flag}`,
  );
}
console.log(`\n${offenders} offscreen canvas(es) still painting.`);
await browser.close();
