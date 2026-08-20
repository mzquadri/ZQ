import type { MetadataRoute } from "next";
import { projects, site } from "@/content/portfolio";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/work", "/research", "/about", "/contact", "/resume"];
  const projectRoutes = projects.map((project) => `/work/${project.slug}`);

  return [...routes, ...projectRoutes].map((route) => ({
    url: `${site.domain}${route}`,
    changeFrequency: route === "" ? "monthly" : "yearly",
    priority: route === "" ? 1 : route.startsWith("/work/") ? 0.7 : 0.8,
  }));
}
