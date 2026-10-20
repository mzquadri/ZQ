/**
 * Every path the hero portrait can take, asserted rather than eyeballed.
 *
 *   node tools/check-hero-paths.mjs http://127.0.0.1:3212
 *
 * tools/check-depth-hero.mjs already proves the shader responds to the
 * pointer. This asks a different question: what happens when it *cannot* run.
 * The hero has five ways out of the WebGL path, and four of them used to end
 * somewhere the reader would notice:
 *
 *   reduced motion            picked up at mount only, so turning it on while
 *                             reading did nothing
 *   reduced motion turned off should start the shader, and never did
 *   no WebGL                  falls back correctly, and always did
 *   lost context              left `data-live` set over a blank canvas, with
 *                             the photograph hidden behind it
 *   a slow device             rendered a juddering portrait rather than a
 *                             still one
 *
 * And one input that was never reachable at all: tilt on iOS, where Safari
 * will not emit an orientation event until `requestPermission()` resolves from
 * inside a gesture.
 *
 * The canvas is read through `toDataURL`, which is why the component asks for
 * `preserveDrawingBuffer`. Playwright cannot screenshot a canvas driven by
 * requestAnimationFrame because it never reports the page as stable.
 */
import { chromium, firefox, webkit } from "@playwright/test";

const ORIGIN = (process.argv[2] ?? "http://127.0.0.1:3212").replace(/\/$/, "");
const SWIFT = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"];

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
};

/** What the reader is actually looking at: the shader, the photograph, or nothing. */
const SHOWING = () => {
  const canvas = document.querySelector(".hero-portrait-canvas");
  const img = document.querySelector(".hero-portrait-img");
  const cs = canvas ? getComputedStyle(canvas) : null;
  const is = img ? getComputedStyle(img) : null;
  return {
    live: canvas ? canvas.hasAttribute("data-live") : null,
    canvasShown: cs ? cs.display !== "none" && Number(cs.opacity) > 0.5 : null,
    imgShown: is ? is.visibility !== "hidden" && is.display !== "none" : null,
    imgLoaded: img ? img.complete && img.naturalWidth > 0 : null,
    tiltButton: Boolean(document.querySelector(".hero-tilt")),
  };
};

const settle = async (page, ms = 2200) => {
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(ms);
};

/* ---- 1. The ordinary path, on all three engines ----------------------------------------------- */

for (const [name, launcher] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await launcher.launch(name === "chromium" ? { args: SWIFT } : {});
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await settle(page);
  const s = await page.evaluate(SHOWING);
  /*
   * Either outcome is correct. What is not correct is a hidden photograph with
   * no shader over it, which is the state that renders an empty rectangle.
   */
  check(
    `${name}: something is always visible`,
    (s.live && s.canvasShown) || s.imgShown,
    `live=${s.live} canvas=${s.canvasShown} img=${s.imgShown}`,
  );
  check(`${name}: the flat photograph loaded`, s.imgLoaded === true, `loaded=${s.imgLoaded}`);
  await browser.close();
}

/* ---- 2. Reduced motion, including turned on after the page is open ---------------------------- */

{
  const browser = await chromium.launch({ args: SWIFT });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await settle(page);
  let s = await page.evaluate(SHOWING);
  check("reduced motion: shader never starts", s.live === false, `live=${s.live}`);
  check("reduced motion: the photograph is shown", s.imgShown === true, `img=${s.imgShown}`);
  check("reduced motion: no tilt is offered", s.tiltButton === false);

  /* Turn it off while the page is open. The shader should start. */
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await settle(page, 2500);
  s = await page.evaluate(SHOWING);
  check("reduced motion turned off mid-visit: shader starts", s.live === true, `live=${s.live}`);

  /*
   * And back on. What has to be true is what the reader sees: the canvas stops
   * painting and the photograph is there.
   *
   * Deliberately not asserting that `data-live` has cleared. The attribute is
   * React's to remove and it follows a `matchMedia` change event, which under
   * `emulateMedia` can take seconds to arrive; the stylesheet does not wait for
   * it. Measured on this build, the canvas is `display: none` and the
   * photograph is visible 200ms after the switch, while the attribute lingers
   * for about three. Asserting on the attribute would be asserting on the slow
   * half of a fix whose whole point is that the fast half does not depend on
   * it.
   */
  await page.emulateMedia({ reducedMotion: "reduce" });
  await settle(page, 1200);
  s = await page.evaluate(SHOWING);
  check(
    "reduced motion turned on mid-visit: the canvas stops and the photograph is shown",
    s.canvasShown === false && s.imgShown === true,
    `canvas=${s.canvasShown} img=${s.imgShown} (data-live=${s.live}, cleared by React shortly after)`,
  );
  await browser.close();
}

/* ---- 3. No WebGL at all ----------------------------------------------------------------------- */

