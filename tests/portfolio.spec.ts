import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { ecosystemRepositories } from "../src/content/ecosystem";
import { WORLD_ORDER } from "../src/components/cinema/project-worlds";
import { SCENES } from "../src/components/sequence/scenes";

const routes = [
  "/",
  "/work",
  "/work/engineering-model",
  "/research",
  "/research/thesis",
  "/about",
  "/contact",
  "/learn",
  "/learn/selective-prediction-when-models-should-abstain",
  "/learn/topic/uncertainty-quantification",
  "/learn/level/applied",
  "/work/transport-uq",
  "/work/insureassist-rag",
  "/work/mlops-reference-pipeline",
  "/work/hydrology-uq",
  "/work/cifar10-cnn",
  "/work/streamflow-forecasting",
  "/work/mcp-policy-gateway",
  "/work/legal-knowledge-platform",
];

for (const route of routes) {
  test(`${route} renders a complete accessible document`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(/Mohd Zamin Quadri/);
    await expect(page.locator("footer")).toBeVisible();

    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflows).toBe(false);
    expect(consoleErrors).toEqual([]);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

/** At phone width the rail's links live in the sheet, which is the mobile navigation. */
async function openNavIfCollapsed(page: import("@playwright/test").Page) {
  const toggle = page.getByRole("button", { name: /Menu|Close/ });
  if (await toggle.isVisible()) await toggle.click();
}

test("primary navigation and project routes work", async ({ page }) => {
  await page.goto("/");
  await openNavIfCollapsed(page);
  await page.getByRole("link", { name: "Work", exact: true }).first().click();
  await expect(page).toHaveURL(/\/work$/);
  /* The index names a project by its finding; the registry title is on the case study itself. */
  await page.getByRole("link", { name: /When can a surrogate stand in for a simulation\?/ }).first().click();
  await expect(page).toHaveURL(/\/work\/transport-uq$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Reliable GNN");
});

test("keyboard users can skip navigation and reach the primary links", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Mohd Zamin Quadri, home" })).toBeFocused();
  await page.keyboard.press("Tab");

  const toggle = page.getByRole("button", { name: /Menu|Close/ });
  if (await toggle.isVisible()) {
    // Phone width: the third stop is the sheet toggle, and opening it must move focus inside.
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator(".rail-sheet a").first()).toBeFocused();
    // Escape must close it and hand focus back to the control that opened it.
    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
  } else {
    await expect(page.getByRole("link", { name: "Work", exact: true })).toBeFocused();
  }

  await page.getByRole("link", { name: "Skip to main content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("mobile primary navigation meets minimum target sizing", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 640, "Mobile viewport only");
  await page.goto("/");

  // The rail collapses into a sheet at this width; that is where the targets have to be big.
  await page.getByRole("button", { name: "Menu" }).click();
  const links = await page.locator(".rail-sheet a").all();
  expect(links.length).toBeGreaterThan(0);
  for (const link of links) {
    const box = await link.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test("contact route exposes approved channels", async ({ page }) => {
  /*
   * Email is a channel; a phone number, a form and a CV download are not. The distinction the
   * site draws is between a published professional address and a private identifier, and the CV
   * has since been withdrawn, so the channels are the address and the two profiles.
   */
  await page.goto("/contact");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator(`.contact-links a[href="mailto:mohdzaminquadri@gmail.com"]`)).toBeVisible();
  await expect(page.locator(`.contact-links a[href="https://www.linkedin.com/in/mohdzaminquadri/"]`)).toBeVisible();
  await expect(page.locator(`.contact-links a[href="https://github.com/mzquadri"]`)).toBeVisible();
});

test("legacy drive route redirects permanently to the work index", async ({ page, request }) => {
  const response = await request.get("/drive", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(await response.text()).toContain("NEXT_REDIRECT;replace;/work;308;");

  await page.goto("/drive");
  await expect(page).toHaveURL(/\/work$/);
});

test("metadata endpoints and security headers are production-ready", async ({ request }) => {
  const home = await request.get("/");
  expect(home.status()).toBe(200);
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  expect(home.headers()["x-frame-options"]).toBe("DENY");
  expect(home.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap: https://mzquadri.de/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapText = await sitemap.text();
  for (const route of routes) expect(sitemapText).toContain(`https://mzquadri.de${route === "/" ? "" : route}`);

  const image = await request.get("/opengraph-image");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");

  const projectImage = await request.get("/work/transport-uq/opengraph-image");
  expect(projectImage.status()).toBe(200);
  expect(projectImage.headers()["content-type"]).toContain("image/png");

  const articleImage = await request.get("/learn/selective-prediction-when-models-should-abstain/opengraph-image");
  expect(articleImage.status()).toBe(200);
  expect(articleImage.headers()["content-type"]).toContain("image/png");

  for (const route of ["/research/opengraph-image", "/research/thesis/opengraph-image"]) {
    const researchImage = await request.get(route);
    expect(researchImage.status()).toBe(200);
    expect(researchImage.headers()["content-type"]).toContain("image/png");
  }

  const rss = await request.get("/rss.xml");
  expect(rss.status()).toBe(200);
  expect(rss.headers()["content-type"]).toContain("application/rss+xml");
  const rssText = await rss.text();
  expect(rssText).toContain("<rss version=\"2.0\">");
  expect(rssText).toContain("/learn/selective-prediction-when-models-should-abstain");

  const missingProject = await request.get("/work/not-an-evidence-backed-project");
  expect(missingProject.status()).toBe(404);
  const missingProjectHtml = await missingProject.text();
  expect(missingProjectHtml).toContain("This route does not exist.");
  expect(missingProjectHtml).toContain('name="robots" content="noindex, nofollow"');

  const missingArticle = await request.get("/learn/not-a-published-article");
  expect(missingArticle.status()).toBe(404);

  for (const route of ["/research/experiments", "/research/publications"]) {
    const emptyResearchBranch = await request.get(route);
    expect(emptyResearchBranch.status()).toBe(404);
    expect(sitemapText).not.toContain(`https://mzquadri.de${route}`);
  }
});

test("canonical and structured metadata are present", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://mzquadri.de");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/opengraph-image/);
  const jsonLd = page.locator('script[type="application/ld+json"]');
  expect(await jsonLd.count()).toBeGreaterThanOrEqual(2);
  for (const script of await jsonLd.allTextContents()) expect(() => JSON.parse(script)).not.toThrow();

  const routeMetadata = [
    ["/work", "Selected Work"],
    ["/research", "Research"],
    ["/research/thesis", "Transport Surrogate Thesis Research"],
    ["/about", "About"],
    ["/contact", "Contact"],
        ["/learn", "Learn"],
    ["/learn/selective-prediction-when-models-should-abstain", "Selective Prediction: When Models Should Abstain"],
    ["/work/transport-uq", "Reliable GNN Surrogates for Transport Policy Analysis"],
    ["/work/insureassist-rag", "InsureAssist: A Measured RAG Benchmark"],
    ["/work/mlops-reference-pipeline", "A Testable End-to-End MLOps Pipeline"],
    ["/work/hydrology-uq", "Uncertainty Quantification in Hydrology"],
    ["/work/cifar10-cnn", "CIFAR-10 CNN: A Reproducible Baseline"],
    ["/work/streamflow-forecasting", "Synthetic Streamflow Forecasting Benchmark"],
  ] as const;

  for (const [route, title] of routeMetadata) {
    await page.goto(route);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://mzquadri.de${route}`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://mzquadri.de${route}`);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", title);
  }

  for (const [route] of routeMetadata.filter(([route]) => route.startsWith("/work/"))) {
    await page.goto(route);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      `https://mzquadri.de${route}/opengraph-image`,
    );
    const image = await page.request.get(`${route}/opengraph-image`);
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toContain("image/png");
  }

  for (const route of ["/research", "/research/thesis"]) {
    await page.goto(route);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      `https://mzquadri.de${route}/opengraph-image`,
    );
  }
});

test("research index and thesis record preserve their distinct evidence roles", async ({ page }) => {
  await page.goto("/research");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("decisions that expose uncertainty");
  await expect(page.locator(".supporting-research-grid aside").getByText("Emerging inquiry", { exact: true })).toBeVisible();
  await expect(page.getByText(/direction of study, not a completed result/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore the thesis research/ })).toHaveAttribute("href", "/research/thesis");
  let records = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((record) => JSON.parse(record));
  const collection = records.find((record) => record["@type"] === "CollectionPage");
  expect(collection.mainEntity.numberOfItems).toBe(1);
  expect(collection.mainEntity.itemListElement[0].item["@type"]).toBe("Thesis");

  await page.goto("/research/thesis");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Uncertainty Quantification");
  await expect(page.getByRole("figure", { name: /How does an expensive transport simulation/ })).toBeVisible();
  await expect(page.getByRole("figure", { name: /Which reliability question/ })).toBeVisible();
  await expect(page.getByRole("figure", { name: /A useful model should know when not to be trusted/ })).toBeVisible();
  await expect(page.getByRole("table", { name: "All six observed operating points" }).locator("tbody tr")).toHaveCount(6);
  await expect(page.getByText("No random-review baseline is shown", { exact: false })).toBeVisible();

  records = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((record) => JSON.parse(record));
  const thesisRecord = records.find((record) => record["@type"] === "Thesis");
  expect(thesisRecord.name).toContain("Uncertainty Quantification");
  expect(thesisRecord.creativeWorkStatus).toContain("submitted");
  expect(thesisRecord.mainEntityOfPage).toBe("https://mzquadri.de/research/thesis");
  expect(thesisRecord.doi).toBeUndefined();
  expect(thesisRecord.publication).toBeUndefined();
});

test("selective prediction explorer changes only between audited operating points", async ({ page }) => {
  await page.goto("/research/thesis");
  await page.getByRole("radio", { name: "25%" }).check();
  const status = page.getByRole("status");
  await expect(status).toContainText("1.79 veh/h");
  await expect(status).toContainText("2,372,625");
  await expect(page.locator('.selective-table tr[data-selected="true"]')).toContainText("25%");

  await page.getByRole("radio", { name: "100%" }).check();
  await expect(status).toContainText("3.95 veh/h");
  await expect(status).toContainText("0.0%");
});

test("technical writing renders code, equations, navigation, and Article structured data", async ({ page }) => {
  await page.goto("/learn/selective-prediction-when-models-should-abstain");
  await expect(page.getByRole("navigation", { name: "On this page" })).toBeVisible();
  await expect(page.locator("pre code")).toContainText("risk_coverage_curve");
  await expect(page.locator(".katex-display")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "Risk and coverage", exact: true })).toHaveAttribute("id", "risk-and-coverage");
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute("content", /2026-08-20/);
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute(
    "href",
    "https://mzquadri.de/rss.xml",
  );

  const records = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((record) => JSON.parse(record));
  const article = records.find((record) => record["@type"] === "TechArticle");
  expect(article.headline).toBe("Selective Prediction: When Models Should Abstain");
  expect(article.about[0].url).toBe("https://mzquadri.de/work/transport-uq");
});

test("no CV or resume is downloadable", async ({ page, request }) => {
  /*
   * The portfolio published a generated, web-safe CV for a while, and it has been withdrawn. This
   * asserts the withdrawal rather than the publication: nothing is served at the path it used, no
   * page links to one, and the private filenames that were purged from this repository long ago
   * stay unreachable.
   *
   * The facts the document carried are not in question here. They are rendered as pages - roles
   * and periods, education, the thesis, certifications, languages - and validated elsewhere.
   */
  for (const gone of [
    "/mohd-zamin-quadri-cv.pdf",
    "/mohd-zamin-quadri-resume.pdf",
    "/Mohd_Zamin_Quadri_CV.pdf",
    "/cv.pdf",
    "/resume.pdf",
  ]) {
    const response = await request.get(gone, { maxRedirects: 0 });
    expect(response.status(), `${gone} must not be served`).toBe(404);
  }

  for (const path of ["/", "/about", "/contact", "/work", "/research"]) {
    await page.goto(path);
    await expect(
      page.locator('a[href$=".pdf"], a[download]'),
      `${path} still offers a document download`,
    ).toHaveCount(0);
    const text = await page.locator("body").innerText();
    expect(text, `${path} still invites a CV download`).not.toMatch(
      /download\s+(my\s+)?(cv|resume|résumé)/i,
    );
  }
})

test("the architecture case studies are reachable from the site", async ({ page }) => {
  /*
   * The case-study site is the strongest single artifact in this portfolio and was, for a while,
   * linked from nowhere on it. The navigation entry and the gateway page are what fixed that, so
   * both are asserted rather than left to drift.
   */
  await page.goto("/");
  /* On phones the links live in the sheet, so the entry is asserted wherever it is rendered. */
  await expect(page.locator('header.rail a[href="/architecture"]').first()).toHaveCount(1);

  await page.goto("/architecture");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const outbound = page.locator('a[href^="https://mzquadri.github.io/ai-engineering-portfolio"]');
  expect(await outbound.count(), "the gateway must offer every route into the case studies").toBeGreaterThanOrEqual(5);
})

test("case studies expose ownership and direct evidence", async ({ page }) => {
  await page.goto("/work/transport-uq");
  await expect(page.getByText("Researcher and thesis author", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Corrigendum/ })).toBeVisible();
  const fullRetentionCy = Number(
    await page.locator('.chart-points g[data-retention="100"] circle').getAttribute("cy"),
  );
  expect(fullRetentionCy, "3.95 MAE must plot below the 4.0 grid line").toBeGreaterThan(73);
  expect(fullRetentionCy, "Selective-risk points must remain above the zero baseline").toBeLessThan(262);

  await page.goto("/work/mlops-reference-pipeline");
  await expect(page.getByText("Project author and engineer", { exact: true })).toBeVisible();
  await expect(page.getByRole("figure", { name: /Reference lifecycle/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Automated tests/ })).toBeVisible();
});

test("the MLOps case study publishes the released reference run, not the retired one", async ({ page }) => {
  await page.goto("/work/mlops-reference-pipeline");
  const body = page.locator("main");

  // Held-out numbers, always next to the baseline that gives them scale.
  await expect(body).toContainText("0.8067");
  await expect(body).toContainText("ROC-AUC 0.8795");
  await expect(body).toContainText("0.5000");
  await expect(body).toContainText("CC BY 4.0");
  await expect(body).toContainText("99 tests");

  // The milestone completed by the upstream release must not still read as future work.
  await expect(body).not.toContainText(/licensed-data run/i);
  await expect(page.locator(".next-step")).toContainText("Slice-aware evaluation");

  // Limitations stay visible rather than being quietly dropped once there is a result.
  const limitations = body.getByRole("heading", { name: "Where the evidence stops" });
  await expect(limitations).toBeVisible();
  await expect(body).toContainText("600 held-out test rows");
  await expect(body).toContainText("never carried production traffic");

  // Evidence links are pinned to the released commit, not to a floating branch.
  const pinned = page.locator('a[href*="ada5465993295a9dd4d995846b77852d1fc4de5e"]');
  expect(await pinned.count()).toBeGreaterThanOrEqual(4);
  await expect(
    page.locator('main a[href*="MLOps-End-to-End-Pipeline/tree/main"], main a[href*="MLOps-End-to-End-Pipeline/blob/main"]'),
  ).toHaveCount(0);
});

test("the repository index and homepage stay concise about MLOps", async ({ page }) => {
  await page.goto("/work");
  const index = page.locator('[data-showcase="index"]');
  const card = index.getByRole("heading", { name: /Testable End-to-End MLOps Pipeline/ });
  await expect(card).toBeVisible();
  await expect(index).toContainText("licensed dataset");

  // Detail belongs in the case study; the index must not restate the metric table.
  await expect(index).not.toContainText("ROC-AUC");

  await page.goto("/");
  const main = page.locator("main");
  // The homepage is an index now: it offers the project and says what kind of thing it is, and
  // the evidence lives one click away. None of the case study's table may appear here.
  await expect(main.getByRole("link", { name: /An unqualified model cannot reach release/ })).toHaveAttribute(
    "href",
    "/work/mlops-reference-pipeline",
  );
  await expect(main).not.toContainText(/licensed-data run/i);
  await expect(main).not.toContainText("0.8067");
  await expect(main).not.toContainText("1,800 / 600 / 600");
  await expect(main).not.toContainText("Byte-identical");
  await expect(main).not.toContainText("99 tests");
});

