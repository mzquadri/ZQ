import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

import {
  allProjects,
  canonicalMlopsEvidence,
  capabilities,
  getFeaturedProjects,
  getResearchProjects,
  isEmployerConfidential,
  mlopsReferenceRun,
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
  ecosystemCategories,
  ecosystemRepositories,
  ecosystemSnapshot,
  getPopulatedCategories,
  repositoryUrl,
} from "../src/content/ecosystem";
import { buildingThreads, focusThemes } from "../src/content/focus";
import {
  confidenceLadder,
  convergenceRules,
  countIllustration,
  representationFanOut,
  verificationStates,
} from "../src/content/legal-kb";
import { graphEdges, graphNodes, graphStages } from "../src/content/systems-graph";
import {
  currentPublicFacts,
  publishedFacts,
  sourceTiers,
  truthRegistry,
  type TruthFact,
} from "../src/content/truth";
import { getConfidentialProjectIssues, getDraftPublicationIssue } from "./confidential-content";
import { getPrivateTextIssue, writingLevels, writingTopics } from "../src/content/writing/schema";
import researchFeed from "../src/content/research-feed.json";
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

/*
 * Every authored project is validated, published or not. A draft that is only checked once
 * somebody decides to publish it is a draft that gets its first review under deadline.
 */
for (const project of allProjects) {
  check(!projectSlugs.has(project.slug), `Duplicate project slug: ${project.slug}`);
  projectSlugs.add(project.slug);
  check(project.evidence.length > 0, `${project.slug} has no evidence`);
  check(project.limitations.length > 0, `${project.slug} has no limitations`);
  check(project.quality.length > 0, `${project.slug} has no quality controls`);
  check(project.authors.length > 0, `${project.slug} has no authorship record`);
  check(project.projectRole.trim().length > 0, `${project.slug} has no project role`);
  if (isEmployerConfidential(project)) {
    for (const issue of getConfidentialProjectIssues(project)) check(false, issue);
    continue;
  }
  check(project.repository.startsWith("https://github.com/"), `${project.slug} has a non-GitHub repository URL`);
  for (const artifact of project.artifacts ?? []) {
    check(artifact.href.startsWith("https://github.com/"), `${project.slug} has a non-GitHub artifact URL`);
    check(artifact.note.trim().length > 0, `${project.slug} has an undocumented artifact link`);
  }
}

/*
 * The gate that has to be fail-closed. `projects` is already filtered for this environment, so
 * an unapproved confidential draft reaching a production build means the filter did not hold.
 */
const draftPublicationIssue = getDraftPublicationIssue(projects, process.env.VERCEL_ENV);
if (draftPublicationIssue) check(false, draftPublicationIssue);

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
  "src/app/learn/page.tsx",
  "src/app/learn/[slug]/page.tsx",
  "src/app/learn/[slug]/opengraph-image.tsx",
  "src/app/rss.xml/route.ts",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "src/app/opengraph-image.tsx",
  "src/app/not-found.tsx",
  "src/app/work/[slug]/opengraph-image.tsx",
];

for (const path of requiredFiles) {
  check(existsSync(resolve(path)), `Required route or metadata file is missing: ${path}`);
}

