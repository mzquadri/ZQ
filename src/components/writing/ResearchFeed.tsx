import { ExternalArrow } from "@/components/Icon";
import feed from "@/content/research-feed.json";

/**
 * Recent arXiv listings.
 *
 * This is other people's work and the interface has to make that impossible to misread.
 * Every entry shows its real author list, the section is titled and framed as work by
 * others, and the styling deliberately does not match the article cards above it.
 *
 * Metadata only: title, authors, date, arXiv identifier, link. No abstract is stored and
 * no summary is written, so there is nothing here that could be mistaken for commentary.
 *
 * The data is a committed cache refreshed by `npm run refresh:research-feed`. The browser
 * never contacts arXiv, and neither does the build.
 */

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

/** Older than this and the list is labelled stale rather than presented as current. */
const STALE_AFTER_DAYS = 45;

export default function ResearchFeed() {
  if (feed.entries.length === 0) return null;

  const fetchedAt = new Date(`${feed.fetchedAt}T00:00:00Z`);
  const ageDays = Math.floor((Date.now() - fetchedAt.getTime()) / 86_400_000);
  const stale = ageDays > STALE_AFTER_DAYS;

  return (
    <section aria-labelledby="research-feed-title" className="section-wrap research-feed">
      <div className="research-feed-head">
        <div>
          <p className="section-index">
            <span>03</span>Elsewhere
          </p>
          <h2 id="research-feed-title">Recent work by others in these areas</h2>
          <p className="research-feed-lede">
            Listings from arXiv, shown as published metadata only. These papers are not mine
            and nothing here is a summary of them &mdash; follow a link to read the authors&apos;
            own abstract.
          </p>
        </div>
        <p className="research-feed-stamp">
          <span>{stale ? "Last updated" : "Updated"}</span>
          <time dateTime={feed.fetchedAt}>{formatDate(feed.fetchedAt)}</time>
          {stale ? <span className="research-feed-stale">List may be out of date</span> : null}
        </p>
      </div>

      <ol className="research-feed-list">
        {feed.entries.map((entry) => (
          <li key={entry.id}>
            <p className="research-feed-authors">{entry.authors.join(", ")}</p>
            <h3>
              <a href={entry.link} rel="noopener noreferrer external" target="_blank">
                {entry.title}<ExternalArrow />
              </a>
            </h3>
            <p className="research-feed-meta">
              <time dateTime={entry.published}>{formatDate(entry.published)}</time>
              <span>arXiv:{entry.id}</span>
            </p>
          </li>
        ))}
      </ol>

      <p className="research-feed-attribution">
        {feed.attribution}{" "}
        <a href={feed.sourceUrl} rel="noopener noreferrer external" target="_blank">
          arxiv.org<ExternalArrow />
        </a>
      </p>
    </section>
  );
}
