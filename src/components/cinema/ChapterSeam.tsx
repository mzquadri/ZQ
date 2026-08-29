import { at } from "@/components/cinema/scroll";

/**
 * The join between two chapters.
 *
 * The alternative was a fade to black, which is what the page did before, and which tells a
 * visitor nothing except that one thing has ended. A seam says why the next thing follows: a
 * junction is a point other values hang off, and so is a captured source; a plate of pixels and a
 * page of text both have to be identified before they can be used.
 *
 * The drawing is deliberately plain - one shape becoming another over a short scroll - because a
 * transition that competes with the chapters either side of it is a third thing to look at rather
 * than a way between two. The resting state is the completed handoff, so a browser without scroll
 * timelines, and a reader who asked for no motion, sees the finished figure instead of a gap.
 */

export default function ChapterSeam({
  seam,
}: {
  seam: { from: string; to: string; note: string };
}) {
  return (
    <div aria-hidden="true" className="seam">
      <div className="seam-line" {...at(0, 40)} />

      <div className="seam-morph">
        <svg viewBox="0 0 120 40" preserveAspectRatio="xMidYMid meet">
          {/* The outgoing object: a filled node. */}
          <circle className="seam-a" cx="18" cy="20" r="7" {...at(8, 46)} />
          {/* The path between them, drawn on as the reader arrives. */}
          <path className="seam-path" d="M25 20 H95" pathLength={100} {...at(18, 62)} />
          {/* The incoming object: an open frame the outgoing one becomes. */}
          <rect className="seam-b" x="95" y="12" width="16" height="16" {...at(48, 84)} />
        </svg>
      </div>

      <p className="seam-label" {...at(30, 70)}>
        <span>{seam.from}</span>
        <em>becomes</em>
        <span>{seam.to}</span>
      </p>

      <p className="seam-note" {...at(46, 82)}>
        {seam.note}
      </p>

      <div className="seam-line" {...at(60, 96)} />
    </div>
  );
}
