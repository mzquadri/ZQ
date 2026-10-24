import { configurations, controls, stages, verdict } from "@/content/gateway-world";

/**
 * The layout the gateway world is built on.
 *
 * Depth is the subject. The three stages sit at three z positions with the server behind them and
 * the client in front, so "before any call", "before the call is forwarded" and "only after the
 * call runs" are three places a reader looks through rather than three boxes in a row. Everything
 * else here is derived from `@/content/gateway-world` rather than chosen, so a regenerated
 * evidence file moves the scene.
 */

/** Where each stage's plane sits along the depth axis, server behind, client in front. */
export const PLANE_Z = [-1.7, 0, 1.7] as const;

export const PLANE = { width: 3.4, height: 2.0 } as const;

/** The server emits here; the client reads here. */
export const SERVER_Z = -4.2;
export const CLIENT_Z = 3.6;

/** The three lanes the comparison splits into, and which configuration each carries. */
export const LANE_X = [-3.1, 0, 3.1] as const;

/**
 * The traffic, as a fixed list.
 *
 * Forty-seven cases: twenty-six attacks and twenty-one benign. Which case is which is not
 * published per-case, so the attack flag is assigned by index rather than claimed - the counts are
 * the data, the ordering is the drawing. Lateral and vertical offsets are deterministic so the
 * picture is identical on every machine, and spread so the stream reads as a stream rather than a
 * queue.
 */
export interface Packet {
  readonly attack: boolean;
  readonly x: number;
  readonly y: number;
  /** Start offset along the stream, so they do not arrive in lockstep. */
  readonly phase: number;
  /** Which stage catches it, or -1 for the ones nothing catches. */
  readonly caughtAt: number;
  /** True for the attacks caught by more than one control. */
  readonly doubled: boolean;
  /** True for the benign calls the gateway refuses anyway. */
  readonly falseBlock: boolean;
}

/* A small deterministic hash, the same one the 2D scenes use, so nothing here is Math.random. */
function hash01(n: number) {
  let x = (n ^ 0x9e3779b9) >>> 0;
  x = Math.imul(x, 0x85ebca6b) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35) >>> 0;
  x ^= x >>> 16;
  return x / 2 ** 32;
}

const gatewayConfig = configurations.find((c) => c.key === "gateway");

/** How many of the attacks the gateway catches, and how many benign calls it refuses. */
const CAUGHT = Math.round(verdict.attacks * (gatewayConfig?.caught ?? 0));
const FALSE_BLOCKS = Math.round(verdict.benign * (gatewayConfig?.falseBlock ?? 0));

/**
 * How many attacks more than one control catches.
 *
 * The per-control counts sum past the number of attacks precisely because several cases trip more
 * than one, and that overlap is the project's defence-in-depth claim. Derived from the table, not
 * asserted: the excess over the attack count is how many extra catches there were.
 */
const TOTAL_CONTROL_CATCHES = controls.reduce((t, c) => t + c.caught, 0);
export const OVERLAP = Math.max(0, Math.min(CAUGHT, TOTAL_CONTROL_CATCHES - verdict.attacks));

export const PACKETS: readonly Packet[] = Array.from({ length: verdict.cases }, (_, i) => {
  const attack = i < verdict.attacks;
  const indexInGroup = attack ? i : i - verdict.attacks;
  return {
    attack,
    x: (hash01(i * 3 + 1) - 0.5) * PLANE.width * 0.78,
    y: (hash01(i * 7 + 5) - 0.5) * PLANE.height * 0.74,
    phase: hash01(i * 11 + 3),
    /*
     * Which plane stops it. Spread across the three stages in the proportion the control table
     * implies - discovery and response carry the instruction-injection work, request carries the
     * path and egress controls - rather than a per-case claim the repository does not publish.
     */
    caughtAt: attack && indexInGroup < CAUGHT ? indexInGroup % 3 : -1,
    doubled: attack && indexInGroup < OVERLAP,
    falseBlock: !attack && indexInGroup < FALSE_BLOCKS,
  };
});

export const COUNTS = {
  caught: CAUGHT,
  missed: verdict.attacks - CAUGHT,
  falseBlocks: FALSE_BLOCKS,
  passed: verdict.benign - FALSE_BLOCKS,
} as const;

/** The controls that run at each stage, for the bars along each plane's lower edge. */
export const CONTROLS_BY_STAGE = stages.map((stage) =>
  controls.filter((control) => control.stage.includes(stage.key)),
);

/** Latency per configuration on a log scale, because 0.9 and 190.7 cannot share a linear axis. */
export const COST_BARS = configurations.map((configuration) => ({
  key: configuration.key,
  label: configuration.label,
  micros: configuration.micros,
  /* log10 of microseconds, shifted so the baseline is just above zero height. */
  height: Math.max(0.08, (Math.log10(configuration.micros) + 0.2) / 2.6),
}));
