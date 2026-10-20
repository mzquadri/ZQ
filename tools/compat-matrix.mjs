/**
 * The cross-browser, cross-device, cross-setting sweep.
 *
 *   node tools/compat-matrix.mjs http://127.0.0.1:3210 [--shots DIR] [--engines chromium,firefox,webkit]
 *
 * Why this exists alongside tools/audit-site.mjs: that one reports taste
 * findings (small text, long lines) on Chromium at three widths. This one
 * answers a different question, which is whether the page is *broken* on a
 * given engine at a given size under a given system setting. The two kinds of
 * finding want different thresholds and a different matrix, and mixing them
 * made the advisory noise bury the defects.
 *
 * What it checks, per (engine, viewport, route):
 *
 *   overflow      the document scrolling sideways, and which element causes it
 *   clipped       text boxes whose content is taller than the box that hides it
 *   offscreen     interactive elements sitting outside the viewport box
 *   overlap       two interactive elements covering each other
 *   tap           touch targets under 24px (WCAG 2.2 AA) on a touch viewport
 *   images        anything that failed to load or decoded to nothing
 *   fonts         the two self-hosted faces actually being used
 *   console       page errors and failed requests
 *   menu          the navigation reaching every link at that width
 *   theme         the theme control flipping the document and surviving reload
 *
 * Engines differ in what Playwright will emulate. Firefox has no `isMobile`,
 * and `forcedColors` is Chromium and Firefox only. Each is probed rather than
 * assumed, so an unsupported combination is skipped with a reason rather than
 * failing the run.
 */
import { chromium, firefox, webkit } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";

const ORIGIN = (process.argv[2] ?? "http://127.0.0.1:3210").replace(/\/$/, "");
const argv = process.argv.slice(3);
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const SHOTS = flag("shots", null);
const ONLY_ENGINES = flag("engines", "chromium,firefox,webkit").split(",");
const ONLY_ROUTES = flag("routes", null);
const SETTINGS_ONLY = argv.includes("--settings-only");
const QUICK = argv.includes("--quick");
/*
 * Capture only. The menu and theme checks open, close and reopen a sheet and
 * reload the page, which is most of the run time and all of it wasted when the
 * job is to photograph every route on every device.
 */
const SHOTS_ONLY = argv.includes("--shots-only");

/* ---- The matrix ------------------------------------------------------------------------------ */

/*
 * Real CSS viewport sizes, not marketing numbers. An iPhone 15 is 393 CSS px
 * wide, not 1179; using the hardware pixel count is the single most common way
 * a matrix like this ends up testing sizes nobody owns.
 */
const DEVICES = [
  { id: "iphone-se", label: "iPhone SE", width: 375, height: 667, dpr: 2, touch: true },
  { id: "iphone-se-land", label: "iPhone SE landscape", width: 667, height: 375, dpr: 2, touch: true },
  { id: "iphone-15", label: "iPhone 15", width: 393, height: 852, dpr: 3, touch: true },
  { id: "iphone-15-land", label: "iPhone 15 landscape", width: 852, height: 393, dpr: 3, touch: true },
  { id: "iphone-15-pro-max", label: "iPhone 15 Pro Max", width: 430, height: 932, dpr: 3, touch: true },
  { id: "iphone-15-pro-max-land", label: "iPhone 15 Pro Max landscape", width: 932, height: 430, dpr: 3, touch: true },
  { id: "galaxy-s23", label: "Galaxy S23", width: 360, height: 780, dpr: 3, touch: true },
  { id: "pixel-7", label: "Pixel 7", width: 412, height: 915, dpr: 2.625, touch: true },
  { id: "pixel-7-land", label: "Pixel 7 landscape", width: 915, height: 412, dpr: 2.625, touch: true },
  { id: "ipad", label: "iPad portrait", width: 768, height: 1024, dpr: 2, touch: true },
  { id: "ipad-land", label: "iPad landscape", width: 1024, height: 768, dpr: 2, touch: true },
  { id: "ipad-pro", label: "iPad Pro portrait", width: 1024, height: 1366, dpr: 2, touch: true },
  { id: "ipad-pro-land", label: "iPad Pro landscape", width: 1366, height: 1024, dpr: 2, touch: true },
  { id: "laptop-1366", label: "Laptop 1366", width: 1366, height: 768, dpr: 1, touch: false },
  { id: "laptop-1440", label: "Laptop 1440", width: 1440, height: 900, dpr: 1, touch: false },
  { id: "desktop-1920", label: "Desktop 1920", width: 1920, height: 1080, dpr: 1, touch: false },
  { id: "desktop-2560", label: "Desktop 2560", width: 2560, height: 1440, dpr: 1, touch: false },
  { id: "desktop-4k", label: "Desktop 4K", width: 3840, height: 2160, dpr: 1, touch: false },
];

/*
 * System settings. `base` is the control. The zoom rows are real viewport
 * reductions rather than a transform, because browser zoom *is* a smaller CSS
 * viewport, and the text row raises the root font size, which is what a larger
 * default text setting does to a stylesheet written in rem.
 */
const SETTINGS = [
  { id: "light", colorScheme: "light" },
  { id: "dark", colorScheme: "dark" },
  { id: "reduced-motion", colorScheme: "light", reducedMotion: "reduce" },
  { id: "forced-colors", colorScheme: "light", forcedColors: "active" },
  /* A 1366 laptop at 200% browser zoom is a 683px CSS viewport. */
  { id: "zoom-200", colorScheme: "light", viewport: { width: 683, height: 384 }, dpr: 2 },
  /* A 1440 laptop at 200%. */
  { id: "zoom-200-wide", colorScheme: "light", viewport: { width: 720, height: 450 }, dpr: 2 },
  /* Larger default text: 24px root instead of 16px. */
  { id: "large-text", colorScheme: "light", rootFontSize: "150%" },
];

