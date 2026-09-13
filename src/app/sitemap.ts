import type { MetadataRoute } from "next";
import { projects, site } from "@/content/portfolio";
import {
  getPublishedLearnWritingByLevel,
  getPublishedLearnWritingByTopic,
  getPublishedWriting,
} from "@/content/writing/repository";
import { writingLevels, writingTopics } from "@/content/writing/schema";

export default function sitemap(): MetadataRoute.Sitemap {
  /*
   * Routes with their own page file rather than a registry entry.
   *
   * `projectRoutes` below is built from the project registry, so the two work pages that are not
   * registry projects were live, linked and reachable, and in no sitemap: /work/medico, which is
   * deliberately not filed as a case study, /work/reliable-knowledge-systems, which is the
   * public-safe model of the employer work, and /work/engineering-model, which holds the systems
   * model and the capability graph. All three are substantive pages and all three were invisible
   * to a crawler.
   */
  const routes = [
    "",
    "/work",
    "/work/engineering-model",
    "/work/repositories",
    "/work/medico",
    "/work/reliable-knowledge-systems",
    "/research",
    "/research/thesis",
    "/architecture",
    "/learn",
    "/about",
    "/contact",
  ];
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
