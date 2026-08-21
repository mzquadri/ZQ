import { site } from "./truth";

/**
 * Offline snapshot of the public GitHub ecosystem.
 *
 * This module is deliberately static. Pages must never depend on a live GitHub API call,
 * so every value here is recorded during a manual repository audit and reviewed like any
 * other published fact. If GitHub is unavailable, these routes render unchanged.
 *
 * Refresh procedure is documented in docs/GITHUB_ECOSYSTEM.md.
 */

export const ecosystemCategories = [
  "Featured",
  "Active",
  "Engineering",
  "Research",
  "Experiment",
  "Reference",
] as const;

export type EcosystemCategory = (typeof ecosystemCategories)[number];

export interface CategoryDefinition {
  id: EcosystemCategory;
  summary: string;
}

/** What each category promises a reader. Categories describe portfolio status, not technical quality. */
export const categoryDefinitions: readonly CategoryDefinition[] = [
  {
    id: "Featured",
    summary: "Deep work with a written case study and inspectable evidence.",
  },
  {
    id: "Active",
    summary: "Repositories receiving current engineering attention.",
  },
  {
    id: "Engineering",
    summary: "Legitimate smaller implementations with a working end-to-end path.",
  },
  {
    id: "Research",
    summary: "Academic or mathematical work, including group coursework.",
  },
  {
    id: "Experiment",
    summary: "Clearly bounded experiments. Not production systems.",
  },
  {
    id: "Reference",
    summary: "Learning-oriented implementations kept for reference, not promoted as flagship work.",
  },
];

export interface EcosystemRepository {
  /** Repository name exactly as it appears on GitHub. */
  name: string;
  /** Human-readable title used in the interface. */
  title: string;
  category: EcosystemCategory;
  /** Primary implementation language observed in the repository. */
  language: string;
  /** Descriptive focus areas. These are editorial labels, not GitHub topic metadata. */
  topics: readonly string[];
  /** One or two honest sentences derived from the repository README. */
  description: string;
  /** The boundary of what the repository does and does not establish. */
  boundary: string;
  /** Date of the most recent public commit observed during the audit. */
  lastCommit: string;
  /** Slug of the matching case study, when one exists. */
  caseStudySlug?: string;
}

const owner = `${site.github}/`;

export const ecosystemSnapshot = {
  observedAt: "2026-08-21",
  method:
    "Manual audit of public repositories. Repository URLs and last-commit dates were read directly from the tracked clones; descriptions and boundaries are summarised from each README.",
  profile: site.github,
} as const;