/*
 * One route per distinct template, plus the 404. The thirteen writing pieces,
 * the seven registry case studies and the eleven taxonomy pages share three
 * templates between them; sweeping all of them on every engine at every size
 * would multiply the run by four and find the same stylesheet bug repeatedly.
 * `--all-routes` sweeps the lot, which is what the screenshot pass uses.
 *
 * `/drive` is absent on purpose: it is a permanent redirect to /work and has no
 * rendering of its own.
 */
const MATRIX_ROUTES = [
  "/",
  "/work",
  "/work/transport-uq",
  "/work/mcp-policy-gateway",
  "/work/medico",
  "/work/engineering-model",
  "/work/reliable-knowledge-systems",
  "/work/repositories",
  "/research",
  "/research/thesis",
  "/experience",
  "/certificates",
  "/learn",
  "/learn/all",
  "/learn/calibration-is-not-classification-accuracy",
  "/learn/topic/uncertainty-quantification",
  "/learn/level/advanced",
  "/about",
  "/contact",
  "/datenschutz",
  "/architecture",
  "/this-route-does-not-exist",
];

/* Every rendering page on the site. Four of these are in no sitemap; see the report. */
const ALL_ROUTES = [
  "/", "/work", "/research", "/research/thesis", "/experience", "/certificates",
  "/learn", "/learn/all", "/about", "/contact", "/datenschutz", "/architecture",
  "/work/cifar10-cnn", "/work/engineering-model", "/work/hydrology-uq",
  "/work/insureassist-rag", "/work/mcp-policy-gateway", "/work/medico",
  "/work/mlops-reference-pipeline", "/work/reliable-knowledge-systems",
  "/work/repositories", "/work/streamflow-forecasting", "/work/transport-uq",
  "/learn/building-an-independent-verification-oracle",
  "/learn/calibration-is-not-classification-accuracy",
  "/learn/designing-replay-as-a-normal-path",
  "/learn/equal-counts-do-not-prove-two-stores-agree",
  "/learn/evidence-provenance-for-knowledge-systems",
  "/learn/hybrid-retrieval-without-silent-failure",
  "/learn/idempotent-ingestion-across-heterogeneous-stores",
  "/learn/promotion-gates-for-model-release",
  "/learn/refusal-paths-in-production-ai-systems",
  "/learn/reingest-verify-reconcile-withdraw",
  "/learn/selective-prediction-when-models-should-abstain",
  "/learn/template-driven-document-extraction",
  "/learn/what-a-saliency-map-does-not-prove",
  "/learn/level/foundations", "/learn/level/applied", "/learn/level/advanced",
  "/learn/topic/distributed-systems", "/learn/topic/document-intelligence",
  "/learn/topic/explainable-ai", "/learn/topic/machine-learning",
  "/learn/topic/mlops", "/learn/topic/reliable-ai-systems",
  "/learn/topic/retrieval-and-grounded-generation",
  "/learn/topic/uncertainty-quantification",
  "/this-route-does-not-exist",
];

const ENGINES = { chromium, firefox, webkit };
/*
 * Software WebGL. Without these the hero takes the no-WebGL path on a headless
 * Chromium, which would make every run report the fallback as the only
 * behaviour and prove nothing about the shader.
 */
const CHROMIUM_ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"];

/* ---- Findings --------------------------------------------------------------------------------- */

const findings = [];
const add = (f) => findings.push(f);

/*
 * Playwright throws an internal assertion out of a CDP message callback under
 * this much concurrency. It surfaces as an uncaught exception on the immediate
 * queue, so no try/catch around the call site can see it, and the default
 * handler takes the whole sweep down with it. The connection it came from is
 * finished either way; the worker that owned it will fail its next call, catch
 * that normally, and relaunch. Counting them keeps the harness honest about
 * how often it happened rather than hiding it.
 */
let harnessCrashes = 0;
const survive = (what) => (error) => {
  harnessCrashes += 1;
  const line = String(error?.message ?? error).split("\n")[0];
  process.stderr.write(`\n[harness ${what}] ${line}\n`);
};
process.on("uncaughtException", survive("uncaughtException"));
process.on("unhandledRejection", survive("unhandledRejection"));

/* ---- The in-page probe ------------------------------------------------------------------------ */

/*
 * One evaluate, returning data rather than verdicts. Judging happens in Node so
 * the thresholds live in one readable place and so a finding can name the
 * engine and setting it came from, which the page has no way to know.
 */
