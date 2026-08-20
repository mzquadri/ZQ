import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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
import { getResumeSourceSha256, sha256, type ResumeManifest } from "./resume-contract";

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
  for (const artifact of project.artifacts ?? []) {
    check(artifact.href.startsWith("https://github.com/"), `${project.slug} has a non-GitHub artifact URL`);
    check(artifact.note.trim().length > 0, `${project.slug} has an undocumented artifact link`);
  }
}

for (const slug of ["transport-uq", "mlops-reference-pipeline"]) {
  const project = projectBySlug.get(slug);
  check(Boolean(project?.systemSummary), `${slug} must explain its system architecture`);
  check((project?.artifacts?.length ?? 0) >= 3, `${slug} must link at least three inspection points`);
  check(Boolean(project?.nextStep), `${slug} must state its next evidence milestone`);
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
  "src/app/resume/page.tsx",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "src/app/opengraph-image.tsx",
  "src/app/not-found.tsx",
  "src/app/work/[slug]/opengraph-image.tsx",
  "public/mohd-zamin-quadri-resume.pdf",
  "public/mohd-zamin-quadri-resume.manifest.json",
];

for (const path of requiredFiles) {
  check(existsSync(resolve(path)), `Required route or metadata file is missing: ${path}`);
}

const publicContent = JSON.stringify({ capabilities, navigation, projects, researchEvidence, site, thesis });
const publicSourceRoots = ["src/app", "src/components", "src/lib"];
const publicSource = publicSourceRoots
  .flatMap((root) =>
    readdirSync(resolve(root), { recursive: true })
      .filter((path): path is string => typeof path === "string" && /\.[cm]?[jt]sx?$/.test(path))
      .map((path) => readFileSync(resolve(root, path), "utf8")),
  )
  .concat(readFileSync(resolve("scripts/generate-resume.ts"), "utf8"))
  .join("\n");
const renderedSource = `${publicContent}\n${publicSource}`;
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
  check(!renderedSource.toLowerCase().includes(claim.toLowerCase()), `Forbidden or unsupported claim found: ${claim}`);
}

check(!/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(renderedSource), "Public content contains an email address");
check(!/\+\d[\d\s()-]{7,}/.test(renderedSource), "Public content contains a phone number");
check(
  !Array.from(renderedSource.matchAll(/\b(?:\d[ .()-]*){9,15}\b/g)).some(
    ([candidate]) => candidate.replace(/\D/g, "").length >= 9,
  ),
  "Public content contains a possible domestic-format phone number",
);
check(site.experience.length === 5, "Expected five approved experience records");
check(new Set(site.experience.map((record) => record.id)).size === site.experience.length, "Experience IDs must be unique");
check(!/\b(?:19|20)\d{2}\b/.test(JSON.stringify(site.experience)), "Public experience records must omit dates");
check(site.education.length === 2, "Expected two approved education records");
check(new Set(site.education.map((record) => record.id)).size === site.education.length, "Education IDs must be unique");
for (const record of site.experience) {
  check(!("startDate" in record) && !("endDate" in record), `${record.id} must not publish disputed dates`);
  check(record.organization.trim().length > 0 && record.title.trim().length > 0, `${record.id} is incomplete`);
}
check(site.resume.htmlPath === "/resume", "Canonical HTML resume path changed unexpectedly");
check(site.resume.pdfPath === "/mohd-zamin-quadri-resume.pdf", "Canonical PDF resume path changed unexpectedly");
const resumePdfPath = resolve(`public${site.resume.pdfPath}`);
if (existsSync(resumePdfPath)) {
  const pdf = readFileSync(resumePdfPath);
  check(statSync(resumePdfPath).size > 20_000, "Canonical PDF resume is unexpectedly small");
  check(pdf.subarray(0, 5).toString() === "%PDF-", "Canonical resume is not a PDF file");
  const pdfStructure = pdf.toString("latin1");
  check(/\/MarkInfo\s*<<[\s\S]*?\/Marked\s+true/.test(pdfStructure), "Canonical resume PDF is not tagged");
  check(!pdfStructure.includes("/S /Strong"), "Canonical resume PDF contains unsupported Strong structure elements");

  const manifestPath = resolve("public/mohd-zamin-quadri-resume.manifest.json");
  if (existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Partial<ResumeManifest>;
      check(manifest.schemaVersion === 1, "Resume manifest schema version is invalid");
      check(manifest.tagged === true, "Resume manifest does not require a tagged PDF");
      check(manifest.sourceSha256 === getResumeSourceSha256(), "Canonical resume PDF is stale relative to its source facts");
      check(manifest.pdfSha256 === sha256(pdf), "Canonical resume PDF does not match its manifest");
    } catch {
      check(false, "Canonical resume manifest is not valid JSON");
    }
  }
}
const featuredProjectSlugs: readonly string[] = truthRegistry.portfolio.featuredProjectSlugs.value;
check(new Set(featuredProjectSlugs).size === featuredProjectSlugs.length, "Featured project slugs must be unique");
for (const slug of featuredProjectSlugs) {
  check(projectBySlug.has(slug), `Featured project references unknown project: ${slug}`);
}
check(getFeaturedProjects().length === featuredProjectSlugs.length, "Featured project registry is inconsistent");
check(thesis.status.includes("submitted"), "Thesis status must use submitted wording");
check(site.education[0].credential.startsWith("M.Sc. program:"), "TUM education must not imply degree conferral");
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
