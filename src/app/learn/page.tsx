import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLabel } from "@/components/Icon";
import { StageHero } from "@/components/cinema/PageStages";
import PageShell from "@/components/PageShell";
import WritingCard from "@/components/writing/WritingCard";
import { getPublishedLearnWriting, getWritingTaxonomy } from "@/content/writing/repository";
import { createPageMetadata } from "@/lib/metadata";
import { levelLabel, topicLabel } from "@/content/writing/schema";
import ResearchFeed from "@/components/writing/ResearchFeed";

export const metadata: Metadata = createPageMetadata({
  title: "Learn",
  description:
    "Technical tutorials on reliable AI systems, event-driven backends, retrieval, document intelligence, MLOps, calibration and explainability, each written from work with stated evidence and limitations.",
  path: "/learn",
});

/*
 * The library.
 *
 * This page was built for one article and was honest about it: a three-column grid holding a
 * single card looks like a page that failed to load, so the newest piece was presented as a
 * feature with the taxonomy beside it. That shape stops working in the other direction. Once the
 * collection crossed the grid threshold the feature was replaced by the grid - and the taxonomy,
 * which only existed inside the feature's side panel, went with it. The topic and level routes
 * then had nothing linking to them from anywhere on the site.
 *
 * Four sections now: a few pieces to start with, the full list, the ways to filter it, and other
 * people's work kept visibly separate from mine. The single-feature layout stays for the case
 * where the collection shrinks again, and the taxonomy is rendered outside it either way.
 */
const GRID_THRESHOLD = 3;
const FEATURED_SHOWN = 3;

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
  const featured = entries.filter((entry) => entry.featured).slice(0, FEATURED_SHOWN);
  const leadWithFeatured = useGrid && featured.length > 0;

  return (
    <PageShell current="/learn">
      <StageHero
        accent="var(--accent-systems)"
        eyebrow="Learn / technical field notes"
        title="Build the system. Explain the reasoning."
        standfirst="Tutorials on the engineering behind the work on this site: idempotent ingestion, independent verification, retrieval that reports its own degradation, calibration, and where a system should decline to answer. Every piece carries original code and states what it does not establish."
        meta={[
          { label: "Tutorials", value: entries.length.toString().padStart(2, "0") },
          { label: "Topics", value: topics.length.toString().padStart(2, "0") },
        ]}
      >
        <div className="work-jump">
          {leadWithFeatured ? <a href="#featured">Start here</a> : null}
          <a href="#all">Every tutorial</a>
          <a href="#browse">Browse by topic</a>
        </div>
      </StageHero>

      {leadWithFeatured ? (
        <section className="section-wrap writing-index" aria-labelledby="featured-writing" id="featured">
          <div className="writing-index-header">
            <div>
              <p className="section-index"><span>01</span>Start here</p>
              <h2 id="featured-writing">If you read three</h2>
            </div>
          </div>
          <div className="writing-grid">
            {featured.map((entry) => <WritingCard entry={entry} key={entry.slug} />)}
          </div>
        </section>
      ) : null}

      <section className="section-wrap writing-index" aria-labelledby="latest-writing" id="all">
        <div className="writing-index-header">
          <div>
            <p className="section-index"><span>{leadWithFeatured ? "02" : "01"}</span>Published</p>
            <h2 id="latest-writing">{useGrid ? "Every tutorial, newest first" : "Latest tutorial"}</h2>
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
                  <ArrowLabel kind="forward">Read the tutorial</ArrowLabel>
                </Link>
                <time dateTime={feature.publishedAt}>{formatDate(feature.publishedAt!)}</time>
              </div>
            </div>
          </article>
        ) : null}

        {!useGrid && rest.length > 0 ? (
          <div className="writing-grid writing-grid-rest">
            {rest.map((entry) => <WritingCard entry={entry} key={entry.slug} />)}
          </div>
        ) : null}
      </section>

      {/*
        The taxonomy, outside the feature that used to own it.

        Only filters that lead somewhere are offered - `getWritingTaxonomy` returns the vocabulary
        that something published actually uses - so a chip here is never a route to a page whose
        whole content is a sentence saying nothing is published yet. Recurring themes are listed
        without links, because tags deliberately have no route.
      */}
      <section className="section-wrap writing-browse" aria-labelledby="browse-writing" id="browse">
        <div className="writing-index-header">
          <div>
            <p className="section-index"><span>{leadWithFeatured ? "03" : "02"}</span>Browse</p>
            <h2 id="browse-writing">By subject, or by how much you already know</h2>
          </div>
        </div>

        <div className="writing-browse-groups">
          <div>
            <p className="figure-label">Topics</p>
            <ul className="topic-chips">
              {topics.map((topic) => (
                <li key={topic.slug} data-kind="category">
                  <Link href={`/learn/topic/${topic.slug}`}>{topic.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="figure-label">Levels</p>
            <ul className="topic-chips">
              {levels.map((level) => (
                <li key={level.slug}>
                  <Link href={`/learn/level/${level.slug}`}>{level.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="figure-label">Recurring themes</p>
            <ul className="topic-chips">
              {tags.map((tag) => (
                <li key={tag.slug}>{tag.label}</li>
              ))}
            </ul>
            <p className="writing-side-note">
              The library grows deliberately. A piece is published when the underlying work is
              finished and its limitations are known, not on a schedule.
            </p>
          </div>
        </div>
      </section>

      <ResearchFeed />
    </PageShell>
  );
}
