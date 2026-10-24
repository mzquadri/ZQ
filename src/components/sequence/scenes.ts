import { authorship } from "./scenes/authorship";
import { battery } from "./scenes/battery";
import { career } from "./scenes/career";
import { cifar } from "./scenes/cifar";
import { claims } from "./scenes/claims";
import { driftScene } from "./scenes/drift";
import { flood } from "./scenes/flood";
import { gateway } from "./scenes/gateway";
import { hydrology } from "./scenes/hydrology";
import { identifiability } from "./scenes/identifiability";
import { insureassist } from "./scenes/insureassist";
import { medico } from "./scenes/medico";
import { modalSplit } from "./scenes/modalsplit";
import { mlops } from "./scenes/mlops";
import { munich } from "./scenes/munich";
import { nlp } from "./scenes/nlp";
import { reliableKnowledge } from "./scenes/reliable-knowledge";
import { parityScene } from "./scenes/parity";
import { release } from "./scenes/release";
import { statlearn } from "./scenes/statlearn";
import { streamflow } from "./scenes/streamflow";
import { supply } from "./scenes/supply";
import { transport } from "./scenes/transport";
import { translation } from "./scenes/translation";
import { water } from "./scenes/water";
import { weather } from "./scenes/weather";
import type { SceneDefinition } from "./scene";

/**
 * Every work page's scene, keyed by slug.
 *
 * Each is a separate module because each is a separate drawing: they share the surface, the
 * staging helpers and the plate-aware composition box, and share no composition, camera, palette,
 * object or beat count. A graph opening into depth, an orthogonal store diagram, a near-monochrome
 * light box, three identical documents, one artifact on a track, a rating curve with intervals
 * projected through it, a ribbon of time, a matrix, a boundary standing between two processes, and
 * one axis of rows cut eight different ways.
 *
 * This began as the nine homepage chapters and is now the whole catalogue, because a page without
 * an entry here has no scrubbed scene stage, no scene still in its hero and no object in the band
 * that offers it onward - three absences with one cause. `tests/portfolio.spec.ts` fails if a work
 * page is missing from this table.
 */
export const SCENES: Readonly<Record<string, SceneDefinition>> = {
  "transport-uq": transport,
  "reliable-knowledge-systems": reliableKnowledge,
  medico,
  "insureassist-rag": insureassist,
  "mlops-reference-pipeline": mlops,
  "hydrology-uq": hydrology,
  "streamflow-forecasting": streamflow,
  "cifar10-cnn": cifar,
  "mcp-policy-gateway": gateway,
  "drift-aware-platform": driftScene,
  "water-quality": water,
  "insurance-claims-threshold": claims,
  "weather-eda": weather,
  "supply-chain": supply,
  "statistical-learning": statlearn,
  "nlp-transformers": nlp,
  "nn-identifiability": identifiability,
  "flood-lstm": flood,
  "audi-release-tracking": release,
  "keras-pytorch-parity": translation,
  "bm25-rrf-java": parityScene,
  "eurostat-modal-split": modalSplit,
  "munich-accident-forecasting": munich,
  "battery-soc": battery,
  jobhunter: career,
  "ai-engineering-portfolio": authorship,
};
