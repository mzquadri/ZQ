import {
  getEcosystemHighlights,
  repositoryUrl,
  type EcosystemCategory,
  type EcosystemRepository,
} from "./ecosystem";

/**
 * Repository assemblies for the exploded-view showcase.
 *
 * This module is a pure mapping. Every part label is a string that already exists in
 * `ecosystem.ts`; nothing here writes copy, invents a tag, or pads an assembly to a
 * uniform part count. A repository with four focus areas gets fewer parts than one with
 * five, which is the honest shape of the registry.
 *
 * It imports nothing from three.js so it stays usable on the server, where the fallback
 * strip is rendered.
 */

export type PartKind = "stack" | "category" | "boundary";

export interface AssemblyPart {
  id: string;
  /** The registry string this part represents, shown verbatim. */
  label: string;
  kind: PartKind;
  /** Unit vector the part travels along when the assembly explodes. */
  axis: readonly [number, number, number];
  /** Resting position in the assembled form. */
  rest: readonly [number, number, number];
}

export interface RepoAssembly {
  name: string;
  title: string;
  category: EcosystemCategory;
  language: string;
  description: string;
  boundary: string;
  href: string;
  caseStudyHref?: string;
  parts: readonly AssemblyPart[];
}

/** Cap declared by the showcase brief; the highlight set is already four. */
const MAX_ASSEMBLIES = 4;

/**
 * Scene framing.
 *
 * These live here, beside the layout they constrain, so `tests/assembly.test.ts` can
 * prove that a fully separated assembly still fits the camera frustum without loading
 * three.js. They were derived rather than guessed: the test sweeps the whole progress
 * range at the narrowest band aspect the island can produce, and an earlier set of
 * values clipped parts off both side edges and the bottom.
 */
export const SCENE = {
  /** Distance between assembly centres along x. */
  spacing: 3,
  /** How far a part travels from rest at full separation. */
  explode: 1.05,
  camera: { fov: 38, y: -0.12, z: 9.7 },
  /** Half-extent of each part kind, used for bounds only. */
  halfExtent: { stack: 0.2, category: 0.86, boundary: 1.12 },
} as const;

/** Worst-case extent of every part across the whole scroll range. */
export function sceneBounds(assemblies: readonly RepoAssembly[]) {
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  for (let step = 0; step <= 100; step += 1) {
    const spread = Math.sin((step / 100) * Math.PI);
    assemblies.forEach((assembly, index) => {
      const centre = (index - (assemblies.length - 1) / 2) * SCENE.spacing;
      for (const part of assembly.parts) {
        const length = Math.hypot(...part.axis) || 1;
        const x = centre + part.rest[0] + (part.axis[0] / length) * spread * SCENE.explode;
        const y = part.rest[1] + (part.axis[1] / length) * spread * SCENE.explode;
        const half = SCENE.halfExtent[part.kind];
        maxX = Math.max(maxX, Math.abs(x) + half);
        minY = Math.min(minY, y - half);
        maxY = Math.max(maxY, y + half);
      }
    });
  }

  return { maxX, minY, maxY };
}

/**
 * Stack parts sit on a ring so they separate cleanly in every direction. The category
 * plate sits under the ring and the boundary shell encloses it, which mirrors what they
 * mean: the category is what the work rests on, the boundary is what contains it.
 */
function buildParts(repository: EcosystemRepository): AssemblyPart[] {
  const parts: AssemblyPart[] = [];
  const count = repository.topics.length;

  repository.topics.forEach((topic, index) => {
    const angle = (index / count) * Math.PI * 2;
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    // Alternating height keeps the assembled form from reading as a flat disc.
    const y = index % 2 === 0 ? 0.16 : -0.16;
    parts.push({
      id: `${repository.name}-stack-${index}`,
      label: topic,
      kind: "stack",
      axis: [x, y * 2.4, z],
      rest: [x * 0.52, y, z * 0.52],
    });
  });

  parts.push({
    id: `${repository.name}-category`,
    label: repository.category,
    kind: "category",
    axis: [0, -1, 0],
    rest: [0, -0.5, 0],
  });

  parts.push({
    id: `${repository.name}-boundary`,
    label: repository.boundary,
    kind: "boundary",
    axis: [0, 1, 0],
    rest: [0, 0, 0],
  });

  return parts;
}

export function getRepoAssemblies(): RepoAssembly[] {
  return getEcosystemHighlights()
    .slice(0, MAX_ASSEMBLIES)
    .map((repository) => ({
      name: repository.name,
      title: repository.title,
      category: repository.category,
      language: repository.language,
      description: repository.description,
      boundary: repository.boundary,
      href: repositoryUrl(repository),
      caseStudyHref: repository.caseStudySlug ? `/work/${repository.caseStudySlug}` : undefined,
      parts: buildParts(repository),
    }));
}

/**
 * Theme tokens only. The canvas reads these off the container's computed style so the
 * 3D layer cannot drift away from the rest of the palette.
 */
export const CATEGORY_TOKEN: Record<EcosystemCategory, string> = {
  Featured: "--teal",
  Active: "--orange",
  Engineering: "--ink-soft",
  Research: "--teal-dark",
  Experiment: "--line-strong",
  Reference: "--ink-soft",
};

export const PART_KIND_LABEL: Record<PartKind, string> = {
  stack: "Focus area",
  category: "Portfolio status",
  boundary: "Evidence boundary",
};
