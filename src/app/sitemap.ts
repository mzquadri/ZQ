import type { MetadataRoute } from "next";
import { projects, site } from "@/content/portfolio";
import {
  getPublishedLearnWritingByLevel,
  getPublishedLearnWritingByTopic,
  getPublishedWriting,
} from "@/content/writing/repository";
import { writingLevels, writingTopics } from "@/content/writing/schema";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/work", "/research", "/research/thesis", "/learn", "/about", "/contact"];
  const projectRoutes = projects.map((project) => `/work/${project.slug}`);
  /*
   * A filter route is listed only once something is published behind it.
   *
   * The vocabulary is closed, so every topic and level resolves to a real page rather than a
   * 404, and that stays true. But submitting nine URLs when eight of them say "nothing is
   * published here yet" advertises a library that does not exist. The pages remain reachable
   * and linkable; they are simply not offered to crawlers until they have something to show.
   */
  const taxonomyRoutes = [
    ...writingTopics
      .filter((topic) => getPublishedLearnWritingByTopic(topic.slug).length > 0)
      .map((topic) => `/learn/topic/${topic.slug}`),
    ...writingLevels
      .filter((level) => getPublishedLearnWritingByLevel(level.slug).length > 0)
      .map((level) => `/learn/level/${level.slug}`),
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
