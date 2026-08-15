import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { capabilities, navigation, projects, researchEvidence, site, thesis } from "../src/content/portfolio";

const failures: string[] = [];
const projectSlugs = new Set<string>();
const projectBySlug = new Map(projects.map((project) => [project.slug, project]));

function check(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

for (const project of projects) {
  check(!projectSlugs.has(project.slug), `Duplicate project slug: ${project.slug}`);
  projectSlugs.add(project.slug);
  check(project.evidence.length > 0, `${project.slug} has no evidence`);
  check(project.limitations.length > 0, `${project.slug} has no limitations`);
  check(project.quality.length > 0, `${project.slug} has no quality controls`);
  check(project.repository.startsWith("https://github.com/"), `${project.slug} has a non-GitHub repository URL`);
}

for (const capability of capabilities) {
  for (const slug of capability.proof) {
    check(projectBySlug.has(slug), `${capability.title} references unknown project: ${slug}`);
  }
}

for (const item of navigation) {
  check(item.href.startsWith("/"), `Navigation is not site-relative: ${item.href}`);
}

const requiredFiles = [
  "src/app/page.tsx",
  "src/app/work/page.tsx",
  "src/app/research/page.tsx",
  "src/app/about/page.tsx",
  "src/app/contact/page.tsx",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "src/app/opengraph-image.tsx",
  "src/app/not-found.tsx",
];

for (const path of requiredFiles) {
  check(existsSync(resolve(path)), `Required route or metadata file is missing: ${path}`);
}

const publicContent = JSON.stringify({ capabilities, navigation, projects, researchEvidence, site, thesis });
const forbiddenClaims = [
  "production-grade",
  "Dean's List",
  "18+",
  "88.7%",
  "Mohd_Zamin_CV.pdf",
  "graduated",
  "degree awarded",
];

for (const claim of forbiddenClaims) {
  check(!publicContent.toLowerCase().includes(claim.toLowerCase()), `Forbidden or unsupported claim found: ${claim}`);
}

check(!/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(publicContent), "Public content contains an email address");
check(!/\+\d[\d\s()-]{7,}/.test(publicContent), "Public content contains a phone number");
check(projects.length === 6, "Expected six evidence-reviewed projects");
check(projects.filter((project) => project.featured).length === 4, "Expected four featured projects");
check(thesis.status.includes("submitted"), "Thesis status must use submitted wording");
check(researchEvidence.selectiveRisk.points.length === 3, "Selective-risk figure requires three reviewed points");
check(researchEvidence.calibrationProtocols.length === 2, "Expected two distinct calibration protocols");

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${projects.length} projects, ${capabilities.length} capability groups, and ${requiredFiles.length} route files.`);