const PROBE = () => {
  const vw = window.innerWidth;
  const de = document.documentElement;
  const describe = (el) => {
    if (!el) return "?";
    const cls = typeof el.className === "string" && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}` : "";
    const id = el.id ? `#${el.id}` : "";
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  };

  /* --- sideways scroll, and what sticks out --- */
  const docOverflow = Math.max(0, de.scrollWidth - vw);
  const stickOut = [];
  if (docOverflow > 1) {
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      /* A fixed element wider than the viewport does not scroll the document. */
      if (cs.position === "fixed") continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const over = Math.round(r.right - vw);
      if (over > 2 || r.left < -2) {
        /* Report the outermost offender only; a child inherits its parent's sin. */
        if (!stickOut.some((s) => s.el.contains(el))) stickOut.push({ el, over: Math.max(over, Math.round(-r.left)) });
      }
    }
  }

  /*
   * Something that is deliberately clipped to nothing so a screen reader can
   * still read it. The first run of this reported 2,266 clipped boxes and
   * every one of them was this utility: a 1px box with `overflow: hidden`
   * holding a sentence is the definition of the pattern, not a defect.
   */
  const srOnly = (el, cs) =>
    el.classList.contains("visually-hidden") ||
    el.classList.contains("sr-only") ||
    (cs.clip !== "auto" && cs.position === "absolute") ||
    (cs.clipPath === "inset(50%)") ||
    (el.clientWidth <= 1 && el.clientHeight <= 1);

  /* --- text clipped by a box that hides its overflow --- */
  const clipped = [];
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    if (srOnly(el, cs)) continue;
    const hidesY = cs.overflowY === "hidden" || cs.overflow === "hidden";
    const hidesX = cs.overflowX === "hidden" || cs.overflow === "hidden";
    if (!hidesY && !hidesX) continue;
    /* Only boxes whose own text is the thing being cut, not scroll containers. */
    const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 2);
    if (!hasText) continue;
    const dy = el.scrollHeight - el.clientHeight;
    const dx = el.scrollWidth - el.clientWidth;
    /*
     * 4px of slack. Sub-pixel line-box rounding routinely reports 1 to 3px of
     * phantom overflow on a box that is visually fine, and an ellipsis is a
     * deliberate clip rather than a defect.
     */
    const ellipsis = cs.textOverflow === "ellipsis";
    if (hidesY && dy > 4) clipped.push({ el, axis: "y", by: dy });
    else if (hidesX && dx > 4 && !ellipsis) clipped.push({ el, axis: "x", by: dx });
  }

  /* --- interactive elements: geometry, reachability, overlap --- */
  const SEL = "a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex='-1'])";
  const interactive = [];
  for (const el of document.querySelectorAll(SEL)) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    if (el.closest("[inert]") || el.closest("[hidden]")) continue;
    if (el.hasAttribute("disabled")) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    /* Skip anything deliberately parked off-screen, which is how a skip link hides. */
    const parked = cs.transform !== "none" && Math.abs(r.top) > window.innerHeight * 2;
    /*
     * WCAG 2.2 SC 2.5.8 exempts a target that sits "in a sentence or its size
     * is otherwise constrained by the line-height of non-target text". A link
     * inside a paragraph of prose cannot be given a 24px box without breaking
     * the line it is set in, and the rule says so. A link that is the whole of
     * its container is a control, not a word, and gets no exemption. The test
     * for the difference is whether the parent holds any text that is not this
     * link.
     */
    const parent = el.parentElement;
    const siblingText = parent
      ? Array.from(parent.childNodes).some(
          (n) => n.nodeType === 3 && n.textContent.trim().length > 1,
        )
      : false;
    const inSentence = cs.display.startsWith("inline") && siblingText;

    interactive.push({
      el,
      name: describe(el),
      text: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40),
      w: Math.round(r.width),
      h: Math.round(r.height),
      left: Math.round(r.left),
      right: Math.round(r.right),
      top: Math.round(r.top),
      parked,
      inSentence,
      opacity: Number(cs.opacity),
    });
  }

  /* Sideways-unreachable controls: outside the horizontal viewport box. */
  const offscreenX = interactive.filter((i) => !i.parked && (i.right < -2 || i.left > vw + 2));

  /* Overlap between two visible controls, which is a mis-stacked layout. */
  const overlaps = [];
  for (let i = 0; i < interactive.length; i += 1) {
    for (let j = i + 1; j < interactive.length; j += 1) {
      const a = interactive[i];
      const b = interactive[j];
      if (a.parked || b.parked || a.opacity < 0.1 || b.opacity < 0.1) continue;
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      /*
       * Line boxes, not bounding boxes.
       *
       * `getBoundingClientRect` on an inline element that wraps returns the
       * union of its lines, so two links on adjacent lines of a paragraph
       * report a large overlap while nothing a finger could hit overlaps at
       * all. `getClientRects` gives one rect per line, which is what is
       * actually clickable. This was the whole of the "a over a" finding on a
       * landscape phone, on all three engines, in an article whose links were
       * simply long enough to wrap.
       */
      let worst = 0;
      let smallest = Infinity;
      for (const ar of a.el.getClientRects()) {
        for (const br of b.el.getClientRects()) {
          const ox = Math.min(ar.right, br.right) - Math.max(ar.left, br.left);
          const oy = Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top);
          if (ox <= 4 || oy <= 4) continue;
          worst = Math.max(worst, ox * oy);
          smallest = Math.min(smallest, ar.width * ar.height, br.width * br.height);
        }
      }
      /* Report only a substantial overlap; a 5px kiss is a border radius. */
      if (worst > 0 && smallest > 0 && worst / smallest > 0.35) {
        overlaps.push({ a: a.name, b: b.name, area: Math.round(worst) });
      }
    }
  }

  /*
   * --- images ---
   *
   * `complete && naturalWidth === 0` is the test for a broken image, and
   * `!complete` is not. A lazy image below the fold has not started loading,
   * so it reports incomplete with no natural size and looks identical to a 404
   * from the outside; the first run of this called all eight About page
   * photographs broken when every one of them serves 200. `complete` goes true
   * on success *and* on failure, so pairing it with a zero natural width is
   * what actually separates the two.
   */
  const images = [];
  for (const img of document.querySelectorAll("img")) {
    const r = img.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    images.push({
      src: img.currentSrc || img.src,
      broken: img.complete && img.naturalWidth === 0,
      lazyPending: !img.complete,
      alt: img.getAttribute("alt"),
      box: Math.round(r.width),
    });
  }

  /* --- fonts --- */
  const body = getComputedStyle(document.body).fontFamily;
  const fonts = {
    family: body,
    archivoUsed: document.fonts.check("1rem Archivo") || /Archivo/i.test(body),
    /* The real question is whether the variable resolved at all. */
    sansVar: getComputedStyle(de).getPropertyValue("--sans").trim(),
    monoVar: getComputedStyle(de).getPropertyValue("--mono").trim(),
    loaded: Array.from(document.fonts).filter((f) => f.status === "loaded").map((f) => f.family),
  };

  /* --- the navigation at this width --- */
  const railNav = document.querySelector(".rail-nav");
  const toggle = document.querySelector(".rail-toggle");
  const nav = {
    railNavShown: railNav ? getComputedStyle(railNav).display !== "none" : false,
    railNavLinks: railNav ? railNav.querySelectorAll("a").length : 0,
    toggleShown: toggle ? getComputedStyle(toggle).display !== "none" : false,
    themeButtons: Array.from(document.querySelectorAll(".theme-button")).filter((b) => {
      const cs = getComputedStyle(b);
      return cs.display !== "none" && cs.visibility !== "hidden" && !b.closest("[inert]");
    }).length,
  };

  /* --- the hero, on the home page only --- */
  const canvas = document.querySelector(".hero-portrait-canvas");
  const heroImg = document.querySelector(".hero-portrait-img");
  const hero = canvas
    ? {
        live: canvas.hasAttribute("data-live"),
        canvasW: canvas.width,
        canvasH: canvas.height,
        imgVisible: heroImg ? getComputedStyle(heroImg).opacity !== "0" : null,
        imgComplete: heroImg ? heroImg.complete && heroImg.naturalWidth > 0 : null,
      }
    : null;

  /* --- safe-area wiring --- */
  const viewportMeta = document.querySelector('meta[name="viewport"]')?.getAttribute("content") ?? null;

  return {
    vw,
    docOverflow,
    scrollHeight: de.scrollHeight,
    stickOut: stickOut.slice(0, 8).map((s) => ({ name: describe(s.el), over: s.over })),
    clipped: clipped.slice(0, 8).map((c) => ({ name: describe(c.el), axis: c.axis, by: c.by, text: (c.el.textContent || "").trim().slice(0, 50) })),
    offscreenX: offscreenX.slice(0, 8).map((i) => ({ name: i.name, text: i.text, left: i.left, right: i.right })),
    overlaps: overlaps.slice(0, 8),
    /*
     * SC 2.5.8 in full, including the spacing exception, which is the half
     * everyone leaves out and the half that decides most real cases.
     *
     * The rule is not "every target is 24 by 24". An undersized target passes
     * if a 24px circle centred on it does not reach another target. A column
     * of card titles set 19px tall with 40px between them is conforming; the
     * same titles packed into a list are not. Reporting on height alone turned
     * 2,000 perfectly reachable links into findings and buried the handful of
     * controls that genuinely sit too close together.
     */
    tiny: (() => {
      const live = interactive.filter((i) => !i.parked && i.opacity > 0.1);
      const undersized = live.filter((i) => !i.inSentence && (i.w < 24 || i.h < 24));
      const out = [];
      for (const target of undersized) {
        const cx = target.left + target.w / 2;
        const cy = target.top + target.h / 2;
        let crowdedBy = null;
        for (const other of live) {
          if (other === target) continue;
          if (other.el.contains(target.el) || target.el.contains(other.el)) continue;
          /* Distance from this target's centre to the other target's box. */
          const dx = Math.max(other.left - cx, 0, cx - other.right);
          const dy = Math.max(other.top - cy, 0, cy - (other.top + other.h));
          if (Math.hypot(dx, dy) < 12) {
            crowdedBy = other.text || other.name;
            break;
          }
        }
        if (crowdedBy) out.push({ name: target.name, text: target.text, w: target.w, h: target.h, crowdedBy });
      }
      return out.slice(0, 10);
    })(),
    images,
    fonts,
    nav,
    hero,
    viewportMeta,
    title: document.title,
    h1: document.querySelectorAll("h1").length,
  };
};

