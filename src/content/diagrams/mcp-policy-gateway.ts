import type { ProjectDiagram } from "./types";

/**
 * The gateway, drawn as what it is: one engine consulted three times.
 *
 * Every name in this file is read out of the repository rather than composed for the drawing.
 * The three stages are `Stage` in `src/mcp_policy_gateway/types.py` - discovery, request,
 * response. The nine controls are the list `default_controls()` returns in `engine.py`, grouped
 * here by the module they live in rather than regrouped for the picture. The four outcomes are
 * `Action`: allow, sanitise, require_approval, block.
 *
 * The one thing the diagram adds, and the reason it is worth drawing at all, is the shape the
 * prose cannot hold: the engine is not three engines. The same merge runs at all three stages,
 * and the stages differ only in which controls declare themselves interested. That is why the
 * return path matters enough to be drawn crossing back - a document the server returns is
 * inspected by the same machinery that inspected the call that asked for it, which is the whole
 * claim of the project. A left-to-right pipeline would draw that as a fourth box and lose it.
 *
 * The severity merge is drawn as a gate rather than a process because it refuses things, and
 * because its rule is not a weighting: `engine.py` takes the most severe action any control
 * returned, so one block outranks eight allows and no tuning would change that.
 */
export const mcpPolicyGatewayDiagram: ProjectDiagram = {
  slug: "mcp-policy-gateway",
  title: "One engine, consulted at three boundaries",
  caption:
    "The same nine controls and the same severity merge run at all three stages. What differs is which controls declare an interest - and that the response stage inspects a document that did not exist when the call was allowed.",
  accent: "var(--accent-steel)",
  nodes: [
    {
      id: "agent",
      label: "Model / agent",
      kind: "source",
      col: 0,
      row: 1,
      tools: ["asyncio over stdio transport"],
      note: "Speaks to the gateway, never to the server directly.",
    },
    {
      id: "discovery",
      label: "Discovery",
      kind: "gate",
      col: 1,
      row: 0,
      stages: [0],
      note: "The tool list, before anything is called.",
    },
    {
      id: "request",
      label: "Request",
      kind: "gate",
      col: 1,
      row: 1,
      stages: [1],
      note: "Arguments, before the call is forwarded.",
    },
    {
      id: "response",
      label: "Response",
      kind: "gate",
      col: 1,
      row: 2,
      stages: [3],
      note: "Returned content, before it re-enters context.",
    },
    {
      id: "surface",
      label: "Surface controls",
      kind: "process",
      col: 2,
      row: 0,
      note: "ToolAllowlist, ToolShadowing, DestructiveAction.",
    },
    {
      id: "arguments",
      label: "Argument controls",
      kind: "process",
      col: 2,
      row: 1,
      note: "SchemaConformance, PathSandbox, BudgetControl.",
    },
    {
      id: "content",
      label: "Content controls",
      kind: "process",
      col: 2,
      row: 2,
      note: "SecretDisclosure, EgressControl, InstructionInjection.",
    },
    {
      id: "engine",
      label: "Severity merge",
      kind: "gate",
      col: 3,
      row: 1,
      stages: [2],
      note: "Most severe action wins. Every finding kept, none weighted.",
    },
    {
      id: "server",
      label: "Downstream server",
      kind: "sink",
      col: 4,
      row: 1,
      tools: ["Model Context Protocol SDK 2.x (dependency, MIT, Anthropic PBC)"],
      note: "Reached only by calls the engine allowed.",
    },
    {
      id: "refused",
      label: "Refused or held",
      kind: "sink",
      col: 4,
      row: 2,
      note: "block, or require_approval where the effect cannot be undone.",
    },
    {
      id: "trace",
      label: "Decision trace",
      kind: "artifact",
      col: 3,
      row: 3,
      stages: [4],
      note: "Which rules fired, and how long they took. Never the payload.",
    },
  ],
  edges: [
    { from: "agent", to: "discovery", kind: "data", label: "lists tools" },
    { from: "agent", to: "request", kind: "data", label: "calls tool" },
    { from: "discovery", to: "surface", kind: "control" },
    { from: "request", to: "arguments", kind: "control" },
    { from: "response", to: "content", kind: "control" },
    { from: "surface", to: "engine", kind: "data" },
    { from: "arguments", to: "engine", kind: "data" },
    { from: "content", to: "engine", kind: "data" },
    { from: "engine", to: "server", kind: "data", label: "allow / sanitise" },
    { from: "engine", to: "refused", kind: "refused", label: "block / hold" },
    { from: "server", to: "response", kind: "feedback", label: "returns content" },
    { from: "engine", to: "trace", kind: "control", label: "records" },
  ],
};
