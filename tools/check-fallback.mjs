/**
 * Cross-browser fallback check.
 *
 * The motion system is built on CSS scroll-driven timelines, whose support is good but not
 * universal. The design's whole safety argument is that where the feature is missing, elements sit
 * in their resting state - and every resting state is the *finished* state, so the page is simply
 * the page without the choreography.
 *
 * That argument is worth nothing unasserted. This runs the real engines and checks the thing that
 * actually matters: is the content there and visible, whatever the engine does with the animation.
 *
 * Usage: node tools/check-fallback.mjs [origin]
 */
import { chromium, firefox, webkit } from "@playwright/test";

const origin = process.argv[2] ?? "http://127.0.0.1:3400";

const ENGINES = [
  ["chromium", chromium],
  ["firefox", firefox],
  ["webkit", webkit],
];

/** Things that must be on screen and readable regardless of animation support. */
const MUST_SEE = [
  ["/", ".cine-name", "the name"],
  ["/", ".cine-beat", "hero caption beats"],
  ["/", ".chapter-title", "project titles"],
  ["/", ".verb-name", "engineering verbs"],
  ["/", ".cine-closing-line", "the closing line"],
  ["/work", ".page-stage-title", "work title"],
  ["/work/transport-uq", ".case-story-text", "case narrative beats"],
  ["/about", ".domain-label", "about domains"],
  ["/contact", ".ending-line", "the ending"],
];

let failures = 0;

for (const [name, engine] of ENGINES) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const supports = await (async () => {
    await page.goto(origin, { waitUntil: "domcontentloaded" });
    return page.evaluate(() => CSS.supports("animation-timeline", "view()"));
  })();

  const results = [];
  for (const [route, selector, label] of MUST_SEE) {
    await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    /*
     * Walk the page so anything gated on entering the viewport has had its chance, and finish at
     * the true bottom. Stepping by viewport height alone can stop short of it, which leaves a
     * final-section reveal mid-range and reads as missing content when it is nothing of the kind.
     */
    await page.evaluate(async () => {
      /*
       * `behavior: "instant"` matters: the site sets scroll-behavior: smooth globally, so a plain
       * scrollTo animates. A loop of them on a tall page never lands, and the final position is
       * still travelling when the assertion runs - which reads as missing content.
       */
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 200));
    });
    await page.waitForTimeout(600);

    const visible = await page.locator(selector).evaluateAll((els) =>
      els.filter((el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          Number(style.opacity) > 0.05 &&
          rect.width > 0 &&
          rect.height > 0
        );
      }).length,
    );

    if (visible === 0) {
      results.push(`MISSING ${label} (${selector} on ${route})`);
      failures += 1;
    }
  }

  console.log(
    `${name.padEnd(10)} scroll-timelines=${String(supports).padEnd(5)} ` +
      (results.length ? `FAILURES:\n  - ${results.join("\n  - ")}` : "all required content visible"),
  );

  await browser.close();
}

process.exit(failures === 0 ? 0 : 1);
