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

/*
 * There is no photographer credit on this site, and from 22 October 2026 there
 * is nothing left to credit: the hero is no longer a photograph.
 *
 * The history is kept because the clearance it records was conditional. A
 * credit line sat in the footer of every page from 18 to 19 October 2026 and
 * was removed on 19 October at the owner's instruction. The owner holds the
 * licence and the relationship with the photographer, so whether an attribution
 * is published was theirs to decide.
 *
 * The photographer is deliberately not named here either. This repository is
 * public, so a name in a comment is a published name, which is the thing that
 * was asked to be removed. The clearance, the original condition and both
 * changes are recorded in `_portfolio-work/photos/PHOTOS.md`, which is local
 * and not published.
 *
 * Nothing in the build depends on it. If it is ever restored it goes back in
 * src/components/SiteFooter.tsx, which is where it was.
 */

/**
 * The hero portrait, and the depth map that gives it parallax.
 *
 * This is not a photograph. It is a synthetic portrait the owner generated
 * from his own photograph, published here from 22 October 2026 at his
 * instruction, replacing the third-party photograph that stood here before.
 * Because it is photorealistic a reader would otherwise take it for a
 * photograph, so the page says what it is underneath it: see `portraitNote`
 * below, which is rendered as the figure's caption and is not optional
 * decoration. The CVs and LinkedIn keep the real photograph; that split, and
 * the reversal of the earlier decision, are recorded in
 * `_portfolio-work/photos/PHOTOS.md`.
 *
 * Colour and depth are produced together by
 * `_portfolio-work/photos/make_hero_avatar.py` from one alpha matte and one
 * crop box, composited onto the output frame by the same geometry, so they
 * align by construction. A depth map offset from its colour texture shears the
 * face. The depth map comes from Depth Anything V2 run locally.
 *
 * The frame keeps the 1000:1452 ratio the photograph had, so home.css needs no
 * change: the grid column, the bottom mask and the mobile width all behave as
 * they did. The subject is fitted to the frame's height and the outer
 * shoulders are cropped, which is an ordinary headshot crop; the face is well
 * inside the frame at every width.
 *
 * The source pixels are untouched. The shader offsets where it samples; it
 * never writes a pixel. See src/components/home/DepthPortrait.tsx.
 */
export const portrait = {
  src: "/media/hero-3d-color.webp",
  depth: "/media/hero-3d-depth.webp",
  width: 800,
  height: 1162,
  alt: `${site.name}, generated portrait`,
} as const;

/**
 * What the portrait is, said on the page rather than only in this file.
 *
 * A site that argues for labelled evidence cannot publish a photorealistic
 * generated likeness as though it were a photograph. This is the label, and it
 * is rendered wherever that portrait is: the hero figure's caption and the
 * /about portrait's caption both read from here, so neither can drift from the
 * other or be removed by editing one page.
 */
export const portraitNote = "AI-generated portrait, based on my own photograph";
