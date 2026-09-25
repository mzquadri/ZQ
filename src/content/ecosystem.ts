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
    /*
     * Widened to describe what is actually in it. The bucket holds early learning exercises, but
     * it also holds a profile README, a retired landing page and an upstream fork with no authored
     * contribution - and calling those "learning-oriented implementations" was the one place this
     * index described itself less accurately than its own entries do. Each entry already carries
     * an honest boundary; the category heading now matches them.
     */
    id: "Reference",
    summary:
      "Early learning exercises, documentation and forks. Listed because the index is complete rather than curated, and not offered as evidence of engineering depth.",
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
  /** Slug of the matching case study, when one exists. */
  caseStudySlug?: string;
}

const owner = `${site.github}/`;

export const ecosystemSnapshot = {
  method:
    "Manual audit of every public repository on the profile, re-run when a repository is added. Repository names, languages and URLs were read from GitHub; descriptions and evidence boundaries are summarised from each README. No activity dates are published.",
  profile: site.github,
} as const;

export const ecosystemRepositories: readonly EcosystemRepository[] = [
  {
    name: "mcp-policy-gateway",
    title: "MCP Policy Gateway: Runtime Enforcement for Tool Calls",
    category: "Featured",
    language: "Python",
    topics: ["Agent Security", "Model Context Protocol", "Prompt Injection", "Adversarial Benchmark"],
    description:
      "A proxy that sits between an MCP client and an MCP server, inspecting tool declarations, call arguments and returned content, with a 47-case corpus that measures each control against the legitimate traffic a careless rule would break.",
    boundary:
      "A prototype with a reproducible benchmark, not a deployed product. Detection is pattern-based and deterministic, so paraphrased attacks and encoded payloads pass; two of the corpus cases are kept as scored misses and two known false positives are kept for the same reason. The Model Context Protocol SDK is a dependency by other authors, not part of this work.",
    caseStudySlug: "mcp-policy-gateway",
  },
  {
    name: "medico",
    title: "Medico: Chest X-Ray Multi-Label Training",
    category: "Featured",
    language: "Python",
    topics: ["Medical Imaging", "DenseNet-121", "Masked Focal Loss", "Transfer Learning"],
    description:
      "A research training script that fine-tunes a DenseNet-121 across fourteen chest-radiograph findings, combining three source datasets and masking the loss wherever a label is uncertain or simply absent.",
    boundary:
      "Experimental research code and nothing else. The repository ships no trained weights, no patient data, no held-out metrics and no clinical validation, and must not be used for diagnosis, triage or treatment.",
    caseStudySlug: "medico",
  },
  {
    name: "munich-accident-forecasting",
    title: "Munich Accident Forecasting: A Result, and Whether It Holds",
    category: "Engineering",
    language: "Python",
    topics: ["Forecasting", "FastAPI", "Baseline Comparison", "Reproducibility"],
    description:
      "Monthly forecasts for seven Munich accident series from the city's open data, served behind a FastAPI contract. A per-series linear trend with monthly seasonal offsets beats the seasonal-naive baseline on the published window, and the same protocol re-run over ordinary years shows the baseline winning instead.",
    boundary:
      "An educational prototype, not a public-safety forecast. Most of the published margin turns out to be the pandemic repeated forward by the baseline, which the repository measures rather than leaves as a caveat. Nothing here is validated for operational use.",
  },
  {
    name: "Weather-Data-Analytics-EDA",
    title: "Weather Analytics: Exploratory Analysis",
    category: "Engineering",
    language: "Python",
    topics: ["Exploratory Data Analysis", "pandas", "Visualization", "Synthetic Data"],
    description:
      "A wrangling-and-visualisation walkthrough over deterministic generated daily observations for six cities, covering statistical summaries, seasonality and correlation.",
    boundary:
      "Every observation is produced by a seeded generator. The figures are not weather-station records, climate evidence or forecasts, and support no operational or scientific claim.",
  },
  {
    name: "ML-Water-Quality-Classification",
    title: "Water Quality: Classifier Comparison",
    category: "Engineering",
    language: "Python",
    topics: ["Classification", "Cross-Validation", "XGBoost", "Synthetic Data"],
    description:
      "Four pipelines - logistic regression, random forest, XGBoost and an RBF SVM - compared under cross-validation and hyperparameter tuning on a seeded five-thousand-sample dataset.",
    boundary:
      "The labels are generated, not laboratory measurements. The tracked scores measure how well each model recovers the generator's own class-correlated distributions, and say nothing about whether real water is safe to drink.",
  },
  {
    name: "snake-water-gun",
    title: "Snake, Water, Gun",
    category: "Reference",
    language: "Python",
    topics: ["Python", "Unit Testing", "Learning Artifact"],
    description:
      "A command-line variant of rock-paper-scissors, with input validation and three unit tests covering the ties, each winning matchup and a rejected input.",
    boundary:
      "A beginner exercise. It sat under the name pde-problems for a year, which is where the repository started before that content was deleted and replaced; the name was corrected rather than left to misdescribe the contents, and GitHub still redirects the old one.",
  },
  {
    name: "iftaar-invitation-2026",
    title: "Iftaar Invitation",
    category: "Reference",
    language: "HTML",
    topics: ["Static Site", "Client-Side Only", "Design Artifact"],
    description:
      "A single-file personalised invitation for a private gathering. Guest names, animation and countdown all run in the browser; nothing is submitted, collected or measured.",
    boundary:
      "An event-specific design artifact, not a reusable event-management system. The host and venue details are deliberately particular to the original invitation.",
  },
  /*
   * The profile README repository was listed here and does not exist.
   *
   * `github.com/mzquadri/mzquadri` returns 404 and the account's repository listing does not
   * contain it, so this index published a broken link and, worse, published it while claiming to
   * be a complete audit of the profile. It was not caught because repository links are computed
   * from `name` at render time rather than written out as strings, and the link checker only ever
   * walked string values. It walks these now too.
   *
   * Replaced by the architecture case-study repository, which does exist, was missing, and is the
   * one the site links to most.
   */
  {
    name: "ai-engineering-portfolio",
    title: "Architecture case studies",
    category: "Reference",
    language: "HTML",
    topics: ["Architecture", "Documentation", "Evidence Boundaries"],
    description:
      "The separate case-study site: architecture diagrams of the employer systems contributed to, an interactive walkthrough, and a written record of what each claim rests on, published under its own redaction review.",
    boundary:
      "Documentation of systems built elsewhere, not an implementation. It states a contribution level for every component and claims no authorship of the platform it describes.",
  },
  {
    name: "ml_surrogates_for_agent_based_transport_models",
    title: "Reliable GNN Surrogates for Transport Policy",
    category: "Featured",
    language: "Python",
    topics: ["Uncertainty Quantification", "Graph Neural Networks", "Conformal Prediction", "PyTorch"],
    description:
      "Master's thesis codebase studying when a graph neural network surrogate for transport simulation can be trusted, and how uncertainty supports a review decision.",
    boundary:
      "A fork of Elena Natterer's repository, extending it with the uncertainty work. It carries the submitted thesis as a frozen record alongside a working copy that has since been edited, and says which is which. The training and evaluation artifacts it reads are published as release assets on the same repository, the largest of them because they exceed GitHub's per-file limit.",
    caseStudySlug: "transport-uq",
  },
  {
    name: "express",
    title: "express (Upstream Fork)",
    category: "Reference",
    language: "JavaScript",
    topics: ["Fork", "Upstream"],
    description:
      "A fork of the upstream Express web framework.",
    boundary:
      "No authored contribution. It appears here only because this index lists every public repository, including the ones that flatter nobody.",
  },
  {
    name: "colpali",
    title: "colpali (Upstream Fork)",
    category: "Reference",
    language: "Python",
    topics: ["Fork", "Upstream", "Document Retrieval"],
    description:
      "A fork of the upstream ColPali repository, a vision-language retriever that indexes document pages as images rather than as extracted text.",
    boundary:
      "No authored contribution. Listed for the same reason as the fork above: this index covers every public repository, not only the flattering ones.",
  },
  {
    name: "Statistical-Learning-Transportation",
    title: "Statistical Learning Coursework",
    category: "Reference",
    language: "Jupyter Notebook",
    topics: ["Coursework", "Regression", "Ensembles", "Neural Networks"],
    description:
      "Three graded problem sets from a TUM master's course: linear regression and diagnostics; then PCA, support vector machines and tree ensembles; then backpropagation, Bayesian optimisation, sequence forecasting, Markov decision processes and convolution.",
    boundary:
      "University coursework, published for reference rather than as a research contribution. Sixty-six of the numbers its reports quote were recomputed afterwards from the committed artifacts and all sixty-six matched. The problem sheets it includes are the chair's material, not mine.",
  },
  {
    name: "MLOps-End-to-End-Pipeline",
    title: "Testable End-to-End MLOps Pipeline",
    category: "Featured",
    language: "Python",
    topics: ["MLOps", "Reproducibility", "FastAPI", "Data Contracts", "pytest"],
    description:
      "The lifecycle around a text classifier on a licensed dataset: checksum-verified data that validation can refuse, leak-free feature fitting, a promotion gate measured against a baseline, atomic checksummed bundles, and a served container.",
    boundary:
      "A reference implementation, not a deployed product. The published result is an ordinary TF-IDF baseline on 600 held-out rows, pooled across three sources, and has never carried production traffic.",
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
  },
  {
    name: "drift-aware-ml-platform",
    title: "Drift-Aware ML Platform: Retraining on a Signal That Actually Fires",
    category: "Engineering",
    language: "Python",
    topics: ["MLOps", "Concept Drift", "Model Registry", "Promotion Gates"],
    description:
      "Hourly demand forecasting where the monitor watches the target as well as the inputs, because on this data the covariates hold still while the relationship between them and the target moves, and promotion re-scores the live champion on the challenger's own validation window rather than comparing two numbers measured on different data.",
    boundary:
      "A portfolio project on a public dataset, run on one machine, and not production experience. The Terraform module describes a deployment that has not been applied against a live project, there is no feature store, retraining is a full refit, and the prediction log is a file on a volume, which is fine for one instance and wrong for several.",
  },
  {
    name: "jobhunter",
    title: "CareerOS: Scored Job Discovery and Application Drafting",
    category: "Active",
    language: "Python",
    topics: ["FastAPI", "Next.js", "Scoring", "Document Drafting"],
    description:
      "Reads verified job sources on a schedule, scores each posting against one profile, shows why each score came out the way it did, and drafts the covering letter, so the work left is reading and deciding rather than searching.",
    boundary:
      "It never applies on anyone's behalf, by design. The scores are editorial heuristics tuned to a single profile and establish nothing about how any employer actually reads an application.",
  },
  {
    name: "career-data-lab",
    title: "Career Data Lab: Production-Style Data Practice, Locally",
    category: "Experiment",
    language: "Python",
    topics: ["Polars", "DuckDB", "Data Contracts", "Quality Gates"],
    description:
      "A local-first practice project for the shape of production data work: Polars transformations, DuckDB for querying, Pandera contracts on the inputs, and a ruff, pyright and pytest gate over the whole thing.",
    boundary:
      "A practice project rather than a pipeline anything depends on. It reads local files only, and establishes no throughput, cost or reliability claim.",
  },
  {
    name: "embedded-ai-edgevision-lab",
    title: "EdgeVision Lab: What Changes Between Training and the Device",
    category: "Experiment",
    language: "Python",
    topics: ["Model Export", "Quantization", "C++ Inference", "Benchmark Methodology"],
    description:
      "A learning lab for the deployment side of applied machine learning: a PyTorch vision model taken through export, quantization and C++ inference, measuring what changes at each step.",
    boundary:
      "Early, and deliberately not about accuracy. The methodology is the subject; no result here establishes what any particular model does on any particular device.",
  },
  {
    name: "complete-python-warmup",
    title: "Complete Python Warmup: A Learning Record",
    category: "Reference",
    language: "Jupyter Notebook",
    topics: ["Python", "Learning Record"],
    description:
      "A single notebook of Python practice worked through in June 2024, following a beginner curriculum from syntax and control flow to the standard library and then NumPy, pandas and matplotlib.",
    boundary:
      "Kept as a record of early learning. It is not a project, not a library, and not evidence of engineering practice.",
  },
  {
    name: "git-python-basics",
    title: "Git and Python Basics: An Early Practice Exercise",
    category: "Reference",
    language: "Python",
    topics: ["Git", "Python", "Learning Record"],
    description:
      "A minimal executable script and a standalone CSS snippet, retained from early Git and Python practice.",
    boundary:
      "Retained as a record rather than as work. It is not an application and not a portfolio project.",
  },
  {
    name: "mzquadri",
    title: "Profile README",
    category: "Reference",
    language: "Markdown",
    topics: ["Profile", "Index"],
    description:
      "The README GitHub renders on the profile page. It points at this site and at the handful of repositories worth opening first, with what each one measured.",
    boundary:
      "A signpost, not work. Every figure it quotes belongs to the repository it links to, and is checked there rather than here.",
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
