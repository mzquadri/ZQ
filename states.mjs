import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const slug = process.argv[2];
await p.goto(`http://127.0.0.1:3100/work/${slug}`, { waitUntil: "networkidle" });
const track = await p.evaluate(() => {
  const t = document.querySelector(".world-track");
  const r = t.getBoundingClientRect();
  return { top: Math.round(r.top + scrollY), h: Math.round(r.height), vh: innerHeight };
});
const span = track.h - track.vh;
const seen = [];
for (let i = 0; i <= 12; i += 1) {
  await p.evaluate((y) => scrollTo(0, y), track.top + span * (i / 12));
  await p.waitForTimeout(500);
  const label = await p.evaluate(() => {
    const l = document.querySelector(".world-caption .world-stage-line");
    return l ? l.innerText.replace(/\n/g, " | ").slice(0, 70) : "-";
  });
  if (!seen.includes(label)) { seen.push(label); console.log(String(i).padStart(2), label); }
}
await b.close();
