/**
 * Route measurement.
 *
 * Sizes are read from the built output rather than from Content-Length, because Next serves
 * chunked and the header is absent - measuring the response stream is the only honest way to get
 * transferred bytes. Layout shift is measured with the real PerformanceObserver rather than
 * inferred, since the whole loading strategy here rests on the claim that nothing shifts.
 *
 * Usage: node tools/measure-routes.mjs [origin]
 */
import { chromium } from "@playwright/test";

const origin = process.argv[2] ?? "http://127.0.0.1:3400";

const ROUTES = [
  ["/", "no-preference"],
  ["/", "reduce"],
  ["/work", "no-preference"],
  ["/work/transport-uq", "no-preference"],
  ["/research", "no-preference"],
  ["/about", "no-preference"],
  ["/contact", "no-preference"],
  ["/resume", "no-preference"],
];

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

console.log(
  `${"route".padEnd(22)}${"motion".padEnd(15)}${"req".padStart(4)}${"3rd".padStart(5)}` +
    `${"html".padStart(9)}${"js".padStart(10)}${"css".padStart(9)}${"font".padStart(8)}` +
    `${"fcp".padStart(7)}${"cls".padStart(9)}${"dom".padStart(6)}${"canvas".padStart(8)}`,
);

for (const [route, motion] of ROUTES) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: motion,
  });
  const page = await context.newPage();

  const bytes = { html: 0, js: 0, css: 0, font: 0 };
  let requests = 0;
  let thirdParty = 0;

  page.on("response", async (response) => {
    requests += 1;
    const url = new URL(response.url());
    if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") thirdParty += 1;
    let size = 0;
    try {
      size = (await response.body()).length;
    } catch {
      return;
    }
    const type = response.headers()["content-type"] ?? "";
    if (type.includes("javascript")) bytes.js += size;
    else if (type.includes("css")) bytes.css += size;
    else if (type.includes("html")) bytes.html += size;
    else if (type.includes("font") || /\.woff2?$/.test(url.pathname)) bytes.font += size;
  });

  await page.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
  // Scroll the whole page: a shift that only happens once something is revealed still counts.
  await page.evaluate(async () => {
    const step = window.innerHeight;
    /*
     * `behavior: "instant"` matters: the site sets scroll-behavior: smooth globally, so a plain
     * scrollTo animates and a loop of them never lands. A measurement that never reaches the
     * lazy scenes reports a bundle size the site does not actually have.
     */
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(700);

  const m = await page.evaluate(() => ({
    fcp: Math.round(performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0),
    cls: window.__cls,
    dom: document.querySelectorAll("*").length,
    canvases: document.querySelectorAll("canvas").length,
  }));

  const kb = (n) => `${(n / 1024).toFixed(0)}k`;
  console.log(
    `${route.padEnd(22)}${motion.padEnd(15)}${String(requests).padStart(4)}${String(thirdParty).padStart(5)}` +
      `${kb(bytes.html).padStart(9)}${kb(bytes.js).padStart(10)}${kb(bytes.css).padStart(9)}${kb(bytes.font).padStart(8)}` +
      `${(m.fcp + "ms").padStart(7)}${m.cls.toFixed(4).padStart(9)}${String(m.dom).padStart(6)}${String(m.canvases).padStart(8)}`,
  );

  await context.close();
}

await browser.close();
