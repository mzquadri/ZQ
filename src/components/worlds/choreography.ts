/**
 * The shared engine behind every exploded world.
 *
 * A world is a list of states, each owning a slice of scroll, plus a function that asks "how far
 * through state X are you". Everything a scene does - positions, opacities, colours, the camera -
 * is a pure expression over those numbers, which is what makes scrubbing backwards free: it is the
 * same expression evaluated at a smaller value, not a reverse animation.
 *
 * Only the primitives live here. Each world keeps its own state list, its own camera keyframes and
 * its own overlays, because those are the parts that should differ between a transport surrogate
 * and a chest-X-ray classifier. Sharing them would produce two worlds that move identically and
 * feel like one template used twice.
 */

export type WorldState<K extends string> = {
  key: K;
  /** Scroll slice, as a fraction of the whole track. */
  from: number;
  to: number;
  label: string;
  /** One line naming what the frame shows. Never a restatement of the body copy. */
  caption: string;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Smoothstep, so nothing in a scene starts or stops abruptly. */
export const ease = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/** Linear position within a scroll slice. */
export const span = (progress: number, from: number, to: number) =>
  clamp01((progress - from) / Math.max(1e-6, to - from));

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Build the two readers a world needs from its own state list. */
export function choreograph<K extends string>(states: readonly WorldState<K>[]) {
  const at = (progress: number, key: K) => {
    const state = states.find((s) => s.key === key);
    if (!state) return 0;
    return ease(span(progress, state.from, state.to));
  };

  /* The state the reader is inside, for the caption and the live region. */
  const active = (progress: number): WorldState<K> => {
    for (const state of states) if (progress < state.to) return state;
    return states[states.length - 1];
  };

  return { at, active };
}

/**
 * Blend a per-state keyframe table into a single value set.
 *
 * Each state says where it wants to be watched from and the camera hands over across the second
 * half of a state, so a shot is held before it moves on. A single monotone sweep was tried on the
 * first world and failed: it was level with the thing that mattered exactly when it mattered.
 */
export function blendShots<K extends string, S extends Record<string, number>>(
  progress: number,
  states: readonly WorldState<K>[],
  shots: Record<K, S>,
): S {
  let current = { ...shots[states[0].key] };
  for (let i = 0; i < states.length - 1; i += 1) {
    const from = states[i];
    const to = states[i + 1];
    const t = ease(span(progress, mix(from.from, from.to, 0.45), to.to * 0.999));
    if (t <= 0) break;
    const a = shots[from.key];
    const b = shots[to.key];
    const blended = {} as Record<string, number>;
    for (const key of Object.keys(a)) blended[key] = mix(a[key], b[key], t);
    current = blended as S;
  }
  return current;
}
