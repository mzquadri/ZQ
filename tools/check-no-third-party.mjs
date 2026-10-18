/**
 * Prove the claim the privacy page makes: nothing is requested from a third party.
 *
 *   node tools/check-no-third-party.mjs http://localhost:3219 / /research /learn
 *
 * The Datenschutz page states that no font provider, CDN or social network
 * learns that you visited. That is a factual claim about network behaviour, and
 * the only way to hold it true as the site changes is to check it: load each
 * route in a real browser and fail on any request whose host is not this site's
 * own. Fonts are the usual way this breaks, because one `@import` or one
 * `<link>` to a font service reintroduces it silently.
 *
 * Also fails on a cookie, for the same reason: the page says none are set.
 */
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3219";
const routes = process.argv.slice(3);
if (routes.length === 0) routes.push("/");

const ownHost = new URL(base).host;
const browser = await chromium.launch();
const context = await browser.newContext();

const foreign = new Map();
const seenHosts = new Set();

context.on("request", (req) => {
  const host = new URL(req.url()).host;
  seenHosts.add(host);
  if (host !== ownHost && !req.url().startsWith("data:") && !req.url().startsWith("blob:")) {
    foreign.set(req.url(), (foreign.get(req.url()) ?? 0) + 1);
  }
});

for (const route of routes) {
  const page = await context.newPage();
  await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  await page.close();
}

const cookies = await context.cookies();
await browser.close();

console.log(`routes checked: ${routes.length}`);
console.log(`hosts contacted: ${[...seenHosts].join(", ")}`);
console.log(`cookies set: ${cookies.length}`);

let failed = false;
if (foreign.size > 0) {
  failed = true;
  console.log("\nTHIRD-PARTY REQUESTS, which the privacy page says do not happen:");
  for (const [url, n] of foreign) console.log(`  ${n}x ${url.slice(0, 140)}`);
}
if (cookies.length > 0) {
  failed = true;
  console.log("\nCOOKIES SET, which the privacy page says do not happen:");
  for (const c of cookies) console.log(`  ${c.name} (${c.domain})`);
}

if (!failed) console.log("\nclean: no third-party request, no cookie");
process.exit(failed ? 1 : 0);
