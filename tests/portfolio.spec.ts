import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/work",
  "/research",
  "/research/thesis",
  "/about",
  "/contact",
  "/resume",
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
  await page.getByRole("link", { name: "Reliable GNN Surrogates for Transport Policy Analysis", exact: true }).click();
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

test("contact route exposes approved channels and the canonical resume", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator('a[href="/mohd-zamin-quadri-resume.pdf"]')).toBeVisible();
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
    ["/resume", "Resume"],
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

test("resume publishes approved records without disputed experience dates", async ({ page, request }) => {
  await page.goto("/resume");
  await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible();
  await expect(page.getByText("AI Engineer (Working Student)", { exact: true })).toBeVisible();
  await expect(page.getByText("Intern, Programming of Workflows and Linking of Databases", { exact: true })).toBeVisible();
  await expect(page.getByText("B.Sc. (Hons.) Mathematics", { exact: true })).toBeVisible();
  await expect(page.getByText("M.Sc. program: Mathematics in Science and Engineering", { exact: true })).toBeVisible();
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);

  for (const context of await page.locator(".career-context").allTextContents()) {
    expect(context).not.toMatch(/20\d{2}/);
  }

  const pdf = await request.get("/mohd-zamin-quadri-resume.pdf");
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
  expect(pdf.headers()["content-disposition"]).toContain("mohd-zamin-quadri-resume.pdf");
  expect(Number(pdf.headers()["content-length"])).toBeGreaterThan(20_000);
  const pdfStructure = (await pdf.body()).toString("latin1");
  expect(pdfStructure).toMatch(/\/MarkInfo\s*<<[\s\S]*?\/Marked\s+true/);
  expect(pdfStructure).not.toContain("/S /Strong");
});

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
  const pinned = page.locator('a[href*="226ef7f1ec3d02d19f51327689e4c736854473cc"]');
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
  // The homepage presents MLOps as its own chapter rather than as a card of evidence rows.
  // "Slice-aware evaluation" was a phrase on the old card and is deliberately no longer
  // anywhere on this page; what has to stay true is the boundary asserted below.
  await expect(main.locator("#work-mlops-reference-pipeline")).toContainText(
    "A Testable End-to-End MLOps Pipeline",
  );
  await expect(main).not.toContainText(/licensed-data run/i);

  // A featured card may lead with the project's headline number - that is the point of
  // the card. What the homepage must not do is restate the case study's whole evidence
  // table, so the supporting rows stay off it.
  await expect(main).toContainText("0.8067");
  await expect(main).not.toContainText("1,800 / 600 / 600");
  await expect(main).not.toContainText("Byte-identical");
  await expect(main).not.toContainText("99 tests");
});

test("core recruiter routes reflow at 320 pixels", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const route of ["/", "/work", "/resume", "/work/mlops-reference-pipeline", "/work/legal-knowledge-platform", "/research", "/research/thesis", "/learn", "/learn/selective-prediction-when-models-should-abstain"]) {
    await page.goto(route);
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflows, `${route} must not overflow at 320px`).toBe(false);
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
  await page.goto("/work");
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
  await page.goto("/work");
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

  const repositoryLinks = index.locator('a[href^="https://github.com/mzquadri/"]');
  await expect(repositoryLinks).toHaveCount(13);

  await expect(
    index.locator('a[href="https://github.com/mzquadri/Battery-SOC-Estimation-ML"]'),
  ).toBeVisible();
  await expect(index.getByText(/renders identically if GitHub is unavailable/)).toBeVisible();

  // No fabricated activity metrics are published.
  await expect(index.getByText(/\d+\s*(stars?|forks?|watchers?|contributions?)/i)).toHaveCount(0);
});

test("the repository showcase strip is the content of record", async ({ page }) => {
  await page.goto("/work");
  const showcase = page.locator('[data-showcase="flagship"]');

  // Four flagship cards, each carrying its parts as readable rows.
  await expect(showcase.locator("li h3")).toHaveCount(4);
  await expect(showcase.getByText("Reliable GNN Surrogates for Transport Policy")).toBeVisible();
  await expect(showcase.getByText("Uncertainty Quantification").first()).toBeVisible();
  await expect(showcase.getByText("Focus area").first()).toBeVisible();
  await expect(showcase.getByText("Evidence boundary").first()).toBeVisible();
  await expect(showcase.getByText("Portfolio status").first()).toBeVisible();

  // Anything the 3D layer could show is on the card: label, kind, repo, last commit.
  await expect(showcase.getByText(/Last public commit/).first()).toBeVisible();
});

test("the 3D layer never mounts where it should not", async ({ page }) => {
  await page.goto("/work");
  const host = page.locator("[data-mode]").first();

  // Playwright runs every project with reducedMotion: "reduce", and the mobile project is
  // narrower than the island's floor, so the layer must stay off in both.
  await expect(host).toHaveAttribute("data-mode", "static");
  await expect(page.locator("#ecosystem canvas")).toHaveCount(0);

  // And the record is still complete without it.
  await expect(page.locator('[data-showcase="flagship"] li h3')).toHaveCount(4);
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

test("resume is reachable but is not a conversion call to action", async ({ page }) => {
  await page.goto("/");
  /*
   * The resume is now a peer destination in the rail, which is a deliberate change: it is one of
   * the six places a visitor may want to go, and hiding it made them hunt. What must stay true is
   * the original point of this test - the resume is not *pushed*. It is not a button, it is not a
   * call to action in the page body, and the site does not try to convert a reader into a
   * download instead of into reading the work.
   */
  await expect(page.locator('nav[aria-label="Primary navigation"] a[href="/resume"]')).toHaveCount(1);
  await expect(page.locator('main a.cine-cta[href="/resume"]')).toHaveCount(0);
  await expect(page.locator('main a.button[href="/resume"]')).toHaveCount(0);
  await expect(page.locator('main a[href="/mohd-zamin-quadri-resume.pdf"]')).toHaveCount(0);
  await expect(page.locator('footer a[href="/resume"]')).toHaveCount(1);

  await page.goto("/contact");
  await expect(page.locator(".contact-note a.button")).toHaveCount(0);
  await expect(page.locator(".resume-footnote a[href='/resume']")).toBeVisible();

  await page.goto("/about");
  await expect(page.locator("main a.button[href='/resume']")).toHaveCount(0);
});

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
  // Each row links twice - from its heading and from its "Case study" affordance.
  const rowLinks = page.locator('a[href="/work/legal-knowledge-platform"]');
  await expect(rowLinks).toHaveCount(2);
  await expect(rowLinks.first()).toHaveText("Stored is not the same as correct");
  await expect(
    page.locator(".project-row", { hasText: "Stored is not the same as correct" }),
  ).toContainText("Employer engineering");
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
  const sizes = await Promise.all(
    scripts.map(async (src) => {
      const response = await page.request.get(new URL(src, page.url()).toString());
      return (await response.body()).byteLength;
    }),
  );
  const total = sizes.reduce((sum, size) => sum + size, 0);
  expect(total, "no route script may be large enough to contain a 3D renderer").toBeLessThan(900_000);

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

test("the public systems showcase renders on the work page", async ({ page }) => {
  await page.goto("/work");

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
  await page.goto("/work");

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

  await page.goto("/work", { waitUntil: "networkidle" });

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
  await page.goto("/work");

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
