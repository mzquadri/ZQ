import { site } from "./truth";

/**
 * The shorter home-page sections: research results, experience, education,
 * skills.
 *
 * All of it is on the CV, in plainer words. The rule applied throughout is that
 * a reader should not need to know the field to understand a line: no trial
 * numbers, no Greek letters, no metric abbreviations without the plain name
 * beside them. The deep pages keep the precise versions, because a professor
 * reading /research does want the protocol and the trial.
 */

/**
 * The thesis results, stated so a recruiter can read them.
 *
 * `plain` is what the number means. `figure` is the number. Keeping them apart
 * stops the card reading as a specification sheet and lets the explanation
 * carry the weight, which is the point: these three numbers are the reason the
 * thesis is worth a reader's time, and none of them explains itself.
 *
 * Deliberately absent: "Trial 8", "Spearman rho", "MC Dropout", "ECE". Every one
 * of those is on /research/thesis, with its protocol.
 */
export const researchHighlights = [
  {
    figure: "82% lower",
    plain:
      "calibration error, after one scaling step. The model's confidence used to be badly overstated; afterwards its stated confidence matched how often it was actually right.",
  },
  {
    figure: "41% lower error",
    plain:
      "on the predictions it keeps, when the least confident half are set aside. That is the practical payoff: the model can tell you which of its answers to use.",
  },
  {
    figure: "90.02% and 95.01%",
    plain:
      "of the true values fell inside the ranges it predicted, at the 90% and 95% levels. A range that claims 90% should contain the answer 90% of the time, and these did.",
  },
] as const;

export const researchSummary = {
  heading: "Research",
  lede: "My M.Sc. thesis at the Chair of Data Analytics and Machine Learning asked a simple question: when a model predicts how traffic responds to a road policy, can it also say how much to trust that prediction?",
  closing:
    "The surrogate model and the simulation pipeline it runs on are the work of Elena Natterer and colleagues. The uncertainty layer, the eleven training runs and the evaluation are mine.",
  href: "/research",
} as const;

/**
 * Experience for the home page.
 *
 * Two to three bullets each, taken from the CV. Three deliberate choices:
 *
 * **No dates on the BP-IT entry**, at the owner's instruction. They are on the
 * CV, which is where a date is useful.
 *
 * **Nothing is marked current.** The BP-IT role has ended, and a "Now" badge on
 * a finished role is the kind of small wrongness a reader notices and then
 * wonders what else is stale.
 *
 * **The AUDI entry is the release-tracking tool**, which an earlier version of
 * this site described incorrectly. It was an Excel VBA application with
 * UserForms over a development release sheet, not anything else.
 */
export interface HomeRole {
  organisation: string;
  role: string;
  location: string;
  /**
   * Omitted entirely where no dates are published, which is the BP-IT entry.
   *
   * Declared optional on the interface rather than left to inference: with
   * `as const` alone the union narrows to "the BP-IT object has no period
   * property", and every reader of the array then fails to compile on
   * `role.period`. The field is genuinely optional, so the type says so.
   */
  period?: string;
  bullets: readonly string[];
}

export const homeExperience: readonly HomeRole[] = [
  {
    organisation: "BP-IT Consulting & Solutions GmbH",
    role: "AI Engineer (Working Student)",
    location: "Munich, Germany",
    bullets: [
      "Built four of the five services in a legal knowledge base: a three-stage pipeline that parses German and EU legislation into PostgreSQL, with embeddings in Qdrant and a citation graph in Neo4j.",
      "Shipped the verification service that runs up to 14 checks on a law before it is certified, and the dashboard that reports them.",
      "Built the ML core of a chest X-ray classifier over five findings, and the Docker Compose stack behind the services, contributing to the Kubernetes manifests and CI.",
    ],
  },
  {
    organisation: "AUDI AG",
    role: "Intern, Programming of Workflows and Linking of Databases",
    location: "Ingolstadt, Germany",
    period: "Jan 2023 to Jun 2023",
    bullets: [
      "Built an Excel VBA application with UserForms for development release tracking, replacing a manual search through roughly 600 rows and 130 or more columns with dropdown selection and single-click lookup.",
      "Added separate interfaces for the German and Chinese markets, with create, update and delete forms writing back to the source sheet.",
      "Connected the tool to FREIPRO, the release system every department already used, so its records stayed in step. Other departments adopted it.",
    ],
  },
  {
    organisation: "Technical University of Munich",
    role: "Student Research Assistant, Programming and Visualization",
    location: "Munich, Germany",
    period: "Aug 2023 to Mar 2024",
    bullets: [
      "Taught MATLAB lab sessions for mathematics and engineering students.",
      "Wrote the starter code the students worked from.",
    ],
  },
  {
    organisation: "Technical University of Munich",
    role: "Student Research Assistant, Numerical Methods and Scientific Visualization",
    location: "Munich, Germany",
    period: "Oct 2022 to Dec 2022",
    bullets: [
      "Taught the MATLAB labs of Introduction to Programming at the Chair of Numerical Mathematics.",
      "Covered vectorisation, linear systems, and 2D and 3D visualisation.",
    ],
  },
];

/** Both degrees, end year only, as the CV prints them. */
export const homeEducation = [
  {
    institution: "Technical University of Munich",
    credential: "M.Sc. Mathematics in Science and Engineering",
    year: "2026",
    note: "Completed. Thesis at the Chair of Data Analytics and Machine Learning.",
  },
  {
    institution: "Aligarh Muslim University",
    credential: "B.Sc. (Hons.) Mathematics",
    year: "2021",
    note: "First Division.",
  },
] as const;

/**
 * Skills, grouped the way the CV groups them and in the CV's own spelling.
 *
 * Short on purpose. A wall of sixty tools tells a reader nothing except that
 * the author can list sixty tools; these are the ones that appear in the work
 * above, which is what makes them checkable.
 */
export const homeSkills = [
  {
    group: "Languages",
    items: ["Python", "SQL", "TypeScript", "MATLAB", "Excel VBA", "Bash"],
  },
  {
    group: "Machine learning",
    items: ["PyTorch", "PyTorch Geometric", "scikit-learn", "XGBoost", "Hugging Face Transformers"],
  },
  {
    group: "Uncertainty and reliability",
    items: ["Conformal prediction", "Calibration", "Deep ensembles", "Selective prediction"],
  },
  {
    group: "Generative AI and retrieval",
    items: ["RAG", "Hybrid retrieval", "BGE-M3", "Qdrant", "LangGraph", "Ollama"],
  },
  {
    group: "Platform",
    items: ["Docker", "Kubernetes", "Argo CD", "GitHub Actions", "Apache Kafka", "MLflow", "FastAPI", "PostgreSQL", "Neo4j"],
  },
] as const;

/** Where the home page sends a reader who wants the credentials themselves. */
export const credentialsLink = {
  href: "/certificates",
  label: "Certificates and volunteering",
  summary: `Five certifications, each linking to the issuer's own verification page, plus volunteering with AIESEC in Munich and the European Youth Event 2023. ${site.languages.length} languages.`,
} as const;
