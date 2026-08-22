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

test("primary navigation and project routes work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Work", exact: true }).click();
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
  await expect(page.getByRole("link", { name: "Work", exact: true })).toBeFocused();

  await page.getByRole("link", { name: "Skip to main content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("mobile primary navigation meets minimum target sizing", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 640, "Mobile viewport only");
  await page.goto("/");

  for (const link of await page.locator(".nav-list a").all()) {
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
    ["/work/insureassist-rag", "InsureAssist: Grounded RAG Service"],
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
  await expect(main).toContainText("Slice-aware evaluation");
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
  for (const route of ["/", "/work", "/resume", "/work/mlops-reference-pipeline", "/research", "/research/thesis", "/learn", "/learn/selective-prediction-when-models-should-abstain"]) {
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
  await expect(page.locator("#systems-graph")).toBeVisible();
  expect(remoteRequests).toEqual([]);
});

test("the systems graph paints in 3D on desktop and falls back below it", async ({ page }) => {
  await page.goto("/");
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
  await page.goto("/");
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
  await expect(page.locator('nav[aria-label="Primary navigation"] a[href="/resume"]')).toHaveCount(0);
  await expect(page.locator('main a[href="/resume"]')).toHaveCount(0);
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
