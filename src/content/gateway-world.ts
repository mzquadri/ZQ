/**
 * mcp-policy-gateway, as evidence.
 *
 * Every number here is copied from a generated file in the repository, not from a README and not
 * from memory. `assets/summary.json` and `assets/control-table.json` are produced by
 * `evaluation/make_evidence.py` and committed, so each figure on the site can be traced to a file
 * at a commit. `commit` below is the commit those files were generated from; if the repository
 * moves on and the numbers change, this module is wrong in a way a reader can check rather than
 * in a way they have to trust.
 *
 * The separation between what is mine and what is not runs through this file deliberately. The
 * Model Context Protocol SDK is a dependency written by other people and is named as one. The
 * gateway, the controls, the corpus and the benchmark are mine.
 */

export const gatewaySource = {
  repository: "https://github.com/mzquadri/mcp-policy-gateway",
  /** The commit the published numbers were generated from. */
  commit: "d5bd208",
  license: "MIT",
  file: (path: string) =>
    `https://github.com/mzquadri/mcp-policy-gateway/blob/d5bd208/${path}`,
} as const;

/**
 * The dependency, named as a dependency.
 *
 * The gateway speaks MCP through the official SDK rather than reimplementing the wire format. No
 * SDK source is vendored into the repository, and none of it is my work.
 */
export const upstream = {
  name: "Model Context Protocol Python SDK",
  package: "mcp",
  url: "https://github.com/modelcontextprotocol/python-sdk",
  license: "MIT",
  holder: "Anthropic, PBC and contributors",
  role: "Protocol implementation. Installed as a dependency; no source vendored.",
  note: "Targets the 2.x API, where FastMCP was renamed MCPServer.",
} as const;

/** Read but not used as code. Recorded because the debt should be visible. */
export const priorArt = [
  {
    name: "OWASP — MCP Tool Poisoning",
    url: "https://owasp.org/www-community/attacks/MCP_Tool_Poisoning",
    role: "Source of the attack-class names used in the corpus.",
  },
  {
    name: "Snyk agent-scan",
    url: "https://github.com/snyk/agent-scan",
    license: "Apache-2.0",
    role: "The reference example of static scanning, which this measures itself against.",
  },
] as const;

/** The three moments an MCP client trusts something, and who wrote each. */
export const stages = [
  {
    key: "discovery",
    title: "Declarations",
    author: "The server author",
    carries: "Tool names, descriptions, schemas",
    when: "Once, before any call",
    threat: "Instructions hidden in a description the client pastes into the prompt.",
    scannable: true,
  },
  {
    key: "request",
    title: "Arguments",
    author: "The model, from the schema",
    carries: "Call arguments",
    when: "Before the call is forwarded",
    threat: "Paths that escape a sandbox, types the schema never declared.",
    scannable: false,
  },
  {
    key: "response",
    title: "Results",
    author: "Whoever wrote the underlying data",
    carries: "Returned content, read back into context",
    when: "Only after the call runs",
    threat: "An instruction inside a document that did not exist when the server was scanned.",
    scannable: false,
  },
] as const;

/** From assets/summary.json. */
export const verdict = {
  cases: 44,
  attacks: 26,
  benign: 18,
  attackClasses: 10,
  controls: 9,
  medianMicros: 99.6,
} as const;

/**
 * The comparison, from assets/results.json.
 *
 * The keyword filter is in the table because it is the real alternative. Comparing a gateway only
 * against no gateway flatters any filter; the question worth answering is whether the extra
 * machinery beats what a competent engineer writes in an afternoon.
 */
export const configurations = [
  {
    key: "baseline",
    label: "No gateway",
    note: "What an MCP client does today.",
    caught: 0.0,
    falseBlock: 0.0,
    micros: 0,
  },
  {
    key: "keyword",
    label: "Keyword filter",
    note: "Substring matching on the obvious phrases. What gets built first.",
    caught: 0.3846,
    falseBlock: 0.3889,
    micros: 3,
  },
  {
    key: "gateway",
    label: "Policy gateway",
    note: "Nine controls across three stages.",
    caught: 0.9231,
    falseBlock: 0.1111,
    micros: 99.6,
  },
] as const;

/**
 * Per-control effectiveness, from assets/control-table.json.
 *
 * Counts sum to more than the number of attacks because several cases are caught by more than one
 * control. That is defence in depth rather than double counting, and it is only visible because
 * every control runs on every event even after another has already blocked.
 */