/* ---- Running one cell ------------------------------------------------------------------------- */

async function runCell({ engineName, browser, device, setting, routes, shotDir }) {
  const supportsIsMobile = engineName !== "firefox";
  const supportsForced = engineName !== "webkit";

  if (setting.forcedColors && !supportsForced) {
    add({ kind: "skipped", engine: engineName, device: device.id, setting: setting.id, detail: "forcedColors not emulable on WebKit" });
    return;
  }

  const viewport = setting.viewport ?? { width: device.width, height: device.height };
  const ctxOpts = {
    viewport,
    deviceScaleFactor: setting.dpr ?? device.dpr,
    hasTouch: device.touch,
    colorScheme: setting.colorScheme ?? "light",
    reducedMotion: setting.reducedMotion ?? "no-preference",
  };
  if (setting.forcedColors) ctxOpts.forcedColors = "active";
  if (device.touch && supportsIsMobile) ctxOpts.isMobile = true;
  /* A real UA string matters for nothing here, but a mobile one is what a server sees. */

  let ctx;
  try {
    ctx = await browser.newContext(ctxOpts);
  } catch (error) {
    add({ kind: "skipped", engine: engineName, device: device.id, setting: setting.id, detail: `context: ${error.message.split("\n")[0]}` });
    return;
  }

  if (setting.rootFontSize) {
    await ctx.addInitScript((size) => {
      document.addEventListener("DOMContentLoaded", () => {
        document.documentElement.style.fontSize = size;
      });
      /* Also before DCL, so the first layout is already at the larger size. */
      if (document.documentElement) document.documentElement.style.fontSize = size;
    }, setting.rootFontSize);
  }

  /*
   * A light or dark cell sweeps every route, because a layout bug belongs to a
   * page. The other settings sweep six, because reduced motion, forced colours,
   * zoom and a larger root font are stylesheet-wide conditions: if they break a
   * grid they break it on the page that uses that grid, and these six between
   * them use every layout the site has. Sweeping all twenty-two under all seven
   * settings is four times the run for the same findings.
   */
  const SETTING_SAMPLE = ["/", "/work", "/research/thesis", "/experience", "/learn", "/contact"];
  const cellRoutes =
    SHOTS_ONLY || setting.id === "light" || setting.id === "dark"
      ? routes
      : routes.filter((r) => SETTING_SAMPLE.includes(r));

  for (const route of cellRoutes) {
    const page = await ctx.newPage();
    const errors = [];
    const failed = [];
    page.on("pageerror", (e) => errors.push(String(e.message ?? e).split("\n")[0]));
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      /* The 404 route is *supposed* to answer 404, and the browser says so. */
      if (route.includes("does-not-exist") && /404|Failed to load resource/i.test(m.text())) return;
      errors.push(`console: ${m.text().slice(0, 160)}`);
    });
    page.on("requestfailed", (r) => {
      const why = r.failure()?.errorText ?? "";
      /* An aborted prefetch is not a failure a reader sees. */
      if (/ABORTED|ERR_ABORTED/i.test(why)) return;
      failed.push(`${r.url().replace(ORIGIN, "")} ${why}`);
    });
    page.on("response", (r) => {
      if (r.status() >= 400 && !route.includes("does-not-exist")) failed.push(`${r.status()} ${r.url().replace(ORIGIN, "")}`);
    });

    const where = { engine: engineName, device: device.id, setting: setting.id, route };

    /*
     * Click a control until the page agrees something changed, or give up.
     * Returns the number of attempts it took, or 0 for never. One attempt is
     * the interesting answer; anything above one means hydration was still in
     * flight, which is a property of the harness and not of the site.
     */
    const pressUntil = async (selector, read, tries = 8) => {
      const before = await page.evaluate(read);
      for (let i = 1; i <= tries; i += 1) {
        try {
          await page.locator(selector).first().click({ timeout: 3000 });
        } catch {
          await page.waitForTimeout(250);
          continue;
        }
        await page.waitForTimeout(180);
        if ((await page.evaluate(read)) !== before) return i;
        await page.waitForTimeout(250);
      }
      return 0;
    };

    try {
      /*
       * `load`, not `domcontentloaded`. The first version of this waited for DCL
       * and a fixed delay, then clicked the menu and the theme control, and
       * reported both as broken on about a third of the cells. They were not
       * broken: the click was landing before React had hydrated, so no handler
       * existed yet. Anything that asserts on an interaction has to wait for the
       * thing to be interactive, and `pressUntil` below retries rather than
       * trusting one delay to be long enough on a 4K viewport under software
       * WebGL.
       */
      const res = await page.goto(ORIGIN + route, { waitUntil: "load", timeout: 45000 });
      if (route.includes("does-not-exist")) {
        if (res && res.status() !== 404) add({ kind: "status", ...where, detail: `404 route answered ${res.status()}` });
      } else if (res && res.status() >= 400) {
        add({ kind: "status", ...where, detail: `HTTP ${res.status()}` });
      }
      await page.evaluate(() => document.fonts.ready).catch(() => {});
      await page.waitForTimeout(QUICK ? 350 : 900);

      const probe = await page.evaluate(PROBE);

      /* --- judge --- */
      if (probe.docOverflow > 1) {
        add({ kind: "overflow", ...where, detail: `document scrolls ${probe.docOverflow}px sideways`, who: probe.stickOut.map((s) => `${s.name} +${s.over}`).join(", ") });
      }
      for (const c of probe.clipped) {
        add({ kind: "clipped", ...where, detail: `${c.name} cuts ${c.by}px on ${c.axis}`, who: c.text });
      }
      for (const o of probe.offscreenX) {
        add({ kind: "offscreen", ...where, detail: `${o.name} "${o.text}" at x ${o.left}..${o.right}` });
      }
      for (const o of probe.overlaps) {
        add({ kind: "overlap", ...where, detail: `${o.a} over ${o.b} (${o.area}px2)` });
      }
      for (const t of probe.tiny) {
        add({
          kind: "tap",
          ...where,
          detail: `${t.name} "${t.text}" is ${t.w}x${t.h} and sits within 24px of "${t.crowdedBy}"`,
        });
      }
      for (const img of probe.images) {
        if (img.broken) add({ kind: "image", ...where, detail: `did not load: ${img.src.replace(ORIGIN, "")}` });
        if (img.alt === null) add({ kind: "a11y", ...where, detail: `img without alt attribute: ${img.src.replace(ORIGIN, "")}` });
      }
      if (!probe.fonts.sansVar) add({ kind: "font", ...where, detail: "--sans resolved empty" });
      if (!probe.fonts.monoVar) add({ kind: "font", ...where, detail: "--mono resolved empty" });
      if (!/Archivo/i.test(probe.fonts.family)) {
        add({ kind: "font", ...where, detail: `body font-family is "${probe.fonts.family.slice(0, 60)}"` });
      }
      if (probe.h1 !== 1) add({ kind: "a11y", ...where, detail: `${probe.h1} h1 elements` });
      if (probe.nav.themeButtons !== 1) {
        add({ kind: "nav", ...where, detail: `${probe.nav.themeButtons} visible theme buttons` });
      }
      if (!probe.nav.railNavShown && !probe.nav.toggleShown) {
        add({ kind: "nav", ...where, detail: "neither the link bar nor the menu button is visible" });
      }
      if (probe.nav.railNavShown && probe.nav.toggleShown) {
        add({ kind: "nav", ...where, detail: "link bar and menu button both visible" });
      }
      if (probe.viewportMeta && !/viewport-fit=cover/.test(probe.viewportMeta)) {
        add({ kind: "safe-area", ...where, detail: `viewport meta lacks viewport-fit=cover: "${probe.viewportMeta}"`, once: "viewport-fit" });
      }
      if (probe.viewportMeta && /(maximum-scale|user-scalable\s*=\s*no)/.test(probe.viewportMeta)) {
        add({ kind: "a11y", ...where, detail: `viewport meta blocks zoom: "${probe.viewportMeta}"`, once: "zoom-block" });
      }
      if (route === "/" && probe.hero) {
        if (!probe.hero.imgComplete) add({ kind: "hero", ...where, detail: "flat fallback photograph did not load" });
        if (!probe.hero.live && !probe.hero.imgVisible) add({ kind: "hero", ...where, detail: "shader inactive and flat photograph hidden: nothing is shown" });
        if (setting.reducedMotion === "reduce" && probe.hero.live) add({ kind: "hero", ...where, detail: "shader running under reduced motion" });
      }

      /* --- the menu, where the button is the navigation --- */
      const SHEET_SHOWN = () => {
        const s = document.querySelector(".rail-sheet");
        return s ? getComputedStyle(s).display !== "none" : null;
      };

      /*
       * The rail is the same markup on every route, so opening and closing it
       * on all twenty-two multiplies the run without adding a finding. Three is
       * enough to catch a page whose own content fights it.
       */
      const MENU_ROUTES = new Set([cellRoutes[0], cellRoutes[1], cellRoutes[Math.floor(cellRoutes.length / 2)]]);
      if (!SHOTS_ONLY && probe.nav.toggleShown && MENU_ROUTES.has(route)) {
        try {
          const opened = await pressUntil(".rail-toggle", SHEET_SHOWN);
          if (!opened) add({ kind: "menu", ...where, detail: "menu button never opened the sheet" });
          const sheet = await page.evaluate(() => {
            const s = document.querySelector(".rail-sheet");
            if (!s) return null;
            const cs = getComputedStyle(s);
            const r = s.getBoundingClientRect();
            const links = Array.from(s.querySelectorAll("a"));
            return {
              shown: cs.display !== "none" && cs.visibility !== "hidden",
              role: s.getAttribute("role"),
              modal: s.getAttribute("aria-modal"),
              top: Math.round(r.top),
              bottom: Math.round(r.bottom),
              viewportH: window.innerHeight,
              overflows: s.scrollHeight - s.clientHeight,
              linkCount: links.length,
              offBottom: links.filter((a) => a.getBoundingClientRect().bottom > window.innerHeight + 2).length,
              themeInSheet: s.querySelectorAll(".theme-button").length,
              /* Can the keyboard leave the sheet into the covered page? */
              outsideFocusable: Array.from(
                document.querySelectorAll("a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])"),
              ).filter((el) => {
                if (s.contains(el)) return false;
                if (el.closest("[inert]") || el.closest("[hidden]")) return false;
                if (el.closest(".rail-inner")) return false;
                const cs2 = getComputedStyle(el);
                if (cs2.display === "none" || cs2.visibility === "hidden") return false;
                return true;
              }).length,
            };
          });
          if (!sheet) {
            add({ kind: "menu", ...where, detail: "no .rail-sheet in the document" });
          } else {
            if (sheet.shown) {
              if (sheet.top > 2 && sheet.overflows > 2) {
                add({ kind: "menu", ...where, detail: `sheet content overflows by ${sheet.overflows}px` });
              }
              if (sheet.offBottom > 0) {
                add({ kind: "menu", ...where, detail: `${sheet.offBottom} of ${sheet.linkCount} sheet links sit below the viewport` });
              }
              if (sheet.themeInSheet > 0 && probe.nav.themeButtons >= 1) {
                add({ kind: "menu", ...where, detail: `${sheet.themeInSheet} extra theme button inside the open sheet` });
              }
              if (!sheet.role) add({ kind: "menu", ...where, detail: "open sheet has no role; it is a div to a screen reader", once: "sheet-role" });
              if (sheet.outsideFocusable > 0) {
                add({ kind: "menu", ...where, detail: `${sheet.outsideFocusable} focusable elements behind the open sheet are still in the tab order`, once: "sheet-trap" });
              }
            }
            /* Escape, then the button again: a menu has to close and reopen. */
            if (sheet.shown) {
              await page.keyboard.press("Escape");
              await page.waitForTimeout(250);
              if (await page.evaluate(SHEET_SHOWN)) {
                add({ kind: "menu", ...where, detail: "Escape did not close the sheet" });
              } else if (!(await pressUntil(".rail-toggle", SHEET_SHOWN, 4))) {
                add({ kind: "menu", ...where, detail: "sheet would not reopen after Escape" });
              }
              /* Close it again by its own button, which is the route a reader uses. */
              if (await page.evaluate(SHEET_SHOWN)) {
                if (!(await pressUntil(".rail-toggle", SHEET_SHOWN, 4))) {
                  add({ kind: "menu", ...where, detail: "menu button would not close the sheet" });
                }
              }
            }
          }
        } catch (error) {
          add({ kind: "menu", ...where, detail: `menu interaction threw: ${String(error.message).split("\n")[0]}` });
        }
      }

      /* --- the theme control --- */
      if (!SHOTS_ONLY && (route === "/" || cellRoutes.length <= 3)) {
        try {
          const THEME = () => document.documentElement.dataset.theme ?? "(unset)";
          const before = await page.evaluate(THEME);
          const pressed = await pressUntil(".theme-button:visible", THEME);
          if (!pressed) {
            add({ kind: "theme", ...where, detail: `theme button never changed data-theme (stayed ${before})` });
          } else {
            const after = await page.evaluate(THEME);
            /* The icon has to agree with the state, or the control lies about what it does. */
            const label = await page.evaluate(() =>
              document.querySelector(".theme-button")?.getAttribute("aria-label") ?? "");
            const promises = after === "dark" ? "light" : "dark";
            if (!label.includes(promises)) {
              add({ kind: "theme", ...where, detail: `theme is ${after} but the button says "${label}"` });
            }
            await page.reload({ waitUntil: "load" });
            await page.waitForTimeout(300);
            const persisted = await page.evaluate(THEME);
            if (persisted !== after) {
              add({ kind: "theme", ...where, detail: `choice did not survive reload: ${after} became ${persisted}` });
            }
            /*
             * The point of a stored choice is that it beats the device. With
             * `dark` stored under a light context the page must still be dark.
             */
            const ground = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
            const lum = (ground.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).reduce((a, b) => a + b, 0) / 3;
            const looksDark = lum < 110;
            if (!setting.forcedColors && (after === "dark") !== looksDark) {
              add({ kind: "theme", ...where, detail: `data-theme=${after} but body ground is ${ground}` });
            }
          }
        } catch (error) {
          add({ kind: "theme", ...where, detail: `theme button unusable: ${String(error.message).split("\n")[0]}` });
        }
      }

      /* --- touch: a hover-revealed thing has to be reachable by tap --- */
      if (device.touch && route === "/work") {
        const hoverOnly = await page.evaluate(() => {
          /* Anything that only becomes visible on hover and is not focusable. */
          const out = [];
          for (const el of document.querySelectorAll("[class*='reveal'], [class*='hover']")) {
            const cs = getComputedStyle(el);
            if (Number(cs.opacity) < 0.05 && !el.matches("a, button, [tabindex]")) {
              out.push(el.className.toString().slice(0, 50));
            }
          }
          return out.slice(0, 5);
        });
        for (const h of hoverOnly) add({ kind: "touch", ...where, detail: `hidden until hover, no tap route: ${h}` });
      }

      for (const e of [...new Set(errors)]) add({ kind: "console", ...where, detail: e });
      for (const f of [...new Set(failed)]) add({ kind: "request", ...where, detail: f });

      /* --- screenshots --- */
      if (shotDir) {
        const name = `${device.id}__${setting.id}__${engineName}__${route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-")}`;
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(150);
        if (probe.scrollHeight > 9000) {
          /*
           * Three viewport frames instead of one enormous file. Several routes
           * carry a 760vh scroll track, and a full-page capture of one is a
           * 30,000px image that no reviewer opens.
           */
          for (const [i, frac] of [0, 0.5, 1].entries()) {
            await page.evaluate((f) => {
              const max = document.documentElement.scrollHeight - window.innerHeight;
              window.scrollTo({ top: Math.round(max * f), behavior: "instant" });
            }, frac);
            await page.waitForTimeout(400);
            await page.screenshot({ path: path.join(shotDir, `${name}__frame${i}.png`) });
          }
        } else {
          await page.screenshot({ path: path.join(shotDir, `${name}.png`), fullPage: true });
        }
      }
    } catch (error) {
      add({ kind: "crash", ...where, detail: String(error.message).split("\n")[0] });
    } finally {
      await page.close().catch(() => {});
    }
  }

  await ctx.close().catch(() => {});
}

