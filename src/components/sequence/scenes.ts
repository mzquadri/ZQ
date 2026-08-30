import { cifar } from "./scenes/cifar";
import { hydrology } from "./scenes/hydrology";
import { insureassist } from "./scenes/insureassist";
import { medico } from "./scenes/medico";
import { mlops } from "./scenes/mlops";
import { reliableKnowledge } from "./scenes/reliable-knowledge";
import { streamflow } from "./scenes/streamflow";
import { transport } from "./scenes/transport";
import type { SceneDefinition } from "./scene";

/**
 * The reel, keyed by chapter.
 *
 * All eight flagships are here. Each is a separate module because each is a separate drawing: they
 * share the surface, the staging helpers and the plate-aware composition box, and share no
 * composition, camera, palette, object or beat count. A graph opening into depth, an orthogonal
 * store diagram, a near-monochrome light box, three identical documents, one artifact on a track, a
 * rating curve with intervals projected through it, a ribbon of time, and a matrix.
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
};
