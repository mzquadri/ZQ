import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  getConfidentialProjectIssues,
  getDraftPublicationIssue,
  getPublicTextFields,
} from "../scripts/confidential-content";
import {
  allProjects,
  isEmployerConfidential,
  isPublishable,
  type EmployerConfidentialProject,
  type Project,
} from "../src/content/portfolio";

/*
 * Every rule that protects employer-confidential content is exercised here against content it is
 * supposed to reject. A rule only ever run over material we already believe to be correct has
 * never actually been tested, and this is the one part of the site where finding that out later
 * is expensive.
 */

const CONFIDENTIAL_SLUG = "legal-knowledge-platform";

/** A minimal confidential project that passes every rule, used as the base for each violation. */
function validConfidentialProject(): EmployerConfidentialProject {
  return {
    slug: "example-confidential",
    title: "Stored is not the same as correct",
    eyebrow: "Verification for a corpus",
    classification: "Employer engineering",
    evidenceMode: "employer-confidential",
    publication: { status: "draft", reason: "No approval has been requested." },
    authors: [{ name: "Example Author" }],
    projectRole: "Engineer on the verification services",
    summary: "A summary that says what the work established without naming anything internal.",
    problem: "A problem statement written in generic terms.",
    contribution: "A contribution statement that separates what was owned from what pre-existed.",
    systemSummary: "Generic roles rather than internal service names.",
    workflow: ["Capture the published document", "Measure the stored result against it"],
    tools: ["Python", "Neo4j", "BGE-M3 embeddings"],
    evidence: [
      {
        label: "Independent representations",
        value: "Three",
        note: "Relational, vector and graph. Their agreement is measured rather than assumed.",
      },
    ],
    quality: ["A recorded verdict has to carry the value it measured."],
    limitations: ["Fidelity is not authority."],
    learned: "The instrument was allowed to invalidate the reading of the person who built it.",
  };
}

test("a well-formed confidential project raises no issues", () => {
  assert.deepEqual(getConfidentialProjectIssues(validConfidentialProject()), []);
});

test("a confidential project may not publish a repository link", () => {
  const project = { ...validConfidentialProject(), repository: "https://github.com/example/repo" };
  const issues = getConfidentialProjectIssues(project as unknown as EmployerConfidentialProject);
  assert.ok(
    issues.some((issue) => issue.includes("must not publish a repository link")),
    `expected a repository issue, got: ${issues.join(" | ")}`,
  );
});

test("a confidential project may not publish artifact links", () => {
  const project = {
    ...validConfidentialProject(),
    artifacts: [{ label: "Report", href: "https://github.com/example/repo/blob/main/a.md", note: "n" }],
  };
  const issues = getConfidentialProjectIssues(project as unknown as EmployerConfidentialProject);
  assert.ok(
    issues.some((issue) => issue.includes("must not publish artifact links")),
    `expected an artifact issue, got: ${issues.join(" | ")}`,
  );
});

const endpointViolations: ReadonlyArray<[string, string]> = [
  ["an absolute URL", "Documented at https://example.internal/docs for the team."],
  ["a bare scheme", "The service exposes an http endpoint for readiness."],
  ["an IPv4 address", "The broker answered on 10.0.12.4 during the replay."],
  ["localhost", "Reproduce it by pointing the client at localhost."],
  ["an internal domain suffix", "Images are pulled from registry.internal by the runner."],
  ["a private LAN suffix", "The node was reachable as builder.lan at the time."],
  ["a corporate suffix", "Credentials come from vault.corp for that environment."],
];

for (const [description, text] of endpointViolations) {
  test(`a confidential project is rejected for ${description}`, () => {
    const project = { ...validConfidentialProject(), summary: text };
    const issues = getConfidentialProjectIssues(project);
    assert.ok(
      issues.some((issue) => issue.includes("leaks an endpoint, host, or address in summary")),
      `expected an endpoint issue for ${description}, got: ${issues.join(" | ")}`,
    );
  });
}

const innocentProse: ReadonlyArray<[string, string]> = [
  ["the word local", "The check runs against a local copy of the captured evidence."],
  ["the word internal", "An internal inconsistency between two stores is reported, never repaired."],
  ["the word corporation", "The publisher is a government body rather than a corporation."],
  ["a single digit in a product name", "Records are written to Neo4j and embedded with BGE-M3."],
];

