import type { DiagramEdge, DiagramNode, ProjectDiagram } from "@/content/diagrams/types";

/**
 * Where every box and every line goes.
 *
 * Separated from the component for one reason: it is the only part of an architecture diagram that
 * can be wrong in a way a reader notices but a type checker does not - a line that crosses a box,
 * an arrow that leaves from the wrong edge - and a pure module of numbers can be exercised by a
 * test without mounting React or a browser.
 *
 * Nothing here reads the diagram's content. It takes grid cells and returns pixels, so every
 * diagram on the site is laid out by the same rules and two projects drawn by different hands
 * still look like one system.
 */

/** Box metrics. One size for every node, deliberately: a bigger box is not a more important one. */
export const NODE_W = 188;
export const NODE_H = 78;
const H_GAP = 64;
const V_GAP = 34;
const PAD = 26;

/** Room under the lowest row for return paths to run in without touching anything. */
const CHANNEL = 34;

const pitchX = NODE_W + H_GAP;
const pitchY = NODE_H + V_GAP;

export const nodeX = (col: number) => PAD + col * pitchX;
export const nodeY = (row: number) => PAD + row * pitchY;

export interface Placed extends DiagramNode {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

export function place(nodes: readonly DiagramNode[]): Placed[] {
  return nodes.map((n) => {
    const x = nodeX(n.col);
    const y = nodeY(n.row);
    return { ...n, x, y, cx: x + NODE_W / 2, cy: y + NODE_H / 2 };
  });
}

export function canvasSize(nodes: readonly DiagramNode[], hasReturnPath: boolean) {
  const cols = Math.max(...nodes.map((n) => n.col)) + 1;
  const rows = Math.max(...nodes.map((n) => n.row)) + 1;
  return {
    width: PAD * 2 + cols * pitchX - H_GAP,
    height: PAD * 2 + rows * pitchY - V_GAP + (hasReturnPath ? CHANNEL + 12 : 0),
  };
}

/** The y of the return channel, below every box. */
export function channelY(nodes: readonly DiagramNode[]) {
  const rows = Math.max(...nodes.map((n) => n.row)) + 1;
  return PAD + (rows - 1) * pitchY + NODE_H + CHANNEL;
}

/**
 * One edge, as an SVG path.
 *
 * Three cases, and they are genuinely different rather than three tunings of one formula:
 *
 *   - **Forward** (the target is to the right). Leaves the right edge, enters the left edge. Where
 *     the rows differ it turns once, halfway between the two boxes, which keeps every bend in a
 *     diagram on one of a small number of vertical lines instead of scattered across it.
 *   - **Vertical** (same column). Leaves the bottom edge and enters the top, or the reverse.
 *   - **Return** (the target is level or to the left). Drops to the channel under the diagram,
 *     runs back, and comes up into the target's underside. Routing these through the middle of the
 *     drawing is what makes architecture diagrams unreadable, and a feedback path is exactly the
 *     edge a reader most needs to be able to follow.
 */
export function edgePath(from: Placed, to: Placed, channel: number): string {
  /* Same column: a straight vertical between the facing edges. */
  if (from.col === to.col) {
    const down = to.row > from.row;
    const y1 = down ? from.y + NODE_H : from.y;
    const y2 = down ? to.y : to.y + NODE_H;
    return `M ${from.cx} ${y1} L ${to.cx} ${y2}`;
  }

  /* Forward: right edge to left edge, with at most one turn. */
  if (to.col > from.col) {
    const x1 = from.x + NODE_W;
    const x2 = to.x;
    if (from.row === to.row) return `M ${x1} ${from.cy} L ${x2} ${to.cy}`;
    const mid = (x1 + x2) / 2;
    return `M ${x1} ${from.cy} L ${mid} ${from.cy} L ${mid} ${to.cy} L ${x2} ${to.cy}`;
  }

  /* Return: down, back along the channel, up into the target. */
  return [
    `M ${from.cx} ${from.y + NODE_H}`,
    `L ${from.cx} ${channel}`,
    `L ${to.cx} ${channel}`,
    `L ${to.cx} ${to.y + NODE_H}`,
  ].join(" ");
}

export function isReturnPath(from: DiagramNode, to: DiagramNode) {
  return to.col < from.col;
}

export function hasAnyReturnPath(nodes: readonly DiagramNode[], edges: readonly DiagramEdge[]) {
  const by = new Map(nodes.map((n) => [n.id, n]));
  return edges.some((e) => {
    const f = by.get(e.from);
    const t = by.get(e.to);
    return f && t && isReturnPath(f, t);
  });
}

/**
 * Where an edge's label sits.
 *
 * On the first horizontal run, just above the line. Labels centred on the midpoint of the whole
 * path end up on a bend or inside a box whenever the path turns, which is most of them.
 */
export function labelAnchor(from: Placed, to: Placed, channel: number) {
  if (from.col === to.col) {
    const down = to.row > from.row;
    return { x: from.cx + 8, y: (down ? from.y + NODE_H + to.y : from.y + to.y + NODE_H) / 2, anchor: "start" as const };
  }
  if (to.col > from.col) {
    const x1 = from.x + NODE_W;
    const x2 = to.x;
    const mid = (x1 + x2) / 2;
    return { x: (x1 + mid) / 2, y: from.cy - 9, anchor: "middle" as const };
  }
  return { x: (from.cx + to.cx) / 2, y: channel - 9, anchor: "middle" as const };
}

/** Everything the renderer needs, computed once. */
export function layout(diagram: ProjectDiagram) {
  const placed = place(diagram.nodes);
  const by = new Map(placed.map((n) => [n.id, n]));
  const returning = hasAnyReturnPath(diagram.nodes, diagram.edges);
  const channel = channelY(diagram.nodes);
  const size = canvasSize(diagram.nodes, returning);

  const edges = diagram.edges.flatMap((e) => {
    const from = by.get(e.from);
    const to = by.get(e.to);
    /* An edge naming a node that does not exist is a content bug; `validate:content` fails on it.
     * Dropping it here keeps the figure drawable rather than throwing during a render. */
    if (!from || !to) return [];
    return [{ edge: e, from, to, d: edgePath(from, to, channel), label: labelAnchor(from, to, channel) }];
  });

  return { placed, edges, channel, ...size };
}
