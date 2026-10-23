import { gatewaySource } from "./gateway-world";
import {
  detector as driftDetector,
  drift as driftScores,
  repository as driftRepository,
  rescored as driftRescored,
  runs as driftRuns,
  seasonalFix as driftSeasonalFix,
} from "./drift-chapter";
import {
  dataset as munichDataset,
  marginShareLost as munichMarginShareLost,
  repository as munichRepository,
  seriesTotal as munichSeriesTotal,
  testRows as munichTestRows,
  windows as munichWindows,
} from "./munich-chapter";
import {
  coverage as modalCoverageFacts,
  euCarShare as modalEuShare,
  rail as modalRail,
  repository as modalRepository,
  source as modalSource,
  spread as modalSpreadFacts,
} from "./modal-split-chapter";
import {
  missedByTheCount as translationMissed,
  model as translationModel,
  repository as translationRepository,
  resolvedCount as translationResolved,
  totalCount as translationTotal,
} from "./translation-chapter";
import {
  adoption as releaseAdoption,
  frames as releaseFrames,
  markets as releaseMarkets,
  milestones as releaseMilestones,
  repository as releaseRepository,
  sheet as releaseSheet,
} from "./release-chapter";
import {
  closestGap as parityClosest,
  parity as parityFacts,
  repository as parityRepository,
  sample as paritySampleQ,
} from "./parity-chapter";
import { tests as mlopsTests } from "./mlops-world";
import { site, thesis, truthRegistry } from "./truth";
import { canonicalThesisEvidence, researchEvidence, thesisResearchPath } from "./research";
import { insureAssistBenchmark } from "@/content/insureassist-benchmark";

export { insureAssistBenchmark };

export { site, thesis } from "./truth";

export const projectClassifications = [
  "Academic research",
  "Group coursework",
  "Engineering prototype",
  "Employer engineering",
  "Reference implementation",
  "Reproducible experiment",
  "Synthetic demonstration",
] as const;

export type ProjectClassification = (typeof projectClassifications)[number];

export interface EvidenceMetric {
  label: string;
  value: string;
  note: string;
}

export interface ProjectAuthor {
  name: string;
  url?: string;
}

export interface ArtifactLink {
  label: string;
  href: string;
  note: string;
}

/**
 * How a project's claims can be checked by a reader.
 *
 * `public-repository` is the default and the only mode that existed before: every claim is
 * backed by a public repository the reader can open. `employer-confidential` covers work done
 * under an employment relationship, where the source cannot be shown at all. The two are kept
 * as separate shapes rather than one shape with optional fields, so that a confidential project
 * carrying a repository or an artifact link is a type error rather than something a validator
 * has to notice.
 */
export type EvidenceMode = "public-repository" | "employer-confidential";

/**
 * Whether a confidential case study may be published.
 *
 * A draft is authored, reviewed and rendered like any other page, but it is withheld from a
 * production build. It becomes publishable only once a real approval is recorded here - an
 * approval reference, the date it was given, and the date it must be reviewed again. There is
 * deliberately no way to express "approved" without those three, because the absent-approval
 * case is the one that has to fail.
 */
export type PublicationApproval =
  | { status: "draft"; reason: string }
  | { status: "approved"; approval: string; verifiedAt: string; reviewAfter: string };

interface ProjectBase {
  slug: string;
  title: string;
  eyebrow: string;
  classification: ProjectClassification;
  authors: readonly ProjectAuthor[];
  projectRole: string;
  institution?: string;
  summary: string;
  /**
   * The search snippet, where the summary is too long to be one.
   *
   * `summary` is page prose and is written to be read on the page; four of
   * these run past 165 characters and one past 500, and a search engine cuts
   * a description at about 160. The cut does not fall where the sentence does,
   * so the snippet a reader sees ends mid-clause - and on this site the clause
   * that gets cut is usually the limitation, which is the half that must not
   * be the optional half.
   *
   * So: written, not truncated, and only where it is needed. A project whose
   * summary already fits does not carry one, and `generateMetadata` falls back
   * to the summary.
   */
  metaDescription?: string;
  problem: string;
  contribution: string;
  workflow: readonly string[];
  tools: readonly string[];
  evidence: readonly EvidenceMetric[];
  quality: readonly string[];
  limitations: readonly string[];
  learned: string;
  systemSummary?: string;
  nextStep?: string;
  researchPath?: string;
}

export interface PublicRepositoryProject extends ProjectBase {
  evidenceMode?: "public-repository";
  repository: string;
  artifacts?: readonly ArtifactLink[];
  publication?: never;
}

export interface EmployerConfidentialProject extends ProjectBase {
  evidenceMode: "employer-confidential";
  repository?: never;
  artifacts?: never;
  publication: PublicationApproval;
}

export type Project = PublicRepositoryProject | EmployerConfidentialProject;

export function isEmployerConfidential(project: Project): project is EmployerConfidentialProject {
  return project.evidenceMode === "employer-confidential";
}

export function hasPublicRepository(project: Project): project is PublicRepositoryProject {
  return !isEmployerConfidential(project);
}

const halfRetention = researchEvidence.selectiveRisk.points.find((point) => point.retentionPct === 50)!;
const [coverage90, coverage95] = researchEvidence.marginalCoverage;

const mlopsRepository = "https://github.com/mzquadri/MLOps-End-to-End-Pipeline";
const mlopsCommit = "a4d3613d48c2e474fa0f231355a16fd3e91a53b4";

/**
 * Evidence links for the MLOps reference pipeline, pinned to the released commit.
 *
 * Numerical claims are backed by files at a fixed commit rather than by a floating
 * branch, so a later change upstream cannot silently alter what this site cites. The
 * Actions view is intentionally unpinned: it is a live status page, not a source for a
 * number.
 */
export const canonicalMlopsEvidence = {
  repository: mlopsRepository,
  commit: mlopsCommit,
  readme: `${mlopsRepository}/blob/${mlopsCommit}/README.md`,
  evaluation: `${mlopsRepository}/blob/${mlopsCommit}/docs/EVALUATION.md`,
  data: `${mlopsRepository}/blob/${mlopsCommit}/docs/DATA.md`,
  architecture: `${mlopsRepository}/blob/${mlopsCommit}/docs/ARCHITECTURE.md`,
  production: `${mlopsRepository}/blob/${mlopsCommit}/docs/PRODUCTION.md`,
  testing: `${mlopsRepository}/blob/${mlopsCommit}/docs/TESTING.md`,
  tests: `${mlopsRepository}/tree/${mlopsCommit}/tests`,
  notice: `${mlopsRepository}/blob/${mlopsCommit}/NOTICE`,
  actions: `${mlopsRepository}/actions`,
} as const;

const insureAssistRepository = "https://github.com/mzquadri/insureassist-rag-mlops";
const insureAssistCommit = "a9bc6c8a62814ef97a12a2500f4cc701468cde8f";

/**
 * Evidence links for the InsureAssist RAG benchmark, pinned to the released commit.
 *
 * Same rule as the MLOps pillar: numbers are backed by files at a fixed commit, not by a
 * floating branch, so an upstream change cannot silently alter what this site claims.
 */
export const canonicalInsureAssistEvidence = {
  repository: insureAssistRepository,
  commit: insureAssistCommit,
  readme: `${insureAssistRepository}/blob/${insureAssistCommit}/README.md`,
  benchmark: `${insureAssistRepository}/blob/${insureAssistCommit}/docs/BENCHMARK.md`,
  evaluation: `${insureAssistRepository}/blob/${insureAssistCommit}/docs/EVALUATION.md`,
  architecture: `${insureAssistRepository}/blob/${insureAssistCommit}/docs/ARCHITECTURE.md`,
  data: `${insureAssistRepository}/blob/${insureAssistCommit}/docs/DATA.md`,
  production: `${insureAssistRepository}/blob/${insureAssistCommit}/docs/PRODUCTION.md`,
  limitations: `${insureAssistRepository}/blob/${insureAssistCommit}/docs/LIMITATIONS.md`,
  referenceRun: `${insureAssistRepository}/blob/${insureAssistCommit}/eval/reference_run.json`,
  retrievalConfig: `${insureAssistRepository}/blob/${insureAssistCommit}/eval/retrieval_config.json`,
  groundTruth: `${insureAssistRepository}/blob/${insureAssistCommit}/eval/ground_truth/nfip_questions.jsonl`,
  notice: `${insureAssistRepository}/blob/${insureAssistCommit}/NOTICE`,
  actions: `${insureAssistRepository}/actions`,
} as const;

/**
 * The held-out retrieval benchmark published at {@link canonicalInsureAssistEvidence.commit}.
 *
 * Every InsureAssist number on this site reads from here. Values are copied from
 * `eval/reference_run.json` at that commit, which is the repository's own source of truth -
 * its CI fails if the repository's documentation drifts from it.
 *
 * Deliberately absent: per-form metrics (3-8 questions each, no useful signal), latency
 * (machine-specific), and any abstention threshold (none is validated upstream).
 */

/**
 * The audited reference run published at {@link canonicalMlopsEvidence.commit}.
 *
 * Single source for every MLOps number on this site. Components read from here rather
 * than restating figures, so a metric cannot drift between the case study, the index
 * and the repository index.
 */
