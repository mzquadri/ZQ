/**
 * Record the hero's depth parallax and the About page's photo drift.
 *
 *   node tools/record-motion.mjs http://localhost:3242 tools/shots/recording
 *
 * Two clips, because the two effects are driven by different inputs and a
 * single pass would show neither properly:
 *
 *   hero    the pointer is moved around the portrait in a slow figure, so the
 *           parallax is driven the way a reader drives it.
 *   about   the page is scrolled at a readable pace, which is what the photo
 *           drift responds to.
 *
 * Playwright's own video recording is used rather than a frame-by-frame
 * screenshot loop. A canvas on requestAnimationFrame cannot be screenshotted
 * reliably (the element never reports "stable", and software WebGL is too slow
 * to complete a page screenshot), but video capture takes whatever the
 * compositor presents, which is exactly what a visitor sees.
 */
import { chromium } from "playwright";
import { mkdir, readdir, rename } from "node:fs/promises";
import { join } from "node:path";

const base = process.argv[2] ?? "http://localhost:3242";
const out = process.argv[3] ?? "tools/shots/recording";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

async function clip(name, run) {
  const dir = join(out, `_${name}`);
  await mkdir(dir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    /*
     * No explicit `size`. Giving one that does not match the viewport makes
     * Playwright letterbox the page inside the frame, and the first attempt
     * came out as the site in the top-left corner of a grey rectangle. Omitted,
     * the video is recorded at the viewport's own size.
     */
    recordVideo: { dir },
    reducedMotion: "no-preference",
  });
  const page = await ctx.newPage();
  await run(page);
  await ctx.close();

  // Playwright names the file after the page's guid; give it the clip's name.
  const files = (await readdir(dir)).filter((f) => f.endsWith(".webm"));
  if (files[0]) {
    await rename(join(dir, files[0]), join(out, `${name}.webm`));
    console.log(`  ${name}.webm`);
  } else {
    console.log(`  ${name}: no video produced`);
  }
}

await clip("hero", async (page) => {
  await page.goto(base + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  // Let the network draw itself in and the textures arrive.
  await page.waitForTimeout(3500);

  const box = await page.locator(".hero-portrait").boundingBox();
  if (!box) return;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  // A slow circuit around the portrait, in small steps so the easing shows.
  const points = 46;
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * Math.PI * 2;
    await page.mouse.move(cx + Math.cos(t) * box.width * 0.55, cy + Math.sin(t) * box.height * 0.3);
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(900);
});

await clip("about", async (page) => {
  await page.goto(base + "/about", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);

  // Scroll to the photographs, then past them, at a reading pace.
  await page.evaluate(() => {
    const el = document.querySelector(".photos-section");
    if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await page.waitForTimeout(700);

  for (let i = 0; i < 48; i++) {
    await page.mouse.wheel(0, 34);
    await page.waitForTimeout(55);
  }
  await page.waitForTimeout(600);
  for (let i = 0; i < 28; i++) {
    await page.mouse.wheel(0, -46);
    await page.waitForTimeout(55);
  }
  await page.waitForTimeout(800);
});

await browser.close();
