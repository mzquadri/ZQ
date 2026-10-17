/**
 * Film the world and the classic view, in both themes, in one unbroken take.
 *
 * No cuts, so what you see is what the browser did: the city from above, three
 * places visited, the theme switched underneath without a reload, then out to
 * the classic view and back to light. Playwright records the whole context, so
 * the file carries the real frame timing rather than stills pretending to be a
 * video.
 *
 * Filmed against a production server, not the dev one: the dev build paints an
 * overlay badge in the corner where the way out of the world is, and it both
 * appears in the frame and swallows the click.
 *
 * The world is opened with `?world=force` because the renderer check fails
 * closed on a software rasteriser, which is what a headless browser reports.
 * Nothing else on screen differs from what a reader gets.
 *
 *   node tools/record-world.mjs [baseUrl] [outDir]
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = resolve(process.argv[3] ?? "../_portfolio-work/prototype");
const SIZE = { width: 1440, height: 900 };

const FFMPEG =
  process.env.FFMPEG ??
  "C:\\Users\\zamin\\AppData\\Local\\Microsoft\\WinGet\\Packages" +
    "\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe" +
    "\\ffmpeg-9.0.2-full_build\\bin\\ffmpeg.exe";

/**
 * The length asked for. The head is measured rather than assumed: on a software
 * rasteriser the world can take anywhere from three to fifteen seconds to put
 * its first frame up, and a fixed guess cut the take in the wrong place, losing
 * the dark theme and the classic view off the end.
 */
const LENGTH = 30;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    document.documentElement.dataset.theme = t;
    try {
      window.localStorage.setItem("zq-theme", t);
    } catch {
      /* storage off; the attribute is what matters */
    }
  }, theme);
}

const visit = (page, index) => page.locator(".world-places button").nth(index).click();

