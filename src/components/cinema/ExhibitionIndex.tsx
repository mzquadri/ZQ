import Link from "next/link";

import { PROJECT_WORLDS, WORLD_ORDER } from "@/components/cinema/project-worlds";
import { at } from "@/components/cinema/scroll";

/**
 * The contents page of the exhibition.
 *
 * The hero argues one thing - that a prediction without an interval is not yet usable - and then
 * the reel starts. Between them there was a paragraph. This is what belongs there instead: the
 * eight worlds as eight marks, in running order, each one the motif its chapter is built from.
 *
 * Every mark is drawn from the vocabulary the worlds actually use rather than from a stock icon
 * set: a node with edges, a source with three derived forms, a plate with channels lifting off it,
 * three near-identical pages, a gate with one plate shut, two bands at different widths, a series
 * with a window on it, a grid of cells. A visitor who scrolls past this and then meets chapter one
 * has already seen its shape once.
 *
 * It is also the fastest way into any single world, which matters for the reader who arrived
 * looking for one specific thing and does not want to scroll through eight full-viewport chapters
 * to reach it.
 */

/* Each mark is 40x28 and drawn in the accent of its own chapter. */
function Mark({ slug }: { slug: string }) {
  switch (slug) {
    case "transport-uq":
      return (
        <>
          <path d="M6 20 L14 9 L26 15 L34 8" />
          <circle cx="6" cy="20" r="2.4" />
          <circle cx="14" cy="9" r="2.4" />
          <circle cx="26" cy="15" r="2.4" />
          <circle className="mark-fill" cx="34" cy="8" r="3" />
        </>
      );
    case "reliable-knowledge-systems":
      return (
        <>
          <rect height="6" width="10" x="15" y="4" />
          <path d="M20 10 V14 M20 14 H8 M20 14 H32 M20 14 V18" />
          <rect height="5" width="7" x="5" y="18" />
          <rect height="5" width="7" x="16.5" y="18" />
          <rect className="mark-fill" height="5" width="7" x="28" y="18" />
        </>
      );
    case "medico":
      return (
        <>
          <rect height="18" width="14" x="5" y="5" />
          <path d="M21 8 H35 M21 13 H35 M21 18 H30" />
          <path className="mark-dash" d="M31 18 H35" />
        </>
      );
    case "insureassist-rag":
      return (
        <>
          <rect height="16" width="11" x="4" y="6" />
          <rect height="16" width="11" x="12" y="6" />
          <rect className="mark-fill" height="16" width="11" x="20" y="6" />
          <path d="M33 10 L36 14 L33 18" />
        </>
      );
    case "mlops-reference-pipeline":
      return (
        <>
          <path d="M4 14 H16" />
          <rect height="14" width="2.5" x="17" y="7" />
          <rect height="14" width="2.5" x="21" y="7" />
          <rect className="mark-fill" height="14" width="2.5" x="25" y="7" />
          <path className="mark-dash" d="M29 14 H36" />
        </>
      );
    case "hydrology-uq":
      return (
        <>
          <path d="M4 20 Q10 20 13 12 Q16 6 19 12 Q22 20 36 20" />
          <path className="mark-fill-soft" d="M13 8 Q16 2 19 8 Q22 18 36 21 L36 23 Q20 20 16 10 Q14 6 13 8Z" />
        </>
      );
    case "streamflow-forecasting":
      return (
        <>
          <path d="M4 18 L10 12 L14 20 L19 10 L24 16 L29 9 L36 15" />
          <rect className="mark-window" height="18" width="9" x="19" y="5" />
        </>
      );
    default:
      return (
        <>
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect
                className={r === c ? "mark-fill" : undefined}
                height="4.4"
                key={`${r}-${c}`}
                width="4.4"
                x={11 + c * 5.4}
                y={5 + r * 5}
              />
            )),
          )}
        </>
      );
  }
}

export default function ExhibitionIndex() {
  return (
    <nav aria-label="The eight worlds in this exhibition" className="exhibit">
      <ol className="exhibit-list">
        {WORLD_ORDER.map((slug, i) => {
          const world = PROJECT_WORLDS[slug];
          if (!world) return null;
          return (
            <li
              className="exhibit-item"
              key={slug}
              {...at(6 + i * 5, 42 + i * 5, { "--accent": world.accent } as React.CSSProperties)}
            >
              <Link className="exhibit-link mz-interactive" href={world.href}>
                <span className="exhibit-mark" aria-hidden="true">
                  <svg viewBox="0 0 40 28">
                    <Mark slug={slug} />
                  </svg>
                </span>
                <span className="exhibit-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="exhibit-name">{world.title}</span>
                <span className="exhibit-kind">{world.eyebrow}</span>
              </Link>
            </li>
          );
        })}

        {/* The auto-fit grid leaves one cell over at three columns. It is the right place for the
            way out to everything that is not in the reel. */}
        <li className="exhibit-item exhibit-item-all">
          <Link className="exhibit-link mz-interactive" href="/work">
            <span className="exhibit-mark" aria-hidden="true">
              <svg viewBox="0 0 40 28">
                <path d="M6 8 H34 M6 14 H34 M6 20 H24" />
                <path className="mark-dash" d="M26 20 H34" />
              </svg>
            </span>
            <span className="exhibit-index" aria-hidden="true">ALL</span>
            <span className="exhibit-name">Every repository</span>
            <span className="exhibit-kind">The index, including supporting work</span>
          </Link>
        </li>
      </ol>
    </nav>
  );
}
