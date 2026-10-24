/**
 * CareerOS: where a weighted average stops being able to say the thing.
 *
 * A job search tool that reads employer applicant-tracking systems directly
 * and ranks what it finds. Its design principle is that almost nothing is
 * thrown away - four conditions reject a posting outright, and everything
 * else is a penalty, because a penalty is visible and arguable where a filter
 * is silent.
 *
 * That principle produced a specific and instructive failure. The score is a
 * weighted sum over seven components, so each component can only ever move
 * the total by its own weight. Two requirements are not like that: a role
 * demanding native German and a role on another continent are both simply
 * unavailable, however good the technical fit. A weighted term worth 13 or
 * 20 points cannot express "you cannot take this job", so both now carry a
 * flat penalty on top - and in each case the penalty is larger than the whole
 * term it sits beside.
 *
 * Every number here is read from `api/app/matching/engine.py` and the shipped
 * `config/profile.example.yml`, not from the prose around them.
 */

export const repository = "https://github.com/mzquadri/jobhunter";

export interface Weight {
  readonly key: string;
  readonly label: string;
  /** Share of the score, which is also the most points this term can contribute. */
  readonly weight: number;
  /** A flat deduction applied on top, where the weighted term could not carry the meaning. */
  readonly penalty?: number;
  readonly penaltyFor?: string;
}

/** Default weights in `MatchEngine`, with the flat penalties that sit beside two of them. */
export const weights: readonly Weight[] = [
  { key: "technical", label: "technical", weight: 26 },
  { key: "location", label: "location", weight: 20, penalty: 26, penaltyFor: "outside your tiers" },
  { key: "freshness", label: "freshness", weight: 16 },
  { key: "experience", label: "experience", weight: 15 },
  { key: "language", label: "language", weight: 13, penalty: 30, penaltyFor: "native German required" },
  { key: "domain", label: "domain", weight: 6 },
  { key: "education", label: "education", weight: 4 },
];

export const weightTotal = weights.reduce((t, w) => t + w.weight, 0);

/** The components whose penalty exceeds the term it belongs to. */
export const overridden = weights.filter((w) => w.penalty !== undefined && w.penalty > w.weight);

/** The widest bar the figure has to fit: a penalty, not a weight. */
export const axisMax = Math.max(...weights.map((w) => Math.max(w.weight, w.penalty ?? 0)));

export function percentOfAxis(value: number): number {
  return (value / axisMax) * 100;
}

/** The full language ladder, since the top of it is the point. */
export const languagePenalties = [
  { key: "b2", label: "German B2", points: 8 },
  { key: "c1", label: "German C1 and above", points: 22 },
  { key: "native", label: "German native", points: 30 },
] as const;

export const locationPenalties = [
  { key: "unmatched", label: "outside your tiers", points: 26 },
  { key: "unmatched_remote", label: "outside, but remote", points: 10 },
] as const;

/**
 * The only four conditions that discard a posting. Each answers "this
 * opportunity is unavailable or is not this profession", never "this
 * candidate is imperfect".
 */
export const rejections = [
  { key: "parttime", label: "not full-time", detail: "working-student, placement, VIE and PhD posts" },
  { key: "field", label: "not this field", detail: "judged from title and description together" },
  { key: "region", label: "clearly outside Europe", detail: "somewhere you could not take the job" },
  { key: "stale", label: "older than the age limit", detail: "applying is no longer worth the evening" },
] as const;

/** Adapters in the shipped configuration, with how many employers each reaches. */
export const adapters = [
  { key: "successfactors", employers: 19 },
  { key: "workday", employers: 19 },
  { key: "greenhouse", employers: 18 },
  { key: "smartrecruiters", employers: 14 },
  { key: "personio", employers: 7 },
  { key: "workable", employers: 3 },
  { key: "successfactors_search", employers: 3 },
  { key: "beesite", employers: 3 },
  { key: "lever", employers: 1 },
] as const;

export const employerCount = adapters.reduce((t, a) => t + a.employers, 0);
export const adapterCount = adapters.length;

/**
 * The probe the repository reports for its own configuration: every automated
 * employer was checked against its real endpoint before being written down.
 */
export const probe = { candidates: 279, missing: 102 } as const;
export const probeMissingShare = probe.missing / probe.candidates;

export const text = {
  probeShare: `${Math.round(probeMissingShare * 100)}%`,
} as const;
