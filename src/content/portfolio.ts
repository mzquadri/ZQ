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

export interface Project {
  slug: string;
  title: string;
  eyebrow: string;
  classification: ProjectClassification;
  featured: boolean;
  year: string;
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
}

export const site = {
  name: "Mohd Zamin Quadri",
  shortName: "MZQ",
  domain: "https://mzquadri.de",
  description:
    "Applied machine learning engineer working across reliable ML, graph neural networks, scientific computing, and production-oriented AI systems.",
  location: "Munich, Germany",
  availability: "Open to full-time Machine Learning and Applied AI roles",
  github: "https://github.com/mzquadri",
  linkedin: "https://www.linkedin.com/in/mohdzaminquadri/",
} as const;

export const thesis = {
  title:
    "Uncertainty Quantification for Machine Learning Models in Transportation Policy Analysis",
  status: "Master's thesis submitted May 15, 2026",
  institution: "Technical University of Munich",
  school: "TUM School of Computation, Information and Technology",
  department: "Department of Computer Science",
  program: "Mathematics in Science and Engineering",
  examiner: "Prof. Dr. Stephan Günnemann",
  advisors: "Dominik Fuchsgruber and Elena Natterer",
} as const;

export const researchEvidence = {
  selectiveRisk: {
    points: [
      { retentionPct: 10, mae: 1.06 },
      { retentionPct: 50, mae: 2.32 },
      { retentionPct: 100, mae: 3.95 },
    ],
    source: "Full cached Trial 8 MC Dropout analysis",
  },
  calibrationProtocols: [
    {
      id: "graph20_80_v1",
      split: "First 20 graphs / last 80",
      result: "ECE 0.269 → 0.048",
      evidence: "Replayable tracked JSON",
    },
    {
      id: "node30_70_thesis_final",
      split: "Random 30% / 70% nodes",
      result: "ECE ≈ 0.356 → 0.034",
      evidence: "Final-thesis reported value",
    },
  ],
} as const;

