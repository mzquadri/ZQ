import { network } from "@/components/thesis-world/geometry";
import { places } from "@/content/world-atlas";

/**
 * The ground the world stands on, and the shapes that stand on it.
 *
 * The road network is the one the thesis scene already draws, reused rather
 * than redrawn so the two cannot disagree about the city: a radial and orbital
 * layout at the scale of a Paris MATSim scenario, deterministic from an integer
 * hash so the server, the browser and a screen recording all get the same city.
 *
 * Here it is laid out flat and far wider, because it is terrain now rather than
 * a diagram, and each place is given a built form whose geometry says what the
 * place does. None of this is decoration for its own sake: a stack is three
 * stores, a gate is a boundary something passes through, a grid is a spreadsheet.
 */

export const GROUND_SCALE = 1.9;

/** Flat positions of every road junction, scaled out to terrain size. */
export const junctions = network.nodes.map((node) => ({
  x: node.x * GROUND_SCALE,
  z: node.z * GROUND_SCALE,
  hop: node.hop,
  a: node.a,
}));

/** Every road, as a pair of junction indices. */
export const roads = network.edges;

/**
 * Line vertices for the whole network, as one flat array.
 *
 * One `LineSegments` for the entire city rather than a mesh per road: at six
 * hundred-odd roads, a draw call each is the difference between a world that
 * turns smoothly on a laptop and one that does not.
 */
export function roadVertices(lift: (hop: number, a: number) => number) {
  const out = new Float32Array(roads.length * 6);
  roads.forEach(([u, v], i) => {
    const A = junctions[u];
    const B = junctions[v];
    out[i * 6 + 0] = A.x;
    out[i * 6 + 1] = lift(A.hop, A.a);
    out[i * 6 + 2] = A.z;
    out[i * 6 + 3] = B.x;
    out[i * 6 + 4] = lift(B.hop, B.a);
    out[i * 6 + 5] = B.z;
  });
  return out;
}

/**
 * How high the ground sits under a junction.
 *
 * A dead-flat plane reads as a diagram; a little relief reads as a place. The
 * relief is a function of hop distance and the junction's own deterministic
 * draw, so it is the same every time and it slopes gently down from the centre,
 * which puts the thesis on the high ground it sits on in the story.
 */
export function groundLift(hop: number, a: number) {
  const fall = -0.055 * hop;
  const roll = Math.sin(hop * 1.7 + a * 6.2) * 0.045;
  return fall + roll;
}

/** Height of the ground under an arbitrary point, by nearest junction. */
export function liftAt(x: number, z: number) {
  let best = junctions[0];
  let bestD = Infinity;
  for (const j of junctions) {
    const d = (j.x - x) ** 2 + (j.z - z) ** 2;
    if (d < bestD) {
      bestD = d;
      best = j;
    }
  }
  return groundLift(best.hop, best.a);
}

/** Each place, with the ground height under it resolved once. */
/* Pulled in from the rim. At the full scale the two widest places stood past
 * the last ring and read as being outside the city rather than in it. */
const SITE_INSET = 0.86;

export const sites = places.map((place) => {
  const x = place.at[0] * GROUND_SCALE * SITE_INSET;
  const z = place.at[1] * GROUND_SCALE * SITE_INSET;
  return { place, x, z, y: liftAt(x, z) };
});

export type Site = (typeof sites)[number];

/** A ring of junctions near a place, used to light the roads around it. */
export function nearbyRoads(x: number, z: number, radius: number) {
  const near = new Set<number>();
  junctions.forEach((j, i) => {
    if ((j.x - x) ** 2 + (j.z - z) ** 2 < radius * radius) near.add(i);
  });
  return roads.filter(([u, v]) => near.has(u) || near.has(v));
}