/**
 * Names the elements that cross the viewport edge, for the assertion message.
 *
 * A boolean tells you a page overflows and nothing about why, which turns a narrow-viewport
 * regression into an archaeology exercise - especially when it only reproduces on CI. This runs in
 * the page and returns enough to identify and explain each offender: where its box actually is,
 * whether its own contents are what will not fit, and the grid track and min-width that are the
 * usual causes.
 *
 * Deliberately defensive: it is a diagnostic, and a diagnostic that throws replaces a useful
 * failure with a useless one.
 */
async function describeOverflow(page: import("@playwright/test").Page) {
  try {
    return await page.evaluate(() => {
      const docEl = document.documentElement;
      const viewport = docEl.clientWidth;
      const name = (el: Element) => {
        const id = el.id ? `#${el.id}` : "";
        const cls =
          typeof el.className === "string" && el.className.trim()
            ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}`
            : "";
        return `${el.tagName.toLowerCase()}${id}${cls}`;
      };

      const rows: string[] = [];
      for (const el of Array.from(document.querySelectorAll("*"))) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;

        const overhang = rect.right - viewport;
        const contents = el.scrollWidth - el.clientWidth;
        if (overhang <= 0.5 && rect.left >= -0.5 && contents <= 1) continue;

        const style = getComputedStyle(el);
        const parentStyle = el.parentElement ? getComputedStyle(el.parentElement) : null;
        const path: string[] = [];
        for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) path.push(name(n));

        const detail = [
          `left=${Math.round(rect.left)}`,
          `right=${Math.round(rect.right)}`,
          `w=${Math.round(rect.width)}`,
          `overhang=${Math.round(overhang)}px`,
          contents > 1 ? `contentsExceedBoxBy=${contents}px` : "",
          style.position !== "static" ? `position=${style.position}` : "",
          style.minWidth !== "0px" && style.minWidth !== "auto" ? `min-width=${style.minWidth}` : "",
          style.transform !== "none" ? `transform=${style.transform}` : "",
          parentStyle?.display.includes("grid") ? `parentCols=${parentStyle.gridTemplateColumns}` : "",
        ].filter(Boolean);

        rows.push(`${path.slice(0, 4).join(" < ")}\n        ${detail.join(" ")}`);
      }

      return {
        viewport,
        scrollWidth: docEl.scrollWidth,
        offenders: rows.slice(0, 10),
      };
    });
  } catch (error) {
    return { viewport: -1, scrollWidth: -1, offenders: [`diagnostic failed: ${String(error)}`] };
  }
}

test("core recruiter routes reflow at 320 pixels", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const route of ["/", "/work", "/work/mlops-reference-pipeline", "/work/legal-knowledge-platform", "/research", "/research/thesis", "/learn", "/learn/selective-prediction-when-models-should-abstain"]) {
    await page.goto(route);
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

    // Only measured when it has already gone wrong, so the passing path stays fast.
    const report = overflows ? await describeOverflow(page) : null;
    const message = report
      ? `${route} must not overflow at 320px\n` +
        `      viewport=${report.viewport} scrollWidth=${report.scrollWidth}\n` +
        `      offending elements (widest overhang first):\n      - ${report.offenders.join("\n      - ")}`
      : `${route} must not overflow at 320px`;

    expect(overflows, message).toBe(false);
  }
});

test("group coursework structured data credits every author", async ({ page }) => {
  await page.goto("/work/hydrology-uq");
  const records = await page.locator('script[type="application/ld+json"]').allTextContents();
  const creativeWork = records.map((record) => JSON.parse(record)).find((record) => record["@type"] === "CreativeWork");

  expect(creativeWork.creator).toBeUndefined();
  expect(creativeWork.author).toEqual([
    { "@type": "Person", name: "Mohd Zamin Quadri", url: "https://github.com/mzquadri" },
    { "@type": "Person", name: "Christine Leers", url: "https://github.com/chrLeers" },
    { "@type": "Person", name: "Yihan Shen", url: "https://github.com/warumso7" },
  ]);
  expect(creativeWork.creditText).toContain("Group contributor");
  expect(creativeWork.sourceOrganization.name).toBe("Technical University of Munich");
});

test("homepage makes no third-party requests", async ({ page }) => {
  const remoteRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== "http://127.0.0.1:3100") remoteRequests.push(url.origin);
  });
  await page.goto("/");
  // Anchored on the closing section so the check runs against a fully rendered page.
  await expect(page.locator(".cine-closing")).toBeVisible();
  expect(remoteRequests).toEqual([]);
});

test("the systems graph paints in 3D on desktop and falls back below it", async ({ page }) => {
  await page.goto("/work/engineering-model");
  const graph = page.locator("#systems-graph");
  const canvas = graph.locator("canvas");
  const isDesktop = (page.viewportSize()?.width ?? 0) >= 760;

  await expect(graph).toHaveAttribute("data-mode", isDesktop ? "interactive" : "static");

  if (isDesktop) {
    await expect(canvas).toBeVisible();
    // The projection must actually reach the canvas, not leave an empty box behind the fallback.
    const painted = await canvas.evaluate((element: HTMLCanvasElement) => {
      const context = element.getContext("2d");
      if (!context || element.width === 0) return false;
      const { data } = context.getImageData(0, 0, element.width, element.height);
      for (let index = 3; index < data.length; index += 4) {
        if (data[index] !== 0) return true;
      }
      return false;
    });
    expect(painted, "the 3D graph must render visible geometry").toBe(true);
  } else {
    await expect(canvas).toBeHidden();
  }

  // The stage list carries the same information in either mode.
  for (const label of ["Data", "GNN", "RAG", "Agents", "MLOps", "Reliable AI"]) {
    await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible();
  }
});

test("systems graph selection is keyboard operable and never overclaims", async ({ page }) => {
  await page.goto("/work/engineering-model");
  const detail = page.locator("#systems-graph [aria-live='polite']");
  await expect(detail).toContainText("Reliable AI");

  const rag = page.getByRole("button", { name: "RAG", exact: true });
  await rag.focus();
  await page.keyboard.press("Enter");
  await expect(rag).toHaveAttribute("aria-pressed", "true");
  await expect(detail).toContainText("Evidenced");
  await expect(detail.getByRole("link", { name: /See the evidence/ })).toHaveAttribute(
    "href",
    "/work/insureassist-rag",
  );

  // A direction of study must not present itself as delivered work.
  const agents = page.getByRole("button", { name: "Agents", exact: true });
  await agents.click();
  await expect(agents).toHaveAttribute("aria-pressed", "true");
  await expect(detail).toContainText("Direction");
  await expect(detail).toContainText("No public project yet");
  await expect(detail.getByRole("link")).toHaveCount(0);
});

test("the repository index catalogues public work beyond the case studies", async ({ page }) => {
  await page.goto("/work");
  const index = page.locator('[data-showcase="index"]');
  await expect(index).toBeVisible();

  for (const category of ["Featured", "Active", "Research", "Experiment", "Reference"]) {
    await expect(index.getByRole("heading", { name: category, exact: true })).toBeVisible();
  }

  /*
   * Every public repository, not a selection - forks and learning exercises included, because an
   * index that quietly drops the unflattering entries is making a claim of its own.
   *
   * Asserted against the content module rather than a literal, so publishing a repository means
   * adding one entry rather than also editing a number here. The failure this still catches is
   * the one that matters: the rendered index disagreeing with the audited list.
   */
  const repositoryLinks = index.locator('a[href^="https://github.com/mzquadri/"]');
  await expect(repositoryLinks).toHaveCount(ecosystemRepositories.length);

  await expect(
    index.locator('a[href="https://github.com/mzquadri/Battery-SOC-Estimation-ML"]'),
  ).toBeVisible();
  await expect(index.getByText(/renders identically if GitHub is unavailable/)).toBeVisible();

  // No fabricated activity metrics, and no activity dates either.
  await expect(index.getByText(/\d+\s*(stars?|forks?|watchers?|contributions?)/i)).toHaveCount(0);
  await expect(index.getByText(/last\s+(public\s+)?commit|last\s+active/i)).toHaveCount(0);
});

/*
 * The exploded-repository showcase that used to open this section is gone, and with it the only
 * WebGL surface on /work. It was a mapping of strings the registry already held, rendered as an
 * assembly above the plain index of the same repositories - so the page said everything twice,
 * and said the less useful version first. What replaced it is the index that was underneath.
 */
test("the repository index carries the record with no 3D layer left on the page", async ({ page }) => {
  await page.goto("/work");

  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator('[data-showcase="flagship"]')).toHaveCount(0);

  const index = page.locator('[data-showcase="index"]');
  await expect(index.getByRole("link", { name: /Reliable GNN Surrogates for Transport Policy/ })).toBeVisible();
  await expect(index.getByText(/Last public commit/)).toHaveCount(0);
});

test("generated topic and level routes are reachable and honest when empty", async ({ page }) => {
  await page.goto("/learn/topic/uncertainty-quantification");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Uncertainty Quantification");
  await expect(page.getByText("1 published piece on this topic.")).toBeVisible();
  await expect(page.locator(".writing-grid article")).toHaveCount(1);

  // A vocabulary entry with nothing published still has a route, and says so plainly
  // rather than rendering an empty grid.
  await page.goto("/learn/topic/graph-neural-networks");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Graph Neural Networks");
  await expect(page.getByText(/Nothing is published on this topic yet/)).toBeVisible();
  await expect(page.locator(".writing-grid")).toHaveCount(0);

  await page.goto("/learn/level/applied");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Applied");
  await expect(page.locator(".writing-grid article")).toHaveCount(1);
});

test("the filter interface stays hidden at one published article", async ({ page }) => {
  await page.goto("/learn");
  // The single-feature layout, not the grid.
  await expect(page.locator(".writing-feature")).toHaveCount(1);
  await expect(page.locator(".writing-grid")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Latest tutorial" })).toBeVisible();
});

test("the arXiv listing is unmistakably other people's work", async ({ page }) => {
  await page.goto("/learn");
  const feed = page.locator(".research-feed");
  await expect(feed).toBeVisible();
  await expect(feed.getByRole("heading", { name: "Recent work by others in these areas" })).toBeVisible();
  await expect(feed).toContainText("These papers are not mine");
  await expect(feed).toContainText("Thank you to arXiv");

  // Every entry names its real authors and links to arXiv by identifier.
  const items = feed.locator("li");
  expect(await items.count()).toBeGreaterThan(0);
  for (const item of await items.all()) {
    await expect(item.locator(".research-feed-authors")).not.toBeEmpty();
    await expect(item.locator("a")).toHaveAttribute("href", /^https:\/\/arxiv\.org\/abs\//);
    await expect(item).toContainText(/arXiv:/);
  }

  // It sits below the authored writing and never appears on the homepage.
  await page.goto("/");
  await expect(page.locator(".research-feed")).toHaveCount(0);
});

test("article pages carry topic and level chips and a pager", async ({ page }) => {
  await page.goto("/learn/selective-prediction-when-models-should-abstain");
  const chips = page.locator(".article-chips a");
  await expect(chips).toHaveCount(2);
  await expect(chips.first()).toHaveAttribute("href", "/learn/topic/uncertainty-quantification");
  await expect(chips.last()).toHaveAttribute("href", "/learn/level/applied");
  await expect(page.getByRole("navigation", { name: "On this page" })).toBeVisible();
});

test("/learn makes no third-party requests", async ({ page }) => {
  const remote: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== "http://127.0.0.1:3100") remote.push(url.origin);
  });
  await page.goto("/learn");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  expect(remote).toEqual([]);
});

test("the portfolio presents no chronology it cannot source", async ({ page }) => {
  /*
   * The work is still presented by what it does rather than by when it happened, and project year
   * badges are still gone. What changed is employment: each role now carries the period the CV
   * gives it, so the assertion moved from "no range appears" to "every range that appears is one
   * of the five approved ones". A date invented in a component fails exactly as before.
   */
  const APPROVED = new Set([
    "Apr 2025 - Present",
    "Aug 2023 - Mar 2024",
    "Jan 2023 - Jun 2023",
    "Apr 2022 - Dec 2022",
    "May 2021 - Jul 2021",
  ]);

  for (const path of ["/", "/work", "/work/transport-uq", "/about"]) {
    await page.goto(path);
    const text = await page.locator("main").innerText();
    const ranges =
      text.match(
        /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+20\d{2}\s*[-–]\s*(?:Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+20\d{2})/g,
      ) ?? [];
    for (const range of ranges) {
      expect(APPROVED.has(range.replace(/\s*[-–]\s*/, " - ")), `${path} shows an unapproved range: ${range}`).toBe(true);
    }
  }

  await page.goto("/work");
  /* The index used to badge every project with a year beside its classification. */
  for (const meta of await page.locator(".project-meta").allInnerTexts()) {
    expect(meta, "a project is still badged with a year").not.toMatch(/20\d{2}/);
  }
})

test("published writing adds no client-side third-party requests", async ({ page }) => {
  const remoteRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== "http://127.0.0.1:3100") remoteRequests.push(url.origin);
  });
  await page.goto("/learn/selective-prediction-when-models-should-abstain");
  expect(remoteRequests).toEqual([]);
});

test("research thesis adds no third-party requests", async ({ page }) => {
  const remoteRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== "http://127.0.0.1:3100") remoteRequests.push(url.origin);
  });
  await page.goto("/research/thesis");
  expect(remoteRequests).toEqual([]);
});

test("the confidential case study publishes no source, and says why", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Stored is not the same as correct");
  await expect(page.getByText("Engineer on the verification, ingestion and reporting services")).toBeVisible();

  // The hero explains the missing repository button rather than leaving a reader to notice it.
  await expect(page.locator(".case-confidential")).toContainText("The source cannot be shown");
  await expect(page.getByRole("link", { name: /Inspect repository/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Source and documentation/ })).toHaveCount(0);

  // No link anywhere on the page may point at a repository host.
  const hrefs = await page.locator("main a[href]").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href") ?? ""),
  );
  expect(hrefs.filter((href) => /github\.com|gitea|gitlab/i.test(href))).toEqual([]);
});

test("the confidential case study omits codeRepository from its structured data", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  // The page also carries the site-wide Person and WebSite blocks; the case study is CreativeWork.
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const parsed = blocks.map((block) => JSON.parse(block) as Record<string, unknown>);
  const creativeWork = parsed.find((block) => block["@type"] === "CreativeWork");
  expect(creativeWork, "the case study must emit CreativeWork structured data").toBeDefined();
  expect("codeRepository" in creativeWork!).toBe(false);
  expect(creativeWork!.genre).toBe("Employer engineering");
  expect(JSON.stringify(parsed)).not.toContain("github.com/mzquadri/legal");
});

test("the confidential case study keeps the seven-section case-study grammar", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  const indexes = await page.locator(".case-section .section-index span").allTextContents();
  // No inspection-points section, so the template renumbers quality and limitations to 05 and 06.
  expect(indexes).toEqual(["01", "02", "03", "04", "05", "06"]);
  await expect(page.getByRole("heading", { name: "Where the evidence stops" })).toBeVisible();
});

test("the confidential case study renders every static figure without JavaScript state", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  for (const name of [
    /same total, what has that established/,
    /who is allowed to write each part/,
    /what happens to what is already stored/,
    /what does it leave open/,
  ]) {
    await expect(page.getByRole("figure", { name })).toBeVisible();
  }

  // Terminal states are server-rendered, so every disposition is present before any motion work.
  for (const disposition of ["retained", "added", "replaced", "pruned"]) {
    await expect(page.locator(`.legal-convergence li[data-disposition="${disposition}"]`)).toHaveCount(1);
  }
  await expect(page.locator(".legal-ladder li")).toHaveCount(7);
  await expect(page.locator(".legal-states dl > div")).toHaveCount(5);
});

test("the confidential case study publishes no corpus scale", async ({ page }) => {
  const caseStudyYear = "2026";
  await page.goto("/work/legal-knowledge-platform");
  /*
   * Read the page as a visitor does, minus the template's own numbering: section indices and
   * workflow step numbers are chrome that every case study carries. What is left is this
   * project's words, where illustrative quantities are spelled out, so any remaining numeral
   * other than the year would be a disclosure of employer scale.
   */
  const text = await page.locator("main").evaluate((main) => {
    const clone = main.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".section-index span, .workflow-list > li > span").forEach((el) => el.remove());
    return clone.innerText ?? clone.textContent ?? "";
  });
  // The publication year is the one numeral the template is expected to render.
  const numerals = (text.match(/\d{2,}/g) ?? []).filter((numeral) => numeral !== caseStudyYear);
  expect(numerals, `unexpected numerals: ${numerals.join(", ")}`).toEqual([]);
  // Scoped to its own figure: the showpiece now precedes it, so "first" is a different note.
  await expect(page.locator(".legal-count-figure .figure-note")).toContainText("Illustrative");
});

test("the confidential case study appears in the work index alongside the public ones", async ({ page }) => {
  await page.goto("/work");
  /*
   * It has no world of its own, so it reaches the index through the registry rather than through
   * the flagship order. That path is the one worth asserting: a draft that the publication gate
   * allows must still be reachable, or it is reviewable only by reading the file.
   */
  const card = page.locator('a[href="/work/legal-knowledge-platform"]');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText("Stored is not the same as correct");
  await expect(card).toContainText("Employer engineering");
});

test("the confidential case study makes no third-party requests", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") external.push(request.url());
  });
  await page.goto("/work/legal-knowledge-platform", { waitUntil: "networkidle" });
  expect(external).toEqual([]);
});

/*
 * Phase 2 - the enhanced visual layer.
 *
 * Both Playwright projects run with reducedMotion: "reduce", which is deliberately the hardest
 * case for these tests: it is the path where no scene ever animates, so anything asserted below
 * is being read out of server-rendered markup rather than out of a finished animation.
 */

test("the confidential case study keeps its meaning without motion", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");

  // Reduced motion must leave every stage at its terminal state, not at its first frame.
  for (const stage of [".legal-count-stage", ".legal-fanout-stage", ".legal-generations", ".legal-ladder-stage"]) {
    await expect(page.locator(stage)).toHaveAttribute("data-terminal", "");
  }

  // The record every scene stands on is present regardless.
  await expect(page.locator(".legal-ladder li")).toHaveCount(7);
  await expect(page.locator(".legal-states dl > div")).toHaveCount(5);
  await expect(page.locator(".legal-convergence li")).toHaveCount(4);
  for (const disposition of ["retained", "added", "replaced", "pruned"]) {
    await expect(page.locator(`.legal-convergence li[data-disposition="${disposition}"]`)).toHaveCount(1);
  }
});

test("the three generations are named in the accessible tree, not only drawn", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  for (const name of ["Retained source evidence", "Previous current state", "New current state"]) {
    await expect(page.getByRole("region", { name })).toBeVisible();
  }
  // Depth is presentation. Every unit label is real text on every plane.
  await expect(page.locator(".legal-generation")).toHaveCount(3);
  await expect(page.locator('.legal-generation[data-generation="current"] li')).toHaveCount(6);
});

test("the WebGL layer stays off where it should and takes nothing with it", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");

  // Reduced motion is one of the four gates, so the canvas must not mount in either project.
  await expect(page.locator(".vector-space-canvas")).toHaveAttribute("data-mode", "static");
  await expect(page.locator("canvas")).toHaveCount(0);

  // And three.js must not have been fetched for a card that never rendered.
  const scripts = await page.locator("script[src]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("src") ?? ""),
  );
  const fetched = await Promise.all(
    scripts.map(async (src) => {
      const response = await page.request.get(new URL(src, page.url()).toString());
      const body = await response.body();
      return { src, size: body.byteLength, text: body.toString("utf8") };
    }),
  );
  const total = fetched.reduce((sum, chunk) => sum + chunk.size, 0);

  /*
   * A size ceiling is a proxy for the thing that actually matters, and a proxy drifts: a
   * dependency bump can carry it past the line while no renderer is anywhere near this
   * route. So name the renderer directly, and attach the per-chunk breakdown to both
   * assertions -- a budget that trips without saying which chunk grew is a puzzle, not a
   * signal.
   *
   * That distinction earned itself on 2 Sep 2026. The 900 kB ceiling began failing on a
   * commit that had passed the day before, with the repository unchanged: 953,657 bytes,
   * then 902,094 on a retry of the same run. Chunking is not byte-stable across runs, and
   * the same build measures 739,143 on Node 20 locally against ~900-950 kB on the Node 24
   * runner. The renderer assertion passed throughout, which is what established the growth
   * was dependency weight rather than three.js reaching a route that mounts no canvas.
   *
   * Hence 1.2 MB: above the observed spread with room to drift, and still far below what a
   * leaked renderer costs. The three.js chunk alone is ~855 kB, so a real leak lands near
   * 1.8 MB and trips this immediately.
   */
  const carriesRenderer = fetched.filter((chunk) =>
    /THREE\.WebGLRenderer|WebGLRenderer|three\.module/.test(chunk.text),
  );
  const breakdown = [...fetched]
    .sort((a, b) => b.size - a.size)
    .map((chunk) => `  ${String(chunk.size).padStart(8)}  ${chunk.src}`)
    .join("\n");

  expect(
    carriesRenderer.map((chunk) => chunk.src),
    `a route script carries the 3D renderer.\n${breakdown}`,
  ).toEqual([]);
  expect(
    total,
    `no route script may be large enough to contain a 3D renderer.\n${breakdown}`,
  ).toBeLessThan(1_200_000);

  // The card still says what the points would have said.
  await expect(page.getByText("One embedded record per active unit", { exact: false })).toBeVisible();
});

test("every representation card is reachable and operable from the keyboard", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  const cards = page.locator(".legal-fanout-grid article");
  await expect(cards).toHaveCount(3);

  for (const representation of ["relational", "vector", "reference"]) {
    const card = page.locator(`.legal-fanout-grid article[data-representation="${representation}"]`);
    await card.focus();
    await expect(card).toBeFocused();
    // Focus must not be the only thing that reveals the explanation.
    await expect(card.locator("dt", { hasText: "Written by" })).toBeVisible();
    await expect(card.locator("dt", { hasText: "Checked against" })).toBeVisible();
  }
});

test("a result is never told apart by colour alone", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  // Each of the five results carries a distinct mark as well as a tone, and its own words.
  await expect(page.locator(".legal-state-mark")).toHaveCount(5);
  const tones = await page.locator(".legal-state-mark").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-tone")),
  );
  expect(new Set(tones).size).toBeGreaterThan(1);
  for (const name of ["Measured", "Verified and current", "Unsupported", "Stale", "Failed"]) {
    await expect(page.locator(".legal-states dt", { hasText: name })).toHaveCount(1);
  }
});

test("the enhanced case study still publishes no source and no scale", async ({ page }) => {
  const caseStudyYear = "2026";
  await page.goto("/work/legal-knowledge-platform");

  // Canvas hosts must carry no label that could leak content, and must be hidden from the tree
  // because the DOM beside them already says it.
  await expect(page.locator(".vector-space-canvas")).toHaveAttribute("aria-hidden", "true");

  const text = await page.locator("main").evaluate((main) => {
    const clone = main.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".section-index span, .workflow-list > li > span").forEach((el) => el.remove());
    return clone.innerText ?? clone.textContent ?? "";
  });
  const numerals = (text.match(/\d{2,}/g) ?? []).filter((numeral) => numeral !== caseStudyYear);
  expect(numerals, `unexpected numerals: ${numerals.join(", ")}`).toEqual([]);

  const hrefs = await page.locator("main a[href]").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href") ?? ""),
  );
  expect(hrefs.filter((href) => /github\.com|gitea|gitlab/i.test(href))).toEqual([]);
});

/*
 * Phase 3 - the guided walkthrough.
 *
 * These assert state transitions and focus, never elapsed time. Both projects run reduced-motion,
 * so the run here is the stepped one: no smooth scrolling, no animated transitions, and every
 * scene jumping straight to the state the table names.
 */

const LAUNCH = "2-minute walkthrough";

/** The driver and state each scene is currently under, keyed by its stage class. */
async function sceneDrivers(page: import("@playwright/test").Page) {
  return page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll("[data-driver]")].map((el) => [
        el.className.split(" ")[0],
        `${el.getAttribute("data-driver")}:${el.getAttribute("data-step")}`,
      ]),
    ),
  );
}

test("the walkthrough is offered where the repository link would be", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  const launcher = page.getByRole("button", { name: LAUNCH });
  await expect(launcher).toBeVisible();
  await expect(page.locator(".legal-launcher")).toContainText("about two minutes");
  // It is offered, not imposed: nothing runs until it is pressed.
  await expect(page.locator(".legal-dock")).toHaveCount(0);
});

test("no other case study carries a walkthrough", async ({ page }) => {
  await page.goto("/work/insureassist-rag");
  await expect(page.getByRole("button", { name: LAUNCH })).toHaveCount(0);
  await expect(page.locator(".legal-dock")).toHaveCount(0);
});

test("starting hands every scene to the controller and stops when it exits", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");

  const before = await sceneDrivers(page);
  for (const value of Object.values(before)) expect(value).toContain("scroll:");

  await page.getByRole("button", { name: LAUNCH }).click();
  await expect(page.locator(".legal-dock")).toBeVisible();
  await expect(page.locator(".legal-dock-count")).toHaveText("1 / 8");

  const during = await sceneDrivers(page);
  for (const value of Object.values(during)) expect(value).toContain("walkthrough:");

  await page.getByRole("button", { name: "Exit" }).click();
  await expect(page.locator(".legal-dock")).toHaveCount(0);

  // Every scene settles at its terminal state rather than being left part-played.
  const after = await sceneDrivers(page);
  expect(after).toEqual(before);
});

test("next and previous step whole chapters, deterministically", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  await page.getByRole("button", { name: LAUNCH }).click();

  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator(".legal-dock-count")).toHaveText("2 / 8");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator(".legal-dock-count")).toHaveText("4 / 8");

  const atFour = await sceneDrivers(page);
  expect(atFour[".legal-fanout-stage".slice(1)]).toBe("walkthrough:4");

  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.locator(".legal-dock-count")).toHaveText("3 / 8");

  // Returning to step 4 must produce exactly the picture it produced the first time.
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator(".legal-dock-count")).toHaveText("4 / 8");
  expect(await sceneDrivers(page)).toEqual(atFour);

  await page.keyboard.press("Escape");
});

test("the walkthrough is fully keyboard operable and restores focus on exit", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  const launcher = page.getByRole("button", { name: LAUNCH });
  await launcher.focus();
  await page.keyboard.press("Enter");

  // Focus moves into the guided region once, on start.
  await expect(page.locator(".legal-dock")).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".legal-dock-count")).toHaveText("2 / 8");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".legal-dock-count")).toHaveText("1 / 8");

  // Space toggles playback rather than scrolling the page. Stepping with the arrows has already
  // yielded control, so the assertion is that the label flips, not that it starts in one state.
  const playToggle = page.locator(".legal-dock-controls button").nth(1);
  const before = await playToggle.innerText();
  await page.keyboard.press(" ");
  await expect(playToggle).not.toHaveText(before);
  await page.keyboard.press(" ");
  await expect(playToggle).toHaveText(before);

  await page.keyboard.press("Escape");
  await expect(page.locator(".legal-dock")).toHaveCount(0);
  await expect(launcher).toBeFocused();
});

test("the run completes, offers a restart, and never traps the reader", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  await page.getByRole("button", { name: LAUNCH }).click();

  for (let index = 0; index < 8; index += 1) await page.keyboard.press("ArrowRight");

  await expect(page.locator(".legal-dock-caption")).toContainText("Walkthrough complete");
  await expect(page.getByRole("button", { name: "Restart" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Exit" })).toBeVisible();

  await page.getByRole("button", { name: "Restart" }).click();
  await expect(page.locator(".legal-dock-count")).toHaveText("1 / 8");

  await page.keyboard.press("Escape");
});

test("entering and leaving repeatedly leaves no scene stuck", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  const settled = await sceneDrivers(page);

  for (let round = 0; round < 3; round += 1) {
    await page.getByRole("button", { name: LAUNCH }).click();
    await expect(page.locator(".legal-dock-count")).toHaveText("1 / 8");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    await expect(page.locator(".legal-dock")).toHaveCount(0);
    expect(await sceneDrivers(page), `round ${round}`).toEqual(settled);
  }
});

test("guided mode stays accessible and publishes nothing new", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  await page.getByRole("button", { name: LAUNCH }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  // The dock is a labelled region with real buttons, not a canvas with a keyboard trap.
  await expect(page.getByRole("region", { name: "Guided walkthrough" })).toBeVisible();
  await expect(page.locator(".legal-dock-controls button")).toHaveCount(4);

  // Reading is still possible: the page underneath keeps its semantic content.
  await expect(page.locator(".legal-ladder li")).toHaveCount(7);
  await expect(page.locator(".legal-states dl > div")).toHaveCount(5);

  const captions = await page.locator(".legal-dock-caption").innerText();
  expect(captions.replace(/\b[18]\b/g, "").match(/\d{2,}/g)).toBeNull();

  await page.keyboard.press("Escape");
});

test("guided mode works at mobile width without covering what it explains", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work/legal-knowledge-platform");
  await page.getByRole("button", { name: LAUNCH }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflows).toBe(false);

  // Controls stay thumb-sized.
  for (const name of ["Previous", "Next", "Exit"]) {
    const box = await page.getByRole("button", { name, exact: true }).boundingBox();
    expect(box!.height, `${name} is too small to tap`).toBeGreaterThanOrEqual(40);
  }

  // The stage being explained is not hidden behind the dock.
  const dock = (await page.locator(".legal-dock").boundingBox())!;
  const stage = (await page.locator(".legal-fanout-stage").boundingBox())!;
  expect(stage.y, "the explained stage must start above the dock").toBeLessThan(dock.y);

  // Every state of the run, including the closing one, has to stay inside the viewport. The
  // ending's recede once stepped sideways and put a scrollbar on a 390px screen.
  for (let index = 0; index < 8; index += 1) await page.keyboard.press("ArrowRight");
  await expect(page.locator(".legal-dock-caption")).toContainText("Walkthrough complete");
  const overflowsAtEnd = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflowsAtEnd, "the completion state must not overflow at mobile width").toBe(false);

  await page.keyboard.press("Escape");
});

/*
 * Phase 3.5 - the ending, the resume behaviour, and the contract a recorder will drive.
 */

test("the run publishes its position on the document element", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  const root = page.locator("html");
  await expect(root).not.toHaveAttribute("data-walkthrough", /.*/);

  await page.getByRole("button", { name: LAUNCH }).click();
  await expect(root).toHaveAttribute("data-walkthrough", "running");
  await expect(root).toHaveAttribute("data-walkthrough-step", "problem");
  await expect(root).toHaveAttribute("data-walkthrough-beat", "0");

  // Every step id is reachable in order, which is what a recorder will step through.
  const ids = ["source", "representations", "measurement", "change", "confidence", "contribution", "lesson"];
  for (const id of ids) {
    await page.keyboard.press("ArrowRight");
    await expect(root).toHaveAttribute("data-walkthrough-step", id);
  }

  await page.keyboard.press("Escape");
  await expect(root).not.toHaveAttribute("data-walkthrough", /.*/);
  await expect(root).not.toHaveAttribute("data-walkthrough-step", /.*/);
});

test("the contribution step marks the column it is talking about", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  const column = page.locator(".two-column-copy > div").last();
  const plain = await column.evaluate((el) => getComputedStyle(el).borderLeftColor);

  await page.getByRole("button", { name: LAUNCH }).click();
  for (let index = 0; index < 6; index += 1) await page.keyboard.press("ArrowRight");
  await expect(page.locator("html")).toHaveAttribute("data-walkthrough-step", "contribution");

  // A retrying assertion, because the mark arrives on a transition: reading the computed value
  // once races the paint rather than testing anything real.
  await expect(column).toHaveCSS("border-left-color", "rgb(0, 109, 101)");

  // The other column is left alone: this is a mark, not a spotlight that dims the page.
  const problem = page.locator(".two-column-copy > div").first();
  await expect(problem).toHaveCSS("border-left-color", plain);
  await expect(problem).toBeVisible();

  await page.keyboard.press("Escape");
});

test("the closing annotation is part of the page, not of the walkthrough", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  // It reads correctly with no guided run at all: an ink rule for what was measured, a dashed
  // rule for what was withdrawn.
  await expect(page.locator(".legal-closing-row")).toHaveCount(2);
  await expect(page.locator('.legal-closing-row[data-mark="measurement"]')).toContainText("still valid");
  await expect(page.locator('.legal-closing-row[data-mark="interpretation"]')).toContainText("Withdrawn");

  const styles = await page.locator(".legal-closing-row").evaluateAll((rows) =>
    rows.map((row) => getComputedStyle(row).borderLeftStyle),
  );
  expect(styles).toEqual(["solid", "dashed"]);
});

test("the final beat withdraws the interpretation and leaves the measurement where it is", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  await page.getByRole("button", { name: LAUNCH }).click();
  for (let index = 0; index < 7; index += 1) await page.keyboard.press("ArrowRight");
  await expect(page.locator("html")).toHaveAttribute("data-walkthrough-step", "lesson");

  const measurement = page.locator('.legal-closing-row[data-mark="measurement"]');
  const interpretation = page.locator('.legal-closing-row[data-mark="interpretation"]');
  const before = {
    measurement: (await measurement.boundingBox())!.x,
    interpretation: (await interpretation.boundingBox())!.x,
    interpretationY: (await interpretation.boundingBox())!.y,
  };

  // Play into the closing beat.
  await page.keyboard.press(" ");
  await expect(page.locator("html")).toHaveAttribute("data-walkthrough-beat", "1", { timeout: 15000 });

  const after = {
    measurement: (await measurement.boundingBox())!.x,
    interpretation: (await interpretation.boundingBox())!.x,
    interpretationY: (await interpretation.boundingBox())!.y,
  };
  expect(after.measurement, "the measurement must not move").toBe(before.measurement);
  // The recede steps sideways where there is room and downward where there is not, so the
  // assertion is that it moved at all - and that the measurement beside it did not.
  const moved =
    after.interpretation > before.interpretation || after.interpretationY > before.interpretationY;
  expect(moved, "the interpretation must step back").toBe(true);

  // Both stay readable: withdrawal is a position and an edge, never a fade.
  await expect(interpretation).toBeVisible();
  await expect(interpretation).toContainText("re-measured");

  await page.keyboard.press("Escape");
});

test("pressing Play after scrolling away brings the step back into view", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  await page.getByRole("button", { name: LAUNCH }).click();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("html")).toHaveAttribute("data-walkthrough-step", "representations");

  const target = page.locator(".legal-fanout-grid");
  await page.mouse.wheel(0, 3000);
  await page.waitForTimeout(300);

  const away = (await target.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(away.y + away.height, "precondition: the target should be off screen").toBeLessThan(0);

  // Autoplay is already stopped by the wheel; pressing Play resumes and re-frames.
  await page.getByRole("button", { name: "Play" }).click();
  await page.waitForTimeout(1200);

  const back = (await target.boundingBox())!;
  expect(back.y, "the step's target must be back in the viewport").toBeGreaterThan(0);
  expect(back.y).toBeLessThan(viewport.height);

  await page.keyboard.press("Escape");
});

test("a long reflection is set as a paragraph rather than as display type", async ({ page }) => {
  await page.goto("/work/legal-knowledge-platform");
  const quote = page.locator(".case-learning blockquote");
  await expect(quote).toHaveAttribute("data-length", "long");
  const size = await quote.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

  await page.goto("/work/insureassist-rag");
  const short = page.locator(".case-learning blockquote");
  await expect(short).not.toHaveAttribute("data-length", /.*/);
  const shortSize = await short.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

  expect(size, "a paragraph-length quote must not use the display size").toBeLessThan(shortSize);
});

/*
 * The public systems showcase, and the line between it and the confidential case study.
 */

test("the public systems showcase renders on its own page", async ({ page }) => {
  await page.goto("/work/engineering-model");

  await expect(page.getByRole("heading", { name: /One source\. Several representations/ })).toBeVisible();
  await expect(page.locator(".systems-badge")).toContainText("Illustrative system model");

  // Three parallel views, each named and each stating what it is checked by.
  const cards = page.locator(".systems-grid article");
  await expect(cards).toHaveCount(3);
  for (const name of ["Structured data", "Vector space", "Knowledge graph"]) {
    await expect(page.locator(".systems-grid .systems-name", { hasText: name })).toHaveCount(1);
  }

  // The three generations, and the four dispositions.
  for (const name of ["Retained history", "Previous state", "Current state"]) {
    await expect(page.getByRole("region", { name })).toBeVisible();
  }
  for (const disposition of ["retained", "added", "replaced", "pruned"]) {
    await expect(page.locator(`.systems-dispositions li[data-disposition="${disposition}"]`)).toHaveCount(1);
  }

  // Every figure is complete at rest, which is what reduced motion leaves it at.
  for (const stage of [".systems-stage", ".systems-count-stage", ".systems-generations", ".systems-ladder-stage"]) {
    await expect(page.locator(stage)).toHaveAttribute("data-terminal", "");
  }
});

test("the showcase itself names no employer, domain, or private system", async ({ page }) => {
  await page.goto("/work/engineering-model");

  /*
   * Scoped to the showcase. The work index legitimately lists the confidential draft in a local
   * build - that is how it gets reviewed - and its absence from a production build is asserted
   * separately, against a production build, in the confidential suite.
   */
  const text = (await page.locator(".systems-showcase").innerText()).toLowerCase();
  for (const term of ["legal", "statute", "corpus", "bp-it", "bp-itcs", "gesetze", "celex", "verification gate"]) {
    expect(text, `the showcase mentions "${term}"`).not.toContain(term);
  }

  // And nothing inside it links to the draft, whatever the index happens to list.
  const hrefs = await page.locator(".systems-showcase a[href]").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href") ?? ""),
  );
  expect(hrefs.filter((href) => href.includes("legal-knowledge"))).toEqual([]);
});

test("the showcase keeps WebGL gated and asks nothing of a third party", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") external.push(request.url());
  });

  await page.goto("/work/engineering-model", { waitUntil: "networkidle" });

  // Both projects run reduced-motion, which is one of the four gates, so no canvas may mount.
  await expect(page.locator(".systems-showcase .vector-space-canvas")).toHaveAttribute("data-mode", "static");
  await expect(page.locator(".systems-showcase canvas")).toHaveCount(0);
  // The card still says what the points would have shown.
  await expect(
    page.locator(".systems-grid article[data-representation='vectors']"),
  ).toContainText("One embedding per record");

  expect(external).toEqual([]);
});

test("the showcase is keyboard operable and stays inside a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work/engineering-model");

  for (const representation of ["records", "vectors", "graph"]) {
    const card = page.locator(`.systems-grid article[data-representation="${representation}"]`);
    await card.focus();
    await expect(card).toBeFocused();
    await expect(card.locator("dt", { hasText: "Checked by" })).toBeVisible();
  }

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflows).toBe(false);
});

/*
 * The privacy boundary is not only about what is rendered.
 *
 * A client component that imports the content module ships the whole module, so a draft can reach
 * the browser in a JavaScript chunk while never appearing in any HTML. That happened once, when
 * the navigation became a client component and pulled the project list in for three strings. This
 * asserts the boundary where it actually failed: every script the browser is told to download.
 */
test("no script the browser loads contains confidential content", async ({ page }) => {
  const scripts: string[] = [];
  page.on("response", (response) => {
    const type = response.headers()["content-type"] ?? "";
    if (type.includes("javascript")) scripts.push(response.url());
  });

  for (const route of ["/", "/work", "/about", "/research", "/contact"]) {
    await page.goto(route, { waitUntil: "networkidle" });
  }

  expect(scripts.length, "no scripts were observed, so this test proves nothing").toBeGreaterThan(0);

  const offenders: string[] = [];
  for (const url of [...new Set(scripts)]) {
    const body = await (await page.request.get(url)).text();
    for (const marker of ["legal-knowledge-platform", "Stored is not the same as correct"]) {
      if (body.includes(marker)) offenders.push(`${marker} in ${url.split("/").pop()}`);
    }
  }

  expect(offenders, "confidential content reached a client bundle").toEqual([]);
});

/* ============================================================================================
 * The medico world
 *
 * This project has no trained weights and no published metrics, so the tests that matter most are
 * the ones that check the site has not quietly invented either. The rest guard the same contract
 * every world has: the renderer stays behind its gates, the meaning stays in the DOM, and the
 * page never overflows a narrow phone.
 * ========================================================================================== */

test("the medico route renders and states what it is", async ({ page }) => {
  const response = await page.goto("/work/medico");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Uncertain is not negative/i);
  await expect(page.locator(".world-stage")).toHaveCount(1);
});

test("the four boundaries are on the page, not buried in a footer", async ({ page }) => {
  await page.goto("/work/medico");
  /*
   * Scoped past the opening figure. The scene drawn at the top of this route captions itself
   * "synthetic film. no patient data, no finding.", which is a truthful line and not the boundary
   * list - and an unscoped text match found that SVG label instead of the list this test is about.
   */
  const prose = page.locator("article");
  for (const boundary of [
    "No trained weights",
    "No patient data",
    "No held-out metrics",
    "No clinical validation",
  ]) {
    await expect(
      prose.getByText(boundary, { exact: false }).filter({ visible: true }).first(),
    ).toBeVisible();
  }
  /* The prohibition itself, in the repository's own terms. */
  await expect(page.getByText(/must not be used for diagnosis/i)).toBeVisible();
});

test("medico makes no clinical claim and publishes no accuracy", async ({ page }) => {
  await page.goto("/work/medico");
  const text = (await page.locator("main, article").first().innerText()).toLowerCase();

  /* Marketing language this project has no standing to use. */
  for (const forbidden of ["ai doctor", "ai radiologist", "diagnoses", "clinically validated", "fda"]) {
    expect(text, `medico must not claim "${forbidden}"`).not.toContain(forbidden);
  }

  /*
   * No metric may appear, because none exists in the repository. Catches "AUC 0.84", "94%
   * accuracy" and the like rather than banning digits outright - the page legitimately carries
   * label counts, hyperparameters and dataset sizes.
   */
  const fabricated = text.match(/\b(auc|auroc|accuracy|f1|sensitivity|specificity|precision|recall)\b[^.]{0,24}?\d/g);
  expect(fabricated ?? [], "medico must not publish a metric it does not have").toEqual([]);
});

test("the fourteen findings and the coverage matrix are real DOM, not canvas", async ({ page }) => {
  await page.goto("/work/medico");
  /* The matrix is an accessible image with a described coverage claim. */
  const figure = page.locator(".medico-flat-figure svg");
  await expect(figure).toHaveAttribute("aria-label", /supplies 7 of 14/i);
  await expect(figure).toHaveAttribute("aria-label", /masked out of the loss/i);
  /* Every canvas on the page is decorative; none of it carries unique meaning. */
  for (const canvas of await page.locator(".world-canvas").all()) {
    await expect(canvas).toHaveAttribute("aria-hidden", "true");
  }
});

test("medico keeps its renderer behind the gates", async ({ page, isMobile }) => {
  const scripts: string[] = [];
  page.on("response", (response) => {
    if (response.url().endsWith(".js")) scripts.push(response.url());
  });
  await page.goto("/work/medico", { waitUntil: "networkidle" });

  /*
   * Both projects run with reducedMotion: "reduce", and mobile is below the width gate, so no
   * configuration in this suite may pull three.js. Arrival must never pull it on any of them.
   */
  const heavy = await Promise.all(
    scripts.map(async (url) => {
      const body = await page.request.get(url).then((r) => r.body()).catch(() => null);
      return body ? /three\.module|WebGLRenderer/.test(body.toString("utf8")) : false;
    }),
  );
  expect(heavy.some(Boolean), "the renderer must not load behind the motion or width gate").toBe(false);

  /* And the static state must still be the whole explanation. */
  await expect(page.locator(".world-stage")).toHaveAttribute("data-mode", "static");
  await expect(page.locator(".medico-flat-figure")).toBeVisible();
  expect(isMobile !== undefined).toBe(true);
});

test("medico fits a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/work/medico");
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  const report = overflows ? await describeOverflow(page) : null;
  expect(overflows, `/work/medico overflows at 320px: ${JSON.stringify(report)}`).toBe(false);
});

test("no patient identifier or private path reaches the medico page", async ({ page }) => {
  await page.goto("/work/medico");
  const html = await page.content();
  /* The training script reads local corpora; none of those locations may be published. */
  for (const marker of ["CheXpert-v1.0-small", "Data_Entry_2017", "MEDICO_DATA_DIR", "patient0", "C:\\\\"]) {
    expect(html, `medico page must not publish ${marker}`).not.toContain(marker);
  }
});

/* ============================================================================================
 * The InsureAssist world
 *
 * The repository ships `eval/verify_artifacts.py`, which fails its CI if its own documentation
 * drifts from the frozen reference run. These tests are the same idea applied to the site: every
 * published figure has to match the evidence module, the failure the project is about has to be
 * on the page rather than softened away, and no number may appear that the run does not contain.
 * ========================================================================================== */

test("the insureassist route renders its world", async ({ page }) => {
  const response = await page.goto("/work/insureassist-rag");
  expect(response?.status()).toBe(200);
  await expect(page.locator(".world-stage.insureassist-world")).toHaveCount(1);
  await expect(page.locator(".insure-flat-figure")).toBeVisible();
});

test("published retrieval metrics match the evidence module", async ({ page }) => {
  const { results, retrievers } = await import("../src/content/insureassist-world");
  await page.goto("/work/insureassist-rag");
  const text = await page.locator("main, article").first().innerText();

  /* The three headline figures, and every baseline row, exactly as the reference run has them. */
  for (const value of [results.mrr, results.hitAt5, results.topDocument]) {
    expect(text, `held-out ${value} must appear`).toContain(String(value));
  }
  for (const retriever of retrievers) {
    expect(text, `${retriever.label} hit@5`).toContain(String(retriever.hitAt5));
    expect(text, `${retriever.label} top-document`).toContain(String(retriever.topDocument));
  }
});

test("the wrong-document story is on the page, not softened", async ({ page }) => {
  await page.goto("/work/insureassist-rag");
  const text = (await page.locator("main, article").first().innerText()).toLowerCase();

  /* The failure, the honest comparison, and the boundary that the service never abstains. */
  expect(text).toContain("wrong form");
  expect(text).toMatch(/bm25 alone retrieves the most relevant chunks/);
  expect(text).toMatch(/never abstains|rejection rate is 0/);
  expect(text).toContain("16.7%");
});

test("insureassist claims no capability the repository lacks", async ({ page }) => {
  await page.goto("/work/insureassist-rag");
  const text = (await page.locator("main, article").first().innerText()).toLowerCase();

  /*
   * The repository has no structured field extraction, no recommendation engine, and no
   * relational or object storage. It also gives no financial advice. None of that may appear.
   */
  /*
   * Word boundaries, not substrings. The first version used `toContain` and matched "redis"
   * inside "Redistributable", failing on a sentence about the corpus licence.
   */
  for (const absent of [
    /\bpostgres\b/,
    /\bminio\b/,
    /\bredis\b/,
    /\brecommendation engine\b/,
    /\bfinancial advice\b/,
    /\binsurance advice\b/,
    /\bunderwriting decision\b/,
  ]) {
    expect(text, `insureassist must not claim ${absent}`).not.toMatch(absent);
  }
});

test("the corpus is attributed and its licence basis stated", async ({ page }) => {
  await page.goto("/work/insureassist-rag");
  const text = await page.locator("main, article").first().innerText();
  expect(text).toContain("17 U.S.C. 105");
  for (const citation of ["Appendix A(1)", "Appendix A(2)", "Appendix A(3)"]) {
    expect(text, `${citation} must be cited`).toContain(citation);
  }
});

test("insureassist keeps its renderer behind the gates", async ({ page }) => {
  const scripts: string[] = [];
  page.on("response", (response) => {
    if (response.url().endsWith(".js")) scripts.push(response.url());
  });
  await page.goto("/work/insureassist-rag", { waitUntil: "networkidle" });

  const heavy = await Promise.all(
    scripts.map(async (url) => {
      const body = await page.request.get(url).then((r) => r.body()).catch(() => null);
      return body ? /three\.module|WebGLRenderer/.test(body.toString("utf8")) : false;
    }),
  );
  expect(heavy.some(Boolean), "the renderer must not load behind the motion or width gate").toBe(false);
  await expect(page.locator(".world-stage.insureassist-world")).toHaveAttribute("data-mode", "static");
});

test("insureassist fits a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/work/insureassist-rag");
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  const report = overflows ? await describeOverflow(page) : null;
  expect(overflows, `/work/insureassist-rag overflows at 320px: ${JSON.stringify(report)}`).toBe(false);
});

test("no local corpus path or employer content reaches insureassist", async ({ page }) => {
  await page.goto("/work/insureassist-rag");
  const html = await page.content();
  for (const marker of ["data/corpus/", "MEDICO_DATA_DIR", "C:\\\\", "/home/", "qa_testset"]) {
    expect(html, `insureassist must not publish ${marker}`).not.toContain(marker);
  }
});

/* ============================================================================================
 * The public-safe reliable-knowledge world
 *
 * This route exists because the employer case study cannot be published. The tests that matter
 * most are therefore negative ones: that the abstraction leaks nothing, that the confidential
 * route stays excluded, and that what remains is still a description of real engineering rather
 * than four generic boxes.
 * ========================================================================================== */

test("the public-safe route renders its world", async ({ page }) => {
  const response = await page.goto("/work/reliable-knowledge-systems");
  expect(response?.status()).toBe(200);
  await expect(page.locator(".world-stage.reliable-world")).toHaveCount(1);
  await expect(page.locator(".reliable-flat-figure")).toBeVisible();
});

test("the public-safe route names nothing internal", async ({ page }) => {
  await page.goto("/work/reliable-knowledge-systems");
  const html = await page.content();

  /*
   * Internal repository names, the internal host, internal service and table names, store
   * technologies used internally, and the domain vocabulary that would identify the subject.
   * None of it may appear in the markup, in any attribute, or in any inlined script.
   */
  for (const forbidden of [
    /bp-itcs-ibp/i,
    /lab-gitea/i,
    /\bglaux\b/i,
    /currency_observations/i,
    /law_verification_state/i,
    /entity[-\s]producer/i,
    /knowledge-db-ingestion/i,
    /\bneo4j\b/i,
    /\bminio\b/i,
    /\bpostgres/i,
    /\bqdrant\b/i,
    /\bstatute\b/i,
    /\bgesetze\b/i,
    /\bCELEX\b/,
    /C:[\/]Users/i,
  ]) {
    expect(html, `public-safe route must not contain ${forbidden}`).not.toMatch(forbidden);
  }
});

test("the public-safe route discloses that it is synthetic", async ({ page }) => {
  await page.goto("/work/reliable-knowledge-systems");
  const text = await page.locator("main, article").first().innerText();
  expect(text).toMatch(/illustrative model/i);
  expect(text).toMatch(/synthetic/i);
  /* The boundaries are a section of the page, not a footnote. */
  for (const boundary of ["Not a deployment topology", "No production scale", "No internal data"]) {
    expect(text, `${boundary} must be stated`).toContain(boundary);
  }
});

test("the public-safe route still describes real engineering", async ({ page }) => {
  await page.goto("/work/reliable-knowledge-systems");
  const text = (await page.locator("main, article").first().innerText()).toLowerCase();

  /*
   * The quality test for the abstraction: with every internal name removed, a reader should still
   * meet provenance, several representations, verification, consistency, rebuilding derived state
   * and operational visibility. If these are gone it has collapsed into generic icons.
   */
  for (const idea of [
    "captured evidence",
    "derived",
    "verif",
    "consistent",
    "rebuild",
    "one writer per piece of state",
  ]) {
    expect(text, `the abstraction must still convey "${idea}"`).toContain(idea);
  }
});

test("the public-safe route imports nothing from the confidential case study", async () => {
  const { readFile } = await import("node:fs/promises");
  for (const file of [
    "src/content/reliable-knowledge-world.ts",
    "src/app/work/reliable-knowledge-systems/page.tsx",
  ]) {
    const source = await readFile(file, "utf8");
    expect(source, `${file} must not import case-study content`).not.toMatch(
      /legal-kb|legal_kb|legalKb|content\/legal/i,
    );
  }
});

test("the confidential route is still a draft and is not linked from anywhere public", async ({ page }) => {
  /*
   * The production guarantee is that this slug is never emitted, and `npm run check` with
   * VERCEL_ENV=production is what enforces it. This suite runs against a build where drafts are
   * visible on purpose, so asserting a 404 here would be asserting the wrong thing and would pass
   * for the wrong reason. What is checked instead is the contract behind the exclusion: the
   * project is still marked draft, and no public surface links to it.
   */
  const { getProject } = await import("../src/content/portfolio");
  const project = getProject("legal-knowledge-platform");
  expect(project, "the confidential project must still exist in the registry").toBeTruthy();
  expect(
    project?.publication?.status,
    "the confidential project must still be a draft",
  ).toBe("draft");

  /*
   * The link check only means anything where drafts are hidden. This suite runs against a build
   * that shows them on purpose, and asserting their absence there would fail for the right reason
   * at the wrong time - so the assertion is gated on the same flag the build uses.
   */
  const { draftsAreVisible } = await import("../src/content/portfolio");
  for (const route of ["/", "/work", "/work/reliable-knowledge-systems"]) {
    await page.goto(route);
    const html = await page.content();
    if (draftsAreVisible) {
      /* Drafts visible: the public-safe route must still never point at the confidential one. */
      if (route !== "/work/reliable-knowledge-systems") continue;
    }
    expect(html, `${route} must not link to the confidential slug`).not.toContain(
      "/work/legal-knowledge-platform",
    );
  }
});

test("the public-safe route fits a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/work/reliable-knowledge-systems");
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  const report = overflows ? await describeOverflow(page) : null;
  expect(overflows, `route overflows at 320px: ${JSON.stringify(report)}`).toBe(false);
});

test("the public-safe world keeps its renderer behind the gates", async ({ page }) => {
  const scripts: string[] = [];
  page.on("response", (response) => {
    if (response.url().endsWith(".js")) scripts.push(response.url());
  });
  await page.goto("/work/reliable-knowledge-systems", { waitUntil: "networkidle" });
  const heavy = await Promise.all(
    scripts.map(async (url) => {
      const body = await page.request.get(url).then((r) => r.body()).catch(() => null);
      return body ? /three\.module|WebGLRenderer/.test(body.toString("utf8")) : false;
    }),
  );
  expect(heavy.some(Boolean), "the renderer must not load behind the gates").toBe(false);
  await expect(page.locator(".world-stage.reliable-world")).toHaveAttribute("data-mode", "static");
});

/* ============================================================================================
 * The MLOps release machine
 *
 * This project's subject is a gate that refuses to promote a model on insufficient evidence, so
 * the tests hold the page to the same standard: every threshold has to match the repository's
 * config, the refusal has to be present rather than smoothed away, and no capability may be
 * claimed that the repository does not have.
 * ========================================================================================== */

test("the mlops route renders its world", async ({ page }) => {
  const response = await page.goto("/work/mlops-reference-pipeline");
  expect(response?.status()).toBe(200);
  await expect(page.locator(".world-stage.mlops-world")).toHaveCount(1);
  await expect(page.locator(".mlops-flat-figure")).toBeVisible();
});

test("published gate thresholds match the evidence module", async ({ page }) => {
  const { gate, results } = await import("../src/content/mlops-world");
  await page.goto("/work/mlops-reference-pipeline");
  const text = await page.locator("main, article").first().innerText();

  /* Every check, its threshold and its measured value, exactly as generated from the repository. */
  for (const check of gate) {
    expect(text, `${check.label} threshold`).toContain(String(check.threshold));
    expect(text, `${check.label} measured value`).toContain(String(check.value));
  }
  expect(text, "held-out accuracy").toContain(String(results.accuracy));
  expect(text, "majority-class baseline").toContain(String(results.baselineAccuracy));
});

test("the refusal is part of the story, not smoothed away", async ({ page }) => {
  await page.goto("/work/mlops-reference-pipeline");
  const text = (await page.locator("main, article").first().innerText()).toLowerCase();

  /* The gate is a conjunction, production is not directly registrable, and a candidate can fail. */
  expect(text).toContain("all()");
  expect(text).toMatch(/not directly registrable/);
  expect(text).toMatch(/cannot be registered/);
  /* The margin over the baseline is the check the repository says carries the meaning. */
  expect(text).toContain("margin");
});

test("mlops claims no capability the repository lacks", async ({ page }) => {
  await page.goto("/work/mlops-reference-pipeline");
  const text = (await page.locator("main, article").first().innerText()).toLowerCase();

  /*
   * The repository is a reference implementation: FastAPI, Docker, GitHub Actions, an optional
   * MLflow that is off by default, and a counter endpoint. There is no cluster, no cloud, no
   * autoscaling and no drift detection, and none of it may appear.
   */
  for (const absent of [
    /\bkubernetes\b/,
    /\bhelm\b/,
    /\bsagemaker\b/,
    /\bvertex ai\b/,
    /\bairflow\b/,
    /\bkubeflow\b/,
    /\bautoscal/,
    /\bdrift detection\b/,
    /\bservice level agreement\b/,
  ]) {
    expect(text, `mlops must not claim ${absent}`).not.toMatch(absent);
  }

  /*
   * "Production traffic" may appear, but only inside a denial. Forbidding the phrase outright
   * failed on the two places the page legitimately uses it - the repository's own limitation
   * ("No production traffic has ever hit it") and the case study's "never carried production
   * traffic" - which are exactly the sentences it should be carrying. What is checked is that a
   * negation appears close before every occurrence.
   */
  for (const match of text.matchAll(/production traffic/g)) {
    const before = text.slice(Math.max(0, match.index - 30), match.index);
    const denied = /\b(no|not|never)\b/.test(before);
    expect(denied, `production traffic without a denial: ${JSON.stringify(before)}`).toBe(true);
  }
});

test("mlops states its limitations, including having no production traffic", async ({ page }) => {
  const { limits } = await import("../src/content/mlops-world");
  await page.goto("/work/mlops-reference-pipeline");
  const text = await page.locator("main, article").first().innerText();
  for (const limit of limits) {
    expect(text, `${limit.label} must be stated`).toContain(limit.label);
  }
  expect(text).toMatch(/No production traffic has ever hit it/i);
});

test("mlops keeps its renderer behind the gates", async ({ page }) => {
  const scripts: string[] = [];
  page.on("response", (response) => {
    if (response.url().endsWith(".js")) scripts.push(response.url());
  });
  await page.goto("/work/mlops-reference-pipeline", { waitUntil: "networkidle" });
  const heavy = await Promise.all(
    scripts.map(async (url) => {
      const body = await page.request.get(url).then((r) => r.body()).catch(() => null);
      return body ? /three\.module|WebGLRenderer/.test(body.toString("utf8")) : false;
    }),
  );
  expect(heavy.some(Boolean), "the renderer must not load behind the gates").toBe(false);
  await expect(page.locator(".world-stage.mlops-world")).toHaveAttribute("data-mode", "static");
});

test("mlops fits a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/work/mlops-reference-pipeline");
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  const report = overflows ? await describeOverflow(page) : null;
  expect(overflows, `route overflows at 320px: ${JSON.stringify(report)}`).toBe(false);
});

/* ============================================================================================
 * Hydrology: uncertainty quantification on a calibrated HBV event.
 *
 * The guards that matter most here are the negative ones. This seminar computes no coverage, no
 * nominal interval and no calibration curve, and it does not forecast anything - so a page about
 * it must not drift into the vocabulary of a forecasting project just because that vocabulary is
 * close to hand. Three of the tests below exist only to keep it out.
 * ========================================================================================== */

test("hydrology renders the world and its measurements", async ({ page }) => {
  await page.goto("/work/hydrology-uq");
  await expect(page.locator(".world-stage.hydrology-world")).toBeVisible();
  const text = await page.locator("main").innerText();
  /* Both experiments, and the comparison between them, must be on the page. */
  expect(text).toContain("0.907715");
  expect(text).toContain("0.759226");
  expect(text).toContain("356.1");
});

test("hydrology numbers come from the seminar's own artifacts", async ({ page }) => {
  await page.goto("/work/hydrology-uq");
  const text = await page.locator("main").innerText();
  /* Each of these is transcribed by the generator from a named results file. */
  for (const value of ["0.907298", "0.998705", "5.76", "2,000"]) {
    expect(text, `expected the generated value ${value}`).toContain(value);
  }
});

test("hydrology names the methods the repository actually implements", async ({ page }) => {
  await page.goto("/work/hydrology-uq");
  const text = await page.locator("main").innerText();
  expect(text).toContain("HBV001a");
  expect(text).toContain("Differential Evolution");
  expect(text).toContain("Sobol");
});

test("hydrology claims no uncertainty method the seminar does not use", async ({ page }) => {
  await page.goto("/work/hydrology-uq");
  const text = (await page.locator("main").innerText()).toLowerCase();
  /*
   * The thesis calibrates intervals; this project does not, and borrowing its vocabulary here
   * would be the easiest way to overstate a piece of group coursework.
   */
  for (const absent of [
    "conformal",
    "temperature scaling",
    "quantile regression",
    "deep ensemble",
    "monte carlo dropout",
  ]) {
    expect(text, `${absent} is not in this repository`).not.toContain(absent);
  }
});

test("hydrology reports no coverage, because none was computed", async ({ page }) => {
  await page.goto("/work/hydrology-uq");
  const text = (await page.locator("main").innerText()).toLowerCase();
  /*
   * No nominal level is evaluated anywhere in the seminar. A "90% interval" or an "empirical
   * coverage" on this page would be an invented result, so the page may not contain one.
   */
  expect(text).not.toMatch(/\b(90|95|99)\s*%\s*(prediction\s+)?interval\b/);
  expect(text).not.toContain("empirical coverage");
  expect(text).not.toContain("nominal coverage");
});

test("hydrology does not present itself as a forecast", async ({ page }) => {
  await page.goto("/work/hydrology-uq");
  const text = await page.locator("main").innerText();
  /* Every mention of a forecast horizon or issue time would be a different project. */
  for (const absent of ["forecast horizon", "lead time", "issue time"]) {
    expect(text.toLowerCase(), `${absent} belongs to the streamflow project`).not.toContain(absent);
  }
});

test("hydrology states its limitations, including that the event shape is schematic", async ({
  page,
}) => {
  await page.goto("/work/hydrology-uq");
  const text = await page.locator("main").innerText();
  expect(text).toContain("schematic");
  expect(text).toContain("not redistributable");
  expect(text.toLowerCase()).toContain("group coursework");
});

test("hydrology keeps its renderer behind the gates", async ({ page }) => {
  const scripts: string[] = [];
  page.on("response", (response) => {
    if (response.url().endsWith(".js")) scripts.push(response.url());
  });
  await page.goto("/work/hydrology-uq", { waitUntil: "networkidle" });
  const heavy = await Promise.all(
    scripts.map(async (url) => {
      const body = await page.request.get(url).then((r) => r.body()).catch(() => null);
      return body ? /three\.module|WebGLRenderer/.test(body.toString("utf8")) : false;
    }),
  );
  expect(heavy.some(Boolean), "the renderer must not load behind the gates").toBe(false);
  await expect(page.locator(".world-stage.hydrology-world")).toHaveAttribute("data-mode", "static");
});

test("hydrology gives a reduced-motion reader the whole comparison", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work/hydrology-uq");
  /* Both panels, the shared-scale note, and the limitations - nothing withheld behind motion. */
  await expect(page.locator(".hydrology-flat-panel")).toHaveCount(2);
  await expect(page.locator(".hydrology-flat-note")).toBeVisible();
  const limits = await page.locator(".hydrology-flat-limits li").count();
  expect(limits).toBeGreaterThanOrEqual(5);
});

test("hydrology figures carry text alternatives", async ({ page }) => {
  await page.goto("/work/hydrology-uq");
  for (const svg of await page.locator(".hydrology-flat-panel svg").all()) {
    const label = await svg.getAttribute("aria-label");
    expect(label?.length ?? 0, "each panel needs its own description").toBeGreaterThan(60);
  }
});

test("hydrology fits a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/work/hydrology-uq");
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  const report = overflows ? await describeOverflow(page) : null;
  expect(overflows, `route overflows at 320px: ${JSON.stringify(report)}`).toBe(false);
});

/* ============================================================================================
 * Streamflow: a synthetic one-step-ahead benchmark.
 *
 * The negative guards matter most here too, and for a specific reason: this project's page used
 * to carry a forecast-cone figure, and the repository produces no intervals and no multi-step
 * horizon at all. Several of the tests below exist to keep that framing from coming back.
 * ========================================================================================== */

test("streamflow renders the world and its leaderboard", async ({ page }) => {
  await page.goto("/work/streamflow-forecasting");
  await expect(page.locator(".world-stage.streamflow-world")).toBeVisible();
  const text = await page.locator("main").innerText();
  for (const value of ["0.9786", "0.7206", "-11.692"]) {
    expect(text, `expected the published metric ${value}`).toContain(value);
  }
});

test("streamflow metrics are the reference run's, not a retraining's", async ({ page }) => {
  await page.goto("/work/streamflow-forecasting");
  const text = await page.locator("main").innerText();
  /* Each of these is recomputed by the generator and checked against forecast_results.json. */
  for (const value of ["3.71", "2.865", "90.299", "89.935"]) {
    expect(text, `expected the generated value ${value}`).toContain(value);
  }
});

test("streamflow names the models the repository actually uses", async ({ page }) => {
  await page.goto("/work/streamflow-forecasting");
  const text = await page.locator("main").innerText();
  expect(text).toContain("XGBoost");
  expect(text).toContain("SARIMAX");
  expect(text).toContain("Seasonal Naive");
});

test("streamflow states its horizon honestly", async ({ page }) => {
  await page.goto("/work/streamflow-forecasting");
  const text = await page.locator("main").innerText();
  /* The single most important sentence in the project: one step, with observed lags supplied. */
  expect(text).toContain("One step");
  expect(text.toLowerCase()).toContain("one step ahead");
});

test("streamflow claims no multi-step forecast it never evaluated", async ({ page }) => {
  await page.goto("/work/streamflow-forecasting");
  const text = (await page.locator("main").innerText()).toLowerCase();
  for (const absent of ["forecast cone", "lead time", "multi-step forecast", "forecast horizon"]) {
    expect(text, `${absent} would overstate a one-step benchmark`).not.toContain(absent);
  }
});

test("streamflow invents no uncertainty, because the benchmark produces none", async ({ page }) => {
  await page.goto("/work/streamflow-forecasting");
  const text = (await page.locator("main").innerText()).toLowerCase();
  /* Every prediction in this repository is a point estimate. No intervals exist to report. */
  expect(text).not.toMatch(/\b(90|95|99)\s*%\s*(prediction\s+|confidence\s+)?interval\b/);
  expect(text).not.toContain("confidence interval");
  expect(text).not.toContain("prediction interval");
  expect(text).not.toContain("empirical coverage");
});

test("streamflow keeps the synthetic scope in front of the reader", async ({ page }) => {
  await page.goto("/work/streamflow-forecasting");
  const text = (await page.locator("main").innerText()).toLowerCase();
  expect(text).toContain("synthetic");
  /* Every occurrence of the headline score must sit near its scope, never alone as a boast. */
  expect(text).toContain("fixed seed");
});

test("streamflow reports what each row was scored on", async ({ page }) => {
  await page.goto("/work/streamflow-forecasting");
  const text = await page.locator("main").innerText();
  /* The mismatch is the finding, so it must survive into the static document. */
  expect(text).toContain("730 daily values");
  expect(text).toContain("25 monthly means");
});

test("streamflow shows a measured failure case", async ({ page }) => {
  await page.goto("/work/streamflow-forecasting");
  const text = await page.locator("main").innerText();
  /* Peak undershoot, stated with numbers rather than as an impression of a chart. */
  expect(text).toContain("5.591");
  expect(text).toContain("2.562");
});

test("streamflow keeps its renderer behind the gates", async ({ page }) => {
  const scripts: string[] = [];
  page.on("response", (response) => {
    if (response.url().endsWith(".js")) scripts.push(response.url());
  });
  await page.goto("/work/streamflow-forecasting", { waitUntil: "networkidle" });
  const heavy = await Promise.all(
    scripts.map(async (url) => {
      const body = await page.request.get(url).then((r) => r.body()).catch(() => null);
      return body ? /three\.module|WebGLRenderer/.test(body.toString("utf8")) : false;
    }),
  );
  expect(heavy.some(Boolean), "the renderer must not load behind the gates").toBe(false);
  await expect(page.locator(".world-stage.streamflow-world")).toHaveAttribute("data-mode", "static");
});

test("streamflow gives a reduced-motion reader the whole argument", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work/streamflow-forecasting");
  await expect(page.locator(".streamflow-flat-board")).toBeVisible();
  const rows = await page.locator(".streamflow-flat-rows li").count();
  expect(rows).toBe(3);
  /* The scored-on column is the finding and must never be the thing that gets dropped. */
  const scored = await page.locator(".streamflow-flat-scored").allInnerTexts();
  expect(scored.join(" ")).toContain("monthly means");
  const limits = await page.locator(".streamflow-flat-limits li").count();
  expect(limits).toBeGreaterThanOrEqual(5);
});

test("streamflow figures carry text alternatives", async ({ page }) => {
  await page.goto("/work/streamflow-forecasting");
  const label = await page.locator(".streamflow-flat-figure svg").getAttribute("aria-label");
  expect(label?.length ?? 0, "the prediction figure needs a description").toBeGreaterThan(80);
});

test("streamflow fits a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/work/streamflow-forecasting");
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  const report = overflows ? await describeOverflow(page) : null;
  expect(overflows, `route overflows at 320px: ${JSON.stringify(report)}`).toBe(false);
});

test("the homepage no longer promises a forecast horizon", async ({ page }) => {
  await page.goto("/");
  const text = (await page.locator("main").innerText()).toLowerCase();
  /*
   * The streamflow chapter used to draw an interval opening with lead time, from a formula. The
   * repository has no horizon and no intervals, so neither the figure nor its caption may imply
   * one.
   */
  expect(text).not.toContain("lead time");
  expect(text).not.toContain("the horizon opens");
});

/* ============================================================================================
 * CIFAR-10: a bounded reference experiment.
 *
 * The specific risk on this project is claiming more than the artifacts support. The repository
 * deliberately versions no checkpoint, so there are no activations and no per-image predictions
 * to show, and the guards below exist to keep invented ones out.
 * ========================================================================================== */

test("cifar renders the world and its architecture", async ({ page }) => {
  await page.goto("/work/cifar10-cnn");
  await expect(page.locator(".world-stage.cifar-world")).toBeVisible();
  const text = await page.locator("main").innerText();
  expect(text).toContain("64.26");
  expect(text).toContain("815,018");
});

test("cifar reports the real tensor shapes", async ({ page }) => {
  await page.goto("/work/cifar10-cnn");
  const text = await page.locator("main").innerText();
  /* Measured from the module by the generator, not read off the README. */
  for (const shape of ["3 × 32 × 32", "32 × 16 × 16", "64 × 8 × 8", "128 × 4 × 4"]) {
    expect(text, `expected the measured shape ${shape}`).toContain(shape);
  }
});

test("cifar has all ten classes and their real accuracies", async ({ page }) => {
  await page.goto("/work/cifar10-cnn");
  const text = await page.locator("main").innerText();
  for (const c of ["airplane", "automobile", "bird", "cat", "deer",
                   "dog", "frog", "horse", "ship", "truck"]) {
    expect(text, `expected class ${c}`).toContain(c);
  }
  /*
   * The two ends of the spread, checked as complete percentages rather than as bare digits -
   * "82" alone matches a parameter count and would pass without the class result being present.
   */
  expect(text).toMatch(/33\.5\s*%/);
  expect(text).toMatch(/\b82\s*%/);
});

test("cifar publishes the confusion matrix as selectable numbers", async ({ page }) => {
  await page.goto("/work/cifar10-cnn");
  const cells = page.locator(".cifar-flat-matrix tbody td");
  await expect(cells).toHaveCount(100);
  /* Every row must still sum to 1,000 in the DOM, which catches a truncated render. */
  const rows = await page.locator(".cifar-flat-matrix tbody tr").all();
  expect(rows.length).toBe(10);
  for (const row of rows) {
    const values = await row.locator("td").allInnerTexts();
    const total = values.reduce((a, v) => a + Number(v), 0);
    expect(total, "each true class has 1,000 test images").toBe(1000);
  }
});

test("cifar shows the largest confusion", async ({ page }) => {
  await page.goto("/work/cifar10-cnn");
  const text = await page.locator("main").innerText();
  /* cat -> dog, 291: the biggest off-diagonal cell in the tracked matrix. */
  expect(text).toContain("291");
  await expect(page.locator(".cifar-flat-matrix td[data-worst]")).toHaveCount(1);
});

test("cifar claims no activations, because no checkpoint is versioned", async ({ page }) => {
  await page.goto("/work/cifar10-cnn");
  const text = (await page.locator("main").innerText()).toLowerCase();
  /* The page must say so rather than quietly implying recorded feature maps. */
  expect(text).toContain("no checkpoint");
  for (const absent of ["saliency", "grad-cam", "activation map", "this neuron"]) {
    expect(text, `${absent} is not supported by this repository`).not.toContain(absent);
  }
});

test("cifar invents no confidence values", async ({ page }) => {
  await page.goto("/work/cifar10-cnn");
  const text = (await page.locator("main").innerText()).toLowerCase();
  /* No softmax was ever run for a displayed image, so no probability may be shown. */
  for (const absent of ["confidence", "softmax", "probability", "logit"]) {
    expect(text, `${absent} would imply an inference this page never ran`).not.toContain(absent);
  }
});

test("cifar keeps the training budget next to the score", async ({ page }) => {
  await page.goto("/work/cifar10-cnn");
  const text = await page.locator("main").innerText();
  /* The subset and the epoch count are the context the headline number needs. */
  expect(text).toContain("15,000");
  expect(text).toMatch(/12\s+epochs|epochs\s+12/i);
  /* And the run is described as unfinished, which the history supports. */
  expect(text.toLowerCase()).toContain("had not converged");
});

test("cifar keeps its renderer behind the gates", async ({ page }) => {
  const scripts: string[] = [];
  page.on("response", (response) => {
    if (response.url().endsWith(".js")) scripts.push(response.url());
  });
  await page.goto("/work/cifar10-cnn", { waitUntil: "networkidle" });
  const heavy = await Promise.all(
    scripts.map(async (url) => {
      const body = await page.request.get(url).then((r) => r.body()).catch(() => null);
      return body ? /three\.module|WebGLRenderer/.test(body.toString("utf8")) : false;
    }),
  );
  expect(heavy.some(Boolean), "the renderer must not load behind the gates").toBe(false);
  await expect(page.locator(".world-stage.cifar-world")).toHaveAttribute("data-mode", "static");
});

test("cifar gives a reduced-motion reader the whole argument", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work/cifar10-cnn");
  await expect(page.locator(".cifar-flat-matrix table")).toBeVisible();
  await expect(page.locator(".cifar-flat-classes li")).toHaveCount(10);
  await expect(page.locator(".cifar-flat-stack li")).toHaveCount(5);
  const limits = await page.locator(".cifar-flat-limits li").count();
  expect(limits).toBeGreaterThanOrEqual(5);
});

test("cifar sample images are real and described", async ({ page }) => {
  await page.goto("/work/cifar10-cnn");
  const imgs = page.locator(".cifar-flat-tiles img");
  await expect(imgs).toHaveCount(3);
  for (const img of await imgs.all()) {
    const alt = await img.getAttribute("alt");
    expect(alt ?? "", "each sample needs a description").toContain("CIFAR-10");
    const src = await img.getAttribute("src");
    expect(src ?? "").toMatch(/^data:image\/png;base64,/);
  }
});

test("cifar fits a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/work/cifar10-cnn");
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  const report = overflows ? await describeOverflow(page) : null;
  expect(overflows, `route overflows at 320px: ${JSON.stringify(report)}`).toBe(false);
});

test("the cifar opening object uses real per-class numbers", async ({ page }) => {
  await page.goto("/work/cifar10-cnn");
  /*
   * This drawing once showed four classes with invented bar widths. It now draws the tracked
   * confusion matrix itself, so the guard is stronger than a count of bars: every one of the
   * hundred cells has to be on screen, and the headline has to be stated as the mean of ten
   * rather than on its own.
   */
  const still = page.locator("header .scn-still-wide");
  const cells = await still.locator("rect").count();
  expect(cells, "the full ten-by-ten matrix must be drawn").toBeGreaterThanOrEqual(100);

  const described = await page.locator("header .scn-identity figcaption").innerText();
  for (const value of ["64.26", "33.5", "82.0", "291"]) {
    expect(described, `${value} is a tracked number and must be published`).toContain(value);
  }
});

/* ============================================================================================
 * The index: the homepage as a way of choosing rather than a reel to sit through.
 *
 * The homepage used to be one continuous reel - a full viewport per project, nine of them, the
 * last link 47,485px down a 55-screen page. These guard what replaced it: one compact index of
 * the same nine projects, complete on first paint, with the long-form reading on each project's
 * own route where it always was.
 * ========================================================================================== */

/*
 * The running order, taken from the manifest rather than copied.
 *
 * This list used to be duplicated here and in one other test. Adding a ninth entry broke eight
 * tests that were really only asserting "the page renders the order that was declared" - which is
 * still exactly what they assert now, without a second copy to keep in step.
 */
const REEL = WORLD_ORDER;

test("the homepage index offers every project and the way to the rest", async ({ page }) => {
  await page.goto("/");
  const index = page.getByRole("navigation", { name: "Selected work" });
  const hrefs = await index
    .locator("a[href]")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")));

  expect(hrefs).toHaveLength(REEL.length);
  for (const slug of REEL) {
    expect(hrefs.some((href) => href === `/work/${slug}`), `index is missing ${slug}`).toBe(true);
  }
  /* The index is a shortlist; the catalogue is one link away and says so. */
  await expect(page.getByRole("link", { name: "Every project and repository" })).toHaveAttribute(
    "href",
    "/work",
  );
});

test("the homepage index is whole on first paint, without scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const index = page.getByRole("navigation", { name: "Selected work" });

  /*
   * The index it replaced faded its items in across a scroll range, which made the reduced-motion
   * rendering the only one that showed the whole list at once. Choosing is not reading: every
   * entry is legible without moving, whatever the motion preference.
   */
  const opacities = await index
    .locator("li")
    .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));
  expect(opacities).toHaveLength(REEL.length);
  expect(opacities.every((o) => o > 0.99), "an index entry is staged on scroll").toBe(true);
});

test("the homepage is an index, not a reel", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const measured = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("main a[href^='/work/']"));
    const tops = links.map((a) => Math.round(a.getBoundingClientRect().top + window.scrollY));
    const hero = document.querySelector(".cine-hero")!.getBoundingClientRect();
    return {
      height: document.documentElement.scrollHeight,
      heroEnd: Math.round(hero.bottom + window.scrollY),
      first: Math.min(...tops),
      last: Math.max(...tops),
    };
  });

  /*
   * The reel measured 49,945px with its last project link at 47,485px.
   *
   * The first two budgets are measured from the end of the hero rather than from the top of the
   * page, because the hero is a pinned sequence whose scroll track is three viewports by design
   * and is not what this test is about. What it is about is what follows: the index has to start
   * as soon as the opening sequence is over, and the whole of it has to be within reach.
   */
  expect(measured.first - measured.heroEnd, "the index does not start where the hero ends")
    .toBeLessThan(700);
  expect(measured.last - measured.first, "the index itself is a scrolling exercise")
    .toBeLessThan(3000);
  expect(measured.height, "the homepage is growing back into a reel").toBeLessThan(12000);
});

test("the work index tiers the same projects and adds the ones no world covers", async ({ page }) => {
  await page.goto("/work");

  const selected = page.getByRole("navigation", { name: "Selected work" });
  const supporting = page.getByRole("navigation", { name: "Supporting projects" });
  await expect(selected).toBeVisible();
  await expect(supporting).toBeVisible();

  const hrefs = await page
    .locator("nav[aria-label='Selected work'] a, nav[aria-label='Supporting projects'] a")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  for (const slug of REEL) {
    expect(hrefs.some((href) => href === `/work/${slug}`), `work index is missing ${slug}`).toBe(true);
  }

  /* The two abstract figures are one click away rather than between the reader and the projects. */
  await expect(
    page.getByRole("navigation", { name: "Professional engineering" }).getByRole("link", {
      name: /Engineering model/,
    }),
  ).toHaveAttribute("href", "/work/engineering-model");
});

test("entering a world lands on the matching shared element", async ({ page }) => {
  for (const slug of ["transport-uq", "medico", "reliable-knowledge-systems"]) {
    await page.goto(`/work/${slug}`);
    const found = await page.evaluate(
      (s) =>
        Array.from(document.querySelectorAll<HTMLElement>("[style*='view-transition-name']")).some(
          (el) => el.style.viewTransitionName === `world-${s}`,
        ),
      slug,
    );
    expect(found, `/work/${slug} is missing its shared-element name`).toBe(true);
  }
});

test("the homepage still loads no renderer", async ({ page }) => {
  const scripts: string[] = [];
  page.on("response", (r) => {
    if (r.url().endsWith(".js")) scripts.push(r.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  const heavy = await Promise.all(
    scripts.map(async (url) => {
      const body = await page.request.get(url).then((r) => r.body()).catch(() => null);
      return body ? /three\.module|WebGLRenderer/.test(body.toString("utf8")) : false;
    }),
  );
  expect(heavy.some(Boolean), "the homepage must stay free of three.js").toBe(false);
});

/* ============================================================================================
 * Flagship scenes.
 *
 * Every flagship detail route opens on a scroll-driven scene, drawn twice from one function: once
 * on the server into the SVG that is the resting composition, and once on a canvas as the reader
 * scrolls. These guard what made that worth building.
 *
 * They used to run against the homepage, which drew the same nine scenes at a viewport each. The
 * scenes did not move when the reel was replaced by an index - the detail routes always carried
 * them - so what changed here is only where they are asserted.
 * ========================================================================================== */

/*
 * Every route that draws a scene, derived from the two manifests rather than transcribed.
 *
 * A scene route is one that appears in the running order and has a drawing registered for it.
 * Deriving it means adding a project needs one registration, not a fourth copy of the list.
 */
const FLAGSHIPS = WORLD_ORDER.filter((slug) => slug in SCENES);

test("every flagship opens on a scene, and each one is its own drawing", async ({ page }) => {
  test.slow();

  const stills: string[] = [];
  for (const slug of FLAGSHIPS) {
    await page.goto(`/work/${slug}`, { waitUntil: "networkidle" });
    const identity = page.locator("header .scn-identity");
    await expect(identity, `${slug} has no opening object`).toHaveCount(1);
    stills.push(await identity.locator(".scn-still-wide").evaluate((el) => el.innerHTML));
  }

  /*
   * One picture per scene, and no two alike. The markup of each resting still is compared against
   * every other one: if two projects ever became the same drawing with different numbers, this is
   * the test that would say so.
   */
  expect(new Set(stills).size, "two flagships are drawing the same picture").toBe(FLAGSHIPS.length);

  /* And they are genuinely different shapes, not the same shape re-coloured. */
  const shapes = stills.map((html) =>
    ["line", "circle", "rect", "polyline", "polygon", "text"]
      .map((tag) => (html.match(new RegExp(`<${tag}[ />]`, "g")) ?? []).length)
      .join("/"),
  );
  expect(new Set(shapes).size, "flagship scenes share a primitive signature").toBeGreaterThan(5);
});

test("a flagship scene costs no image request and describes itself once", async ({ page }) => {
  test.slow();
  const media: string[] = [];
  page.on("request", (r) => {
    if (/\.(png|jpe?g|webp|avif|gif|mp4|webm)(\?|$)/i.test(r.url())) media.push(r.url());
  });

  for (const slug of FLAGSHIPS) {
    await page.goto(`/work/${slug}`, { waitUntil: "networkidle" });

    const caption = page.locator("header .scn-identity figcaption");
    await expect(caption, `${slug} needs one description`).toHaveCount(1);
    expect((await caption.innerText()).length, `${slug} needs a real description`).toBeGreaterThan(40);

    /* Both stills are decorative; the caption is the accessible description. */
    await expect(page.locator("header .scn-still[aria-hidden='true']")).toHaveCount(2);
  }

  /*
   * The resting composition is markup, not a poster. This replaced ninety WebP frames for one
   * project; every project done the same way would have been megabytes.
   */
  expect(media, "a scene must not fetch an image").toHaveLength(0);
});

test("the shared-element name is on the object, in the first viewport", async ({ page }) => {
  test.slow();
  const viewport = page.viewportSize()!;

  for (const slug of FLAGSHIPS) {
    await page.goto(`/work/${slug}`, { waitUntil: "networkidle" });
    const named = page.locator('[style*="view-transition-name"]');
    await expect(named, `${slug} should name exactly one object`).toHaveCount(1);
    await expect(named).toHaveClass(/scn-identity-frame/);

    const box = (await named.boundingBox())!;
    /*
     * Meaningfully on screen when the navigation lands, not one pixel of it. A hundred pixels of
     * headroom is what separates "the object is here" from "the object is technically not clipped",
     * and it is the margin a slower font load eats on CI.
     */
    expect(box.y, `${slug} opens with its object below the fold`).toBeLessThan(viewport.height - 100);
    expect(box.y + box.height).toBeGreaterThan(0);
  }
});

test("a detail route never opens on an empty first viewport", async ({ page }) => {
  test.slow();
  for (const slug of FLAGSHIPS) {
    await page.goto(`/work/${slug}`, { waitUntil: "networkidle" });
    /* A name, a line of context, and the object. All three, above the fold. */
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    expect((await h1.innerText()).trim().length).toBeGreaterThan(8);

    const drawn = await page
      .locator("header .scn-identity .scn-still-wide, header .scn-identity .scn-still-tall")
      .first()
      .evaluate((el) => el.innerHTML.length);
    expect(drawn, `${slug} opens on an empty figure`).toBeGreaterThan(500);

    /* The way onward is present without scrolling to find it. */
    await expect(page.locator("header .scn-identity figcaption")).toHaveCount(1);
  }
});

test("the opening object survives reduced motion and needs no renderer", async ({ page }) => {
  test.slow();
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const slug of ["transport-uq", "medico", "cifar10-cnn"]) {
    await page.goto(`/work/${slug}`, { waitUntil: "networkidle" });
    const frame = page.locator("header .scn-identity-frame");
    await expect(frame).toBeVisible();
    /* The composition is markup: no canvas is created for it and nothing is fetched to draw it. */
    await expect(page.locator(".scn-identity canvas")).toHaveCount(0);
  }
});

test("navigating to a flagship does not smooth-scroll the whole page past the reader", async ({
  page,
}) => {
  /*
   * A blanket `scroll-behavior: smooth` also applies to a route change's scroll reset, and
   * clicking the last chapter used to take about a second and a half to fly the detail page past
   * before settling - straight through the shared-element transition.
   */
  await page.goto("/", { waitUntil: "networkidle" });
  const behaviour = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  expect(behaviour, "route changes must reset scroll instantly").toBe("auto");
});

/* ============================================================================================
 * The supporting repositories.
 *
 * Nine repositories used to get a full-viewport stage each on the homepage - about nine screens
 * of scrolling to reach the ninth, ahead of nothing a reader had asked for. The record they
 * carried is the disclosure inside each repository card in the index on /work, which is asserted
 * by "every substantial repository opens into how it runs" below, and the numbers behind it are
 * checked offline by tests/strong-work.test.ts.
 * ========================================================================================== */

/* ============================================================================================
 * Completion pass: evidence depth and the way onward.
 * ========================================================================================== */

test("the transport page publishes the baseline that beats its own surrogate", async ({ page }) => {
  await page.goto("/work/transport-uq");
  const text = await page.locator("article").innerText();
  /*
   * The comparison the surrogate loses. It was absent from this site until a second audit of the
   * implementation repository, and a page that shows the surrogate's scores without it is making
   * the work look better than the evidence does.
   */
  expect(text).toContain("0.7414");
  expect(text).toContain("XGBoost");
  const limits = await page.locator(".limitation-panel").innerText();
  expect(limits.toLowerCase()).toContain("gradient-boosted tree");
});

test("the retrieval page shows the score that chose the configuration beside the held-out one", async ({
  page,
}) => {
  await page.goto("/work/insureassist-rag");
  const gap = page.locator(".selection-gap");
  await expect(gap).toHaveCount(1);
  const text = await gap.innerText();
  expect(text).toContain("1.00");
  expect(text).toContain("0.5556");
});

test("every substantial repository opens into how it runs", async ({ page }) => {
  await page.goto("/work", { waitUntil: "networkidle" });
  const panels = page.locator("[data-showcase='index'] details");
  await expect(panels).toHaveCount(9);

  const first = panels.first();
  await first.locator("summary").click();
  /* A pipeline named after real modules, technologies in the role each fills, and an evidence state. */
  expect(await first.locator("code").count()).toBeGreaterThan(1);
  expect(await first.locator("dt").count()).toBeGreaterThan(1);
  await expect(first.locator("[class*='evidenceState']")).toHaveCount(1);
});

test("a project offers the next system rather than only the index", async ({ page }) => {
  test.slow();
  for (let i = 0; i < REEL.length; i += 1) {
    await page.goto(`/work/${REEL[i]}`);
    const nav = page.locator(".next-system");
    await expect(nav, `${REEL[i]} has no way onward`).toHaveCount(1);

    /* The order wraps, so the last chapter leads back to the first rather than dead-ending. */
    const expected = REEL[(i + 1) % REEL.length];
    const href = await nav.locator(".next-system-title a").getAttribute("href");
    expect(href, `${REEL[i]} points at the wrong next system`).toContain(expected);

    await expect(nav.getByRole("link", { name: "All work" })).toHaveCount(1);
  }
});

test("a flagship world holds its caption still while it scrubs", async ({ page }) => {
  /*
   * The detail-route layout shift, measured rather than assumed. The caption used to move up to
   * 74px between states while its own height never changed: a bottom-anchored block grows upward,
   * so anything taller below the headline lifted it.
   */
  test.slow();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1280, height: 900 });

  for (const slug of ["mlops-reference-pipeline", "hydrology-uq", "medico"]) {
    await page.goto(`/work/${slug}`, { waitUntil: "networkidle" });
    const tops = await page.evaluate(async () => {
      const seen = new Set<number>();
      for (let y = 600; y < 7000; y += 200) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(r));
        const stage = document.querySelector<HTMLElement>(".world-stage");
        const viewport = document.querySelector(".world-viewport");
        const line = document.querySelector(".world-caption .world-stage-line");
        if (!stage || !viewport || !line) continue;
        /*
         * Only while the stage is pinned and the scene is up. Outside the sticky range the caption
         * scrolls with the page, which is movement but not a layout shift.
         */
        if (stage.dataset.mode !== "scene") continue;
        if (Math.abs(viewport.getBoundingClientRect().top) > 2) continue;
        seen.add(Math.round(line.getBoundingClientRect().top));
      }
      return [...seen];
    });
    const spread = Math.max(...tops) - Math.min(...tops);
    expect(spread, `${slug} moves its caption headline by ${spread}px between states`).toBeLessThan(4);
  }
});

test("the release page never presents its staged refusal as a recorded failure", async ({ page }) => {
  test.slow();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await presentAHardwareRenderer(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/work/mlops-reference-pipeline", { waitUntil: "networkidle" });

  const track = await page.evaluate(() => {
    const r = document.querySelector(".world-track")!.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), h: Math.round(r.height), vh: window.innerHeight };
  });

  /*
   * The tracked run clears all four gates. The refusal state holds one condition short so the
   * branch is visible at all, and a gate closing on screen reads as a deployment that failed
   * unless the page says otherwise.
   */
  let sawRefusal = false;
  for (let i = 0; i <= 14; i += 1) {
    await page.evaluate((y) => window.scrollTo(0, y), track.top + ((track.h - track.vh) * i) / 14);
    await page.waitForTimeout(320);
    const heading = await page.locator(".world-caption .world-stage-line strong").innerText();
    if (!/refused/i.test(heading)) continue;
    sawRefusal = true;
    const caption = await page.locator(".world-caption").innerText();
    expect(caption.toLowerCase()).toContain("demonstration");
    expect(caption).toContain("0.3067");
    await expect(page.locator(".world-note[data-demonstration]")).toHaveCount(1);
  }
  expect(sawRefusal, "the refusal state was never reached").toBe(true);
});

test("no detail route ships a WebGL renderer before a reader scrolls", async ({ page }) => {
  /*
   * /work/medico used to arrive with 228 KB of three.js because its world's observer had a zero
   * root margin: the world sits under a short hero, so it was already intersecting on load. Six of
   * the eight worlds deferred it and two did not.
   */
  test.slow();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1280, height: 900 });

  for (const slug of ["medico", "transport-uq", "cifar10-cnn"]) {
    let initialJs = 0;
    const onResponse = async (r: { url: () => string; body: () => Promise<Buffer> }) => {
      if (!r.url().endsWith(".js")) return;
      try {
        initialJs += (await r.body()).length;
      } catch {
        /* a redirect or an aborted body; not counted */
      }
    };
    page.on("response", onResponse);
    await page.goto(`/work/${slug}`, { waitUntil: "networkidle" });
    page.off("response", onResponse);

    /*
     * The renderer alone is about 875 KB uncompressed. Anything under half of that means it has
     * not been pulled into the first load.
     */
    expect(initialJs, `${slug} ships too much JavaScript before any scroll`).toBeLessThan(1_400_000);
  }
});

test("the radiograph is only carried by the route that draws it", async ({ page }) => {
  /*
   * The packed field used to sit in a geometry module imported by the chapter registry, so /work
   * and every detail route inherited 36 KB of base64 and the Buffer polyfill its decoder pulled
   * in, while rendering no radiograph at all.
   */
  for (const route of ["/work", "/work/cifar10-cnn"]) {
    const scripts: string[] = [];
    page.on("response", async (r) => {
      if (!r.url().endsWith(".js")) return;
      try {
        const body = (await r.body()).toString("utf8");
        if (body.includes("RADIOGRAPH") || /Buffer size must be a multiple/.test(body)) {
          scripts.push(r.url());
        }
      } catch {
        /* ignore bodies that cannot be read */
      }
    });
    await page.goto(route, { waitUntil: "networkidle" });
    expect(scripts, `${route} should not carry the radiograph`).toHaveLength(0);
    page.removeAllListeners("response");
  }
});

test("the rating curve amplifies a fixed gauge error into a growing discharge interval", async ({
  page,
}) => {
  await page.goto("/work/hydrology-uq");
  const fig = page.locator(".rating-amp");
  await expect(fig).toHaveCount(1);

  const widthAt = async (label: string) => {
    await fig.getByRole("button", { name: label }).click();
    const text = await fig.locator("[data-output] .rating-amp-value").innerText();
    return Number.parseFloat(text);
  };

  const low = await widthAt("Low flow");
  const base = await widthAt("Base stage");
  const peak = await widthAt("Peak stage");

  /* The input never changes; only what the curve does with it. */
  await expect(fig.locator(".rating-amp-readout p").first()).toHaveText(/Measurement uncertainty/i);
  expect(await fig.innerText()).toContain("±25 cm");

  expect(low).toBeLessThan(base);
  expect(base).toBeLessThan(peak);
  /* And it lands on the seminar's own published band widths. */
  expect(base).toBeCloseTo(8.63, 1);
  expect(peak).toBeCloseTo(338, 0);

  /* The drawn input bracket is identical at both ends of the range. */
  const bracket = async (label: string) => {
    await fig.getByRole("button", { name: label }).click();
    return fig.locator(".rating-amp-input line").first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      return Math.round(r.width);
    });
  };
  expect(Math.abs((await bracket("Low flow")) - (await bracket("Peak stage")))).toBeLessThan(2);
});

test("the amplification is operable from the keyboard and readable without it", async ({ page }) => {
  await page.goto("/work/hydrology-uq");
  const fig = page.locator(".rating-amp");
  const slider = fig.locator('input[type="range"]');
  await slider.focus();
  const before = await fig.locator("output").innerText();
  for (let i = 0; i < 15; i += 1) await page.keyboard.press("ArrowRight");
  expect(await fig.locator("output").innerText()).not.toBe(before);

  /*
   * And the same information exists without touching the control at all: three positions, their
   * identical gauge uncertainty, and the interval each one produces.
   */
  const rows = fig.locator(".research-data-table tbody tr");
  await expect(rows).toHaveCount(3);
  expect(await rows.first().innerText()).toContain("±25 cm");
  expect(await fig.locator("figcaption").innerText()).toMatch(/25 cm/);
});

test("the amplification makes no forecasting claim", async ({ page }) => {
  await page.goto("/work/hydrology-uq");
  const text = (await page.locator(".rating-amp").innerText()).toLowerCase();
  for (const word of ["forecast horizon", "lead time", "confidence cone", "prediction interval", "coverage"]) {
    expect(text, `the amplification figure must not say "${word}"`).not.toContain(word);
  }
});

/*
 * A world that has been scrolled past must stop drawing.
 *
 * Every world used to mount once and then render for the rest of the session, because
 * react-three-fiber's default frameloop is "always" and the mount gate never flipped back. Parked
 * at the bottom of a case study, with the stage thousands of pixels above the viewport, the
 * hydrology renderer was still issuing about 4,700 draw calls a second at readers who had
 * finished with it.
 *
 * Draw calls are counted rather than frame rate, because a call issued is a call issued whatever
 * is rasterising it - so this guard means the same thing on the software renderer CI uses as it
 * does on a real adapter.
 */
/**
 * Make the renderer gate see a hardware adapter.
 *
 * Two guards in this file assert what a world does while it is *running*: that it stops issuing
 * draw calls once it leaves the viewport, and that the release scene labels its staged refusal.
 * Both need the scene to mount, and since `worldRenderingIsWorthIt()` started declining software
 * rasterisers they could not mount under the browser CI uses - the draw-call guard, which exists
 * because a parked hydrology renderer once kept issuing about 4,700 calls a second, would have
 * quietly stopped running.
 *
 * So the name is stubbed rather than the gate. `WEBGL_debug_renderer_info` is the only place the
 * adapter is named, so returning a hardware-sounding name from it is enough to let the scene
 * mount, and nothing in the application is changed or made aware of the test. Everything after
 * that point is the real renderer doing real work.
 */
async function presentAHardwareRenderer(page: Page) {
  await page.addInitScript(() => {
    const UNMASKED_RENDERER = 0x9246;
    for (const Ctx of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
      if (!Ctx) continue;
      const proto = Ctx.prototype as unknown as Record<string, unknown>;

      const getExtension = proto.getExtension as (this: unknown, name: string) => unknown;
      proto.getExtension = function (this: unknown, name: string) {
        if (name === "WEBGL_debug_renderer_info") {
          return { UNMASKED_RENDERER_WEBGL: UNMASKED_RENDERER, UNMASKED_VENDOR_WEBGL: 0x9245 };
        }
        return getExtension.call(this, name);
      };

      const getParameter = proto.getParameter as (this: unknown, p: number) => unknown;
      proto.getParameter = function (this: unknown, parameter: number) {
        if (parameter === UNMASKED_RENDERER) return "Test Hardware Adapter";
        return getParameter.call(this, parameter);
      };
    }
  });
}

for (const slug of ["hydrology-uq", "reliable-knowledge-systems", "medico"]) {
  test(`the ${slug} world stops drawing once it is off screen`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await presentAHardwareRenderer(page);
    await page.addInitScript(() => {
      (window as unknown as { __draws: number }).__draws = 0;
      const names = ["drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced"];
      for (const proto of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
        if (!proto) continue;
        for (const name of names) {
          const original = (proto.prototype as unknown as Record<string, unknown>)[name];
          if (typeof original !== "function") continue;
          (proto.prototype as unknown as Record<string, unknown>)[name] = function (
            this: unknown,
            ...args: unknown[]
          ) {
            (window as unknown as { __draws: number }).__draws += 1;
            return (original as (...a: unknown[]) => unknown).apply(this, args);
          };
        }
      }
    });

    await page.goto(`/work/${slug}`);
    const wide = await page.evaluate(() => window.innerWidth >= 1000);
    test.skip(!wide, "the worlds only mount on a desktop viewport");

    const stage = await page.evaluate(() => {
      const el = document.querySelector(".world-stage");
      return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null;
    });
    expect(stage).not.toBeNull();

    /* Walk down to it so the arrival gate fires. */
    for (let y = 0; y <= (stage ?? 0) + 600; y += 300) {
      await page.evaluate((to) => window.scrollTo(0, to), y);
      await page.waitForTimeout(120);
    }

    /*
     * Then wait for it to actually draw rather than guessing a duration. CI rasterises WebGL in
     * software, where fetching the deferred bundle, creating the context and compiling shaders
     * comfortably outlasts any fixed pause worth writing.
     */
    await page.waitForSelector(".world-canvas canvas, .thesis-world-canvas canvas", {
      timeout: 30_000,
    });
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __draws: number }).__draws), {
        timeout: 30_000,
        message: "the world should draw while it is on screen",
      })
      .toBeGreaterThan(0);
    const drawing = await page.evaluate(() => (window as unknown as { __draws: number }).__draws);

    /* Then leave, and let anything in flight settle. */
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(1200);
    const before = await page.evaluate(() => (window as unknown as { __draws: number }).__draws);
    await page.waitForTimeout(1500);
    const after = await page.evaluate(() => (window as unknown as { __draws: number }).__draws);

    expect(drawing).toBeGreaterThan(0);
    expect(after - before, "an off-screen world must not draw").toBeLessThanOrEqual(2);
  });
}

/* ============================================================================================
 * Regressions from the end-to-end audit of 13 Sep 2026.
 *
 * Each of these failed on the live site before it was fixed. They are written against behaviour
 * a reader would notice rather than against pixel positions, so they survive a redesign of the
 * thing they guard.
 * ========================================================================================== */

test("no page raises a hydration error", async ({ page }) => {
  /*
   * /work/medico threw React #418 on every load. The cause was an SVG <title> child used to name
   * a matrix cell: React 19 treats <title> as document metadata and hoists it to <head> wherever
   * it is rendered, so the server markup and the client tree disagreed - and the accessible name
   * never reached the cell it was written for. The rule this locks in is the general one.
   */
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  for (const route of ["/", "/work", "/work/medico", "/work/reliable-knowledge-systems", "/research/thesis"]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
  }

  expect(errors, `page errors: ${errors.join(" | ")}`).toHaveLength(0);
});

test("SVG shapes are named with aria-label, not a title child", async ({ page }) => {
  await page.goto("/work/medico");
  await expect(page.locator("svg title")).toHaveCount(0);
  await expect(page.locator("rect.medico-flat-cell[aria-label]").first()).toHaveCount(1);
});

test("captions on a dark hero use the stage ink", async ({ page }) => {
  /*
   * .scn-identity figcaption took the paper ink on these two routes because the dark override was
   * scoped to .case-stage and neither page uses it. It measured 1.83:1 against the hero, and was
   * the only serious axe violation on the site.
   */
  for (const route of ["/work/medico", "/work/reliable-knowledge-systems"]) {
    await page.goto(route);
    const colors = await page.locator("header.page-hero figcaption").first().evaluate((el) => ({
      text: getComputedStyle(el).color,
      background: getComputedStyle(document.body).backgroundColor,
    }));
    /* #354149 is the paper ink and is unreadable here; the stage ink is #9aa7b2. */
    expect(colors.text, `${route} caption colour`).not.toBe("rgb(53, 65, 73)");
  }
});

test("every live route is in the sitemap", async ({ request }) => {
  /*
   * /work/medico and /work/reliable-knowledge-systems have their own page files rather than
   * registry entries, so the generated sitemap - built from the project registry - omitted both.
   * They were linked, reachable, and invisible to a crawler.
   */
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const route of ["/work/medico", "/work/reliable-knowledge-systems", "/architecture"]) {
    expect(sitemap, `${route} missing from the sitemap`).toContain(`https://mzquadri.de${route}`);
  }
});

test("standalone controls are big enough to tap", async ({ page, isMobile }) => {
  /*
   * The footer links were 20px tall on every page, and the card actions, taxonomy chips and
   * back-links were between 15px and 23px. A link inside a sentence is exempt - WCAG 2.5.8 says
   * so, and enlarging one would break the paragraph - so only standalone controls are measured.
   */
  test.skip(!isMobile, "target size is a touch concern");

  for (const route of ["/", "/work", "/learn", "/about"]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");

    const small = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>("footer a, .topic-chips a, .rss-link, .back-link")) {
        const rect = el.getBoundingClientRect();
        if (!rect.height) continue;
        if (rect.height < 24) out.push(`${(el.textContent || "").trim().slice(0, 24)} ${Math.round(rect.height)}px`);
      }
      return out;
    });

    expect(small, `${route} has targets under 24px: ${small.join(", ")}`).toHaveLength(0);
  }
});