for (const [description, text] of innocentProse) {
  test(`ordinary prose containing ${description} is not rejected`, () => {
    const project = { ...validConfidentialProject(), summary: text };
    assert.deepEqual(getConfidentialProjectIssues(project), []);
  });
}

test("an organisation name is checked for an endpoint but not for digits", () => {
  const leaking = { ...validConfidentialProject(), institution: "Example GmbH, docs.internal" };
  assert.ok(
    getConfidentialProjectIssues(leaking).some((issue) => issue.includes("in institution")),
    "an endpoint in the organisation name must be rejected",
  );

  const numbered = { ...validConfidentialProject(), institution: "Example 24 GmbH" };
  assert.deepEqual(
    getConfidentialProjectIssues(numbered),
    [],
    "a number in an organisation name is not a disclosure of scale",
  );
});

test("a confidential project may not publish a quantity in an evidence value", () => {
  const project = validConfidentialProject();
  const issues = getConfidentialProjectIssues({
    ...project,
    evidence: [{ label: "Verification gates", value: "13", note: "Every gate that applies to a document." }],
  });
  assert.ok(
    issues.some((issue) => issue.includes("publishes a numeric quantity in evidence[0].value")),
    `expected a quantity issue, got: ${issues.join(" | ")}`,
  );
});

test("a confidential project may not publish a corpus size in prose", () => {
  const project = { ...validConfidentialProject(), problem: "The corpus holds 29 documents today." };
  const issues = getConfidentialProjectIssues(project);
  assert.ok(
    issues.some((issue) => issue.includes("publishes a numeric quantity in problem")),
    `expected a quantity issue, got: ${issues.join(" | ")}`,
  );
});

test("the quantity rule reaches every rendered field", () => {
  const project = validConfidentialProject();
  const fields = getPublicTextFields(project).map(([path]) => path);
  for (const expected of [
    "title",
    "eyebrow",
    "projectRole",
    "summary",
    "problem",
    "contribution",
    "learned",
    "systemSummary",
    "workflow[0]",
    "tools[0]",
    "quality[0]",
    "limitations[0]",
    "evidence[0].label",
    "evidence[0].value",
    "evidence[0].note",
  ]) {
    assert.ok(fields.includes(expected), `${expected} is not covered by the confidential text scan`);
  }
});

test("a draft must state why it is a draft", () => {
  const project = { ...validConfidentialProject(), publication: { status: "draft", reason: "  " } } as const;
  const issues = getConfidentialProjectIssues(project);
  assert.ok(
    issues.some((issue) => issue.includes("is a draft without a stated reason")),
    `expected a draft-reason issue, got: ${issues.join(" | ")}`,
  );
});

test("an approval without a reference is rejected", () => {
  const project = {
    ...validConfidentialProject(),
    publication: { status: "approved", approval: "", verifiedAt: "2026-08-26", reviewAfter: "2026-11-26" },
  } as const;
  const issues = getConfidentialProjectIssues(project);
  assert.ok(
    issues.some((issue) => issue.includes("claims approval without an approval reference")),
    `expected an approval-reference issue, got: ${issues.join(" | ")}`,
  );
});

test("an approval with an unusable date is rejected", () => {
  const project = {
    ...validConfidentialProject(),
    publication: {
      status: "approved",
      approval: "Example approval v1",
      verifiedAt: "26-08-2026",
      reviewAfter: "2026-11-26",
    },
  } as const;
  const issues = getConfidentialProjectIssues(project);
  assert.ok(
    issues.some((issue) => issue.includes("has an invalid approval date")),
    `expected an approval-date issue, got: ${issues.join(" | ")}`,
  );
});

test("an approval due for review before it was given is rejected", () => {
  const project = {
    ...validConfidentialProject(),
    publication: {
      status: "approved",
      approval: "Example approval v1",
      verifiedAt: "2026-08-26",
      reviewAfter: "2026-08-01",
    },
  } as const;
  const issues = getConfidentialProjectIssues(project);
  assert.ok(
    issues.some((issue) => issue.includes("is due for review before it was approved")),
    `expected an approval-order issue, got: ${issues.join(" | ")}`,
  );
});

