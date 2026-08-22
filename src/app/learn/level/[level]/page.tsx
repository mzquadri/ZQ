import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLabel } from "@/components/Icon";
import PageShell from "@/components/PageShell";
import WritingCard from "@/components/writing/WritingCard";
import { getPublishedLearnWritingByLevel } from "@/content/writing/repository";
import { levelLabel, writingLevels, type WritingLevelSlug } from "@/content/writing/schema";
import { createPageMetadata } from "@/lib/metadata";

/**
 * One statically generated page per level. Same contract as the topic routes: generated
 * from the closed vocabulary, crawlable before any filter interface exists, and never
 * reading searchParams so the route stays static.
 */

interface LevelPageProps {
  params: Promise<{ level: string }>;
}

export function generateStaticParams() {
  return writingLevels.map((level) => ({ level: level.slug }));
}

export const dynamicParams = false;

function findLevel(slug: string) {
  return writingLevels.find((level) => level.slug === slug);
}

export async function generateMetadata({ params }: LevelPageProps): Promise<Metadata> {
  const { level } = await params;
  const match = findLevel(level);
  if (!match) return {};

  const published = getPublishedLearnWritingByLevel(match.slug as WritingLevelSlug).length;

  return {
    ...createPageMetadata({
      title: `${match.label} writing`,
      description: `Tutorials and notes at the ${match.label.toLowerCase()} level from the Learn library.`,
      path: `/learn/level/${match.slug}`,
    }),
    // Same rule as the topic routes: reachable, but not advertised while empty.
    ...(published === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function LevelPage({ params }: LevelPageProps) {
  const { level } = await params;
  const match = findLevel(level);
  if (!match) notFound();

  const entries = getPublishedLearnWritingByLevel(match.slug as WritingLevelSlug);

  return (
    <PageShell current="/learn">
      <header className="page-hero section-wrap">
        <p className="kicker">Learn / level</p>
        <h1>{levelLabel(match.slug)}</h1>
        <p>
          {entries.length > 0
            ? `${entries.length} published ${entries.length === 1 ? "piece" : "pieces"} at this level.`
            : "Nothing is published at this level yet. The route exists so it can be linked and indexed once something is."}
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
