/**
 * Continuous motion capture, at reading speed.
 *
 * Every visual review of this site so far has been a filmstrip: discrete screenshots at chosen
 * scroll offsets. A filmstrip proves composition and cannot prove motion. Everything that makes
 * scroll-driven work feel cheap - stutter, a scene that snaps instead of settling, a long task
 * that eats a third of a second while the reader is mid-gesture - lives strictly between two
 * screenshots and is invisible to every review done that way.
 *
 * So this records the site the way it is actually used: real wheel events, at a real reader's
 * velocity, in wall-clock time, against the production build. Two artifacts come out of one pass.
 *
 *   1. A video file, at 1440x900, at 1x. Not a developer capture with instant jumps; the scroll
 *      is emitted at ~60 Hz with a per-phase velocity in pixels per second, so a second of the
 *      recording is a second of reading.
 *
 *   2. A frame timeline recorded inside that same pass: rAF deltas, long tasks and layout shifts,
 *      all stamped against the video clock. This is the half a filmstrip structurally cannot
 *      show. A dropped frame at 00:14 is a number here and a flinch on playback, and the two
 *      refer to the same moment.
 *
 * The instrument is deliberately cheap - it appends a number per frame and does nothing else -
 * because a probe that costs frames to read frames measures itself.
 *
 * Usage: node tools/record-motion.mjs <cut> [outDir] [origin]
 */
import { chromium } from "@playwright/test";
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const cutName = process.argv[2] ?? "home";
const outDir = process.argv[3] ?? "media/motion";
const origin = process.argv[4] ?? "http://127.0.0.1:3400";

const VIEWPORT = { width: 1440, height: 900 };

/* A reader's hand, in pixels per second. Transit is moving between things; read is moving
 * through something worth looking at; scrub is the pace a pinned scene is meant to be seen at. */
const SPEED = { transit: 1300, read: 620, scrub: 330 };

/** The eight detail routes get the same short cut: the opening object, then into the world. */
const detailCut = (slug) => [
  { goto: `/work/${slug}`, hold: 2.2, label: "opening composition at rest" },
  { scroll: 900, speed: "read", label: "leave the identity object" },
  { hold: 1.0 },
  { scroll: 2600, speed: "scrub", label: "through the world" },
  { hold: 1.4, label: "rest inside the world" },
  { scroll: 2200, speed: "read", label: "onward through the case study" },
  { hold: 1.0 },
];

const CUTS = {
  home: [
    { goto: "/", hold: 2.6, label: "open on the hero, at rest" },
    { scroll: 1400, speed: "scrub", label: "hero scrub" },
    { hold: 1.2, label: "hero rest frame" },
    { scroll: 1600, speed: "transit", label: "into the reel" },
    { scroll: 3200, speed: "scrub", label: "chapter one" },
    { hold: 1.2 },
    { scroll: 3200, speed: "scrub", label: "chapter two" },
    { hold: 1.2 },
    { scroll: 3200, speed: "scrub", label: "chapter three" },
    { hold: 1.2 },
    { scroll: 3200, speed: "scrub", label: "chapter four" },
    { hold: 1.2 },
    { scroll: 3200, speed: "scrub", label: "chapter five" },
    { hold: 1.2 },
    { scroll: 3200, speed: "scrub", label: "chapter six" },
    { hold: 1.2 },
    { scroll: 3200, speed: "scrub", label: "chapter seven" },
    { hold: 1.2 },
    { scroll: 3200, speed: "scrub", label: "chapter eight" },
    { hold: 1.2 },
    { scroll: 4200, speed: "read", label: "out of the reel" },
    { hold: 1.2, label: "rest after the reel" },
    { scroll: 4200, speed: "read", label: "the engineering sections" },
    { hold: 1.2 },
    { scroll: 7000, speed: "read", label: "down to the ending" },
    { hold: 2.4, label: "ending, at the bottom" },
  ],
  transport: detailCut("transport-uq"),
  rks: detailCut("reliable-knowledge-systems"),
  medico: detailCut("medico"),
  insureassist: detailCut("insureassist-rag"),
  mlops: detailCut("mlops-reference-pipeline"),
  hydrology: detailCut("hydrology-uq"),
  streamflow: detailCut("streamflow-forecasting"),
  cifar: detailCut("cifar10-cnn"),
};

