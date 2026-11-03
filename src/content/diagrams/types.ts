/**
 * The architecture diagram model.
 *
 * The worlds on this site draw *evidence* - a measured result, scrubbed through its own argument.
 * None of them draws the thing a reader asks about first, which is what the system is made of and
 * what flows between its parts. That is what this module is for, and keeping it separate from the
 * worlds is deliberate: a world is one project's own vocabulary, and an architecture diagram is
 * the one drawing on this site that should look the same for every project, because the question
 * it answers is the same question every time.
 *
 * ### Where the facts come from
 *
 * Nothing here may invent a fact about a project. Two rules carry that, and `validate:content`
 * enforces both rather than leaving them to care:
 *
 *   1. Every string in a node's `tools` must already appear in that project's `tools` in
 *      `portfolio.ts`. A diagram cannot credit a project with a technology its own registry entry
 *      does not claim.
 *   2. Every index in `stages` must be a real index into that project's `workflow`, and between
 *      them the nodes must cover every stage. A diagram cannot quietly drop a step the prose
 *      describes, or add one it does not.
 *
 * So the diagram is a *rearrangement* of facts the project already publishes, into the shape the
 * prose cannot show: what is parallel, what is a gate, what feeds back. The same discipline the
 * gateway repository already applies to its own generated `architecture.svg`, where the control
 * names come out of the registry so "the picture cannot describe controls the code does not have".
 *
 * ### Layout
 *
 * `col` and `row` are grid cells, not pixels. The component owns the geometry, so every diagram on
 * the site has the same node size, the same gaps and the same stroke weights no matter who wrote
 * it. A diagram that needs bespoke pixel positions is a diagram that has stopped being comparable
 * to the others, which is the one property this drawing has that the worlds deliberately do not.
 */

/**
 * What a box *is*, which decides how it is drawn.
 *
 * Deliberately small. Every kind here earns its place by being drawn differently and meaning
 * something different to a reader; a taxonomy with a box per noun would be a legend to memorise.
 */
export type NodeKind =
  /** Data or traffic entering the system. Nothing upstream of it is modelled. */
  | "source"
  /** A transformation. The default, and the only kind that may be unlabelled by tool. */
  | "process"
  /** Something that persists between stages - an index, a table, a bundle on disk. */
  | "store"
  /** A decision point. Drawn with a hard edge because something is refused here. */
  | "gate"
  /** A measured artifact the repository publishes: a run, a report, a figure. */
  | "artifact"
  /** Where the flow ends - a served response, a dashboard, a paper. */
  | "sink";

/** What an arrow *means*. Drawn as weight and dash, never as colour alone. */
export type EdgeKind =
  /** Data moving downstream. The default. */
  | "data"
  /** A signal that governs rather than carries - a threshold, a schema, a policy. */
  | "control"
  /** Something returning upstream. Drawn dashed, because it is the one direction a reader
   *  does not assume from left-to-right order. */
  | "feedback"
  /** A path explicitly not taken: blocked, refused, abstained. */
  | "refused";

export interface DiagramNode {
  /** Stable within one diagram. Referenced by `DiagramEdge`. */
  id: string;
  /** Two or three words. Longer labels wrap badly at this node size and read as prose. */
  label: string;
  kind: NodeKind;
  /** Grid column, zero-based, left to right. */
  col: number;
  /** Grid row, zero-based, top to bottom. */
  row: number;
  /**
   * Which `workflow` steps of the project this box realises.
   *
   * Indices into the project's own `workflow` array. A box may carry none (infrastructure that
   * the workflow narration does not name) but between them the diagram must cover all of them.
   */
  stages?: readonly number[];
  /**
   * Named technologies used here. Every entry must appear in the project's `tools`.
   *
   * Rendered as the node's second line, so this is also what stops a diagram being nine identical
   * grey boxes - it is the detail that makes a box specific to this project.
   */
  tools?: readonly string[];
  /** One short line, shown to assistive technology and in the static list under the figure. */
  note?: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  kind?: EdgeKind;
  /** Two or three words at most. An arrow that needs a sentence is two arrows. */
  label?: string;
}

export interface ProjectDiagram {
  /** Must match a slug in `portfolio.ts`, or a standalone work slug. */
  slug: string;
  /** What the drawing shows. Not the project title - the title of the *figure*. */
  title: string;
  /**
   * One line naming what the diagram makes visible that the prose cannot.
   *
   * Written to the same rule as a world's `figureNote`: it says what the figure does, rather than
   * restating the project summary above it.
   */
  caption: string;
  /** One of the site's `--accent-*` custom properties. Matches the project's chapter accent. */
  accent: string;
  nodes: readonly DiagramNode[];
  edges: readonly DiagramEdge[];
}
