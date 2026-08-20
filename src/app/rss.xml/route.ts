import { site } from "@/content/portfolio";
import { getPublishedWriting } from "@/content/writing/repository";
import { createRssFeed } from "@/content/writing/rss";

export const dynamic = "force-static";

export function GET() {
  const feed = createRssFeed({ entries: getPublishedWriting(), domain: site.domain, siteName: site.name });

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
