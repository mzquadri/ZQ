import { site } from "./truth";

/**
 * The copy on the home page.
 *
 * The introduction is the Industry CV's profile paragraph, reworded only where
 * the CV's phrasing is CV-shaped ("AI/ML engineer with an M.Sc. in ...", which
 * reads as a header rather than a sentence). Every claim in it is on the CV and
 * the same four sentences are already live on the GitHub profile, so the two
 * surfaces say the same thing in the same words. Nothing here is new.
 *
 * It is four sentences on purpose. The brief asks for three or four, and the
 * fourth is the one that says what the work is actually about.
 */
export const homeIntro = [
  "I build machine learning systems and the services that run them.",
  "My Master's thesis at the Technical University of Munich added calibrated confidence estimates to a graph neural network that predicts how Paris traffic responds to road policy.",
  "At BP-IT Consulting I built retrieval services over vector and graph databases, a document extraction pipeline that pairs OCR with large language models, and the ML core of a chest X-ray classifier.",
  "I work the whole path from data and training to a tested, deployed service, and I measure what a model gets wrong as carefully as what it gets right.",
] as const;

/**
 * Where the hero sends people.
 *
 * Four, in the order a reader is likely to want them: a professor opens
 * Research, a hiring engineer opens Projects, a recruiter opens Experience, and
 * anyone who has decided opens Contact. None of the labels carries an arrow;
 * a link already looks like a link.
 */
export const heroLinks = [
  { href: "/research", label: "Research" },
  { href: "/work", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * The hero's background drawing, and what it honestly is.
 *
 * `tools/export-paris-hero.mjs` writes the SVG from the thesis tensor. It draws
 * the longest 3,000 of the 31,635 road segments, because all of them come to
 * roughly 23,600 distinct strokes and 390 KB, which is not a background. The
 * subset is stated rather than glossed: the figure caption and the image's own
 * description both give both numbers.
 *
 * 3,000 rather than the 4,000 this started at. Both read clearly as Paris; the
 * smaller set costs a third less to rasterise, and the hero's whole job is to
 * load fast enough that the name is readable before anyone has decided whether
 * to stay.
 */
export const parisNetwork = {
  src: "/media/paris-network-3000.svg",
  drawn: 3000,
  total: 31635,
  description:
    "The real Paris road network from my Master's thesis, drawn from the same tensor the model was trained on. The longest 3,000 of its 31,635 road segments are shown; the Peripherique ring, the Seine and the radial boulevards are all segments in the data rather than drawn decoration.",
} as const;

/** The photographer's credit, carried on every page rather than only this one. */
export const portraitCredit = "Photo: Davies" as const;

export const portrait = {
  src: "/media/hero-portrait.webp",
  width: 900,
  height: 1290,
  alt: `${site.name}, black and white portrait`,
} as const;
