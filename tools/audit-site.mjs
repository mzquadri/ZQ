/**
 * Whole-site audit against a running origin.
 *
 * One pass per route per viewport, collecting the things that are only visible in a real
 * browser: console errors, failed requests, hydration mismatches, horizontal overflow, invisible
 * or clipped content, tap-target size, focus visibility, and axe violations. Written because the
 * existing tools each answer one of those and a regression usually shows up in two at once.
 *
 * It reports; it does not fix. Findings are printed grouped by severity and written to a JSON
 * file so a second run can be diffed against the first.
 *
 * Usage: node tools/audit-site.mjs <origin> [outDir] [--routes a,b,c] [--quick]
 */
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const ORIGIN = (process.argv[2] ?? "http://localhost:3400").replace(/\/$/, "");
const OUT = process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : "audit";
const argRoutes = process.argv.find((a) => a.startsWith("--routes="));
const QUICK = process.argv.includes("--quick");

const ROUTES = argRoutes
  ? argRoutes.slice("--routes=".length).split(",")
  : [
      "/",
      "/work",
      "/work/transport-uq",
      "/work/insureassist-rag",
      "/work/mlops-reference-pipeline",
      "/work/hydrology-uq",
      "/work/streamflow-forecasting",
      "/work/cifar10-cnn",
      "/work/mcp-policy-gateway",
      "/work/medico",
      "/work/reliable-knowledge-systems",
      "/architecture",
      "/research",
      "/research/thesis",
      "/learn",
      "/learn/selective-prediction-when-models-should-abstain",
      "/about",
      "/contact",
    ];

const VIEWPORTS = QUICK
  ? [{ name: "390", width: 390, height: 844, mobile: true }, { name: "1440", width: 1440, height: 900 }]
  : [
      { name: "390", width: 390, height: 844, mobile: true },
      { name: "430", width: 430, height: 932, mobile: true },
      { name: "768", width: 768, height: 1024 },
      { name: "1024", width: 1024, height: 768 },
      { name: "1440", width: 1440, height: 900 },
      { name: "1920", width: 1920, height: 1080 },
    ];

/** Console noise that is the browser's, not the page's. */
const IGNORED_CONSOLE = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /favicon\.ico/i,
];

