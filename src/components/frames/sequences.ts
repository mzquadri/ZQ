/**
 * Rendered frame sequences, and which chapter each belongs to.
 *
 * Every sequence is produced offline from the project's own evidence by a script in `tools/`, and
 * committed as WebP. A chapter listed here is drawn as a scrubbed sequence; a chapter that is not
 * keeps its live figure. That is deliberate - the sequence is the right tool where one object is
 * opened slowly, and the wrong one where a reader needs to inspect something interactively.
 */

export interface Sequence {
  src: string;
  count: number;
  width: number;
  height: number;
  label: string;
  /** Viewport heights of scroll the sequence is scrubbed across. Higher is slower. */
  travel: number;
}

export const SEQUENCES: Readonly<Record<string, Sequence>> = {
  "transport-uq": {
    src: "/frames/transport",
    count: 90,
    width: 1280,
    height: 720,
    label:
      "A road network of twenty-five junctions. An intervention at one junction lifts the network into depth, information propagates outward ring by ring, and a band of uncertainty grows at each junction with its distance from the intervention before calibration settles them.",
    travel: 3.4,
  },
};