test("a complete approval raises no issues", () => {
  const project = {
    ...validConfidentialProject(),
    publication: {
      status: "approved",
      approval: "Example approval v1",
      verifiedAt: "2026-08-26",
      reviewAfter: "2026-11-26",
    },
  } as const;
  assert.deepEqual(getConfidentialProjectIssues(project), []);
});

test("a production build refuses to publish an unapproved draft", () => {
  const draft = validConfidentialProject();
  const issue = getDraftPublicationIssue([draft], "production");
  assert.ok(issue, "a production build must reject an unapproved draft that reached the rendered list");
  assert.match(issue, /without approval/);
  assert.match(issue, /example-confidential/);
});

test("a production build accepts an approved confidential project", () => {
  const approved = {
    ...validConfidentialProject(),
    publication: {
      status: "approved",
      approval: "Example approval v1",
      verifiedAt: "2026-08-26",
      reviewAfter: "2026-11-26",
    },
  } as const;
  assert.equal(getDraftPublicationIssue([approved], "production"), undefined);
});

test("a non-production build may render a draft", () => {
  const draft = validConfidentialProject();
  for (const environment of ["preview", "development", undefined]) {
    assert.equal(getDraftPublicationIssue([draft], environment), undefined);
  }
});

test("a draft is withheld when drafts are not visible and rendered when they are", () => {
  const draft = validConfidentialProject();
  assert.equal(isPublishable(draft, false), false);
  assert.equal(isPublishable(draft, true), true);
});

test("a project backed by a public repository is always publishable", () => {
  for (const project of allProjects.filter((candidate) => !isEmployerConfidential(candidate))) {
    assert.equal(isPublishable(project, false), true, `${project.slug} must not depend on draft visibility`);
  }
});

test("every project backed by a public repository still declares one", () => {
  for (const project of allProjects) {
    if (isEmployerConfidential(project)) continue;
    assert.ok(
      project.repository.startsWith("https://github.com/"),
      `${project.slug} must declare a public repository`,
    );
  }
});

test("the legal knowledge platform case study is confidential, draft, and source-free", () => {
  const project = allProjects.find((candidate) => candidate.slug === CONFIDENTIAL_SLUG);
  assert.ok(project, "the confidential case study is missing from the authored projects");
  assert.ok(isEmployerConfidential(project));
  assert.equal(project.publication.status, "draft");
  assert.equal((project as Project as { repository?: string }).repository, undefined);
  assert.equal((project as Project as { artifacts?: unknown }).artifacts, undefined);
  assert.deepEqual(getConfidentialProjectIssues(project), []);
});

/*
 * The draft-visibility gate is read once, when the content module loads, so it cannot be
 * meaningfully asserted from inside a test process that has already loaded it. Loading the module
 * in a child process under a chosen VERCEL_ENV is the only way to observe the gate it actually
 * shipped with.
 */
/**
 * Load the portfolio module under a chosen environment.
 *
 * `hideDrafts` is passed explicitly, and defaults to unset, for the same reason the test below
 * states both directions of the rule rather than reading the ambient environment: a deploy may
 * set HIDE_DRAFTS=1 for the whole `npm run check`, and a helper that inherited it would quietly
 * change what these tests assert. Inheriting VERCEL_ENV had exactly this failure once already.
 */
function loadPortfolioUnder(vercelEnv: string, hideDrafts?: "1") {
  const script = [
    'import { projects, allProjects, draftsAreVisible, getProject } from "./src/content/portfolio";',
    'process.stdout.write(JSON.stringify({',
    '  draftsAreVisible,',
    '  rendered: projects.map((project) => project.slug),',
    '  authored: allProjects.map((project) => project.slug),',
    '  resolvesDraft: Boolean(getProject("legal-knowledge-platform")),',
    '}));',
  ].join("\n");

  const output = execFileSync(
    process.execPath,
    [resolve("node_modules/tsx/dist/cli.mjs"), "--eval", script],
    {
      env: { ...process.env, VERCEL_ENV: vercelEnv, HIDE_DRAFTS: hideDrafts ?? "" },
      encoding: "utf8",
      cwd: resolve("."),
    },
  );

  return JSON.parse(output) as {
    draftsAreVisible: boolean;
    rendered: string[];
    authored: string[];
    resolvesDraft: boolean;
  };
}

