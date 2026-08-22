import assert from "node:assert/strict";
import test from "node:test";
import researchFeed from "../src/content/research-feed.json";
import { writingLevels, writingTopics } from "../src/content/writing/schema";
import {
  calculateReadingTime,
  getAllWriting,
  getPublishedLearnWriting,
  getPublishedWritingForProject,
  getWritingTaxonomy,
  parseWritingSource,
} from "../src/content/writing/repository";
import { createRssFeed, escapeXml } from "../src/content/writing/rss";

test("published learning content has stable routing and taxonomy", () => {
  const entries = getPublishedLearnWriting();
  assert.equal(entries.length, 1);
  assert.equal(entries[0].path, "/learn/selective-prediction-when-models-should-abstain");
  assert.ok(entries[0].readingTime >= 4);
  assert.ok(entries[0].tableOfContents.some((item) => item.id === "risk-and-coverage"));
  assert.match(entries[0].body, /\| 10% \| 1\.05 veh\/h \|/);
  assert.deepEqual(
    getPublishedWritingForProject("transport-uq").map((entry) => entry.slug),
    ["selective-prediction-when-models-should-abstain"],
  );

  const taxonomy = getWritingTaxonomy();
  assert.deepEqual(taxonomy.topics.map((item) => item.slug), ["uncertainty-quantification"]);
  assert.deepEqual(taxonomy.levels.map((item) => item.slug), ["applied"]);
  assert.ok(taxonomy.tags.some((item) => item.slug === "selective-prediction"));
});

test("level and topic come from the closed vocabularies", () => {
  const topics = new Set(writingTopics.map((topic) => topic.slug));
  const levels = new Set(writingLevels.map((level) => level.slug));

  // Drafts are included deliberately: an unknown value must fail before it is published.
  for (const entry of getAllWriting()) {
    assert.ok(topics.has(entry.topic), `${entry.slug} has an unknown topic`);
    assert.ok(levels.has(entry.level), `${entry.slug} has an unknown level`);
  }
});

test("the taxonomy only offers filters that lead somewhere", () => {
  const { topics, levels } = getWritingTaxonomy();
  const published = getPublishedLearnWriting();
  for (const topic of topics) {
    assert.ok(published.some((entry) => entry.topic === topic.slug), `${topic.slug} would be empty`);
  }
  for (const level of levels) {
    assert.ok(published.some((entry) => entry.level === level.slug), `${level.slug} would be empty`);
  }
});

test("the scaffold stays a draft so it cannot inflate the published count", () => {
  const scaffold = getAllWriting().find((entry) => entry.slug.includes("scaffold"));
  assert.ok(scaffold, "the scaffold article is missing");
  assert.equal(scaffold.status, "draft");
  assert.equal(getPublishedLearnWriting().length, 1);
});

