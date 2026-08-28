import { corpus, forms, run } from "@/content/insureassist-world";

/**
 * The shapes the InsureAssist world is built from.
 *
 * Counts are real: three forms, 314 chunks, and the ranked retrieval lists come out of the frozen
 * reference run. Positions are not - the repository publishes aggregate metrics and chunk IDs, not
 * 384-dimensional vectors, so there is nothing to project. Every coordinate here is a deterministic
 * drawing decision, and the page says so.
 *
 * What the layout does encode is the one relationship the project turns on: chunks that share
 * wording across forms sit near each other in the space, which is exactly why a nearest-neighbour
 * search can land on the wrong document.
 */

function hash(n: number) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32;
}

export const FORM_INDEX: Record<string, number> = Object.fromEntries(
  forms.map((form, i) => [form.id, i]),
);

/** Where each form's slab sits. They stack in depth, in the order the manifest lists them. */
export const formSlabs = forms.map((form, i) => ({
  id: form.id,
  form: form.form,
  index: i,
  z: (i - (forms.length - 1) / 2) * 1.9,
  /* Slab size tracks the form's real word count, so the Dwelling form is visibly the largest. */
  scale: 0.86 + (form.words / Math.max(...forms.map((f) => f.words))) * 0.28,
}));

export type Chunk = {
  index: number;
  formIndex: number;
  /* Position on its own page, for the document and chunking states. */
  page: { x: number; y: number };
  /* Position in the shared semantic space, for the embedding states. */
  space: { x: number; y: number; z: number };
  /* True where this chunk's wording also appears in another form. */
  shared: boolean;
};

/**
 * The 314 chunks, distributed across the three forms in proportion to their length.
 *
 * A chunk's position in semantic space is built from a topic index rather than from its form, so
 * chunks about the same provision land near each other whichever form they came from. That is the
 * geometry the whole project is about: proximity in this space does not imply provenance.
 */
export const chunks: Chunk[] = (() => {
  const totalWords = forms.reduce((n, f) => n + f.words, 0);
  const out: Chunk[] = [];
  let index = 0;

  forms.forEach((form, formIndex) => {
    const share = Math.round((form.words / totalWords) * corpus.chunks);
    const count = formIndex === forms.length - 1 ? corpus.chunks - out.length : share;
    for (let i = 0; i < count; i += 1) {
      const seed = index * 7919 + formIndex * 104729;
      /* Topics are shared across forms; each form covers most of them. */
      const topic = (i / Math.max(1, count - 1)) * Math.PI * 2;
      const radius = 2.4 + hash(seed) * 1.5;
      const jitterA = (hash(seed + 11) - 0.5) * 0.34;
      const jitterR = (hash(seed + 23) - 0.5) * 0.5;

      out.push({
        index,
        formIndex,
        page: {
          x: ((i % 8) / 7 - 0.5) * 2.4 * formSlabs[formIndex].scale,
          y: (Math.floor(i % 48 / 8) / 5 - 0.5) * 2.4 * formSlabs[formIndex].scale,
        },
        space: {
          x: Math.cos(topic + jitterA) * (radius + jitterR),
          /* Height separates forms slightly so a cluster is legible without hiding the overlap. */
          y: (formIndex - 1) * 0.42 + (hash(seed + 37) - 0.5) * 0.7,
          z: Math.sin(topic + jitterA) * (radius + jitterR),
        },
        /* Roughly a third of the corpus is wording the forms hold in common. */
        shared: hash(seed + 53) > 0.66,
      });
      index += 1;
    }
  });
  return out;
})();

/**
 * The question the wrong-form state replays.
 *
 * Picked, not invented: the first held-out question whose top-ranked chunk came from a form other
 * than the one that answers it, taken straight from the reference run. `nfip-005` is the clearest
 * of them - the correct passage is at rank two, so the retriever found the right provision and put
 * the wrong document above it.
 */
export const wrongFormCase = run.find((entry) => !entry.topFormCorrect) ?? run[0];

/** The ranked list for that question, as form indices, so the scene can draw the real order. */
export const wrongFormRanking = wrongFormCase.retrievedForms.map((id) => ({
  formIndex: FORM_INDEX[id] ?? 0,
  correct: (wrongFormCase.relevant as readonly string[]).includes(id),
}));

/** A deterministic query point, placed among the chunks it actually retrieved. */
export const queryPoint = { x: 0.35, y: 0.1, z: -0.2 };

/** How many of the held-out questions put the wrong form first. */
export const wrongFormCount = run.filter((entry) => !entry.topFormCorrect).length;
export const runCount = run.length;

export const jitter = (n: number) => hash(n) - 0.5;
