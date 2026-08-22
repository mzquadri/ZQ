import { site, thesis, truthRegistry } from "./truth";
import { canonicalThesisEvidence, researchEvidence, thesisResearchPath } from "./research";

export { site, thesis } from "./truth";

export const projectClassifications = [
  "Academic research",
  "Group coursework",
  "Engineering prototype",
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

export interface Project {
  slug: string;
  title: string;
  eyebrow: string;
  classification: ProjectClassification;
  year: string;
  authors: readonly ProjectAuthor[];
  projectRole: string;
  institution?: string;
  summary: string;
  problem: string;
  contribution: string;
  workflow: readonly string[];
  tools: readonly string[];
  evidence: readonly EvidenceMetric[];
  quality: readonly string[];
  limitations: readonly string[];
  learned: string;
  repository: string;
  systemSummary?: string;
  artifacts?: readonly ArtifactLink[];
  nextStep?: string;
  researchPath?: string;
}

const halfRetention = researchEvidence.selectiveRisk.points.find((point) => point.retentionPct === 50)!;
const [coverage90, coverage95] = researchEvidence.marginalCoverage;

const mlopsRepository = "https://github.com/mzquadri/MLOps-End-to-End-Pipeline";
const mlopsCommit = "226ef7f1ec3d02d19f51327689e4c736854473cc";

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
const insureAssistCommit = "0f7cb63095f35bb02be40058ac4550225c7283a2";

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
export const insureAssistBenchmark = {
  corpus: {
    documents: 3,
    chunks: 314,
    words: 35_639,
    source: "NFIP Standard Flood Insurance Policy forms, 44 CFR Part 61",
    licence: "17 U.S.C. 105 - US Government work, no copyright",
  },
  questions: { total: 40, answerable: 32, unanswerable: 8, dev: 18, test: 22 },
  architecture: "Hybrid: BGE dense + Okapi BM25, reciprocal rank fusion",
  /** Held-out test split, 18 answerable questions. */
  selected: { hitRate5: 0.556, mrr: 0.42, topDocumentAccuracy: 0.556 },
  baselines: {
    dense: { hitRate5: 0.5, mrr: 0.365, topDocumentAccuracy: 0.556 },
    bm25: { hitRate5: 0.611, mrr: 0.366, topDocumentAccuracy: 0.333 },
    /** The pre-selection starting point, at the original 600/100 chunking. */
    startingPoint: { hitRate5: 0.611, mrr: 0.366, topDocumentAccuracy: 0.167 },
  },
  citations: { precision: 0.111, recall: 0.463, unsupportedRate: 0 },
  abstention: { answerableAcceptance: 1, unanswerableRejection: 0 },
  tests: 224,
} as const;

/**
 * The audited reference run published at {@link canonicalMlopsEvidence.commit}.
 *
 * Single source for every MLOps number on this site. Components read from here rather
 * than restating figures, so a metric cannot drift between the case study, the resume
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
  tests: { total: 99, layers: ["unit", "integration", "container"] },
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

export const projects: readonly Project[] = [
  {
    slug: "transport-uq",
    title: "Reliable GNN Surrogates for Transport Policy Analysis",
    eyebrow: "Master's thesis / Reliable ML",
    classification: "Academic research",
    year: "2026",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Researcher and thesis author",
    institution: thesis.institution,
    summary:
      "An evidence-led study of when a graph neural network surrogate is accurate, when it is uncertain, and how that uncertainty can support review decisions.",
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
        value: `R² ${researchEvidence.results.deterministic.r2.toFixed(3)}`,
        note: `Deterministic Trial 8; MAE ${researchEvidence.results.deterministic.mae.toFixed(2)} veh/h and RMSE ${researchEvidence.results.deterministic.rmse.toFixed(2)} veh/h.`,
      },
      {
        label: "Uncertainty ranking",
        value: `ρ ${researchEvidence.results.mcDropout.spearman.toFixed(3)}`,
        note: "Pooled Spearman correlation between MC Dropout uncertainty and absolute error.",
      },
      {
        label: "Selective review",
        value: `${halfRetention.reductionPct.toFixed(1)}% lower MAE`,
        note: `Accepted-set MAE at ${halfRetention.retentionPct}% retention versus accepting every prediction.`,
      },
      {
        label: "Deep ensemble",
        value: `R² ${researchEvidence.results.deepEnsemble.r2.toFixed(3)}`,
        note: `${researchEvidence.results.deepEnsemble.members}-member ensemble; MAE ${researchEvidence.results.deepEnsemble.mae.toFixed(2)} veh/h and uncertainty-error ρ ${researchEvidence.results.deepEnsemble.spearman.toFixed(3)}.`,
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
    year: "2026",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Project author and engineer",
    summary:
      "A retrieval-augmented question-answering service over real federal flood-insurance policy text, built so its retrieval quality can be measured rather than demonstrated.",
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
      "Kubernetes manifests are authored and CI-validated but have never been applied to a cluster",
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
    year: "2026",
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
        note: `Weighted F1 ${mlopsReferenceRun.test.f1Weighted.toFixed(4)} on ${mlopsReferenceRun.split.test} test rows, against a majority-class baseline of ${mlopsReferenceRun.test.baselineAccuracy.toFixed(4)} — a margin of ${mlopsBaselineMargin.toFixed(4)}.`,
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
      "No delayed-label path exists, so nothing measures accuracy after deployment — only behaviour",
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
    slug: "hydrology-uq",
    title: "Uncertainty Quantification in Hydrology",
    eyebrow: "TUM project seminar",
    classification: "Group coursework",
    year: "2024",
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
    tools: ["Python", "NumPy", "SciPy", "SALib", "pandas", "Matplotlib", "LaTeX"],
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
    year: "2026",
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
        value: "33.5–82.0%",
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
      "Reproducibility means keeping the unglamorous context—the subset, epochs, configuration, and weak classes—next to the score.",
    repository: "https://github.com/mzquadri/CNN-Image-Classification-PyTorch",
  },
  {
    slug: "streamflow-forecasting",
    title: "Synthetic Streamflow Forecasting Benchmark",
    eyebrow: "Scientific computing demonstration",
    classification: "Synthetic demonstration",
    year: "2026",
    authors: [{ name: site.name, url: site.github }],
    projectRole: "Project author",
    summary:
      "A deterministic benchmark comparing seasonal-naive, SARIMAX, and gradient-boosted one-step streamflow predictions.",
    problem:
      "Forecasting methods should be compared against simple baselines with temporal holdouts and hydrology-relevant metrics.",
    contribution:
      "Created a fixed-seed synthetic daily series, chronological split, lag and rolling features, model comparison, diagnostics, and an explicit distinction between one-step and recursive forecasting.",
    workflow: ["Synthetic 15-year series", "Chronological holdout", "Three model families", "Hydrology metrics", "Error analysis"],
    tools: ["XGBoost", "statsmodels", "scikit-learn", "pandas", "NumPy", "Matplotlib"],
    evidence: [
      {
        label: "One-step benchmark",
        value: "R² 0.979",
        note: "XGBoost on synthetic data with observed lag inputs; not a recursive multi-day forecast.",
      },
      {
        label: "Classical comparator",
        value: "R² 0.721",
        note: "SARIMAX result on monthly means within the same synthetic benchmark.",
      },
    ],
    quality: [
      "Fixed-seed data generator and chronological test split",
      "Seasonal-naive baseline retained alongside stronger models",
      "Tracked metrics and nine diagnostic figures",
      "Repository checker validates source and artifacts",
    ],
    limitations: [
      "Synthetic data cannot establish real-catchment performance",
      "XGBoost evaluation is one-step-ahead with observed historical discharge lags",
      "The benchmark does not test recursive multi-day behavior or distribution shift",
    ],
    learned:
      "Strong synthetic scores are useful for testing an evaluation pipeline, but they are not evidence of field validity.",
    repository: "https://github.com/mzquadri/Time-Series-Streamflow-Forecasting",
  },
] as const;

export const capabilities = [
  {
    title: "Machine Learning & Research",
    summary: "Graph models, uncertainty quantification, calibration, experiments, and evidence-led evaluation",
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

export const resumeProjectSlugs = ["transport-uq", "mlops-reference-pipeline", "insureassist-rag"] as const;

export function getFeaturedProjects() {
  const featuredSlugs: readonly string[] = truthRegistry.portfolio.featuredProjectSlugs.value;
  return featuredSlugs.map((slug) => projects.find((project) => project.slug === slug)!);
}