export const mlopsReferenceRun = {
  dataset: {
    name: "UCI Sentiment Labelled Sentences",
    license: "CC BY 4.0",
    rows: 3_000,
    balance: "1,500 positive / 1,500 negative",
    redistributed: false,
  },
  split: { train: 1_800, validation: 600, test: 600 },
  test: {
    accuracy: 0.8067,
    f1Weighted: 0.8067,
    rocAuc: 0.8795,
    prAuc: 0.8895,
    baselineAccuracy: 0.5,
  },
  /*
   * Read from the generated module, not restated.
   *
   * This said `total: 99` until 2026-10-23, inside the block whose own comment above calls
   * itself the single source for every MLOps number on this site. It was not: `mlops-world.ts`
   * carries its own `tests`, generated from the repository, and the two had diverged. Updating
   * only the generated one left production still serving "99 tests" from here, which is how
   * this was caught.
   */
  tests: { total: mlopsTests.total, layers: ["unit", "integration", "container"] },
  bundle: { checksummedArtifacts: 5 },
  /**
   * Held-out confusion matrix published in docs/EVALUATION.md at the pinned commit.
   * Rows are actual classes, columns predicted, in the label order below.
   */
  confusion: {
    labels: ["negative", "positive"],
    rows: [
      [241, 59],
      [57, 243],
    ],
  },
  /** Commands the released repository documents, and the output its CI reproduces. */
  referenceCommands: [
    "python -m src.pipeline --config configs/train_config.yaml",
    "python scripts/check_reference_run.py",
  ],
} as const;

const mlopsBaselineMargin =
  mlopsReferenceRun.test.accuracy - mlopsReferenceRun.test.baselineAccuracy;

