/**
 * The four journeys the site is actually judged on, driven as a browser rather than asserted
 * against the DOM.
 *
 * Each step clicks what a reader would click and checks where it landed. That is the difference
 * that matters: a link can exist, be visible, have the right text, and still go nowhere useful.
 *
 * Usage: node tools/check-journeys.mjs <origin>
 */
import { chromium } from "@playwright/test";

const ORIGIN = (process.argv[2] ?? "http://localhost:3403").replace(/\/$/, "");
const ARCHITECTURE = "https://mzquadri.github.io/ai-engineering-portfolio";

let failures = 0;
const ok = (label, detail = "") => console.log(`    ok    ${label}${detail ? "  -- " + detail : ""}`);
const bad = (label, detail) => {
  console.log(`    FAIL  ${label}  -- ${detail}`);
  failures += 1;
};
const check = (cond, label, detail) => (cond ? ok(label, cond === true ? "" : String(cond)) : bad(label, detail));

const browser = await chromium.launch();

/* --------------------------------------------------------------------------- recruiter --- */
{
  console.log("\n== Recruiter: who is this, what have they done, how do I reach them ==");
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(ORIGIN + "/", { waitUntil: "networkidle" });

  const firstView = await page.evaluate(() => {
    const h = window.innerHeight;
    const seen = (re) =>
      [...document.querySelectorAll("h1, p, span, a")].some((el) => {
        const r = el.getBoundingClientRect();
        return r.top < h && r.bottom > 0 && re.test(el.textContent || "");
      });
    return {
      name: seen(/Mohd\s*Zamin\s*Quadri|MohdZaminQuadri/),
      role: seen(/AI\/ML Engineer|AI Engineer/),
      location: seen(/Munich/),
      cv: seen(/Curriculum vitae/i),
      work: seen(/Examine the work|Selected work/i),
      architecture: seen(/architecture/i),
    };
  });
  for (const [key, value] of Object.entries(firstView)) {
    check(value, `first viewport shows ${key}`, "not visible above the fold");
  }

  await page.getByRole("link", { name: /Curriculum vitae/i }).first().click({ trial: true });
  const cvHref = await page.getByRole("link", { name: /Curriculum vitae/i }).first().getAttribute("href");
  check(cvHref === "/mohd-zamin-quadri-cv.pdf", "hero CV link points at the canonical PDF", cvHref);

  const cv = await page.request.get(ORIGIN + "/mohd-zamin-quadri-cv.pdf");
  check(cv.status() === 200, "CV downloads", `HTTP ${cv.status()}`);
  check((cv.headers()["content-type"] || "").includes("pdf"), "CV is served as a PDF", cv.headers()["content-type"]);

  await page.goto(ORIGIN + "/contact", { waitUntil: "networkidle" });
  const mailto = await page.locator('a[href^="mailto:"]').first().getAttribute("href");
  const shown = (await page.locator('a[href^="mailto:"]').first().innerText()).trim();
  check(mailto === "mailto:mohdzaminquadri@gmail.com", "contact mailto is the approved address", mailto);
  check(shown.includes("mohdzaminquadri@gmail.com"), "the address shown matches the address linked", shown);
  for (const [name, host] of [["LinkedIn", "linkedin.com"], ["GitHub", "github.com"]]) {
    const href = await page.locator(`.contact-links a[href*="${host}"]`).first().getAttribute("href");
    check(Boolean(href), `contact offers ${name}`, "missing");
  }
  await page.close();
}

/* ----------------------------------------------------------------------------- interview --- */
{
  console.log("\n== Interview: portfolio to architecture without going through GitHub by hand ==");
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(ORIGIN + "/", { waitUntil: "networkidle" });

  await page.getByRole("link", { name: /Explore the architecture/i }).first().click();
  await page.waitForURL(/\/architecture$/, { timeout: 15000 });
  ok("hero action reaches /architecture");

  const outbound = await page.locator(`a[href^="${ARCHITECTURE}"]`).evaluateAll((els) =>
    els.map((el) => ({ href: el.getAttribute("href"), text: (el.textContent || "").trim().slice(0, 44) })),
  );
  check(outbound.length >= 5, "the gateway offers every route into the case studies", `${outbound.length} links`);
  for (const target of ["#legal", "#trust", "#contributions"]) {
    check(
      outbound.some((l) => l.href.endsWith(target)),
      `deep link to ${target}`,
      "absent",
    );
  }
  for (const link of outbound) {
    const response = await page.request.get(link.href);
    check(response.status() === 200, `outbound ${link.href.slice(-28)}`, `HTTP ${response.status()}`);
  }
  await page.close();
}

/* ------------------------------------------------------------------------------ research --- */
{
  console.log("\n== Research: a professor looking for the thesis and the method ==");
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(ORIGIN + "/research", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: /research record|thesis/i }).first().click();
  await page.waitForURL(/\/research\/thesis$/, { timeout: 15000 });
  ok("research index reaches the thesis record");

  const text = await page.locator("main").innerText();
  check(
    /Uncertainty Quantification for Machine Learning Models in Transportation Policy Analysis/i.test(text),
    "the thesis title is the one on the submitted document",
    "title not found",
  );
  check(/submitted/i.test(text), "status says submitted, not conferred", "status wording missing");
  check(!/\bgraduated\b|degree awarded/i.test(text), "no conferral claim", "found a conferral claim");
  /* The page heads this section "Scientific limits"; the first spelling of this check looked for
   * "limitations" and reported a missing section that has been there all along. */
  check(
    /scientific limits|what this thesis does not establish/i.test(text),
    "limits are stated",
    "no limits section",
  );
  await page.close();
}

/* ----------------------------------------------------------------------- direct project --- */
{
  console.log("\n== Direct link: a project page opened cold, with no homepage context ==");
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })).newPage();
  await page.goto(ORIGIN + "/work/transport-uq", { waitUntil: "networkidle" });
  const probe = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent?.trim() ?? "",
    hasNav: Boolean(document.querySelector("header.rail")),
    hasBackToWork: Boolean(document.querySelector('a[href="/work"], a[href^="/work#"]')),
    hasFooterContact: Boolean(document.querySelector('footer a[href^="mailto:"]')),
  }));
  check(probe.h1.length > 8, "the page names itself in an h1", probe.h1);
  check(probe.hasNav, "navigation is present on a cold entry", "no rail");
  check(probe.hasBackToWork, "a way back to the index", "no link to /work");
  check(probe.hasFooterContact, "contact is reachable from the foot of the page", "no mailto in footer");
  await page.close();
}

/* --------------------------------------------------------------------------- 404 + misc --- */
{
  console.log("\n== Error states and metadata ==");
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const response = await page.goto(ORIGIN + "/definitely-not-a-real-route-12345", { waitUntil: "networkidle" });
  check(response.status() === 404, "an unknown route returns 404", `HTTP ${response.status()}`);
  const body = await page.locator("body").innerText();
  check(/Mohd Zamin Quadri|MZQ/i.test(body), "the 404 is branded, not a framework default", "no identity on the page");
  check(Boolean(await page.locator('a[href="/"], a[href="/work"]').count()), "the 404 offers a way back", "no links");
  await page.close();
  await context.close();
}

await browser.close();
console.log(failures ? `\n${failures} journey check(s) failed` : "\nAll journey checks passed.");
process.exit(failures ? 1 : 0);