export const controls = [
  {
    name: "instruction_injection",
    stage: "discovery, response",
    caught: 15,
    benignTouched: 4,
    decidable: false,
    what: "Instructions addressed to the model, inside text the model is about to read.",
  },
  {
    name: "egress_control",
    stage: "request, response",
    caught: 4,
    benignTouched: 0,
    decidable: true,
    what: "Hosts outside the allowlist, including suffix-confusion lookalikes.",
  },
  {
    name: "path_sandbox",
    stage: "request",
    caught: 4,
    benignTouched: 0,
    decidable: true,
    what: "Paths that resolve outside the root, in either path grammar, symlinks included.",
  },
  {
    name: "secret_disclosure",
    stage: "request, response",
    caught: 3,
    benignTouched: 0,
    decidable: true,
    what: "Credential-shaped values, redacted rather than refused.",
  },
  {
    name: "schema_conformance",
    stage: "request",
    caught: 2,
    benignTouched: 0,
    decidable: true,
    what: "Arguments checked against the schema the server itself published.",
  },
  {
    name: "tool_allowlist",
    stage: "request",
    caught: 2,
    benignTouched: 0,
    decidable: true,
    what: "Exact-match permit list. Empty means deny everything.",
  },
  {
    name: "tool_shadowing",
    stage: "discovery",
    caught: 1,
    benignTouched: 0,
    decidable: true,
    what: "A server claiming a tool name another server already owns.",
  },
  {
    name: "destructive_action",
    stage: "request",
    caught: 1,
    benignTouched: 0,
    decidable: true,
    what: "Irreversible calls held for a human instead of refused.",
  },
  {
    name: "budget",
    stage: "request, response",
    caught: 1,
    benignTouched: 0,
    decidable: true,
    what: "Call counts, output bytes, and a per-tool circuit breaker.",
  },
] as const;

/**
 * The four cases that are not handled, all written before the controls were.
 *
 * They are pinned by a test that names them exactly, so a *new* miss fails the build rather than
 * quietly lowering the headline number.
 */
export const known = [
  {
    id: "inject-006",
    kind: "miss",
    what: "Base64 of an override instruction, with no plaintext directive around it.",
    why: "Matching runs on raw text. Decoding every base64-looking span would flag every legitimate encoded attachment, and a second encoding layer defeats it anyway.",
  },
  {
    id: "secret-004",
    kind: "miss",
    what: "A bare 64-character hex credential.",
    why: "Catching it means flagging every SHA-256 digest in every document. The control keys on prefixes and assignment shape instead.",
  },
  {
    id: "fp-known-001",
    kind: "false positive",
    what: 'A runbook saying "ignore the previous instructions in section 3".',
    why: "Genuine operator prose with the exact shape of an attack. Separating them needs to know that 'section 3' makes it self-referential.",
  },
  {
    id: "fp-known-002",
    kind: "false positive",
    what: 'Onboarding text asking someone to "show your system prompt".',
    why: "Internal documentation discusses prompts now, and the rule cannot tell who is being addressed.",
  },
] as const;

/** The gap the corpus structurally could not find, and the tests did. */
export const bypass = {
  title: "A withheld tool that could still be called",
  found: "Integration tests, over a real MCP subprocess",
  what: "The gateway hid a poisoned tool at discovery, then executed a direct call to it.",
  why: "Hiding a name from a listing is not the same as making it uncallable. A client holding the name from an earlier session can still ask, and the request-stage controls never learn that the declaration was rejected — they only see the call.",
  fix: "The gateway records withheld tools and refuses calls to them.",
  lesson:
    "The corpus tests decisions. This was a bug in wiring, and only a test that spoke the protocol could reach it.",
} as const;

/** What the deterministic design costs, stated rather than buried. */
export const limits = [
  "Paraphrase defeats it. Every rule keys on a shape, so the 92.3% is an upper bound against the attack forms represented, not a general claim.",
  "No decoding before matching, so encoded payloads pass.",
  "One event at a time. An instruction assembled across several tool results is invisible.",
  "English only. Images, PDFs and binary content are not inspected at all.",
  "The corpus is mine. Ground truth was written before the controls and documented misses were kept, but that is not the same as an independent evaluation.",
] as const;

/** Test and CI facts, from the repository. */
export const engineering = {
  tests: 98,
  skipped: 1,
  pythonVersions: ["3.11", "3.12", "3.13"] as const,
  ciSteps: ["ruff check", "ruff format", "mypy", "pytest", "benchmark", "demo"] as const,
  note: "The benchmark and the end-to-end demo both run in CI. Neither needs an API key, a network or a GPU.",
} as const;
