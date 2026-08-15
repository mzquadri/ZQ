import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/work",
  "/research",
  "/about",
  "/contact",
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

    if (route === "/research" && (page.viewportSize()?.width ?? 0) <= 640) {
      const firstProtocolCell = page.locator(".protocol-table tbody th").first();
      await expect(firstProtocolCell).toHaveAttribute("data-label", "Protocol");
      expect(await firstProtocolCell.evaluate((cell) => getComputedStyle(cell, "::before").content)).toBe('"Protocol"');
    }

    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflows).toBe(false);
    expect(consoleErrors).toEqual([]);

    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
    expect(serious).toEqual([]);
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

test("contact route exposes no form, email, phone, or broken resume action", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  await expect(page.locator(`.contact-links a[href="https://www.linkedin.com/in/mohd-zamin/"]`)).toBeVisible();
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

  const missingProject = await request.get("/work/not-an-evidence-backed-project");
  expect(missingProject.status()).toBe(404);
  expect(await missingProject.text()).toContain("This route does not exist.");
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
    ["/about", "About"],
    ["/contact", "Contact"],
    ["/work/transport-uq", "Reliable GNN Surrogates for Transport Policy Analysis"],
  ] as const;

  for (const [route, title] of routeMetadata) {
    await page.goto(route);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://mzquadri.de${route}`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://mzquadri.de${route}`);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", title);
  }
});

test("homepage makes no third-party requests and mounts no canvas", async ({ page }) => {
  const remoteRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== "http://127.0.0.1:3100") remoteRequests.push(url.origin);
  });
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(remoteRequests).toEqual([]);
});
