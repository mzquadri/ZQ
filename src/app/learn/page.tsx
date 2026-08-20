import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import WritingCard from "@/components/writing/WritingCard";
import { getPublishedLearnWriting, getWritingTaxonomy } from "@/content/writing/repository";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Learn",
  description: "Technical tutorials and notes on reliable AI, machine learning, research, and production engineering.",
  path: "/learn",
});

export default function LearnPage() {
  const entries = getPublishedLearnWriting();
  const { categories, tags } = getWritingTaxonomy();

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
            <h2 id="latest-writing">Latest tutorials and notes</h2>
          </div>
          <a className="rss-link" href="/rss.xml">RSS feed</a>
        </div>
        <div className="writing-grid">
          {entries.map((entry) => <WritingCard entry={entry} key={entry.slug} />)}
        </div>
      </section>

      <section className="section-wrap topic-index" aria-labelledby="topic-index-title">
        <p className="section-index"><span>02</span>Topics</p>
        <h2 id="topic-index-title">A focused library that can grow deliberately.</h2>
        <div className="topic-columns">
          <div>
            <h3>Categories</h3>
            <ul>{categories.map((category) => <li key={category.slug}>{category.label}</li>)}</ul>
          </div>
          <div>
            <h3>Current tags</h3>
            <ul>{tags.map((tag) => <li key={tag.slug}>{tag.label}</li>)}</ul>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
