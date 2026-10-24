import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * The boundary, in depth.
 *
 * Every other world on this site is a thing being built, measured or taken apart. This one is a
 * place: three moments where content crosses from a server into a model's context, arranged along
 * the axis the reader is looking down, with traffic coming towards them. The argument of the
 * project is that those three moments are not interchangeable - they are written by different
 * people, they carry different things, and only the first of them can be inspected before anybody
 * calls anything - so the scene is built so that depth is authorship.
 *
 * The camera travels that axis rather than orbiting it. A reader should finish the sequence with
 * the sense of having stood between a server and a client, not of having inspected a diagram.
 *
 * Every number the states quote is in `@/content/gateway-world`, which reads them from files the
 * repository generates and commits.
 */

export type GatewayKey =
  | "boundary"
  | "authors"
  | "scannable"
  | "traffic"
  | "controls"
  | "depth"
  | "compare"
  | "refused"
  | "cost"
  | "bypass"
  | "limits";

export const STATES: readonly WorldState<GatewayKey>[] = [
  {
    key: "boundary",
    from: 0.0,
    to: 0.08,
    label: "Three moments, not one",
    caption: "Content crosses into a model's context three times, and they are not the same event.",
  },
  {
    key: "authors",
    from: 0.08,
    to: 0.17,
    label: "Each written by someone else",
    caption: "The server author writes the declarations. The model writes the arguments. The data's author writes the results.",
  },
  {
    key: "scannable",
    from: 0.17,
    to: 0.26,
    label: "Only the first can be read ahead",
    caption: "A tool description exists before any call. The document a tool returns does not exist yet.",
  },
  {
    key: "traffic",
    from: 0.26,
    to: 0.36,
    label: "Forty-seven cases",
    caption: "Twenty-six attacks across ten classes, and twenty-one benign calls that must still get through.",
  },
  {
    key: "controls",
    from: 0.36,
    to: 0.46,
    label: "Nine controls",
    caption: "Each one runs at the stages where its evidence exists, and every control runs on every event.",
  },
  {
    key: "depth",
    from: 0.46,
    to: 0.54,
    label: "Caught more than once",
    caption: "The per-control counts sum past the number of attacks, because nothing stops when something else has already blocked.",
  },
  {
    key: "compare",
    from: 0.54,
    to: 0.65,
    label: "Against the real alternative",
    caption: "No gateway catches nothing. A keyword filter - what gets built first - catches 38.5%. This catches 96.2%.",
  },
  {
    key: "refused",
    from: 0.65,
    to: 0.74,
    label: "And what each one refuses wrongly",
    caption: "The filter blocks a third of legitimate traffic. The gateway blocks 9.5% of it, and the difference is not established.",
  },
  {
    key: "cost",
    from: 0.74,
    to: 0.82,
    label: "What it costs per event",
    caption: "0.9 microseconds, 4.9, then 190.7. Two hundred times the baseline, and still far under a network hop.",
  },
  {
    key: "bypass",
    from: 0.82,
    to: 0.91,
    label: "The gap the corpus could not find",
    caption: "A tool hidden at discovery was still callable by name. Only a test that spoke the protocol could reach it.",
  },
  {
    key: "limits",
    from: 0.91,
    to: 1.0,
    label: "What a shape-matcher cannot do",
    caption: "Paraphrase defeats it, one event at a time, English only, and the corpus is mine.",
  },
];

export const { at, active } = choreograph(STATES);

/**
 * The camera, one keyframe per state.
 *
 * Its own language again: this one dollies along the depth axis and never orbits more than a few
 * degrees, because the whole composition is about what is in front of what. `dolly` is position
 * along z, `rise` is height, `swing` is a small lateral offset used only where two things have to
 * be seen as separate, and `pull` is distance from the subject.
 */
/*
 * `dolly` is absolute position on z and every value is in front of the client at +3.6, because the
 * camera has to be outside the stack it is looking into. The first table put it at 2.4 - between
 * the second and third planes - and the composition came out as two enormous clipped rectangles
 * with the traffic scattered across them. Depth only reads as depth from outside.
 */
export const SHOTS: Record<
  GatewayKey,
  { dolly: number; rise: number; swing: number; pull: number }
> = {
  boundary: { dolly: 9.6, rise: 1.0, swing: 0.0, pull: 1.0 },
  authors: { dolly: 8.4, rise: 0.7, swing: 1.7, pull: 1.0 },
  scannable: { dolly: 7.2, rise: 0.5, swing: 2.4, pull: 1.0 },
  traffic: { dolly: 8.8, rise: 0.8, swing: 0.4, pull: 1.0 },
  controls: { dolly: 7.0, rise: -0.4, swing: 1.5, pull: 1.0 },
  depth: { dolly: 6.4, rise: 0.1, swing: 2.1, pull: 1.0 },
  compare: { dolly: 11.0, rise: 1.9, swing: 0.0, pull: 1.0 },
  refused: { dolly: 10.0, rise: 1.5, swing: 0.0, pull: 1.0 },
  cost: { dolly: 8.4, rise: 0.9, swing: -2.1, pull: 1.0 },
  bypass: { dolly: 7.6, rise: 0.6, swing: 2.6, pull: 1.0 },
  limits: { dolly: 13.0, rise: 2.5, swing: 0.0, pull: 1.0 },
};