/* ---- Main ------------------------------------------------------------------------------------- */

const routes = ONLY_ROUTES ? ONLY_ROUTES.split(",") : argv.includes("--all-routes") ? ALL_ROUTES : MATRIX_ROUTES;
const shotDir = SHOTS ? path.resolve(SHOTS) : null;
if (shotDir) await mkdir(shotDir, { recursive: true });

/*
 * Which cells run. The full product is engines x 18 devices x 7 settings x 17
 * routes, which is 64,000 page loads and nobody waits for that. The split is:
 * every device on every engine under light and dark across every route, and the
 * remaining settings on a representative five devices, because a setting bug is
 * a stylesheet bug and does not hide at one particular width.
 */
const SETTING_DEVICES = ["iphone-se", "iphone-15", "ipad", "laptop-1366", "desktop-1920"];

const cells = [];
for (const engineName of ONLY_ENGINES) {
  if (!ENGINES[engineName]) continue;
  for (const device of DEVICES) {
    for (const setting of SETTINGS) {
      const isBase = setting.id === "light" || setting.id === "dark";
      if (!isBase && !SETTING_DEVICES.includes(device.id)) continue;
      if (setting.viewport && !device.id.startsWith("laptop")) continue;
      if (SETTINGS_ONLY && isBase) continue;
      cells.push({ engineName, device, setting });
    }
  }
}

