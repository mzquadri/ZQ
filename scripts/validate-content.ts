import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

import {
  capabilities,
  getFeaturedProjects,
  getResearchProjects,
  navigation,
  projects,
  site,
  thesis,
} from "../src/content/portfolio";
import {
  canonicalThesisEvidence,
  researchEvidence,
  researchThemes,
  thesisResearchPath,
} from "../src/content/research";
import {
  currentPublicFacts,
  publishedFacts,
  sourceTiers,
  truthRegistry,
  type TruthFact,
} from "../src/content/truth";
import {
  getResumeSourceSha256,
  hasDeterministicResumePdfMetadata,
  sha256,
  type ResumeManifest,
} from "./resume-contract";
import { getPrivateTextIssue } from "../src/content/writing/schema";
import {
  getAllWriting,
  getPublishedLearnWriting,
  getPublishedWriting,
  publicWritingSections,
} from "../src/content/writing/repository";

const failures: string[] = [];
const projectSlugs = new Set<string>();
const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
const writing = getAllWriting();
const publishedWriting = getPublishedWriting();

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
  "src/app/research/opengraph-image.tsx",
  "src/app/research/thesis/page.tsx",
  "src/app/research/thesis/opengraph-image.tsx",
  "src/app/about/page.tsx",
  "src/app/contact/page.tsx",
  "src/app/resume/page.tsx",
  "src/app/learn/page.tsx",
  "src/app/learn/[slug]/page.tsx",
  "src/app/learn/[slug]/opengraph-image.tsx",
  "src/app/rss.xml/route.ts",
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

const publicContent = JSON.stringify({
  capabilities,
  canonicalThesisEvidence,
  navigation,
  projects,
  researchEvidence,
  researchThemes,
  site,
  thesis,
});
const publicSourceRoots = ["src/app", "src/components", "src/lib"];
const publicSource = publicSourceRoots
  .flatMap((root) =>
    readdirSync(resolve(root), { recursive: true })
      .filter((path): path is string => typeof path === "string" && /\.[cm]?[jt]sx?$/.test(path))
      .map((path) => readFileSync(resolve(root, path), "utf8")),
  )
  .concat(readFileSync(resolve("scripts/generate-resume.ts"), "utf8"))
  .join("\n");
const writingSource = readdirSync(resolve("content/writing"))
  .filter((path) => path.endsWith(".mdx"))
  .map((path) => readFileSync(resolve("content/writing", path), "utf8"))
  .join("\n");
const renderedSource = `${publicContent}\n${publicSource}\n${writingSource}`;
const privacyText = renderedSource.replace(/https?:\/\/\S+/g, "");
const forbiddenClaims = [
  "production-grade",
  "Dean's List",
  "18+",
  "88.7%",
  "zero bugs",
  "Mohd_Zamin_CV.pdf",
  "graduated",
  "degree awarded",
  "tracked prediction artifacts",
];

for (const claim of forbiddenClaims) {
  check(!renderedSource.toLowerCase().includes(claim.toLowerCase()), `Forbidden or unsupported claim found: ${claim}`);
}

