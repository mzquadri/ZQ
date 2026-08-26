import type { EmployerConfidentialProject, Project } from "../src/content/portfolio";

/**
 * Publication rules for case studies about employer work.
 *
 * These live beside the validator rather than inside it so that the invalid cases can be tested
 * directly. A rule that is only ever exercised against content we already believe to be correct
 * is not a rule anybody has checked - see `tests/confidential-project.test.ts`, which feeds each
 * function content that is supposed to be rejected.
 *
 * The type in `src/content/portfolio.ts` already makes a confidential project with a repository
 * or an artifact link a compile error. The equivalent checks here are deliberate duplicates: the
 * type protects this repository, and these protect the published output if the content ever
 * arrives from somewhere the compiler does not see.
 */

/**
 * Endpoints, hosts and addresses that must never reach a public page.
 *
 * Identical to the expression already applied to sanitized experience descriptions in
 * `validate-content.ts`, extended with the remaining private-network suffixes. Kept narrow on
 * purpose: it matches a dotted suffix or a literal scheme, so ordinary prose containing the word
 * "local" or "internal" is unaffected.
 */
const ENDPOINT_PATTERN =
  /https?:|\bhttp\b|\b\d{1,3}(?:\.\d{1,3}){3}\b|localhost|\.(?:internal|local|lan|corp|intranet)\b/i;

/**
 * Any number of two digits or more.
 *
 * Employer scale - how many documents, gates, migrations, tests or records exist - carries no
 * portfolio value and is the disclosure most easily made by accident, so a confidential case
 * study publishes no numerals at all outside its year. Illustrative quantities are spelled as
 * words, which also stops a reader mistaking an example for a measurement. Single digits are
 * left alone so that product names such as Neo4j do not trip the rule.
 */
const MULTI_DIGIT_PATTERN = /\d{2,}/;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value: string) {
  return ISO_DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/** Every field of a confidential project that is rendered to a visitor, paired with its path. */
export function getPublicTextFields(project: EmployerConfidentialProject): Array<[string, string]> {
  const fields: Array<[string, string]> = [
    ["title", project.title],
    ["eyebrow", project.eyebrow],
    ["projectRole", project.projectRole],
    ["summary", project.summary],
    ["problem", project.problem],
    ["contribution", project.contribution],
    ["learned", project.learned],
  ];
  if (project.systemSummary) fields.push(["systemSummary", project.systemSummary]);
  if (project.nextStep) fields.push(["nextStep", project.nextStep]);
  project.workflow.forEach((step, index) => fields.push([`workflow[${index}]`, step]));
  project.tools.forEach((tool, index) => fields.push([`tools[${index}]`, tool]));
  project.quality.forEach((item, index) => fields.push([`quality[${index}]`, item]));
  project.limitations.forEach((item, index) => fields.push([`limitations[${index}]`, item]));
  project.evidence.forEach((metric, index) => {
    fields.push([`evidence[${index}].label`, metric.label]);
    fields.push([`evidence[${index}].value`, metric.value]);
    fields.push([`evidence[${index}].note`, metric.note]);
  });
  return fields;
}

/**
 * Everything wrong with one confidential case study, as messages in the validator's voice.
 *
 * Returns an empty array when the project is publishable-shaped. Whether it may actually be
 * published in this environment is a separate question, answered by
 * {@link getDraftPublicationIssue}.
 */
export function getConfidentialProjectIssues(project: EmployerConfidentialProject): string[] {
  const issues: string[] = [];
  const label = `${project.slug} (employer-confidential)`;

  if ("repository" in project && project.repository !== undefined) {
    issues.push(`${label} must not publish a repository link`);
  }
  if ("artifacts" in project && project.artifacts !== undefined) {
    issues.push(`${label} must not publish artifact links`);
  }

  for (const [path, text] of getPublicTextFields(project)) {
    if (ENDPOINT_PATTERN.test(text)) {
      issues.push(`${label} leaks an endpoint, host, or address in ${path}`);
    }
    if (MULTI_DIGIT_PATTERN.test(text)) {
      issues.push(`${label} publishes a numeric quantity in ${path}; employer scale is not published`);
    }
  }

  /*
   * An organisation name is checked for an endpoint but not for digits: a company may legitimately
   * have a number in its name, and that is not a disclosure of scale.
   */
  if (project.institution && ENDPOINT_PATTERN.test(project.institution)) {
    issues.push(`${label} leaks an endpoint, host, or address in institution`);
  }

  const publication = project.publication;
  if (publication.status === "draft") {
    if (publication.reason.trim().length === 0) {
      issues.push(`${label} is a draft without a stated reason`);
    }
  } else {
    if (publication.approval.trim().length === 0) {
      issues.push(`${label} claims approval without an approval reference`);
    }
    if (!isIsoDate(publication.verifiedAt)) {
      issues.push(`${label} has an invalid approval date`);
    }
    if (!isIsoDate(publication.reviewAfter)) {
      issues.push(`${label} has an invalid approval review date`);
    }
    if (isIsoDate(publication.verifiedAt) && isIsoDate(publication.reviewAfter)) {
      if (publication.reviewAfter < publication.verifiedAt) {
        issues.push(`${label} is due for review before it was approved`);
      }
    }
  }

  return issues;
}

/**
 * Whether a production build is about to publish something nobody approved.
 *
 * `projects` has already been filtered for the current environment, so an unapproved draft
 * appearing in it during a production build means the environment gate did not hold. This is the
 * check that has to be fail-closed, and it is the reason approval is a data question rather than
 * a deployment convention.
 */
export function getDraftPublicationIssue(
  renderedProjects: readonly Project[],
  vercelEnv: string | undefined,
): string | undefined {
  if (vercelEnv !== "production") return undefined;
  const unapproved = renderedProjects.filter(
    (project) => project.evidenceMode === "employer-confidential" && project.publication.status !== "approved",
  );
  if (unapproved.length === 0) return undefined;
  return `Production build would publish confidential case studies without approval: ${unapproved
    .map((project) => project.slug)
    .join(", ")}`;
}
