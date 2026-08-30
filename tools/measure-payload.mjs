/**
 * What a route costs, on one basis, split by when it is paid.
 *
 * There were three overlapping payload measurements in this repository and they disagreed, which
 * is worse than having none: `probe-route.mjs` counted JavaScript only, `probe-work.mjs` counted
 * the same thing for one route, and `measure-routes.mjs` counted every content type across a full
 * scroll. All three called `response.body()`, which hands back the *decoded* body - so all three
 * were reporting uncompressed bytes while the budget written into the docs ("the homepage's
 * entire initial transfer is 574 KB") is a compressed, over-the-wire number. Comparing one to the
 * other made the site look 20% heavier than it is.
 *
 * So this is the single tool, and it reports both numbers side by side with the wire number
 * first, because that is the one that decides how long a reader waits.
 *
 *   transfer  bytes actually crossing the network, after brotli/gzip (encodedBodySize)
 *   decoded   bytes after decompression, which is what the parser and the memory footprint see
 *
 * Sizes come from PerformanceResourceTiming rather than from the response listener, because that
 * is the only place the browser reports what it really received. Both are same-origin here, so
 * encodedBodySize is populated; a cross-origin resource without Timing-Allow-Origin would report
 * zero, and is listed separately rather than silently counted as free.
 *
 * "initial" is everything fetched before the reader scrolls. "on-scroll" is what the deferred
 * renderers and lazy figures add afterwards. A route is allowed to be heavy on the second number
 * and must not be on the first.
 *
 * Usage: node tools/measure-payload.mjs [origin] [route ...]
 */
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const origin = args[0]?.startsWith("http") ? args.shift() : "http://127.0.0.1:3400";
const ROUTES = args.length
  ? args
  : ["/", "/work", "/work/medico", "/work/hydrology-uq", "/work/transport-uq", "/research/thesis"];

const PROFILES = [
  ["desktop", { viewport: { width: 1440, height: 900 } }],
  ["reduced", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }],
  ["mobile", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
];

/** Everything the browser fetched so far, by URL, with both sizes. */
const SNAPSHOT = () => {
  const nav = performance.getEntriesByType("navigation")[0];
  const out = {};
  if (nav) {
    out[location.pathname + "#document"] = {
      transfer: nav.encodedBodySize,
      decoded: nav.decodedBodySize,
      kind: "html",
      sameOrigin: true,
    };
  }
  for (const e of performance.getEntriesByType("resource")) {
    let kind = "other";
    if (/\.js(\?|$)/.test(e.name) || e.initiatorType === "script") kind = "js";
    else if (/\.css(\?|$)/.test(e.name) || e.initiatorType === "css") kind = "css";
    else if (/\.woff2?(\?|$)/.test(e.name)) kind = "font";
    else if (/\.(png|jpe?g|svg|webp|avif|gif|mp4|webm)(\?|$)/.test(e.name)) kind = "media";
    else if (/\.rsc(\?|$)|_rsc=/.test(e.name)) kind = "rsc";
    out[e.name] = {
      transfer: e.encodedBodySize,
      decoded: e.decodedBodySize,
      kind,
      sameOrigin: new URL(e.name, location.href).origin === location.origin,
    };
  }
  return out;
};

const k = (n) => (n / 1024).toFixed(0) + "k";
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

console.log(
  `${"route".padEnd(24)}${"profile".padEnd(9)}` +
    `${"initial".padStart(9)}${"on-scroll".padStart(11)}${"total".padStart(8)}   ` +
    `${"(decoded)".padStart(10)}  three  media`,
);

for (const route of ROUTES) {
  for (const [name, opts] of PROFILES) {
    const context = await browser.newContext(opts);
    const page = await context.newPage();

    /* Sniffed from the body, because a bundle's name does not say what is in it. */
    let three = false;
    page.on("response", async (r) => {
      if (three || !r.url().endsWith(".js")) return;
      const body = await r.body().catch(() => null);
      if (body && /three\.module|WebGLRenderer/.test(body.toString("utf8"))) three = true;
    });

    await page.goto(origin + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const initial = await page.evaluate(SNAPSHOT);
    const threeOnArrival = three;

    for (let i = 1; i <= 16; i += 1) {
      await page.evaluate((f) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: max * (f / 16), behavior: "instant" });
      }, i);
      await page.waitForTimeout(320);
    }
    await page.waitForTimeout(1400);
    const all = await page.evaluate(SNAPSHOT);

    const sum = (set, pick) =>
      Object.entries(set)
        .filter(([url]) => pick(url))
        .reduce(
          (a, [, v]) => ({ transfer: a.transfer + v.transfer, decoded: a.decoded + v.decoded }),
          { transfer: 0, decoded: 0 },
        );

    const first = sum(all, (u) => u in initial);
    const later = sum(all, (u) => !(u in initial));
    const media = Object.values(all).filter((v) => v.kind === "media").length;
    const opaque = Object.values(all).filter((v) => !v.sameOrigin && v.transfer === 0).length;

    console.log(
      `${route.padEnd(24)}${name.padEnd(9)}` +
        `${k(first.transfer).padStart(9)}${("+" + k(later.transfer)).padStart(11)}` +
        `${k(first.transfer + later.transfer).padStart(8)}   ` +
        `${k(first.decoded).padStart(10)}  ` +
        `${(threeOnArrival ? "ARRIVAL" : three ? "scroll" : "never").padEnd(7)}${String(media).padStart(3)}` +
        (opaque ? `  (${opaque} cross-origin unmeasurable)` : ""),
    );
    await context.close();
  }
}

await browser.close();
