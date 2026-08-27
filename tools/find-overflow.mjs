/**
 * Horizontal-overflow diagnostic.
 *
 * Reports every element whose box crosses the viewport edge at a given width, ranked by how far
 * it sticks out, with the ancestry needed to identify it and the measurements needed to explain
 * it. Written because a boolean assertion tells you a page overflows and nothing about why.
 *
 * The measurements chosen are the ones that actually distinguish the common causes:
 *   - right/left beyond the viewport says the element is displaced or too wide
 *   - scrollWidth > clientWidth on the element itself says its *contents* do not fit it
 *   - min-width, and the parent's grid/flex track sizing, catch the min-content floor blowout
 *   - transforms catch decoration that is drawn outside its own frame
 *
 * Usage: node tools/find-overflow.mjs <origin> <route> [width] [height]
 */
import { chromium } from "@playwright/test";

const origin = process.argv[2] ?? "http://127.0.0.1:3100";
const route = process.argv[3] ?? "/";
const width = Number(process.argv[4] ?? 320);
const height = Number(process.argv[5] ?? 800);

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width, height },
  reducedMotion: "reduce",
});
const page = await context.newPage();
await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const report = await page.evaluate(() => {
  const docEl = document.documentElement;
  const viewport = docEl.clientWidth;
  const rows = [];

  const describe = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls =
      typeof el.className === "string" && el.className.trim()
        ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}`
        : "";
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  };

  for (const el of document.querySelectorAll("*")) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    const overhangRight = rect.right - viewport;
    const overhangLeft = -rect.left;
    const contentOverflow = el.scrollWidth - el.clientWidth;
    if (overhangRight <= 0.5 && overhangLeft <= 0.5 && contentOverflow <= 1) continue;

    const style = getComputedStyle(el);
    const parent = el.parentElement;
    const parentStyle = parent ? getComputedStyle(parent) : null;

    const path = [];
    for (let n = el; n && n !== document.body; n = n.parentElement) path.push(describe(n));

    rows.push({
      el: describe(el),
      path: path.slice(0, 4).join(" < "),
      left: Math.round(rect.left * 10) / 10,
      right: Math.round(rect.right * 10) / 10,
      width: Math.round(rect.width * 10) / 10,
      overhang: Math.round(Math.max(overhangRight, overhangLeft) * 10) / 10,
      contentOverflow,
      minWidth: style.minWidth,
      transform: style.transform === "none" ? "" : style.transform,
      position: style.position,
      display: style.display,
      parentDisplay: parentStyle?.display ?? "",
      parentCols: parentStyle?.gridTemplateColumns ?? "",
      // The first ~40 characters are usually enough to recognise a long unbreakable string.
      text: (el.childElementCount === 0 ? el.textContent ?? "" : "").trim().slice(0, 40),
    });
  }

  rows.sort((a, b) => b.overhang - a.overhang || b.contentOverflow - a.contentOverflow);

  return {
    viewport,
    scrollWidth: docEl.scrollWidth,
    overflows: docEl.scrollWidth > viewport + 1,
    rows: rows.slice(0, 12),
  };
});

console.log(`\n${route} @${width}px`);
console.log(`  viewport=${report.viewport} scrollWidth=${report.scrollWidth} overflows=${report.overflows}`);
if (report.rows.length === 0) {
  console.log("  no element crosses the viewport edge");
} else {
  console.log(`\n  ${report.rows.length} candidate(s), widest overhang first:\n`);
  for (const r of report.rows) {
    console.log(`  ${r.el}`);
    console.log(`     path            ${r.path}`);
    console.log(`     left/right/w    ${r.left} / ${r.right} / ${r.width}   overhang=${r.overhang}px`);
    if (r.contentOverflow > 1) console.log(`     contents exceed box by ${r.contentOverflow}px (scrollWidth-clientWidth)`);
    if (r.minWidth !== "0px" && r.minWidth !== "auto") console.log(`     min-width       ${r.minWidth}`);
    if (r.transform) console.log(`     transform       ${r.transform}`);
    if (r.position !== "static") console.log(`     position        ${r.position}`);
    if (r.parentCols && r.parentDisplay.includes("grid")) console.log(`     parent grid     ${r.parentCols}`);
    if (r.text) console.log(`     text            ${JSON.stringify(r.text)}`);
    console.log("");
  }
}

await browser.close();
process.exit(report.overflows ? 1 : 0);