const privateTextIssue = getPrivateTextIssue(privacyText);
check(!privateTextIssue, `Public content ${privateTextIssue ?? "violates the privacy boundary"}`);
check(!/[A-Za-z]:\\Users\\|\/(?:Users|home)\//.test(renderedSource), "Public content contains a local filesystem path");
check(!/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(renderedSource), "Public content contains an email address");
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
  check(hasDeterministicResumePdfMetadata(pdf), "Canonical resume PDF metadata is not deterministic");

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
check(canonicalThesisEvidence.repository === thesis.repository, "Research evidence must use the canonical thesis repository");
check(
  JSON.stringify(canonicalThesisEvidence) === JSON.stringify({
    repository: "https://github.com/mzquadri/ml-surrogates-thesis",
    commit: "5f1b840dfdfa2dc965b7883f6310cdc1d65f3594",
    submittedArtifactCommit: "4b95a3d8aca5929bb88b84bb7f7ae86c48e2f428",
    submittedPdf: "https://github.com/mzquadri/ml-surrogates-thesis/blob/4b95a3d8aca5929bb88b84bb7f7ae86c48e2f428/document/main.pdf",
    corrigendum: "https://github.com/mzquadri/ml-surrogates-thesis/blob/5f1b840dfdfa2dc965b7883f6310cdc1d65f3594/docs/CORRIGENDUM.md",
    provenance: "https://github.com/mzquadri/ml-surrogates-thesis/blob/5f1b840dfdfa2dc965b7883f6310cdc1d65f3594/docs/ARTIFACT_PROVENANCE.md",
    aggregateReport: "https://github.com/mzquadri/ml-surrogates-thesis/blob/5f1b840dfdfa2dc965b7883f6310cdc1d65f3594/analysis_outputs/THESIS_INTELLIGENCE_REPORT.md",
    aggregateJson: "https://github.com/mzquadri/ml-surrogates-thesis/blob/5f1b840dfdfa2dc965b7883f6310cdc1d65f3594/analysis_outputs/thesis_intelligence.json",
    modelComparison: "https://github.com/mzquadri/ml-surrogates-thesis/blob/5f1b840dfdfa2dc965b7883f6310cdc1d65f3594/analysis_outputs/model_comparison.csv",
    manifest: "https://github.com/mzquadri/ml-surrogates-thesis/blob/5f1b840dfdfa2dc965b7883f6310cdc1d65f3594/analysis_outputs/artifact_manifest.csv",
  }),
  "Canonical thesis evidence URLs diverge from the reviewed source contract",
);
check(
  canonicalThesisEvidence.commit === "5f1b840dfdfa2dc965b7883f6310cdc1d65f3594",
  "Audited thesis evidence commit changed unexpectedly",
);
check(
  canonicalThesisEvidence.submittedArtifactCommit === "4b95a3d8aca5929bb88b84bb7f7ae86c48e2f428",
  "Submitted thesis artifact commit changed unexpectedly",
);
check(
  canonicalThesisEvidence.submittedPdf.endsWith(
    "/blob/4b95a3d8aca5929bb88b84bb7f7ae86c48e2f428/document/main.pdf",
  ),
  "Submitted thesis PDF must remain pinned to the immutable baseline",
);
check(canonicalThesisEvidence.corrigendum.includes(`/${canonicalThesisEvidence.commit}/`), "Corrigendum must be pinned to the audited evidence commit");
for (const [label, href] of Object.entries({
  provenance: canonicalThesisEvidence.provenance,
  aggregateReport: canonicalThesisEvidence.aggregateReport,
  aggregateJson: canonicalThesisEvidence.aggregateJson,
  modelComparison: canonicalThesisEvidence.modelComparison,
  manifest: canonicalThesisEvidence.manifest,
})) {
  check(href.includes(`/${canonicalThesisEvidence.commit}/`), `${label} must be pinned to the audited evidence commit`);
}
check(thesisResearchPath === "/research/thesis", "Canonical thesis research path changed unexpectedly");
check(getResearchProjects().length === 3, "Expected one primary and two supporting research projects");
const projectResearchPaths = projects.flatMap((project) => project.researchPath ? [project.researchPath] : []);
check(new Set(projectResearchPaths).size === projectResearchPaths.length, "Project research paths must be unique");
for (const path of projectResearchPaths) {
  check(path.startsWith("/research/"), `Project research path is outside the research namespace: ${path}`);
  check(existsSync(resolve(`src/app${path}/page.tsx`)), `Project research path has no route: ${path}`);
}
check(!existsSync(resolve("src/app/research/experiments/page.tsx")), "Empty research experiments route must not be public");
check(!existsSync(resolve("src/app/research/publications/page.tsx")), "Empty research publications route must not be public");
const selectivePoints = researchEvidence.selectiveRisk.points;
check(
  JSON.stringify(researchEvidence.results) === JSON.stringify({
    deterministic: { r2: 0.5957479477, mae: 3.9572889805, rmse: 7.118265152 },
    mcDropout: { passes: 30, r2: 0.5855342128, mae: 3.9483171915, rmse: 7.2076289711, spearman: 0.4818179375 },
    deepEnsemble: { members: 5, r2: 0.6840808123, mae: 3.485322063, rmse: 6.2926862833, spearman: 0.3997361623 },
  }),
  "Headline research results diverge from the audited aggregate bundle",
);
check(
  JSON.stringify(researchEvidence.scope) === JSON.stringify({
    scenarios: 100,
    linksPerScenario: 31_635,
    predictions: 3_163_500,
    network: "One Paris road network",
    intervention: "Capacity-reduction policies",
  }),
  "Research scope diverges from the audited aggregate bundle",
);
check(selectivePoints.length === 6, "Selective-prediction experience requires six audited points");
check(
  selectivePoints.map((point) => point.retentionPct).join(",") === "10,25,50,75,90,100",
  "Selective-prediction points must remain sorted and discrete",
);
check(
  JSON.stringify(selectivePoints) === JSON.stringify([
    { retentionPct: 10, accepted: 316_350, review: 2_847_150, mae: 1.0511744751, reductionPct: 73.3766456911 },
    { retentionPct: 25, accepted: 790_875, review: 2_372_625, mae: 1.7948621542, reductionPct: 54.5410850455 },
    { retentionPct: 50, accepted: 1_581_750, review: 1_581_750, mae: 2.321017345, reductionPct: 41.2150232011 },
    { retentionPct: 75, accepted: 2_372_625, review: 790_875, mae: 2.7952493971, reductionPct: 29.2040314501 },
    { retentionPct: 90, accepted: 2_847_150, review: 316_350, mae: 3.2264230602, reductionPct: 18.2835901043 },
    { retentionPct: 100, accepted: 3_163_500, review: 0, mae: 3.9483171915, reductionPct: 0 },
  ]),
  "Selective-prediction points diverge from the audited aggregate bundle",
);
for (const point of selectivePoints) {
  check(point.accepted + point.review === researchEvidence.scope.predictions, `${point.retentionPct}% selective point does not match the audited scope`);
}
const halfRetention = selectivePoints.find((point) => point.retentionPct === 50);
check(halfRetention?.reductionPct.toFixed(1) === "41.2", "50% selective-risk reduction diverges from audited evidence");
check(researchEvidence.calibrationProtocols.length === 2, "Expected two distinct calibration protocols");
check(new Set(researchEvidence.calibrationProtocols.map((protocol) => protocol.id)).size === 2, "Calibration protocol IDs must remain distinct");
check(researchEvidence.calibrationProtocols.some((protocol) => protocol.approximate), "Reported approximate calibration protocol lost its status");
check(researchEvidence.calibrationProtocols.some((protocol) => !protocol.approximate), "Tracked exact calibration protocol lost its status");
check(
  JSON.stringify(researchEvidence.calibrationProtocols) === JSON.stringify([
    {
      id: "graph20_80_v1",
      label: "Graph-level audit protocol",
      split: "First 20 graphs calibrate / last 80 evaluate",
      beforeEce: 0.2687388178,
      afterEce: 0.0478634029,
      temperature: 2.7024848451,
      approximate: false,
      evidence: "Tracked aggregate result; regeneration requires controlled source artifacts",
    },
    {
      id: "node30_70_thesis_final",
      label: "Final-thesis node protocol",
      split: "Random 30% node calibration / 70% node evaluation",
      beforeEce: 0.356,
      afterEce: 0.034,
      temperature: 2.887,
      approximate: true,
      evidence: "Reported result; canonical split indices are unavailable",
    },
  ]),
  "Calibration protocols diverge from their distinct audited and reported contracts",
);
check(
  JSON.stringify(researchEvidence.marginalCoverage) === JSON.stringify([
    { nominalPct: 90, observedPct: 90.02 },
    { nominalPct: 95, observedPct: 95.01 },
  ]),
  "Marginal coverage pairs diverge from the reported thesis protocol",
);

check(publishedWriting.length > 0, "Public writing routes require at least one published entry");
check(getPublishedLearnWriting().length > 0, "The Learn route must not launch empty");
check(new Set(writing.map((entry) => entry.slug)).size === writing.length, "Writing slugs must be unique");
const taxonomyLabels = new Map<string, string>();
for (const entry of writing) {
  if (entry.status === "published") {
    check(Boolean(entry.publishedAt), `${entry.slug} is published without a publication date`);
    check((entry.publishedAt ?? "") <= new Date().toISOString().slice(0, 10), `${entry.slug} has a future publication date`);
    check((entry.updatedAt ?? entry.publishedAt ?? "") <= new Date().toISOString().slice(0, 10), `${entry.slug} has a future update date`);
    check(
      existsSync(resolve(`src/app/${entry.section}/[slug]/page.tsx`)),
      `${entry.slug} is published to a section without a public detail route`,
    );
    check(publicWritingSections.includes(entry.section), `${entry.slug} targets a section that is not enabled for publication`);
  }
  check(entry.wordCount >= 500 || entry.status === "draft", `${entry.slug} is too short for a published technical piece`);
  check(entry.tableOfContents.length >= 2 || entry.status === "draft", `${entry.slug} needs a useful table of contents`);
  for (const taxon of [entry.category, ...entry.tags]) {
    const existingLabel = taxonomyLabels.get(taxon.slug);
    check(!existingLabel || existingLabel === taxon.label, `Taxonomy label conflict for ${taxon.slug}`);
    taxonomyLabels.set(taxon.slug, taxon.label);
  }
  if (entry.coverImage) check(existsSync(resolve(`public${entry.coverImage.src}`)), `${entry.slug} cover image is missing`);
}
const selectivePredictionTutorial = writing.find(
  (entry) => entry.slug === "selective-prediction-when-models-should-abstain",
);
for (const retention of [10, 50, 100]) {
  const point = researchEvidence.selectiveRisk.points.find((candidate) => candidate.retentionPct === retention)!;
  check(
    selectivePredictionTutorial?.body.includes(`| ${point.retentionPct}% | ${point.mae.toFixed(2)} veh/h |`) ?? false,
    `Selective-prediction tutorial diverges from the reviewed ${point.retentionPct}% retention value`,
  );
}
check(
  selectivePredictionTutorial?.body.includes(`${researchEvidence.scope.scenarios} held-out scenarios`) ?? false,
  "Selective-prediction tutorial diverges from the audited scenario scope",
);
check(
  selectivePredictionTutorial?.body.includes(researchEvidence.scope.predictions.toLocaleString("en-US")) ?? false,
  "Selective-prediction tutorial diverges from the audited prediction scope",
);
check(
  selectivePredictionTutorial?.body.includes(`${halfRetention?.reductionPct.toFixed(1)}% lower`) ?? false,
  "Selective-prediction tutorial diverges from the audited 50% reduction",
);
if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${truthFacts.length} truth facts, ${projects.length} projects, ${publishedWriting.length} published writing entry, ${capabilities.length} capability groups, and ${requiredFiles.length} route files.`,
);
