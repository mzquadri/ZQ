import type { Metadata } from "next";
import { site } from "@/content/portfolio";

interface PageMetadata {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  imagePath?: string;
  imageAlt?: string;
}

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
  imagePath = "/opengraph-image",
  imageAlt = `${site.name} portfolio`,
}: PageMetadata): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      siteName: site.name,
      locale: "en_US",
      images: [{ url: imagePath, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imagePath],
    },
  };
}