test("published links do not point at a deleted repository", async ({ page }) => {
  /*
   * The selective-prediction article cited mzquadri/ml-surrogates-thesis in its frontmatter and
   * in its prose. That repository was deleted rather than archived, so both answered 404 - the
   * only broken outbound link on the site.
   */
  await page.goto("/learn/selective-prediction-when-models-should-abstain");
  await expect(page.locator('a[href*="ml-surrogates-thesis"]')).toHaveCount(0);
  await expect(
    page.locator('a[href*="ml_surrogates_for_agent_based_transport_models"]').first(),
  ).toHaveCount(1);
});

/* ============================================================================================
 * The WebGL worlds, and the renderer they are willing to run on.
 *
 * Eight hosts, one gate, one test shape. Each world is a scroll-driven scene that renders
 * continuously while it is on screen, and until now none of them asked whether the machine had a
 * GPU: on a software rasteriser /work/cifar10-cnn reported "GPU stall due to ReadPixels" and
 * /research/thesis spent 2.4 seconds of main thread in long tasks. The flat figure under each one
 * is a complete drawing, which is what makes declining to render an acceptable answer rather
 * than a degraded one.
 * ========================================================================================== */

const WORLDS = [
  { name: "cifar", route: "/work/cifar10-cnn" },
  { name: "hydrology", route: "/work/hydrology-uq" },
  { name: "insureassist", route: "/work/insureassist-rag" },
  { name: "medico", route: "/work/medico" },
  { name: "mlops", route: "/work/mlops-reference-pipeline" },
  { name: "reliable", route: "/work/reliable-knowledge-systems" },
  { name: "streamflow", route: "/work/streamflow-forecasting" },
  { name: "thesis", route: "/research/thesis" },
] as const;