const authoredProjects: readonly Project[] = [
  {
    slug: "transport-uq",
    title: "Uncertainty Quantification for Traffic Prediction (Project)",
    eyebrow: "Master's thesis on reliable machine learning",
    classification: "Academic research",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Researcher and thesis author",
    institution: thesis.institution,
    summary:
      "A study of when a graph neural network surrogate is accurate, when it is uncertain, and how that uncertainty can support review decisions.",
    problem:
      "Paris-scale transport simulations are expensive, while a fast surrogate can fail unevenly across road links and policy regimes. Point predictions alone do not tell an analyst when to trust the approximation.",
    contribution:
      "Built on the MATSim corpus and PointNetTransfGAT infrastructure of prior work, then evaluated training variants, MC Dropout, deep ensembles, sigma scaling, split and adaptive conformal prediction, selective prediction, CQR, and error-detection diagnostics.",
    workflow: [
      "MATSim policy scenarios",
      "Road-link graph representation",
      "PointNet + TransformerConv + GAT surrogate",
      "Uncertainty estimation",
      "Calibration and review policy",
    ],
    tools: [
      "PyTorch",
      "PyTorch Geometric",
      "NumPy",
      "SciPy",
      "scikit-learn",
      "Streamlit",
      "LaTeX",
    ],
    evidence: [
      {
        label: "Held-out scope",
        value: `${researchEvidence.scope.scenarios} scenarios`,
        note: `${researchEvidence.scope.predictions.toLocaleString("en-US")} road-link predictions in the cached test artifacts.`,
      },
      {
        label: "Primary GNN",
        value: `R2 ${researchEvidence.results.deterministic.r2.toFixed(3)}`,
        note: `Deterministic Trial 8; MAE ${researchEvidence.results.deterministic.mae.toFixed(2)} veh/h and RMSE ${researchEvidence.results.deterministic.rmse.toFixed(2)} veh/h.`,
      },
      {
        label: "Uncertainty ranking",
        value: `rho ${researchEvidence.results.mcDropout.spearman.toFixed(3)}`,
        note: "Pooled Spearman correlation between MC Dropout uncertainty and absolute error.",
      },
      {
        label: "Selective review",
        value: `${halfRetention.reductionPct.toFixed(1)}% lower MAE`,
        note: `Accepted-set MAE at ${halfRetention.retentionPct}% retention versus accepting every prediction.`,
      },
      {
        label: "Deep ensemble",
        value: `R2 ${researchEvidence.results.deepEnsemble.r2.toFixed(3)}`,
        note: `${researchEvidence.results.deepEnsemble.members}-member ensemble; MAE ${researchEvidence.results.deepEnsemble.mae.toFixed(2)} veh/h and uncertainty-error rho ${researchEvidence.results.deepEnsemble.spearman.toFixed(3)}.`,
      },
      {
        label: "Marginal coverage",
        value: `${coverage90.observedPct.toFixed(2)}% / ${coverage95.observedPct.toFixed(2)}%`,
        note: `Reported final-thesis split-conformal protocol at nominal ${coverage90.nominalPct}% / ${coverage95.nominalPct}%.`,
      },
    ],
    quality: [
      "Prediction-to-analysis workflow backed by tracked numeric artifacts",
      "Aggregate-only local evidence dashboard with automated regression checks",
      "Calibration protocols versioned instead of combining incompatible splits",
      "Thesis claims cross-checked against generated reports and cached predictions",
    ],
    limitations: [
      "One Paris network, one capacity-reduction intervention family, and a fixed 1,000-scenario subset",
      "Raw MATSim data is not publicly redistributable; a fresh clone cannot reproduce raw simulation-to-graph processing",
      "Historical preprocessing used split-specific scalers, creating an evaluation-distribution methodology risk",
      "Uncertainty ranking weakens in some high-change regimes, and coverage is marginal rather than a per-scenario guarantee",
      "The portfolio application analyzes cached artifacts; it is not a live policy simulator",
      "On the same five features and the same held-out split, a gradient-boosted tree reaches R-squared 0.7414 against the best graph model's 0.6841. The graph surrogate is retained for its uncertainty behaviour, not for its accuracy.",
    ],
    learned:
      "Reliable ML is not one score. Ranking, calibration, conditional behavior, compute cost, and the operational cost of review must be evaluated together.",
    repository: thesis.repository,
    systemSummary:
      "The research separates fast surrogate inference from uncertainty estimation, calibration, and the downstream accept-or-review decision. Each layer has a distinct evaluation protocol so confidence claims are not inferred from point accuracy alone.",
    artifacts: [
      {
        label: "Corrigendum",
        href: canonicalThesisEvidence.corrigendum,
        note: "Post-submission corrections and protocol boundaries.",
      },
      {
        label: "Aggregate audit report",
        href: canonicalThesisEvidence.aggregateReport,
        note: "Privacy-safe evidence generated from hash-locked source artifacts.",
      },
      {
        label: "Repository checks",
        href: `${thesis.repository}/actions`,
        note: "Automated provenance, static-analysis, and regression checks.",
      },
    ],
    nextStep:
      "A future replication should fit preprocessing only on training data and test transfer across networks and intervention families.",
    researchPath: thesisResearchPath,
  },
  {
    slug: "insureassist-rag",
    title: "InsureAssist: A Measured RAG Benchmark",
    eyebrow: "Retrieval evaluation",
    classification: "Reference implementation",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Project author and engineer",
    summary:
      "A retrieval-augmented question-answering service over real federal flood-insurance policy text, built so its retrieval quality can be measured rather than demonstrated.",
    metaDescription:
      "A retrieval-augmented question-answering service over real federal flood-insurance policy text, built so its retrieval quality can be measured.",
    problem:
      "The three NFIP policy forms are near-duplicates by design: they share a skeleton and much verbatim wording but differ in substance. A retriever matching on topic finds the right provision in the wrong document, and nothing in a demo reveals that.",
    contribution:
      "Built a licensed corpus with hash-verified provenance, deterministic ingestion with content-derived chunk IDs, a 40-question labelled benchmark with a held-out split, a lexical baseline to compare against, and a machine-readable reference run that the repository's own CI checks its documentation against.",
    workflow: [
      "Licensed NFIP corpus",
      "Deterministic chunking and IDs",
      "Dense and lexical retrieval",
      "Rank fusion",
      "Traceable citations",
    ],
    tools: ["FastAPI", "Qdrant", "BGE embeddings", "BM25", "Ollama", "Docker", "Kubernetes", "GitHub Actions"],
    systemSummary:
      "Retrieval is dense BGE vectors fused with an in-process BM25 index by reciprocal rank fusion. The architecture was selected on a development split and frozen before the held-out split was run once.",
    evidence: [
      {
        label: "Form discrimination",
        value: `${insureAssistBenchmark.selected.topDocumentAccuracy} top-document accuracy`,
        note: `Up from ${insureAssistBenchmark.baselines.startingPoint.topDocumentAccuracy} at the starting point: the share of questions whose best hit comes from the correct policy form, on the held-out split.`,
      },
      {
        label: "Labelled benchmark",
        value: `${insureAssistBenchmark.questions.total} questions`,
        note: `${insureAssistBenchmark.questions.answerable} answerable and ${insureAssistBenchmark.questions.unanswerable} unanswerable, each naming exact chunk IDs and character offsets across ${insureAssistBenchmark.corpus.chunks} chunks.`,
      },
      {
        label: "Citation integrity",
        value: `${insureAssistBenchmark.citations.unsupportedRate} unsupported`,
        note: "Every citation's offsets reproduce its quoted text from the committed corpus, so no provenance is fabricated.",
      },
    ],
    quality: [
      "The retrieval architecture was chosen on a development split and frozen in a committed config before the held-out split was run once",
      "Chunk IDs derive from document, offset and text, so a relevance label still points at its evidence after re-ingestion",
      "Ground-truth labels resolve from text anchors, so a chunking change regenerates them instead of invalidating the benchmark",
      "A validator rejects broken references, spans outside a document, and unanswerable questions carrying evidence",
      `${insureAssistBenchmark.tests} offline tests run with no model, no database and no network`,
      "CI reproduces the reference run against a real vector database and fails if the repository's documentation drifts from it",
    ],
    limitations: [
      "The lexical baseline alone still retrieves more relevant chunks in the top five than the selected hybrid; the hybrid was chosen for ranking and form discrimination, not raw recall",
      "Development results did not generalise: the selected architecture scored far higher on the split it was chosen on than on the held-out split",
      "Unanswerable questions are not detected. No similarity threshold was defensible on this data, so none is claimed",
      "Answer quality is not measured; only one local model is available and grading its own output would be circular",
      "One jurisdiction, one peril, three documents. Results do not transfer to insurance documents generally",
      "The Kubernetes manifests have been applied only to a local kind cluster, and the Azure Container Apps deployment hosts the API alone, with its readiness probe reporting the vector store absent by design; no full stack runs in the cloud, and the Google Cloud guide has never been run",
      "A fine-tuning notebook exists but is archived: its training data was the earlier evaluation set, so no tuned-model result could be honest",
    ],
    learned:
      "A benchmark is only worth what its hardest cases are worth. Near-duplicate documents exposed a failure that topic-level retrieval metrics would have hidden entirely.",
    artifacts: [
      { label: "Benchmark method and results", note: "Held-out metrics, baselines, failure analysis, and what the numbers do not say.", href: canonicalInsureAssistEvidence.benchmark },
      { label: "Reference run", note: "Machine-readable artefact every published number derives from.", href: canonicalInsureAssistEvidence.referenceRun },
      { label: "Frozen retrieval config", note: "The architecture and parameters, with the dev evidence that selected them.", href: canonicalInsureAssistEvidence.retrievalConfig },
      { label: "Corpus provenance", note: "Source, legal basis, extraction method, and per-document hashes.", href: canonicalInsureAssistEvidence.data },
      { label: "Limitations", note: "The complete list, including the results that did not improve.", href: canonicalInsureAssistEvidence.limitations },
    ],
    repository: "https://github.com/mzquadri/insureassist-rag-mlops",
  },
  {
    slug: "mlops-reference-pipeline",
    title: "A Testable End-to-End MLOps Pipeline",
    eyebrow: "ML systems engineering",
    classification: "Reference implementation",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Project author and engineer",
    summary:
      "A runnable reference for the lifecycle around a text classifier, rebuilt on a licensed dataset so the pipeline's own quality gate has something real to refuse.",
    problem:
      "The first version of this pipeline had every stage in place and proved nothing. Its only data path generated review text from ten templates, so the classifier scored a perfect 1.000 on rows that were 99% duplicates. The validator detected those duplicates, logged a warning, and let the run continue. A gate that cannot fail is not a gate, and a metric produced that way describes the fixture rather than the model.",
    contribution:
      "Replaced the synthetic evidence path with a checksum-verified licensed dataset, split it three ways so the test partition is read exactly once, restricted feature fitting to a single function so leakage is testable rather than asserted, added a majority-class baseline and a gate that requires a margin over it, and made the container prove a real prediction in CI instead of only building.",
    workflow: [
      "Verify and validate licensed data",
      "Split train / validation / test",
      "Fit features on train only",
      "Evaluate held-out and gate",
      "Register, promote, and serve",
    ],
    tools: ["scikit-learn", "FastAPI", "Docker", "pytest", "GitHub Actions", "ruff"],
    evidence: [
      {
        label: "Held-out accuracy",
        value: mlopsReferenceRun.test.accuracy.toFixed(4),
        note: `Weighted F1 ${mlopsReferenceRun.test.f1Weighted.toFixed(4)} on ${mlopsReferenceRun.split.test} test rows, against a majority-class baseline of ${mlopsReferenceRun.test.baselineAccuracy.toFixed(4)}, a margin of ${mlopsBaselineMargin.toFixed(4)}.`,
      },
      {
        label: "Ranking quality",
        value: `ROC-AUC ${mlopsReferenceRun.test.rocAuc.toFixed(4)}`,
        note: `PR-AUC ${mlopsReferenceRun.test.prAuc.toFixed(4)} on the same held-out rows.`,
      },
      {
        label: "Licensed data",
        value: `${mlopsReferenceRun.dataset.rows.toLocaleString("en-US")} rows`,
        note: `${mlopsReferenceRun.dataset.name}, ${mlopsReferenceRun.dataset.balance}, ${mlopsReferenceRun.dataset.license}. Downloaded on demand against a pinned SHA-256 and never redistributed.`,
      },
      {
        label: "Split discipline",
        value: `${mlopsReferenceRun.split.train.toLocaleString("en-US")} / ${mlopsReferenceRun.split.validation} / ${mlopsReferenceRun.split.test}`,
        note: "Train, validation, test. Gate thresholds were derived from the validation split and the baseline; the test split was not used to select a threshold, model, or hyperparameter.",
      },
      {
        label: "Reproducibility",
        value: "Byte-identical artifacts",
        note: "The same model and transformer files, and metrics agreeing to twelve decimal places, across Windows, a clean virtual environment, and Ubuntu CI.",
      },
      {
        label: "Automated tests",
        value: `${mlopsReferenceRun.tests.total} tests`,
        note: `Unit, integration, and container layers. The container test builds the image, mounts a promoted bundle, and makes a real HTTP prediction.`,
      },
    ],
    quality: [
      "Input validation can refuse: a degenerate dataset stops the run instead of producing a flattering score on it",
      "One function fits preprocessing state; a test asserts that a token seen only outside training never enters the vocabulary",
      "The promotion gate requires a margin over a majority-class baseline, so a raw accuracy floor cannot pass an imbalanced non-model",
      `A published bundle carries SHA-256 checksums for ${mlopsReferenceRun.bundle.checksummedArtifacts} artifacts plus dataset provenance and licence, all validated before loading`,
      "The service separates liveness from readiness and starts unready rather than crashing when no model is available",
      "CI runs offline tests, the licensed-data reference run, and container integration as separate jobs",
    ],
    limitations: [
      `Only ${mlopsReferenceRun.split.test} held-out test rows, so the confidence interval on accuracy is roughly three points; a one-point difference between models on this split is noise`,
      "Metrics are pooled across the dataset's three sources; per-source performance is not reported and would very likely differ",
      "No probability calibration is reported, because nothing downstream consumes the probabilities as probabilities",
      "A reference implementation that has never carried production traffic",
      "Monitoring is an in-process counter endpoint over a bounded window, not a monitoring system",
      "No delayed-label path exists, so nothing measures accuracy after deployment, only behaviour",
      "MLflow tracking is optional and disabled by default; the bundle, not a tracking server, is the source of truth for promotion",
    ],
    learned:
      "A pipeline can have every correct stage and still prove nothing. The evidence a run produces is only as good as the data underneath it, and the fastest way to find that out is to give the quality gate something it can actually refuse.",
    repository: canonicalMlopsEvidence.repository,
    systemSummary:
      "Each stage is a contract. Data is verified against a pinned checksum and can be refused, preprocessing is fitted on the training partition alone, evaluation reconstructs the split recorded in the candidate's lineage rather than accepting one supplied later, and the service loads only a checksum-valid bundle the registry marks as production.",
    artifacts: [
      {
        label: "Evaluation methodology",
        href: canonicalMlopsEvidence.evaluation,
        note: "Split methodology, metric choices, and how the gate thresholds were derived from the validation split.",
      },
      {
        label: "Data provenance and licence",
        href: canonicalMlopsEvidence.data,
        note: "Dataset source, pinned checksum, attribution obligations, and why the data is downloaded rather than committed.",
      },
      {
        label: "Automated tests",
        href: canonicalMlopsEvidence.tests,
        note: `${mlopsReferenceRun.tests.total} tests covering leakage, gate refusal, reproducibility, the serving path, and the container.`,
      },
      {
        label: "Production gaps",
        href: canonicalMlopsEvidence.production,
        note: "What a production system would add, and why none of it is simulated here.",
      },
      {
        label: "CI workflow",
        href: canonicalMlopsEvidence.actions,
        note: "Live status for the offline tests, the licensed-data reference run, and container integration.",
      },
    ],
    nextStep:
      "Slice-aware evaluation. The dataset pools Amazon, IMDb, and Yelp sentences into one score, and an aggregate number hides per-segment failure. The next evidence milestone is per-source metrics on the held-out split, and a gate that can refuse a model which is strong overall but weak on one source.",
  },
  {
    slug: "audi-release-tracking",
    title: "A Wide Sheet, and Four Frames",
    eyebrow: "Internship engineering",
    classification: "Employer engineering",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Intern, programming of workflows and linking of databases",
    institution: "AUDI AG",
    summary:
      "An Excel VBA application that answered one question about one component from a dropdown and a click, kept the spreadsheet as the source of truth, and reached the release system the rest of the company already used.",
    metaDescription:
      "A release sheet of about 600 rows and 130 or more columns, read by scanning, replaced by a form with fields grouped by subject. A public case study with no employer code in it.",
    problem:
      "One spreadsheet carried the development release state for a department's components: about 600 rows and 130 or more columns. People wanted one record and the sheet made them look at all of them, repeatedly, as part of their job. Two markets carried different fields, so the same question had two shapes.",
    contribution:
      "Built the input and output masks: a dropdown that fills a form from the row behind it, fields regrouped by subject rather than by column order, create, update and delete written straight back to the source sheet, milestone annotation, one interface per market, and buttons wired through to the existing release system so the tool's view and the company's view could not drift apart.",
    workflow: [
      "Open on the sheet people already had",
      "Pick the component from a list",
      "Look up its row behind the form",
      "Fill frames grouped by subject",
      "Write back to the same sheet",
    ],
    tools: ["Excel VBA", "UserForms", "Event-driven programming", "Data validation"],
    evidence: [
      {
        label: "What it replaced",
        value: `about ${releaseSheet.rows} rows`,
        note: `And ${releaseSheet.columns} or more columns, in one sheet, read by scanning the grid by eye. Both figures are approximate in the internship report and are published that way.`,
      },
      {
        label: "What it produced",
        value: `${releaseFrames.length} frames`,
        note: `${releaseFrames.map((f) => f.label).join(", ")}. The column order is an accident of how the sheet grew; choosing the grouping was the work, and drawing the form was an afternoon of it.`,
      },
      {
        label: "Taken up beyond the first",
        value: "one department, then others",
        note: `The internship report's own wording is that the interface was ${releaseAdoption.reportWording}. It records no count, no time saved and no error rate, and none is claimed here.`,
      },
      {
        label: "Two markets",
        value: `${releaseMarkets} interfaces`,
        note: `Over one workbook, because the two markets ask for different fields. Milestones ${releaseMilestones.join(", ")} are annotated on the release data, each with its own comment.`,
      },
    ],
    quality: [
      "The sheet stayed the source of truth, so the tool never became a second copy of it",
      "It lived in the workbook people already had open, rather than being a second place to look",
      "Write-back was in from the start: the people reading the sheet were the people changing it, and a read-only viewer would have been abandoned",
      "The link to the existing release system was wired through rather than reimplemented",
      "The public case study carries no employer source code, no internal data, no part numbers, no suppliers, no real field values, no screenshots and no colleagues' names",
    ],
    limitations: [
      "The tool itself is not public and cannot be. What is public is the problem, the design and the figures, drawn by a script from the internship report rather than captured from the application",
      "The report records no adoption count, no time saved and no error rate, so none of the three is published",
      "The row and column figures are approximate in the source and are not measurements",
      "The wireframe is drawn from the layout the report describes, and no field on it carries a value",
    ],
    learned:
      "The interface was the smallest part. Deciding which fields belong beside which others, and which of the columns nobody actually reads, took the rest of it. The hardest piece was connecting to the system that already existed, which is also the piece that made it worth building: a tool that keeps its own copy of the truth is a second source of truth, which is the problem it was supposed to solve.",
    repository: releaseRepository,
    systemSummary:
      "The workbook held the forms, the modules and the data sheet, and the existing release system sat beside it with a link running between the two. Nothing was duplicated: the sheet other people read stayed the sheet the tool wrote to.",
    nextStep:
      "Nothing. The internship ended in June 2023 and the case study is a record of it rather than work in progress.",
  },
  {
    slug: "keras-pytorch-parity",
    title: "A Translation, Not a Race",
    eyebrow: "Frameworks compared",
    classification: "Reproducible experiment",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Project author",
    summary:
      "The CIFAR-10 model from the PyTorch experiment rebuilt in Keras and trained on exactly the same images, to separate what a framework changes from what everything else changes.",
    metaDescription:
      "A CIFAR-10 CNN translated from PyTorch to Keras on the same exported split, with 815,018 parameters asserted on every push and five framework differences enumerated.",
    problem:
      "A framework comparison is worth nothing if the two models see different images or are not the same model. Both are easy to get wrong quietly: two random number streams cannot be made to draw the same augmentations, and two block diagrams can agree while the models underneath them do not.",
    contribution:
      "Exported the exact training indices by running torch rather than reproducing them in NumPy, translated the architecture with the parameter count derived by hand and asserted in CI, and enumerated the five differences between the frameworks with the correction each one needed.",
    workflow: [
      "Export the split by running torch",
      "Translate the architecture",
      "Derive the parameter count by hand",
      "Correct for each framework difference",
      "Assert the count on every push",
    ],
    tools: ["TensorFlow", "Keras", "NumPy", "Docker", "GitHub Actions"],
    evidence: [
      {
        label: "Both models, asserted",
        value: `${translationModel.parameters.toLocaleString("en-US")} parameters`,
        note: "Derived by hand per layer and asserted on every push by a check that needs no data, no compile and no fit, because the training runs elsewhere and the number was otherwise only as true as somebody's memory of the last run.",
      },
      {
        label: "The same images",
        value: `${translationModel.subsetTotal.toLocaleString("en-US")} indices`,
        note: `${translationModel.trainImages.toLocaleString("en-US")} train and ${translationModel.validationImages.toLocaleString("en-US")} validation, exported by running torch rather than reproduced in NumPy, because torch's random stream cannot be replicated there and guessing would have made the comparison meaningless without saying so.`,
      },
      {
        label: "Differences enumerated",
        value: `${translationResolved} of ${translationTotal} corrected`,
        note: "Weight decay, the learning-rate schedule, channel dropout and the augmentation definitions were each corrected for. The reduction order of the kernels is accepted as the irreducible floor on any comparison of this kind.",
      },
    ],
    quality: [
      "The parameter count is asserted rather than stated, by a check that runs on every push in seconds",
      "The split travels as exported indices, so the two frameworks cannot quietly see different images",
      "Weight decay is halved for Keras, because the penalty enters the loss there rather than the gradient and its derivative carries a factor of two",
      "The two dropout rates are kept as separate constants, because the count cannot catch them being confused",
      "CIFAR-10 itself is never committed; only the index file travels",
    ],
    limitations: [
      "The Keras run has not been made. The repository's results directory is empty and its own table records the Keras accuracy as pending, so no comparison figure is published here",
      "Even with every correction applied, kernel reduction orders differ between frameworks and devices, so an exact match was never available",
      "The parameter count is a floor, not a proof: it catches a wrong channel width or a missing bias, and it cannot catch the two dropout rates being confused, which is the worked example in the repository",
      "One architecture on one subset of one dataset, which says nothing general about either framework",
    ],
    learned: `The assertion that protects the comparison also shows its limit. ${translationMissed.detail} So the count is where the checking starts rather than where it ends.`,
    repository: translationRepository,
    systemSummary:
      "The architecture, the split and the parameter count are three separate artefacts that have to agree. The count is checked without training, the split is checked before training, and the training script refuses to run if either disagrees.",
    nextStep:
      "Run it. Everything needed for the comparison is in place and the one thing missing is the Keras number, which has to come from a GPU rather than from this repository's CI.",
  },
  {
    slug: "eurostat-modal-split",
    title: "Twenty-Four Years, Half a Point",
    eyebrow: "Official statistics in R",
    classification: "Reproducible experiment",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Project author",
    summary:
      "A Quarto and ggplot2 report on the Eurostat modal split of inland passenger transport, where every number in the prose is computed at render time so the text cannot drift away from the figures.",
    metaDescription:
      "The EU car share of inland passenger transport was 82.0% in 2000 and 82.5% in 2024. A reproducible Quarto report on the Eurostat table, pinned by SHA-256.",
    problem:
      "A report that types its findings into its prose can be correct on the day it is written and wrong the next time the data is refreshed, with nothing to catch the gap. And the finding here is an absence: the share of inland passenger distance taken by car in the EU has barely moved since 2000, which is harder to publish honestly than a trend, because a flat line read on its own says nothing happened rather than this is the result.",
    contribution:
      "Decoded the JSON-stat response by hand rather than using the Eurostat package, committed the raw response with a pinned SHA-256 that CI recomputes, and wrote every figure in the prose as a computed value rather than a literal, so the text and the charts are produced from one pass over the same data.",
    workflow: [
      "Retrieve the table and commit the response",
      "Pin it by SHA-256, recomputed in CI",
      "Decode JSON-stat by hand",
      "Select the comparison year by coverage",
      "Render prose and figures from one pass",
    ],
    tools: ["R", "Quarto", "ggplot2", "jsonlite", "Docker", "GitHub Actions"],
    evidence: [
      {
        label: "What 24 years moved",
        value: `+${modalEuShare.changePoints} points`,
        note: `The ${modalEuShare.aggregate} car share was ${modalEuShare.from} per cent in ${modalEuShare.fromYear} and ${modalEuShare.to} in ${modalEuShare.toYear}. Whatever has changed in European transport policy over that period, it has not changed what share of distance is driven.`,
      },
      {
        label: "What a border moves",
        value: `${modalSpreadFacts.points} points`,
        note: `In ${modalCoverageFacts.comparisonYear} the spread across countries runs from ${modalSpreadFacts.lowest.share} per cent in ${modalSpreadFacts.lowest.country} to ${modalSpreadFacts.highest.share} in ${modalSpreadFacts.highest.country}. Germany is ${modalSpreadFacts.germany.share}, ranking ${modalSpreadFacts.germany.rank} of ${modalSpreadFacts.germany.of}.`,
      },
      {
        label: "Rail",
        value: `${modalRail.gainedIn} of ${modalRail.of} countries`,
        note: `Gained share between each country's own first and last reported year. The largest gain is ${modalRail.largest.country}, up ${modalRail.largest.points} points.`,
      },
      {
        label: "Reproducibility",
        value: "Pinned and recomputed",
        note: `${modalSource.publisher} ${modalSource.dataset}, retrieved ${modalSource.retrievedAt} and committed with its SHA-256. CI recomputes the digest and fails if it stops matching the README and the provenance file, so the snapshot, the prose and the figures cannot drift apart.`,
      },
    ],
    quality: [
      "Every figure in the prose is computed at render time; none is typed in",
      "The raw API response is committed, so the report renders offline and reproducibly",
      "The comparison year is selected by reporting coverage rather than by taking the latest year present",
      "JSON-stat is decoded by hand, which is the part of the work worth showing, so the Eurostat package is deliberately not a dependency",
      "The output is one self-contained HTML file with the figures and CSS inlined",
    ],
    limitations: [
      "A descriptive report. It measures shares and says nothing about why any of them moved or did not",
      "Modal split is a share of distance, so a country can hold its car share steady while total distance travelled rises or falls underneath it",
      "Coverage is uneven across countries and years, which is why the single-year comparisons use one year chosen by coverage rather than the latest available",
      "One snapshot of one table, pinned on a date. It is reproducible rather than live",
    ],
    learned:
      "An absence is a finding, but it only reads as one next to something that did change. The flat EU line means nothing on its own and means a great deal beside a 30.9 point spread between two countries in a single year.",
    repository: modalRepository,
    systemSummary:
      "One Quarto document is the whole pipeline: it reads the committed response, decodes it, derives every figure, and emits the prose and the charts together. There is no step in which a number is copied from one artefact into another.",
    nextStep:
      "A second table. Modal split is a share, and a share cannot distinguish a country where driving fell from one where everything else rose faster. Passenger-kilometres alongside it would separate the two.",
  },
  {
    slug: "bm25-rrf-java",
    title: "Two Implementations, One Ranking",
    eyebrow: "Retrieval on the JVM",
    classification: "Reference implementation",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Project author",
    summary:
      "Okapi BM25 and reciprocal rank fusion written on the JVM and held to an existing Python implementation by a parity test over fifty real queries, with the rankings compared exactly.",
    metaDescription:
      "BM25 and reciprocal rank fusion on the JVM, held to a Python reference: 314 chunks and 50 queries compared exactly, scores to a relative 1e-12.",
    problem:
      "Rewriting a retrieval scorer in another language is easy to do approximately and hard to do identically. Floating-point addition is not associative, so summing the same contributions in a different order can land a few units in the last place away, and on this corpus the top two results for the first question are about four thousandths apart. That is close enough for a reordering to look like a bug in the ranking rather than a difference in arithmetic.",
    contribution:
      "Implemented the tokenizer, chunker, BM25 index and rank fusion with no dependencies in the main source, then wrote the parity test that loads the corpus, verifies it against a pinned SHA-256, chunks it independently and compares its own output against the Python reference rather than trusting the exported fixture.",
    workflow: [
      "Verify the corpus against its checksum",
      "Chunk it on the JVM, not from the fixture",
      "Build the index and score",
      "Fuse the ranked lists by position",
      "Compare order exactly, scores to a tolerance",
    ],
    tools: ["Java 21", "Maven", "JUnit 5", "Jackson", "GitHub Actions"],
    evidence: [
      {
        label: "Rankings compared exactly",
        value: `${parityFacts.questions} questions`,
        note: `BM25 order and identifiers at depth ${parityFacts.bm25Depth}, fused order at depth ${parityFacts.rrfDepth}, both compared exactly rather than to a tolerance. Scores are allowed a relative ${parityFacts.scoreTolerance}.`,
      },
      {
        label: "Chunking compared first",
        value: `all ${parityFacts.chunks} chunks`,
        note: "Count, identifiers, offsets and text, across three corpus files. Java chunks the corpus itself rather than reading the exported chunks, so a chunking difference fails as a chunking mismatch instead of surfacing later as a confusing BM25 discrepancy.",
      },
      {
        label: "The pair most at risk",
        value: `${parityClosest} apart`,
        note: `The top two results for ${paritySampleQ.questionId} differ by that much. A different summation order would swap them, which is why the loop order matches the reference, an inverted index is deliberately not used, and the logarithm is StrictMath rather than Math.`,
      },
    ],
    quality: [
      "No dependencies in the main source: BM25 and rank fusion need arithmetic, a hash and a regex, and a retrieval library would hide the thing the repository exists to show",
      "The corpus is verified against a SHA-256 in its own manifest before anything is indexed",
      "Chunking is compared before scoring, so failures surface at the layer that caused them",
      "StrictMath rather than Math, because the latter is permitted a unit in the last place of error and may be swapped for a JIT intrinsic",
      "Repeated query terms are not collapsed, because the reference does not collapse them either",
    ],
    limitations: [
      "Parity is against one reference implementation on one corpus. It shows the two agree, not that either is correct",
      "The dense vectors are an exported fixture rather than recomputed on the JVM, and the embedding model is pinned by name only, so re-exporting on a different stack can change those lists",
      "Fifty questions over three near-duplicate policy forms is a parity harness, not a retrieval benchmark, and no relevance judgement is involved",
      "A library-free implementation chosen for comparability rather than for speed: the slower document-major loop is the correct one here",
    ],
    learned:
      "Agreement between two implementations is only meaningful if the comparison is exact, and making it exact meant giving up the obvious optimisation. An inverted index would visit documents in posting-list order, which reorders the additions, which moves the last few bits, which swaps a pair four thousandths apart.",
    repository: parityRepository,
    systemSummary:
      "The test is the artefact. It verifies the corpus, chunks it independently, builds an index, fuses two ranked lists, and compares order against a committed reference produced by a different language's implementation of the same specification.",
    nextStep:
      "Recompute the dense side on the JVM. The sparse half is held to the reference exactly; the dense half is a fixture, so the fused ranking is only as reproducible as an embedding model pinned by name.",
  },
  {
    slug: "munich-accident-forecasting",
    title: "A Published Margin That Does Not Survive an Ordinary Year",
    eyebrow: "Forecasting",
    classification: "Reproducible experiment",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Project author",
    summary:
      "Monthly forecasts for the seven road accident series Munich publishes, and a measurement of how much of the headline result is the method rather than the two years it was scored on.",
    metaDescription:
      "A seasonal-trend forecaster beats its baseline by 23.4% on 2021 and 2022, and loses to it on 2018 and 2019. The repository measures that rather than caveating it.",
    problem:
      "The model beats a seasonal-naive baseline by 23.4% on the published window, on all seven series. That baseline repeats the previous calendar month, and on this window the previous year is 2020, so the baseline forecasts a pandemic. Saying so in a caveat is not the same as measuring it.",
    contribution:
      "Ran the identical protocol three years earlier, over a stretch where nothing unusual happened, with the same code, the same metrics and the same number of held-out rows. Then measured both margins against resampling, because a single number on 24 months says nothing about whether it would hold on a different 24 months.",
    workflow: [
      "Seven published series, one model each",
      "Select the trend window on two validation years",
      "Refit and score once on the two years after",
      "Re-run the whole protocol on a pre-pandemic window",
      "Bootstrap both margins over held-out months",
    ],
    tools: ["scikit-learn", "pandas", "FastAPI", "pytest", "GitHub Actions"],
    evidence: [
      {
        label: "The published margin",
        value: `+${(munichWindows[0].margin * 100).toFixed(1)}%`,
        note: `Scaled MAE ${munichWindows[0].scaledMae} against a seasonal-naive ${munichWindows[0].naiveScaledMae} on ${munichTestRows} held-out monthly observations, winning on ${munichWindows[0].seriesWon} of ${munichSeriesTotal} series. A 3-month moving-block bootstrap puts it between ${(munichWindows[0].low * 100).toFixed(1)} and ${(munichWindows[0].high * 100).toFixed(1)} per cent, which stays clear of zero.`,
      },
      {
        label: "The same protocol, ordinary years",
        value: `${(munichWindows[1].margin * 100).toFixed(1)}%`,
        note: `Selected on 2016 and 2017, scored once on ${munichWindows[1].testYears}. The sign flips and the model wins on ${munichWindows[1].seriesWon} of ${munichSeriesTotal} series. Its interval runs ${(munichWindows[1].low * 100).toFixed(1)} to ${(munichWindows[1].high * 100).toFixed(1)} per cent, so on 24 months this margin cannot be told apart from no difference either way.`,
      },
      {
        label: "What the move costs",
        value: `${munichMarginShareLost.toFixed(2)}x the margin`,
        note: "Moving to an ordinary period costs more than the entire published margin, which is what the repository records rather than what it claims for the method.",
      },
      {
        label: "The data",
        value: `${munichDataset.monthlyObservations.toLocaleString("en-US")} monthly observations`,
        note: `${munichDataset.series} series, ${munichDataset.firstYear} to ${munichDataset.lastYear}, from the ${munichDataset.source}. Errors are scaled by each series' own level before averaging, because the largest series is about 169 times the smallest.`,
      },
    ],
    quality: [
      "Both windows are produced by the same function, so the two rows are not two scripts that happen to agree",
      "The held-out years are scored once; the trend window is chosen on separate validation years",
      "The bootstrap is paired, so every method is scored on the same resampled months and what varies is the margin rather than the noise in each",
      "It is run twice, independently and in blocks of three months, and the wider interval is the one the README tells you to believe",
      "Errors are scaled per series before averaging, so the small series are not drowned out by the large ones",
    ],
    limitations: [
      "Both margins rest on 24 months of seven series. Neither row should be read as settled, and the pre-pandemic one explicitly cannot be distinguished from zero",
      "The two windows also select different models: a 12-year trend window against a 6-year one. Same procedure, different data, so the comparison is between two protocol runs rather than one model on two periods",
      "Counts only. No exposure denominator, no severity weighting, and no causal claim about why any series moves",
      "A coding-challenge project rebuilt afterwards, not a deployed forecasting service",
    ],
    learned:
      "A baseline carries its own history, and on this window the history was a pandemic. The honest way to find that out was not to add a sentence of caveat but to run the whole protocol somewhere the pandemic was not, and then to check whether either answer survives being resampled. Only one of them does.",
    repository: munichRepository,
    systemSummary:
      "One protocol, parameterised by which years are validation, which year training ends on, and which two years are held out. The published run and the pre-pandemic run are two calls to it, which is what makes them comparable at all.",
    nextStep:
      "More held-out periods. Two windows give two answers and no sense of the spread between them; running the same protocol across every available pair of years would say whether the published window is unusual or whether the margin is simply noisy from one period to the next.",
  },
  {
    slug: "drift-aware-platform",
    title: "A Retraining Loop That Watches the Target",
    eyebrow: "ML systems engineering",
    classification: "Reference implementation",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Project author and engineer",
    summary:
      "An hourly demand service that monitors the distribution of the thing it predicts rather than only its inputs, because on this data the inputs barely move while the target moves enormously.",
    metaDescription:
      "A retraining loop whose drift signal is in the target, not the features: 0.679 against 0.09, with a promotion gate that refuses a model for not beating itself.",
    problem:
      "The obvious way to monitor a deployed model is to watch its input features for drift. On this dataset that design is almost silent. Between 2011 and 2012 one feature column of eleven crosses its threshold, a feature drift share of 0.09, while the target's distribution moves 0.679. A monitor watching inputs alone would have reported nothing worth acting on.",
    contribution:
      "Built the loop and its policy: a drift check that measures the target first because that is the signal that fires here, two promotion gates a challenger has to clear, and a split between measurement and policy so the policy can be unit tested without a library, a network or any data.",
    workflow: [
      "Pin the dataset by SHA-256",
      "Fit a challenger and gate it",
      "Compare a serving window against the same seasons a year earlier",
      "Decide retrain, on either signal",
      "Move the champion alias the service loads",
    ],
    tools: ["scikit-learn", "MLflow", "Evidently", "Airflow", "FastAPI", "Prometheus", "Terraform"],
    evidence: [
      {
        label: "Where the drift actually was",
        value: `${driftScores.target} against ${driftScores.featureShare}`,
        note: `Target drift against feature drift share, comparing 2012 with the same seasons in 2011. Only ${driftScores.movedColumn} crossed the ${driftScores.columnThreshold} per-column threshold, one of ${driftScores.featureColumns} feature columns.`,
      },
      {
        label: "What that drift cost",
        value: `MAE ${driftRescored.championOnNewWindow} to ${driftRescored.challengerOnNewWindow}`,
        note: "The 2011 champion re-scored on the 2012 window against a model fitted to it. An old mapping fitting worse than a new one is the stronger evidence that the relationship moved, rather than the drift score itself.",
      },
      {
        label: "A gate that refuses",
        value: `${driftRuns[2].promoted ? "promoted" : "refused"}`,
        note: `The exported run record carries the reason verbatim: "${driftRuns[2].reason}". The same model, offered twice, is turned down the second time for not being better than itself.`,
      },
      {
        label: "A streaming detector was not faster",
        value: `row ${driftDetector.firstAlarmRow}`,
        note: `${driftDetector.name} at delta ${driftDetector.delta}, the most sensitive setting that raises ${driftDetector.controlAlarms} alarms on the control window, first speaks at row ${driftDetector.firstAlarmRow} of ${driftDetector.currentRows}. The window monitor already in the service crosses its threshold in the same span, with one fewer dependency.`,
      },
    ],
    quality: [
      "Measurement and policy are separate, so the policy has unit tests that need no library, no network and no data",
      "The window guard runs before the drift check, because a handful of rows fails a distribution test for reasons that have nothing to do with the world moving",
      "A refused promotion writes its reason to the run summary, so it is auditable rather than mysterious",
      "The dataset is pinned by SHA-256 and downloaded on demand rather than committed",
      "The architecture diagram is generated from the code that describes it, not drawn by hand",
      "Both Airflow DAGs have been run, and the transcript is in the repository",
    ],
    limitations: [
      "The target drift score is label shift, a distance between two marginal distributions of the target. It is a proxy for the relationship moving rather than a measurement of it; real concept drift is not monitored directly",
      "Nothing here produces a confidence interval on a prediction. The word calibrated in this repository refers to one thing only, the streaming detector's delta parameter",
      "A reference implementation on a public dataset that has never carried production traffic",
      "The drift comparison is between two years of one dataset, so the seasonal alignment that fixes the false alarm is tuned to data with a yearly cycle",
      "No delayed-label path exists, so the loop measures distributions rather than accuracy after deployment",
    ],
    learned:
      "The monitor you would build first is the one that would have missed this. Watching inputs is the obvious design and it is nearly silent here, and the gate that was supposed to protect production was comparing two numbers measured on different windows, which made it block the retraining that drift had just correctly called for.",
    repository: driftRepository,
    systemSummary:
      "Three loops that only meet through artefacts. Training fits a challenger and ships it only through two gates. Monitoring compares a serving window against the same seasons a year earlier and applies the policy. Serving loads whichever version the champion alias points at, and appends its traffic to the log the drift job reads.",
    nextStep: `A delayed-label path. Everything here measures distributions, which is what is available at serving time, but the honest signal is accuracy against outcomes once they arrive. Until that exists the loop can tell that the world moved and cannot tell whether the retrained model is actually better in production. The seasonal fix brought the real signal forward from about day ${driftSeasonalFix.realSignalWasDay} to day ${driftSeasonalFix.realSignalNowDay}, and the next thing worth measuring is what happens after the retrain.`,
  },
  {
    slug: "hydrology-uq",
    title: "Uncertainty Quantification in Hydrology",
    eyebrow: "TUM project seminar",
    classification: "Group coursework",
    authors: [
      { name: site.name, url: site.github },
      { name: "Christine Leers", url: "https://github.com/chrLeers" },
      { name: "Yihan Shen", url: "https://github.com/warumso7" },
    ],
    projectRole: "Group contributor; individual ownership of assignment results is not claimed",
    institution: thesis.institution,
    summary:
      "A team seminar connecting HBV rainfall-runoff calibration, local and global sensitivity analysis, and input/output uncertainty propagation.",
    problem:
      "A calibrated hydrological model can still hide large uncertainty from forcing data, rating curves, parameters, and model structure.",
    contribution:
      "Contributed within a three-person TUM seminar team to a progressive workflow covering differential-evolution calibration, sensitivity analysis, precipitation perturbation, and rating-curve uncertainty. Individual assignment ownership is not claimed.",
    workflow: [
      "HBV baseline",
      "Parameter calibration",
      "Local sensitivity",
      "Global sensitivity",
      "Input and output uncertainty",
    ],
    tools: ["Python", "NumPy", "SciPy (QMC sampling)", "pandas", "Matplotlib", "LaTeX"],
    evidence: [
      {
        label: "Best seminar result",
        value: "NSE 0.908",
        note: "Versioned group-seminar result for the calibrated HBV baseline.",
      },
      {
        label: "Central finding",
        value: "Output uncertainty dominates",
        note: "The seminar report finds rating-curve uncertainty more consequential than the tested precipitation noise.",
      },
    ],
    quality: [
      "Versioned reports, figures, and result artifacts",
      "Explicit environment variables replace machine-specific data paths",
      "Repository integrity checker validates key seminar artifacts",
      "Team authorship and unavailable course inputs are documented",
    ],
    limitations: [
      "Group coursework; individual ownership of each result is not established",
      "Course-provided forcing data and the hmg package are not redistributable",
      "Full scientific reruns require authorized course inputs",
    ],
    learned:
      "Calibration quality cannot stand in for uncertainty analysis; observation and transformation errors can dominate parameter uncertainty.",
    repository: "https://github.com/mzquadri/UQ-Hydrology-Seminar-TUM",
  },
  {
    slug: "cifar10-cnn",
    title: "CIFAR-10 CNN: A Reproducible Baseline",
    eyebrow: "Deep learning experiment",
    classification: "Reproducible experiment",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Project author",
    summary:
      "A compact PyTorch image-classification experiment with a tracked configuration, learning history, class-level diagnostics, and an honest reference result.",
    problem:
      "Small vision experiments are easy to overstate when only the best headline number survives and the run configuration is lost.",
    contribution:
      "Implemented the training and evaluation path, tracked one bounded reference run, and retained per-class performance and plots rather than claiming an unrecorded full-dataset result.",
    workflow: ["CIFAR-10 subset", "CNN training", "Validation selection", "Test evaluation", "Class diagnostics"],
    tools: ["PyTorch", "torchvision", "NumPy", "Matplotlib", "scikit-learn"],
    evidence: [
      {
        label: "Tracked test accuracy",
        value: "64.26%",
        note: "15,000 training samples, 12 epochs, and 815,018 parameters in the versioned reference run.",
      },
      {
        label: "Diagnostic range",
        value: "33.5 to 82.0%",
        note: "Per-class accuracy exposes large variation hidden by the aggregate score.",
      },
    ],
    quality: [
      "Run configuration and metrics are stored together",
      "Learning curves, confusion matrix, and class-level results are tracked",
      "The portfolio uses the recorded 64.26% result rather than an aspirational 85% claim",
    ],
    limitations: [
      "A bounded educational baseline, not a state-of-the-art result",
      "The reference run uses a 15,000-image training subset",
      "No trained checkpoint is versioned",
    ],
    learned:
      "Reproducibility means keeping the unglamorous context, the subset, epochs, configuration, and weak classes, next to the score.",
    repository: "https://github.com/mzquadri/CNN-Image-Classification-PyTorch",
  },
  {
    slug: "streamflow-forecasting",
    title: "Synthetic Streamflow Forecasting Benchmark",
    eyebrow: "Scientific computing demonstration",
    classification: "Synthetic demonstration",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Project author",
    summary:
      "A controlled benchmark that scores ridge, XGBoost and SARIMAX against the baselines that actually matter on a daily series, and finds that the gradient booster loses to predicting yesterday's value.",
    metaDescription:
      "A controlled benchmark scoring ridge, XGBoost and SARIMAX against the baselines that matter on a daily series. The gradient booster loses to them.",
    problem:
      "An earlier version of this repository ranked XGBoost at R2 0.979 above SARIMAX at 0.721. The two numbers were scored on different targets, daily and monthly, and the only baseline offered was a day-of-year mean that could not win. The question became which methods beat a fair baseline on the same rows.",
    contribution:
      "Rebuilt the comparison so every daily method is scored on the same 730 held-out days, added persistence, random walk with drift and a trend-corrected day-of-year baseline, added a ridge model on the same features, and repeated the whole comparison over five seeds.",
    workflow: ["Synthetic 15-year series", "Chronological holdout", "Fair daily baselines", "Five-seed repeat", "Error analysis"],
    tools: ["XGBoost", "statsmodels", "scikit-learn", "pandas", "NumPy", "Matplotlib"],
    evidence: [
      {
        label: "Persistence baseline",
        value: "R2 0.988",
        note: "Predicting yesterday's value, on the same 730 held-out days as every daily model.",
      },
      {
        label: "XGBoost",
        value: "R2 0.985",
        note: "Twenty engineered lag, rolling and calendar features, and still below persistence; it fails to beat it on all five seeds.",
      },
      {
        label: "Ridge on the same features",
        value: "R2 0.994",
        note: "The only method that improves on persistence, and it does so on all five seeds.",
      },
    ],
    quality: [
      "Fixed-seed data generator and chronological test split",
      "Every daily method scored on the same held-out rows",
      "Comparison repeated over five seeds and recorded in results/benchmark.json",
      "SARIMAX reported on monthly means and kept out of the daily ranking",
    ],
    limitations: [
      "Synthetic data cannot establish real-catchment performance",
      "The feature models see same-day observed weather, so they are nowcasts rather than pure one-step-ahead forecasts",
      "The benchmark does not test recursive multi-day behavior or distribution shift",
    ],
    learned:
      "A leaderboard is only as good as its weakest baseline. On a series this persistent, repeating yesterday's value is the number every model has to beat.",
    repository: "https://github.com/mzquadri/Time-Series-Streamflow-Forecasting",
  },
  {
    slug: "mcp-policy-gateway",
    title: "MCP Policy Gateway",
    eyebrow: "Runtime policy enforcement for MCP tool calls",
    classification: "Engineering prototype",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Sole author of the gateway, controls, corpus, benchmark and trace format",
    summary:
      "An MCP client trusts three things at three different times: the tool declarations a server publishes, the arguments a model builds, and the content a tool returns. The security tooling that exists reads declarations before use, which covers the first and cannot reach the third, a poisoned search result does not exist until the search runs. This puts an enforcement point at the protocol boundary, where all three are visible, and then measures what each control is worth against a corpus that includes the legitimate traffic a careless rule would break.",
    metaDescription:
      "An enforcement point at the MCP protocol boundary, measuring what each control is worth against a corpus that includes traffic a careless rule breaks.",
    problem:
      "A tool description is prose the client concatenates into a prompt, and a tool result is prose appended to the conversation. A model has no reliable way to tell a sentence that describes data from a sentence that instructs it, and there is no parameterised query for a prompt. So the question is not how to make the model resistant to persuasion; it is how much of the deputy's authority can be taken away at the boundary before the cost in refused legitimate calls makes an operator switch the control off.",
    contribution:
      "Everything except the protocol itself. The gateway is an MCP server to the client and an MCP client to the downstream server, so it needs no cooperation from either and works against a server whose source I do not have. Nine controls run across three stages; eight of them answer decidable questions and one has to make a judgement, which is deliberate; it means the false-positive story has exactly one owner. The Model Context Protocol SDK is a dependency and is not my work.",
    systemSummary:
      "Client speaks MCP to the gateway; the gateway speaks MCP to the real server. Policy runs when declarations are relayed, before arguments are forwarded, and before results re-enter context. Every decision is written to a JSON Lines trace that stores digests and lengths rather than payloads.",
    workflow: [
      "Relay the downstream tool list, withholding or stripping declarations that carry instructions",
      "Check arguments against the schema the server itself published, and against the sandbox",
      "Forward the call, or refuse it, or hold it for a human if its effects cannot be undone",
      "Inspect the returned content before it is read back into the model's context",
      "Record the decision, the rules that fired and the timing, without copying the payload",
    ],
    tools: [
      "Python 3.11 to 3.13",
      "Model Context Protocol SDK 2.x (dependency, MIT, Anthropic PBC)",
      "asyncio over stdio transport",
      "pytest",
      "ruff",
      "mypy",
      "GitHub Actions",
    ],
    evidence: [
      {
        label: "Attacks caught",
        value: "96.2%",
        note: "25 of 26 adversarial cases handled at or above the response each case requires. Deterministic: no model call, no network.",
      },
      {
        label: "Legitimate traffic refused",
        value: "9.5%",
        note: "2 of 21 benign near-misses blocked. The keyword filter it is compared against refuses 33.3%.",
      },
      {
        label: "Controls with no false positives",
        value: "8 of 9",
        note: "Every benign case touched is touched by the one control permitted to be uncertain. A test enforces this.",
      },
      {
        label: "Median decision",
        value: "191 µs",
        note: "A property of the machine it ran on rather than of the system: eight runs on one machine ranged from 191 to 710 µs. Read the order of magnitude, which is well under a millisecond of policy per call, against a call that touches a disk or a network.",
      },
    ],
    quality: [
      "234 tests: unit, engine properties, corpus hygiene, and integration over a real MCP subprocess",
      "CI runs lint, format, mypy, the tests, the benchmark and the end-to-end demo on 3.11, 3.12 and 3.13",
      "The benchmark reproduces exactly from a clean clone, with no API key, network or GPU",
      "Headline numbers are pinned by tests, and the three known failures are named exactly so a new one fails the build",
    ],
    limitations: [
      "Paraphrase defeats pattern matching, so 96.2% is an upper bound against the attack forms represented",
      "Base64 is decoded only when it returns prose, so attachments and keys are never re-scanned; nested or multi-layer encodings are still invisible",
      "One event at a time: an instruction assembled across several tool results is invisible",
      "English only; images, PDFs and binary content are not inspected",
      "The corpus is mine, which is not the same as an independent evaluation",
    ],
    learned:
      "The benign half is the hard half. Writing attacks took an afternoon; the near-misses forced every interesting decision, matching on imperative shape rather than vocabulary, four actions instead of allow and deny, demoting a finding when the text is quoting rather than demanding.",
    nextStep:
      "A paraphrase axis, to put a number on how much the headline over-states things, and attacks that deliberately exploit the reporting-context demotion.",
    repository: "https://github.com/mzquadri/mcp-policy-gateway",
    artifacts: [
      {
        label: "Benchmark results",
        href: gatewaySource.file("assets/results.json"),
        note: "Every case, every configuration, generated by evaluation/make_evidence.py.",
      },
      {
        label: "Per-control effectiveness",
        href: gatewaySource.file("assets/control-table.json"),
        note: "What each control caught, and how much benign traffic it touched.",
      },
      {
        label: "Demo trace",
        href: gatewaySource.file("assets/demo-trace.jsonl"),
        note: "A real run against the hostile example server, over stdio.",
      },
      {
        label: "Upstream attribution",
        href: gatewaySource.file("NOTICE"),
        note: "The MCP SDK dependency and the prior art the threat taxonomy came from.",
      },
    ],
  },
  {
    slug: "legal-knowledge-platform",
    title: "Legal Knowledge Base",
    eyebrow: "Verification for a multilingual legal corpus",
    classification: "Employer engineering",
    evidenceMode: "employer-confidential",
    publication: {
      status: "draft",
      reason:
        "Employer work. No publication approval has been requested or granted, so this case study is authored and reviewable but withheld from a production build.",
    },
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Engineer on the verification, ingestion and reporting services",
    institution: "BP-IT Consulting & Solutions GmbH",
    summary:
      "Loading a legal document into a database is the straightforward part. Establishing that its structured, vector and graph representations still correspond to the published source, after the source is amended and after the code that reads it is corrected, is the part that needs evidence.",
    metaDescription:
      "Establishing that a legal document's structured, vector and graph representations still correspond to the published source, after it is amended.",
    problem:
      "A corpus rarely fails loudly. It is loaded once, and then the publisher amends the text, an extractor is corrected, a load is replayed, and the stored units, the search vectors and the reference edges drift apart from one another and from the published document. The reassurance normally offered for this is a count: twelve stored units, twelve indexed vectors, therefore correct. It is not. Equal totals agree about quantity and say nothing about content, because one unit removed and another added leaves the total unchanged. Knowing that a corpus still says what its source says needs comparisons on identity and content rather than on size.",
    contribution:
      "The platform, its event-driven delivery and its store topology existed before this work. What I own is the layer that decides whether what is served can be trusted: verification gates that measure an already-stored document against the evidence it was built from, and the service boundary that keeps the thing being measured apart from the thing doing the measuring. I also made re-ingestion converge on the new source instead of accumulating around it, and made the projection path refuse a document rather than store a representation it could not describe afterwards. Ownership boundaries between the stores were implied by the existing design; I documented and enforced them for the stores I worked in. The embedding model and the message-delivery pattern predate my work, and I claim neither.",
    systemSummary:
      "Described in generic roles rather than internal service names. A published document is captured as immutable source evidence, structured into a relational representation, projected into a vector store and a knowledge graph, and then measured against that evidence by a service whose only write is its own verdict.",
    workflow: [
      "Capture the published document and retain its exact bytes as immutable source evidence",
      "Structure it into ordered units and store one version atomically, or store nothing",
      "Project the stored version into a vector representation and a reference graph",
      "Measure the stored result against the captured evidence, recording what was compared",
      "Report integrity, source currentness and cross-store agreement as separate signals",
    ],
    tools: [
      "Python",
      "PostgreSQL",
      "Qdrant",
      "Neo4j",
      "Apache Kafka",
      "S3-compatible object storage",
      "BGE-M3 embeddings",
      "Docker",
    ],
    evidence: [
      {
        label: "Independent representations",
        value: "Three",
        note: "Relational, vector and graph. Their agreement is measured rather than assumed from the fact that one load wrote all three.",
      },
      {
        label: "Writers per owned store",
        value: "One",
        note: "Each derived store has a single writing service, which makes a divergence attributable. That does not by itself show the stores agree.",
      },
      {
        label: "Measurement and mutation",
        value: "Separated",
        note: "The service that measures a document cannot repair it, and writes only its verdicts. This removes self-marking; it does not make a measurement correct.",
      },
      {
        label: "Verdict binding",
        value: "Bound to a stored version",
        note: "A verdict names the exact version it measured, so a later version cannot inherit it. It says nothing about versions it never saw.",
      },
      {
        label: "Current state and retained evidence",
        value: "Reconciled separately",
        note: "Current representations converge on the new source while captured evidence is retained rather than overwritten. Retention does not show that the capture was right.",
      },
      {
        label: "Evidence classes",
        value: "Quantity through currentness",
        note: "Count, identity, content fidelity, reference fidelity, structure, provenance and currentness are recorded as separate results. A pass in one is not evidence for another.",
      },
    ],
    quality: [
      "A recorded verdict has to carry the value it measured. A check that reports an outcome without reaching the data is rejected by the storage layer rather than caught in review.",
      "Absent and wrong are different results. A check that cannot run records why, and never records a pass.",
      "Comparisons are made on ordered identities and content hashes rather than on totals.",
      "A transient fault leaves earlier verdicts standing rather than downgrading a document that nobody re-measured.",
      "Elapsed time annotates a measurement as old. It does not rewrite what was recorded.",
      "The projection path refuses a document outright rather than storing a representation it would not be able to describe afterwards.",
      "Automated regression tests cover the ingestion, projection and verification services, and run in continuous integration.",
    ],
    limitations: [
      "Fidelity is not authority. The checks can establish that stored text reconstructs the captured source exactly; they cannot establish that this was the right document to capture.",
      "Currentness is an observation with an age. A pass means the source was unchanged when it was last examined, not that it is unchanged now.",
      "A provenance check establishes that a processing profile was declared, not that declaring it was the correct one.",
      "Not every check applies to every source format. Where the evidence a check needs does not exist, it records that it could not run, which is weaker than a pass and must not be read as one.",
      "Some checks compare the stored representation rather than the exact text served downstream. Those are different questions and are kept as separate results.",
      "Verification bounds the checks that were written. It cannot establish the absence of a defect nobody thought to measure.",
      "None of this is legal certification. It is a claim about extraction and preservation, not about legal authority.",
    ],
    learned:
      "The verification layer invalidated an interpretation I had written earlier. The measurement stayed valid as the historical measurement it was; the claim built on top of it no longer described the current system, so I withdrew it and re-measured. A verification instrument has to be allowed to prove its author wrong.",
  },
] as const;

