import Link from "next/link";

import { PROJECT_WORLDS, WORLD_ORDER } from "@/components/cinema/project-worlds";
import SceneIdentity from "@/components/sequence/SceneIdentity";
import { SCENES } from "@/components/sequence/scenes";

/**
 * The way onward from a project, rather than back to the index.
 *
 * Reaching the end of a case study used to leave a reader with one route: back to /work, and then
 * a decision about which of twenty-five repositories to open next. That is a fine ending for
 * someone who came for one project and a poor one for someone reading the reel, who has just
 * finished a system and is most likely to want the next.
 *
 * The order is the homepage's running order - curatorial, not chronological, and stated as such.
 * It wraps, so the last chapter leads back to the first rather than dead-ending; what it does not
 * do is autoplay or carousel, because the point is an offer, not a conveyor.
 *
 * The next project is previewed by its own object, drawn by the same function its chapter and its
 * detail route use. Continuing from here should look like continuing, not like a link list.
 */
export default function NextSystem({ slug }: { slug: string }) {
  const index = WORLD_ORDER.indexOf(slug);
  if (index === -1) return null;

  const previous = WORLD_ORDER[(index - 1 + WORLD_ORDER.length) % WORLD_ORDER.length];
  const next = WORLD_ORDER[(index + 1) % WORLD_ORDER.length];
  const world = PROJECT_WORLDS[next];
  if (!world) return null;

  const previousWorld = PROJECT_WORLDS[previous];

  return (
    <nav aria-label="Continue through the exhibition" className="next-system">
      <div className="next-system-inner">
        <div className="next-system-copy">
          <p className="next-system-kicker">Next system</p>
          <h2 className="next-system-title">
            <Link className="mz-interactive" href={world.href}>
              {world.title}
            </Link>
          </h2>
          <p className="next-system-question">{world.question}</p>

          <div className="next-system-actions">
            {previousWorld ? (
              <Link className="text-link" href={previousWorld.href}>
                &larr; {previousWorld.title}
              </Link>
            ) : null}
            <Link className="text-link" href="/work">
              All work
            </Link>
          </div>
        </div>

        {SCENES[next] ? (
          <Link aria-hidden="true" className="next-system-object" href={world.href} tabIndex={-1}>
            <SceneIdentity slug={next} />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
