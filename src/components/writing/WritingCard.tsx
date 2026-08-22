import Link from "next/link";
import type { WritingEntry } from "@/content/writing/schema";
import { topicLabel } from "@/content/writing/schema";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

export default function WritingCard({ entry }: { entry: WritingEntry }) {
  return (
    <article className="writing-card">
      <div className="writing-card-meta">
        <span>{entry.kind}</span>
        <span>{entry.readingTime} min read</span>
      </div>
      <h2><Link href={entry.path}>{entry.title}</Link></h2>
      <p>{entry.description}</p>
      <div className="writing-card-footer">
        <time dateTime={entry.publishedAt}>{formatDate(entry.publishedAt!)}</time>
        <span>{topicLabel(entry.topic)}</span>
      </div>
    </article>
  );
}
