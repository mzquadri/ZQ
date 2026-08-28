/** Route payload split by when it is paid, per reader profile. */
import { chromium } from "@playwright/test";
const route = process.argv[2] ?? "/work/medico";
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const [name, opts] of [
  ["desktop", { viewport: { width: 1440, height: 900 } }],
  ["reduced", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }],
  ["mobile", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
]) {
  const ctx = await b.newContext(opts);
  const p = await ctx.newPage();
  const js = []; let phase = "initial"; let three = false;
  p.on("response", async (r) => {
    if (!r.url().endsWith(".js")) return;
    const body = await r.body().catch(() => null);
    if (!body) return;
    js.push({ bytes: body.length, phase });
    if (/three\.module|WebGLRenderer/.test(body.toString("utf8"))) three = true;
  });
  await p.goto(`http://127.0.0.1:3400${route}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const threeOnArrival = three;
  phase = "scroll";
  for (let i = 1; i <= 16; i += 1) {
    await p.evaluate((f) => { const m = document.documentElement.scrollHeight - innerHeight; scrollTo({ top: m * (f / 16), behavior: "instant" }); }, i);
    await p.waitForTimeout(320);
  }
  await p.waitForTimeout(1200);
  const k = (n) => Math.round(n / 1024) + "k";
  const sum = (ph) => js.filter((f) => f.phase === ph).reduce((a, f) => a + f.bytes, 0);
  console.log(`${name.padEnd(8)} initial=${k(sum("initial")).padStart(6)}  on-scroll=${k(sum("scroll")).padStart(6)}  three-on-arrival=${threeOnArrival}  three-ever=${three}`);
  await ctx.close();
}
await b.close();
