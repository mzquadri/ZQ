import type { MetadataRoute } from "next";
import { projects, site } from "@/content/portfolio";
import { getPublishedWriting } from "@/content/writing/repository";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/work", "/research", "/research/thesis", "/learn", "/about", "/contact", "/resume"];
  const projectRoutes = projects.map((project) => `/work/${project.slug}`);
  const writingRoutes: MetadataRoute.Sitemap = getPublishedWriting().map((entry) => ({
    url: `${site.domain}${entry.path}`,
    lastModified: entry.updatedAt ?? entry.publishedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [...routes, ...projectRoutes].map((route) => ({
    url: `${site.domain}${route}`,
    changeFrequency: route === "" ? "monthly" : "yearly",
    priority: route === "" ? 1 : route.startsWith("/work/") ? 0.7 : 0.8,
  }));

  return [...staticRoutes, ...writingRoutes];
}
