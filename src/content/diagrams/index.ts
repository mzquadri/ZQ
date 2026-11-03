import { audiReleaseDiagram } from "./audi-release-tracking";
import { authorshipDiagram } from "./ai-engineering-portfolio";
import { batterySocDiagram } from "./battery-soc";
import { bm25JavaDiagram } from "./bm25-rrf-java";
import { cifarDiagram } from "./cifar10-cnn";
import { claimsThresholdDiagram } from "./insurance-claims-threshold";
import { driftPlatformDiagram } from "./drift-aware-platform";
import { eurostatDiagram } from "./eurostat-modal-split";
import { floodLstmDiagram } from "./flood-lstm";
import { hydrologyUqDiagram } from "./hydrology-uq";
import { identifiabilityDiagram } from "./nn-identifiability";
import { insureAssistDiagram } from "./insureassist-rag";
import { jobhunterDiagram } from "./jobhunter";
import { kerasPytorchDiagram } from "./keras-pytorch-parity";
import { legalKnowledgeDiagram } from "./legal-knowledge-platform";
import { mcpPolicyGatewayDiagram } from "./mcp-policy-gateway";
import { medicoDiagram } from "./medico";
import { mlopsPipelineDiagram } from "./mlops-reference-pipeline";
import { munichDiagram } from "./munich-accident-forecasting";
import { nlpTransformersDiagram } from "./nlp-transformers";
import { reliableKnowledgeDiagram } from "./reliable-knowledge-systems";
import { statLearnDiagram } from "./statistical-learning";
import { streamflowDiagram } from "./streamflow-forecasting";
import { supplyChainDiagram } from "./supply-chain";
import { transportUqDiagram } from "./transport-uq";
import { waterQualityDiagram } from "./water-quality";
import { weatherEdaDiagram } from "./weather-eda";
import type { ProjectDiagram } from "./types";

/**
 * Every architecture diagram, by slug.
 *
 * Deliberately a lookup that can miss. A project without a diagram renders its case study exactly
 * as it did before, which is what let these be added a few at a time and reviewed a few at a time
 * - the alternative, a required field on `Project`, would have meant writing all of them before
 * any of them could be looked at.
 *
 * `validate:content` checks each entry against the project it names: the tools a box claims must
 * appear in that project's own `tools`, and the boxes between them must cover every step of its
 * `workflow`. It also refuses a diagram whose edges cross a box, which is the one way these can be
 * wrong that no type catches. So the registry may be incomplete, but it cannot be wrong.
 *
 * The two standalone entries - `medico` and `reliable-knowledge-systems` - are not in the project
 * registry, so the tool and stage checks do not apply to them. They therefore declare neither
 * field rather than declaring an unchecked one.
 */
const DIAGRAMS: Readonly<Record<string, ProjectDiagram>> = {
  [transportUqDiagram.slug]: transportUqDiagram,
  [mcpPolicyGatewayDiagram.slug]: mcpPolicyGatewayDiagram,
  [reliableKnowledgeDiagram.slug]: reliableKnowledgeDiagram,
  [medicoDiagram.slug]: medicoDiagram,
  [insureAssistDiagram.slug]: insureAssistDiagram,
  [mlopsPipelineDiagram.slug]: mlopsPipelineDiagram,
  [hydrologyUqDiagram.slug]: hydrologyUqDiagram,
  [streamflowDiagram.slug]: streamflowDiagram,
  [cifarDiagram.slug]: cifarDiagram,
  [authorshipDiagram.slug]: authorshipDiagram,
  [jobhunterDiagram.slug]: jobhunterDiagram,
  [nlpTransformersDiagram.slug]: nlpTransformersDiagram,
  [statLearnDiagram.slug]: statLearnDiagram,
  [supplyChainDiagram.slug]: supplyChainDiagram,
  [weatherEdaDiagram.slug]: weatherEdaDiagram,
  [waterQualityDiagram.slug]: waterQualityDiagram,
  [claimsThresholdDiagram.slug]: claimsThresholdDiagram,
  [batterySocDiagram.slug]: batterySocDiagram,
  [identifiabilityDiagram.slug]: identifiabilityDiagram,
  [floodLstmDiagram.slug]: floodLstmDiagram,
  [audiReleaseDiagram.slug]: audiReleaseDiagram,
  [kerasPytorchDiagram.slug]: kerasPytorchDiagram,
  [eurostatDiagram.slug]: eurostatDiagram,
  [bm25JavaDiagram.slug]: bm25JavaDiagram,
  [munichDiagram.slug]: munichDiagram,
  [driftPlatformDiagram.slug]: driftPlatformDiagram,
  [legalKnowledgeDiagram.slug]: legalKnowledgeDiagram,
};

export function getDiagram(slug: string): ProjectDiagram | undefined {
  return DIAGRAMS[slug];
}

/** For the validator and the Mermaid / Draw.io exporter, which both walk all of them. */
export const allDiagrams: readonly ProjectDiagram[] = Object.values(DIAGRAMS);

export type { ProjectDiagram } from "./types";
