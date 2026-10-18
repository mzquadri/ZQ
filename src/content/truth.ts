export const sourceTiers = [
  "official-record",
  "immutable-artifact",
  "reproducible-evidence",
  "approved-document",
  "profile",
  "public-copy",
] as const;

export type SourceTier = (typeof sourceTiers)[number];

export interface TruthFact<T> {
  value: T;
  source: {
    tier: SourceTier;
    reference: string;
  };
  verifiedAt: string;
  reviewAfter?: string;
  public: boolean;
}

export interface ExperienceRecord {
  id: string;
  organization: string;
  title: string;
  location?: string;
  /**
   * Employment period, transcribed verbatim from the CV of 19 Aug 2026 and formatted as
   * "Mon YYYY - Mon YYYY", with "Present" only where the CV itself carries it.
   *
   * This field replaces an earlier decision to publish no dates at all. That decision was made
   * to stop a five-role list reading as a career narrative, and the disciplines grouping still
   * carries that intent. But a recruiter reading a portfolio needs to know how long something
   * ran, and withholding it costs more than the narrative it avoided. Dates are published where
   * a document supports them and nowhere else.
   */
  period?: string;
  /**
   * Sanitized, abstract description of confidential professional work. It must never name an
   * internal endpoint, URL, host, customer, credential, or unpublished company document, and
   * must be approved individually before publication.
   */
  practice?: string;
  /**
   * What the role actually involved, one clause per line, for the entry to expand into.
   *
   * Every line is the corresponding CV bullet, reworded only where the CV's phrasing is
   * CV-shaped. Nothing may appear here that is not on the CV: this is the surface a recruiter
   * reads against the document in front of them, and a line in one and not the other is the
   * discrepancy that costs an interview.
   *
   * The same endpoint rule as `practice` applies and is enforced in validate-content.ts.
   */
  detail?: readonly string[];
  /**
   * The tools named on the CV for this role, verbatim and in the CV's own spelling.
   *
   * A reader scanning for a stack should find the same words here as on the document. Nothing
   * is added because it is adjacent or implied: if the CV does not name it for this role, it
   * is not here.
   */
  tech?: readonly string[];
}

export interface EducationRecord {
  id: string;
  institution: string;
  credential: string;
  /** Completion year as printed on the CV. Not a conferral claim; see `status`. */
  period?: string;
  location?: string;
  status?: string;
}

/** A certification with an issuer and a date, both taken from the CV. */
export interface CredentialRecord {
  id: string;
  title: string;
  issuer: string;
  awarded: string;
  /**
   * The issuer's own verification page. Every certification published here carries one: a
   * credential a reader cannot check is an assertion, and this site does not publish assertions
   * it can avoid. Each URL below was opened and read on 15 Oct 2026 before being added.
   */
  credentialUrl?: string;
}

/**
 * Unpaid work, kept separate from employment.
 *
 * `issuer` is the body that signed the certificate, which is not always the body that ran the
 * event. EYE 2023 is the European Parliament's youth event and was held at the Parliament in
 * Strasbourg, but the Certificate of Achievement was issued by #DiasporaVote!. Conflating the two
 * would claim a Parliament award that was never made.
 */
export interface VolunteeringRecord {
  id: string;
  organization: string;
  role: string;
  period: string;
  location?: string;
  summary: string;
  /** The body that issued the certificate, where one exists and differs from the event host. */
  issuer?: string;
}

/** A language with its self-assessed CEFR level, as published on the CV. */
export interface LanguageRecord {
  id: string;
  language: string;
  level: string;
}

const verifiedAt = "2026-08-20";
const currentFactReviewAfter = "2026-11-20";
/**
 * Where the thesis codebase is maintained. The work was consolidated into the fork of the
 * upstream repository on 1 Sep 2026, and ml-surrogates-thesis was archived at that point.
 */
const canonicalThesisRepository =
  "https://github.com/mzquadri/ml_surrogates_for_agent_based_transport_models";

/**
 * Where the cited artifacts live. This was the archived predecessor until 4 Sep 2026, on the
 * reasoning that an archived repository stays readable. It was then deleted rather than
 * archived, and every reference below answered 404 until they were repointed here.
 */
