import Link from "next/link";

import { CATALOGUE_ORDER, PROJECT_WORLDS, WORLD_ORDER } from "@/components/cinema/project-worlds";
import SceneIdentity from "@/components/sequence/SceneIdentity";
import { SCENES } from "@/components/sequence/scenes";

/**
 * The way onward from a project, rather than back to the index.
 *
 * Reaching the end of a case study used to leave a reader with one route: back to /work, and then
 * a decision about which of twenty-five repositories to open next. That is a fine ending for
 * someone who came for one project and a poor one for someone reading through several, who has just
 * finished a system and is most likely to want the next.
 *
 * There are two tracks, because there are two kinds of page here and one order could not describe
 * both. `WORLD_ORDER` is the homepage's running order - curatorial, not chronological, and stated
 * as such - and it wraps, so the last chapter leads back to the first. `CATALOGUE_ORDER` is
 * everything else in the order /work lists it, and it terminates: its last entry offers the index,
 * which is where a catalogue honestly ends.
 *
 * What it does not do is autoplay or carousel, because the point is an offer, not a conveyor.
 *
 * The next project is previewed by its own object where it has one, drawn by the same function its
 * chapter and its detail route use. Continuing from here should look like continuing, not like a
 * link list. Only the nine chapters have an object; the catalogue pages carry copy alone.
 *
 * This never returns null. That is the whole point of it - a page that resolves to nothing is the
 * dead end this component exists to remove - so a slug in neither track still gets the index.
 */

interface Onward {
  /** Absent where the destination is the index rather than a project. */
  readonly slug?: string;
  readonly href: string;
  readonly title: string;
  readonly question: string;
  readonly kicker: string;
}

/**
 * The end of the catalogue, named as a destination rather than written as a fallback.
 *
 * The index is a weaker offer than another case study and the copy says so plainly: it is the end
 * of a list, and the list includes the work with the thinnest evidence.
 */
const WORK_INDEX: Onward = {
  href: "/work",
  title: "All work",
  kicker: "End of the catalogue",
  question:
    "That is the last of them. The index carries every project in this order, with the nine that stand on their own at the top and the rest labelled for what they can prove.",
};

function onward(slug: string): Onward | undefined {
  const world = PROJECT_WORLDS[slug];
  if (!world) return undefined;
  return {
    slug,
    href: world.href,
    title: world.title,
    question: world.question,
    kicker: "Next system",
  };
}

function route(slug: string): { next: Onward; previous?: Onward } {
  const chapter = WORLD_ORDER.indexOf(slug);
  if (chapter !== -1) {
    const length = WORLD_ORDER.length;
    return {
      next: onward(WORLD_ORDER[(chapter + 1) % length]) ?? WORK_INDEX,
      previous: onward(WORLD_ORDER[(chapter - 1 + length) % length]),
    };
  }

  const entry = CATALOGUE_ORDER.indexOf(slug);
  if (entry === -1) return { next: WORK_INDEX };

  const following = CATALOGUE_ORDER[entry + 1];
  return {
    // The last entry has no following page, so the index is the offer rather than a wrap.
    next: (following ? onward(following) : undefined) ?? WORK_INDEX,
    // The first entry has no preceding one. It does not reach back into the chapters: the two
    // orders are separate claims about the work, and a link across the seam would imply one list.
    previous: entry > 0 ? onward(CATALOGUE_ORDER[entry - 1]) : undefined,
  };
}

export default function NextSystem({ slug }: { slug: string }) {
  const { next, previous } = route(slug);
  const object = next.slug ? SCENES[next.slug] : undefined;

  return (
    <nav aria-label="Continue through the exhibition" className="next-system">
      <div className="next-system-inner" data-solo={object ? undefined : ""}>
        <div className="next-system-copy">
          <p className="next-system-kicker">{next.kicker}</p>
          <h2 className="next-system-title">
            <Link className="mz-interactive" href={next.href}>
              {next.title}
            </Link>
          </h2>
          <p className="next-system-question">{next.question}</p>

          <div className="next-system-actions">
            {previous ? (
              <Link className="text-link" href={previous.href}>
                &larr; {previous.title}
              </Link>
            ) : null}
            {/* Omitted where the offer above already is the index, rather than linked twice. */}
            {next.href === WORK_INDEX.href ? null : (
              <Link className="text-link" href="/work">
                All work
              </Link>
            )}
          </div>
        </div>

        {object && next.slug ? (
          <Link aria-hidden="true" className="next-system-object" href={next.href} tabIndex={-1}>
            <SceneIdentity slug={next.slug} />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