/**
 * Every case study that exists in this repository, published or not.
 *
 * Validation runs over this list, so a draft is held to the same content and privacy rules as
 * anything already live. Only {@link projects} decides what the site renders.
 */
export const allProjects: readonly Project[] = authoredProjects;

/**
 * Whether an unapproved confidential draft is allowed to render.
 *
 * A draft is meant to be authored, reviewed and looked at - locally and on a preview
 * deployment - without becoming public. Vercel sets `VERCEL_ENV` on every build it runs, so
 * production is the one environment named explicitly here and the one where a draft is
 * withheld. Anything that is not a production build shows drafts, which keeps review cheap; the
 * only environment that can publish is the only environment that is excluded.
 *
 * `HIDE_DRAFTS=1` is a second, narrower switch, and it only ever hides more.
 *
 * The reason it exists: this account is on a hobby plan, where preview URLs are public to
 * anyone holding the link. "Preview" therefore does not mean "private", and a preview built to
 * be shared - with a reviewer, or for a look at what production will serve - would otherwise
 * carry the confidential draft to whoever has the URL. Setting it at deploy time
 * (`vercel deploy --build-env HIDE_DRAFTS=1`) gives a preview that matches production without
 * promoting anything.
 *
 * It cannot be used the other way around. There is no value of this variable that makes a draft
 * visible in a production build, because the VERCEL_ENV test runs first and independently.
 */
