import type { MetadataRoute } from "next";
import { projects, site } from "@/content/portfolio";
import { getPublishedWriting } from "@/content/writing/repository";
import { writingLevels, writingTopics } from "@/content/writing/schema";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/work", "/research", "/research/thesis", "/learn", "/about", "/contact", "/resume"];
  const projectRoutes = projects.map((project) => `/work/${project.slug}`);
  // Generated filter routes are crawlable from the day the vocabulary exists, before any
  // filter interface points at them.
  const taxonomyRoutes = [
    ...writingTopics.map((topic) => `/learn/topic/${topic.slug}`),
    ...writingLevels.map((level) => `/learn/level/${level.slug}`),
  ];
  const writingRoutes: MetadataRoute.Sitemap = getPublishedWriting().map((entry) => ({
    url: `${site.domain}${entry.path}`,
    lastModified: entry.updatedAt ?? entry.publishedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [...routes, ...projectRoutes, ...taxonomyRoutes].map((route) => ({
    url: `${site.domain}${route}`,
    changeFrequency: route === "" ? "monthly" : "yearly",
    priority: route === "" ? 1 : route.startsWith("/learn/") ? 0.5 : route.startsWith("/work/") ? 0.7 : 0.8,
  }));

  return [...staticRoutes, ...writingRoutes];
}
