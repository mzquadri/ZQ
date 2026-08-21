import { ecosystemRepositories, ecosystemSnapshot } from "./ecosystem";
import { getProject } from "./portfolio";
import { thesisResearchPath } from "./research";

/**
 * Current engineering focus.
 *
 * Every entry must point at something already public: a repository, a case study, a research
 * record, or a published article. Nothing here describes private, employer-confidential, or
 * speculative activity, and no entry may imply progress that is not visible in a public artifact.
 */

export interface FocusTheme {
  id: string;
  title: string;
  summary: string;
  evidence: readonly { label: string; href: string }[];
}

export interface BuildingThread {
  id: string;
  /** Repository name from the ecosystem snapshot. */
  repository: string;
  /** The next milestone that would raise this repository's evidence level. */
  nextEvidenceGate: string;
}

export const focusThemes: readonly FocusTheme[] = [
  {
    id: "reliable-ai",
    title: "Reliable AI",
    summary:
      "Deciding when a model's output is good enough to act on: ranking likely error, calibrating uncertainty, building conformal intervals, and routing the rest to human review.",
    evidence: [
      { label: "Thesis research record", href: thesisResearchPath },
      { label: "Transport surrogate case study", href: "/work/transport-uq" },
      { label: "Selective prediction tutorial", href: "/learn/selective-prediction-when-models-should-abstain" },
    ],
  },
  {
    id: "grounded-systems",
    title: "Grounded AI systems",
    summary:
      "Retrieval that returns its sources, generation constrained by what was retrieved, and a typed service contract around both so the answer and its evidence travel together.",
    evidence: [{ label: "InsureAssist RAG service", href: "/work/insureassist-rag" }],
  },
  {
    id: "production-path",
    title: "The path to production",
    summary:
      "Treating each pipeline stage as a contract: data validated and fingerprinted, features fitted once and reused, evaluation controlling promotion, and only approved bundles served.",
    evidence: [{ label: "MLOps reference pipeline", href: "/work/mlops-reference-pipeline" }],
  },
];

export const buildingThreads: readonly BuildingThread[] = [
  {
    id: "zq-platform",
    repository: "ZQ",
    nextEvidenceGate:
      "Extending this platform: a typed public-repository snapshot, an interactive systems graph, and a broader project surface beyond the case studies.",
  },
  {
    id: "mlops-licensed-run",
    repository: "MLOps-End-to-End-Pipeline",
    nextEvidenceGate:
      getProject("mlops-reference-pipeline")?.nextStep ??
      "A reproducible licensed-data run with a published bundle and container integration test.",
  },
  {
    id: "rag-evaluation",
    repository: "insureassist-rag-mlops",
    nextEvidenceGate:
      "Adding real unit and integration tests plus a defensible retrieval evaluation before this moves from prototype to flagship work.",
  },
  {
    id: "thesis-replication",
    repository: "ml-surrogates-thesis",
    nextEvidenceGate:
      getProject("transport-uq")?.nextStep ??
      "A replication that fits preprocessing only on training data and tests transfer across networks.",
  },
];

export function getBuildingThreads() {
  return buildingThreads.map((thread) => ({
    ...thread,
    detail: ecosystemRepositories.find((repository) => repository.name === thread.repository)!,
  }));
}

export const focusReviewedAt = ecosystemSnapshot.observedAt;
