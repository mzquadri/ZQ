/**
 * Refresh the committed arXiv cache.
 *
 * Run by hand when the list should be updated:
 *
 *     npm run refresh:research-feed
 *
 * The build never runs this. It reads `src/content/research-feed.json` only, so a build
 * with no network still succeeds and CI never touches arXiv. That is deliberate: arXiv
 * asks API users not to hammer the service, and a build hook would issue a request on
 * every deploy for data that changes daily at most.
 *
 * What is stored is metadata only - title, authors, date, identifier, link. No abstract,
 * no summary, no derived commentary. The site presents this as other people's work, and
 * storing an abstract would invite paraphrasing it later.
 *
 * arXiv asks for a descriptive User-Agent and a delay of at least three seconds between
 * requests. Both are honoured below.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

/** arXiv categories, paired with the site topic each maps onto. */
const QUERIES = [
  { topic: "uncertainty-quantification", category: "stat.ML" },
  { topic: "machine-learning", category: "cs.LG" },
  { topic: "retrieval-and-grounded-generation", category: "cs.IR" },
] as const;

const MAX_PER_QUERY = 4;
const MAX_ENTRIES = 9;
/** arXiv's stated minimum courtesy interval between API calls. */
const REQUEST_DELAY_MS = 3000;
const USER_AGENT = "mzquadri.de research feed (+https://mzquadri.de; contact via GitHub @mzquadri)";

interface FeedEntry {
  id: string;
  title: string;
  authors: string[];
  published: string;
  link: string;
  topic: string;
}

function textBetween(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

function decode(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function parseEntries(xml: string, topic: string): FeedEntry[] {
  const blocks = xml.split("<entry>").slice(1);
  return blocks.flatMap((block) => {
    const rawId = textBetween(block, "id");
    const absolute = rawId.replace("http://", "https://").replace(/v\d+$/, "");
    if (!absolute.startsWith("https://arxiv.org/abs/")) return [];

    const authors = Array.from(block.matchAll(/<name>([\s\S]*?)<\/name>/g))
      .map((match) => decode(match[1].replace(/\s+/g, " ").trim()))
      .filter(Boolean);
    const published = textBetween(block, "published").slice(0, 10);
    const title = decode(textBetween(block, "title"));
    if (!title || authors.length === 0 || !/^\d{4}-\d{2}-\d{2}$/.test(published)) return [];

    return [{
      id: absolute.replace("https://arxiv.org/abs/", ""),
      title,
      authors,
      published,
      link: absolute,
      topic,
    }];
  });
}

async function main() {
  const collected: FeedEntry[] = [];

  for (const [index, query] of QUERIES.entries()) {
    if (index > 0) await sleep(REQUEST_DELAY_MS);

    const url =
      "https://export.arxiv.org/api/query" +
      `?search_query=cat:${encodeURIComponent(query.category)}` +
      `&sortBy=submittedDate&sortOrder=descending&max_results=${MAX_PER_QUERY}`;

    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) throw new Error(`arXiv returned ${response.status} for ${query.category}`);
    collected.push(...parseEntries(await response.text(), query.topic));
  }

  const seen = new Set<string>();
  const entries = collected
    .filter((entry) => (seen.has(entry.id) ? false : seen.add(entry.id)))
    .sort((a, b) => b.published.localeCompare(a.published))
    .slice(0, MAX_ENTRIES);

  if (entries.length === 0) throw new Error("arXiv returned no usable entries; cache left unchanged");

  const cache = {
    source: "arXiv",
    sourceUrl: "https://arxiv.org/",
    attribution: "Thank you to arXiv for use of its open access interoperability.",
    fetchedAt: new Date().toISOString().slice(0, 10),
    entries,
  };

  const path = resolve("src/content/research-feed.json");
  writeFileSync(path, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
  console.log(`Wrote ${entries.length} entries to ${path} (fetched ${cache.fetchedAt}).`);
}

main().catch((error: unknown) => {
  // The existing cache stays exactly as it was, so the site keeps rendering the last
  // good list with its own visible date.
  console.error("Refresh failed; the committed cache was not modified.");
  console.error(error);
  process.exitCode = 1;
});
