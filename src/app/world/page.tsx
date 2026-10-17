import type { Metadata } from "next";

import ThemeToggle from "@/components/ThemeToggle";
import WorldThemeBridge from "@/components/paris-world/WorldThemeBridge";

export const metadata: Metadata = {
  title: "The world",
  description:
    "An explorable map of the work, built on the Paris road network from the thesis. Six places, each with one real result. A classic view is one click away.",
};

/**
 * The world route.
 *
 * Deliberately not the site root yet. The root is the page that already works,
 * and this is the prototype under review; promoting it is a separate decision
 * once the look is approved, and doing it that way means the site is never
 * briefly worse than it was.
 */
export default function WorldPage() {
  return (
    <main className="world-root">
      <div className="world-theme">
        <ThemeToggle />
      </div>
      <WorldThemeBridge />
    </main>
  );
}
