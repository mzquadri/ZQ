import type { Metadata } from "next";
import Link from "next/link";
import { ForwardArrow } from "@/components/Icon";
import PageShell from "@/components/PageShell";
import WritingCard from "@/components/writing/WritingCard";
import { getPublishedLearnWriting, getWritingTaxonomy } from "@/content/writing/repository";
import { createPageMetadata } from "@/lib/metadata";
import { levelLabel, topicLabel } from "@/content/writing/schema";
import ResearchFeed from "@/components/writing/ResearchFeed";

export const metadata: Metadata = createPageMetadata({
  title: "Learn",
  description: "Technical tutorials and notes on reliable AI, machine learning, research, and production engineering.",
  path: "/learn",
});

/**
 * A three-column grid holding one card looked like a page that had failed to load. Until
 * there are enough entries to fill a grid, the newest piece is presented as a single
 * feature with its own table of contents, and the taxonomy sits beside it rather than in
 * a second, emptier section.
 */
const GRID_THRESHOLD = 3;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default function LearnPage() {
  const entries = getPublishedLearnWriting();
  const { topics, levels, tags } = getWritingTaxonomy();
  const [feature, ...rest] = entries;
  const useGrid = entries.length >= GRID_THRESHOLD;

  return (
    <PageShell current="/learn">
      <header className="page-hero learn-hero section-wrap">
        <p className="kicker">Learn / technical field notes</p>
        <h1>Build the system. Explain the reasoning.</h1>
        <p>
          Tutorials and notes connecting mathematical ideas, model evaluation, and production
          engineering. Each piece is written to make a technical decision easier to understand and use.
        </p>
      </header>

      <section className="section-wrap writing-index" aria-labelledby="latest-writing">
        <div className="writing-index-header">
          <div>
            <p className="section-index"><span>01</span>Published</p>
            <h2 id="latest-writing">{useGrid ? "Latest tutorials and notes" : "Latest tutorial"}</h2>
          </div>
          <a className="rss-link" href="/rss.xml">RSS feed</a>
        </div>

        {useGrid ? (
          <div className="writing-grid">
            {entries.map((entry) => <WritingCard entry={entry} key={entry.slug} />)}
          </div>
        ) : feature ? (
          <article className="writing-feature">
            <div className="writing-feature-body">
              <p className="writing-feature-meta">
                <span>{feature.kind}</span>
                <span>{feature.readingTime} min read</span>
                <span>{topicLabel(feature.topic)}</span>
                <span>{levelLabel(feature.level)}</span>
              </p>
              <h3>
                <Link href={feature.path}>{feature.title}</Link>
              </h3>
              <p className="writing-feature-description">{feature.description}</p>

              {feature.tableOfContents.length > 0 ? (
                <div className="writing-feature-toc">
                  <p>What it covers</p>
                  <ol>
                    {feature.tableOfContents.map((item) => (
                      <li key={item.id}>{item.title}</li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="writing-feature-actions">
                <Link className="button button-primary" href={feature.path}>
                  Read the tutorial <ForwardArrow />
                </Link>
                <time dateTime={feature.publishedAt}>{formatDate(feature.publishedAt!)}</time>
              </div>
            </div>

            <div className="writing-feature-side">
              <p className="figure-label">Topics covered so far</p>
              <ul className="topic-chips">
                {topics.map((topic) => (
                  <li key={topic.slug} data-kind="category">
                    <Link href={`/learn/topic/${topic.slug}`}>{topic.label}</Link>
                  </li>
                ))}
                {levels.map((level) => (
                  <li key={level.slug}>
                    <Link href={`/learn/level/${level.slug}`}>{level.label}</Link>
                  </li>
                ))}
                {tags.map((tag) => (
                  <li key={tag.slug}>{tag.label}</li>
                ))}
              </ul>
              <p className="writing-side-note">
                The library grows deliberately. A piece is published when the underlying work is
                finished and its limitations are known, not on a schedule.
              </p>
            </div>
          </article>
        ) : null}

        {!useGrid && rest.length > 0 ? (
          <div className="writing-grid writing-grid-rest">
            {rest.map((entry) => <WritingCard entry={entry} key={entry.slug} />)}
          </div>
        ) : null}
      </section>

      <ResearchFeed />
    </PageShell>
  );
}