export const ecosystemRepositories: readonly EcosystemRepository[] = [
  {
    name: "ml-surrogates-thesis",
    title: "Reliable GNN Surrogates for Transport Policy",
    category: "Featured",
    language: "Python",
    topics: ["Uncertainty Quantification", "Graph Neural Networks", "Conformal Prediction", "PyTorch"],
    description:
      "Master's thesis codebase studying when a graph neural network surrogate for transport simulation can be trusted, and how uncertainty supports a review decision.",
    boundary:
      "Publishes the submitted PDF, a post-submission corrigendum, and aggregate audited artifacts. Raw simulation data and row-level predictions are not redistributable.",
    lastCommit: "2026-08-20",
    caseStudySlug: "transport-uq",
  },
  {
    name: "MLOps-End-to-End-Pipeline",
    title: "Testable End-to-End MLOps Pipeline",
    category: "Featured",
    language: "Python",
    topics: ["MLOps", "MLflow", "FastAPI", "Data Contracts", "pytest"],
    description:
      "A compact reference for the lifecycle around a text classifier: validated and fingerprinted data, tracked training, a promotion gate, a local registry, and a served bundle.",
    boundary:
      "A reference implementation with a deterministic synthetic fallback. No production deployment or real-dataset accuracy is claimed.",
    lastCommit: "2026-08-20",
    caseStudySlug: "mlops-reference-pipeline",
  },
  {
    name: "insureassist-rag-mlops",
    title: "InsureAssist: Grounded RAG Service",
    category: "Active",
    language: "Python",
    topics: ["Retrieval-Augmented Generation", "Qdrant", "FastAPI", "Docker", "Kubernetes"],
    description:
      "A local-first insurance-policy question-answering service that retrieves source clauses and returns cited answers behind a typed FastAPI contract.",
    boundary:
      "An engineering prototype. Kubernetes manifests are authored but no completed cloud deployment and no regulated-data validation are claimed.",
    lastCommit: "2026-08-09",
    caseStudySlug: "insureassist-rag",
  },
  {
    name: "ZQ",
    title: "ZQ: This Platform",
    category: "Active",
    language: "TypeScript",
    topics: ["Next.js", "Typed Content Model", "Accessibility Testing", "Playwright"],
    description:
      "Source of this website: a server-first Next.js platform with a typed factual registry, evidence and privacy validation, generated metadata, and automated accessibility regression tests.",
    boundary:
      "A personal platform rather than a general-purpose template. Content validation rules encode decisions specific to this portfolio.",
    lastCommit: "2026-08-21",
  },
  {
    name: "UQ-Hydrology-Seminar-TUM",
    title: "Uncertainty Quantification in Hydrology",
    category: "Research",
    language: "Python",
    topics: ["Sensitivity Analysis", "SALib", "Rainfall-Runoff Modelling", "TUM Seminar"],
    description:
      "A three-person TUM seminar connecting HBV rainfall-runoff calibration, local and global sensitivity analysis, and input/output uncertainty propagation.",
    boundary:
      "Group coursework. Individual ownership of each result is not claimed, and course-provided forcing data is not redistributable.",
    lastCommit: "2026-08-20",
    caseStudySlug: "hydrology-uq",
  },
  {
    name: "Neural-Network-Identifiability-Analysis",
    title: "Neural Network Identifiability Analysis",
    category: "Research",
    language: "Python",
    topics: ["Mathematical ML", "Parameter Symmetry", "Numerical Diagnostics"],
    description:
      "An educational playground for a mathematical question: if two networks agree on every input, must their parameters agree? Accompanies a TUM mathematics seminar on neural-network identification.",
    boundary:
      "Source code and exploratory notebooks only. No versioned experiment configurations or numerical findings, so no empirical identifiability result is established.",
    lastCommit: "2026-08-10",
  },
  {
    name: "Supply-Chain-Analytics-Dashboard",
    title: "Supply Chain Analytics Dashboard",
    category: "Engineering",
    language: "Python",
    topics: ["Plotly Dash", "Demand Forecasting", "Inventory Analytics", "KPIs"],
    description:
      "Cleans order data, computes operational KPIs, compares demand-forecasting baselines, and illustrates classical inventory calculations inside a single Dash application.",
    boundary:
      "Versions source and notebooks only. No dataset, screenshots, or verified business metrics, so no fill-rate or forecast-accuracy claim is made.",
    lastCommit: "2026-08-10",
  },
  {
    name: "Battery-SOC-Estimation-ML",
    title: "Battery State-of-Charge Estimation",
    category: "Experiment",
    language: "Python",
    topics: ["Time Series", "Feature Engineering", "XGBoost", "LSTM"],
    description:
      "Compares regression models, clustering, cycle-aware features, and a genetic-fuzzy prototype for inferring lithium-ion state of charge from voltage, current, and temperature.",
    boundary:
      "A research prototype with no dataset, weights, or tracked evaluation. It must not be used to operate a battery-management system or make safety decisions.",
    lastCommit: "2026-08-10",
  },
  {
    name: "Time-Series-Streamflow-Forecasting",
    title: "Streamflow Forecasting Benchmark",
    category: "Experiment",
    language: "Python",
    topics: ["Forecasting", "SARIMAX", "XGBoost", "Baselines"],
    description:
      "A deterministic benchmark comparing seasonal-naive, SARIMAX, and gradient-boosted one-step streamflow predictions on a fixed-seed synthetic series.",
    boundary:
      "Synthetic data. Strong scores test the evaluation pipeline and are not evidence of real-catchment validity.",
    lastCommit: "2026-08-10",
    caseStudySlug: "streamflow-forecasting",
  },
  {
    name: "Deep-Learning-Flood-Prediction-LSTM",
    title: "Flood Prediction with LSTM",
    category: "Experiment",
    language: "Python",
    topics: ["LSTM", "Sequence Models", "Hydrology", "Reproducibility"],
    description:
      "Trains an LSTM to read thirty days of precipitation, temperature, and soil moisture and predict next-day discharge, on a deterministic rainfall-runoff generator written for the repository.",
    boundary:
      "A reproducible synthetic-data demonstration. Reported metrics describe the generated benchmark only, not a validated flood-forecasting system.",
    lastCommit: "2026-08-10",
  },
  {
    name: "CNN-Image-Classification-PyTorch",
    title: "CIFAR-10 CNN Baseline",
    category: "Reference",
    language: "Python",
    topics: ["PyTorch", "Computer Vision", "Class Diagnostics"],
    description:
      "A compact image-classification experiment with a tracked configuration, learning history, per-class diagnostics, and an honestly recorded reference result.",
    boundary:
      "A bounded educational baseline on a 15,000-image training subset. No checkpoint is versioned and no state-of-the-art result is claimed.",
    lastCommit: "2026-08-10",
    caseStudySlug: "cifar10-cnn",
  },
  {
    name: "Insurance-Claims-Prediction-ML",
    title: "Insurance Claims Prediction Pipeline",
    category: "Reference",
    language: "Python",
    topics: ["Probability Calibration", "SHAP", "Cost-Sensitive Thresholds"],
    description:
      "Works through classification, probability calibration with Platt scaling or isotonic regression, cost-sensitive threshold selection, and SHAP-based attribution.",
    boundary:
      "Source and notebooks only, with no versioned data, model, or evaluation report. It is not an underwriting, pricing, or claims-decision system.",
    lastCommit: "2026-08-10",
  },
  {
    name: "NLP-Text-Classification-Transformers",
    title: "Transformers vs Classical NLP Baselines",
    category: "Reference",
    language: "Python",
    topics: ["DistilBERT", "Hugging Face", "TF-IDF", "Benchmarking"],
    description:
      "Runs TF-IDF baselines and a fine-tuned DistilBERT against the same AG News task with the same evaluation, so the two tracks can be compared rather than asserted.",
    boundary:
      "Versions source and notebooks but not data, checkpoints, or metrics, so no accuracy, F1, or model-comparison claim is published.",
    lastCommit: "2026-08-10",
  },
];

export function repositoryUrl(repository: EcosystemRepository) {
  return `${owner}${repository.name}`;
}

export function getRepositoriesByCategory(category: EcosystemCategory) {
  return ecosystemRepositories.filter((repository) => repository.category === category);
}

/** Categories that actually contain repositories, in declared order. */
export function getPopulatedCategories() {
  return categoryDefinitions
    .map((definition) => ({ ...definition, repositories: getRepositoriesByCategory(definition.id) }))
    .filter((group) => group.repositories.length > 0);
}

export function getEcosystemHighlights() {
  return ecosystemRepositories.filter(
    (repository) => repository.category === "Featured" || repository.category === "Active",
  );
}