const publicContent = JSON.stringify({
  buildingThreads,
  capabilities,
  confidenceLadder,
  convergenceRules,
  countIllustration,
  representationFanOut,
  verificationStates,
  canonicalThesisEvidence,
  ecosystemRepositories,
  ecosystemSnapshot,
  focusThemes,
  graphEdges,
  graphNodes,
  graphStages,
  navigation,
  projects: allProjects,
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
/*
 * The resume subsystem is retired.
 *
 * The site no longer publishes a resume in any form - no route, no navigation entry, no download
 * action, no sitemap entry - so there is no published document left to keep in sync with the
 * source facts, and the generator that rendered it has been removed along with the route it
 * rendered. The source PDF is retained outside `public/` and is not served.
 *
 * What replaces this check is stricter than it was: the assertion below fails the build if any
 * resume surface reappears anywhere in the app or content tree.
 */
check(
  !/\bresumes?\b|\bcurriculum vitae\b|download\s+cv\b/i.test(renderedSource),
  "A resume surface reappeared in the rendered site source",
);

/*
 * No portfolio chronology.
 *
 * The site presents work by what it does, not by when it happened. Project year badges, employment
 * ranges and 'present' markers are all gone, and the project registry no longer carries a year
 * field at all, so a badge cannot be reintroduced by rendering one.
 *
 * Dates that describe evidence are a different thing and are deliberately still allowed: a dataset
 * that runs 2008-2022 describes the data, and an academic citation year identifies the work cited.
 * Neither is a claim about when I did something.
 */
for (const project of projects) {
  check(!("year" in project), `${project.slug} must not publish a portfolio year`);
}
check(
  !/\b(Apr|Jan|Feb|Mar|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+20\d{2}\s*[-–]\s*(Present|20\d{2})/i.test(renderedSource),
  "An employment date range reappeared in the rendered site source",
);

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

// --- MLOps reference-run evidence --------------------------------------------------------------

// Numbers are locked to the released commit. Changing a figure here has to be a deliberate
// edit accompanied by a new upstream release, not a drift.
check(
  /^[0-9a-f]{40}$/.test(canonicalMlopsEvidence.commit),
  "MLOps evidence commit must be a full 40-character SHA",
);
check(
  canonicalMlopsEvidence.commit === "ada5465993295a9dd4d995846b77852d1fc4de5e",
  "MLOps evidence commit changed unexpectedly",
);
check(
  canonicalMlopsEvidence.repository === "https://github.com/mzquadri/MLOps-End-to-End-Pipeline",
  "MLOps evidence must use the canonical repository URL",
);
for (const [label, href] of Object.entries(canonicalMlopsEvidence)) {
  if (label === "repository" || label === "commit") continue;
  check(href.startsWith(`${canonicalMlopsEvidence.repository}/`), `MLOps ${label} link leaves the repository`);
  // The Actions view is a live status page, not a source for a published number.
  if (label === "actions") {
    check(href.endsWith("/actions"), "MLOps actions link must point at the workflow runs view");
    continue;
  }
  check(
    href.includes(`/${canonicalMlopsEvidence.commit}/`),
    `MLOps ${label} link must be pinned to the released commit`,
  );
}
check(
  JSON.stringify(mlopsReferenceRun.test) === JSON.stringify({
    accuracy: 0.8067,
    f1Weighted: 0.8067,
    rocAuc: 0.8795,
    prAuc: 0.8895,
    baselineAccuracy: 0.5,
  }),
  "MLOps held-out metrics diverge from the released reference run",
);
check(
  JSON.stringify(mlopsReferenceRun.split) === JSON.stringify({ train: 1800, validation: 600, test: 600 }),
  "MLOps split sizes diverge from the released reference run",
);
check(
  mlopsReferenceRun.test.accuracy > mlopsReferenceRun.test.baselineAccuracy,
  "A published model must beat its own baseline",
);
check(mlopsReferenceRun.dataset.rows === 3000, "MLOps dataset row count diverges from the released run");
check(mlopsReferenceRun.dataset.license === "CC BY 4.0", "MLOps dataset licence must be published accurately");
check(
  mlopsReferenceRun.dataset.redistributed === false,
  "The MLOps dataset must not be described as redistributed",
);
check(mlopsReferenceRun.tests.total === 99, "MLOps test count diverges from the released run");
check(
  mlopsReferenceRun.split.train + mlopsReferenceRun.split.validation + mlopsReferenceRun.split.test ===
    mlopsReferenceRun.dataset.rows,
  "MLOps split sizes must account for every dataset row",
);

const mlopsProject = projectBySlug.get("mlops-reference-pipeline");
check(
  !(mlopsProject?.nextStep ?? "").toLowerCase().includes("licensed-data run"),
  "The completed licensed-data milestone must not remain as an open next step",
);
check(
  (mlopsProject?.limitations ?? []).some((item) => item.includes(String(mlopsReferenceRun.split.test))),
  "The MLOps case study must keep its held-out sample size visible next to the result",
);

// --- Public repository ecosystem -------------------------------------------------------------

const today = new Date().toISOString().slice(0, 10);
const repositoryNames = new Set<string>();
const projectRepositoryUrls = new Set(
  projects.flatMap((project) => (isEmployerConfidential(project) ? [] : [project.repository])),
);
const ecosystemUrls = new Set(ecosystemRepositories.map((repository) => repositoryUrl(repository)));

check(isIsoDate(ecosystemSnapshot.observedAt), "Ecosystem snapshot has an invalid observation date");
check(ecosystemSnapshot.observedAt <= today, "Ecosystem snapshot claims a future observation date");
check(ecosystemSnapshot.profile === site.github, "Ecosystem snapshot must use the verified GitHub profile");
check(ecosystemRepositories.length > projectRepositoryUrls.size, "The repository index must show more than the case studies alone");

for (const repository of ecosystemRepositories) {
  const label = `Repository ${repository.name}`;
  check(!repositoryNames.has(repository.name), `Duplicate repository entry: ${repository.name}`);
  repositoryNames.add(repository.name);
  check(ecosystemCategories.includes(repository.category), `${label} has an invalid category`);
  check(repository.description.trim().length > 0, `${label} has no description`);
  check(repository.boundary.trim().length > 0, `${label} has no evidence boundary`);
  check(repository.language.trim().length > 0, `${label} has no language`);
  check(repository.topics.length > 0, `${label} has no focus areas`);
  check(new Set(repository.topics).size === repository.topics.length, `${label} repeats a focus area`);
  check(isIsoDate(repository.lastCommit), `${label} has an invalid last-commit date`);
  check(repository.lastCommit <= today, `${label} claims a future commit date`);
  check(
    repositoryUrl(repository).startsWith(`${site.github}/`),
    `${label} does not resolve under the verified GitHub profile`,
  );

  if (repository.caseStudySlug) {
    const project = projectBySlug.get(repository.caseStudySlug);
    check(Boolean(project), `${label} references unknown case study: ${repository.caseStudySlug}`);
    // The repository index and the case study must agree on the canonical repository URL.
    check(
      project?.repository === repositoryUrl(repository),
      `${label} and case study ${repository.caseStudySlug} disagree on the repository URL`,
    );
  }
}

for (const url of projectRepositoryUrls) {
  check(ecosystemUrls.has(url), `Case-study repository is missing from the repository index: ${url}`);
}

const populatedCategories = getPopulatedCategories();
check(populatedCategories.length >= 4, "The repository index should use more than a couple of categories");
check(
  populatedCategories.reduce((total, group) => total + group.repositories.length, 0) === ecosystemRepositories.length,
  "Every repository must appear in exactly one populated category group",
);

// --- Current focus ---------------------------------------------------------------------------

const publishedWritingPaths = new Set(publishedWriting.map((entry) => entry.path));

function checkPublicPath(path: string, label: string) {
  check(path.startsWith("/"), `${label} is not site-relative: ${path}`);
  if (path.startsWith("/work/")) {
    check(projectBySlug.has(path.slice("/work/".length)), `${label} points at an unknown case study: ${path}`);
    return;
  }
  if (path.startsWith("/learn/")) {
    check(publishedWritingPaths.has(path), `${label} points at unpublished writing: ${path}`);
    return;
  }
  check(existsSync(resolve(`src/app${path}/page.tsx`)), `${label} points at a route that does not exist: ${path}`);
}

check(focusThemes.length > 0, "Current focus must describe at least one theme");
for (const theme of focusThemes) {
  check(theme.summary.trim().length > 0, `Focus theme ${theme.id} has no summary`);
  check(theme.evidence.length > 0, `Focus theme ${theme.id} claims a focus with no public evidence`);
  for (const item of theme.evidence) checkPublicPath(item.href, `Focus theme ${theme.id} evidence`);
}

for (const thread of buildingThreads) {
  check(repositoryNames.has(thread.repository), `Currently-building thread references unknown repository: ${thread.repository}`);
  check(thread.nextEvidenceGate.trim().length > 0, `Currently-building thread ${thread.id} states no evidence gate`);
}

// --- Systems graph ---------------------------------------------------------------------------

const graphNodeIds = new Set(graphNodes.map((node) => node.id));
const graphStageIds = new Set(graphStages.map((stage) => stage.id));

check(graphNodeIds.size === graphNodes.length, "Systems-graph node IDs must be unique");
check(graphStageIds.size === graphStages.length, "Systems-graph stage IDs must be unique");

for (const node of graphNodes) {
  check(graphStageIds.has(node.stage), `Systems-graph node ${node.id} sits in an unknown stage`);
  check(node.blurb.trim().length > 0, `Systems-graph node ${node.id} has no explanation`);
  // A node may only claim delivered work when a public artifact backs it.
  if (node.status === "Evidenced") {
    check(Boolean(node.href), `Systems-graph node ${node.id} is marked evidenced without a public artifact`);
    if (node.href) checkPublicPath(node.href, `Systems-graph node ${node.id}`);
  } else {
    check(!node.href, `Systems-graph node ${node.id} is a direction of study and must not link to claimed work`);
  }
}

for (const stage of graphStages) {
  check(
    graphNodes.some((node) => node.stage === stage.id),
    `Systems-graph stage ${stage.id} is empty and must not be shown`,
  );
}

for (const edge of graphEdges) {
  check(graphNodeIds.has(edge.from), `Systems-graph edge starts at an unknown node: ${edge.from}`);
  check(graphNodeIds.has(edge.to), `Systems-graph edge ends at an unknown node: ${edge.to}`);
  check(edge.from !== edge.to, `Systems-graph edge loops on itself: ${edge.from}`);
}
check(
  new Set(graphEdges.map((edge) => `${edge.from}>${edge.to}`)).size === graphEdges.length,
  "Systems-graph edges must be unique",
);

// --- Profile portrait ---------------------------------------------------------------------------

/*
 * A published photograph is the first personal identifier on this site, approved in the
 * Visual Rebuild v2 privacy review. The strip step is not trusted: the committed file is
 * inspected here on every build, so a re-export that quietly reintroduces EXIF fails
 * rather than shipping. GPS coordinates are the specific risk.
 */
const portraitPath = resolve("public/images/zamin-profile.jpg");
if (existsSync(portraitPath)) {
  const portrait = readFileSync(portraitPath);
  check(portrait.subarray(0, 2).toString("hex") === "ffd8", "Profile portrait is not a JPEG");
  check(statSync(portraitPath).size < 900_000, "Profile portrait is unexpectedly large for the web");

  // APP1 is where EXIF (and therefore GPS) lives; APP13 carries IPTC/Photoshop blocks.
  const markers: string[] = [];
  for (let index = 2; index + 4 < portrait.length; ) {
    if (portrait[index] !== 0xff) break;
    const marker = portrait[index + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      index += 2;
      continue;
    }
    if (marker === 0xda || marker === 0xd9) break;
    const length = portrait.readUInt16BE(index + 2);
    const segment = portrait.subarray(index + 4, index + 2 + length);
    if (marker === 0xe1 && segment.subarray(0, 4).toString("latin1") === "Exif") markers.push("EXIF");
    if (marker === 0xe1 && segment.subarray(0, 5).toString("latin1") === "http:") markers.push("XMP");
    if (marker === 0xed) markers.push("IPTC");
    index += 2 + length;
  }
  check(markers.length === 0, `Profile portrait still carries metadata segments: ${markers.join(", ")}`);
  check(
    !portrait.toString("latin1").includes("GPS"),
    "Profile portrait contains a GPS reference and must be re-stripped",
  );
}

// --- Confidential work -------------------------------------------------------------------------

for (const record of site.experience) {
  if (!record.practice) continue;
  check(
    record.practice.trim().length >= 40,
    `${record.id} publishes a practice description that is too thin to be useful`,
  );
  check(
    !/https?:|\bhttp\b|\b\d{1,3}(?:\.\d{1,3}){3}\b|localhost|\.internal\b|\.local\b/i.test(record.practice),
    `${record.id} practice description leaks an endpoint, host, or address`,
  );
}

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
  for (const taxon of entry.tags) {
    const existingLabel = taxonomyLabels.get(taxon.slug);
    check(!existingLabel || existingLabel === taxon.label, `Taxonomy label conflict for ${taxon.slug}`);
    taxonomyLabels.set(taxon.slug, taxon.label);
  }
  if (entry.coverImage) check(existsSync(resolve(`public${entry.coverImage.src}`)), `${entry.slug} cover image is missing`);
}
// --- Level and topic vocabulary -----------------------------------------------------------

/*
 * Unknown level or topic is a build failure, not a warning. The vocabularies are closed
 * because the filter routes are generated from them: a value that is not in the list has
 * no route, so publishing it would produce a chip pointing at a 404.
 */
const knownTopics = new Set<string>(writingTopics.map((topic) => topic.slug));
const knownLevels = new Set<string>(writingLevels.map((level) => level.slug));

for (const entry of writing) {
  check(knownTopics.has(entry.topic), `${entry.slug} uses an unknown topic: ${entry.topic}`);
  check(knownLevels.has(entry.level), `${entry.slug} uses an unknown level: ${entry.level}`);
}

for (const topic of writingTopics) {
  check(
    existsSync(resolve("src/app/learn/topic/[topic]/page.tsx")),
    "The topic route is missing, so topic chips would link nowhere",
  );
  check(topic.label.trim().length > 0, `Topic ${topic.slug} has no label`);
}
for (const level of writingLevels) {
  check(
    existsSync(resolve("src/app/learn/level/[level]/page.tsx")),
    "The level route is missing, so level chips would link nowhere",
  );
  check(level.label.trim().length > 0, `Level ${level.slug} has no label`);
}

// The research feed is other people's work. These checks exist so it cannot quietly drift
// into reading as authored content.
check(Array.isArray(researchFeed.entries), "Research feed cache is malformed");
check(isIsoDate(researchFeed.fetchedAt), "Research feed cache has no valid fetch date");
for (const item of researchFeed.entries) {
  check(item.authors.length > 0, `Research feed entry ${item.id} has no authors`);
  check(
    item.link.startsWith("https://arxiv.org/abs/"),
    `Research feed entry ${item.id} does not link to arXiv`,
  );
  check(
    !Object.prototype.hasOwnProperty.call(item, "summary"),
    `Research feed entry ${item.id} carries a summary; the feed publishes metadata only`,
  );
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
