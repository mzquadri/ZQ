/**
 * What every work page has, and whether its figures actually move under a scroll.
 *
 * This is the instrument for the motion-parity work, and it exists because the two cheap ways of
 * answering the question both lie. Reading the source says what was *written*, not what the
 * browser resolved - `scenes.css` staged fifty selectors against the wrong ancestor for weeks and
 * every one of them computed `animation-name: none`. Reading `getComputedStyle` is worse: it
 * reports `opacity: 1` for an element Chrome is painting at zero, so a blanked figure probes as
 * healthy. Both failures are recorded in PROGRESS.md and both were found by looking at pixels.
 *
 * So the evidence here is pixels. Each figure is photographed through one window, fixed in its own
 * coordinates, at a series of scroll positions across the stretch where it is pinned, and
 * neighbouring frames are compared with a threshold. A figure that animates moves a real share of
 * its picture between samples; one that is frozen, blank or black moves none of it.
 *
 * The threshold, the aligned window and the pinned stretch are each there because the naive
 * version of this measurement failed a negative control: run against production with reduced
 * motion, where every scroll-driven animation is off, it has to report every figure as static. It
 * did not, three times over, and each failure is written up where it was fixed.
 *
 * Two inventory facts are read from the DOM rather than measured, because they are structural
 * rather than behavioural: which kind of hero a page opens on, and whether its "next system" band
 * carries a scene object. Both follow from a page having a SCENES entry.
 *
 * Usage: node tools/audit-motion-parity.mjs <origin> [--only slug,slug] [--width 1440]
 *                                           [--steps 12] [--json out.json] [--reduced]
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

/* ---------------------------------------------------------------------------------------------
 * Comparing two frames.
 *
 * The obvious metric - hash the screenshot, count distinct hashes - does not work, and a negative
 * control is what showed it. Run this against production with reduced motion, where every
 * scroll-driven animation is switched off and every figure must therefore be frozen, and hashing
 * reported two to six distinct frames per figure. That is antialiasing: a sticky element lands on a
 * different subpixel offset at different scroll positions, every vector edge and glyph is rendered
 * against a different fractional grid, and not one pixel of it is animation.
 *
 * So frames are decoded, reduced to a small greyscale thumbnail - which is itself most of the
 * denoising, since subpixel edge noise averages out under a box filter - and compared with a
 * per-pixel threshold. A frame counts as changed only when a real share of the picture moved.
 * ------------------------------------------------------------------------------------------- */

/**
 * Decode to a fixed greyscale raster so two frames are always comparable.
 *
 * 180 was too coarse and it under-reported a whole class of scene. A figure built from filled
 * rectangles - a confusion matrix, a stack of bars - changes a large share of a small thumbnail
 * when it animates. A figure built from one-pixel strokes and small type does not: downscaled by
 * eight, a moving hairline averages into its background and the scene reads as static while a
 * reader watches it move. Two scenes measured 0.3% and 0.4% peak that way.
 *
 * 320 keeps strokes above a pixel at the sizes these stages render at, and the negative control
 * still passes, which is the constraint that matters: raising this far enough to pick up noise
 * would have shown up there first.
 */
const THUMB = 320;
async function thumbnail(png) {
  return sharp(png).greyscale().resize(THUMB, THUMB, { fit: "fill" }).raw().toBuffer();
}

/** Share of pixels that differ by more than a level a renderer could wobble by on its own. */
function difference(a, b) {
  if (!a || !b || a.length !== b.length) return 1;
  let moved = 0;
  for (let i = 0; i < a.length; i += 1) if (Math.abs(a[i] - b[i]) > 10) moved += 1;
  return moved / a.length;
}

/* Half a percent of the picture. Below this a figure is holding still. */
const MOVED = 0.005;

