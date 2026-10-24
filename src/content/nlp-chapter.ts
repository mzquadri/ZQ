/**
 * News classification: the most important line is the one that refuses to run.
 *
 * The repository publishes no metric. It versions source and notebooks but no
 * downloaded data, no trained model, no checkpoints, no metrics, no plots and
 * no run metadata, and states that it therefore makes no verified accuracy,
 * F1, latency, parameter or model-comparison claim.
 *
 * What it does have is a decision worth a page. The pipeline needs AG News
 * through Hugging Face Datasets. It also ships a deterministic synthetic
 * fixture for offline development. The obvious convenience - fall back to the
 * fixture when the download fails - is the one thing it will not do: the
 * loader raises unless `--synthetic` was passed explicitly.
 *
 * The numbers below are why that matters, and they are counted from the
 * fixture's own template list rather than asserted.
 */

export const repository = "https://github.com/mzquadri/NLP-Text-Classification-Transformers";

export const task = {
  dataset: "AG News",
  classes: ["World", "Sports", "Business", "Sci/Tech"],
} as const;

/** The two tracks the project compares, evaluated the same way. */
export const tracks = [
  { key: "classical", label: "TF-IDF", detail: "logistic regression, linear SVM or random forest" },
  { key: "transformer", label: "DistilBERT", detail: "fine-tuned through the Hugging Face Trainer" },
] as const;

export interface ClassVocabulary {
  readonly label: string;
  /** Distinct words across that class's templates. */
  readonly words: number;
  /** How many of them appear in no other class. */
  readonly exclusive: number;
}

/**
 * The synthetic fixture, counted from `_generate_synthetic_ag_news`.
 *
 * Five hand-written sentences per class, and almost every word in them belongs
 * to exactly one class. A bag of words would separate these perfectly, which
 * is the point: a score measured on them would look like a result and be a
 * description of the template list.
 */
export const templatesPerClass = 5;

export const vocabulary: readonly ClassVocabulary[] = [
  { label: "World", words: 41, exclusive: 34 },
  { label: "Sports", words: 44, exclusive: 38 },
  { label: "Business", words: 43, exclusive: 39 },
  { label: "Sci/Tech", words: 41, exclusive: 35 },
];

export const templateCount = templatesPerClass * task.classes.length;

const totalWords = vocabulary.reduce((t, v) => t + v.words, 0);
const totalExclusive = vocabulary.reduce((t, v) => t + v.exclusive, 0);

/** Share of the fixture's vocabulary that gives its class away on its own. */
export const exclusiveShare = totalExclusive / totalWords;

export const text = {
  exclusiveShare: `${Math.round(exclusiveShare * 100)}%`,
} as const;

export function exclusivePercent(v: ClassVocabulary): number {
  return (v.exclusive / v.words) * 100;
}

/**
 * What the loader does when the dataset will not come down.
 *
 * Three outcomes, and the default is the one that produces nothing. Drawn in
 * this order because it is the order of the code: the fallback exists, and it
 * is unreachable without saying so on the command line.
 */
export const outcomes = [
  { key: "loaded", label: "AG News loaded", detail: "evaluate on the published test split", kind: "go" },
  { key: "raise", label: "raises, and stops", detail: "the default when the download fails", kind: "stop" },
  {
    key: "synthetic",
    label: "templates, on request",
    detail: "only with --synthetic, for offline development",
    kind: "gated",
  },
] as const;

/** Split discipline, as the README states it. */
export const splits = [
  "a stratified validation split for tuning the transformer",
  "the published test split for the final evaluation only",
  "no tuning of model choices or thresholds against the held-out split",
] as const;
