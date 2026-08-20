import type { WritingEntry } from "@/content/writing/schema";

export function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character]!);
}

export function createRssFeed({
  entries,
  domain,
  siteName,
}: {
  entries: WritingEntry[];
  domain: string;
  siteName: string;
}) {
  const items = entries
    .map((entry) => {
      const url = `${domain}${entry.path}`;
      return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <description>${escapeXml(entry.description)}</description>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${entry.publishedAt}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${escapeXml(entry.category.label)}</category>
    </item>`;
    })
    .join("\n");

  const latestDate = entries.map((entry) => entry.updatedAt ?? entry.publishedAt!).sort().at(-1)!;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteName)} — AI/ML engineering and research</title>
    <description>${escapeXml("Technical tutorials and notes on reliable AI, machine learning, and production engineering.")}</description>
    <link>${domain}/learn</link>
    <language>en</language>
    <lastBuildDate>${new Date(`${latestDate}T00:00:00Z`).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;
}