/*
 * Findings go to disk as each cell finishes, and finished cells are recorded
 * beside them.
 *
 * The first version held everything in memory and wrote one JSON at the end.
 * Playwright threw an internal assertion out of a CDP callback at cell 24 of
 * 159, which is not catchable from the call site, and the run lost forty
 * minutes of work. A sweep this long has to survive its own tooling: re-run
 * with --resume and only the cells that never finished are repeated.
 */
const LEDGER = path.resolve(shotDir ?? ".", "compat-ledger.jsonl");
const completed = new Set();
if (argv.includes("--resume")) {
  try {
    for (const line of (await readFile(LEDGER, "utf8")).split("\n")) {
      if (!line.trim()) continue;
      const rec = JSON.parse(line);
      if (rec.t === "cell") completed.add(rec.id);
      if (rec.t === "finding") findings.push(rec.f);
    }
    console.log(`resuming: ${completed.size} cells already done, ${findings.length} findings recovered`);
  } catch {
    console.log("no ledger to resume from");
  }
} else {
  await writeFile(LEDGER, "");
}

const ledger = createWriteStream(LEDGER, { flags: "a" });
const flushCell = (id, from) => {
  for (const f of findings.slice(from)) ledger.write(`${JSON.stringify({ t: "finding", f })}\n`);
  ledger.write(`${JSON.stringify({ t: "cell", id })}\n`);
};

