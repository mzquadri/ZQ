/**
 * Audit every route at three widths and report what is actually wrong.
 *
 *   node tools/audit-site.mjs http://localhost:3250
 *
 * Checks, in the order a reviewer would notice them:
 *
 *   overflow     anything wider than the viewport, which on a phone is the
 *                difference between a usable page and a broken one
 *   tiny text    body copy under 14px, which a recruiter on a phone will not read
 *   long lines   prose over 85 characters, which is where comprehension drops
 *   tap targets  interactive elements under 40px on the phone width
 *   images       anything that failed to load, or is served far larger than
 *                it is displayed
 *   headings     a jump in heading level, which breaks document structure
 *   links        empty or duplicate link text, which is useless to a screen
 *                reader reading a link list
 *
 * It reports rather than asserts: the output is a worklist, and judging which
 * entries matter is the job this cannot do.
 */
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3250";
const ROUTES = [
  "/", "/work", "/research", "/research/thesis", "/experience", "/certificates",
  "/learn", "/about", "/contact", "/datenschutz", "/architecture",
  "/work/transport-uq", "/work/mcp-policy-gateway", "/work/repositories",
  "/learn/calibration-is-not-classification-accuracy",
];
const WIDTHS = [
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const browser = await chromium.launch();
const findings = [];

const add = (route, width, kind, detail) => findings.push({ route, width, kind, detail });

for (const vp of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.name === "phone",
    hasTouch: vp.name === "phone",
  });

  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const broken = [];
    page.on("response", (r) => {
      if (r.status() >= 400) broken.push(`${r.status()} ${r.url().replace(base, "")}`);
    });

    try {
      await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);
    } catch (err) {
      add(route, vp.name, "load", err.message.split("\n")[0]);
      await page.close();
      continue;
    }

    for (const b of [...new Set(broken)]) add(route, vp.name, "request", b);

    const report = await page.evaluate((vw) => {
      const out = { overflow: [], tiny: [], long: [], taps: [], images: [], headings: [], links: [] };

      /* Horizontal overflow: the document itself, then the worst offenders. */
      const docW = document.documentElement.scrollWidth;
      if (docW > vw + 1) {
        out.overflow.push(`document scrolls to ${docW}px in a ${vw}px viewport`);
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.right > vw + 1 && r.left >= 0) {
            const sel = el.tagName.toLowerCase() + (el.className && typeof el.className === "string"
              ? "." + el.className.split(/\s+/).filter(Boolean).slice(0, 2).join(".") : "");
            out.overflow.push(`${sel} reaches ${Math.round(r.right)}px`);
            if (out.overflow.length > 5) break;
          }
        }
      }

      const seenTiny = new Set();
      const seenLong = new Set();
      for (const el of document.querySelectorAll("p, li, dd, dt, figcaption, span, a, h1, h2, h3")) {
        const text = (el.textContent || "").trim();
        if (!text || el.children.length > 0) continue;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        const size = parseFloat(cs.fontSize);
        const key = el.tagName + (el.className || "");

        if (size < 14 && text.length > 25 && !seenTiny.has(key)) {
          seenTiny.add(key);
          out.tiny.push(`${Math.round(size)}px: "${text.slice(0, 48)}"`);
        }
        /* Characters per line, from the box width and the rendered character width. */
        if (text.length > 90 && ["P", "LI", "DD"].includes(el.tagName) && !seenLong.has(key)) {
          const w = el.getBoundingClientRect().width;
          const ch = w / (size * 0.5);
          if (ch > 85) {
            seenLong.add(key);
            out.long.push(`${Math.round(ch)} characters: "${text.slice(0, 40)}"`);
          }
        }
      }

      /* Tap targets, phone only; the caller filters. */
      const seenTap = new Set();
      for (const el of document.querySelectorAll("a, button, input, summary, [role=button]")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (getComputedStyle(el).display === "none") continue;
        if (r.height < 40) {
          const label = (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 32);
          const key = `${el.tagName}:${label}`;
          if (seenTap.has(key)) continue;
          seenTap.add(key);
          out.taps.push(`${Math.round(r.width)}x${Math.round(r.height)} "${label}"`);
        }
      }

      for (const img of document.querySelectorAll("img")) {
        const r = img.getBoundingClientRect();
        if (!img.complete || img.naturalWidth === 0) {
          out.images.push(`failed: ${img.getAttribute("src")?.slice(0, 70)}`);
          continue;
        }
        if (r.width > 0 && img.naturalWidth > r.width * 2.4) {
          out.images.push(
            `oversized: ${img.naturalWidth}px natural for ${Math.round(r.width)}px shown, ${img.getAttribute("src")?.slice(0, 54)}`,
          );
        }
        if (!img.getAttribute("alt") && img.getAttribute("aria-hidden") === null) {
          out.images.push(`no alt: ${img.getAttribute("src")?.slice(0, 60)}`);
        }
      }

      const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]);
      const h1s = levels.filter((l) => l === 1).length;
      if (h1s !== 1) out.headings.push(`${h1s} h1 elements`);
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1) {
          out.headings.push(`h${levels[i - 1]} followed by h${levels[i]}`);
          break;
        }
      }

      const texts = new Map();
      for (const a of document.querySelectorAll("a[href]")) {
        const t = (a.textContent || "").trim().toLowerCase();
        if (!t) {
          if (!a.getAttribute("aria-label")) out.links.push(`empty link to ${a.getAttribute("href")}`);
          continue;
        }
        const href = a.getAttribute("href");
        if (!texts.has(t)) texts.set(t, new Set());
        texts.get(t).add(href);
      }
      for (const [t, hrefs] of texts) {
        if (hrefs.size > 1 && t.length < 30) {
          out.links.push(`"${t}" points at ${hrefs.size} different places`);
        }
      }

      return out;
    }, vp.width);

    for (const o of report.overflow) add(route, vp.name, "overflow", o);
    for (const t of report.tiny) add(route, vp.name, "tiny text", t);
    for (const l of report.long) add(route, vp.name, "long line", l);
    if (vp.name === "phone") for (const t of report.taps) add(route, vp.name, "tap target", t);
    if (vp.name === "desktop") {
      for (const i of report.images) add(route, vp.name, "image", i);
      for (const h of report.headings) add(route, vp.name, "headings", h);
      for (const l of report.links) add(route, vp.name, "links", l);
    }

    await page.close();
  }
  await ctx.close();
}

await browser.close();

if (findings.length === 0) {
  console.log("clean: nothing found at any width");
} else {
  const byKind = new Map();
  for (const f of findings) {
    if (!byKind.has(f.kind)) byKind.set(f.kind, []);
    byKind.get(f.kind).push(f);
  }
  for (const [kind, list] of [...byKind].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n${kind.toUpperCase()}  (${list.length})`);
    for (const f of list.slice(0, 14)) {
      console.log(`  ${f.route.padEnd(30)} ${f.width.padEnd(8)} ${f.detail}`);
    }
    if (list.length > 14) console.log(`  ... and ${list.length - 14} more`);
  }
  console.log(`\n${findings.length} findings in total`);
}
