/**
 * Verify a protected Vercel preview the way a reader would reach it.
 *
 *   node tools/check-preview.mjs https://zq-xxxx.vercel.app [shotDir]
 *
 * A preview on this account is behind Vercel Authentication, so an anonymous
 * request gets the login page rather than the site and every status code is a
 * lie. The local development OIDC token is accepted on the same project's
 * preview deployments, so it is read out of `.env.local` and sent as a request
 * header on every navigation.
 *
 * The token is never printed, written anywhere else, or passed on the command
 * line. `.env.local` is gitignored and `vercel env run` refreshes it.
 *
 * What this asserts, on the deployed artefact rather than on a local build:
 *
 *   routes          every page answers, the 404 answers 404
 *   confidential    the withheld case study is gone, on four spellings
 *   viewport        `viewport-fit=cover` is present, and zoom is not blocked
 *   navigation      the phone menu opens to a full screen, not a strip
 *   privacy         nothing is fetched from a third party, no cookie is set
 */
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const ORIGIN = (process.argv[2] ?? "").replace(/\/$/, "");
const SHOTS = process.argv[3] ?? null;
if (!ORIGIN) throw new Error("usage: node tools/check-preview.mjs <preview url> [shotDir]");

const token = (readFileSync(".env.local", "utf8").match(/^VERCEL_OIDC_TOKEN="?([^"\n\r]+)"?/m) ?? [])[1];
if (!token) throw new Error("no VERCEL_OIDC_TOKEN in .env.local; run `vercel env pull`");

const ROUTES = [
  "/", "/work", "/research", "/research/thesis", "/experience", "/certificates",
  "/learn", "/learn/all", "/about", "/contact", "/datenschutz", "/architecture",
  "/work/transport-uq", "/work/mcp-policy-gateway", "/work/medico",
  "/work/engineering-model", "/work/reliable-knowledge-systems", "/work/repositories",
  "/learn/calibration-is-not-classification-accuracy",
  "/sitemap.xml", "/robots.txt", "/rss.xml",
];

/* Must all be gone. `/impressum` is withheld by instruction, the rest are the draft. */
const MUST_404 = [
  "/impressum",
  "/work/legal-knowledge-platform",
  "/work/bp-it-legal-knowledge-platform",
  "/work/legal-kb",
  "/work/knowledge-platform",
  "/this-route-does-not-exist",
];

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
};

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  extraHTTPHeaders: { "x-vercel-trusted-oidc-idp-token": token },
});

const foreign = new Set();
ctx.on("request", (r) => {
  const host = new URL(r.url()).host;
  if (host && host !== new URL(ORIGIN).host) foreign.add(host);
});

const page = await ctx.newPage();

let bad = [];
for (const route of ROUTES) {
  const res = await page.goto(ORIGIN + route, { waitUntil: "domcontentloaded", timeout: 60000 });
  const status = res?.status() ?? 0;
  if (status !== 200) bad.push(`${route} -> ${status}`);
}
check(`all ${ROUTES.length} routes answer 200`, bad.length === 0, bad.join(", "));

bad = [];
for (const route of MUST_404) {
  const res = await page.goto(ORIGIN + route, { waitUntil: "domcontentloaded", timeout: 60000 });
  const status = res?.status() ?? 0;
  if (status !== 404) bad.push(`${route} -> ${status}`);
}
check(`the withheld pages all answer 404`, bad.length === 0, bad.join(", "));

await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
const meta = await page.evaluate(() => document.querySelector('meta[name="viewport"]')?.getAttribute("content") ?? "");
check("viewport-fit=cover is served", /viewport-fit=cover/.test(meta), meta);
check("zoom is not blocked", !/(maximum-scale|user-scalable\s*=\s*no)/.test(meta), meta);

/* The confidential draft must not be named anywhere a crawler can read. */
const sitemap = await (await ctx.request.get(`${ORIGIN}/sitemap.xml`)).text();
check("the draft is absent from the sitemap", !/legal-knowledge-platform/.test(sitemap));
check(
  "the two nav pages missing before are now in the sitemap",
  /\/experience</.test(sitemap) && /\/certificates</.test(sitemap),
);

/* The phone menu, on the deployed artefact. */
const phone = await browser.newContext({
  viewport: { width: 360, height: 780 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
  extraHTTPHeaders: { "x-vercel-trusted-oidc-idp-token": token },
});
const mob = await phone.newPage();
await mob.goto(`${ORIGIN}/work`, { waitUntil: "load" });
await mob.waitForTimeout(1500);
let opened = false;
for (let i = 0; i < 8 && !opened; i += 1) {
  await mob.locator(".rail-toggle").first().click({ timeout: 3000 }).catch(() => {});
  await mob.waitForTimeout(300);
  opened = await mob.evaluate(() => getComputedStyle(document.querySelector(".rail-sheet")).display !== "none");
}
const sheet = await mob.evaluate(() => {
  const s = document.querySelector(".rail-sheet");
  const r = s.getBoundingClientRect();
  return {
    height: Math.round(r.height),
    viewport: window.innerHeight,
    links: s.querySelectorAll("a").length,
    belowFold: Array.from(s.querySelectorAll("a")).filter((a) => a.getBoundingClientRect().bottom > window.innerHeight + 2).length,
    role: s.getAttribute("role"),
    themeButtons: s.querySelectorAll(".theme-button").length,
    docOverflow: document.documentElement.scrollWidth - window.innerWidth,
  };
});
check(
  "the phone menu opens to a full screen",
  opened && sheet.height > sheet.viewport * 0.8 && sheet.belowFold === 0,
  `sheet ${sheet.height}px of ${sheet.viewport}px, ${sheet.belowFold}/${sheet.links} links below the fold`,
);
check("the menu is a dialog with one theme control", sheet.role === "dialog" && sheet.themeButtons === 0);
check("nothing scrolls sideways on a 360px phone", sheet.docOverflow <= 1, `overflow ${sheet.docOverflow}px`);

if (SHOTS) {
  await mob.screenshot({ path: `${SHOTS}/preview-phone-menu.png` });
  await mob.evaluate(() => document.querySelector(".rail-toggle").click());
  await mob.waitForTimeout(400);
  await mob.screenshot({ path: `${SHOTS}/preview-phone-work.png`, fullPage: false });
}

/* Privacy: the deployed page must not reach a third party. Vercel's own hosts are the origin. */
const cookies = await ctx.cookies();
check("no third-party host is contacted", foreign.size === 0, [...foreign].join(", "));
check("no cookie is set", cookies.length === 0, cookies.map((c) => c.name).join(", "));

await phone.close();
await ctx.close();
await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) process.exitCode = 1;