export const projects: readonly Project[] = [
  {
    slug: "transport-uq",
    title: "Reliable GNN Surrogates for Transport Policy Analysis",
    eyebrow: "Master's thesis / Reliable ML",
    classification: "Academic research",
    featured: true,
    year: "2026",
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
        value: "100 scenarios",
        note: "3,163,500 road-link predictions in the cached test artifacts.",
      },
      {
        label: "Primary GNN",
        value: "R² 0.596",
        note: "Deterministic Trial 8; MAE 3.96 veh/h and RMSE 7.12 veh/h.",
      },
      {
        label: "Uncertainty ranking",
        value: "ρ 0.482",
        note: "Pooled Spearman correlation between MC Dropout uncertainty and absolute error.",
      },
      {
        label: "Selective review",
        value: "41.2% lower MAE",
        note: "Accepted-set MAE at 50% retention versus accepting every prediction.",
      },
      {
        label: "Deep ensemble",
        value: "R² 0.684",
        note: "Five-member ensemble; MAE 3.49 veh/h and uncertainty-error ρ 0.400.",
      },
      {
        label: "Marginal coverage",
        value: "90.02% / 95.01%",
        note: "Reported final-thesis split-conformal protocol at nominal 90% / 95%.",
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
    repository:
      "https://github.com/mzquadri/ml_surrogates_for_agent_based_transport_models",
  },
  {
    slug: "insureassist-rag",
    title: "InsureAssist: Grounded RAG Service",
    eyebrow: "AI application engineering",
    classification: "Engineering prototype",
    featured: true,
    year: "2026",
    summary:
      "A local-first insurance-policy question-answering prototype that retrieves source clauses and returns cited answers through a FastAPI service.",
    problem:
      "Policy documents are difficult to search reliably, and unconstrained generation can produce answers without evidence.",
    contribution:
      "Implemented document ingestion, BGE embeddings, Qdrant retrieval, a pluggable local generation layer, FastAPI endpoints, evaluation fixtures, Docker packaging, Kubernetes manifests, and CI configuration.",
    workflow: [
      "Policy documents",
      "Chunking and BGE embeddings",
      "Qdrant retrieval",
      "Local LLM generation",
      "Cited API response",
    ],
    tools: [
      "FastAPI",
      "Qdrant",
      "Ollama",
      "Hugging Face",
      "Docker",
      "Kubernetes",
      "GitHub Actions",
    ],
    evidence: [
      {
        label: "Service shape",
        value: "Retrieval + citations",
        note: "Tracked API, ingestion, health checks, sample policies, and ten-question evaluation fixture.",
      },
      {
        label: "Deployment scope",
        value: "Local prototype",
        note: "Docker verified and Kubernetes authored; no completed GKE deployment is claimed.",
      },
    ],
    quality: [
      "Health endpoint and typed request/response models",
      "Local sample corpus and evaluation report are versioned",
      "Configuration is environment-driven and secrets are excluded",
      "Container and orchestration definitions are kept with the service",
    ],
    limitations: [
      "Not a live production insurance service and not validated on regulated customer data",
      "GKE deployment is documented but not completed",
      "The tracked runtime uses Llama 3.2 through Ollama; Phi-3 is an optional adapter path whose trained artifact is not versioned",
      "A small local LLM judge is noisy and cannot establish clinical, legal, or insurance correctness",
    ],
    learned:
      "A credible RAG system needs explicit retrieval evidence, failure-aware evaluation, and deployment boundaries—not only a chat interface.",
    repository: "https://github.com/mzquadri/insureassist-rag-mlops",
  },
  {
    slug: "mlops-reference-pipeline",
    title: "A Testable End-to-End MLOps Pipeline",
    eyebrow: "ML systems engineering",
    classification: "Reference implementation",
    featured: true,
    year: "2026",
    summary:
      "A compact, runnable reference for the lifecycle around a text classifier: validated data, traceable training, quality gates, promotion, serving, and tests.",
    problem:
      "A model notebook does not provide data provenance, repeatable promotion decisions, train/serve consistency, or a stable serving contract.",
    contribution:
      "Implemented hash-based data versions, validation and drift checks, reusable TF-IDF features, MLflow logging, configurable model gates, a local registry, FastAPI serving, Docker configuration, and pytest coverage.",
    workflow: [
      "Validate and hash data",
      "Fit reusable features",
      "Train and track",
      "Evaluate quality gate",
      "Register and serve",
    ],
    tools: ["scikit-learn", "MLflow", "FastAPI", "Docker", "pytest", "GitHub Actions"],
    evidence: [
      {
        label: "Reproducibility",
        value: "Deterministic fallback",
        note: "The full lifecycle runs with a synthetic review fixture when no licensed dataset is supplied.",
      },
      {
        label: "Quality control",
        value: "Promotion gate",
        note: "Models that miss a configured threshold are not promoted in the reference workflow.",
      },
    ],
    quality: [
      "CLI stages can also be imported as modules",
      "Data validation covers nulls, duplicates, balance, KS tests, and PSI",
      "Feature transformers are reused at serving time",
      "API, model, and data pipeline behavior has automated tests",
    ],
    limitations: [
      "A reference implementation, not a deployed product",
      "No real dataset, model artifact, or production accuracy report is versioned",
      "Operational concerns such as managed secrets, real monitoring backends, and incident response remain outside scope",
    ],
    learned:
      "The valuable part of MLOps is the contract between stages: provenance, validation, promotion criteria, and serving behavior must agree.",
    repository: "https://github.com/mzquadri/MLOps-End-to-End-Pipeline",
  },
  {
    slug: "hydrology-uq",
    title: "Uncertainty Quantification in Hydrology",
    eyebrow: "TUM project seminar",
    classification: "Group coursework",
    featured: true,
    year: "2024",
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
    featured: false,
    year: "2026",
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
    featured: false,
    year: "2026",
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
    title: "Reliable ML and UQ",
    summary: "Calibration, conformal prediction, selective prediction, uncertainty diagnostics",
    proof: ["transport-uq", "hydrology-uq"],
  },
  {
    title: "Deep learning and GNNs",
    summary: "PyTorch, PyG, graph surrogates, ensembles, CNN experiments",
    proof: ["transport-uq", "cifar10-cnn"],
  },
  {
    title: "MLOps and deployment",
    summary: "Validation, experiment tracking, model gates, APIs, containers, CI",
    proof: ["mlops-reference-pipeline", "insureassist-rag"],
  },
  {
    title: "AI application engineering",
    summary: "Grounded retrieval, vector search, typed services, local model integration",
    proof: ["insureassist-rag"],
  },
  {
    title: "Scientific computing",
    summary: "Numerical experiments, sensitivity analysis, time series, reproducible reports",
    proof: ["hydrology-uq", "streamflow-forecasting"],
  },
] as const;

export const navigation = [
  { href: "/work", label: "Work" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getFeaturedProjects() {
  return projects.filter((project) => project.featured);
}
