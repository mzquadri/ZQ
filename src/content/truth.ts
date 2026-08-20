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
  status?: "Present";
}

export interface EducationRecord {
  id: string;
  institution: string;
  credential: string;
  status?: string;
}

const verifiedAt = "2026-08-20";
const currentFactReviewAfter = "2026-11-20";
const canonicalThesisRepository = "https://github.com/mzquadri/ml-surrogates-thesis";
const recruiterCoreApproval = "Recruiter Core v1 fact approval, 2026-08-20";

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
          location: "Munich",
          status: "Present",
        },
        {
          id: "tum-programming-visualization",
          organization: "Technical University of Munich",
          title: "Student Research Assistant / Programming and Visualization",
        },
        {
          id: "audi-workflows-databases",
          organization: "AUDI AG",
          title: "Intern, Programming of Workflows and Linking of Databases",
        },
        {
          id: "tum-numerical-methods",
          organization: "Technical University of Munich",
          title: "Student Research Assistant, Numerical Methods and Scientific Visualization",
        },
        {
          id: "iiser-battery-ml",
          organization: "IISER Bhopal",
          title: "Summer Research Intern, Machine Learning for Li-ion Battery State Estimation",
        },
      ] as const satisfies readonly ExperienceRecord[],
      source: { tier: "approved-document", reference: recruiterCoreApproval },
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
          status: "Master's thesis submitted May 15, 2026",
        },
        {
          id: "amu-mathematics",
          institution: "Aligarh Muslim University",
          credential: "B.Sc. (Hons.) Mathematics",
        },
      ] as const satisfies readonly EducationRecord[],
      source: { tier: "approved-document", reference: recruiterCoreApproval },
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
        reference: `${canonicalThesisRepository}/blob/4b95a3d8aca5929bb88b84bb7f7ae86c48e2f428/document/main.pdf`,
      },
      verifiedAt,
      public: true,
    },
    status: {
      value: "Master's thesis submitted May 15, 2026",
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
    email: {
      value: null,
      source: { tier: "approved-document", reference: "No durable email approved for publication" },
      verifiedAt,
      public: false,
    },
  },
  resume: {
    canonical: {
      value: {
        htmlPath: "/resume",
        pdfPath: "/mohd-zamin-quadri-resume.pdf",
        label: "Mohd Zamin Quadri resume",
      },
      source: { tier: "approved-document", reference: "Recruiter Core v1 canonical resume decision" },
      verifiedAt,
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
  truthRegistry.resume.canonical,
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
  truthRegistry.resume.canonical,
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
  resume: truthRegistry.resume.canonical.value,
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
