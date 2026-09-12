/*
 * Render the published CV.
 *
 * The document is generated from `src/content/cv.ts` rather than maintained as a binary, so the
 * facts on the page and the facts in the PDF cannot drift apart: change the content module and
 * run this, and there is no second copy to forget.
 *
 * It is the web-safe record. No phone number, no street address and no photograph appear here,
 * because they are not in the content module the renderer reads.
 *
 *   npx tsx tools/gen-cv.ts
 */
import { mkdirSync, writeFileSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { cv, type CvRole } from "../src/content/cv";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "public", "mohd-zamin-quadri-cv.pdf");
const scratch = join(root, ".cv-render.html");

const escape = (value: unknown) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const points = (list: readonly string[]) =>
  `<ul>${list.map((point) => `<li>${escape(point)}</li>`).join("")}</ul>`;

const roles = (list: readonly CvRole[]) =>
  list
    .map(
      (role) => `
      <article class="role">
        <div class="role-head">
          <div>
            <h3>${escape(role.title)}</h3>
            <p class="org">${escape(role.organization)}</p>
          </div>
          <div class="when">
            <p class="period">${escape(role.period)}</p>
            <p class="where">${escape(role.location)}</p>
          </div>
        </div>
        ${points(role.points)}
      </article>`,
    )
    .join("");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escape(cv.name)} - Curriculum vitae</title>
<style>
  @page { size: A4; margin: 12mm 14mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Segoe UI", -apple-system, system-ui, Arial, sans-serif;
    font-size: 8.8pt;
    line-height: 1.4;
    color: #111820;
  }
  a { color: #004c47; text-decoration: none; }
  header { border-bottom: 1.5pt solid #111820; padding-bottom: 7pt; }
  h1 { margin: 0; font-size: 21pt; letter-spacing: -0.015em; }
  .role-line { margin: 3pt 0 0; font-size: 10pt; color: #354149; }
  .contact { margin: 6pt 0 0; font-size: 8.4pt; color: #354149; }
  .contact span::after { content: "  ·  "; color: #9aa4ab; }
  .contact span:last-child::after { content: ""; }
  h2 {
    margin: 11pt 0 5pt;
    font-size: 8pt;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    color: #006d65;
    border-bottom: 0.5pt solid #d7d2c4;
    padding-bottom: 3pt;
  }
  .profile { margin: 7pt 0 0; }
  .role { margin-bottom: 7pt; break-inside: avoid; }
  .role-head { display: flex; justify-content: space-between; gap: 10pt; align-items: baseline; }
  .role h3 { margin: 0; font-size: 9.8pt; }
  .org { margin: 1pt 0 0; font-size: 8.8pt; color: #354149; font-style: italic; }
  .when { text-align: right; white-space: nowrap; }
  .period { margin: 0; font-size: 8.6pt; font-weight: 600; }
  .where { margin: 1pt 0 0; font-size: 8.2pt; color: #5a6670; }
  ul { margin: 4pt 0 0; padding-left: 12pt; }
  li { margin-bottom: 2pt; }
  .edu { display: flex; justify-content: space-between; gap: 10pt; align-items: baseline; }
  .edu h3 { margin: 0; font-size: 9.6pt; }
  .edu-note { margin: 2pt 0 6pt; color: #354149; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; vertical-align: top; width: 30%; padding: 2pt 8pt 2pt 0; font-size: 8.6pt; }
  td { vertical-align: top; padding: 2pt 0; color: #354149; }
  .two { display: flex; gap: 18pt; break-inside: avoid; }
  .two > section { flex: 1; }
  .cert { margin-bottom: 5pt; break-inside: avoid; }
  .cert-name { margin: 0; font-size: 8.8pt; font-weight: 600; }
  .cert-meta { margin: 1pt 0 0; font-size: 8.2pt; color: #5a6670; font-style: italic; }
  tr, .edu { break-inside: avoid; }
  footer { margin-top: 10pt; border-top: 0.5pt solid #d7d2c4; padding-top: 5pt; font-size: 7.6pt; color: #5a6670; }
</style></head><body>

<header>
  <h1>${escape(cv.name)}</h1>
  <p class="role-line">${escape(cv.role)} &middot; ${escape(cv.location)}</p>
  <p class="contact">
    <span><a href="mailto:${escape(cv.email)}">${escape(cv.email)}</a></span>
    <span><a href="${escape(cv.domain)}">${escape(cv.domain.replace(/^https?:\/\//, ""))}</a></span>
    <span><a href="${escape(cv.github)}">${escape(cv.github.replace(/^https?:\/\//, ""))}</a></span>
    <span><a href="${escape(cv.linkedin)}">LinkedIn</a></span>
  </p>
</header>

<p class="profile">${escape(cv.profile)}</p>

<h2>Professional experience</h2>
${roles(cv.experience)}

<h2>Research</h2>
${roles(cv.research)}

<h2>Education</h2>
${cv.education
  .map(
    (record) => `
  <div class="edu">
    <div><h3>${escape(record.credential)}</h3><p class="org">${escape(record.institution)}</p></div>
    <div class="when"><p class="period">${escape(record.period)}</p><p class="where">${escape(record.location)}</p></div>
  </div>
  <p class="edu-note">${escape(record.note)}</p>`,
  )
  .join("")}

<h2>Technical skills</h2>
<table>${cv.skills
  .map((group) => `<tr><th>${escape(group.label)}</th><td>${escape(group.items)}</td></tr>`)
  .join("")}</table>

<div class="two">
  <section>
    <h2>Certifications</h2>
    ${cv.certifications
      .map(
        (entry) => `
      <div class="cert">
        <p class="cert-name">${escape(entry.title)}</p>
        <p class="cert-meta">${escape(entry.issuer)} &middot; ${escape(entry.awarded)}</p>
      </div>`,
      )
      .join("")}
  </section>
  <section>
    <h2>Languages</h2>
    <table>${cv.languages
      .map((entry) => `<tr><th>${escape(entry.language)}</th><td>${escape(entry.level)}</td></tr>`)
      .join("")}</table>
  </section>
</div>

<footer>
  Architecture case studies: <a href="${escape(cv.architecture)}">${escape(
    cv.architecture.replace(/^https?:\/\//, ""),
  )}</a>.
  Generated from the published fact registry at ${escape(cv.domain.replace(/^https?:\/\//, ""))}.
</footer>

</body></html>`;

async function render() {
  writeFileSync(scratch, html, "utf8");
  mkdirSync(dirname(out), { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto("file://" + scratch.replace(/\\/g, "/"), { waitUntil: "load" });
    await page.pdf({ path: out, format: "A4", printBackground: true });
  } finally {
    await browser.close();
    rmSync(scratch, { force: true });
  }

  console.log(
    `wrote public/mohd-zamin-quadri-cv.pdf  ${(statSync(out).size / 1024).toFixed(0)} KB`,
  );

}

render().catch((error) => {
  console.error(error);
  process.exit(1);
});
