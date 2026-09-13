import type { IndexItem } from "@/components/index/PortfolioIndex";
import { PROJECT_WORLDS } from "@/components/cinema/project-worlds";

/**
 * The ordered lists of work, in two tiers.
 *
 * The same nine projects were previously described by four things at once - the homepage reel, the
 * exhibition index, the systems showcase and the work-page list - each with its own ordering and
 * its own copy. Four representations of one set is three too many: they drift, and a reader who
 * sees the same project introduced differently in two places trusts neither introduction.
 *
 * Copy is read from `PROJECT_WORLDS`, which already holds a title, a category and a one-line
 * question for every flagship, so this module orders and shapes rather than restates.
 *
 * The order is professional value, not chronology and not alphabet. Current engineering leads
 * because it is the work most readers arrive for; the thesis follows immediately because it is the
 * most thoroughly evidenced; the reference implementations and coursework close, in descending
 * order of what they can prove.
 *
 * The tier boundary is drawn where the evidence changes character, not where the subject does. A
 * reader ranks these lists whether or not the site helps them, and a site that declines to rank
 * its own work is asking every reader to do it from the titles alone.
 */

/**
 * The lead tier: employer engineering, the thesis, and the two applied systems that carry the most
 * evidence. These are what a hiring reader is looking for, so they are the first index on /work and
 * the top of the homepage index.
 */
const SELECTED_ORDER = [
  "reliable-knowledge-systems",
  "mcp-policy-gateway",
  "insureassist-rag",
  "transport-uq",
  "mlops-reference-pipeline",
] as const;

/**
 * The second tier: coursework, reference implementations and experiments. Real work with real
 * write-ups, and weaker evidence than the tier above - which is the reason they are named
 * separately rather than mixed in and left for the reader to rank.
 */
const SUPPORTING_ORDER = ["medico", "hydrology-uq", "streamflow-forecasting", "cifar10-cnn"] as const;

function fromWorlds(slugs: readonly string[]): readonly IndexItem[] {
  return slugs.flatMap((slug) => {
    const world = PROJECT_WORLDS[slug];
    if (!world) return [];
    return [
      {
        slug,
        title: world.title,
        kind: world.eyebrow,
        summary: world.question,
        href: world.href,
        accent: world.accent,
      },
    ];
  });
}

export const selectedItems: readonly IndexItem[] = fromWorlds(SELECTED_ORDER);
export const supportingItems: readonly IndexItem[] = fromWorlds(SUPPORTING_ORDER);

/** The homepage shows one index, so it wants both tiers in order. */
export const flagshipItems: readonly IndexItem[] = [...selectedItems, ...supportingItems];

const COVERED = new Set([...SELECTED_ORDER, ...SUPPORTING_ORDER] as readonly string[]);

/**
 * Registry projects that no world covers.
 *
 * There is normally one: the employer case study, which is authored and withheld from production
 * by the publication gate. It has no world, so without this it would be reviewable only by reading
 * the file. The caller passes the already-filtered `projects`, so the gate still decides what is
 * visible - this only makes what the gate allows reachable.
 */
export function registryItems(
  projects: readonly {
    slug: string;
    title: string;
    classification: string;
    summary: string;
  }[],
): readonly IndexItem[] {
  return projects
    .filter((project) => !COVERED.has(project.slug))
    .map((project) => ({
      slug: project.slug,
      title: project.title,
      kind: project.classification,
      summary: project.summary,
      href: `/work/${project.slug}`,
    }));
}