const cellId = (c) => `${c.engineName}/${c.device.id}/${c.setting.id}`;
const todo = cells.filter((c) => !completed.has(cellId(c)));
console.log(`${cells.length} cells, ${routes.length} routes, ${todo.length * routes.length} page loads to run`);

/*
 * One browser per worker, recycled. Driving 159 contexts through a single
 * long-lived browser is what the crash above came out of, and a worker that
 * owns its browser also means a dead browser takes one worker down rather than
 * the run.
 */
let done = completed.size;
const CONCURRENCY = Number(process.env.COMPAT_CONCURRENCY ?? 4);
const RECYCLE = Number(process.env.COMPAT_RECYCLE ?? 8);
const queue = [...todo];

await Promise.all(
  Array.from({ length: CONCURRENCY }, async (_, worker) => {
    let browser = null;
    let engineOf = null;
    let used = 0;
    const release = async () => {
      if (browser) await browser.close().catch(() => {});
      browser = null;
      engineOf = null;
      used = 0;
    };
    try {
      for (;;) {
        const cell = queue.shift();
        if (!cell) return;
        if (engineOf !== cell.engineName || used >= RECYCLE) {
          await release();
          engineOf = cell.engineName;
          browser = await ENGINES[engineOf].launch(engineOf === "chromium" ? { args: CHROMIUM_ARGS } : {});
        }
        used += 1;
        const from = findings.length;
        try {
          await runCell({ engineName: cell.engineName, browser, device: cell.device, setting: cell.setting, routes, shotDir });
        } catch (error) {
          await release();
          /*
           * One retry on a fresh browser. A cell that died because its browser
           * died has not been tested, and marking it done would quietly shrink
           * the matrix to whatever survived.
           */
          if (!cell.retried) {
            cell.retried = true;
            findings.length = from;
            queue.unshift(cell);
            continue;
          }
          add({ kind: "crash", engine: cell.engineName, device: cell.device.id, setting: cell.setting.id, detail: `cell threw twice: ${String(error.message).split("\n")[0]}` });
        }
        flushCell(cellId(cell), from);
        done += 1;
        process.stdout.write(`\r${done}/${cells.length} cells, ${findings.length} findings   [w${worker}]   `);
      }
    } finally {
      await release();
    }
  }),
);
console.log("");
ledger.end();
if (harnessCrashes) console.log(`note: the harness survived ${harnessCrashes} internal Playwright faults; cells hit by one were retried on a fresh browser`);

