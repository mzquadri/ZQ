/**
 * Screenshot a protected Vercel preview, light and dark.
 *
 *   node tools/shoot-preview.mjs https://zq-xxxx.vercel.app out/dir / /research
 *
 * Deployment Protection is on, so an unauthenticated request gets a login page
 * rather than the site. The short-lived development OIDC token authenticates
 * the browser as the caller, attached as an origin-scoped request header. The
 * token is read from the environment and never printed, logged or written into
 * a file by this script.
 */
import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";

const base = process.argv[2];
const out = process.argv[3] ?? "tools/shots/preview";
const routes = process.argv.slice(4);
if (!base) {
  console.error("usage: node tools/shoot-preview.mjs <url> <outDir> [routes...]");
  process.exit(1);
}
if (routes.length === 0) routes.push("/");

/*
 * The target is checked before the token is anywhere near a request.
 *
 * This script holds a credential and attaches it to outgoing requests, so the
 * destination is not something to take on trust from argv. A typo or a pasted
 * wrong URL would otherwise send the token to whatever host was named.
 */
let targetOrigin;
try {
  const parsed = new URL(base);
  const okHost = parsed.hostname === "localhost" || parsed.hostname.endsWith(".vercel.app");
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
    throw new Error(`refusing to send a token over ${parsed.protocol}`);
  }
  if (!okHost) throw new Error(`refusing to send a token to ${parsed.hostname}`);
  targetOrigin = parsed.origin;
} catch (err) {
  console.error(`bad target: ${err.message}`);
  process.exit(1);
}

// Read from the pulled development env rather than requiring it be exported.
let token = process.env.VERCEL_OIDC_TOKEN;
if (!token) {
  try {
    const raw = await readFile(".env.vercel.local", "utf8");
    token = raw.match(/^VERCEL_OIDC_TOKEN="?([^"\n]+)"?/m)?.[1];
  } catch {
    /* fall through to the error below */
  }
}
if (!token) {
  console.error("No VERCEL_OIDC_TOKEN. Run: npx vercel env pull .env.vercel.local --yes");
  process.exit(1);
}

await mkdir(out, { recursive: true });
const browser = await chromium.launch();

for (const theme of ["light", "dark"]) {
  const ctx = await browser.newContext({
    colorScheme: theme,
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
  });

  /*
   * The token goes to the preview origin and nowhere else.
   *
   * `extraHTTPHeaders` on the context was the obvious way to do this and it is
   * wrong: it attaches the header to every request the context makes, so any
   * third-party resource the page pulls would receive the credential. This site
   * requests nothing off-origin, which `tools/check-no-third-party.mjs` checks,
   * but that is a property of the site today and not a guarantee this tool
   * should rely on. Routing lets the destination be checked per request.
   */
  await ctx.route("**/*", (route) => {
    const request = route.request();
    if (new URL(request.url()).origin === targetOrigin) {
      return route.continue({
        headers: { ...request.headers(), "x-vercel-trusted-oidc-idp-token": token },
      });
    }
    return route.continue();
  });
  for (const route of routes) {
    const page = await ctx.newPage();
    const bad = [];
    page.on("response", (r) => {
      if (r.status() >= 400) bad.push(`${r.status()} ${r.url().slice(0, 100)}`);
    });
    await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2600);

    const title = await page.title();
    const name = route === "/" ? "home" : route.replace(/\//g, "-").replace(/^-/, "");
    await page.screenshot({ path: `${out}/${name}-${theme}.png`, fullPage: true });
    console.log(`  ${name}-${theme}  "${title.slice(0, 54)}"`);
    for (const b of [...new Set(bad)]) console.log(`     ${b}`);
    await page.close();
  }
  await ctx.close();
}

await browser.close();
