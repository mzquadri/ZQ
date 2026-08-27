/**
 * The committed visual record.
 *
 * Full-page captures of the routes a reader actually judges the site by, at the three widths the
 * design was made for. These are checked in deliberately: a redesign that is only described in a
 * commit message cannot be reviewed later without rebuilding it.
 *
 * Usage: node tools/capture-final.mjs [outDir] [origin]
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "media/final";
const origin = process.argv[3] ?? "http://127.0.0.1:3400";
mkdirSync(out, { recursive: true });

/*
 * Everything a reader judges the site by. Home and work get all three widths because they carry
 * the most layout; the rest are checked at desktop and phone, which is where the compositions
 * genuinely differ.
 */
const ALL_WIDTHS = [
  ["1440", 1440, 900],
  ["768", 768, 1024],
  ["390", 390, 844],
];

const DESKTOP_PHONE = [
  ["1440", 1440, 900],
  ["390", 390, 844],
];

const ROUTES = [
  ["home", "/", ALL_WIDTHS],
  ["work", "/work", ALL_WIDTHS],
  ["research", "/research", DESKTOP_PHONE],
  ["about", "/about", DESKTOP_PHONE],
  ["contact", "/contact", DESKTOP_PHONE],
  ["resume", "/resume", DESKTOP_PHONE],
  ["learn", "/learn", DESKTOP_PHONE],
  ["case-transport-uq", "/work/transport-uq", DESKTOP_PHONE],
  ["case-insureassist", "/work/insureassist-rag", DESKTOP_PHONE],
  ["case-mlops", "/work/mlops-reference-pipeline", DESKTOP_PHONE],
  ["case-hydrology", "/work/hydrology-uq", DESKTOP_PHONE],
  ["case-streamflow", "/work/streamflow-forecasting", DESKTOP_PHONE],
  ["case-cifar10", "/work/cifar10-cnn", DESKTOP_PHONE],
];

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const problems = [];

for (const [name, route, widths] of ROUTES) {
  for (const [label, width, height] of widths) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
      // Reduced motion, so the capture shows the composed state rather than whatever frame the
      // scrub happened to be parked on. It is also the state that has to be readable.
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

    await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}/${label}-${name}.png`, fullPage: true });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    if (overflow) problems.push(`${route} @${label}: horizontal overflow`);
    if (errors.length) problems.push(`${route} @${label}: ${errors[0]}`);

    console.log(`${label.padStart(5)} ${route.padEnd(28)} overflow=${overflow} errors=${errors.length}`);
    await context.close();
  }
}

await browser.close();
console.log(problems.length ? `\nPROBLEMS:\n- ${problems.join("\n- ")}` : "\nclean");