/* ---- Report ----------------------------------------------------------------------------------- */

/*
 * A finding carrying `once` is a property of the stylesheet or the markup, not
 * of the cell that happened to notice it, so it is collapsed to one line with a
 * count. Without this the viewport-meta finding alone is 2,000 identical rows.
 */
const grouped = new Map();
for (const f of findings) {
  const key = f.once ? `once:${f.once}` : `${f.kind}|${f.detail}|${f.route ?? ""}`;
  if (!grouped.has(key)) grouped.set(key, { ...f, count: 0, where: new Set() });
  const g = grouped.get(key);
  g.count += 1;
  g.where.add(`${f.engine ?? "?"}/${f.device ?? "?"}/${f.setting ?? "?"}`);
}

const rows = [...grouped.values()].map((g) => ({
  kind: g.kind,
  route: g.route ?? "",
  detail: g.detail,
  who: g.who ?? "",
  count: g.count,
  where: [...g.where].sort(),
}));

const order = ["crash", "status", "overflow", "clipped", "overlap", "offscreen", "menu", "theme", "nav", "hero", "font", "image", "request", "console", "tap", "a11y", "touch", "safe-area", "skipped"];
rows.sort((a, b) => (order.indexOf(a.kind) - order.indexOf(b.kind)) || b.count - a.count);

const byKind = {};
for (const r of rows) byKind[r.kind] = (byKind[r.kind] ?? 0) + r.count;

console.log("\n==== by kind ====");
for (const [k, n] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(6)}  ${k}`);

console.log("\n==== findings ====");
for (const r of rows) {
  const w = r.where.length > 6 ? `${r.where.slice(0, 6).join(" ")} +${r.where.length - 6} more` : r.where.join(" ");
  console.log(`[${r.kind}] ${r.route} ${r.detail}${r.who ? ` <- ${r.who}` : ""}`);
  console.log(`         x${r.count}  ${w}`);
}

const outPath = path.resolve(shotDir ?? ".", "compat-findings.json");
await writeFile(outPath, JSON.stringify({ origin: ORIGIN, cells: cells.length, routes, rows }, null, 2));
console.log(`\n${findings.length} findings, ${rows.length} distinct. Written to ${outPath}`);
if (shotDir) console.log(`Screenshots in ${shotDir}`);
