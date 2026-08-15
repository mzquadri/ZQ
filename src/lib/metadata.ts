import type { Metadata } from "next";
import { site } from "@/content/portfolio";

interface PageMetadata {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
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
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${site.name} portfolio` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}
