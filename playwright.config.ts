import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  /*
   * Only `.spec.ts`. The default is `**\/*.@(spec|test).?(c|m)[jt]s?(x)`, which
   * matches both halves of a directory holding two unrelated kinds of test.
   *
   * `tests/` has one Playwright suite, `portfolio.spec.ts`, and eight
   * `node:test` suites that `npm run test:content` runs with `tsx --test`.
   * Those eight call `test()` at module scope, so Playwright did not merely
   * collect them: importing a file to look for Playwright tests inside it ran
   * the node suite as a side effect. `playwright test --list`, which should
   * print names and execute nothing, emitted TAP output from the content
   * tests and exited non-zero.
   *
   * The suites themselves are fine and pass under their own runner. This is
   * about which runner owns which file.
   */
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        contextOptions: { reducedMotion: "reduce" },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"],
        contextOptions: { reducedMotion: "reduce" },
      },
    },
  ],
  webServer: {
    command: "npm start -- -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