const findings = [];
const add = (severity, route, viewport, kind, detail) =>
  findings.push({ severity, route, viewport, kind, detail });

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: Boolean(vp.mobile),
    hasTouch: Boolean(vp.mobile),
    deviceScaleFactor: 1,
  });

  for (const route of ROUTES) {
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on("console", (msg) => {
      if (msg.type() !== "error" && msg.type() !== "warning") return;
      const text = msg.text();
      if (IGNORED_CONSOLE.some((re) => re.test(text))) return;
      consoleErrors.push(`${msg.type()}: ${text}`);
    });
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    page.on("requestfailed", (request) => {
      const failure = request.failure()?.errorText ?? "";
      if (/ERR_ABORTED/.test(failure)) return;
      failedRequests.push(`${request.url()} :: ${failure}`);
    });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.url()} :: HTTP ${response.status()}`);
      }
    });

    let response;
    try {
      response = await page.goto(ORIGIN + route, { waitUntil: "networkidle", timeout: 45000 });
    } catch (error) {
      add("CRITICAL", route, vp.name, "navigation", String(error).slice(0, 200));
      await page.close();
      continue;
    }

    if (!response || !response.ok()) {
      add("CRITICAL", route, vp.name, "http", `HTTP ${response?.status()}`);
    }

    await page.waitForTimeout(450);

    for (const text of pageErrors) add("CRITICAL", route, vp.name, "js-error", text.slice(0, 240));
    for (const text of consoleErrors) add("HIGH", route, vp.name, "console", text.slice(0, 240));
    for (const text of failedRequests) add("HIGH", route, vp.name, "network", text.slice(0, 240));

    /* ---- layout, content and target measurements, all in one evaluate ---- */
    const probe = await page.evaluate(() => {
      const out = {};
      const vw = window.innerWidth;

      out.scrollWidth = document.documentElement.scrollWidth;
      out.viewport = vw;

      const overflowing = [];
      const clipped = [];
      const smallTargets = [];
      const unlabelled = [];
      const tinyText = [];

      const interactive = "a[href], button, [role='button'], input, select, textarea, summary";

      for (const el of document.querySelectorAll("*")) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none") continue;

        if (rect.right > vw + 1.5 && rect.width > 4) {
          overflowing.push(
            `${el.tagName.toLowerCase()}.${String(el.className || "").slice(0, 30)} right=${Math.round(rect.right)}`,
          );
        }
        /*
         * Text boxed smaller than its own content, which is how a label silently truncates.
         *
         * Screen-reader-only text is excluded. The standard visually-hidden pattern is a 1px
         * clipped box holding the full string, so scrollWidth always exceeds clientWidth by
         * design - it accounted for all forty of this check's first-run findings, every one of
         * them a correctly implemented figure description.
         */
        /*
         * SVG elements report 0 for scrollWidth and clientWidth in Chromium, so every <text>
         * node in a chart looked clipped. Layout overflow inside an SVG is governed by the
         * viewBox, which this check cannot see and should not guess at.
         */
        const isSvg = el.namespaceURI === "http://www.w3.org/2000/svg";

        const hiddenForSighted =
          rect.width <= 2 ||
          rect.height <= 2 ||
          cs.clipPath === "inset(50%)" ||
          cs.clip === "rect(0px, 0px, 0px, 0px)" ||
          el.closest(".visually-hidden, .sr-only") !== null;
        if (
          !hiddenForSighted &&
          !isSvg &&
          el.childElementCount === 0 &&
          el.textContent?.trim() &&
          el.scrollWidth > el.clientWidth + 2 &&
          cs.overflow !== "auto" &&
          cs.overflowX !== "auto" &&
          cs.overflow !== "scroll" &&
          cs.textOverflow !== "ellipsis"
        ) {
          clipped.push(`${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 40)}"`);
        }
      }

      for (const el of document.querySelectorAll(interactive)) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden") continue;
        /*
         * An accessible name, not just text content.
         *
         * The first version of this read el.textContent, which is empty for every input
         * element, so it reported seven correctly labelled radios and a labelled range slider
         * as unnamed while axe - which computes the name properly - reported none. A check
         * that disagrees with the authoritative one is worse than no check.
         */
        const name = (
          el.getAttribute("aria-label") ||
          (el.getAttribute("aria-labelledby") || "")
            .split(/\s+/)
            .map((ref) => document.getElementById(ref)?.textContent || "")
            .join(" ") ||
          (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent) ||
          el.closest("label")?.textContent ||
          el.getAttribute("title") ||
          el.getAttribute("alt") ||
          el.textContent ||
          ""
        ).trim();
        if (!name) {
          unlabelled.push(`${el.tagName.toLowerCase()} ${el.outerHTML.slice(0, 70)}`);
        }
        /*
         * Standalone controls only, at phone widths.
         *
         * WCAG 2.5.8 exempts a link inside a sentence, and rightly: an inline link is as tall as
         * its line box and enlarging it would break the paragraph it sits in. Without the
         * exemption this reported 137 targets, almost all of them prose links, and the handful
         * that actually matter were lost in them. A link is treated as inline when its parent
         * holds text either side of it.
         */
        /*
         * A control wrapped in a label is as big as the label. The thesis retention radios are
         * 1x1 by design, with a 103x48 label drawn around them; measuring the input reported six
         * unreachable targets that are in fact among the largest on the site.
         */
        const wrappingLabel = el.closest("label");
        const box = wrappingLabel ? wrappingLabel.getBoundingClientRect() : rect;

        const parent = el.parentElement;
        const inlineInProse =
          el.tagName === "A" &&
          parent !== null &&
          getComputedStyle(el).display.startsWith("inline") &&
          (parent.textContent || "").trim().length > (el.textContent || "").trim().length + 12;
        if (
          !inlineInProse &&
          window.innerWidth <= 500 &&
          (box.height < 24 || box.width < 24)
        ) {
          smallTargets.push(`${el.tagName.toLowerCase()} "${name.slice(0, 28)}" ${Math.round(box.width)}x${Math.round(box.height)}`);
        }
      }

      for (const el of document.querySelectorAll("p, li, span, dd, dt, figcaption, td, th")) {
        if (el.childElementCount) continue;
        const raw = el.textContent ?? "";
        if (!raw.trim()) continue;
        /*
         * Skip nodes that carry no visible glyph.
         *
         * KaTeX builds its vertical metrics out of `.vlist-s` struts: a zero-width space set at
         * 1px, one per stacked box. They are layout, not type, and they are not readable in any
         * sense the size of this check is about. Reporting fourteen of them per equation buries
         * the findings that are real, which is how a check stops being read.
         */
        if (!/[^\s​-‏﻿]/.test(raw)) continue;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size && size < 11) tinyText.push(`${Math.round(size * 10) / 10}px "${raw.trim().slice(0, 36)}"`);
      }

      out.overflowing = [...new Set(overflowing)].slice(0, 6);
      out.clipped = [...new Set(clipped)].slice(0, 6);
      out.smallTargets = [...new Set(smallTargets)].slice(0, 8);
      out.unlabelled = [...new Set(unlabelled)].slice(0, 6);
      out.tinyText = [...new Set(tinyText)].slice(0, 6);

      /* Images: natural vs rendered, alt text, and explicit dimensions. */
      out.images = [...document.querySelectorAll("img")].map((img) => ({
        src: (img.currentSrc || img.src || "").slice(-70),
        alt: img.alt,
        hasAlt: img.hasAttribute("alt"),
        natural: `${img.naturalWidth}x${img.naturalHeight}`,
        rendered: `${Math.round(img.getBoundingClientRect().width)}x${Math.round(img.getBoundingClientRect().height)}`,
        broken: img.complete && img.naturalWidth === 0,
      }));

      out.h1Count = document.querySelectorAll("h1").length;
      out.title = document.title;
      out.canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null;
      out.description = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null;
      out.ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? null;
      out.robots = document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null;
      out.skipLink = Boolean(document.querySelector(".skip-link, a[href='#main-content']"));
      out.main = document.querySelectorAll("main").length;

      /* Heading order, which axe does not always flag. */
      const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1]));
      out.headingJumps = levels.filter((l, i) => i > 0 && l - levels[i - 1] > 1).length;

      return out;
    });

    if (probe.scrollWidth > probe.viewport + 1) {
      add("HIGH", route, vp.name, "overflow", `scrollWidth ${probe.scrollWidth} > ${probe.viewport}: ${probe.overflowing.join(" | ")}`);
    }
    for (const c of probe.clipped) add("MEDIUM", route, vp.name, "clipped-text", c);
    for (const s of probe.smallTargets) add("MEDIUM", route, vp.name, "tap-target", s);
    for (const u of probe.unlabelled) add("HIGH", route, vp.name, "unlabelled-control", u);
    for (const t of probe.tinyText) add("LOW", route, vp.name, "tiny-text", t);
    for (const img of probe.images) {
      if (img.broken) add("CRITICAL", route, vp.name, "broken-image", img.src);
      if (!img.hasAlt) add("HIGH", route, vp.name, "img-no-alt", img.src);
    }
    if (probe.h1Count !== 1) add("MEDIUM", route, vp.name, "h1-count", `${probe.h1Count} h1 elements`);
    if (probe.main !== 1) add("MEDIUM", route, vp.name, "landmark", `${probe.main} <main> elements`);
    if (probe.headingJumps) add("LOW", route, vp.name, "heading-order", `${probe.headingJumps} skipped level(s)`);
    if (!probe.skipLink) add("MEDIUM", route, vp.name, "skip-link", "no skip link");
    if (!probe.canonical) add("MEDIUM", route, vp.name, "seo", "no canonical");
    else if (!probe.canonical.startsWith("https://mzquadri.de")) add("HIGH", route, vp.name, "seo", `canonical ${probe.canonical}`);
    if (!probe.description) add("MEDIUM", route, vp.name, "seo", "no meta description");
    if (!probe.ogImage) add("MEDIUM", route, vp.name, "seo", "no og:image");

    /* ---- axe ---- */
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    for (const v of violations) {
      const sev = v.impact === "critical" || v.impact === "serious" ? "HIGH" : "MEDIUM";
      add(sev, route, vp.name, `axe:${v.id}`, `${v.impact} x${v.nodes.length} - ${v.help}`);
    }

    await page.close();
  }

  await context.close();
}

await browser.close();

const order = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
findings.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));

/* Collapse a finding that repeats across viewports into one line naming the widths. */
const grouped = new Map();
for (const f of findings) {
  const key = `${f.severity}␟${f.route}␟${f.kind}␟${f.detail}`;
  if (!grouped.has(key)) grouped.set(key, { ...f, viewports: [] });
  grouped.get(key).viewports.push(f.viewport);
}

const rows = [...grouped.values()];
for (const sev of order) {
  const subset = rows.filter((r) => r.severity === sev);
  if (!subset.length) continue;
  console.log(`\n===== ${sev} (${subset.length}) =====`);
  for (const r of subset) {
    console.log(`  ${r.route.padEnd(52)} [${r.viewports.join(",")}]  ${r.kind}`);
    console.log(`      ${r.detail}`);
  }
}

await writeFile(`${OUT}/findings.json`, JSON.stringify(rows, null, 2));
console.log(
  `\n${rows.length} distinct finding(s) across ${ROUTES.length} route(s) x ${VIEWPORTS.length} viewport(s).`,
);
console.log(`Written to ${OUT}/findings.json`);
process.exit(rows.some((r) => r.severity === "CRITICAL") ? 1 : 0);
