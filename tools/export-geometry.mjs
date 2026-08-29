/**
 * Dump the cinematic geometry to JSON so the offline frame renderer and the site read the same
 * numbers. Without this the renderer would need its own copy of the graph generator, and the two
 * would drift the first time either changed.
 *
 * Usage: npx tsx tools/export-geometry.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { graphNodes, graphEdges, graphMaxHop, GRAPH } from "../src/content/cinema-geometry.ts";

mkdirSync("tools/.geometry", { recursive: true });
writeFileSync(
  "tools/.geometry/graph.json",
  JSON.stringify({ GRAPH, graphMaxHop, nodes: graphNodes, edges: graphEdges }, null, 1),
);
console.log(`nodes ${graphNodes.length}  edges ${graphEdges.length}  maxHop ${graphMaxHop}`);
