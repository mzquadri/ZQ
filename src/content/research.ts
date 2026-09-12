export const thesisResearchPath = "/research/thesis";

/**
 * The thesis evidence, pinned to the repository that holds it today.
 *
 * These links used to point at mzquadri/ml-surrogates-thesis. That repository and its
 * companion ml-surrogates-thesis-data were consolidated into the one below and then
 * deleted on 4 September 2026, which left every link here answering 404 while the
 * build still passed: validate-content.ts checked that the strings were present and
 * well formed, not that they resolved.
 *
 * The submitted PDF is the same file, byte for byte: git blob
 * 1e8c411feb32829d776db46fd36260bb00a842a5, 678,859 bytes. It now sits in the
 * as-submitted snapshot under thesis/submission_2026-05-15/, which the repository
 * keeps frozen and separate from the working LaTeX that was edited after submission.
 *
 * The retired repositories' history is preserved as bundles on the provenance-v1
 * release of the repository below.
 */
const thesisRepository =
  "https://github.com/mzquadri/ml_surrogates_for_agent_based_transport_models";
const thesisCommit = "b324767c4dcfe6f1179069b1b751e4b995506306";
const thesisFile = (path: string) =>
  `${thesisRepository}/blob/${thesisCommit}/${path}`;

export const canonicalThesisEvidence = {
  repository: thesisRepository,
  commit: thesisCommit,
  submittedArtifactCommit: thesisCommit,
  submittedPdf: thesisFile(
    "thesis/submission_2026-05-15/extracted/Zamin_thesis.pdf",
  ),
  corrigendum: thesisFile("docs/CORRIGENDUM.md"),
  provenance: thesisFile("docs/ARTIFACT_PROVENANCE.md"),
  aggregateReport: thesisFile(
    "analysis_outputs/THESIS_INTELLIGENCE_REPORT.md",
  ),
  aggregateJson: thesisFile("analysis_outputs/thesis_intelligence.json"),
  modelComparison: thesisFile("analysis_outputs/model_comparison.csv"),
  manifest: thesisFile("analysis_outputs/artifact_manifest.csv"),
} as const;

const auditedResults = {
  deterministic: {
    r2: 0.5957479477,
    mae: 3.9572889805,
    rmse: 7.118265152,
  },
  mcDropout: {
    passes: 30,
    r2: 0.5855342128,
    mae: 3.9483171915,
    rmse: 7.2076289711,
    spearman: 0.4818179375,
  },
  deepEnsemble: {
    members: 5,
    r2: 0.6840808123,
    mae: 3.485322063,
    rmse: 6.2926862833,
    spearman: 0.3997361623,
  },
} as const;

const selectiveRiskPoints = [
  { retentionPct: 10, accepted: 316_350, review: 2_847_150, mae: 1.0511744751, reductionPct: 73.3766456911 },
  { retentionPct: 25, accepted: 790_875, review: 2_372_625, mae: 1.7948621542, reductionPct: 54.5410850455 },
  { retentionPct: 50, accepted: 1_581_750, review: 1_581_750, mae: 2.321017345, reductionPct: 41.2150232011 },
  { retentionPct: 75, accepted: 2_372_625, review: 790_875, mae: 2.7952493971, reductionPct: 29.2040314501 },
  { retentionPct: 90, accepted: 2_847_150, review: 316_350, mae: 3.2264230602, reductionPct: 18.2835901043 },
  { retentionPct: 100, accepted: 3_163_500, review: 0, mae: 3.9483171915, reductionPct: 0 },
] as const;

const marginalCoverage = [
  { nominalPct: 90, observedPct: 90.02 },
  { nominalPct: 95, observedPct: 95.01 },
] as const;

