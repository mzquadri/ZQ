/**
 * The AI engineering graph rendered by the interactive systems visual.
 *
 * The graph is a technical claim, not decoration: it states how data becomes a model, how a
 * model becomes a service, and where the reliability decision sits. Every node is labelled
 * either "Evidenced" (a public case study or repository backs it) or "Direction" (an area of
 * study with no public artifact yet). Direction nodes must never be presented as delivered work.
 */

export type NodeStatus = "Evidenced" | "Direction";

export interface GraphStage {
  id: string;
  label: string;
  summary: string;
}

export interface GraphNode {
  id: string;
  label: string;
  stage: string;
  blurb: string;
  status: NodeStatus;
  href?: string;
  /** Position in graph space. x runs along the pipeline, y and z give the layout its depth. */
  x: number;
  y: number;
  z: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export const graphStages: readonly GraphStage[] = [
  { id: "data", label: "Data", summary: "Validated, fingerprinted, versioned inputs" },
  { id: "models", label: "Models", summary: "Trained approximations of an expensive process" },
  { id: "retrieval", label: "Retrieval & agents", summary: "Grounding a response in retrieved evidence" },
  { id: "production", label: "Production systems", summary: "Gates, registries, containers, and served contracts" },
  { id: "decisions", label: "Reliable decisions", summary: "Calibrated confidence and an explicit review path" },
];

export const graphNodes: readonly GraphNode[] = [
  {
    id: "data",
    label: "Data",
    stage: "data",
    blurb:
      "Schema and drift validation, hash-based versions, and features fitted once so training and serving see the same transformation.",
    status: "Evidenced",
    href: "/work/mlops-reference-pipeline",
    x: -2.2,
    y: 0,
    z: 0,
  },
  {
    id: "ml",
    label: "ML",
    stage: "models",
    blurb:
      "Supervised baselines with the unglamorous context kept next to the score: the subset, the epochs, the configuration, and the weak classes.",
    status: "Evidenced",
    href: "/work/cifar10-cnn",
    x: -1.1,
    y: 0.72,
    z: 0.55,
  },
  {
    id: "gnn",
    label: "GNN",
    stage: "models",
    blurb:
      "Graph surrogates that approximate a Paris-scale transport simulation in one forward pass instead of a full simulation run.",
    status: "Evidenced",
    href: "/work/transport-uq",
    x: -1.1,
    y: -0.72,
    z: -0.55,
  },
  {
    id: "rag",
    label: "RAG",
    stage: "retrieval",
    blurb:
      "Chunking, embeddings, and vector retrieval that return the source clause alongside the answer, so a claim can be checked against its evidence.",
    status: "Evidenced",
    href: "/work/insureassist-rag",
    x: 0,
    y: 0.78,
    z: -0.6,
  },
  {
    id: "agents",
    label: "Agents",
    stage: "retrieval",
    blurb:
      "Tool-using systems that plan across several retrieval and service calls. An active area of study for me, with no public project yet.",
    status: "Direction",
    x: 0,
    y: -0.78,
    z: 0.6,
  },
  {
    id: "mlops",
    label: "MLOps",
    stage: "production",
    blurb:
      "Experiment tracking, a promotion gate that can refuse a model, an immutable bundle registry, and a serving path that loads only approved bundles.",
    status: "Evidenced",
    href: "/work/mlops-reference-pipeline",
    x: 1.1,
    y: 0,
    z: 0,
  },
  {
    id: "reliable",
    label: "Reliable AI",
    stage: "decisions",
    blurb:
      "Uncertainty that ranks likely error, calibration that survives its own protocol, conformal intervals with a stated coverage, and a review queue for the rest.",
    status: "Evidenced",
    href: "/research/thesis",
    x: 2.2,
    y: 0,
    z: 0,
  },
];

export const graphEdges: readonly GraphEdge[] = [
  { from: "data", to: "ml" },
  { from: "data", to: "gnn" },
  { from: "data", to: "rag" },
  { from: "ml", to: "mlops" },
  { from: "ml", to: "reliable" },
  { from: "gnn", to: "mlops" },
  { from: "gnn", to: "reliable" },
  { from: "rag", to: "agents" },
  { from: "rag", to: "mlops" },
  { from: "agents", to: "mlops" },
  { from: "mlops", to: "reliable" },
];

/** Camera distance used by the perspective divide. Larger values flatten the projection. */
export const cameraDistance = 9;

export interface ProjectedPoint {
  x: number;
  y: number;
  depth: number;
  scale: number;
}

/**
 * Rotate a graph point around the Y then X axis and apply a perspective divide.
 * Shared by the static SVG fallback and the interactive canvas so both show the same geometry.
 */
export function projectPoint(
  node: { x: number; y: number; z: number },
  yaw: number,
  pitch: number,
  width: number,
  height: number,
  unit: number,
): ProjectedPoint {
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const rotatedX = node.x * cosYaw - node.z * sinYaw;
  const rotatedZ = node.x * sinYaw + node.z * cosYaw;

  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const rotatedY = node.y * cosPitch - rotatedZ * sinPitch;
  const depth = node.y * sinPitch + rotatedZ * cosPitch;

  const scale = cameraDistance / (cameraDistance - depth);

  return {
    x: width / 2 + rotatedX * scale * unit,
    y: height / 2 + rotatedY * scale * unit,
    depth,
    scale,
  };
}

/** Rotation used for the static fallback and as the interactive starting position. */
export const restingRotation = { yaw: 0.62, pitch: 0.3 } as const;

export function getNode(id: string) {
  return graphNodes.find((node) => node.id === id);
}

export function getStageNodes(stageId: string) {
  return graphNodes.filter((node) => node.stage === stageId);
}
