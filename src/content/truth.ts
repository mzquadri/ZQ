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
 * Contact and document publication were both previously withheld, the email for want of a
 * durable address and the CV after a private PDF was found to be reachable from a public
 * repository. Both are now approved: the address below is the one already attached to public
 * commit history, and the published CV is generated for the web rather than being the private
 * document.
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
          period: "Apr 2025 - Present",
          practice:
            "Built verification workflows for a multilingual legal knowledge platform using relational, vector, and graph storage.",
        },
        {
          id: "tum-programming-visualization",
          organization: "Technical University of Munich",
          title: "Student Research Assistant / Programming and Visualization",
          location: "Munich, Germany",
          period: "Aug 2023 - Mar 2024",
        },
        {
          id: "audi-workflows-databases",
          organization: "AUDI AG",
          title: "Intern, Programming of Workflows and Linking of Databases",
          location: "Ingolstadt, Germany",
          period: "Jan 2023 - Jun 2023",
        },
        {
          id: "tum-numerical-methods",
          organization: "Technical University of Munich",
          title: "Student Research Assistant, Numerical Methods and Scientific Visualization",
          location: "Munich, Germany",
          period: "Apr 2022 - Dec 2022",
        },
        {
          id: "iiser-battery-ml",
          organization: "IISER Bhopal",
          title: "Summer Research Intern, Machine Learning for Li-ion Battery State Estimation",
          location: "Bhopal, India",
          period: "May 2021 - Jul 2021",
        },
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
          id: "tum-mse",
          institution: "Technical University of Munich",
          credential: "M.Sc. program: Mathematics in Science and Engineering",
          location: "Munich, Germany",
          period: "2026",
          status: "Master's thesis submitted",
        },
        {
          id: "amu-mathematics",
          institution: "Aligarh Muslim University",
          credential: "B.Sc. (Hons.) Mathematics",
          location: "Aligarh, India",
          period: "2021",
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
        },
        {
          id: "dlai-improving-dnn",
          title:
            "Improving Deep Neural Networks: Hyperparameter Tuning, Regularization and Optimization",
          issuer: "DeepLearning.AI, Coursera",
          awarded: "Sep 2024",
        },
      ] as const satisfies readonly CredentialRecord[],
      source: { tier: "approved-document", reference: curriculumVitae },
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
    /**
     * The published CV. It is generated for the web from the facts in this registry, not a copy
     * of the private document: no phone number, no street address, no photograph.
     */
    cv: {
      value: "/mohd-zamin-quadri-cv.pdf",
      source: { tier: "approved-document", reference: contactApproval },
      verifiedAt: "2026-09-13",
      reviewAfter: currentFactReviewAfter,
      public: true,
    },
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
  truthRegistry.artifacts.cv,
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
  truthRegistry.artifacts.cv,
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
  languages: truthRegistry.credentials.languages.value as readonly LanguageRecord[],
  architecture: truthRegistry.artifacts.architecture.value,
  architectureRepository: truthRegistry.artifacts.architectureRepository.value,
  cv: truthRegistry.artifacts.cv.value,
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
