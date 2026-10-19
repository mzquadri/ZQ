/**
 * Does the depth hero actually run, and does it actually move?
 *
 *   node tools/check-depth-hero.mjs http://localhost:3240
 *
 * Three things a screenshot cannot tell you:
 *
 *   1. that WebGL initialised and the canvas is live rather than the flat
 *      photograph silently standing in for it;
 *   2. that moving the pointer changes the rendered pixels, which is the entire
 *      feature;
 *   3. that with reduced motion the canvas is gone and the flat photograph is
 *      the thing on screen.
 *
 * Headless Chromium needs a GPU path for WebGL, so this launches with SwiftShader
 * enabled. A machine without it would report no WebGL and the fallback would be
 * correct behaviour, not a failure, which is why that case is reported rather
 * than failed.
 */
import { chromium } from "playwright";
import { createHash } from "node:crypto";

const base = process.argv[2] ?? "http://localhost:3240";
const hash = (buf) => createHash("sha1").update(buf).digest("hex").slice(0, 12);

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

let failed = false;

// ---- 1. Motion ------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3000);

  const canvas = await page.$(".hero-portrait-canvas");
  if (!canvas) {
    console.log("  FAIL  no canvas in the markup");
    failed = true;
  } else {
    const live = await canvas.getAttribute("data-live");
    console.log(`  canvas live: ${live !== null ? "yes" : "no (flat photograph is showing)"}`);

    const dims = await page.evaluate(() => {
      const c = document.querySelector(".hero-portrait-canvas");
      return c ? { w: c.width, h: c.height } : null;
    });
    console.log(`  drawing buffer: ${dims?.w} x ${dims?.h}`);

    if (live !== null) {
      /*
       * Clipped page screenshots, not element screenshots.
       *
       * `elementHandle.screenshot()` waits for the element to be "stable" and a
       * canvas driven by requestAnimationFrame never satisfies that, so it
       * times out on a hero that is working correctly. A clip rectangle over
       * the same box captures the same pixels without the wait.
       */
      /*
       * Read the canvas from inside the page, not with a screenshot.
       *
       * Software WebGL is slow enough that `page.screenshot` times out on a
       * hero that is working correctly, and an element screenshot additionally
       * waits for the element to be "stable", which a canvas on
       * requestAnimationFrame never is. `toDataURL` reads the presented frame
       * directly, which is what `preserveDrawingBuffer` on the context is for.
       */
      const box = await canvas.boundingBox();
      const shoot = async () =>
        hash(await page.evaluate(() =>
          document.querySelector(".hero-portrait-canvas").toDataURL("image/png"),
        ));

      await page.mouse.move(box.x + box.width * 0.1, box.y + box.height * 0.3);
      await page.waitForTimeout(1400);
      const a = await shoot();
      await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.7);
      await page.waitForTimeout(1400);
      const b = await shoot();
      await page.mouse.move(box.x + box.width * 0.1, box.y + box.height * 0.3);
      await page.waitForTimeout(1400);
      const c = await shoot();

      console.log(`  frames at left / right / left again: ${a} ${b} ${c}`);
      if (a === b) {
        console.log("  FAIL  the pointer does not change the rendering");
        failed = true;
      } else {
        console.log("  PASS  the pointer moves the portrait");
      }
      if (a !== b && b !== c && a !== c) {
        console.log("  note  returning left did not reproduce the first frame exactly, which is");
        console.log("        expected: the easing had not fully settled in 1.4s");
      }
    }
  }
  await ctx.close();
}

// ---- 2. Reduced motion ----------------------------------------------------
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(2500);

  const state = await page.evaluate(() => {
    const c = document.querySelector(".hero-portrait-canvas");
    const img = document.querySelector(".hero-portrait-img");
    return {
      canvasDisplay: c ? getComputedStyle(c).display : "absent",
      canvasLive: c ? c.hasAttribute("data-live") : false,
      imgVisible: img ? getComputedStyle(img).visibility : "absent",
      imgWidth: img ? img.getBoundingClientRect().width : 0,
    };
  });
  console.log(`\n  reduced motion: canvas display=${state.canvasDisplay} live=${state.canvasLive}`);
  console.log(`                  photograph visibility=${state.imgVisible} width=${Math.round(state.imgWidth)}`);
  if (state.canvasDisplay !== "none" || state.canvasLive) {
    console.log("  FAIL  the canvas is still active under reduced motion");
    failed = true;
  } else if (state.imgVisible !== "visible" || state.imgWidth < 50) {
    console.log("  FAIL  the flat photograph is not visible under reduced motion");
    failed = true;
  } else {
    console.log("  PASS  reduced motion shows the flat photograph and no canvas");
  }
  await ctx.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
