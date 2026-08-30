/**
 * Does the object ever collide with the words?
 *
 * Each world pins a caption over a full-viewport canvas. The camera always looks at the world
 * origin, so the object is horizontally centred while the caption sits in a column on the left -
 * which means the two are competing for the same pixels by construction, and whether they
 * actually collide depends on how wide the object is at each state.
 *
 * Eyeballing that is unreliable: the collision is only legible at some scroll positions, and a
 * reviewer looking at a filmstrip of eight worlds will forgive a near miss they would notice
 * while reading. So it is measured instead. At each sampled position the caption's own text boxes
 * are located, the region is captured twice - once as the reader sees it, once with the canvas
 * hidden - and the two are compared. Any pixel that changes is a pixel where the object is
 * drawing underneath the words.
 *
 * What counts as a collision is deliberately narrow. Any pixel changing behind the caption is not
 * a fault - the worlds are meant to be visible behind their scrim, and a dark plate shifting a
 * dark background costs nothing. The failure is a *bright* object arriving behind light text,
 * because that is what destroys the contrast the words depend on. So the measure is the count of
 * pixels that were dark scrim without the canvas and are bright with it. A first version of this
 * tool counted every changed pixel and scored medico's backbone at 53% - a state that reads
 * perfectly well - while under-reporting the label matrix, which genuinely sits on the words.
 *
 * Usage: node tools/audit-caption-collision.mjs [route ...]
 */
import { chromium } from "@playwright/test";

const GPU = ["--use-gl=angle", "--use-angle=default", "--enable-gpu"];
const ROUTES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "/work/transport-uq",
      "/work/reliable-knowledge-systems",
      "/work/medico",
      "/work/insureassist-rag",
      "/work/mlops-reference-pipeline",
      "/work/hydrology-uq",
      "/work/streamflow-forecasting",
      "/work/cifar10-cnn",
    ];
const ORIGIN = "http://127.0.0.1:3400";
const SAMPLES = [0.08, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88];

const browser = await chromium.launch({ args: GPU });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "no-preference",
});
const page = await context.newPage();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let worst = 0;
for (const route of ROUTES) {
  await page.goto(ORIGIN + route, { waitUntil: "load" });
  const track = await page.evaluate(() => {
    const el = document.querySelector(".world-track, .thesis-world-track");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), height: Math.round(r.height) };
  });
  if (!track) {
    console.log(`${route.padEnd(38)} no world track`);
    continue;
  }

  const hits = [];
  for (const at of SAMPLES) {
    const y = Math.round(track.top + (track.height - 900) * at);
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await sleep(650);

    /* The caption's own text, not the column it sits in. */
    const box = await page.evaluate(() => {
      const nodes = document.querySelectorAll(
        ".world-caption .world-stage-line strong, .world-caption .world-line, .world-caption h2," +
          " .world-caption p, .thesis-world-caption p, .thesis-world-caption strong",
      );
      let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
      for (const n of nodes) {
        const c = n.getBoundingClientRect();
        if (c.width < 4 || c.height < 4) continue;
        if (c.bottom < 0 || c.top > window.innerHeight) continue;
        l = Math.min(l, c.left); t = Math.min(t, c.top);
        r = Math.max(r, c.right); b = Math.max(b, c.bottom);
      }
      if (!Number.isFinite(l)) return null;
      return {
        x: Math.max(0, Math.floor(l) - 4),
        y: Math.max(0, Math.floor(t) - 4),
        width: Math.min(1440, Math.ceil(r) + 4) - Math.max(0, Math.floor(l) - 4),
        height: Math.min(900, Math.ceil(b) + 4) - Math.max(0, Math.floor(t) - 4),
      };
    });
    if (!box || box.width < 8 || box.height < 8) continue;

    const shown = (await page.screenshot({ clip: box })).toString("base64");
    await page.evaluate(() => {
      const c = document.querySelector(".world-canvas, .thesis-world-canvas");
      if (c) c.style.visibility = "hidden";
    });
    await sleep(120);
    const hidden = (await page.screenshot({ clip: box })).toString("base64");
    await page.evaluate(() => {
      const c = document.querySelector(".world-canvas, .thesis-world-canvas");
      if (c) c.style.visibility = "";
    });

    /* Decoded in the page, so the tool needs no image dependency of its own. */
    const pct = await page.evaluate(async ([a, b]) => {
      const load = (data) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = "data:image/png;base64," + data;
        });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      const w = ia.width;
      const h = ia.height;
      const read = (img) => {
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h;
        const ctx = cv.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, w, h).data;
      };
      const da = read(ia);
      const db = read(ib);
      const luma = (d, o) => 0.2126 * d[o] + 0.7152 * d[o + 1] + 0.0722 * d[o + 2];
      let intruding = 0;
      for (let i = 0; i < w * h; i += 1) {
        const o = i * 4;
        /* Dark scrim without the canvas, bright with it: contrast the words needed, taken away. */
        if (luma(db, o) < 62 && luma(da, o) > 96) intruding += 1;
      }
      return (intruding / (w * h)) * 100;
    }, [shown, hidden]);
    if (pct > 0.6) hits.push({ at, pct });
  }

  const peak = hits.reduce((m, h) => Math.max(m, h.pct), 0);
  worst = Math.max(worst, peak);
  const flag = peak > 6 ? "  <-- the object is drawing through the words" : "";
  console.log(
    `${route.padEnd(38)} peak ${peak.toFixed(1).padStart(5)}%  ` +
      `at ${hits.map((h) => `${h.at}:${h.pct.toFixed(0)}%`).join(" ") || "-"}${flag}`,
  );
}

console.log(`\nworst overlap across all worlds: ${worst.toFixed(1)}%`);
await browser.close();
