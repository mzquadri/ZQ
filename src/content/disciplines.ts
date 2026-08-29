import { site } from "./truth";

/**
 * Roles grouped by the discipline they exercised.
 *
 * The About page used to run these as a timeline: an ordered rail with a marker per role. Without
 * dates that rail said almost nothing - the order was the only information in it, and order is
 * exactly the thing a reader over-reads. Five roles in a line becomes a career narrative whether
 * or not one is intended.
 *
 * Grouped by discipline the same five records answer a more useful question: not when something
 * happened, but which kinds of work have actually been done more than once. Two of these
 * disciplines contain two roles each, and that repetition is the real signal.
 *
 * The records themselves are unchanged. Only approved titles and organizations are published; no
 * duty, date, client or impact figure is inferred from them, and the grouping is editorial
 * classification rather than a claim about any employer.
 */

export interface Discipline {
  id: string;
  name: string;
  /** What this discipline means here, in this portfolio's own terms. */
  summary: string;
  /** Ids from the employment record, in the order they read best - never chronological. */
  roleIds: readonly string[];
}

export const disciplines: readonly Discipline[] = [
  {
    id: "applied-ai",
    name: "Applied AI systems",
    summary:
      "Retrieval, verification and the engineering around a model rather than the model alone: storage that suits the question, and a service whose output can be checked against its own evidence.",
    roleIds: ["bp-itcs"],
  },
  {
    id: "scientific-computing",
    name: "Numerical methods and scientific visualization",
    summary:
      "The discipline underneath the rest of this portfolio. Numerical behaviour, and making a computed result legible to the person who has to judge it.",
    roleIds: ["tum-numerical-methods", "tum-programming-visualization"],
  },
  {
    id: "ml-research",
    name: "Machine learning research",
    summary:
      "Estimating a quantity that is not directly measurable, and being careful about what the estimate can support. The battery work is the earliest instance of the question the thesis later formalised.",
    roleIds: ["iiser-battery-ml"],
  },
  {
    id: "data-engineering",
    name: "Data and workflow engineering",
    summary:
      "Moving data between systems that were not designed to talk to each other, which is where most of the practical difficulty in an ML pipeline actually lives.",
    roleIds: ["audi-workflows-databases"],
  },
];

export function getDisciplines() {
  return disciplines.map((discipline) => ({
    ...discipline,
    roles: discipline.roleIds.map(
      (id) => site.experience.find((record) => record.id === id)!,
    ),
  }));
}
