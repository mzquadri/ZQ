/**
 * The showreel.
 *
 * Records a silent pass over the finished site: the hero scrub, the exhibition index, all eight
 * worlds in the reel's running order, the public engineering verbs, and the ending.
 *
 * The cut was rewritten when the homepage became a reel. The previous one walked six chapters in
 * the old order, had no shot for the two worlds that were not yet in the sequence, and labelled
 * the streamflow chapter "forecast horizon" - a description the repository-first pass on that
 * project retired, since it evaluates one step ahead and produces no horizon at all.
 *
 * Playwright's own recorder is used rather than a frame-dump plus ffmpeg. ffmpeg is not on this
 * machine and `ffmpeg-static` was deliberately removed from the project earlier - it pulled 80MB
 * into every CI and Vercel install to serve a tool nobody runs during a build. The recorder needs
 * no dependency at all, and the output is a real video file.
 *
 * The pass is scripted rather than improvised: every scroll target and hold is listed below, so
 * re-recording produces the same cut and a change in the video means a change in the site.
 *
 * Usage: node tools/record-showreel.mjs [outDir] [origin]
 */
import { chromium } from "@playwright/test";
import { mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

const outDir = process.argv[2] ?? "media";
const origin = process.argv[3] ?? "http://127.0.0.1:3400";
const raw = join(outDir, ".showreel-raw");

mkdirSync(outDir, { recursive: true });
rmSync(raw, { recursive: true, force: true });
mkdirSync(raw, { recursive: true });

/**
 * The cut. `to` is a selector to bring into view, or a fraction of a named element's own scroll
 * span for the pinned sequences. `hold` is seconds spent on that moment.
 */
const SHOTS = [
  { route: "/", settle: 1.6, hold: 1.4, label: "open on the hero" },
  { scrub: ".cine-hero", at: 0.32, hold: 0.9, label: "prediction draws" },
  { scrub: ".cine-hero", at: 0.58, hold: 0.9, label: "interval calibrates" },
  { scrub: ".cine-hero", at: 0.86, hold: 1.1, label: "observations and the declined region" },

  { to: "#work", hold: 1.6, label: "the exhibition index: eight worlds" },

  /* One memorable shot per world, in the reel's running order, with the seams between them. */
  { to: "#work-transport-uq", hold: 1.8, label: "01 graph propagation and per-junction uncertainty" },
  { to: "#work-reliable-knowledge-systems", hold: 1.8, label: "02 one capture, three derived forms" },
  { to: "#work-medico", hold: 1.6, label: "03 fourteen findings, and what a corpus cannot label" },
  { to: "#work-insureassist-rag", hold: 1.7, label: "04 the right provision from the wrong policy" },
  { to: "#work-mlops-reference-pipeline", hold: 1.7, label: "05 four checks, and the one that refuses" },
  { to: "#work-hydrology-uq", hold: 1.6, label: "06 perturb the rain, then perturb the ruler" },
  { to: "#work-streamflow-forecasting", hold: 1.5, label: "07 one step ahead, given yesterday" },
  { to: "#work-cifar10-cnn", hold: 1.5, label: "08 one number covering ten" },

  { to: "#engineering", hold: 1.5, label: "ingest, represent, verify, observe" },
  { to: "#research", hold: 1.2, label: "research metrics" },
  { to: "#experience", hold: 1.2, label: "problems in order" },
  { to: "#contact", hold: 2.0, label: "the ending" },
];


const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: raw, size: { width: 1920, height: 1080 } },
  reducedMotion: "no-preference",
});

const page = await context.newPage();
const wait = (seconds) => page.waitForTimeout(seconds * 1000);

/** Smooth, frame-friendly travel. A jump cut mid-scrub looks like a bug rather than an edit. */
async function glideTo(targetY, seconds) {
  await page.evaluate(
    async ([y, ms]) => {
      const start = window.scrollY;
      const distance = y - start;
      const t0 = performance.now();
      // easeInOutCubic, so the camera starts and stops rather than snapping.
      const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
      await new Promise((resolve) => {
        const step = (now) => {
          const p = Math.min(1, (now - t0) / ms);
          window.scrollTo(0, start + distance * ease(p));
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    },
    [targetY, seconds * 1000],
  );
}

let total = 0;
for (const shot of SHOTS) {
  if (shot.route) {
    await page.goto(`${origin}${shot.route}`, { waitUntil: "networkidle" });
    await wait(shot.settle ?? 1);
  } else if (shot.scrub) {
    const track = await page.locator(shot.scrub).evaluate((el) => ({
      top: el.getBoundingClientRect().top + window.scrollY,
      height: el.getBoundingClientRect().height,
    }));
    const span = Math.max(0, track.height - 1080);
    await glideTo(track.top + span * shot.at, 1.1);
  } else if (shot.to) {
    const y = await page.locator(shot.to).evaluate(
      (el) => el.getBoundingClientRect().top + window.scrollY,
    );
    await glideTo(Math.max(0, y - 90), 1.3);
  }
  await wait(shot.hold);
  total += shot.hold + 1.2;
  console.log(`  ${shot.label}`);
}

await context.close();
await browser.close();

// Playwright names the file after the page's guid; give it a stable name.
const recorded = readdirSync(raw).find((f) => f.endsWith(".webm"));
if (!recorded) {
  console.error("no video produced");
  process.exit(1);
}
const finalPath = join(outDir, "showreel.webm");
rmSync(finalPath, { force: true });
renameSync(join(raw, recorded), finalPath);
rmSync(raw, { recursive: true, force: true });

console.log(`\nwrote ${finalPath} (~${total.toFixed(0)}s, 1920x1080, silent)`);