const archivedThesisRepository =
  "https://github.com/mzquadri/ml_surrogates_for_agent_based_transport_models";
const recruiterCoreApproval = "Recruiter Core v1 fact approval, 2026-08-20";
const confidentialWorkApproval =
  "Website Completion v1 confidential-work sanitization approval, 2026-08-21";
/**
 * The CV that dates, certifications and languages are transcribed from. It is a private
 * document. What is published from it is the professional record only: no phone number, no
 * street address, no photograph, no identifier.
 */
const curriculumVitae = "Curriculum vitae, revision of 2026-08-19 (privately held)";
/**
 * The published address. It was withheld for want of a durable one; the address below is the one
 * already attached to public commit history, so publishing it discloses nothing new.
 *
 * A generated CV was approved under the same review and has since been withdrawn. Contact is the
 * email, LinkedIn and GitHub; there is no document to download.
 */
const contactApproval = "Professional contact approval, 2026-09-13";

export const truthRegistry = {
  identity: {
    name: {
      value: "Mohd Zamin Quadri",
      source: { tier: "official-record", reference: "Primary identity record (privately reviewed)" },
      verifiedAt,
      public: true,
    },
    positioning: {
      value: "AI/ML Engineer building reliable intelligent systems from models to production.",
      source: { tier: "approved-document", reference: "Portfolio positioning decision" },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
  },
  professional: {
    role: {
      value: "AI/ML Engineer",
      source: { tier: "approved-document", reference: "Professional positioning review" },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
    location: {
      value: "Munich, Germany",
      source: { tier: "official-record", reference: "Current-location confirmation (privately reviewed)" },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
    availability: {
      value: "Open to full-time Machine Learning and Applied AI roles",
      source: { tier: "approved-document", reference: "Availability confirmation" },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
    employment: {
      value: [
        {
          id: "bp-itcs",
          organization: "BP-IT Consulting & Solutions GmbH",
          title: "AI Engineer (Working Student)",
          location: "Munich, Germany",
          period: "Apr 2025 - Sep 2026",
          // Worded to match the CV exactly: four of the five services, not the
          // platform; a three-stage ingestion pipeline, not a two-stage one;
          // and "up to" fourteen checks, because two of the fourteen are
          // structurally inapplicable to an EU source and a German law meets
          // fourteen where an EU one meets twelve.
          practice:
            "Built four of the five services in a multilingual legal knowledge platform: a three-stage ingestion pipeline into relational, vector and graph storage, behind up to fourteen verification checks.",
          detail: [
            "Engineered four of the five services of a legal knowledge base: a three-stage pipeline parsing German GII-NORM and EU FORMEX v4 legislation into PostgreSQL, with BGE-M3 embeddings in Qdrant and Neo4j kept consistent by uuid5 point IDs.",
            "Shipped the FastAPI verification service that runs up to 14 checks on every law before it is certified, one of them an oracle parse on an independent XML stack, and the Next.js dashboard that reports them.",
            "Built the ML core of a DenseNet-121 chest X-ray classifier over five findings, with a calibrated threshold per finding, an ICD-10 severity layer and Grad-CAM++ attribution, served by a Kafka-backed prediction service.",
            "Extended a document-extraction pipeline pairing Docling OCR with LLM and regex extraction against declarative templates, so a model can be swapped without touching the pipeline.",
            "Built the Docker Compose stack and contributed to the Kubernetes manifests and CI pipelines; Argo CD ran the services as pods in Dev and QA.",
          ],
          tech: [
            "Python", "FastAPI", "Next.js", "PostgreSQL", "Qdrant", "Neo4j", "MongoDB",
            "BGE-M3", "Docling", "PyTorch", "Apache Kafka", "MinIO", "Ollama",
            "Docker", "Kubernetes", "Argo CD",
          ],
        },
        {
          id: "tum-programming-visualization",
          organization: "Technical University of Munich",
          title: "Student Research Assistant / Programming and Visualization",
          location: "Munich, Germany",
          period: "Aug 2023 - Mar 2024",
          detail: [
            "Taught MATLAB lab sessions for mathematics and engineering students, and prepared the starter code they worked from.",
          ],
          tech: ["MATLAB"],
        },
        {
          id: "audi-workflows-databases",
          organization: "AUDI AG",
          title: "Intern, Programming of Workflows and Linking of Databases",
          location: "Ingolstadt, Germany",
          period: "Jan 2023 - Jun 2023",
          detail: [
            "Built an Excel VBA application with UserForms that automated development release tracking, replacing a manual search through roughly 600 rows and 130 or more columns with dropdown selection and single-click lookup.",
            "Added separate interfaces for the German and Chinese markets, with forms to create, update and delete records and automatic write-back to the source sheet.",
            "Connected the tool to FREIPRO, the release system every department already used, so its records stayed in step with the company's; numerous departments adopted it.",
          ],
          tech: ["Excel VBA", "UserForms"],
        },
        {
          // October, not April. The onboarding pack is signed 31.08.2022, the
          // LfF insurance form stamped 26.09.2022, and the course this role
          // taught ran 05.10 to 13.10.2022. Nothing on disk supports April, so
          // the CV was corrected and this record follows it.
          id: "tum-numerical-methods",
          organization: "Technical University of Munich",
          title: "Student Research Assistant, Numerical Methods and Scientific Visualization",
          location: "Munich, Germany",
          period: "Oct 2022 - Dec 2022",
          detail: [
            "Taught the MATLAB labs of Introduction to Programming (MA0010) at the Chair of Numerical Mathematics, covering vectorisation, linear systems and 2D and 3D visualisation.",
          ],
          tech: ["MATLAB"],
        },
        // The IISER Bhopal summer internship was removed from the CV and is
        // removed here for the same reason: one surface claiming a role the
        // others do not is worse than the role being absent from all of them.
        // The public Battery-SOC-Estimation-ML repository is unaffected; it is
        // a project, not an employment record.
      ] as const satisfies readonly ExperienceRecord[],
      source: {
        tier: "approved-document",
        reference: `${recruiterCoreApproval}; sanitized practice descriptions under ${confidentialWorkApproval}; periods and locations from ${curriculumVitae}`,
      },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
    supportingIdentity: {
      value: "Mathematics and scientific computing foundations applied to reliable AI systems.",
      source: { tier: "approved-document", reference: recruiterCoreApproval },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
  },
  education: {
    records: {
      value: [
        {
          // The degree is conferred and the diploma is in hand, confirmed by the author on
          // 15 Oct 2026. Until then this record read "M.Sc. program:" with a status saying the
          // thesis had been submitted, which was the correct hedge while the award was pending
          // and is now simply wrong. The hedge is gone and the validator enforces its absence.
          id: "tum-mse",
          institution: "Technical University of Munich",
          credential: "M.Sc. Mathematics in Science and Engineering",
          location: "Munich, Germany",
          period: "2026",
        },
        {
          // The seminar belongs here rather than under research: it is a graded module of the
          // M.Sc., not independent work. The numerical companion to it is a public repository.
          id: "tum-seminar-nn-identification",
          institution: "Technical University of Munich",
          credential:
            "Advanced Seminar, Mathematics of Data Science: Identification of Neural Networks",
          location: "Munich, Germany",
          period: "2025",
          status:
            "With Prof. Massimo Fornasier and Dr. Alessandro Scagliotti. Presented 24 January 2025.",
        },
        {
          id: "amu-mathematics",
          institution: "Aligarh Muslim University",
          credential: "B.Sc. (Hons.) Mathematics",
          location: "Aligarh, India",
          period: "2021",
          status: "First Division",
        },
      ] as const satisfies readonly EducationRecord[],
      source: { tier: "approved-document", reference: recruiterCoreApproval },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
  },
  credentials: {
    certifications: {
      value: [
        {
          id: "dlai-neural-networks",
          title: "Neural Networks and Deep Learning",
          issuer: "DeepLearning.AI, Coursera",
          awarded: "Sep 2024",
          credentialUrl:
            "https://www.coursera.org/account/accomplishments/verify/WXJN8I5LFWO1",
        },
        {
          id: "dlai-improving-dnn",
          title:
            "Improving Deep Neural Networks: Hyperparameter Tuning, Regularization and Optimization",
          issuer: "DeepLearning.AI, Coursera",
          awarded: "Sep 2024",
          credentialUrl:
            "https://www.coursera.org/account/accomplishments/verify/KU9TUZBNRN9W",
        },
        {
          // Udemy's certificate page names the course in full. An earlier draft of the CV
          // shortened it to "Python for Data Analysis", which is not the name of anything Udemy
          // issued, so the full title is used.
          id: "udemy-python-data-analysis",
          title: "Data Science: Python for Data Analysis Full Bootcamp",
          issuer: "Udemy",
          awarded: "Aug 2024",
          credentialUrl:
            "https://www.udemy.com/certificate/UC-013e2d06-e241-4790-8468-580857efeae9/",
        },
        {
          id: "datacamp-intro-sql",
          title: "Introduction to SQL",
          issuer: "DataCamp",
          awarded: "Apr 2022",
          credentialUrl:
            "https://www.datacamp.com/statement-of-accomplishment/course/cc6f599bad4e14576d823664f8a722b75ee91f9e",
        },
        {
          id: "datacamp-intro-python",
          title: "Introduction to Python",
          issuer: "DataCamp",
          awarded: "Apr 2022",
          credentialUrl:
            "https://www.datacamp.com/statement-of-accomplishment/course/0a2ac762470c3c93bb40aa6c72f43416b713ef02",
        },
      ] as const satisfies readonly CredentialRecord[],
      // Titles and issuers are read off the issuers' own verification pages rather than off the
      // CV, which is why they outrank it as a source. The two DataCamp pages do not display a
      // completion date, so those two dates still come from the CV alone.
      source: {
        tier: "approved-document",
        reference: `Issuer verification pages, read 2026-10-15; DataCamp dates from ${curriculumVitae}`,
      },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
    volunteering: {
      value: [
        {
          id: "aiesec-munich",
          organization: "AIESEC in Munich",
          role: "Incoming Global Talent Volunteer",
          period: "Jun 2022 - Present",
          location: "Munich, Germany",
          summary:
            "Placement, onboarding and document coordination for international students and interns, and regular contact with host companies.",
        },
        {
          id: "eye-2023",
          organization: "#DiasporaVote!",
          role: "Delegate, #DiasporaVote! delegation",
          period: "Jun 2023",
          location: "Strasbourg, France",
          summary:
            "Took part in the European Youth Event (EYE 2023), the European Parliament's youth event, held at the Parliament in Strasbourg on 9 and 10 June 2023.",
          // Two certificates, two issuers, and the distinction is the reason this field exists.
          // Naming only the Parliament's would drop the delegation; naming only the delegation's
          // would leave the Parliament document unaccounted for.
          issuer:
            "Certificate of Achievement from #DiasporaVote!, signed Celine Fabrequette, CEO and Founder; Certificate of Participation from the European Parliament's Youth Outreach Unit, signed Magdalena Starostin, Head of Unit",
        },
      ] as const satisfies readonly VolunteeringRecord[],
      source: {
        tier: "approved-document",
        reference: `EYE 2023: Certificate of Achievement, #DiasporaVote!, signed Celine Fabrequette; and Certificate of Participation, Youth Outreach Unit of the European Parliament, signed Magdalena Starostin. AIESEC entry from ${curriculumVitae}`,
      },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
    languages: {
      value: [
        { id: "english", language: "English", level: "Full professional proficiency (C1)" },
        { id: "german", language: "German", level: "Elementary proficiency (A2), working toward B1" },
        { id: "hindi-urdu", language: "Hindi / Urdu", level: "Native / bilingual proficiency" },
      ] as const satisfies readonly LanguageRecord[],
      source: { tier: "approved-document", reference: curriculumVitae },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
  },
  thesis: {
    title: {
      value: "Uncertainty Quantification for Machine Learning Models in Transportation Policy Analysis",
      source: {
        tier: "immutable-artifact",
        reference: `${archivedThesisRepository}/blob/b324767c4dcfe6f1179069b1b751e4b995506306/thesis/submission_2026-05-15/extracted/Zamin_thesis.pdf`,
      },
      verifiedAt,
      public: true,
    },
    /*
     * This field describes the thesis, not the degree, and the two are not the
     * same fact. An earlier pass set it to "M.Sc. awarded" to clear the
     * no-hedging rule, which put the degree's state on the artifact and left
     * the source below describing something the value no longer said. The
     * thesis was submitted on 15 May 2026 and that is what the submission
     * record attests. The degree is stated plainly under Education, where a
     * reader looks for it, and `/research/thesis` prints this as a kicker over
     * the thesis itself, where "M.Sc. awarded" would have read as a category
     * error.
     */
    status: {
      value: "Master's thesis submitted",
      source: { tier: "immutable-artifact", reference: "Submitted thesis artifact and submission record" },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
    submittedOn: {
      value: "2026-05-15",
      source: { tier: "official-record", reference: "Thesis submission record (privately reviewed)" },
      verifiedAt,
      public: true,
    },
    institution: {
      value: "Technical University of Munich",
      source: { tier: "immutable-artifact", reference: "Submitted thesis title page" },
      verifiedAt,
      public: true,
    },
    school: {
      value: "TUM School of Computation, Information and Technology",
      source: { tier: "immutable-artifact", reference: "Submitted thesis title page" },
      verifiedAt,
      public: true,
    },
    department: {
      value: "Department of Computer Science",
      source: { tier: "immutable-artifact", reference: "Submitted thesis title page" },
      verifiedAt,
      public: true,
    },
    program: {
      value: "Mathematics in Science and Engineering",
      source: { tier: "official-record", reference: "TUM program record" },
      verifiedAt,
      public: true,
    },
    examiner: {
      value: "Prof. Dr. Stephan Günnemann",
      source: { tier: "immutable-artifact", reference: "Submitted thesis title page" },
      verifiedAt,
      public: true,
    },
    advisors: {
      value: "Dominik Fuchsgruber and Elena Natterer",
      source: { tier: "immutable-artifact", reference: "Submitted thesis title page" },
      verifiedAt,
      public: true,
    },
    repository: {
      value: canonicalThesisRepository,
      source: { tier: "profile", reference: "Canonical GitHub repository decision" },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
  },
  profiles: {
    domain: {
      value: "https://mzquadri.de",
      source: { tier: "profile", reference: "Production domain" },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
    github: {
      value: "https://github.com/mzquadri",
      source: { tier: "profile", reference: "Verified GitHub profile" },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
    linkedin: {
      value: "https://www.linkedin.com/in/mohdzaminquadri/",
      source: { tier: "profile", reference: "Verified LinkedIn profile" },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
    /**
     * The published address. It is the one already attached to public commit history, which
     * makes it both durable and already disclosed - the two objections that kept this field
     * null. The university address on the CV is deliberately not used: it expires with the
     * enrolment, and a portfolio outlives that.
     */
    email: {
      value: "mohdzaminquadri@gmail.com",
      source: { tier: "profile", reference: contactApproval },
      verifiedAt: "2026-09-13",
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
  },
  artifacts: {
    /**
     * The architecture case studies. A separate public repository and static site, written and
     * redaction-checked on its own terms; this site links to it rather than restating it.
     */
    architecture: {
      value: "https://mzquadri.github.io/ai-engineering-portfolio/",
      source: { tier: "public-copy", reference: "github.com/mzquadri/ai-engineering-portfolio" },
      verifiedAt: "2026-09-13",
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
    architectureRepository: {
      value: "https://github.com/mzquadri/ai-engineering-portfolio",
      source: { tier: "public-copy", reference: "Public repository" },
      verifiedAt: "2026-09-13",
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
    /*
     * There is no CV artifact here.
     *
     * A generated, web-safe PDF was published from this registry and has been withdrawn. The
     * facts it carried are unchanged and still published as pages: the roles and their periods,
     * education, the thesis, certifications and languages all live above and are rendered by
     * /about and /research. What is gone is the download, not the record.
     */
  },
  portfolio: {
    featuredProjectSlugs: {
      value: ["transport-uq", "mlops-reference-pipeline", "insureassist-rag", "hydrology-uq"] as const,
      source: { tier: "reproducible-evidence", reference: "Portfolio repository audit, 2026-08-20" },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
    servicesActive: {
      value: false,
      source: { tier: "approved-document", reference: "No public services offer approved" },
      verifiedAt,
      reviewAfter: currentFactReviewAfter,
      public: false,
    },
  },
} as const;

export const currentPublicFacts: readonly TruthFact<unknown>[] = [
  truthRegistry.identity.positioning,
  truthRegistry.professional.role,
  truthRegistry.professional.location,
  truthRegistry.professional.availability,
  truthRegistry.professional.employment,
  truthRegistry.professional.supportingIdentity,
  truthRegistry.education.records,
  truthRegistry.thesis.status,
  truthRegistry.thesis.repository,
  truthRegistry.profiles.domain,
  truthRegistry.profiles.github,
  truthRegistry.profiles.linkedin,
  truthRegistry.profiles.email,
  truthRegistry.artifacts.architecture,
  truthRegistry.portfolio.featuredProjectSlugs,
];

export const publishedFacts: readonly TruthFact<unknown>[] = [
  truthRegistry.identity.name,
  truthRegistry.identity.positioning,
  truthRegistry.professional.role,
  truthRegistry.professional.location,
  truthRegistry.professional.availability,
  truthRegistry.professional.employment,
  truthRegistry.professional.supportingIdentity,
  truthRegistry.education.records,
  truthRegistry.thesis.title,
  truthRegistry.thesis.status,
  truthRegistry.thesis.submittedOn,
  truthRegistry.thesis.institution,
  truthRegistry.thesis.school,
  truthRegistry.thesis.department,
  truthRegistry.thesis.program,
  truthRegistry.thesis.examiner,
  truthRegistry.thesis.advisors,
  truthRegistry.thesis.repository,
  truthRegistry.profiles.domain,
  truthRegistry.profiles.github,
  truthRegistry.profiles.linkedin,
  truthRegistry.profiles.email,
  truthRegistry.credentials.certifications,
  truthRegistry.credentials.languages,
  truthRegistry.artifacts.architecture,
  truthRegistry.artifacts.architectureRepository,
  truthRegistry.portfolio.featuredProjectSlugs,
];

export const site = {
  name: truthRegistry.identity.name.value,
  shortName: "MZQ",
  role: truthRegistry.professional.role.value,
  positioning: truthRegistry.identity.positioning.value,
  domain: truthRegistry.profiles.domain.value,
  description:
    "AI/ML engineer working across reliable ML, graph neural networks, scientific computing, and production-oriented AI systems.",
  location: truthRegistry.professional.location.value,
  availability: truthRegistry.professional.availability.value,
  supportingIdentity: truthRegistry.professional.supportingIdentity.value,
  experience: truthRegistry.professional.employment.value as readonly ExperienceRecord[],
  education: truthRegistry.education.records.value as readonly EducationRecord[],
  github: truthRegistry.profiles.github.value,
  linkedin: truthRegistry.profiles.linkedin.value,
  email: truthRegistry.profiles.email.value,
  certifications: truthRegistry.credentials.certifications.value as readonly CredentialRecord[],
  volunteering: truthRegistry.credentials.volunteering.value as readonly VolunteeringRecord[],
  languages: truthRegistry.credentials.languages.value as readonly LanguageRecord[],
  architecture: truthRegistry.artifacts.architecture.value,
  architectureRepository: truthRegistry.artifacts.architectureRepository.value,
} as const;

export const thesis = {
  title: truthRegistry.thesis.title.value,
  status: truthRegistry.thesis.status.value,
  submittedOn: truthRegistry.thesis.submittedOn.value,
  institution: truthRegistry.thesis.institution.value,
  school: truthRegistry.thesis.school.value,
  department: truthRegistry.thesis.department.value,
  program: truthRegistry.thesis.program.value,
  examiner: truthRegistry.thesis.examiner.value,
  advisors: truthRegistry.thesis.advisors.value,
  repository: truthRegistry.thesis.repository.value,
} as const;
