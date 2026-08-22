import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLabel } from "@/components/Icon";
import PageShell from "@/components/PageShell";
import WritingCard from "@/components/writing/WritingCard";
import { getPublishedLearnWritingByTopic } from "@/content/writing/repository";
import { topicLabel, writingTopics, type WritingTopicSlug } from "@/content/writing/schema";
import { createPageMetadata } from "@/lib/metadata";

/**
 * One statically generated page per topic in the closed vocabulary.
 *
 * Generated from the vocabulary rather than from what happens to be published, so a topic
 * route exists and is crawlable before there is a filter interface pointing at it. A topic
 * with nothing published yet says so plainly instead of rendering an empty grid.
 *
 * No searchParams anywhere: reading them would opt this route out of static rendering,
 * which is the whole reason the vocabulary is closed.
 */

interface TopicPageProps {
  params: Promise<{ topic: string }>;
}

export function generateStaticParams() {
  return writingTopics.map((topic) => ({ topic: topic.slug }));
}

export const dynamicParams = false;

function findTopic(slug: string) {
  return writingTopics.find((topic) => topic.slug === slug);
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { topic } = await params;
  const match = findTopic(topic);
  if (!match) return {};

  const published = getPublishedLearnWritingByTopic(match.slug as WritingTopicSlug).length;

  return {
    ...createPageMetadata({
      title: `${match.label} writing`,
      description: `Tutorials and notes on ${match.label.toLowerCase()} from the Learn library.`,
      path: `/learn/topic/${match.slug}`,
    }),
    // The route stays reachable so the vocabulary never 404s, but an empty shelf is not
    // something to put in front of a crawler. It indexes itself once it has content.
    ...(published === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topic } = await params;
  const match = findTopic(topic);
  if (!match) notFound();

  const entries = getPublishedLearnWritingByTopic(match.slug as WritingTopicSlug);

  return (
    <PageShell current="/learn">
      <header className="page-hero section-wrap">
        <p className="kicker">Learn / topic</p>
        <h1>{topicLabel(match.slug)}</h1>
        <p>
          {entries.length > 0
            ? `${entries.length} published ${entries.length === 1 ? "piece" : "pieces"} on this topic.`
            : "Nothing is published on this topic yet. The route exists so it can be linked and indexed once something is."}
        </p>
        <div className="work-jump">
          <Link href="/learn">
            <ArrowLabel kind="forward">All writing</ArrowLabel>
          </Link>
        </div>
      </header>

      {entries.length > 0 ? (
        <section className="section-wrap writing-index" aria-label={`${match.label} writing`}>
          <div className="writing-grid">
            {entries.map((entry) => (
              <WritingCard entry={entry} key={entry.slug} />
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
