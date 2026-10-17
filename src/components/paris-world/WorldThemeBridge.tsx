"use client";

import ParisWorld from "./ParisWorld";
import { useTheme } from "@/components/ThemeToggle";

/**
 * Reads the theme off the document and hands it to the world.
 *
 * It exists because the route is a server component and the theme is only
 * known in the browser. Keeping the read in one tiny client component means
 * the world itself takes a plain boolean and has no opinion about where the
 * theme is stored, which is what makes it testable.
 *
 * It carries no heading of its own: the world and its fallback each render the
 * page's only h1, and an extra screen-reader one here would make two.
 */
export default function WorldThemeBridge() {
  const dark = useTheme();
  return <ParisWorld dark={dark} />;
}
