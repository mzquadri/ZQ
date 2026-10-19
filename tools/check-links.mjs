/**
 * Follow every link on the site and report the ones that do not work.
 *
 *   node tools/check-links.mjs http://localhost:3251
 *
 * Internal links are crawled breadth-first from the home page, so a page
 * nothing links to is also reported: an orphan is a different defect from a
 * broken link and both matter on a site whose navigation is the product.
 *
 * External links are requested once each. A 403 or 405 from a host that blocks
 * automated requests is reported separately from a genuine 404, because the
 * first is the host's policy and the second is a dead link.
 */
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3251";
const origin = new URL(base).origin;

const browser = await chromium.launch();
const page = await browser.newPage();

const seen = new Set(["/"]);
const queue = ["/"];
const external = new Map();
const internalBroken = [];
const linkedFrom = new Map();

while (queue.length) {
  const route = queue.shift();
  let status;
  try {
    const res = await page.goto(origin + route, { waitUntil: "domcontentloaded", timeout: 60000 });
    status = res?.status() ?? 0;
  } catch (err) {
    internalBroken.push({ route, status: "error", detail: err.message.split("\n")[0] });
    continue;
  }
  if (status >= 400) {
    internalBroken.push({ route, status, detail: [...(linkedFrom.get(route) ?? [])].join(", ") });
    continue;
  }

  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
  );

  for (const href of hrefs) {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    let url;
    try {
      url = new URL(href, origin + route);
    } catch {
      continue;
    }
    if (url.origin === origin) {
      const next = url.pathname;
      if (!linkedFrom.has(next)) linkedFrom.set(next, new Set());
      linkedFrom.get(next).add(route);
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    } else if (!external.has(url.href)) {
      external.set(url.href, route);
    }
  }
}

console.log(`crawled ${seen.size} internal pages`);
if (internalBroken.length === 0) {
  console.log("  every internal link resolves");
} else {
  console.log("\nBROKEN INTERNAL LINKS");
  for (const b of internalBroken) console.log(`  ${b.status}  ${b.route}   linked from: ${b.detail}`);
}

console.log(`\nchecking ${external.size} external links`);
const blocked = [];
const dead = [];
for (const [url, from] of external) {
  let code = 0;
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (link check)" } });
    code = res.status;
  } catch (err) {
    code = `error: ${err.message.slice(0, 40)}`;
  }
  if (code === 404 || code === 410) dead.push({ url, from, code });
  else if (typeof code === "number" && code >= 400) blocked.push({ url, from, code });
  else if (typeof code !== "number") blocked.push({ url, from, code });
}

if (dead.length) {
  console.log("\nDEAD EXTERNAL LINKS");
  for (const d of dead) console.log(`  ${d.code}  ${d.url}\n        on ${d.from}`);
} else {
  console.log("  no dead external links");
}
if (blocked.length) {
  console.log("\nBLOCKED OR UNREACHABLE, likely the host refusing automated requests");
  for (const b of blocked) console.log(`  ${b.code}  ${b.url.slice(0, 92)}`);
}

await browser.close();
process.exit(dead.length || internalBroken.length ? 1 : 0);
