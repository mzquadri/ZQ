/**
 * What /work actually costs, split by when it is paid.
 *
 * The route total counts everything a full scroll pulls in, which is the wrong number to judge a
 * lazily-mounted scene by. This separates the bytes a reader pays for on arrival from the bytes
 * that only arrive if they scroll to the WebGL band, and names the chunks in each half.
 */
import { chromium } from "@playwright/test";

const origin = process.argv[2] ?? "http://127.0.0.1:3400";
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
/* Three readers: a wide desktop, one who asked for less motion, and a phone. */
const AS = (process.argv[3] ?? "desktop");
const PROFILE = {
  desktop: { viewport: { width: 1440, height: 900 } },
  reduced: { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
}[AS];

const context = await browser.newContext(PROFILE);
const page = await context.newPage();

const js = [];
page.on("response", async (response) => {
  if (!response.url().endsWith(".js")) return;
  const body = await response.body().catch(() => null);
  if (body) js.push({ url: response.url(), bytes: body.length, phase });
});

let phase = "initial";
await page.goto(`${origin}/work`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

/*
 * Stepped, not a jump to the bottom. The scenes mount on an intersection observer, so landing
 * past them in one go can miss every trigger - which is exactly what a single scrollTo did here,
 * and it reported zero.
 */
phase = "on-scroll";
for (let i = 1; i <= 12; i += 1) {
  await page.evaluate((f) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * (f / 12), behavior: "instant" });
  }, i);
  await page.waitForTimeout(500);
}
await page.waitForTimeout(1500);
await page.waitForLoadState("networkidle").catch(() => {});

const sum = (p) => js.filter((f) => f.phase === p).reduce((n, f) => n + f.bytes, 0);
const k = (n) => `${Math.round(n / 1024)}k`;

console.log(`as ${AS}`);
console.log(`initial    ${k(sum("initial"))}   (${js.filter((f) => f.phase === "initial").length} files)`);
console.log(`on-scroll  ${k(sum("on-scroll"))}   (${js.filter((f) => f.phase === "on-scroll").length} files)`);
console.log("\nlargest chunks pulled in on scroll:");
for (const f of js.filter((f) => f.phase === "on-scroll").sort((a, b) => b.bytes - a.bytes).slice(0, 6)) {
  console.log(`  ${k(f.bytes).padStart(6)}  ${f.url.split("/").pop()}`);
}

await browser.close();
