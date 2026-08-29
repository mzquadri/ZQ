import { architecture, findings, sources } from "@/content/medico-world";
import { RADIOGRAPH_CELLS, radiographField } from "@/content/medico-radiograph";

/**
 * The shapes the medico world is built from.
 *
 * Two rules. Anything countable comes from the script - fourteen findings, seven CheXpert labels,
 * dense blocks of 6/12/24/16. Anything pictorial is synthetic and deterministic, because the
 * corpora are not redistributable and a portfolio has no business showing a chest radiograph
 * belonging to a person. The image plane here is a generated field, not a downscaled scan.
 */

/** Integer hash, so the same field is drawn on every machine and in every screenshot. */
function hash(n: number) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32;
}

/*
 * The radiograph is now generated offline by tools/gen-medico-radiograph.py and shipped as packed
 * bytes, rather than computed here from a stack of gaussians at module load.
 *
 * Two reasons. Resolution: the inline field ran at 34 cells across and read as a grid of grey
 * blocks - the opening frame of a chest-X-ray project has to say "chest" or the rest of the
 * sequence has nothing to stand on. And iteration: tuning anatomy through a browser reload is slow
 * and inexact, where a generator writes a PNG that can be looked at directly.
 *
 * It is still synthetic, still deterministic, still free of any pathology, and still contains no
 * patient data of any kind.
 */
export const GRID = RADIOGRAPH_CELLS;

export const radiograph = radiographField();

/**
 * Which findings each source can actually label.
 *
 * 1 = the source supplies this channel, 0 = it does not and the whole column is masked. This is
 * the matrix the whole project turns on, and it is derived from the script rather than drawn.
 */
export const maskMatrix: number[][] = sources.map((source) =>
  findings.map((finding) => {
    if (source.key === "nih") return 1;
    return (source.labels as readonly string[]).includes(finding.name) ? 1 : 0;
  }),
);

/** How many of the fourteen each source covers, for the readout. */
export const coverage = sources.map((source, i) => ({
  key: source.key,
  name: source.name,
  covered: maskMatrix[i].reduce((n, v) => n + v, 0),
}));

/**
 * One image's worth of label states, for the mask scene.
 *
 * Deterministic, and honest about what it is: an illustrative single sample, not a real record.
 * The proportions follow the script's own semantics - CheXpert carries plenty of uncertain and
 * not-mentioned entries, and everything outside a source's label set is unsupported.
 */
export type LabelState = "positive" | "negative" | "uncertain" | "unsupported";

export function labelStateFor(sourceIndex: number, findingIndex: number): LabelState {
  if (maskMatrix[sourceIndex][findingIndex] === 0) return "unsupported";
  const draw = hash(sourceIndex * 977 + findingIndex * 31);
  if (sources[sourceIndex].key === "chexpert" && draw > 0.62) return "uncertain";
  return draw > 0.34 ? "negative" : "positive";
}

/** The dense blocks, laid out along depth with their real layer counts. */
export const blocks = architecture
  .filter((entry) => entry.kind === "dense")
  .map((entry, i) => ({
    name: entry.name,
    layers: "layers" in entry ? (entry.layers as number) : 0,
    order: i,
  }));

export const stages = architecture.map((entry, i) => ({
  name: entry.name,
  kind: entry.kind,
  detail: entry.detail,
  order: i,
}));

/**
 * The network as individual sheets rather than eleven identical slabs.
 *
 * A dense block is not one thing, it is 6, 12, 24 or 16 layers - and those four numbers are the
 * only part of DenseNet-121's shape worth showing. Drawn as uniform plates the architecture read
 * as "some layers"; drawn as their real counts, denseblock3 is visibly the deep one and the
 * transitions between them are visibly single steps that also narrow the field.
 *
 * Spatial extent falls and channel depth rises along the stack, so sheets get smaller as they go.
 */
export type Sheet = { z: number; scale: number; kind: string; stage: number };

export const sheets: Sheet[] = (() => {
  const out: Sheet[] = [];
  let z = 0;
  /* Tuned so the whole stack fits one frame: it ran off the right edge at wider spacing. */
  const GAP = { stem: 0.4, dense: 0.082, transition: 0.42, head: 0.45 } as const;
  const total = architecture.reduce(
    (n, e) => n + (e.kind === "dense" && "layers" in e ? (e.layers as number) : 1),
    0,
  );
  architecture.forEach((entry, stage) => {
    const count = entry.kind === "dense" && "layers" in entry ? (entry.layers as number) : 1;
    for (let i = 0; i < count; i += 1) {
      const progress = out.length / total;
      out.push({
        z,
        /* Transitions halve the field, so the stack visibly narrows as it deepens. */
        scale: (1 - progress * 0.5) * (entry.kind === "transition" ? 0.92 : 1),
        kind: entry.kind,
        stage,
      });
      z += GAP[entry.kind as keyof typeof GAP] ?? 0.2;
    }
  });
  /* Centre the stack on the origin so the camera keyframes stay symmetric. */
  const mid = z / 2;
  return out.map((sheet) => ({ ...sheet, z: sheet.z - mid }));
})();

/** Deterministic per-cell jitter, reused by several scenes. */
export const jitter = (n: number) => hash(n) - 0.5;
