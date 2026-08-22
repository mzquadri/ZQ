import { z } from "zod";

function isIsoCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

const isoDate = z.string().refine(isIsoCalendarDate, "Expected a valid ISO date (YYYY-MM-DD)");
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Expected a lowercase kebab-case slug");

export function getPrivateTextIssue(value: string) {
  if (/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(value)) return "contains an email address";
  if (/[A-Za-z]:\\Users\\|\/(?:Users|home)\//i.test(value)) return "contains a local filesystem path";
  if (/\+\d[\d\s().-]{7,}/.test(value)) return "contains an international phone number";
  if (/(?:^|[/?#=&])\d{10,15}(?=$|[/?#=&])/.test(value)) return "contains a possible phone number";
  if (/(?:phone|mobile|tel)=[^&#]*\d{7,}/i.test(value)) return "contains a possible phone number";
  if (
    Array.from(value.matchAll(/\b(?:\d[ .()-]*){9,15}\b/g)).some(([candidate]) => {
      const normalized = candidate.trim();
      const decimalParts = normalized.match(/^(\d+)\.(\d+)$/);
      const isSingleScientificDecimal = Boolean(
        decimalParts && (decimalParts[1] === "0" || !decimalParts[1].startsWith("0")),
      );
      return !isSingleScientificDecimal && normalized.replace(/\D/g, "").length >= 9;
    })
  ) {
    return "contains a possible phone number";
  }
  return undefined;
}

export function getPublicUrlIssue(value: string) {
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return "contains invalid percent encoding";
  }
  try {
    if (new URL(value).protocol !== "https:") return "must use HTTPS";
  } catch {
    return "is not a valid absolute URL";
  }
  return getPrivateTextIssue(decoded);
}

export const taxonSchema = z.object({
  slug,
  label: z.string().min(2).max(60),
});

/**
 * Level and topic.
 *
 * These replaced a free-form `category`. An open vocabulary cannot back generated filter
 * routes: `generateStaticParams` needs a known, finite set, and validation can only fail a
 * build on an unknown value if there is something to compare against. Both vocabularies are
 * therefore closed, and adding a value is a deliberate edit here rather than a side effect
 * of writing frontmatter.
 *
 * `tags` stays free-form for the finer-grained descriptors that do not deserve a route.
 */
export const writingLevels = [
  { slug: "foundations", label: "Foundations" },
  { slug: "applied", label: "Applied" },
  { slug: "advanced", label: "Advanced" },
] as const;

export const writingTopics = [
  { slug: "machine-learning", label: "Machine Learning" },
  { slug: "uncertainty-quantification", label: "Uncertainty Quantification" },
  { slug: "graph-neural-networks", label: "Graph Neural Networks" },
  { slug: "retrieval-and-grounded-generation", label: "Retrieval and Grounded Generation" },
  { slug: "mlops", label: "MLOps" },
  { slug: "scientific-computing", label: "Scientific Computing" },
] as const;

export type WritingLevelSlug = (typeof writingLevels)[number]["slug"];
export type WritingTopicSlug = (typeof writingTopics)[number]["slug"];

export const writingLevelSlugs = writingLevels.map((level) => level.slug) as [
  WritingLevelSlug,
  ...WritingLevelSlug[],
];
export const writingTopicSlugs = writingTopics.map((topic) => topic.slug) as [
  WritingTopicSlug,
  ...WritingTopicSlug[],
];

export function levelLabel(value: WritingLevelSlug) {
  return writingLevels.find((level) => level.slug === value)!.label;
}

export function topicLabel(value: WritingTopicSlug) {
  return writingTopics.find((topic) => topic.slug === value)!.label;
}

export const referenceSchema = z.object({
  id: slug,
  title: z.string().min(4).max(180),
  authors: z.array(z.string().min(2)).min(1),
  year: z.number().int().min(1900).max(2100),
  publisher: z.string().min(2).optional(),
  url: z
    .url()
    .refine((value) => !getPublicUrlIssue(value), { message: "Reference URL must be public-safe HTTPS" })
    .optional(),
});

export const writingFrontmatterSchema = z.object({
  schemaVersion: z.literal(1),
  status: z.enum(["draft", "published"]),
  section: z.enum(["learn", "blog"]),
  kind: z.enum(["article", "tutorial", "note"]),
  title: z.string().min(8).max(120),
  description: z.string().min(40).max(220),
  publishedAt: isoDate.optional(),
  updatedAt: isoDate.optional(),
  author: z.string().min(2).max(80),
  topic: z.enum(writingTopicSlugs),
  level: z.enum(writingLevelSlugs),
  tags: z.array(taxonSchema).min(1).max(8),
  coverImage: z
    .object({
      src: z.string().startsWith("/"),
      alt: z.string().min(5).max(180),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .optional(),
  projectSlugs: z.array(slug).max(6).default([]),
  relatedSlugs: z.array(slug).max(6).default([]),
  references: z.array(referenceSchema).max(30).default([]),
  featured: z.boolean().default(false),
});

export type Taxon = z.infer<typeof taxonSchema>;
export type WritingReference = z.infer<typeof referenceSchema>;
export type WritingFrontmatter = z.infer<typeof writingFrontmatterSchema>;

export interface TableOfContentsItem {
  id: string;
  depth: 2 | 3;
  title: string;
}

export interface WritingEntry extends WritingFrontmatter {
  slug: string;
  body: string;
  path: string;
  readingTime: number;
  wordCount: number;
  tableOfContents: TableOfContentsItem[];
}
