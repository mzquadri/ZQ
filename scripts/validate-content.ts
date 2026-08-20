import { existsSync } from "node:fs";
import { resolve } from "node:path";

import {
  capabilities,
  getFeaturedProjects,
  navigation,
  projects,
  researchEvidence,
  site,
  thesis,
} from "../src/content/portfolio";
import {
  currentPublicFacts,
  publishedFacts,
  sourceTiers,
  truthRegistry,
  type TruthFact,
} from "../src/content/truth";

const failures: string[] = [];
const projectSlugs = new Set<string>();
const projectBySlug = new Map(projects.map((project) => [project.slug, project]));

function check(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function collectFacts(value: unknown, path = "truthRegistry"): Array<[string, TruthFact<unknown>]> {
  if (!value || typeof value !== "object") return [];

  const factMarkers = ["value", "source", "verifiedAt", "reviewAfter", "public"];
  if (factMarkers.some((key) => key in value)) {
    const requiredKeys = ["value", "source", "verifiedAt", "public"];
    for (const key of requiredKeys) {
      check(key in value, `${path} is missing required fact property: ${key}`);
    }

    if (!requiredKeys.every((key) => key in value)) return [];
    return [[path, value as TruthFact<unknown>]];
  }

  return Object.entries(value).flatMap(([key, child]) => collectFacts(child, `${path}.${key}`));
}

const truthFacts = collectFacts(truthRegistry);
for (const [path, fact] of truthFacts) {
  check(sourceTiers.includes(fact.source.tier), `${path} has an invalid source tier`);
  check(fact.source.reference.trim().length > 0, `${path} has no source reference`);
  check(isIsoDate(fact.verifiedAt), `${path} has an invalid verifiedAt date`);
  if (fact.reviewAfter) {
    check(isIsoDate(fact.reviewAfter), `${path} has an invalid reviewAfter date`);
    check(fact.reviewAfter >= fact.verifiedAt, `${path} is due for review before it was verified`);
  }
}

const now = Date.now();
for (const fact of publishedFacts) {
  check(fact.public, `Published fact is not approved for public use: ${fact.source.reference}`);
}

for (const fact of currentPublicFacts) {
  check(fact.public, `Current fact is not approved for public use: ${fact.source.reference}`);
  check(Boolean(fact.reviewAfter), `Current public fact has no reviewAfter date: ${fact.source.reference}`);
  if (fact.reviewAfter && isIsoDate(fact.reviewAfter)) {
    check(
      Date.parse(`${fact.reviewAfter}T23:59:59Z`) >= now,
      `Current public fact is stale and must be re-verified: ${fact.source.reference}`,
    );
  }
}

for (const project of projects) {
  check(!projectSlugs.has(project.slug), `Duplicate project slug: ${project.slug}`);
  projectSlugs.add(project.slug);
  check(project.evidence.length > 0, `${project.slug} has no evidence`);
  check(project.limitations.length > 0, `${project.slug} has no limitations`);
  check(project.quality.length > 0, `${project.slug} has no quality controls`);
  check(project.authors.length > 0, `${project.slug} has no authorship record`);
  check(project.projectRole.trim().length > 0, `${project.slug} has no project role`);
  check(project.repository.startsWith("https://github.com/"), `${project.slug} has a non-GitHub repository URL`);
}

const hydrology = projectBySlug.get("hydrology-uq");
check(hydrology?.authors.length === 3, "Hydrology group work must credit all three authors");
check(hydrology?.projectRole.includes("Group contributor") ?? false, "Hydrology role must not imply sole ownership");

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
  "zero bugs",
  "Mohd_Zamin_CV.pdf",
  "graduated",
  "degree awarded",
];

for (const claim of forbiddenClaims) {
  check(!publicContent.toLowerCase().includes(claim.toLowerCase()), `Forbidden or unsupported claim found: ${claim}`);
}

check(!/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(publicContent), "Public content contains an email address");
check(!/\+\d[\d\s()-]{7,}/.test(publicContent), "Public content contains a phone number");
const featuredProjectSlugs: readonly string[] = truthRegistry.portfolio.featuredProjectSlugs.value;
check(new Set(featuredProjectSlugs).size === featuredProjectSlugs.length, "Featured project slugs must be unique");
for (const slug of featuredProjectSlugs) {
  check(projectBySlug.has(slug), `Featured project references unknown project: ${slug}`);
}
check(getFeaturedProjects().length === featuredProjectSlugs.length, "Featured project registry is inconsistent");
check(thesis.status.includes("submitted"), "Thesis status must use submitted wording");
check(thesis.repository === "https://github.com/mzquadri/ml-surrogates-thesis", "Thesis repository must use the canonical URL");
check(researchEvidence.selectiveRisk.points.length === 3, "Selective-risk figure requires three reviewed points");
check(researchEvidence.calibrationProtocols.length === 2, "Expected two distinct calibration protocols");

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${truthFacts.length} truth facts, ${projects.length} projects, ${capabilities.length} capability groups, and ${requiredFiles.length} route files.`,
);
