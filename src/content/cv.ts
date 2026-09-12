import { site, thesis } from "./truth";

/*
 * The published curriculum vitae.
 *
 * This is not the private document. The private CV carries a phone number, a street-level
 * location and a photograph; none of those appear here, and the generator has no way to reach
 * them because they are not in this file.
 *
 * What is here is the professional record, transcribed from the CV revision of 19 Aug 2026, at
 * the same technical level as the public architecture case studies. That level is deliberate: the
 * named stores, formats and model families below are already published in that repository, so
 * restating them in a CV discloses nothing further. Anything not already public there stays out.
 *
 * `tools/gen-cv.mjs` renders this to `public/mohd-zamin-quadri-cv.pdf`. Editing the PDF by hand
 * is not a supported operation - change this file and regenerate.
 */

export interface CvRole {
  organization: string;
  title: string;
  period: string;
  location: string;
  points: readonly string[];
}

export interface CvSkillGroup {
  label: string;
  items: string;
}

export const cv = {
  name: site.name,
  role: site.role,
  location: site.location,
  email: site.email,
  github: site.github,
  linkedin: site.linkedin,
  domain: site.domain,
  architecture: site.architecture,

  profile:
    "AI/ML engineer with a mathematics background, working across data pipelines, model development and production AI services. Current work covers a legal knowledge base with vector and graph search, insurance document extraction with OCR and LLMs, and a chest X-ray classification prototype with Grad-CAM++ attribution. Master's thesis on uncertainty quantification for graph neural network surrogates.",

  experience: [
    {
      organization: "BP-IT Consulting & Solutions GmbH",
      title: "AI Engineer (Working Student)",
      period: "Apr 2025 - Present",
      location: "Munich, Germany",
      points: [
        "Legal knowledge control plane: built a FastAPI verification service and a Next.js operator dashboard that check each law against its original published source and confirm it is consistent across PostgreSQL, Qdrant, Neo4j and MinIO. Operators can re-ingest or delete a law, and the result is verified afterwards.",
        "Legal ingestion pipeline: built both stages for German and EU legislation. The first parses legal XML into structured PostgreSQL records; the second creates BGE-M3 embeddings and writes them to Qdrant and Neo4j, keeping every store on the same law version.",
        "Insurance document intelligence: developed the extraction and indexing services that turn insurance PDFs and scanned images into searchable data, using Docling for OCR and an LLM with regex rules to pull out policy fields, then chunking and embedding the text. Both run as Kafka consumers.",
        "Medical imaging: trained and evaluated a DenseNet-121 chest X-ray classification prototype in PyTorch, tracked in Weights & Biases, with Grad-CAM++ attribution served through the prediction service. Research prototype; not a medical device and not clinically deployed.",
        "Owned the shared Docker Compose development stack and the CI pipelines for these services.",
      ],
    },
    {
      organization: "Technical University of Munich",
      title: "Student Research Assistant, Programming and Visualization",
      period: "Aug 2023 - Mar 2024",
      location: "Munich, Germany",
      points: [
        "Taught hands-on lab sessions in Python, MATLAB, R and SQL for applied mathematics and engineering students, standardised the starter code and lab templates used across cohorts, and ran live-coding sessions on debugging and version control.",
      ],
    },
    {
      organization: "AUDI AG",
      title: "Intern, Programming of Workflows and Linking of Databases",
      period: "Jan 2023 - Jun 2023",
      location: "Ingolstadt, Germany",
      points: [
        "Built an Excel VBA application with UserForms that automated development release tracking, replacing manual searching through a sheet of roughly 600 rows and 130+ columns with dropdown selection and single-click lookup.",
        "Added separate interfaces for the German and Chinese markets, forms to create, update and delete records with automatic write-back, and a connection to the internal release system. The tool was later used by several departments.",
      ],
    },
    {
      organization: "Technical University of Munich",
      title: "Student Research Assistant, Numerical Methods and Scientific Visualization",
      period: "Apr 2022 - Dec 2022",
      location: "Munich, Germany",
      points: [
        "Developed MATLAB lab modules on numerical methods and scientific visualisation, covering vectorised solvers, system simulation in Simulink and reproducible plots for teaching material.",
      ],
    },
  ] as const satisfies readonly CvRole[],

  research: [
    {
      organization: "Technical University of Munich, Data Analytics and Machine Learning",
      title: "Master's thesis - " + thesis.title,
      period: "Aug 2025 - May 2026",
      location: "Munich, Germany",
      points: [
        "Examiner: " + thesis.examiner + ". Advisors: " + thesis.advisors + ".",
        "Evaluated six uncertainty-quantification approaches on a graph neural network traffic surrogate: MC dropout, seed and multi-model ensembles, deep ensembles, heteroscedastic regression and conformalized quantile regression. Trained 11 model trials in PyTorch and PyTorch Geometric and evaluated 3.16 million road-segment predictions on the Paris network.",
        "Improved calibration with post-hoc sigma scaling, reducing expected calibration error by 90.5%, and used conformal prediction to reach the target 90% and 95% prediction-interval coverage.",
        "Showed the uncertainty estimates identify unreliable predictions: keeping the most confident 50% reduced mean absolute error by 41.2%, and predicted uncertainty detected the largest errors with AUROC 0.75.",
      ],
    },
    {
      organization: "Technical University of Munich, Mathematics of Data Science",
      title: "Seminar - Identification of Neural Networks",
      period: "Oct 2024 - Mar 2025",
      location: "Munich, Germany",
      points: [
        "Studied when the weights of a deep network can be recovered uniquely from its input-output behaviour: network symmetries, the role of the activation function, and what that implies for interpreting a trained model.",
      ],
    },
    {
      organization: "Indian Institute of Science Education and Research, Bhopal",
      title: "Summer Research Intern - ML for Li-ion Battery State Estimation",
      period: "May 2021 - Jul 2021",
      location: "Bhopal, India",
      points: [
        "Implemented regression and clustering baselines (linear, ridge, k-means) to estimate lithium-ion battery state of charge and state of health, validated with cross-validation on RMSE and MAE.",
      ],
    },
  ] as const satisfies readonly CvRole[],

  education: [
    {
      institution: "Technical University of Munich",
      credential: "M.Sc. Mathematics in Science and Engineering",
      period: "2026",
      location: "Munich, Germany",
      note:
        "Thesis at the Chair of Data Analytics and Machine Learning. Master's thesis submitted 15 May 2026. Coursework: Foundations of Data Analysis, Causal Inference in Time Series, Data Mining and Knowledge Discovery, Uncertainty Quantification in Hydrology, Case Studies in Scientific Computing.",
    },
    {
      institution: "Aligarh Muslim University",
      credential: "B.Sc. (Hons.) Mathematics",
      period: "2021",
      location: "Aligarh, India",
      note:
        "Coursework: Probability and Probability Distributions, Numerical Analysis, Discrete Mathematics, C Programming and MATLAB.",
    },
  ],

  skills: [
    { label: "Programming", items: "Python, SQL, Java, TypeScript / JavaScript, MATLAB, R, Bash, VBA" },
    {
      label: "Machine & deep learning",
      items:
        "PyTorch, PyTorch Geometric, TensorFlow, scikit-learn, XGBoost, Hugging Face Transformers, graph neural networks, computer vision, uncertainty quantification, conformal prediction",
    },
    {
      label: "Generative AI & retrieval",
      items:
        "RAG, embeddings (BGE-M3, sentence-transformers), vector search (Qdrant), knowledge graphs, LLM fine-tuning (LoRA / PEFT), LLM-based extraction, OCR (Docling), local LLM serving (Ollama)",
    },
    {
      label: "Backend & data",
      items: "FastAPI, Spring Boot, REST APIs, Kafka, PostgreSQL, Neo4j, MongoDB, MinIO, pandas, NumPy",
    },
    {
      label: "Engineering & MLOps",
      items:
        "Docker, Docker Compose, Kubernetes (manifests), Git, CI/CD (GitHub Actions, Gitea Actions), MLflow, Weights & Biases, pytest, Linux, Next.js",
    },
  ] as const satisfies readonly CvSkillGroup[],

  certifications: site.certifications,
  languages: site.languages,
} as const;