test("the research feed publishes metadata only, never a summary", () => {
  assert.ok(Array.isArray(researchFeed.entries));
  for (const entry of researchFeed.entries) {
    assert.ok(entry.authors.length > 0, `${entry.id} has no authors`);
    assert.match(entry.link, /^https:\/\/arxiv\.org\/abs\//);
    assert.match(entry.published, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(!("summary" in entry), `${entry.id} carries a summary`);
    assert.ok(!("abstract" in entry), `${entry.id} carries an abstract`);
  }
});

test("reading time ignores fenced code and display equations", () => {
  const result = calculateReadingTime("A useful sentence.\n```python\nignored code tokens here\n```\n$$ ignored equation $$");
  assert.equal(result.wordCount, 3);
  assert.equal(result.readingTime, 1);
});

test("published content rejects an h1 owned by the route", () => {
  const source = `---
schemaVersion: 1
status: published
section: learn
kind: note
title: A sufficiently descriptive title
description: A sufficiently descriptive summary for a test content record.
publishedAt: "2026-08-20"
author: Mohd Zamin Quadri
topic: machine-learning
level: foundations
tags: [{ slug: validation, label: Validation }]
---
# Duplicate page title`;
  assert.throws(() => parseWritingSource("invalid-heading.mdx", source), /route owns the only h1/);
});

test("drafts reject executable MDX and unapproved components", () => {
  const frontmatter = `---
schemaVersion: 1
status: draft
section: blog
kind: note
title: A sufficiently descriptive draft title
description: A sufficiently descriptive summary for a draft content record.
author: Mohd Zamin Quadri
topic: machine-learning
level: foundations
tags: [{ slug: validation, label: Validation }]
---`;
  assert.throws(
    () => parseWritingSource("expression-draft.mdx", `${frontmatter}\n\n{process.env.SECRET}`),
    /executable MDX is not allowed/,
  );
  assert.throws(
    () => parseWritingSource("import-draft.mdx", `${frontmatter}\n\n  import Secret from "private"`),
    /executable MDX is not allowed/,
  );
  assert.throws(
    () => parseWritingSource("element-draft.mdx", `${frontmatter}\n\n<iframe src="https://example.com" />`),
    /unapproved MDX component/,
  );
  assert.throws(
    () => parseWritingSource("link-draft.mdx", `${frontmatter}\n\n[private](file:///Users/private/file)`),
    /unsafe or non-canonical link/,
  );
  assert.throws(
    () => parseWritingSource("fragment-draft.mdx", `${frontmatter}\n\n<>fragment</>`),
    /unapproved MDX component or fragment/,
  );
  assert.throws(
    () => parseWritingSource("protocol-link-draft.mdx", `${frontmatter}\n\n[offsite](//evil.example/path)`),
    /unsafe or non-canonical link/,
  );
  assert.throws(
    () => parseWritingSource("private-url-draft.mdx", `${frontmatter}\n\n[private](https://example.com/%2FUsers%2Fprivate%2Ffile)`),
    /local filesystem path/,
  );
  assert.throws(
    () => parseWritingSource("reference-link-draft.mdx", `${frontmatter}\n\n[offsite][target]\n\n[target]: https://example.com`),
    /reference-style links are not allowed/,
  );
  assert.throws(
    () => parseWritingSource("raw-html-draft.mdx", `${frontmatter}\n\n<div>Not approved.</div>`),
    /raw HTML is not allowed|unapproved MDX component/,
  );
  assert.throws(
    () => parseWritingSource("autolink-draft.mdx", `${frontmatter}\n\n<https://example.com>`),
    /autolinks are not allowed|Unexpected character/,
  );
  assert.throws(
    () => parseWritingSource("encoded-phone-draft.mdx", `${frontmatter}\n\n[private](https://example.com/%2B49123456789)`),
    /phone number/,
  );
});

test("approved MDX components require static accessible props", () => {
  const frontmatter = `---
schemaVersion: 1
status: draft
section: learn
kind: tutorial
title: A sufficiently descriptive component title
description: A sufficiently descriptive summary for a component content record.
author: Mohd Zamin Quadri
topic: machine-learning
level: foundations
tags: [{ slug: validation, label: Validation }]
---`;
  assert.doesNotThrow(() =>
    parseWritingSource("valid-callout.mdx", `${frontmatter}\n\n<Callout title="Important">Safe content.</Callout>`),
  );
  assert.doesNotThrow(() =>
    parseWritingSource("valid-video.mdx", `${frontmatter}\n\n<VideoEmbed title="Reviewed demonstration" youtubeId="abcdefghijk" />`),
  );
  assert.throws(
    () => parseWritingSource("missing-title.mdx", `${frontmatter}\n\n<VideoEmbed youtubeId="abcdefghijk" />`),
    /requires exactly title and youtubeId/,
  );
  assert.throws(
    () => parseWritingSource("dynamic-prop.mdx", `${frontmatter}\n\n<Callout title={process.env.SECRET}>Text</Callout>`),
    /executable MDX|static strings/,
  );
  assert.throws(
    () => parseWritingSource("spread-prop.mdx", `${frontmatter}\n\n<Callout {...props}>Text</Callout>`),
    /static strings/,
  );
  assert.throws(
    () => parseWritingSource("extra-prop.mdx", `${frontmatter}\n\n<Callout title="Note" private="value">Text</Callout>`),
    /requires exactly title/,
  );
  assert.throws(
    () => parseWritingSource("duplicate-prop.mdx", `${frontmatter}\n\n<Callout title="One" title="Two">Text</Callout>`),
    /duplicate Callout prop/,
  );
  assert.throws(
    () => parseWritingSource("invalid-video-id.mdx", `${frontmatter}\n\n<VideoEmbed title="Demo" youtubeId="short" />`),
    /valid YouTube video ID/,
  );
  assert.throws(
    () =>
      parseWritingSource(
        "video-children.mdx",
        `${frontmatter}\n\n<VideoEmbed title="Demo" youtubeId="abcdefghijk">Text</VideoEmbed>`,
      ),
    /cannot contain child content/,
  );
});

test("published bodies and reference URLs use the same privacy boundary", () => {
  const source = (body: string, referenceUrl = "https://arxiv.org/abs/1705.08500") => `---
schemaVersion: 1
status: published
section: learn
kind: article
title: A sufficiently descriptive published title
description: A sufficiently descriptive summary for a published content record.
publishedAt: "2026-08-20"
author: Mohd Zamin Quadri
topic: machine-learning
level: foundations
tags: [{ slug: validation, label: Validation }]
references:
  - id: source
    title: A sufficiently descriptive reference title
    authors: [Example Author]
    year: 2026
    url: ${referenceUrl}
---
${body}`;
  assert.throws(() => parseWritingSource("published-expression.mdx", source("{process.env.SECRET}")), /executable MDX/);
  assert.throws(() => parseWritingSource("published-esm.mdx", source('export const secret = "value"')), /executable MDX/);
  const privateUrls = [
    "https://example.com/user%40private.example",
    "https://example.com/%2FUsers%2Fprivate%2Ffile",
    "https://example.com/%2B49123456789",
    "https://example.com/089%20123%2045%2067",
    "https://example.com/089-123-45-67",
    "https://example.com/089.123.4567",
    "https://example.com/089.1234567",
  ];
  for (const [index, privateUrl] of privateUrls.entries()) {
    assert.throws(
      () => parseWritingSource(`private-body-${index}.mdx`, source(`[private](${privateUrl})`)),
      /email address|local filesystem path|phone number/,
    );
    assert.throws(
      () => parseWritingSource(`private-reference-${index}.mdx`, source("Safe body.", privateUrl)),
      /public-safe HTTPS/,
    );
  }
  assert.doesNotThrow(() => parseWritingSource("safe-reference.mdx", source("Safe body.")));
});

test("frontmatter rejects invalid and future publication dates", () => {
  const source = (publishedAt: string, updatedAt = publishedAt) => `---
schemaVersion: 1
status: published
section: learn
kind: note
title: A sufficiently descriptive dated title
description: A sufficiently descriptive summary for a dated content record.
publishedAt: "${publishedAt}"
updatedAt: "${updatedAt}"
author: Mohd Zamin Quadri
topic: machine-learning
level: foundations
tags: [{ slug: validation, label: Validation }]
---
## First section

Safe content.

## Second section

More safe content.`;
  assert.throws(() => parseWritingSource("invalid-date.mdx", source("2026-02-31")), /valid ISO date/);
  assert.throws(() => parseWritingSource("future-date.mdx", source("2100-01-01")), /cannot be in the future/);
  assert.throws(() => parseWritingSource("future-update.mdx", source("2026-08-20", "2100-01-01")), /cannot be in the future/);
  assert.throws(() => parseWritingSource("reversed-dates.mdx", source("2026-08-20", "2026-08-19")), /cannot precede/);
  assert.throws(
    () => parseWritingSource("missing-date.mdx", source("2026-08-20").replace('publishedAt: "2026-08-20"\n', "")),
    /requires publishedAt/,
  );
});

test("RSS escapes content and includes canonical URLs", () => {
  assert.equal(escapeXml("Models & <systems>"), "Models &amp; &lt;systems&gt;");
  const feed = createRssFeed({
    entries: getPublishedLearnWriting(),
    domain: "https://mzquadri.de",
    siteName: "Mohd Zamin Quadri",
  });
  assert.match(feed, /<rss version="2.0">/);
  assert.match(feed, /https:\/\/mzquadri\.de\/learn\/selective-prediction/);
});
