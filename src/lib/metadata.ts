import type { Metadata } from "next";
import { site } from "@/content/portfolio";

interface PageMetadata {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  imagePath?: string;
  imageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
}

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
  imagePath = "/opengraph-image",
  /*
   * The default alt for a share card, which is what nearly every route uses.
   * `${site.name} portfolio` said nothing a screen reader could use; this says
   * who and what. The layout sets the same words for the root metadata, and a
   * page with a figure worth describing passes its own.
   */
  imageAlt = `${site.name}, ${site.role} in Munich`,
  publishedTime,
  modifiedTime,
  authors,
  tags,
}: PageMetadata): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
      types: { "application/rss+xml": "/rss.xml" },
    },
    openGraph: {
      title,
      description,
      url: path,
      type,
      siteName: site.name,
      locale: "en_US",
      images: [{ url: imagePath, width: 1200, height: 630, alt: imageAlt }],
      ...(type === "article" ? { publishedTime, modifiedTime, authors, tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imagePath],
    },
  };
}
