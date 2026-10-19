import { site } from "./truth";

/**
 * The introduction, supplied by the owner and used word for word.
 *
 * It deliberately does not reuse the CV or the GitHub profile wording. An
 * earlier version of this file carried the CV's profile paragraph, which meant
 * a reader arriving from the CV or from GitHub read the same four sentences a
 * third time. This is the same person described for someone meeting him here
 * first: it opens by introducing him, and it explains the thesis by what it was
 * for rather than by what it measured.
 *
 * Do not reword any of it. The claims are the owner's own and were given as
 * final copy; the facts in it are checked against the CV in
 * tests/home-facts.test.ts.
 */
export const homeIntro = [
  "Hi, I'm Zamin. I'm an AI/ML engineer in Munich, and I build machine learning systems from the first look at the data to a service running in production.",
  "I recently completed my M.Sc. in Mathematics in Science and Engineering at TUM. For my thesis I taught a traffic model for Paris to say how sure it is about each prediction, so people know when to trust it.",
  "At BP-IT Consulting I worked on search over legal documents, AI that reads insurance papers, and a chest X-ray classifier, along with the Docker and Kubernetes setup behind them.",
  "Open to full-time Machine Learning and Applied AI roles and PhD positions.",
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
