import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import PageShell from "@/components/PageShell";
import MdxContent from "@/components/writing/MdxContent";
import WritingCard from "@/components/writing/WritingCard";
import { getProject, site } from "@/content/portfolio";
import {
  getPublishedLearnWriting,
  getPublishedWritingEntry,
  getWritingNeighbours,
  getRelatedWriting,
} from "@/content/writing/repository";
import { createPageMetadata } from "@/lib/metadata";
import { levelLabel, topicLabel } from "@/content/writing/schema";
import { ArrowLabel } from "@/components/Icon";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedLearnWriting().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getPublishedWritingEntry(slug, "learn");
  if (!entry) return {};

  return createPageMetadata({
    title: entry.title,
    description: entry.description,
    path: entry.path,
    type: "article",
    imagePath: `${entry.path}/opengraph-image`,
    imageAlt: `${entry.title} by ${entry.author}`,
    publishedTime: entry.publishedAt,
    modifiedTime: entry.updatedAt,
    authors: [entry.author],
    tags: entry.tags.map((tag) => tag.label),
  });
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

export default async function LearnEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getPublishedWritingEntry(slug, "learn");
  if (!entry) notFound();

  const related = getRelatedWriting(entry);
  const relatedProjects = entry.projectSlugs.map((projectSlug) => getProject(projectSlug)!).filter(Boolean);
  const { previous, next } = getWritingNeighbours(slug);
  const canonicalUrl = `${site.domain}${entry.path}`;

  return (
    <PageShell current="/learn">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": entry.kind === "tutorial" ? "TechArticle" : "Article",
          headline: entry.title,
          description: entry.description,
          datePublished: entry.publishedAt,
          dateModified: entry.updatedAt ?? entry.publishedAt,
          author: { "@type": "Person", name: entry.author, url: site.domain },
          mainEntityOfPage: canonicalUrl,
          image: `${canonicalUrl}/opengraph-image`,
          articleSection: topicLabel(entry.topic),
          educationalLevel: levelLabel(entry.level),
          keywords: entry.tags.map((tag) => tag.label),
          isPartOf: { "@type": "WebSite", name: site.name, url: site.domain },
          citation: entry.references.map((reference) => reference.url ?? reference.title),
          about: relatedProjects.map((project) => ({
            "@type": "CreativeWork",
            name: project.title,
            url: `${site.domain}/work/${project.slug}`,
          })),
        }}
      />

      <article className="article-shell">
        <header className="article-header section-wrap">
          <Link className="article-back" href="/learn">Learn</Link>
          <h1>{entry.title}</h1>
          <p className="article-deck">{entry.description}</p>
          <ul className="article-chips" aria-label="Topic and level">
            <li>
              <Link href={`/learn/topic/${entry.topic}`}>{topicLabel(entry.topic)}</Link>
            </li>
            <li data-kind="level">
              <Link href={`/learn/level/${entry.level}`}>{levelLabel(entry.level)}</Link>
            </li>
          </ul>
          <div className="article-byline">
            <span>{entry.author}</span>
            <time dateTime={entry.publishedAt}>{formatDate(entry.publishedAt!)}</time>
            <span>{entry.readingTime} min read</span>
          </div>
          <ul className="article-tags" aria-label="Article tags">
            {entry.tags.map((tag) => <li key={tag.slug}>{tag.label}</li>)}
          </ul>
          {entry.coverImage ? (
            <figure className="article-cover">
              <Image
                src={entry.coverImage.src}
                alt={entry.coverImage.alt}
                width={entry.coverImage.width}
                height={entry.coverImage.height}
                priority
              />
            </figure>
          ) : null}
        </header>

        <div className="article-layout section-wrap">
          {entry.tableOfContents.length >= 2 ? (
            <nav className="article-toc" aria-label="On this page">
              <p>On this page</p>
              <ol>
                {entry.tableOfContents.map((item) => (
                  <li className={item.depth === 3 ? "toc-subitem" : undefined} key={item.id}>
                    <a href={`#${item.id}`}>{item.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <div className="article-prose">
            <MdxContent source={entry.body} />
          </div>
        </div>

        {previous || next ? (
          <nav className="article-pager section-wrap" aria-label="More writing">
            {previous ? (
              <Link data-direction="previous" href={previous.path}>
                <span>Previous</span>
                <strong>{previous.title}</strong>
              </Link>
            ) : <span />}
            {next ? (
              <Link data-direction="next" href={next.path}>
                <span>Next</span>
                <strong>{next.title}</strong>
              </Link>
            ) : <span />}
          </nav>
        ) : null}

        {entry.references.length > 0 ? (
          <section className="section-wrap article-references" aria-labelledby="references-title">
            <h2 id="references-title">Source notes</h2>
            <ol>
              {entry.references.map((reference) => (
                <li key={reference.id}>
                  {reference.authors.join(", ")} ({reference.year}).{" "}
                  {reference.url ? <a href={reference.url}>{reference.title}</a> : reference.title}
                  {reference.publisher ? `. ${reference.publisher}.` : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {relatedProjects.length > 0 ? (
          <section className="section-wrap article-related" aria-labelledby="related-projects-title">
            <p className="section-index"><span>Project</span>Continue exploring</p>
            <h2 id="related-projects-title">Related engineering work</h2>
            <div className="article-related-grid">
              {relatedProjects.map((project) => (
                <article key={project.slug}>
                   <p>{project.classification}</p>
                   <h3><Link href={`/work/${project.slug}`}>{project.title}</Link></h3>
                   <span>{project.summary}</span>
                   {project.researchPath ? (
                     <Link className="text-link" href={project.researchPath}><ArrowLabel kind="forward">Research record</ArrowLabel></Link>
                   ) : null}
                 </article>
              ))}
            </div>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="section-wrap article-related" aria-labelledby="related-writing-title">
            <h2 id="related-writing-title">Related writing</h2>
            <div className="writing-grid">{related.map((item) => <WritingCard entry={item} key={item.slug} />)}</div>
          </section>
        ) : null}
      </article>
    </PageShell>
  );
}