test("an unapproved draft is publishable only where drafts are visible", () => {
  const project = allProjects.find((candidate) => candidate.slug === CONFIDENTIAL_SLUG);
  assert.ok(project, "the confidential case study is missing from the authored projects");

  /*
   * Both directions of the rule, stated independently of the environment running the test. The
   * earlier version of this asserted visibility against the ambient environment, which made it
   * agree with whatever happened to run it: green locally, and red inside the Vercel production
   * build where VERCEL_ENV=production is set for the whole `npm run check`.
   */
  assert.equal(isPublishable(project, true), true, "a draft must be reviewable outside production");
  assert.equal(isPublishable(project, false), false, "a draft must never publish in production");
});

test("a preview build keeps the unapproved draft reviewable", () => {
  const result = loadPortfolioUnder("preview");

  assert.equal(result.draftsAreVisible, true);
  assert.ok(
    result.rendered.includes(CONFIDENTIAL_SLUG),
    "a draft must remain visible outside a production build so it can be reviewed",
  );
  assert.ok(result.resolvesDraft, "getProject must resolve the draft outside a production build");
});

test("a preview build with HIDE_DRAFTS set drops the draft too", () => {
  const result = loadPortfolioUnder("preview", "1");

  assert.equal(result.draftsAreVisible, false);
  assert.ok(result.authored.includes(CONFIDENTIAL_SLUG), "the draft must still be authored and validated");
  assert.ok(
    !result.rendered.includes(CONFIDENTIAL_SLUG),
    "HIDE_DRAFTS must keep a draft off a preview that is going to be shared",
  );
  assert.ok(!result.resolvesDraft, "getProject must not resolve the draft when HIDE_DRAFTS is set");
});

test("HIDE_DRAFTS cannot make a draft visible in production", () => {
  /*
   * The switch only ever hides. This pins that: no value of HIDE_DRAFTS reopens a production
   * build, because the VERCEL_ENV test runs first and independently of it.
   */
  for (const value of ["0", "", "false", "no"] as const) {
    const result = loadPortfolioUnder("production", value as unknown as "1");
    assert.equal(result.draftsAreVisible, false, `HIDE_DRAFTS=${value} must not reopen production`);
    assert.ok(!result.rendered.includes(CONFIDENTIAL_SLUG));
  }
});

test("a production build drops the unapproved draft from the rendered site", () => {
  const result = loadPortfolioUnder("production");

  assert.equal(result.draftsAreVisible, false);
  assert.ok(result.authored.includes(CONFIDENTIAL_SLUG), "the draft must still be authored and validated");
  assert.ok(
    !result.rendered.includes(CONFIDENTIAL_SLUG),
    "a production build must not render an unapproved confidential draft",
  );
});

test("every dynamic route refuses a slug it did not prerender", () => {
  /*
   * The content gate and the routing gate are different promises, and only the
   * first one was being tested.
   *
   * `generateStaticParams` is built from the filtered `projects`, so every test
   * above correctly shows the draft missing from a hidden build. None of them
   * could see that the route still answered for it: Next renders a slug outside
   * `generateStaticParams` on demand unless told not to, so the page resolved
   * the project again at request time against whatever the environment said
   * then. A server started without HIDE_DRAFTS served the entire case study at
   * HTTP 200 from a build that had correctly excluded it, and wrote the render
   * into the route cache, where every later request was served it.
   *
   * Production was never exposed: `VERCEL_ENV` is "production" at build and at
   * runtime, and the first clause of `draftsAreVisible` holds on its own. This
   * pins the structural guarantee rather than the environmental one.
   *
   * Read as source rather than imported. Importing a route module pulls in the
   * whole component tree, `next/og` included, which does not resolve under the
   * test runner and would make this assert on the wrong thing.
   */
  const routes = [
    "src/app/work/[slug]/page.tsx",
    "src/app/learn/[slug]/page.tsx",
    "src/app/learn/topic/[topic]/page.tsx",
    "src/app/learn/level/[level]/page.tsx",
  ];
  for (const route of routes) {
    const source = readFileSync(resolve(import.meta.dirname, "..", route), "utf8");
    assert.match(
      source,
      /^export const dynamicParams = false;$/m,
      `${route} must set dynamicParams = false, or an unknown slug is rendered on demand`,
    );
  }
});