const ORIGIN = (process.argv[2] ?? "https://mzquadri.de").replace(/\/$/, "");
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const ONLY = arg("only", "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const WIDTH = Number(arg("width", "1440"));
const STEPS = Number(arg("steps", "12"));
const JSON_OUT = arg("json", "");
const REDUCED = process.argv.includes("--reduced");
/*
 * Headless Chromium rasterises with SwiftShader, and every world on this site refuses to mount on
 * a software renderer - `worldRenderingIsWorthIt()` is what decides, and it is right to. So a
 * default run cannot see a WebGL world at all and will report one as static whether it works or
 * not. Pass --gpu to exercise the hardware path, the same switch tools/check-worlds.mjs uses.
 */
const GPU = process.argv.includes("--gpu");

/**
 * Every work page, in the two orders the site itself uses.
 *
 * Hard-coded rather than read from the sitemap so that a page going missing is a failure of this
 * audit rather than something it silently stops checking.
 */
const CHAPTERS = [
  "transport-uq",
  "mcp-policy-gateway",
  "reliable-knowledge-systems",
  "medico",
  "insureassist-rag",
  "mlops-reference-pipeline",
  "hydrology-uq",
  "streamflow-forecasting",
  "cifar10-cnn",
];
const CATALOGUE = [
  "ai-engineering-portfolio",
  "jobhunter",
  "nlp-transformers",
  "statistical-learning",
  "supply-chain",
  "weather-eda",
  "water-quality",
  "insurance-claims-threshold",
  "battery-soc",
  "nn-identifiability",
  "flood-lstm",
  "audi-release-tracking",
  "keras-pytorch-parity",
  "eurostat-modal-split",
  "bm25-rrf-java",
  "munich-accident-forecasting",
  "drift-aware-platform",
];

/**
 * The figure kinds a work page can carry, strongest first.
 *
 * `.scn-frame` is the pinned procedural scene stage - the one that scrubs as a pure function of
 * scroll. `.world-stage` is a bespoke WebGL world. `.case-story-stage` is the pinned flat figure a
 * CaseStory pins beside its argument. `.visual-section` is a staged diagram or chart section.
 * `.case-stage-figure` is the hero figure, which deliberately does not animate: it is at the top of
 * the document, so no scroll window remains below it.
 */
const FIGURES = [
  ["scene", ".scn-frame"],
  /* The thesis world predates the shared class and keeps its own; check-worlds.mjs says the same. */
  ["world", ".world-stage, .thesis-world"],
  ["story", ".case-story-stage"],
  ["section", "section.visual-section"],
];

const browser = await chromium.launch(
  GPU
    ? {
        headless: true,
        args: ["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"],
      }
    : { headless: true },
);
const context = await browser.newContext({
  viewport: { width: WIDTH, height: 900 },
  reducedMotion: REDUCED ? "reduce" : "no-preference",
  deviceScaleFactor: 1,
});

const slugs = ONLY.length ? ONLY : [...CHAPTERS, ...CATALOGUE];
const results = [];

for (const slug of slugs) {
  const page = await context.newPage();
  const url = `${ORIGIN}/work/${slug}`;
  const response = await page.goto(url, { waitUntil: "networkidle" });

  if (!response || !response.ok()) {
    results.push({ slug, status: response?.status() ?? 0, error: "unreachable" });
    await page.close();
    continue;
  }

  /*
   * Walk the page once before measuring anything.
   *
   * These pages mount their heavy parts lazily - a WebGL world waits on an IntersectionObserver -
   * and mounting one changes the document's height, which moves every element below it. Measuring
   * a figure's scroll range before that has happened and then sampling after it has means sampling
   * a window that has since moved: on hydrology-uq it put every sample outside the stretch where
   * the figure animates and reported a working figure as static, which cost an hour to pin down
   * against a hand-built probe that disagreed.
   *
   * So: scroll to the bottom, let everything that is going to mount mount, come back, and only
   * then ask where anything is.
   */
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });

  /* Structure, read once the page has settled at its final height. */
  const structure = await page.evaluate(() => ({
    heroScene: Boolean(document.querySelector(".case-stage .scn-identity")),
    heroFlat: Boolean(document.querySelector(".case-stage-figure")),
    story: Boolean(document.querySelector(".case-story-body")),
    sections: document.querySelectorAll("section.visual-section").length,
    nextObject: Boolean(document.querySelector(".next-system-object")),
    /*
     * Elements the browser actually resolved a scroll timeline for. Not evidence on its own - see
     * the header - but it separates "no animation was declared" from "one was declared and does
     * not move", which are different bugs with different fixes.
     */
    scrollBound: [...document.querySelectorAll("*")].filter((el) => {
      const t = getComputedStyle(el).animationTimeline;
      return t && t !== "none" && t !== "auto";
    }).length,
    height: document.documentElement.scrollHeight,
  }));

  /*
   * Pixels, sampled inside each figure's own scroll window rather than across the document.
   *
   * Sweeping the whole page uniformly is the measurement that lies, and it lies in the direction
   * that matters: these pages carry a full-bleed world track several viewports tall, so ten even
   * steps across twenty thousand pixels step straight over a story figure's fifteen-hundred-pixel
   * animation window and report a scene that works perfectly as STATIC. PROGRESS.md records the
   * same mistake being made with a coarse sweep once already.
   *
   * So each figure is measured over the range during which it is actually on screen: from the
   * scroll position where its track's top reaches the bottom of the viewport, to where its track's
   * bottom reaches the top. For a pinned figure the track is the tall ancestor it is sticky inside,
   * which is the subject its view timeline is bound to - not the sticky box itself, which stops
   * moving the moment it pins.
   *
   * Scrolling is absolute rather than incremental so a page that grows as it loads cannot drift the
   * sample points, and each step waits on two animation frames - scroll-driven progress is not
   * committed to the frame until the next one, so a fixed timeout reads the previous frame.
   */
  const figures = {};
  for (const [kind, selector] of FIGURES) {
    const count = await page.locator(selector).count();
    if (count === 0) continue;
    /*
     * The scene stage is not measurable under reduced motion, and saying so is more honest than
     * producing a number for it. Reduced motion collapses the stage track by design - the canvas
     * is never created and the still is the whole picture - so there is no scroll window to sample
     * and whatever the sampler finds instead is an artefact. It reported the same 4.5% on three
     * different pages, which is the signature of measuring page chrome rather than a figure.
     *
     * The world and story layers do measure correctly under reduced motion and report 0.0%, which
     * is what keeps the negative control meaningful.
     */
    if (REDUCED && kind === "scene") continue;
    const range = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      /*
       * The scroll range to measure over is the travel of the thing the figure is pinned *inside*.
       *
       * The threshold is 1.05 viewports, not 1.2, and the difference is not cosmetic.
       * `.case-story-body` is 1057px tall against a 900px viewport - 1.17, just under the old
       * threshold - so the walk sailed past it and settled on the article, twenty thousand pixels
       * of it. Twenty-four coarse samples across that step straight over the five hundred pixels
       * where the figure actually animates, and a figure measured at 1.1 to 3.3 per cent per step
       * by hand was reported as flat zero.
       */
      let track = el;
      /*
       * Bounded to five ancestors. Unbounded, the walk does not stop at the section a figure lives
       * in - it keeps going until something is tall enough, and on a reduced-motion run, where the
       * scene track is collapsed to nothing by design, that was the article itself. Sampling twenty
       * thousand pixels of page and calling the result the figure is how three different pages came
       * back with the same 4.5% of movement on a site with every animation switched off.
       */
      let node = el;
      for (let depth = 0; depth < 5 && node && node !== document.body; depth += 1) {
        if (node.getBoundingClientRect().height > window.innerHeight * 1.05) {
          track = node;
          break;
        }
        node = node.parentElement;
      }
      const box = track.getBoundingClientRect();
      const top = box.top + window.scrollY;
      return { top, bottom: top + box.height };
    }, selector);
    if (!range) continue;

    /*
     * The track and the thing that is pinned inside it are different elements, and only one of
     * them can be photographed.
     *
     * A world is a track several viewports tall with a sticky stage inside it. Capturing the track
     * is meaningless: it is taller than the screen, so scrolling changes which part of it you see
     * and every pair of frames differs enormously whether or not anything animated. What holds
     * still - and what the reader actually watches - is the sticky child. So the track supplies the
     * scroll range and its innermost pinned element supplies the picture.
     */
    const marked = await page.evaluate(
      ([sel, name]) => {
        const root = document.querySelector(sel);
        if (!root) return false;
        let target = root;
        for (const el of [root, ...root.querySelectorAll("*")]) {
          const position = getComputedStyle(el).position;
          if (position === "sticky" || position === "fixed") target = el;
        }
        if (target === root) target = root.querySelector("canvas, svg, figure") ?? root;
        target.setAttribute("data-audit-target", name);
        return true;
      },
      [selector, kind],
    );
    if (!marked) continue;

    figures[kind] = {
      selector,
      capture: `[data-audit-target="${kind}"]`,
      instances: count,
      range,
      frames: [],
    };
  }

  /*
   * Capturing a figure so that two samples of it can honestly be compared.
   *
   * Three things had to be got right here, and the reduced-motion control rejected the first two.
   *
   * 1. Do not use `locator.screenshot()`. It calls `scrollIntoViewIfNeeded` first, which discards
   *    the scroll position the loop just set, so every sample is taken at whatever offset
   *    Playwright picked and the figure is measured at one progress over and over.
   * 2. Do not clip to the element's visible intersection with the viewport. That rectangle changes
   *    size as the figure enters and leaves, and resizing two differently-cropped rectangles to a
   *    common thumbnail compares different parts of the picture - which reads as enormous movement
   *    on a page where nothing is moving at all.
   * 3. So: find one window, in the figure's own coordinates, that is on screen at every sampled
   *    position, and capture exactly that window every time. Constant size, aligned content, and
   *    the only thing that can differ between two frames is the drawing.
   */
  const maxScroll = Math.max(0, structure.height - 900);
  const settle = () =>
    page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

  const rectAt = (selector) =>
    page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { left: b.left, top: b.top, width: b.width, height: b.height };
    }, selector);

  /** How much of the figure the viewport is showing, as a share of what it could show. */
  const visible = (r) => {
    if (!r) return 0;
    const w = Math.max(0, Math.min(WIDTH, r.left + r.width) - Math.max(0, r.left));
    const h = Math.max(0, Math.min(900, r.top + r.height) - Math.max(0, r.top));
    return (w * h) / Math.max(1, Math.min(r.width * r.height, WIDTH * 900));
  };

  const COARSE = 24;

  for (const data of Object.values(figures)) {
    const from = Math.max(0, Math.min(maxScroll, data.range.top - 900));
    const to = Math.max(0, Math.min(maxScroll, data.range.bottom));

    /* Pass one, coarse: where the figure sits in the viewport across its track. */
    const scan = [];
    for (let k = 0; k < COARSE; k += 1) {
      const y = Math.round(from + (to - from) * (k / (COARSE - 1)));
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await settle();
      scan.push({ y, rect: await rectAt(data.capture) });
    }

    /*
     * Choose the stretch of scroll to measure over: the plateau where the figure is pinned.
     *
     * These stages are sticky, so across most of their track the figure holds one position in the
     * viewport while the argument scrolls past it - and that is both when the reader is looking at
     * it and when its scroll-driven animation is running. Over a plateau the capture window is the
     * whole figure and successive frames are perfectly aligned, which is what makes the comparison
     * mean anything. A figure that never pins falls back to the stretch where it is fully in view.
     */
    const plateaus = new Map();
    scan.forEach((s, i) => {
      /*
       * Only positions where essentially the whole figure is on screen.
       *
       * At 0.5 the plateau could include positions where the figure was half out of the viewport,
       * and the common window is an intersection - so one such position shrinks it to a band.
       * hydrology-uq is the case that found this: its figure is two stacked panels, the window
       * collapsed to 604x173 of a 604x452 figure, and the slice that survived was the top panel,
       * whose band is deliberately too narrow to see. A figure measured at 1.1 to 3.3 per cent per
       * step by hand read as 0.2.
       */
      if (visible(s.rect) < 0.98) return;
      /*
       * Exact, not within four pixels. A tolerance here is what let a reduced-motion run - where
       * the stage does not pin at all and the frame slides steadily through the viewport - collect
       * a run of nearly-equal positions and call it a plateau, then report 4.5% of invented
       * movement for a page with every animation switched off.
       */
      const key = `${Math.round(s.rect.left)}:${Math.round(s.rect.top)}`;
      if (!plateaus.has(key)) plateaus.set(key, []);
      plateaus.get(key).push(i);
    });
    let chosen = null;
    for (const indices of plateaus.values()) {
      if (!chosen || indices.length > chosen.length) chosen = indices;
    }
    if (!chosen || chosen.length < 5) {
      chosen = scan.map((_, i) => i).filter((i) => visible(scan[i].rect) >= 0.92);
    }
    if (chosen.length < 3) {
      data.unmeasurable = "never holds still in view";
      continue;
    }

    /*
     * Drop the outermost sample at each end of the plateau.
     *
     * A sticky figure is only pinned strictly inside its track: at the two ends it is still
     * arriving or already releasing, and the coarse grouping tolerates four pixels of movement, so
     * the boundary samples catch the figure physically sliding. That slide is a real pixel
     * difference and has nothing to do with whether the drawing animates - it is what put one or
     * two spurious moving steps into the reduced-motion control.
     */
    if (chosen.length >= 6) chosen = chosen.slice(1, -1);

    /* Spread the requested number of samples across the chosen stretch. */
    const lo = scan[chosen[0]].y;
    const hi = scan[chosen[chosen.length - 1]].y;
    const positions = [];
    for (let step = 0; step < STEPS; step += 1) {
      positions.push(Math.round(lo + (hi - lo) * (step / Math.max(1, STEPS - 1))));
    }

    /* The window on screen at every chosen position, in the figure's own coordinates. */
    let lx0 = 0;
    let ly0 = 0;
    let lx1 = Number.POSITIVE_INFINITY;
    let ly1 = Number.POSITIVE_INFINITY;
    for (const i of chosen) {
      const r = scan[i].rect;
      lx0 = Math.max(lx0, Math.max(0, -r.left));
      ly0 = Math.max(ly0, Math.max(0, -r.top));
      lx1 = Math.min(lx1, Math.min(r.width, WIDTH - r.left));
      ly1 = Math.min(ly1, Math.min(r.height, 900 - r.top));
    }
    const cw = Math.floor(lx1 - lx0);
    const ch = Math.floor(ly1 - ly0);
    if (!Number.isFinite(cw) || cw < 48 || ch < 48) {
      data.unmeasurable = `no aligned window (${cw}x${ch})`;
      continue;
    }
    data.window = { width: cw, height: ch, samples: positions.length, from: positions[0], to: positions[positions.length-1], trackTop: Math.round(data.range.top), trackBottom: Math.round(data.range.bottom) };

    /* Pass two: that window, at every sampled position. */
    for (const y of positions) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await settle();
      const r = await rectAt(data.capture);
      if (!r) continue;
      const clip = {
        x: Math.max(0, Math.min(WIDTH - cw, Math.round(r.left + lx0))),
        y: Math.max(0, Math.min(900 - ch, Math.round(r.top + ly0))),
        width: cw,
        height: ch,
      };
      try {
        data.frames.push(await thumbnail(await page.screenshot({ clip, timeout: 5000 })));
      } catch {
        /* Capture refused at this step; not a frame, and not a failure. */
      }
    }
  }

  /*
   * Two numbers per figure, and they answer different questions.
   *
   * `steps` is how many of the sampled intervals moved at all: a figure that stages through many
   * beats changes repeatedly, where one that only fades in changes once. `peak` is the largest
   * share of the picture that moved between two neighbouring samples, which separates a figure
   * that genuinely redraws from one where a caption shifted by a line.
   */
  const motion = {};
  for (const [kind, data] of Object.entries(figures)) {
    if (data.unmeasurable) {
      motion[kind] = { instances: data.instances, unmeasurable: data.unmeasurable, animates: null };
      continue;
    }
    let steps = 0;
    let peak = 0;
    for (let i = 1; i < data.frames.length; i += 1) {
      const d = difference(data.frames[i - 1], data.frames[i]);
      if (d > MOVED) steps += 1;
      if (d > peak) peak = d;
    }
    /*
     * How different the end is from the beginning, which `peak` cannot tell you.
     *
     * A scene that keeps its whole inventory on screen and moves emphasis across it - the house
     * pattern, and the one that makes the resting frame informative - changes only a few per cent
     * between neighbouring samples while transforming completely from end to end. Judged on `peak`
     * alone that reads as barely moving, which is the wrong verdict about the right design.
     */
    const span = difference(data.frames[0], data.frames[data.frames.length - 1]);
    motion[kind] = {
      instances: data.instances,
      sampled: data.frames.length,
      window: data.window,
      steps,
      peak: Number(peak.toFixed(4)),
      span: Number(span.toFixed(4)),
      animates: steps > 0,
    };
  }

  results.push({ slug, status: response.status(), ...structure, motion });
  await page.close();
}

