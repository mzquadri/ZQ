/**
 * Deterministic portfolio video export for the Legal Knowledge Platform case study.
 *
 * Development tooling. Nothing here is imported by the site, so none of it reaches a client
 * bundle; it drives the built production app in a browser and encodes what it sees.
 *
 * The whole point is repeatability. Every frame comes from a named (step, beat) position in the
 * walkthrough table, held for a stated number of frames, so the same command produces the same
 * video every run. There is no autoplay, no waiting on wall-clock animation, and no dependence on
 * pointer position - which also means the pointer parallax on the first figure never fires,
 * because the mouse is never moved over it.
 *
 * Usage:
 *   npm run build
 *   node tools/record-legal-kb-video.mjs            # 16:9 master
 *   node tools/record-legal-kb-video.mjs --social   # portrait cut as well
 *
 * Output: media/legal-knowledge-platform.mp4 (and -social.mp4), outside the app source tree.
 */

import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, rmSync, existsSync, writeFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "@playwright/test";

/**
 * ffmpeg is resolved at run time, not declared as a dependency.
 *
 * The binary is roughly eighty megabytes and would be downloaded on every install - including
 * every Vercel build and every CI run - for a tool that only ever runs on a developer's machine.
 * Set FFMPEG_PATH to use one already on the system, or `npm i -D ffmpeg-static` to fetch one.
 */
async function resolveFfmpeg() {
  if (process.env.FFMPEG_PATH && existsSync(process.env.FFMPEG_PATH)) return process.env.FFMPEG_PATH;
  try {
    const mod = await import("ffmpeg-static");
    const candidate = mod.default ?? mod;
    if (typeof candidate === "string" && existsSync(candidate)) return candidate;
  } catch {
    /* not installed */
  }
  fail(
    "no ffmpeg available. Either set FFMPEG_PATH to an ffmpeg binary, or run `npm i -D ffmpeg-static`.",
  );
}

const ROOT = resolve(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "media");
const FRAME_DIR = join(ROOT, ".video-frames");
const PORT = 3410;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const ROUTE = "/work/legal-knowledge-platform";
const FPS = 30;

const wantSocial = process.argv.includes("--social");

/** Step ids, in order. Mirrors the walkthrough table; asserted against the DOM on every move. */
const STEP_IDS = [
  "problem", "source", "representations", "measurement", "change", "confidence", "contribution", "lesson",
];

/**
 * The cut.
 *
 * Shorter than the eight-step page walkthrough: the video is a trailer, not a transcript. Each
 * shot names the walkthrough position it wants and how long to hold it, plus its own caption -
 * shortened from the page's, because a caption that must be read in four seconds is not the same
 * sentence as one being read at leisure.
 *
 * `settle` is extra time granted before the first frame of a shot is kept, for scenes whose CSS
 * transition or WebGL settle needs to finish. It is not recorded.
 *
 * `frame` is the element the shot is actually about, centred in the viewport. The page scrolls
 * top-aligned for a reader who will keep scrolling; a still frame wants the subject in the middle
 * of the picture with as little unrelated prose around it as possible.
 */
