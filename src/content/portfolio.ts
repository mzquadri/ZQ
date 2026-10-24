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
  bias as floodBias,
  events as floodEvents,
  gapOverCalendar as floodGap,
  generator as floodGenerator,
  generatorDefect as floodDefect,
  model as floodModel,
  repository as floodRepository,
  scores as floodScores,
  split as floodSplit,
} from "./flood-chapter";
import {
  adapterCount as careerAdapterCount,
  employerCount as careerEmployerCount,
  languagePenalties as careerLanguagePenalties,
  locationPenalties as careerLocationPenalties,
  overridden as careerOverridden,
  probe as careerProbe,
  rejections as careerRejections,
  repository as careerRepository,
  text as careerText,
  weights as careerWeights,
} from "./career-chapter";
import {
  repository as nlpRepository,
  splits as nlpSplits,
  task as nlpTask,
  templateCount as nlpTemplateCount,
  templatesPerClass as nlpTemplatesPerClass,
  text as nlpText,
  tracks as nlpTracks,
} from "./nlp-chapter";
import {
  baseline as statBaseline,
  bayesRun as statBayesRun,
  correctOf as statCorrectOf,
  course as statCourse,
  defaultRun as statDefaultRun,
  gradientChecks as statGradientChecks,
  ledger as statLedger,
  randomRun as statRandomRun,
  repository as statRepository,
  searchMarginPoints as statMarginPoints,
  testPoints as statTestPoints,
  text as statText,
  topics as statTopics,
} from "./statlearn-chapter";
import {
  components as supplyComponents,
  distinctSignals as supplyDistinct,
  duplicated as supplyDuplicated,
  formulas as supplyFormulas,
  modules as supplyModules,
  notPublished as supplyNotPublished,
  repository as supplyRepository,
  serviceLevelDefault as supplyServiceLevel,
  weightText as supplyWeightText,
} from "./supply-chain-chapter";
import {
  amplitudeOrderRecovered as weatherAmpOrder,
  cities as weatherCities,
  dataset as weatherDataset,
  humidityAllOneWay as weatherAllOneWay,
  outputs as weatherOutputs,
  repository as weatherRepository,
  text as weatherText,
} from "./weather-chapter";
import {
  closestGap as waterClosestGap,
  commonBandText as waterBandText,
  commonBand as waterBand,
  dataset as waterDataset,
  pipeline as waterPipeline,
  repository as waterRepository,
  results as waterResults,
  separated as waterSeparated,
  separatedGap as waterSeparatedGap,
  widestSd as waterWidestSd,
  withInterval as waterWithInterval,
  withoutInterval as waterWithoutInterval,
} from "./water-chapter";
import {
  breakEvenText as claimsBreakEvenText,
  calibration as claimsCalibration,
  costs as claimsCosts,
  models as claimsModels,
  repository as claimsRepository,
  selectionMethods as claimsSelection,
  stages as claimsStages,
} from "./claims-chapter";
import {
  benchmarkNeeds as battBenchmarkNeeds,
  capacity as battCapacity,
  companions as battCompanions,
  featureFamilies as battFeatureFamilies,
  generator as battGenerator,
  metrics as battMetrics,
  misread as battMisread,
  misreadText as battMisreadText,
  models as battModels,
  repository as battRepository,
  rows as battRows,
  split as battSplit,
} from "./battery-chapter";
import {
  activations as identActivations,
  diagnostics as identDiagnostics,
  references as identReferences,
  repository as identRepository,
  seminar as identSeminar,
  symmetries as identSymmetries,
} from "./identifiability-chapter";
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
    slug: "jobhunter",
    title: "Where the Weighted Average Ran Out of Room",
    eyebrow: "Job search and ranking",
    classification: "Engineering prototype",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Author",
    summary:
      "A job search tool built on the premise that an advert is a wish list rather than a minimum, so it ranks almost everything instead of filtering it. The interesting part is the two requirements that broke that premise, and what had to be added to the scoring model to say so.",
    metaDescription:
      "A job search and ranking tool that penalises rather than filters, reads applicant-tracking systems directly, and needed flat penalties where its weighted average could not express a disqualifying requirement.",
    problem:
      "A search for machine learning roles in one country returns thousands of results, almost all of them senior, expired, part-time or somewhere you cannot legally work. Reading them is the actual work. The obvious fix - filter hard - throws away the roles a recent graduate should be applying to, because an advert lists what an employer would like rather than what it requires.",
    contribution:
      `Built the whole application: one adapter per applicant-tracking system rather than one scraper per company, a scoring model that penalises instead of filtering, and the interfaces around them. Then fixed the model where it could not say what needed saying - two requirements now carry a flat penalty because a weighted term could not carry it.`,
    workflow: [
      `Read employer systems through ${careerAdapterCount} adapters, one per applicant-tracking system`,
      "Discard a posting only where the opportunity does not exist or is not this profession",
      "Score the rest as a weighted sum over seven components",
      "Apply flat penalties where a weighted term cannot express unavailability",
      "Name every deduction on the job rather than removing the job",
    ],
    tools: ["Python", "FastAPI", "TypeScript", "React", "PostgreSQL", "YAML"],
    evidence: [
      {
        label: "Penalties larger than their own weight",
        value: `${careerOverridden.length} of ${careerWeights.length} components`,
        note: `${careerOverridden.map((w) => `${w.label} is worth ${w.weight} points of the score and is docked up to ${w.penalty} when the job is ${w.penaltyFor}`).join("; ")}. A weighted term can only move the total by its own weight, so neither could express "you cannot take this job" - a mandatory ${careerLanguagePenalties[2].label} role and a role on another continent both scored in the high seventies on technical merit before the flat penalties were added. The full ladders are ${careerLanguagePenalties.map((l) => `${l.label} ${l.points}`).join(", ")} and ${careerLocationPenalties.map((l) => `${l.label} ${l.points}`).join(", ")}.`,
      },
      {
        label: "Conditions that discard a posting",
        value: `${careerRejections.length}`,
        note: `${careerRejections.map((r) => r.label).join(", ")}. Each answers whether the opportunity is available or in this profession, never whether the candidate is good enough. Everything else is a penalty, which is visible on the job and can be argued with, where a filter is silent.`,
      },
      {
        label: "Employers wired to a real endpoint",
        value: `${careerEmployerCount} across ${careerAdapterCount} adapters`,
        note: `Large employers rent one of a handful of applicant-tracking systems, each with a public endpoint, so there is one adapter per system rather than one scraper per company and adding an employer is a line of configuration. The repository reports probing ${careerProbe.candidates} plausible-looking candidates before writing the shipped list, of which ${careerProbe.missing} - ${careerText.probeShare} - did not exist; the tool that checked them ships with it.`,
      },
    ],
    quality: [
      "Rejection is reserved for four conditions about the opportunity, so a poor match is ranked down and explained rather than disappearing",
      "Every deduction is named on the job, which is what makes the ranking arguable instead of merely obeyed",
      "Employers were probed against their real endpoints before being configured, and the verification tool is in the repository so the next expansion can be checked the same way",
      "Candidate match and field relevance stay separate measures rather than being folded into one number",
      "It never applies on anyone's behalf, and the coverage document states which employers are monitored automatically and which remain manual",
    ],
    limitations: [
      "The weights are one person's judgement about their own search. Nothing here is calibrated against outcomes, because the outcome data is a handful of applications and cannot support calibration",
      "Manual watchlist employers are not automatically monitored, so coverage is uneven in a way the dashboard has to state rather than hide",
      "Field relevance is graded from the title and description together, which recovers roles a title-only rule discarded and still makes mistakes in both directions",
      "A personal product with one user. It has not been tested against anybody else's search, and the 60% premise it is built on is an argument rather than a measurement",
    ],
    learned:
      "A weighted average is a statement that every consideration is tradeable against every other, and some are not. Both failures looked like scoring bugs and were actually a modelling error: no setting of a thirteen-point language weight makes a native-German requirement disqualifying, because thirteen points is the most it can ever remove. The fix was to stop pretending that constraint was a preference.",
    repository: careerRepository,
    systemSummary: `Adapters for ${careerAdapterCount} applicant-tracking systems reaching ${careerEmployerCount} configured employers, a matching engine with seven weighted components and explicit penalties, and a full application over the top: setup, review queues, an application pipeline, employer management, automation and analytics.`,
    nextStep:
      "Calibrate the weights against something. They currently encode an argument about how graduates should apply, and the honest version of that argument needs outcomes behind it - which means recording what happened to the applications, not tuning the numbers until the ranking looks right.",
  },
  {
    slug: "nlp-transformers",
    title: "The Line That Refuses to Run",
    eyebrow: "News text classification",
    classification: "Engineering prototype",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Author",
    summary:
      "Classical machine learning against a fine-tuned transformer on the same news-headline task, evaluated the same way. The decision worth writing about is not in either model: it is what the loader does when the dataset will not download.",
    metaDescription:
      "TF-IDF baselines against fine-tuned DistilBERT on AG News, built so the pipeline stops rather than silently scoring its own synthetic fixture.",
    problem:
      "A pipeline that depends on a download will eventually fail to get it, and there is almost always a fixture nearby that would let it keep going. Taking that option produces a number - and a number produced from template text is indistinguishable, in a results table, from one that means something.",
    contribution:
      `Built both tracks and the shared evaluation, and made the loader refuse: when ${nlpTask.dataset} cannot be fetched it raises, and the synthetic fixture is reachable only by passing --synthetic. The fixture is for developing code offline, and the code says so rather than treating it as a fallback.`,
    workflow: [
      `Load ${nlpTask.dataset}, or stop`,
      ...nlpTracks.map((t) => `${t.label}: ${t.detail}`),
      ...nlpSplits,
      "Report classification metrics and confusion matrices, with latency optional",
    ],
    tools: ["Python", "Hugging Face Transformers", "Datasets", "scikit-learn", "PyTorch"],
    evidence: [
      {
        label: "Why the fallback is not automatic",
        value: `${nlpText.exclusiveShare} of its vocabulary`,
        note: `The synthetic fixture is ${nlpTemplateCount} hand-written sentences, ${nlpTemplatesPerClass} per class across ${nlpTask.classes.join(", ")}. Counting the words in them, ${nlpText.exclusiveShare} appear in exactly one class - so almost every word gives its label away and a bag of words would separate them perfectly. A score measured there would look like a result and be a description of the template list, which is the number an automatic fallback would have produced.`,
      },
      {
        label: "What is published",
        value: "no model result",
        note: "The repository versions source and notebooks but no downloaded data, no trained model, no checkpoints, no metrics, no plots and no run metadata. It states that it therefore makes no verified accuracy, F1, latency, parameter or model-comparison claim, and this page makes none.",
      },
      {
        label: "What is compared",
        value: `${nlpTracks.length} tracks, one evaluation`,
        note: `${nlpTracks.map((t) => `${t.label} (${t.detail})`).join("; ")}. Both are scored the same way on the same task, which is the only arrangement under which the comparison means anything.`,
      },
    ],
    quality: [
      "The loader raises on a failed download rather than substituting its own fixture, so the pipeline cannot quietly produce a number about nothing",
      "The synthetic path exists for offline development and is gated behind an explicit flag, with the README stating it must not be used to report capability",
      "Transformer tuning uses a stratified validation split, and the published test split is kept for the final evaluation only",
      "The README names what must be recorded before runs are compared - dataset revision, package versions, hardware, seed, training arguments, split policy - and notes that seeding does not make GPU operations deterministic",
    ],
    limitations: [
      "Nothing is measured here. No data, model, checkpoint or metric is versioned, so there is no accuracy to compare and no claim that either track wins",
      "The synthetic fixture is not a dataset. Its results are not comparable to AG News or to real news classification, and the page quotes it only to explain why it is not used by default",
      "Single-task, single-dataset. Whether a fine-tuned transformer earns its cost over TF-IDF is exactly the kind of question this repository is set up to ask and has not answered",
      "A learning and research project. It is not a deployed content-moderation, routing or editorial decision system, and the README says so first",
    ],
    learned:
      "The failure mode I was guarding against is not a wrong number, it is a plausible one. A fallback that keeps the pipeline green converts a missing dataset into a results table, and by the time anyone reads that table the distinction is gone. Counting the fixture's vocabulary afterwards was the part that convinced me: eighty-six percent of the words are giveaways, so the fallback would not have scored badly - it would have scored beautifully.",
    repository: nlpRepository,
    systemSummary: `A loader that can refuse, two training paths behind one interface, a shared evaluation, and inference helpers for locally saved artefacts. Models and results are untracked by design, which is why the repository can be read without any of it being mistaken for a measurement.`,
    nextStep:
      "Run it and publish the comparison properly - the dataset revision, the seed, the hardware and the metrics together, as one artefact. The interesting question is not which track wins but by how much, and whether that margin survives being repeated.",
  },
  {
    slug: "statistical-learning",
    title: "Sixty Test Points and What They Can Resolve",
    eyebrow: "Statistical learning coursework",
    classification: "Reproducible experiment",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Author",
    institution: statCourse.institution,
    summary:
      "Three problem sets from a TUM master's course, published with every figure written by the notebook that produced it and every number in the final report listed beside the cell it came from. The ledger is the point: it is what makes the two results worth reading impossible to quietly drop.",
    metaDescription:
      "TUM statistical learning coursework with a provenance ledger: hand-derived backpropagation checked twice, a default configuration below the majority baseline, and random search beating Bayesian optimisation by one test point.",
    problem:
      "A coursework report is the easiest document in the world to make look right. Figures get pasted, numbers get retyped, and the runs that embarrassed you simply do not appear - not dishonestly, just by omission, because nothing in the format requires them.",
    contribution:
      "Wrote the assignments so that the report could not drift from the notebook: every figure and table is written by the code, and the final assignment carries a ledger naming each quoted number and the cell that produced it. Backpropagation is derived by hand and checked against two independent references rather than trusted.",
    workflow: [
      "Derive the gradients by hand and implement them",
      "Check them against central differences, then against autograd",
      "Run the default configuration against a majority-class baseline",
      "Sweep the learning rate, then tune with two different searches",
      "Write every figure, table and quoted number from the notebook itself",
    ],
    tools: ["Python", "NumPy", "PyTorch", "scikit-learn", "Jupyter", "LaTeX"],
    evidence: [
      {
        label: "Random search over Bayesian optimisation",
        value: `${statMarginPoints} test point`,
        note: `Both searches were given the same budget. Bayesian optimisation finished on ${statCorrectOf(statBayesRun)} of ${statTestPoints} held-out points and random search on ${statCorrectOf(statRandomRun)} - a margin of exactly ${statMarginPoints} correctly classified point, or ${statText.onePoint} of the axis. Reporting that as a percentage would make it look like a finding; reporting it as one point out of ${statTestPoints} is what it is.`,
      },
      {
        label: "The default configuration against no model",
        value: `${statText.belowBaseline} below baseline`,
        note: `Out of the box the network scored ${statCorrectOf(statDefaultRun)} of ${statTestPoints}, while guessing the majority class scores ${statCorrectOf(statBaseline)}. What closed the gap was a learning rate ${statText.lrFactor} times larger, not a different architecture - and the only reason the failure is visible at all is that the baseline was recorded next to it.`,
      },
      {
        label: "Gradients, checked twice",
        value: statGradientChecks[0].value.toExponential(1),
        note: `${statGradientChecks.map((c) => `${c.value.toExponential(1)} ${c.kind} ${c.label}`).join(", and ")}. The finite-difference figure is bounded by its own step size rather than by the implementation, which is why the two differ by eight orders of magnitude; the autograd comparison is float64 round-off and nothing else.`,
      },
    ],
    quality: [
      `Every figure and table under the results folders is written by the notebook, so nothing in the reports is transcribed by hand`,
      `The final assignment ships a ledger of ${statLedger.values} reported values across ${statLedger.problems} problems, each naming the cell that produced it`,
      "The hand-derived gradients are checked against two independent references rather than one, so a shared mistake has two chances to be caught",
      "A majority-class baseline is reported beside the model's accuracy, which is what makes the first run legible as a failure rather than as a low number",
      "The matriculation number is removed from the public copy, and the course's own problem sheets are marked as the chair's material rather than presented as the author's",
    ],
    limitations: [
      `${statTestPoints} held-out points. One point is ${statText.onePoint} of the accuracy axis, so no difference smaller than that is a difference, and several of the comparisons here are exactly that size`,
      "Single runs rather than repeated ones. There are no seeds-repeated intervals anywhere in this, so the margins reported are observations and not estimates",
      "Coursework, answering a problem sheet. The questions were set rather than chosen, and the methods are a syllabus rather than a selection made for a problem",
      "The two hyperparameter searches ran once each on one small problem; nothing here generalises to how either behaves at scale",
    ],
    learned:
      "The ledger changed what I was willing to write. Once each number in the report had to name the cell it came from, the run where the network lost to guessing the majority class had nowhere to go, and it turned out to be the most informative line in the assignment. Reproducibility is usually sold as a courtesy to the reader; in practice it is a constraint on the author.",
    repository: statRepository,
    systemSummary: `${statLedger.assignments} assignments, each with its notebook, its report and the LaTeX source behind it: ${statTopics.join("; ")}. Figures and tables are generated rather than pasted, and the third assignment carries the provenance ledger this page is built on.`,
    nextStep:
      `Repeat the comparisons over seeds and report intervals instead of points. The ledger already makes every number findable, so the missing piece is not traceability but repetition - and with ${statTestPoints} test points, repetition is the only thing that could turn any of these margins into a result.`,
  },
  {
    slug: "supply-chain",
    title: "Two Weights, One Number",
    eyebrow: "Supply chain analytics",
    classification: "Engineering prototype",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Author",
    summary:
      "Order data cleaned into KPIs, demand forecasts measured against naive baselines, classical inventory arithmetic, and a weighted supplier scorecard - in one dashboard. Reading that scorecard's weights against the functions they weight is what this page is about.",
    metaDescription:
      "A supply chain analytics dashboard whose supplier scorecard gives 55% of its weight to one signal counted twice, found by reading the weights against the code.",
    problem:
      "A composite score is persuasive in a way its parts are not: five weighted components read as five independent opinions, and nobody checks whether they are. In a supply chain scorecard the temptation is worse, because the fields that sound most different - reliability and quality - are often the only fields the source data can actually support.",
    contribution:
      "Built the pipeline and the dashboard, then audited the scorecard against itself. Two of the five components turn out to be the same computed series under different names, which is a defect in my own design rather than a caveat about the data, and the page leads with it because that is what the finding is worth.",
    workflow: supplyModules,
    tools: ["Python", "pandas", "Plotly Dash", "NumPy", "SciPy", "statsmodels"],
    evidence: [
      {
        label: "Share of the score that is one signal",
        value: supplyWeightText.duplicated,
        note: `${supplyDuplicated.map((c) => `${c.label} normalises ${c.source}`).join("; ")}. The aggregation defines late_delivery_rate as one minus on_time_rate, and inverting a min-max normalisation of one minus a series returns the series exactly - so the two components are equal for every supplier. They carry ${supplyWeightText.duplicated} of the composite between them, which leaves ${supplyDistinct} distinct signals rather than ${supplyComponents.length}.`,
      },
      {
        label: "What is published",
        value: "no business metric",
        note: `The repository versions source and notebooks only: no ${supplyNotPublished.join(", no ")}. It therefore makes no claim about any fill rate, on-time-delivery rate, region or forecast accuracy, and this page makes none either.`,
      },
      {
        label: "What the inventory side computes",
        value: `${supplyFormulas.length} classical formulas`,
        note: `${supplyFormulas.map((f) => f.body).join("; ")}, at a default service level of ${Math.round(supplyServiceLevel * 100)}%. These are textbook identities rather than results: the repository calls their outputs illustrative and says the assumptions must be validated for a real operation.`,
      },
    ],
    quality: [
      "The supplier proxy is named as a proxy in the README rather than presented as supplier data: the source has no supplier identifiers, so departments and categories stand in for them",
      "The quality-like component is already flagged in the README as derived from late delivery and not usable as a quality assessment - this page carries that through to what it does to the weighting",
      "Forecasts are compared against naive baselines on a chronological holdout, so a seasonal series cannot look skilful by accident",
      "Prophet is optional: the comparison records a warning and continues rather than failing, so the pipeline runs with whatever is installed",
    ],
    limitations: [
      "The scorecard's weighting is wrong as it stands, and the fix is a design decision about what the remaining signals should be worth rather than a one-line change",
      "No dataset, no processed data, no forecast artefacts and no verified metrics are versioned, so nothing here is measured",
      "Suppliers are departments and categories standing in for suppliers. Any conclusion about a supplier is a conclusion about a grouping that is not one",
      "The inventory outputs assume stable demand, a known lead-time distribution and a normal service-level factor. Those assumptions belong to whoever uses them, and the repository says so",
    ],
    learned:
      "I built the scorecard and I did not notice. It took reading the weights beside the functions they weight, rather than reading either on its own, and the arithmetic was two lines long once I looked. A composite score hides its own structure by design - that is what composites are for - which is exactly why the weighting deserves the same scrutiny as the model.",
    repository: supplyRepository,
    systemSummary: `Five modules behind one Plotly Dash application: ${supplyModules.join(", ")}. The dataset is deliberately ignored by Git, which is why the repository can be read in full without any of it being mistaken for a result.`,
    nextStep:
      "Collapse the duplicate and decide the weighting again from four signals. The honest version probably has fewer components rather than a redistributed 55%, because the source data cannot support a quality term at all - and saying that is more useful than a scorecard that implies it can.",
  },
  {
    slug: "weather-eda",
    title: "Checking an Analysis Against Its Own Generator",
    eyebrow: "Weather exploratory analysis",
    classification: "Synthetic demonstration",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Author",
    summary:
      "Ten years of daily weather for six cities, all of it generated. Nothing it finds is evidence about weather - but the configuration and the summary statistics are both in the repository, so the analysis can be held against the thing that produced its data. Two of three comparisons come back clean, and the third does not.",
    metaDescription:
      "An exploratory analysis of generated weather data, checked against the generator's own configuration: temperature recovers exactly, humidity is systematically offset in every city.",
    problem:
      "An exploratory analysis of synthetic data is easy to present and hard to justify. Every chart looks like a finding and none of them is one, because the patterns were put there on purpose. The question worth answering is what such a project can be held to at all.",
    contribution:
      "Built the generator and the analysis, then used one against the other. Because the configured parameters are in source and the summary statistics are a tracked artefact, every recovered value has something to be wrong about - which turns a gallery of plots into a check that can fail.",
    workflow: [
      `Generate ${weatherDataset.records.toLocaleString("en-GB")} daily records for ${weatherDataset.cities} cities at seed ${weatherDataset.seed}`,
      "Reverse the seasons for the southern-hemisphere cities",
      "Summarise per city and track the result as an artefact",
      ...weatherOutputs,
      "Compare every recovered statistic with the value it was configured with",
    ],
    tools: ["Python", "pandas", "NumPy", "matplotlib", "seaborn"],
    evidence: [
      {
        label: "Temperature, set against recovered",
        value: `within ${weatherText.worstTemp} \u00b0C`,
        note: `Across all ${weatherCities.length} cities the mean daily temperature in the tracked summary lands within ${weatherText.worstTemp} degrees of the base temperature the generator was configured with, scattered either side of it. ${weatherAmpOrder ? "The recovered spread also ranks the cities in exactly the configured order of seasonal amplitude." : "The recovered spread does not rank the cities in the configured order of seasonal amplitude."} Both are statements about the generator, not about any city.`,
      },
      {
        label: "Humidity, set against recovered",
        value: `+${weatherText.humidityLow} to +${weatherText.humidityHigh} points`,
        note: `${weatherAllOneWay ? "Every one of the six cities" : "Some cities"} recovers a mean humidity above its configured base, by a similar amount each time. One sign and one size across six independent cities is a property of how the generator builds humidity rather than sampling noise, and it is the only thing in this project that nobody put there deliberately.`,
      },
      {
        label: "What the data is",
        value: "generated, not observed",
        note: `${weatherDataset.years} years of daily values from ${weatherDataset.from} to ${weatherDataset.to}, produced at a fixed seed. The repository states that the dataset, findings and figures are not weather-station observations, climate evidence, forecasts, or a basis for operational, scientific or policy decisions.`,
      },
    ],
    quality: [
      "The configured parameters live in source and the summary statistics are committed, so the comparison on this page is computed from both rather than asserted",
      "Southern-hemisphere cities have their seasons reversed in the generator, so a seasonal plot is not quietly wrong for two of the six",
      "The README puts the synthetic-data warning in its first lines, and repeats that city-level conclusions describe configured distributions rather than measured climates",
      "The figures are regenerated from the tracked artefact rather than pasted, so a changed run changes what is shown",
    ],
    limitations: [
      "There is no weather here. A generator that is recovered accurately has demonstrated that the analysis is correct, not that anything is true",
      "The humidity offset is a finding about the generator's own construction. It is interesting as a demonstration that the check works, and it is of no consequence to anyone",
      "Six cities at one seed. Nothing here is repeated across seeds, so the comparison is a single observation rather than a distribution",
      "The features are illustrative. They carry real units, which makes the plots readable and makes it correspondingly easy to misread them as measurements",
    ],
    learned:
      "A synthetic dataset is usually treated as a reason to lower the standard. It is the opposite: because the answer is in the repository, the analysis is one of the few that can actually be marked. Doing that turned up an offset in every city in the same direction, which no amount of looking at the twelve plots had shown me.",
    repository: weatherRepository,
    systemSummary: `Two modules: a seeded generator with per-city temperature, amplitude, precipitation and humidity parameters, and one exploratory pass that writes ${weatherDataset.figures} figures plus a per-city summary table. The summary is tracked, which is what makes the configuration-versus-recovery comparison possible from outside the repository.`,
    nextStep:
      "Make the comparison part of the repository rather than part of this page. The configured values and the recovered ones are both already in the tree, so asserting the distance between them is a test - and the humidity offset is exactly the kind of thing that test should have failed on first.",
  },
  {
    slug: "water-quality",
    title: "The Ranking the Run Does Not Support",
    eyebrow: "Water quality classification",
    classification: "Synthetic demonstration",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Author",
    summary:
      "A four-model comparison on a generated dataset, with the cross-validation statistics the headline table leaves out. Drawn as intervals rather than as places, three of the four models are not separated by the run at all - which is the most useful thing the project has to say.",
    metaDescription:
      "A synthetic water-quality classification run whose own cross-validation intervals overlap, so the leaderboard it reports does not separate three of its four models.",
    problem:
      "A model comparison that reports one score per model invites a reading it cannot support. Fold-to-fold variation is usually larger than the gaps being ranked, so the order is partly an artefact of which split was drawn - and the table that gets copied into a README is exactly the artefact that hides this.",
    contribution:
      "Built the pipeline and the comparison, then read the tracked artefact against its own headline table. The cross-validated F1 and its standard deviation are recorded per model in `results/model_results.json`; drawing them as intervals is what turns a ranking back into a measurement with a width.",
    workflow: [
      `Generate ${waterDataset.samples.toLocaleString("en-GB")} samples from the seeded generator`,
      ...waterPipeline,
      "Track the metrics as a committed artefact rather than a screenshot",
    ],
    tools: ["Python", "scikit-learn", "XGBoost", "pandas", "matplotlib"],
    evidence: [
      {
        label: "Models the run separates",
        value: `1 of ${waterWithInterval.length}`,
        note: `Taking the cross-validated F1 of each model plus or minus one standard deviation across ${waterDataset.folds} folds, the intervals for the top ${waterBand.models} all overlap: a single value between ${waterBandText.from} and ${waterBandText.to} is consistent with every one of them. Only ${waterSeparated.name} sits clear, and it sits clear by ${waterSeparatedGap.toFixed(3)}. The ordering of the other three is not something this run established.`,
      },
      {
        label: "Spread against the gap it is ranking",
        value: `${waterWidestSd.cvSd.toFixed(4)} vs ${waterClosestGap.toFixed(4)}`,
        note: `${waterWidestSd.name} moves ${waterWidestSd.cvSd.toFixed(4)} between folds, and the closest pair of contenders is ${waterClosestGap.toFixed(4)} apart. When the noise is more than twice the difference, the difference is not a finding - and no interval at all was recorded for ${waterWithoutInterval.map((r) => r.name).join(", ")}, which the headline table nonetheless lists among the leaders.`,
      },
      {
        label: "What the numbers are about",
        value: "generated data",
        note: `All ${waterResults.length} rows measure how well a model recovers the deliberately class-correlated distributions of a seeded generator, at seed ${waterDataset.seed}, with ${Math.round(waterDataset.missingShare * 100)}% of values missing in ${waterDataset.missingIn.join(", ")}. The repository states it does not predict whether real water is safe to drink and must not be used for water-quality or regulatory decisions.`,
      },
    ],
    quality: [
      "The metrics are a committed artefact from a seeded run, so the figures on this page are computed from it rather than transcribed, and a changed run changes the page",
      "Imputation and scaling sit inside the scikit-learn pipelines, so they are fit per fold rather than once over the whole training set",
      "Cross-validation is stratified, which matters when the generated classes are split sixty-forty",
      "The README says in its first lines that the labels are generated and that the repository must not be used for water-quality decisions, rather than leaving the caveat to the bottom of the page",
    ],
    limitations: [
      "The data is generated. A model that recovers a generator's own correlations has demonstrated that the pipeline runs, not that anything can be predicted about water",
      "One seeded split and five folds. The intervals here are the fold-to-fold standard deviation, which is the smallest honest account of the uncertainty rather than a confidence interval",
      `No cross-validation statistics were recorded for ${waterWithoutInterval.map((r) => r.name).join(", ")}, so it cannot be compared with the rest on the same footing`,
      "The nine features are described as illustrative and are explicitly not a standards-compliant representation of any authority's criteria",
    ],
    learned:
      "Writing the comparison table was quick; reading it honestly took longer. The artefact already contained the standard deviations that undercut its own ordering, which is the uncomfortable and useful part - the evidence against the headline was sitting in the same file as the headline, and nothing but drawing it made that visible.",
    repository: waterRepository,
    systemSummary: `Two modules: a seeded generator and one pipeline that runs preprocessing, the four classifiers, cross-validation, a 27-point grid search for XGBoost and the evaluation plots. Metrics land in a tracked JSON file, which is what lets this page quote them without re-running anything.`,
    nextStep:
      "Repeat the whole comparison over several seeds rather than one, and report each model as an interval from the start. The run already shows that fold-to-fold movement swamps the gaps being ranked, so the next honest version of this table has no places in it at all.",
  },
  {
    slug: "insurance-claims-threshold",
    title: "A Probability Is Not a Decision",
    eyebrow: "Insurance claims prediction",
    classification: "Engineering prototype",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Author",
    summary:
      "Predicting whether a policy will claim is only the first of three problems. The probability also has to mean what it says, and someone has to decide which probabilities are worth acting on. This pipeline keeps the three apart - classifiers, calibration, and a cost-sensitive cut - so that each can be argued about on its own terms.",
    metaDescription:
      "An insurance claims pipeline that separates ranking, calibration and the decision threshold, with no published model result and an explicitly illustrative cost matrix.",
    problem:
      "A classifier that ranks well can still be badly wrong about magnitude, and a probability that is right is still not an action. Most of the distance between a model and a decision lives in those two gaps, and collapsing them into one accuracy number hides both - along with the fact that in claims the two kinds of error cost wildly different amounts.",
    contribution:
      "Built the pipeline as three separable stages rather than one: a train/test split with encoders and scaling fit on training data only, classifiers compared under one interface, cross-validated calibration scored by Brier, and a threshold search that can optimise for statistical or cost-weighted criteria. The cost matrix is a parameter of that search, not a constant buried in it.",
    workflow: [
      "Split, then fit encoders and scaling on the training side only",
      "Compare the classifiers under one interface",
      `Calibrate with ${claimsCalibration.methods.join(" or ")}, cross-validated, scored by ${claimsCalibration.score}`,
      "Search the decision threshold against the chosen criterion",
      "Attribute the resulting model with SHAP",
    ],
    tools: ["Python", "scikit-learn", "XGBoost", "LightGBM", "SHAP", "pandas"],
    evidence: [
      {
        label: "Where the cost matrix puts the cut",
        value: `${claimsBreakEvenText.percent}%`,
        note: `The repository's example matrix values a claim caught early at +${claimsCosts.truePositive}, an unnecessary investigation at ${claimsCosts.falsePositive}, and a missed claim at ${claimsCosts.falseNegative}. Setting the value of acting equal to the value of not acting solves to ${claimsBreakEvenText.percent}% with no dataset involved - ${claimsBreakEvenText.ratio} times below the 0.5 a classifier defaults to. That is arithmetic from four published numbers, and the matrix they come from is illustrative rather than a validated policy.`,
      },
      {
        label: "What is published",
        value: "no model result",
        note: "The repository versions no data, no train/test split, no trained model, no calibration output and no evaluation report, and states that it therefore makes no verified accuracy, AUC, calibration-improvement or business-value claim. This page makes none either.",
      },
      {
        label: "What is separated",
        value: `${claimsStages.length} stages`,
        note: `${claimsStages.map((x) => `${x.label} - ${x.note}`).join("; ")}. The cut can be chosen ${claimsSelection.length} ways: ${claimsSelection.map((m) => m.label).join(", ")}.`,
      },
    ],
    quality: [
      "Encoders and scaling are fit on the training split only, so the test side is not quietly informed by the data it is meant to judge",
      "Calibration is cross-validated and scored by Brier rather than asserted, because a calibration step that is not measured is a hope",
      "The cost matrix is an argument to the threshold search rather than a constant inside it, which is what makes it reviewable",
      "The README states the matrix is illustrative and must not be used without domain, legal, fairness and risk review, rather than leaving a reader to assume it was validated",
    ],
    limitations: [
      "No data, no split, no trained model, no calibration output and no evaluation report are versioned. There is no performance claim here because there is nothing to substantiate one",
      "The cost matrix is an example. The threshold derived from it is correct arithmetic about those four numbers and says nothing about what a real insurer's numbers would be",
      "Calibration method and threshold should be chosen on a validation set kept separate from the final test set; the supplied scripts are exploratory and do not implement that governance",
      "It must not be used to make automated decisions about people or policies, which is the repository's own instruction and the reason this page stops at the arithmetic",
    ],
    learned:
      "The threshold is where the modelling stops and the policy starts, and it is the step most likely to be left at a default nobody chose. Working the cost matrix through to a break-even was the moment the project became about decisions rather than about classifiers: the honest answer was fifteen times away from the habit, and it came from four numbers rather than from any amount of model tuning.",
    repository: claimsRepository,
    systemSummary: `Five modules, one per stage: the data pipeline, the classifier comparison across ${claimsModels.join(", ")}, the calibration fit, the threshold search, and SHAP attribution. Generated artefacts stay out of version control, which is why the repository can be read without being mistaken for a result.`,
    nextStep:
      "Give the threshold a validation set of its own. Choosing the calibration method and the cut on the same data that reports the final number is the flaw the README already names, and fixing it is a split rather than a model - which makes it the cheapest honest improvement available.",
  },
  {
    slug: "battery-soc",
    title: "The Gauge Drifts Before the Battery Does",
    eyebrow: "Battery state of charge",
    classification: "Engineering prototype",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Author",
    summary:
      "A lithium-ion cell carries no fuel gauge, so its charge has to be inferred from voltage, current and temperature - signals that all drift as the cell ages. This prototype puts five regression models, cycle-aware features, clustering and a genetic-fuzzy estimator in one testable codebase so the ideas can be compared instead of trusted.",
    metaDescription:
      "A battery state-of-charge prototype: five regression models, cycle-aware features and a genetic-fuzzy estimator, with a temporal split and no published score.",
    problem:
      "Charge must be inferred from voltage, and the voltage a cell shows at a given charge falls as it ages. A gauge calibrated once against a fresh cell therefore grows wrong in a specific direction, and the usual way of measuring such a model - shuffle the rows, hold some out - hides the error completely, because two samples a second apart inside one discharge are very nearly the same row.",
    contribution:
      "Built the codebase that makes the comparison possible rather than a single model: NASA-compatible loading with a deterministic synthetic generator for development, four families of engineered feature, five regression models behind one metric function, and a split by cycle number so that the held-out cycles are genuinely unseen.",
    workflow: [
      "Load authorized source data, or generate the deterministic demonstration set",
      "Engineer cycle-aware features from voltage, current, temperature and time",
      `Hold back the last ${battSplit.testCycles} cycles by cycle number, without shuffling`,
      "Fit and score the regression models through one metric function",
      "Run the clustering, fuzzy and state-of-health analyses beside them",
    ],
    tools: ["Python", "scikit-learn", "XGBoost", "LightGBM", "PyTorch", "DEAP", "scikit-fuzzy", "pandas"],
    evidence: [
      {
        label: "Ageing, in the generator's own formula",
        value: `${battMisreadText.points} points of charge`,
        note: `The demonstration generator lowers open-circuit voltage by 0.0001 V per cycle, a term that does not depend on charge, so by cycle ${battGenerator.cycles} the whole curve sits ${battMisreadText.volts} V lower. Read that voltage against the fresh-cell curve and it comes back as ${battMisreadText.reads}% when the charge is really ${battMisread.atSoc}%. That is a property of the synthetic cell the repository ships, not a measurement of a real one.`,
      },
      {
        label: "What is published",
        value: "no battery result",
        note: "The repository ships no battery dataset, no trained weights and no tracked evaluation outputs, and it states that synthetic-data results demonstrate code execution only rather than estimation performance. It also lists what a benchmark would have to record first: " + battBenchmarkNeeds.join(", ") + ". This page claims nothing past that.",
      },
      {
        label: "What is compared",
        value: `${battModels.length} regression models`,
        note: `${battModels.join(", ")}, scored through one function reporting ${battMetrics.join(", ")}, over ${battFeatureFamilies.length} families of engineered feature. Beside them sit ${battCompanions.join("; ")}.`,
      },
    ],
    quality: [
      `The split is by cycle number and nothing is shuffled: training is cycles ${battSplit.trainFrom} to ${battSplit.trainTo} and the test set is ${battSplit.testFrom} to ${battSplit.testTo}, which are the most degraded cycles in the set rather than a random sample of all of them`,
      "Every model is scored by the same function, so the comparison between them is not a comparison of two different definitions of error",
      "The demonstration generator is seeded, so a pipeline change shows up as a changed number rather than as noise",
      "The README states what the repository does not have, and names the seven things a benchmark would need, instead of presenting a score table it cannot support",
    ],
    limitations: [
      "No dataset, no trained weights and no tracked evaluation outputs. There is no score here because there is nothing versioned to substantiate one",
      `The synthetic cell is one generated cell of ${battRows.toLocaleString("en-GB")} rows with linear capacity fade, which is far simpler than a real one: it says what the code does, not how well estimation works`,
      "The split holds back the last cycles of a single cell. A real benchmark would hold back whole cells, and verify that no cell or cycle leaks between the two sides",
      "A research prototype. It must not be used to operate a battery-management system or to make any safety decision, and the repository says so above everything else",
    ],
    learned:
      "The interesting failure was not a model's. It was that the quantity being predicted and the signal it is predicted from drift apart as the cell ages, so the test split is the part of the experiment that decides whether the number means anything. Shuffling the rows would have produced a much better score and a worthless one.",
    repository: battRepository,
    systemSummary: `Six modules behind one pipeline: loading and the seeded generator, feature engineering, the regression models and their metric function, clustering, the genetic-fuzzy estimator, and the degradation analyses. Capacity in the generated set falls from ${battCapacity.fresh.toFixed(1)} to ${battCapacity.aged.toFixed(1)} Ah across its ${battGenerator.cycles} cycles, which is the drift the models are asked to survive.`,
    nextStep: `Earn a number. The repository already lists what that takes - ${battBenchmarkNeeds.join(", ")} - and the honest next step is to obtain authorized cell data, split it by cell rather than by cycle, and record all seven so that the first score published is one that can be checked.`,
  },
  {
    slug: "nn-identifiability",
    title: "Same Answers, Different Weights",
    eyebrow: "Mathematics seminar",
    classification: "Academic research",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Seminar author",
    institution: "Technical University of Munich",
    summary:
      "A prototype for a question from a TUM mathematics seminar: if two networks agree on every input, must their parameters agree too, and what can a finite numerical check actually tell you about that.",
    metaDescription:
      "A seminar prototype on neural network identifiability: constructing a network related by a hidden-unit permutation and sign flip, and checking it against an unrelated one.",
    problem:
      "Two networks with identical weights always compute the same function. The reverse does not follow, and a fully connected network can hide equivalent behaviour inside different weights, which is what makes a weight worth interpreting an open question rather than an obvious one.",
    contribution:
      "Built the prototype that constructs a network related to another by relabelling its hidden units and flipping signs, verifies that the two agree numerically on sampled inputs and that their parameters align under that relabelling, and runs the same comparison against an unrelated network so that the check is one that can fail.",
    workflow: [
      "Build a small fully connected network",
      "Relabel its hidden units and flip signs",
      "Check the two agree on sampled inputs",
      "Check the parameters align under the relabelling",
      "Reject an unrelated network put through the same test",
    ],
    tools: ["PyTorch", "NumPy", "Jupyter", "unittest"],
    evidence: [
      {
        label: "What is published",
        value: "no numerical finding",
        note: "The repository's experiments and results directories intentionally hold no versioned configurations, no trained models and no findings, and it makes no claim of experimentally establishing identifiability for any trained model or activation family. That is its own scope statement, and this page claims nothing beyond it.",
      },
      {
        label: "What the code constructs",
        value: `${identSymmetries.length} transformations`,
        note: `${identSymmetries.map((x) => x.label).join(", then ")}. The constructed network is then checked for numerical output agreement and parameter alignment against the one it came from.`,
      },
      {
        label: "What the diagnostics look for",
        value: `${identDiagnostics.length} checks`,
        note: `${identDiagnostics.join(", ")}. They are finite and numerical, on sampled inputs, across ${identActivations.join(", ")}.`,
      },
    ],
    quality: [
      "The comparison is run against an unrelated network as well as a related one, so it is a check that can fail rather than one that always passes",
      "Output agreement and parameter alignment are checked separately, because the first without the second is the whole phenomenon being studied",
      "The scope statement is in the README rather than left implicit, and it is the first thing after the question",
      "The activation names in the code are described as the assumptions this prototype considers, with the formal conditions left to the cited papers",
    ],
    limitations: [
      "Finite numerical diagnostics on sampled inputs. They can find patterns such as exact clone pairs or inactive contributions; they do not prove global functional equivalence",
      "They do not satisfy every hypothesis of any published identifiability theorem, and the repository says so rather than implying otherwise",
      "Source code and exploratory notebooks, not a validated empirical benchmark. Nothing is versioned under experiments or results",
      "A seminar prototype. The mathematics it points at belongs to the cited papers rather than to this repository",
    ],
    learned:
      "A check that always passes is not a check. Constructing the equivalent network is the easy half; the half that makes it mean anything is running the identical comparison against a network that should be rejected, and watching it be rejected.",
    repository: identRepository,
    systemSummary: `A seminar prototype supervised at ${identSeminar.institution}. One module builds networks, one constructs the relabelled and sign-flipped relatives, one runs the diagnostics, and the notebooks are where they are explored rather than where results are kept.`,
    nextStep: `Hold a diagnostic to a theorem. The references the repository cites, ${identReferences.map((r) => `${r.author} ${r.year}`).join(", ")}, state conditions the prototype's checks do not test, and the useful next step is to make one check correspond to one hypothesis rather than to an intuition about it.`,
  },
  {
    slug: "flood-lstm",
    title: "What the Network Adds Over a Calendar",
    eyebrow: "Time series on a generated signal",
    classification: "Synthetic demonstration",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Project author",
    summary:
      "An LSTM reads thirty days of weather and predicts the next day's discharge on a catchment this repository generates, so that the composition of the signal is known exactly and the score can be read against what anything could achieve.",
    metaDescription:
      "On a generated catchment an LSTM reaches 0.921 and a lookup table of the calendar reaches 0.902, against a noise ceiling of 0.969. The gap is the result.",
    problem:
      "A forecasting score on its own says nothing, because it does not say what was available to be scored. On this signal the two seasonal terms carry 77 per cent of the target's variance and the rain-driven term carries 5.5, so a model can look strong by learning the calendar, and looking strong that way is not evidence of rainfall-runoff skill.",
    contribution:
      "Generated the catchment so the components could be measured rather than guessed, computed the ceiling that the generator's own independent noise imposes, and scored the network against three baselines on exactly the same held-out rows, including a lookup table that uses no weather input at all.",
    workflow: [
      "Generate twenty years from a fixed seed",
      "Measure what the signal is made of",
      "Split chronologically, fit scalers on train",
      "Score the network and three baselines once",
      "Read the gap against the noise ceiling",
    ],
    tools: ["PyTorch", "NumPy", "pandas", "Matplotlib", "pytest"],
    evidence: [
      {
        label: "What the network adds",
        value: `${floodGap} R2`,
        note: `The network reaches ${floodScores.lstm} and a lookup table of mean discharge per calendar day reaches ${floodScores.calendar}, on ${floodSplit.scoredRows.toLocaleString("en-US")} held-out days scored once. That gap is the entire value the network adds over 365 numbers.`,
      },
      {
        label: "What nothing can beat",
        value: `${floodScores.ceiling} R2`,
        note: "The generator adds independent noise every day that no method can predict, which caps the achievable score. Reporting a result without it would leave the reader unable to tell a good score from a nearly perfect one.",
      },
      {
        label: "What the signal is made of",
        value: `${Math.round(floodGenerator.seasonalShare * 100)}% seasonal`,
        note: `Against ${(floodGenerator.rainShare * 100).toFixed(1)} per cent for the rain-driven term and ${(floodGenerator.noiseShare * 100).toFixed(1)} per cent irreducible noise. This matters more than any score here, because it is what a strong-looking number on this data would mostly be made of.`,
      },
      {
        label: "Where the errors are",
        value: `${floodBias.aboveThreshold} m3/s`,
        note: `Mean error above the event threshold, against ${floodBias.belowThreshold} below it. The largest flows are systematically under-predicted, which is ordinary regression to the mean and matters here because the largest flows are the only ones anyone would care about. Recall ${floodEvents.lstm.recall} sits below precision ${floodEvents.lstm.precision} for the same reason.`,
      },
    ],
    quality: [
      "The ceiling is computed from the generator rather than assumed, so the score can be read against what was achievable",
      "Three baselines are scored on exactly the same held-out rows, including one that uses no weather input",
      "Splits are chronological and the scalers are fitted on training rows only; each split builds its windows from its own slice, so none spans a boundary",
      "The target day is never inside its own input window and discharge is not among the inputs, so the model never sees past discharge",
      "Persistence is reported but labelled as not a fair comparison, because it uses an input the model does not have",
    ],
    limitations: [
      "The catchment is generated, not observed. There is no gauge and no site, and nothing here is flood forecasting, a warning system, or validated environmental modelling",
      "Most of what the model scores is the seasonal cycle, which a table of 365 numbers also learns",
      "The largest flows are under-predicted, so the regime the work would exist for is the regime it is weakest in",
      "One generator, one seed, one architecture. Nothing here says the result would hold on a different synthetic catchment, let alone a real one",
    ],
    learned: `The generator had a defect worth more than the model did. Its soil-moisture bucket was mis-scaled and sat on its lower bound on ${Math.round(floodDefect.floorFractionBefore * 100)} per cent of days, so the term it was meant to drive barely moved and the rain-driven share of the target was ${(floodDefect.rainShareBefore * 100).toFixed(1)} per cent. Rebalanced, it sits at the floor on ${(floodDefect.floorFractionAfter * 100).toFixed(0)} per cent and the rain share is ${(floodDefect.rainShareAfter * 100).toFixed(1)}. Every result was taken after that, and finding it needed the components to be measurable at all.`,
    repository: floodRepository,
    systemSummary: `A ${floodModel.architecture} of ${floodModel.parameters.toLocaleString("en-US")} parameters reads a ${floodModel.window}-day window of three features. The generator, the baselines and the scoring are separate modules, so the thing being measured and the thing it is measured against cannot share an assumption by accident.`,
    nextStep:
      "A real catchment. Everything here is set up to be read honestly, and the one thing it cannot tell you is whether any of it survives contact with an observed gauge.",
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
