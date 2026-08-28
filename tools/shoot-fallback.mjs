/** A world's static states: phone, and reduced motion at desktop width. */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const route = process.argv[2] ?? "/work/medico";
const out = process.argv[3] ?? "fallback";
await mkdir(out, { recursive: true });
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const [name, opts] of [
  ["m390", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
  ["m320", { viewport: { width: 320, height: 800 }, isMobile: true, hasTouch: true }],
  ["reduced", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }],
]) {
  const ctx = await b.newContext(opts);
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:3400${route}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  const info = await p.evaluate(() => {
    const w = document.querySelector(".world-stage, .thesis-world");
    const t = w?.querySelector(".world-track, .thesis-world-track");
    return {
      mode: w?.getAttribute("data-mode"),
      trackH: t ? Math.round(t.getBoundingClientRect().height) : null,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  console.log(name, JSON.stringify(info));
  await p.evaluate(() => document.querySelector(".world-flat")?.scrollIntoView());
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/${name}.png` });
  await ctx.close();
}
await b.close();
