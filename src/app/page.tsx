import Hero from "@/components/home/Hero";
import {
  EducationAndSkills,
  Experience,
  ResearchSummary,
  SelectedWork,
} from "@/components/home/HomeSections";
import PageShell from "@/components/PageShell";

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
