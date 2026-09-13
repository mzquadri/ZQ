/**
 * Every WebGL world, on whichever renderer the browser gives us.
 *
 * Drives each world route, scrolls its stage into view so the visibility gate is satisfied, and
 * reports what mounted, whether the flat figure is present, and whether the driver complained.
 * Playwright's default headless browser is SwiftShader, so a default run exercises the software
 * path; pass --gpu to exercise the hardware one.
 *
 * Usage: node tools/check-worlds.mjs <origin> [--gpu] [--reduced]
 */
import { chromium } from "@playwright/test";

const ORIGIN = (process.argv[2] ?? "http://localhost:3600").replace(/\/$/, "");
const GPU = process.argv.includes("--gpu");
const REDUCED = process.argv.includes("--reduced");

/** route, the stage selector, and a human name. */
export const WORLDS = [
  ["/work/cifar10-cnn", ".world-stage", "cifar"],
  ["/work/hydrology-uq", ".world-stage", "hydrology"],
  ["/work/insureassist-rag", ".world-stage", "insureassist"],
  ["/work/medico", ".world-stage", "medico"],
  ["/work/mlops-reference-pipeline", ".world-stage", "mlops"],
  ["/work/reliable-knowledge-systems", ".world-stage", "reliable"],
  ["/work/streamflow-forecasting", ".world-stage", "streamflow"],
  /* The thesis world predates the shared `world-stage` class and keeps its own. */
  ["/research/thesis", ".thesis-world", "thesis"],
];

const browser = await chromium.launch(
  GPU
    ? { headless: true, args: ["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] }
    : { headless: true },
);

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  reducedMotion: REDUCED ? "reduce" : "no-preference",
});
await context.addInitScript(() => {
  window.__readbacks = 0;
  for (const Ctx of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!Ctx) continue;
    for (const m of ["readPixels", "getBufferSubData"]) {
      const o = Ctx.prototype[m];
      if (!o) continue;
      Ctx.prototype[m] = function (...a) { window.__readbacks += 1; return o.apply(this, a); };
    }
  }
});

const probe = await context.newPage();
await probe.goto(ORIGIN + "/", { waitUntil: "domcontentloaded" });
const renderer = await probe.evaluate(() => {
  const cv = document.createElement("canvas");
  const gl = cv.getContext("webgl2") || cv.getContext("webgl");
  const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
  return d ? String(gl.getParameter(d.UNMASKED_RENDERER_WEBGL)) : "unknown";
});
await probe.close();
const software = /swiftshader|llvmpipe|softpipe|basic render|software adapter/i.test(renderer);

console.log(`renderer : ${renderer.slice(0, 74)}`);
console.log(`class    : ${software ? "SOFTWARE" : "HARDWARE"}${REDUCED ? "  (reduced motion)" : ""}`);
console.log(`expecting: ${software || REDUCED ? "no world canvas, flat figure only" : "world canvas mounts"}\n`);

let failures = 0;
for (const [route, stageSel, name] of WORLDS) {
  const page = await context.newPage();
  let warnings = 0;
  let pageErrors = 0;
  page.on("console", (m) => { if (/ReadPixels|GPU stall/i.test(m.text())) warnings += 1; });
  page.on("pageerror", () => { pageErrors += 1; });

  await page.goto(ORIGIN + route, { waitUntil: "networkidle", timeout: 60000 });
  const stage = page.locator(stageSel).first();
  if (await stage.count()) await stage.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(1600);

  const s = await page.evaluate((sel) => {
    const st = document.querySelector(sel);
    return {
      mode: st?.getAttribute("data-mode") ?? "none",
      canvas: document.querySelectorAll(".world-canvas canvas, .thesis-world-canvas canvas").length,
      flat: Boolean(st && st.textContent && st.textContent.trim().length > 40),
      readbacks: window.__readbacks,
    };
  }, stageSel);

  const wantCanvas = !software && !REDUCED;
  const ok =
    warnings === 0 &&
    pageErrors === 0 &&
    s.flat &&
    s.readbacks === 0 &&
    (wantCanvas ? s.canvas >= 1 : s.canvas === 0);
  if (!ok) failures += 1;

  console.log(
    `  ${ok ? "ok  " : "FAIL"}  ${name.padEnd(13)} mode=${s.mode.padEnd(7)} canvas=${s.canvas}  flat=${s.flat}  readbacks=${s.readbacks}  warnings=${warnings}  pageErrors=${pageErrors}`,
  );
  await page.close();
}

await context.close();
await browser.close();
console.log(failures ? `\n${failures} world(s) failed` : "\nAll worlds behave as expected for this renderer.");
process.exit(failures ? 1 : 0);