/* The thesis world predates the shared `world-stage` class and keeps its own. */
const WORLD_STAGE = ".world-stage, .thesis-world";
const WORLD_CANVAS = ".world-canvas canvas, .thesis-world-canvas canvas";

/** The renderer names the gate treats as "no GPU is doing this". */
const SOFTWARE_RENDERER =
  /swiftshader|llvmpipe|softpipe|basic render|software adapter|generic renderer/i;

for (const world of WORLDS) {
  test(`the ${world.name} world matches its renderer`, async ({ browser }, testInfo) => {
    /*
     * Its own context, and that detail is the test. Both projects in playwright.config.ts set
     * `reducedMotion: "reduce"`, and the motion gate comes first, so a world never mounts
     * anywhere else in this suite - two earlier drafts of this passed with the fix reverted,
     * reporting "no canvas" for the wrong reason. It also needs a viewport at or above the
     * 1000px minimum every host shares.
     *
     * Playwright's headless browser is itself a software rasteriser, so a default run exercises
     * the software branch; a run on a machine with a GPU exercises the other. Both are asserted,
     * so neither path can rot.
     */
    testInfo.skip(testInfo.project.name !== "desktop-chromium", "one browser is enough");

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "no-preference",
    });

    /* Count application-side readbacks. There were never any; this keeps it that way. */
    await context.addInitScript(() => {
      (window as unknown as { __readbacks: number }).__readbacks = 0;
      for (const Ctx of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
        if (!Ctx) continue;
        for (const method of ["readPixels", "getBufferSubData"] as const) {
          const original = (Ctx.prototype as unknown as Record<string, unknown>)[method];
          if (typeof original !== "function") continue;
          (Ctx.prototype as unknown as Record<string, unknown>)[method] = function (
            this: unknown,
            ...args: unknown[]
          ) {
            (window as unknown as { __readbacks: number }).__readbacks += 1;
            return (original as (...a: unknown[]) => unknown).apply(this, args);
          };
        }
      }
    });

    const page = await context.newPage();
    const stalls: string[] = [];
    page.on("console", (message) => {
      if (/ReadPixels|GPU stall/i.test(message.text())) stalls.push(message.text());
    });

    try {
      await page.goto(world.route);
      await page.waitForLoadState("networkidle");

      const renderer = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
        if (!gl) return "none";
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        if (!info) return "unknown";
        return String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? "unknown");
      });
      const software = renderer === "none" || SOFTWARE_RENDERER.test(renderer);

      const stage = page.locator(WORLD_STAGE).first();
      await expect(stage).toHaveCount(1);

      /* Satisfy the visibility gate, so only the renderer gate decides the outcome. */
      await stage.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1200);

      /* The flat figure is the content of record and is present whichever way the gate falls. */
      const stageText = (await stage.innerText()).trim();
      expect(stageText.length, `${world.name} lost its flat figure`).toBeGreaterThan(40);

      const canvases = page.locator(WORLD_CANVAS);
      if (software) {
        await expect(canvases, `${world.name} must not render through ${renderer}`).toHaveCount(0);
        expect(stalls, `${world.name} GPU stalls: ${stalls.join(" | ")}`).toHaveLength(0);
      } else {
        await expect(
          canvases,
          `${world.name} should still get its scene on ${renderer}`,
        ).toHaveCount(1);
      }

      const readbacks = await page.evaluate(
        () => (window as unknown as { __readbacks: number }).__readbacks,
      );
      expect(readbacks, `${world.name} performed ${readbacks} application readback(s)`).toBe(0);
    } finally {
      await context.close();
    }
  });
}

