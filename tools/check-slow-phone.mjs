/**
 * What the site costs on a slow connection and a slow phone.
 *
 *   node tools/check-slow-phone.mjs http://127.0.0.1:3212
 *
 * Two separate questions, deliberately not combined into a score:
 *
 *   payload   how many bytes each route needs before it is readable, which is
 *             the thing a slow connection actually charges for
 *   paint     when first and largest contentful paint land under a 4G profile
 *             with the CPU slowed to a mid-range phone
 *
 * HANDOFF records that no Lighthouse number from this machine is trustworthy:
 * runs disagreed by a factor of eight and one measured a login page. This does
 * not try to produce one. It reports transferred bytes, which are deterministic
 * and do not care how loaded the machine is, alongside paint timings taken
 * under an explicit throttle, which are indicative and are labelled as such.
 *
 * The throttle is CDP, so this is Chromium only. Firefox and WebKit have no
 * equivalent in Playwright, and inventing one by sleeping in a route handler
 * would measure the handler.
 */
import { chromium } from "@playwright/test";

const ORIGIN = (process.argv[2] ?? "http://127.0.0.1:3212").replace(/\/$/, "");

/*
 * "Slow 4G" as Chrome DevTools defines it: 400 kbps down, 400ms round trip.
 * Mid-range phones are roughly a quarter of a desktop core, which is the
 * multiplier DevTools uses for its own mobile profile.
 */
const DOWN_KBPS = 400;
const LATENCY_MS = 400;
const CPU_SLOWDOWN = 4;

const ROUTES = ["/", "/work", "/research/thesis", "/experience", "/learn", "/about", "/contact"];

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

const rows = [];

for (const route of ROUTES) {
  const ctx = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  const page = await ctx.newPage();

  /* Bytes first, unthrottled: throttling does not change the size of a file. */
  const bytes = { total: 0, byType: {} };
  page.on("response", async (res) => {
    try {
      const headers = res.headers();
      const len = Number(headers["content-length"] ?? 0);
      const size = len || (await res.body().then((b) => b.length).catch(() => 0));
      const type = (headers["content-type"] ?? "other").split(";")[0];
      bytes.total += size;
      bytes.byType[type] = (bytes.byType[type] ?? 0) + size;
    } catch {
      /* A response that never arrived has no size to count. */
    }
  });

  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    downloadThroughput: (DOWN_KBPS * 1024) / 8,
    uploadThroughput: (DOWN_KBPS * 1024) / 8,
    latency: LATENCY_MS,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_SLOWDOWN });

  const started = Date.now();
  await page.goto(ORIGIN + route, { waitUntil: "load", timeout: 180000 });

  const paints = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const read = () => {
          const fcp = performance.getEntriesByName("first-contentful-paint")[0];
          const lcpList = performance.getEntriesByType("largest-contentful-paint");
          const nav = performance.getEntriesByType("navigation")[0];
          return {
            fcp: fcp ? Math.round(fcp.startTime) : null,
            lcp: lcpList.length ? Math.round(lcpList[lcpList.length - 1].startTime) : null,
            dcl: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
          };
        };
        /* One more frame, so a late LCP candidate is counted. */
        setTimeout(() => resolve(read()), 1500);
      }),
  );

  const wall = Date.now() - started;

  /* Layout shift, which is what a slow connection makes visible. */
  const cls = await page.evaluate(
    () =>
      performance
        .getEntriesByType("layout-shift")
        .filter((e) => !e.hadRecentInput)
        .reduce((sum, e) => sum + e.value, 0),
  );

  rows.push({
    route,
    kb: Math.round(bytes.total / 1024),
    fcp: paints.fcp,
    lcp: paints.lcp,
    wall,
    cls: Number(cls.toFixed(3)),
    top: Object.entries(bytes.byType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t, n]) => `${t.replace("application/", "").replace("text/", "")} ${Math.round(n / 1024)}k`)
      .join(", "),
  });

  console.log(
    `${route.padEnd(22)} ${String(rows.at(-1).kb).padStart(5)} KB  ` +
      `FCP ${String(paints.fcp ?? "?").padStart(5)}ms  LCP ${String(paints.lcp ?? "?").padStart(5)}ms  ` +
      `load ${String(wall).padStart(6)}ms  CLS ${rows.at(-1).cls}`,
  );
  console.log(`${" ".repeat(23)}${rows.at(-1).top}`);

  await ctx.close();
}

await browser.close();

console.log(`\nProfile: ${DOWN_KBPS} kbps, ${LATENCY_MS}ms RTT, CPU x${CPU_SLOWDOWN}, iPhone 15 viewport.`);
const worst = rows.reduce((a, b) => (b.kb > a.kb ? b : a));
const worstCls = rows.reduce((a, b) => (b.cls > a.cls ? b : a));
console.log(`Heaviest route: ${worst.route} at ${worst.kb} KB.`);
console.log(`Worst layout shift: ${worstCls.route} at ${worstCls.cls}.`);
/* 0.1 is the "good" boundary for Cumulative Layout Shift. */
if (worstCls.cls > 0.1) {
  console.log("CLS above 0.1 is a visible jump on a slow connection and is worth a look.");
  process.exitCode = 1;
}
