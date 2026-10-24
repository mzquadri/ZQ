import { figure } from "@/content/identifiability-chapter";

/**
 * The layout of the identifiability world.
 *
 * Three networks at three depths, each one input node, four hidden units and one output. The
 * second is the first with its hidden units relabelled and two of them sign-flipped; the third is
 * unrelated. Their outputs are drawn on a shared axis so that two coinciding and one not is
 * something a reader settles by looking.
 *
 * `figure` is the prototype's own small fixed layout, and it is explicitly a drawing rather than a
 * trained model - the repository publishes no versioned configuration or weights, and this world
 * does not invent any. What it draws is the transformation the code constructs and then checks.
 */

export const HIDDEN = figure.hidden;
/** Lateral spacing of the hidden units within one network. */
export const UNIT_GAP = 1.5;
/** How far apart the three networks sit along the depth axis. */
export const NET_GAP = 3.4;
/** Input at the left, hidden in the middle, output at the right. */
export const LAYER_X = { input: -5.4, hidden: 0, output: 5.4 } as const;

export interface Net {
  readonly key: "first" | "relabelled" | "unrelated";
  readonly label: string;
  readonly z: number;
  /** Where each of this network's hidden units sits, as an index into the drawn slots. */
  readonly slots: readonly number[];
  /** Which of its units carry a sign flip. */
  readonly flipped: readonly boolean[];
  /** Whether its output agrees with the first network's on sampled inputs. */
  readonly agrees: boolean;
}

const identity = Array.from({ length: HIDDEN }, (_, i) => i);
const none = Array.from({ length: HIDDEN }, () => false);

export const NETS: readonly Net[] = [
  { key: "first", label: "the network", z: NET_GAP, slots: identity, flipped: none, agrees: true },
  {
    key: "relabelled",
    label: "permuted and sign-flipped",
    z: 0,
    slots: figure.permutation,
    flipped: figure.flipped,
    agrees: true,
  },
  /*
   * The unrelated network is drawn with its units in a different order again, because a network
   * that merely looks different is the easy case. What distinguishes it is the only thing that
   * can: its output does not land where the others do.
   */
  {
    key: "unrelated",
    label: "an unrelated network",
    z: -NET_GAP,
    slots: [1, 3, 0, 2],
    flipped: [true, false, true, false],
    agrees: false,
  },
];

/** Where a hidden slot sits across the network's width. */
export const slotY = (slot: number) => (slot - (HIDDEN - 1) / 2) * UNIT_GAP;

/**
 * Where each network's output mark lands.
 *
 * The first two coincide exactly, which is the claim the code checks numerically on sampled
 * inputs. The third is placed apart by a fixed amount - not a measured disagreement, because the
 * repository measures none, but the drawn statement that the check has somewhere to fail.
 */
export const OUTPUT_Y = { agreeing: 0, disagreeing: 1.9 } as const;

/** The vertical extent the networks cover, for framing. */
export const SPAN = {
  low: slotY(0) - 0.8,
  high: slotY(HIDDEN - 1) + 0.8,
} as const;
