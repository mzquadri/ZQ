import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLabel } from "@/components/Icon";
import { StageHero } from "@/components/cinema/PageStages";
import PageShell from "@/components/PageShell";
import WritingCard from "@/components/writing/WritingCard";
import { getPublishedLearnWriting, getWritingTaxonomy } from "@/content/writing/repository";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Every tutorial",
  description:
    "The complete tutorial library: reliable AI systems, event-driven backends, retrieval, document intelligence, MLOps, calibration and explainability, newest first.",
  path: "/learn/all",
});

/*
 * The complete list, on its own route.
 *
 * /learn was showing all thirteen in one grid, which put the browse band and the reading list
 * below eight screens of cards at a laptop height and eleven on a phone. A library index should
 * let someone see the shape of the collection and choose; the exhaustive list is a different job
 * and it gets a page, a title and a sitemap entry of its own.
 *
 * No filtering interface. The topic and level routes already do that, server-rendered, and a
 * client-side filter over thirteen items would be a control to learn rather than a list to read.
 */
export default function AllWritingPage() {
  const entries = getPublishedLearnWriting();
  const { topics, levels } = getWritingTaxonomy();

  return (
    <PageShell current="/learn">
      <StageHero
        accent="var(--accent-systems)"
        eyebrow="Learn / complete list"
        title="Every tutorial, newest first."
        standfirst="The whole library in one list. Each piece is written from work on this site, carries original code, and states what it does not establish."
        meta={[
          { label: "Tutorials", value: entries.length.toString().padStart(2, "0") },
          { label: "Topics", value: topics.length.toString().padStart(2, "0") },
          { label: "Levels", value: levels.length.toString().padStart(2, "0") },
        ]}
      >
        <p className="hero-actions">
          <Link className="button button-secondary" href="/learn">
            <ArrowLabel kind="forward">Featured and topics</ArrowLabel>
          </Link>
          <a className="button button-secondary" href="/rss.xml">
            <ArrowLabel>RSS feed</ArrowLabel>
          </a>
        </p>
      </StageHero>

      <section className="section-wrap writing-index" aria-labelledby="all-writing" id="all">
        <div className="writing-index-header">
          <div>
            <p className="section-index"><span>01</span>Published</p>
            <h2 id="all-writing">{entries.length} tutorials</h2>
          </div>
        </div>
        <div className="writing-grid">
          {entries.map((entry) => <WritingCard entry={entry} key={entry.slug} />)}
        </div>
      </section>

      <section className="closing-section section-wrap">
        <p className="kicker">Where these come from</p>
        <h2>Each one is written from work that is published beside it.</h2>
        <p>
          The case studies carry the evidence and the limitations; these carry the reasoning and
          the code. Where a tutorial names a project, that project links back to it.
        </p>
        <Link className="button button-primary" href="/work">
          <ArrowLabel kind="forward">Selected work</ArrowLabel>
        </Link>
      </section>
    </PageShell>
  );
}