const SHOTS = [
  { step: 0, beat: 0, hold: 1.6, settle: 700, frame: ".legal-count-grid", caption: "Stored is not the same as correct.", kicker: "Legal Knowledge Platform" },
  { step: 0, beat: 2, hold: 4.2, settle: 900, frame: ".legal-count-stage", caption: "Equal totals prove quantity, not identity." },
  { step: 1, beat: 1, hold: 3.6, settle: 900, frame: ".legal-fanout-source", caption: "A published source is captured before anything is parsed." },
  { step: 1, beat: 2, hold: 3.0, settle: 800, frame: ".legal-fanout-source", caption: "Those exact bytes fix what every later claim is measured against." },
  { step: 2, beat: 0, hold: 6.5, settle: 2600, frame: ".legal-fanout-grid", caption: "One source becomes three independent representations." },
  { step: 3, beat: 0, hold: 5.5, settle: 1400, frame: ".legal-fanout-grid", caption: "Each is compared against the capture, not against the others." },
  { step: 4, beat: 0, hold: 3.0, settle: 900, frame: ".legal-generations", caption: "When the published source changes\u2026" },
  { step: 4, beat: 1, hold: 3.4, settle: 900, frame: ".legal-generations", caption: "\u2026unchanged is retained, new is added, changed is replaced." },
  { step: 4, beat: 2, hold: 7.0, settle: 1200, frame: ".legal-generations", caption: "Current state changes. The captured evidence does not." },
  { step: 5, beat: 1, hold: 2.6, settle: 700, frame: ".legal-ladder", caption: "Confidence is built in classes of evidence." },
  { step: 5, beat: 3, hold: 6.0, settle: 1200, frame: ".legal-ladder", caption: "Each rules out a different failure. None of them becomes proof." },
  { step: 6, beat: 0, hold: 6.5, settle: 1200, frame: ".two-column-copy > div:last-child", caption: "The platform existed already. My work was verification and convergence." },
  { step: 7, beat: 0, hold: 4.0, settle: 1000, frame: ".case-learning", align: "top", caption: "The layer invalidated an interpretation I had written myself." },
  // The page's own last sentence is this caption, so the reflection is hidden for the closing
  // shot: printing the same line twice in one frame reads as a mistake, not as emphasis.
  { step: 7, beat: 1, hold: 7.5, settle: 1200, frame: ".case-learning", hide: [".case-learning blockquote"], align: "top", caption: "A verification instrument has to be allowed to prove its author wrong.", final: true },
];

/*
 * Recorded at the site's own content width rather than at output size.
 *
 * The layout is a 76rem column: in a 1920-wide viewport it sits in the middle of the picture with
 * a third of the frame empty on either side. Recording at 1280 makes the column the frame, and a
 * device scale factor of 1.5 means the captured pixels are already 1920 wide, so nothing is
 * upscaled and the type stays sharp.
 */
const FORMATS = [
  { id: "master", width: 1280, height: 720, scale: 1.5, out: [1920, 1080], file: "legal-knowledge-platform.mp4" },
  { id: "social", width: 900, height: 1125, scale: 1.2, out: [1080, 1350], file: "legal-knowledge-platform-social.mp4" },
];

function log(message) {
  process.stdout.write(`  ${message}\n`);
}

function fail(message) {
  process.stderr.write(`\n  FAILED: ${message}\n`);
  process.exit(1);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      const response = await fetch(`${ORIGIN}${ROUTE}`);
      if (response.ok) return;
    } catch {
      /* still starting */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  fail("the production server never became ready on " + ORIGIN);
}

/** The caption card drawn over the page. Kept in the site's own palette and type. */
const OVERLAY_CSS = `
#zq-vid {
  position: fixed; inset: auto 0 0 0; z-index: 2147483647;
  padding: 4rem 3rem 2rem;
  background: linear-gradient(to top,
    rgba(242,240,232,1) 0%, rgba(242,240,232,1) 52%, rgba(242,240,232,0) 100%);
  font-family: var(--sans); pointer-events: none;
}
#zq-vid p { margin: 0; color: var(--ink); font-size: 1.6rem; line-height: 1.3; max-width: 44ch; }
#zq-vid span { display:block; margin-bottom: 0.45rem; color: var(--orange-text);
  font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; }
#zq-vid[data-final] p { font-family: var(--serif); font-weight: 500; font-size: 1.95rem; max-width: 30ch; }
:root[data-recording] .legal-dock { display: none !important; }
:root[data-recording] .site-header { display: none !important; }
:root[data-recording] .site-footer, :root[data-recording] footer { visibility: hidden !important; }
:root[data-recording] .skip-link { display: none !important; }
/* Room to scroll past the last section, so a closing shot can be framed like any other rather
   than being stuck against the bottom of the document. */
:root[data-recording] body { padding-bottom: 70vh !important; }
:root[data-recording] * { scrollbar-width: none !important; }
:root[data-recording] ::-webkit-scrollbar { display: none !important; }
`;