await browser.close();

/* ---------------------------------------------------------------------------------------------
 * Report.
 * ------------------------------------------------------------------------------------------- */

const mark = (ok) => (ok ? "yes" : "-");
const row = (cells) => cells.join(" | ");

console.log(`${ORIGIN} at ${WIDTH}px, ${STEPS} scroll steps${REDUCED ? ", reduced motion" : ""}`);
console.log("");
console.log(
  row(["page".padEnd(30), "hero ", "scene", "world", "story", "sect", "next ", "moving steps (peak share)"]),
);
console.log("-".repeat(112));

for (const r of results) {
  if (r.error) {
    console.log(`${r.slug.padEnd(30)} | ${r.error} (${r.status})`);
    continue;
  }
  const frames = Object.entries(r.motion)
    .map(([kind, m]) =>
      m.unmeasurable
        ? `${kind}:? ${m.unmeasurable}`
        : `${kind}:${m.steps}/${m.sampled - 1} peak ${(m.peak * 100).toFixed(1)}% span ${(m.span * 100).toFixed(0)}%${m.animates ? "" : " STATIC"}`,
    )
    .join("  ");
  console.log(
    row([
      r.slug.padEnd(30),
      (r.heroScene ? "scene" : r.heroFlat ? "flat " : "none ").padEnd(5),
      mark(Boolean(r.motion.scene)).padEnd(5),
      mark(Boolean(r.motion.world)).padEnd(5),
      mark(r.story).padEnd(5),
      String(r.sections).padEnd(4),
      mark(r.nextObject).padEnd(5),
      frames || "none",
    ]),
  );
}

const lacking = results.filter(
  (r) => !r.error && !Object.values(r.motion).some((m) => m.animates),
);
console.log("");
console.log(`${results.length} pages; ${lacking.length} with no figure that moves under a scroll`);
if (lacking.length) console.log(`  ${lacking.map((r) => r.slug).join(", ")}`);

if (JSON_OUT) {
  await writeFile(JSON_OUT, JSON.stringify({ origin: ORIGIN, width: WIDTH, results }, null, 2));
  console.log(`\nwritten to ${JSON_OUT}`);
}
