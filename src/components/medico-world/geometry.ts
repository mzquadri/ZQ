import { architecture, findings, sources } from "@/content/medico-world";

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

export const GRID = 34;

/**
 * A synthetic radiograph field.
 *
 * Not a downscaled scan. The corpora are not redistributable and a portfolio has no business
 * displaying a chest film belonging to a person, so this is generated: a body outline, two darker
 * lung fields, a brighter mediastinal column between them, a rib texture that follows the chest
 * wall, and nothing at all outside the torso.
 *
 * Legibility is the whole requirement. The first attempt was a soft noise field and it read as a
 * grid of grey tiles - if the opening frame of a chest-X-ray project does not say "chest", the
 * rest of the sequence has nothing to stand on. It is symmetric about the vertical axis because a
 * real one roughly is, and because the horizontal-flip augmentation the script applies only makes
 * sense on an image with that symmetry.
 */
export const radiograph = (() => {
  const cells: number[] = [];
  for (let row = 0; row < GRID; row += 1) {
    for (let col = 0; col < GRID; col += 1) {
      const x = (col / (GRID - 1)) * 2 - 1;
      const y = (row / (GRID - 1)) * 2 - 1;

      /* Torso outline: wider at the shoulders, tapering to the diaphragm. */
      const halfWidth = 0.86 - Math.max(0, y) * 0.22 - Math.max(0, -y - 0.55) * 0.5;
      const inBody = Math.abs(x) < halfWidth && y > -0.94 && y < 0.92;
      if (!inBody) {
        cells.push(0.015 + (hash(row * 131 + col * 17) - 0.5) * 0.02);
        continue;
      }

      /* Soft tissue floor, then the two lung fields cut into it. */
      let v = 0.52;
      const lung =
        Math.exp(-((Math.abs(x) - 0.42) ** 2) / 0.045) *
        Math.exp(-((y - 0.08) ** 2) / 0.34) *
        (y > -0.62 ? 1 : 0);
      v -= lung * 0.42;

      /* Mediastinum and spine: the bright column down the middle. */
      v += Math.exp(-(x * x) / 0.012) * 0.3;
      /* Heart shadow, left of midline from the viewer's side. */
      v += Math.exp(-((x + 0.16) ** 2) / 0.05) * Math.exp(-((y + 0.3) ** 2) / 0.08) * 0.22;
      /* Diaphragm. */
      v += Math.exp(-((y + 0.62) ** 2) / 0.02) * 0.26;
      /* Ribs, curving with the chest wall rather than running straight across. */
      v += Math.abs(Math.sin(y * 11 - Math.abs(x) * 3.4)) * 0.09 * (1 - Math.abs(x) * 0.4);
      /* Clavicles. */
      v += Math.exp(-((y - 0.66) ** 2) / 0.008) * Math.exp(-((Math.abs(x) - 0.36) ** 2) / 0.09) * 0.2;

      cells.push(Math.max(0, Math.min(1, v + (hash(row * 131 + col * 17) - 0.5) * 0.05)));
    }
  }
  return cells;
})();

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