async function capture(format) {
  const frameDir = join(FRAME_DIR, format.id);
  rmSync(frameDir, { recursive: true, force: true });
  mkdirSync(frameDir, { recursive: true });

  const browser = await chromium.launch({
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--force-device-scale-factor=1",
      "--hide-scrollbars",
      "--force-prefers-reduced-motion=0",
    ],
  });

  const page = await browser.newPage({
    viewport: { width: format.width, height: format.height },
    deviceScaleFactor: format.scale,
    reducedMotion: "no-preference",
  });

  const problems = [];
  page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
  page.on("pageerror", (e) => problems.push(String(e)));

  await page.goto(`${ORIGIN}${ROUTE}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: OVERLAY_CSS });
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-recording", "");
    const node = document.createElement("div");
    node.id = "zq-vid";
    node.innerHTML = "<span></span><p></p>";
    document.body.appendChild(node);
  });

  // Enter guided mode and take the timeline: every position from here is named, not waited for.
  await page.getByRole("button", { name: "2-minute walkthrough" }).click();
  await page.waitForSelector("html[data-walkthrough]");
  await page.waitForFunction(() => Boolean(window.zqWalkthrough));
  await page.evaluate(() => window.zqWalkthrough.toggle());

  let frameIndex = 0;
  for (const shot of SHOTS) {
    await stepTo(page, shot.step, shot.beat);

    await page.evaluate(
      ([caption, kicker, isFinal]) => {
        const host = document.querySelector("#zq-vid");
        host.querySelector("span").textContent = kicker ?? "";
        host.querySelector("p").textContent = caption;
        if (isFinal) host.setAttribute("data-final", "");
        else host.removeAttribute("data-final");
      },
      [shot.caption, shot.kicker ?? null, Boolean(shot.final)],
    );

    // Centre the subject. The sticky header is hidden while recording, so there is nothing to
    // clear at the top and the scene can sit in the middle of the picture.
    // Elements a shot deliberately keeps out of frame, restored when the shot ends.
    await page.evaluate((selectors) => {
      document.querySelectorAll("[data-shot-hidden]").forEach((node) => {
        node.removeAttribute("data-shot-hidden");
        node.style.display = "";
      });
      for (const selector of selectors ?? []) {
        document.querySelectorAll(selector).forEach((node) => {
          node.setAttribute("data-shot-hidden", "");
          // display, not visibility: a hidden element that keeps its box leaves the frame with a
          // band of nothing where it used to be, which reads as a broken layout.
          node.style.display = "none";
        });
      }
    }, shot.hide ?? []);

    if (shot.frame) {
      await page.evaluate(
        ([selector, align, insetOverride]) => {
          const node = document.querySelector(selector);
          if (!node) throw new Error(`framing target not found: ${selector}`);
          const box = node.getBoundingClientRect();
          // Leave room for the caption card at the bottom of the frame.
          const captionRoom = 200;
          const usable = window.innerHeight - captionRoom;
          // Centred by default; "top" for a subject taller than the usable height, so it is read
          // from its beginning rather than clipped through the middle of a line.
          const inset =
            typeof insetOverride === "number"
              ? insetOverride
              : align === "top"
                ? 40
                : Math.max(24, (usable - box.height) / 2);
          const target = window.scrollY + box.top - inset;
          window.scrollTo({ top: Math.max(0, target), behavior: "auto" });
        },
        [shot.frame, shot.align ?? "center", shot.inset ?? null],
      );
      await page.waitForTimeout(220);
    }

    await page.waitForTimeout(shot.settle);

    const frames = Math.round(shot.hold * FPS);
    for (let f = 0; f < frames; f += 1) {
      await page.screenshot({
        path: join(frameDir, `f${String(frameIndex).padStart(5, "0")}.png`),
        animations: "disabled",
      });
      frameIndex += 1;
    }
    log(`${format.id}: step ${shot.step}.${shot.beat} -> ${frames} frames`);
  }

  if (problems.length) fail(`browser reported ${problems.length} error(s): ${problems[0]}`);
  await browser.close();
  return { frameDir, frameIndex };
}

/**
 * Walk the run to an exact position.
 *
 * Next moves to the first beat of a step and the scheduler is paused, so reaching a later beat
 * means playing just that step and stopping when the attribute says we have arrived. Everything
 * is read back off the DOM contract rather than assumed.
 */
/**
 * Move the run to an exact position.
 *
 * Uses the control surface the walkthrough publishes on `window`, which is the same set of
 * actions the dock buttons call. Naming the position directly is what makes a run reproducible:
 * stepping and hoping depends on timing, and timing is the one thing a recorder cannot rely on.
 */
async function stepTo(page, step, beat) {
  await page.evaluate(
    ([s, b]) => {
      const api = window.zqWalkthrough;
      if (!api) throw new Error("the walkthrough control surface is not published");
      api.goTo(s, b);
    },
    [step, beat],
  );

  await page.waitForFunction(
    ([wantStep, wantBeat]) => {
      const html = document.documentElement;
      return (
        html.getAttribute("data-walkthrough-step") === wantStep &&
        html.getAttribute("data-walkthrough-beat") === String(wantBeat)
      );
    },
    [STEP_IDS[step], beat],
    { timeout: 10000 },
  );
}

function encode(frameDir, format) {
  mkdirSync(OUT_DIR, { recursive: true });
  const output = join(OUT_DIR, format.file);
  rmSync(output, { force: true });

  // Frames are already captured at output size via the device scale factor; this only guarantees
  // the exact dimensions and an even-numbered raster for H.264.
  const [outWidth, outHeight] = format.out;
  const filters = `scale=${outWidth}:${outHeight}:flags=lanczos`;

  execFileSync(
    ffmpegPath,
    [
      "-y", "-framerate", String(FPS),
      "-i", join(frameDir, "f%05d.png"),
      "-vf", `${filters},format=yuv420p`,
      "-c:v", "libx264", "-preset", "slow", "-crf", "20",
      "-movflags", "+faststart", "-r", String(FPS),
      output,
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  return output;
}

function verify(output, expectedSeconds) {
  if (!existsSync(output)) fail(`no file was produced at ${output}`);
  const bytes = statSync(output).size;
  if (bytes < 200_000) fail(`${output} is only ${bytes} bytes; the encode did not work`);

  // `ffmpeg -i` with no output is how you ask it to describe a file, and it exits non-zero for
  // exactly that reason. The description is on stderr either way.
  let probe = "";
  try {
    probe = execFileSync(ffmpegPath, ["-i", output, "-hide_banner"], {
      stdio: ["ignore", "ignore", "pipe"],
      encoding: "utf8",
    }).toString();
  } catch (error) {
    probe = String(error.stderr ?? "");
  }
  const match = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(probe);
  if (!match) fail(`could not read a duration from ${output}`);
  const seconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);

  if (Math.abs(seconds - expectedSeconds) > 2) {
    fail(`${output} runs ${seconds.toFixed(1)}s; the cut asks for ${expectedSeconds.toFixed(1)}s`);
  }
  if (seconds < 60 || seconds > 90) {
    fail(`${output} runs ${seconds.toFixed(1)}s, outside the 60-90s the brief asks for`);
  }
  if (!/h264/.test(probe)) fail(`${output} is not H.264`);
  return { seconds, bytes };
}

let ffmpegPath;

async function main() {
  ffmpegPath = await resolveFfmpeg();
  if (!existsSync(join(ROOT, ".next", "BUILD_ID"))) fail("no production build found - run `npm run build` first");

  const expected = SHOTS.reduce((total, shot) => total + shot.hold, 0);
  log(`cut is ${SHOTS.length} shots, ${expected.toFixed(1)}s at ${FPS}fps`);

  const server = spawn(process.execPath, [join(ROOT, "node_modules", "next", "dist", "bin", "next"), "start", "-p", String(PORT)], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "ignore",
  });

  try {
    await waitForServer();
    const targets = wantSocial ? FORMATS : FORMATS.slice(0, 1);
    const results = [];

    for (const format of targets) {
      log(`recording ${format.id} at ${format.width}x${format.height}`);
      const { frameDir, frameIndex } = await capture(format);
      log(`${format.id}: ${frameIndex} frames captured, encoding`);
      const output = encode(frameDir, format);
      const { seconds, bytes } = verify(output, expected);
      log(`${format.id}: ${output} - ${seconds.toFixed(1)}s, ${(bytes / 1_000_000).toFixed(1)} MB`);
      results.push({ format: format.id, output, seconds, bytes });
    }

    writeFileSync(
      join(OUT_DIR, "shot-list.json"),
      JSON.stringify({ fps: FPS, shots: SHOTS, results }, null, 2) + "\n",
    );
    rmSync(FRAME_DIR, { recursive: true, force: true });
    log("intermediate frames removed");
  } finally {
    server.kill();
  }
}

main().catch((error) => fail(error.stack ?? String(error)));