test("the renderer probe creates one context and hands it back", async ({ browser }, testInfo) => {
  /*
   * Every world host calls the probe, so a page carrying one must still spend only a single probe
   * context - browsers cap live WebGL contexts, and a page that spends them on probes can find
   * itself unable to create the one it wants to draw with. The module memoises its answer and
   * releases the probe through WEBGL_lose_context; this asserts the budget that depends on both.
   */
  testInfo.skip(testInfo.project.name !== "desktop-chromium", "one browser is enough");

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "no-preference",
  });
  await context.addInitScript(() => {
    (window as unknown as { __made: number }).__made = 0;
    const original = HTMLCanvasElement.prototype.getContext;
    (HTMLCanvasElement.prototype as unknown as Record<string, unknown>).getContext = function (
      this: HTMLCanvasElement,
      type: string,
      attrs?: unknown,
    ) {
      if (/webgl/.test(type)) (window as unknown as { __made: number }).__made += 1;
      return (original as (...a: unknown[]) => unknown).call(this, type, attrs);
    };
  });

  const page = await context.newPage();
  try {
    await page.goto("/research/thesis");
    await page.waitForLoadState("networkidle");
    await page.locator(WORLD_STAGE).first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    const made = await page.evaluate(() => (window as unknown as { __made: number }).__made);
    /* One probe, plus at most the scene's own context where the gate allowed one. */
    expect(made, `${made} WebGL contexts requested on one document`).toBeLessThanOrEqual(2);
  } finally {
    await context.close();
  }
});