export const draftsAreVisible =
  process.env.VERCEL_ENV !== "production" && process.env.HIDE_DRAFTS !== "1";

/**
 * Whether a project may appear on the site in this environment.
 *
 * Projects backed by a public repository are always publishable, which is why nothing about the
 * existing six changes. A confidential project is publishable once a real approval is recorded
 * against it, and before then only outside a production build.
 */
export function isPublishable(project: Project, draftsVisible: boolean = draftsAreVisible): boolean {
  if (!isEmployerConfidential(project)) return true;
  if (project.publication.status === "approved") return true;
  return draftsVisible;
}

/**
 * The case studies this environment renders: routes, indexes, sitemap and metadata.
 *
 * The predicate is wrapped rather than passed directly, because `Array.filter` supplies the
 * index as a second argument and would otherwise satisfy the draft-visibility parameter with it.
 */
export const projects: readonly Project[] = allProjects.filter((project) => isPublishable(project));

export const capabilities = [
  {
    title: "Machine Learning & Research",
    /*
     * "evidence-led evaluation" became "evaluation". These five lines name what
     * the work is; "evidence-led" named how good it is, which is a claim the
     * case studies either support or do not and is not the job of a label.
     */
    summary: "Graph models, uncertainty quantification, calibration, experiments, and evaluation",
    proof: ["transport-uq", "hydrology-uq"],
  },
  {
    title: "Generative AI & Retrieval",
    summary: "Grounded retrieval, vector search, citation-aware responses, and local model integration",
    proof: ["insureassist-rag"],
  },
  {
    title: "Backend & Data Systems",
    summary: "Typed APIs, data validation, reusable transformations, service boundaries, and traceable artifacts",
    proof: ["mlops-reference-pipeline", "insureassist-rag"],
  },
  {
    title: "MLOps & Engineering",
    summary: "Experiment tracking, promotion gates, model registries, containers, CI, and testable workflows",
    proof: ["mlops-reference-pipeline", "insureassist-rag"],
  },
  {
    title: "Data Science & Analytics",
    summary: "Scientific computing, sensitivity analysis, time series, diagnostics, and reproducible reporting",
    proof: ["hydrology-uq", "streamflow-forecasting"],
  },
] as const;

export const navigation = [
  { href: "/work", label: "Work" },
  { href: "/research", label: "Research" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export const researchProjectSlugs = ["transport-uq", "hydrology-uq", "streamflow-forecasting"] as const;

export function getResearchProjects() {
  return researchProjectSlugs.map((slug) => getProject(slug)!);
}


export function getFeaturedProjects() {
  const featuredSlugs: readonly string[] = truthRegistry.portfolio.featuredProjectSlugs.value;
  return featuredSlugs.map((slug) => projects.find((project) => project.slug === slug)!);
}