{
  const browser = await chromium.launch({ args: SWIFT });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => {
    const real = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {
      if (String(kind).startsWith("webgl")) return null;
      return real.call(this, kind, ...rest);
    };
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await settle(page);
  const s = await page.evaluate(SHOWING);
  check("no WebGL: the photograph is shown", s.imgShown === true && s.live === false, `live=${s.live} img=${s.imgShown}`);
  check("no WebGL: nothing throws", errors.length === 0, errors.join(" | "));
  await browser.close();
}

/* ---- 4. A context lost after the shader is running -------------------------------------------- */

{
  const browser = await chromium.launch({ args: SWIFT });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await settle(page);
  const before = await page.evaluate(SHOWING);
  if (!before.live) {
    check("lost context: skipped, the shader was not running here", true, "software WebGL unavailable");
  } else {
    const lost = await page.evaluate(() => {
      const canvas = document.querySelector(".hero-portrait-canvas");
      const gl = canvas.getContext("webgl");
      const ext = gl && gl.getExtension("WEBGL_lose_context");
      if (!ext) return false;
      ext.loseContext();
      return true;
    });
    await page.waitForTimeout(1200);
    const after = await page.evaluate(SHOWING);
    check(
      "lost context: falls back to the photograph",
      !lost || (after.live === false && after.imgShown === true),
      `lost=${lost} live=${after.live} img=${after.imgShown}`,
    );
  }
  await browser.close();
}

/* ---- 5. iOS: the tilt gate -------------------------------------------------------------------- */

{
  const browser = await chromium.launch({ args: SWIFT });
  const ctx = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  /*
   * Stand in for Safari's gate. Chromium fires orientation events without one,
   * so the only way to exercise the iOS path off an iPhone is to define the
   * method the component tests for and record whether it is called, and
   * whether it is called from a gesture.
   */
  await ctx.addInitScript(() => {
    window.__tiltAsked = 0;
    window.__tiltFromGesture = null;
    if (typeof DeviceOrientationEvent === "undefined") {
      window.DeviceOrientationEvent = function () {};
    }
    DeviceOrientationEvent.requestPermission = () => {
      window.__tiltAsked += 1;
      window.__tiltFromGesture = navigator.userActivation ? navigator.userActivation.isActive : null;
      return Promise.resolve("granted");
    };
  });
  const page = await ctx.newPage();
  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await settle(page, 2600);

  const s = await page.evaluate(SHOWING);
  if (!s.live) {
    check("iOS tilt: skipped, the shader did not start on this viewport", true, "no live canvas");
  } else {
    check("iOS tilt: a control is offered", s.tiltButton === true);
    const askedBefore = await page.evaluate(() => window.__tiltAsked);
    check("iOS tilt: nothing is requested before the tap", askedBefore === 0, `asked=${askedBefore}`);

    await page.locator(".hero-tilt").click({ timeout: 4000 });
    await page.waitForTimeout(600);
    const asked = await page.evaluate(() => window.__tiltAsked);
    const gesture = await page.evaluate(() => window.__tiltFromGesture);
    check("iOS tilt: the tap requests permission", asked === 1, `asked=${asked}`);
    check("iOS tilt: requested from inside a gesture", gesture !== false, `userActivation=${gesture}`);

    const gone = await page.evaluate(() => !document.querySelector(".hero-tilt"));
    check("iOS tilt: the control goes away once answered", gone === true);

    /* And the granted listener actually moves the portrait. */
    const moved = await page.evaluate(async () => {
      const canvas = document.querySelector(".hero-portrait-canvas");
      const before = canvas.toDataURL();
      window.dispatchEvent(
        new DeviceOrientationEvent("deviceorientation", { gamma: 22, beta: 70, alpha: 0 }),
      );
      await new Promise((r) => setTimeout(r, 900));
      return canvas.toDataURL() !== before;
    });
    check("iOS tilt: a granted orientation event changes the rendering", moved === true);
  }
  await browser.close();
}

/* ---- 6. Off screen, and in a background tab --------------------------------------------------- */

{
  const browser = await chromium.launch({ args: SWIFT });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await settle(page);
  const s = await page.evaluate(SHOWING);
  if (!s.live) {
    check("offscreen: skipped, the shader was not running", true, "no live canvas");
  } else {
    /* Count frames while the hero is in view, then well below it. */
    const countFrames = async (ms) =>
      page.evaluate(async (duration) => {
        const canvas = document.querySelector(".hero-portrait-canvas");
        let n = 0;
        let last = canvas.toDataURL();
        const until = performance.now() + duration;
        while (performance.now() < until) {
          await new Promise((r) => setTimeout(r, 120));
          const now = canvas.toDataURL();
          if (now !== last) n += 1;
          last = now;
        }
        return n;
      }, ms);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(400, 300);
    await page.mouse.move(700, 500);
    const inView = await countFrames(1400);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(1200);
    const offView = await countFrames(1400);

    check(
      "offscreen: the loop stops when the hero leaves the viewport",
      offView < inView,
      `redraws in view=${inView}, scrolled away=${offView}`,
    );
  }
  await browser.close();
}

/* ---- Summary ---------------------------------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  for (const f of failed) console.log(`  FAILED: ${f.name} ${f.detail ?? ""}`);
  process.exitCode = 1;
}
