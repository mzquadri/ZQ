import { chromium } from "@playwright/test";
const ROUTES = ["/work/transport-uq","/work/reliable-knowledge-systems","/work/medico","/work/insureassist-rag","/work/mlops-reference-pipeline","/work/hydrology-uq","/work/streamflow-forecasting","/work/cifar10-cnn"];
const b = await chromium.launch();
let worst = 0, total = 0;
for (const w of [1024, 1440]) {
  for (const route of ROUTES) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    const p = await ctx.newPage();
    await p.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    });
    await p.goto("http://127.0.0.1:3100" + route, { waitUntil: "networkidle" });
    await p.evaluate(async () => { for (let y=0;y<document.body.scrollHeight;y+=240){scrollTo(0,y);await new Promise(r=>requestAnimationFrame(r));} });
    await p.waitForTimeout(1200);
    const cls = await p.evaluate(() => window.__cls);
    total += cls; if (cls > worst) worst = cls;
    if (cls > 0.005) console.log(`  ${w} ${route.padEnd(36)} ${cls.toFixed(4)}`);
    await ctx.close();
  }
}
console.log(`WORST ${worst.toFixed(4)}  TOTAL ${total.toFixed(4)}`);
await b.close();