async function main() {
  rmSync(join(OUT, "raw"), { force: true, recursive: true });
  mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({
    args: [
      // Headless Chromium will not run WebGL at all without these, and a world
      // that does not render films as a flat coloured rectangle.
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  const context = await browser.newContext({
    viewport: SIZE,
    deviceScaleFactor: 1,
    recordVideo: { dir: join(OUT, "raw"), size: SIZE },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  /* Recording starts with the context, so this is the zero of the video. */
  const started = Date.now();

  /* The whole city, in light. */
  await page.goto(`${BASE}/world?world=force`, { waitUntil: "networkidle" });
  await page.waitForSelector(".world-places button", { timeout: 40_000 });
  /* One frame of the world has to exist before the take is worth keeping. */
  await page.waitForFunction(() => {
    const c = document.querySelector(".world-canvas canvas");
    return Boolean(c && c.width > 0);
  }, { timeout: 40_000 });
  const head = Math.max(0, (Date.now() - started) / 1000 - 0.4);

  /*
   * Beats are absolute offsets from the moment the world appears, not sleeps
   * between actions. Sleeps drifted: a click on a software-rendered canvas
   * takes anywhere from a tenth of a second to two, so a take built from fixed
   * waits ran 24s one time and 34s the next, and the thirty-second window
   * landed on a different part of the story each run. Waiting until a mark
   * means every beat is where the storyboard says and the take ends on time.
   */
  const at = async (second) => {
    const target = started + (head + second) * 1000;
    const left = target - Date.now();
    if (left > 0) await wait(left);
  };

  /* The thesis, which is the ground everything else stands on. */
  await at(2.6);
  await visit(page, 0);

  /* Out to BP-IT. */
  await at(5.6);
  await visit(page, 1);

  /* Across to the gateway. */
  await at(8.6);
  await visit(page, 3);

  /* Dark, without moving or reloading, so the change is the subject. */
  await at(11.2);
  await setTheme(page, "dark");

  await at(13.8);
  await visit(page, 5);

  /* The way out, and the classic view in dark. */
  await at(17.0);
  await page.click(".world-escape .world-cta");
  await page.waitForSelector(".classic h1", { timeout: 30_000 });
  await at(19.5);
  await page.mouse.wheel(0, 1400);
  await at(23.0);
  await page.mouse.wheel(0, 1600);

  /* The same page in light, which is how most readers see it. */
  await at(25.0);
  await setTheme(page, "light");
  await at(26.5);
  await page.mouse.wheel(0, -3000);
  await at(27.0);
  await page.mouse.wheel(0, 1800);

  /* Hold to the mark, so the file is the length it says it is. */
  /* Past the mark on purpose: the capture is shorter than the wall clock and
   * the shortfall varies, so the trim needs something to take thirty from. */
  await at(29.0);

  /* The wall-clock length of the session, which is what the video should be. */
  const sessionSeconds = (Date.now() - started) / 1000;

  await context.close();
  await browser.close();

  const raw = join(OUT, "raw");
  const file = readdirSync(raw).find((name) => name.endsWith(".webm"));
  if (!file) throw new Error("no video was recorded");
  const webm = join(OUT, "world-prototype.webm");
  renameSync(join(raw, file), webm);
  rmSync(raw, { force: true, recursive: true });

  if (existsSync(FFMPEG)) {
    const probe = FFMPEG.replace("ffmpeg.exe", "ffprobe.exe");
    const duration = (file) =>
      Number(
        execFileSync(probe, [
          "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file,
        ]).toString().trim(),
      );

    /*
     * Playwright timestamps the capture by frames rather than by the clock, and
     * a software rasteriser cannot feed it fast enough: a 34-second session came
     * out as a 74-second file playing at roughly half speed. Left alone, the
     * thirty seconds taken off the front were the first fifteen seconds of the
     * session stretched over thirty, which is why three takes in a row showed
     * the opening and none of the story.
     *
     * So the timebase is corrected against the clock first, and only then is the
     * window taken. The factor is measured per run, because the shortfall
     * depends on how busy the machine was.
     */
    const raw = duration(webm);
    const factor = sessionSeconds / raw;
    const paced = join(OUT, "paced.webm");
    rmSync(paced, { force: true });
    execFileSync(FFMPEG, [
      "-y", "-i", webm,
      "-vf", `setpts=${factor.toFixed(5)}*PTS`,
      "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "28", "-speed", "4",
      paced,
    ], { stdio: "ignore" });

    /*
     * Keep the end, not the beginning. A click on a software-rendered canvas
     * can overrun its mark by seconds, so the story sometimes runs past thirty;
     * when it does, the thing to lose is more of the opening overview, which is
     * one static shot, rather than the classic view in light, which is a whole
     * beat of the story and the last thing the take has to show.
     */
    const start = Math.max(head, sessionSeconds - LENGTH - 0.3);

    const mp4 = join(OUT, "world-prototype.mp4");
    rmSync(mp4, { force: true });
    /*
     * Topped and tailed to the thirty seconds asked for. The head is the page
     * load and the first WebGL frames, which film as an empty page. Everything
     * between is untouched and continuous, so this trims dead air rather than
     * editing the take.
     *
     * yuv420p and an even frame size, because anything else will not open in
     * QuickTime or in a LinkedIn preview.
     */
    execFileSync(FFMPEG, [
      "-y", "-ss", start.toFixed(2), "-i", paced, "-t", String(LENGTH),
      "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30",
      "-c:v", "libx264", "-preset", "slow", "-crf", "20",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart",
      mp4,
    ], { stdio: "ignore" });
    rmSync(paced, { force: true });

    const got = duration(mp4);
    console.log(
      `wrote ${mp4} (session ${sessionSeconds.toFixed(1)}s, capture ${raw.toFixed(1)}s, ` +
        `paced by ${factor.toFixed(2)}, from ${start.toFixed(1)}s, kept ${got.toFixed(1)}s)`,
    );
    if (got < LENGTH - 0.5) {
      console.log(`  short of ${LENGTH}s: only ${(sessionSeconds - head).toFixed(1)}s after the head`);
    }
  } else {
    console.log(`ffmpeg not found at ${FFMPEG}; left the webm only`);
  }
  console.log(`wrote ${webm}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