export const researchThemes = [
  {
    level: "Primary research",
    title: "Reliable machine learning",
    description:
      "Uncertainty quantification for graph surrogates: ranking likely error, calibrating uncertainty, constructing conformal intervals, and routing uncertain predictions to review.",
    topics: [
      "Uncertainty Quantification",
      "Calibration",
      "Conformal Prediction",
      "Selective Prediction",
      "Graph Neural Networks",
    ],
    projectSlugs: ["transport-uq"],
  },
  {
    level: "Supporting work",
    title: "Scientific and data-driven modelling",
    description:
      "Hydrological uncertainty analysis and bounded forecasting experiments connect model evaluation to physical systems, temporal structure, and explicit validity limits.",
    topics: ["Scientific Machine Learning", "Data-driven Modelling", "Time-series Methods"],
    projectSlugs: ["hydrology-uq", "streamflow-forecasting"],
  },
  {
    level: "Emerging inquiry",
    title: "Mathematical structure of learned models",
    description:
      "Neural-network identifiability is an active mathematical ML direction, presented as an area of inquiry rather than a completed research result.",
    topics: ["Neural Network Identifiability"],
    projectSlugs: [],
  },
] as const;

export const researchEvidence = {
  source: {
    label: "Canonical audited aggregate bundle",
    commit: canonicalThesisEvidence.commit,
    href: canonicalThesisEvidence.aggregateJson,
  },
  scope: {
    scenarios: 100,
    linksPerScenario: 31_635,
    predictions: 3_163_500,
    network: "One Paris road network",
    intervention: "Capacity-reduction policies",
  },
  results: auditedResults,
  selectiveRisk: {
    model: "Trial 8 MC Dropout",
    passes: auditedResults.mcDropout.passes,
    protocol: "Least-uncertain predictions retained first on the full cached 100-graph test archive",
    points: selectiveRiskPoints,
    boundary:
      "Six selected audited operating points from a 5-percentage-point evaluation grid. The interface never interpolates between them and shows no random-review baseline.",
  },
  methods: [
    {
      name: "Deterministic GNN",
      mechanism: "One point prediction per road link",
      question: "How accurate is the surrogate?",
      finding: `Trial 8 reported R² ${auditedResults.deterministic.r2.toFixed(3)} and MAE ${auditedResults.deterministic.mae.toFixed(2)} veh/h.`,
      status: "Historical held-out result",
    },
    {
      name: "MC Dropout",
      mechanism: "Thirty stochastic passes through one model",
      question: "Does uncertainty rank likely error?",
      finding: `Uncertainty–absolute-error Spearman ρ ${auditedResults.mcDropout.spearman.toFixed(3)}; raw spread remained under-dispersed.`,
      status: "Trial-specific cached replay",
    },
    {
      name: "Deep Ensemble",
      mechanism: "Five independently trained model members",
      question: "Do multiple fits improve prediction and spread?",
      finding: `R² ${auditedResults.deepEnsemble.r2.toFixed(3)} and MAE ${auditedResults.deepEnsemble.mae.toFixed(2)} veh/h; uncertainty–error ρ ${auditedResults.deepEnsemble.spearman.toFixed(3)}.`,
      status: "Cached full-test recomputation",
    },
    {
      name: "Conformal prediction",
      mechanism: "Held-out residual quantiles around predictions",
      question: "Do intervals reach a stated marginal coverage?",
      finding: `${marginalCoverage[0].observedPct.toFixed(2)}% and ${marginalCoverage[1].observedPct.toFixed(2)}% empirical marginal coverage at nominal ${marginalCoverage[0].nominalPct}% and ${marginalCoverage[1].nominalPct}%.`,
      status: "Submission-era reported result",
    },
  ],
  evaluatedMethods: [
    "Deterministic GNN baselines",
    "MC Dropout",
    "Deep ensembles",
    "Regression sigma scaling",
    "Split and adaptive conformal prediction",
    "Selective prediction and error-detection diagnostics",
    "Conformalized quantile regression",
  ],
  calibrationProtocols: [
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
  ],
  marginalCoverage,
  publicBoundary: {
    included: [
      "Immutable submitted PDF with a separate post-submission corrigendum",
      "Aggregate JSON, CSV, report, figures, and artifact hashes",
      "Source code, local dashboard code, validation, and regression tests",
    ],
    excluded: [
      "Raw MATSim scenarios and graph topology",
      "Row-level predictions, targets, and uncertainty arrays",
      "Graph loaders, split-specific scalers, and model checkpoints",
      "Private dashboards, local paths, and confidential source material",
    ],
  },
} as const;
