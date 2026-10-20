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
  /*
   * The name is written out here, rather than left to the layout's template.
   *
   * `layout.tsx` declares `title.template: "%s | Mohd Zamin Quadri"`, and every
   * other route gets the name from it: `/work` sets "Projects" and renders
   * "Projects | Mohd Zamin Quadri". A template only applies to *child* route
   * segments, though, and `app/page.tsx` is the same segment as `app/layout.tsx`
   * -- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`
   * says so outright: "title.template defined in layout.js will not apply to a
   * title defined in a page.js of the same route segment."
   *
   * So setting a bare title here does not extend the default, it replaces it,
   * and the front page was the one page on the site whose tab, bookmark and
   * search result did not carry the owner's name. Spelling it out matches the
   * layout's own default exactly and keeps the share card right too.
   */
  title: `${site.name} | ${site.role}`,
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
