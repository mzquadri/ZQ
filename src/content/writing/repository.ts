import { readFileSync, readdirSync } from "node:fs";
import { basename, resolve } from "node:path";
import { parse } from "yaml";
import remarkMdx from "remark-mdx";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { getProject } from "@/content/portfolio";
import {
  type TableOfContentsItem,
  type WritingEntry,
  type WritingFrontmatter,
  getPrivateTextIssue,
  getPublicUrlIssue,
  writingFrontmatterSchema,
} from "@/content/writing/schema";

const writingDirectory = resolve(process.cwd(), "content", "writing");
const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const publicWritingSections: readonly WritingFrontmatter["section"][] = ["learn"];

interface ContentNode {
  type: string;
  name?: string | null;
  url?: string;
  value?: string;
  attributes?: Array<{ type: string; name?: string; value?: unknown }>;
  children?: ContentNode[];
  position?: { start?: { offset?: number }; end?: { offset?: number } };
}

function contentPath(section: WritingFrontmatter["section"], slug: string) {
  return `/${section}/${slug}`;
}

function plainHeading(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_~]/g, "")
    .trim();
}

export function slugifyHeading(value: string) {
  return plainHeading(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function extractTableOfContents(body: string): TableOfContentsItem[] {
  const withoutCode = body.replace(/```[\s\S]*?```/g, "");
  return Array.from(withoutCode.matchAll(/^(##|###)\s+(.+)$/gm)).map((match) => ({
    depth: match[1].length as 2 | 3,
    id: slugifyHeading(match[2]),
    title: plainHeading(match[2]),
  }));
}

export function calculateReadingTime(body: string) {
  const prose = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`\[\]()|-]/g, " ");
  const wordCount = prose.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return { wordCount, readingTime: Math.max(1, Math.ceil(wordCount / 225)) };
}

function validateLink(fileName: string, url: string) {
  const safe = url.startsWith("#") || (url.startsWith("/") && !url.startsWith("//")) || url.startsWith("https://");
  if (!safe) throw new Error(`${fileName}: unsafe or non-canonical link ${url}`);
  let issue: string | undefined;
  if (url.startsWith("https://")) {
    issue = getPublicUrlIssue(url);
  } else {
    try {
      issue = getPrivateTextIssue(decodeURIComponent(url));
    } catch {
      issue = "contains invalid percent encoding";
    }
  }
  if (issue) throw new Error(`${fileName}: link ${issue}`);
}

function validateComponent(fileName: string, node: ContentNode) {
  if (node.name !== "Callout" && node.name !== "VideoEmbed") {
    throw new Error(`${fileName}: unapproved MDX component or fragment ${node.name ?? "<>"}`);
  }
  const attributes = new Map<string, string>();
  for (const attribute of node.attributes ?? []) {
    if (attribute.type !== "mdxJsxAttribute" || !attribute.name || typeof attribute.value !== "string") {
      throw new Error(`${fileName}: MDX component props must be static strings`);
    }
    if (attributes.has(attribute.name)) throw new Error(`${fileName}: duplicate ${node.name} prop ${attribute.name}`);
    attributes.set(attribute.name, attribute.value);
  }
  const expected = node.name === "Callout" ? ["title"] : ["title", "youtubeId"];
  if (attributes.size !== expected.length || expected.some((name) => !attributes.get(name)?.trim())) {
    throw new Error(`${fileName}: ${node.name} requires exactly ${expected.join(" and ")}`);
  }
  if (node.name === "VideoEmbed" && !/^[\w-]{11}$/.test(attributes.get("youtubeId") ?? "")) {
    throw new Error(`${fileName}: VideoEmbed requires a valid YouTube video ID`);
  }
  if (node.name === "VideoEmbed" && (node.children?.length ?? 0) > 0) {
    throw new Error(`${fileName}: VideoEmbed cannot contain child content`);
  }
}

export function validateMdxBody(fileName: string, body: string) {
  const tree = unified().use(remarkParse).use(remarkMath).use(remarkMdx).parse(body) as ContentNode;
  const visit = (node: ContentNode) => {
    if (["mdxjsEsm", "mdxFlowExpression", "mdxTextExpression"].includes(node.type)) {
      throw new Error(`${fileName}: executable MDX is not allowed`);
    }
    if (node.type === "html") throw new Error(`${fileName}: raw HTML is not allowed`);
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") validateComponent(fileName, node);
    if (node.type === "linkReference" || node.type === "imageReference" || node.type === "definition") {
      throw new Error(`${fileName}: reference-style links are not allowed`);
    }
    if ((node.type === "link" || node.type === "image") && node.url) {
      const start = node.position?.start?.offset;
      const end = node.position?.end?.offset;
      if (start !== undefined && end !== undefined && body.slice(start, end).startsWith("<")) {
        throw new Error(`${fileName}: autolinks are not allowed; use explicit Markdown links`);
      }
      validateLink(fileName, node.url);
    }
    node.children?.forEach(visit);
  };
  visit(tree);
}

export function parseWritingSource(fileName: string, source: string): WritingEntry {
  const slug = basename(fileName, ".mdx");
  if (!slugPattern.test(slug)) throw new Error(`${fileName}: filename must be lowercase kebab-case`);
  const match = source.match(frontmatterPattern);
  if (!match) throw new Error(`${fileName}: missing YAML frontmatter`);

  const frontmatter = writingFrontmatterSchema.parse(parse(match[1]));
  const body = source.slice(match[0].length).trim();
  if (!body) throw new Error(`${fileName}: body is empty`);
  if (/^#\s+/m.test(body)) throw new Error(`${fileName}: the route owns the only h1`);
  validateMdxBody(fileName, body);
  if (frontmatter.status === "published" && !frontmatter.publishedAt) {
    throw new Error(`${fileName}: published content requires publishedAt`);
  }
  if (frontmatter.updatedAt && frontmatter.publishedAt && frontmatter.updatedAt < frontmatter.publishedAt) {
    throw new Error(`${fileName}: updatedAt cannot precede publishedAt`);
  }
  const today = new Date().toISOString().slice(0, 10);
  if (frontmatter.status === "published" && frontmatter.publishedAt && frontmatter.publishedAt > today) {
    throw new Error(`${fileName}: publishedAt cannot be in the future`);
  }
  if (frontmatter.status === "published" && frontmatter.updatedAt && frontmatter.updatedAt > today) {
    throw new Error(`${fileName}: updatedAt cannot be in the future`);
  }

  const tagSlugs = frontmatter.tags.map((tag) => tag.slug);
  if (new Set(tagSlugs).size !== tagSlugs.length) throw new Error(`${fileName}: duplicate tag slug`);
  const referenceIds = frontmatter.references.map((reference) => reference.id);
  if (new Set(referenceIds).size !== referenceIds.length) throw new Error(`${fileName}: duplicate reference id`);
  if (frontmatter.relatedSlugs.includes(slug)) throw new Error(`${fileName}: cannot relate to itself`);
  for (const projectSlug of frontmatter.projectSlugs) {
    if (!getProject(projectSlug)) throw new Error(`${fileName}: unknown project ${projectSlug}`);
  }

  const tableOfContents = extractTableOfContents(body);
  const headingIds = tableOfContents.map((heading) => heading.id);
  if (headingIds.some((id) => !id) || new Set(headingIds).size !== headingIds.length) {
    throw new Error(`${fileName}: headings must produce unique non-empty IDs`);
  }

  return {
    ...frontmatter,
    slug,
    body,
    path: contentPath(frontmatter.section, slug),
    ...calculateReadingTime(body),
    tableOfContents,
  };
}

function parseEntry(fileName: string) {
  return parseWritingSource(fileName, readFileSync(resolve(writingDirectory, fileName), "utf8"));
}

let entries: WritingEntry[] | undefined;

export function getAllWriting() {
  if (!entries) {
    entries = readdirSync(writingDirectory)
      .filter((fileName) => fileName.endsWith(".mdx"))
      .map(parseEntry);
    const slugs = entries.map((entry) => entry.slug);
    if (new Set(slugs).size !== slugs.length) throw new Error("Writing slugs must be unique");
    for (const entry of entries) {
      for (const relatedSlug of entry.relatedSlugs) {
        if (!slugs.includes(relatedSlug)) throw new Error(`${entry.slug}: unknown related content ${relatedSlug}`);
      }
    }
  }
  return entries;
}

export function getPublishedWriting() {
  return getAllWriting()
    .filter((entry) => entry.status === "published" && publicWritingSections.includes(entry.section))
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") || a.slug.localeCompare(b.slug));
}

export function getPublishedLearnWriting() {
  return getPublishedWriting().filter((entry) => entry.section === "learn");
}

export function getPublishedWritingEntry(slug: string, section?: WritingFrontmatter["section"]) {
  return getPublishedWriting().find((entry) => entry.slug === slug && (!section || entry.section === section));
}

export function getPublishedWritingForProject(projectSlug: string) {
  return getPublishedWriting().filter((entry) => entry.projectSlugs.includes(projectSlug));
}

export function getRelatedWriting(entry: WritingEntry, limit = 3) {
  const explicit = new Set(entry.relatedSlugs);
  return getPublishedWriting()
    .filter((candidate) => candidate.slug !== entry.slug)
    .map((candidate) => ({
      candidate,
      score:
        (explicit.has(candidate.slug) ? 100 : 0) +
        (candidate.category.slug === entry.category.slug ? 2 : 0) +
        candidate.tags.filter((tag) => entry.tags.some((currentTag) => currentTag.slug === tag.slug)).length +
        candidate.projectSlugs.filter((slug) => entry.projectSlugs.includes(slug)).length * 3,
    }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.candidate.publishedAt ?? "").localeCompare(a.candidate.publishedAt ?? "") ||
        a.candidate.slug.localeCompare(b.candidate.slug),
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export function getWritingTaxonomy() {
  const published = getPublishedWriting();
  return {
    categories: Array.from(new Map(published.map((entry) => [entry.category.slug, entry.category])).values()),
    tags: Array.from(new Map(published.flatMap((entry) => entry.tags.map((tag) => [tag.slug, tag]))).values()),
  };
}
