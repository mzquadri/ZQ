import type { Metadata } from "next";

import Hero from "@/components/home/Hero";
import {
  EducationAndSkills,
  Experience,
  ResearchSummary,
  SelectedWork,
} from "@/components/home/HomeSections";
import PageShell from "@/components/PageShell";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/content/portfolio";

/*
 * The home page.
 *
 * Six sections in the order someone reads them: who this is, the work, the
 * research behind it, where it was done, what was studied and with what tools.
 * Nothing is staged on scroll and nothing is pinned; the whole page is server
 * rendered and complete on first paint.
 *
 * It used to open with a two-viewport scroll-driven figure and then an index of
 * cards headed by questions. Both were replaced for the same reason: a reader
 * arriving from an application needs to know within a few seconds who this is
 * and what he has built, and a page that withholds that to be interesting
 * spends the only attention it is ever given.
 */

/*
 * The home page had no metadata of its own and inherited the layout's default
 * title with no description. A share card and a search result for the front
 * page are the two places a description matters most.
 */
export const metadata: Metadata = createPageMetadata({
  title: "AI/ML Engineer",
  /*
   * The same sentence as `site.description`, which is the default every other
   * route uses. The front page is the one that matters most in a search
   * result, so it should not be the one saying something different: this used
   * to run to thirty-one words and past the length Google renders, and the
   * second half repeated the first line of the page it was describing.
   */
  description: site.description,
  path: "/",
});

export default function Home() {
  return (
    <PageShell>
      <Hero />
      <SelectedWork />
      <ResearchSummary />
      <Experience />
      <EducationAndSkills />
    </PageShell>
  );
}