const cut = CUTS[cutName];
if (!cut) {
  console.error(`unknown cut "${cutName}". known: ${Object.keys(CUTS).join(", ")}`);
  process.exit(1);
}

/* Recorded inside the page, against the same clock the video is stamped with. */
const INSTRUMENT = `(() => {
  const t0 = performance.now();
  window.__motion = { t0, frames: [], long: [], shifts: [], marks: [] };
  let last = t0;
  const tick = (now) => {
    window.__motion.frames.push(Math.round((now - last) * 100) / 100);
    last = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        window.__motion.long.push({ at: Math.round(e.startTime - t0), ms: Math.round(e.duration) });
      }
    }).observe({ type: "longtask", buffered: true });
  } catch {}
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__motion.shifts.push({ at: Math.round(e.startTime - t0), value: e.value });
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch {}
})();`;

const raw = join(outDir, `.raw-${cutName}`);
mkdirSync(outDir, { recursive: true });
rmSync(raw, { recursive: true, force: true });
mkdirSync(raw, { recursive: true });

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
/* NO_VIDEO=1 runs the identical cut with the recorder off. The encoder is not free and its cost
 * scales with how much of the frame changed, so a pass that scrolls prose - where every pixel
 * moves - is far more expensive to encode than a pinned scene, where most of the frame is still.
 * Comparing the two runs separates the site's frame timing from the recording of it. */
const recording = process.env.NO_VIDEO !== "1";
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
  ...(recording ? { recordVideo: { dir: raw, size: VIEWPORT } } : {}),
});
await context.addInitScript(INSTRUMENT);
const page = await context.newPage();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mark = (label) =>
  page.evaluate((l) => {
    window.__motion?.marks.push({ at: Math.round(performance.now() - window.__motion.t0), label: l });
  }, label);

/** Emit wheel events at ~60 Hz so the page receives motion, not teleportation. */
async function scrollBy(distance, pxPerSecond) {
  const step = Math.max(1, Math.round(pxPerSecond / 60));
  let done = 0;
  while (done < distance) {
    const delta = Math.min(step, distance - done);
    await page.mouse.wheel(0, delta);
    done += delta;
    await sleep(16);
  }
}

console.log(`recording "${cutName}" at ${VIEWPORT.width}x${VIEWPORT.height}`);
for (const shot of cut) {
  if (shot.goto) {
    await page.goto(origin + shot.goto, { waitUntil: "load" });
    await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2);
  }
  if (shot.label) await mark(shot.label);
  if (shot.scroll) await scrollBy(shot.scroll, SPEED[shot.speed ?? "read"]);
  if (shot.hold) await sleep(shot.hold * 1000);
}
await mark("end of cut");

const timeline = await page.evaluate(() => ({
  frames: window.__motion.frames,
  long: window.__motion.long,
  shifts: window.__motion.shifts,
  marks: window.__motion.marks,
  scrollTop: Math.round(window.scrollY),
  scrollHeight: Math.round(document.documentElement.scrollHeight),
}));

await context.close();
await browser.close();

const suffix = recording ? "" : ".novideo";
if (recording) {
  const file = readdirSync(raw).find((f) => f.endsWith(".webm"));
  const video = join(outDir, `${cutName}.webm`);
  rmSync(video, { force: true });
  renameSync(join(raw, file), video);
  console.log(`video    ${video}`);
}
rmSync(raw, { recursive: true, force: true });
writeFileSync(join(outDir, `${cutName}${suffix}.timeline.json`), JSON.stringify(timeline));

console.log(`frames   ${timeline.frames.length}`);
console.log(`scrolled ${timeline.scrollTop} of ${timeline.scrollHeight}`);
