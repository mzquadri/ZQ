import Link from "next/link";

import HeroStage from "@/components/cinema/HeroStage";
import {
  ClosingSection,
  ExperienceSection,
  HomeLearn,
  ResearchSection,
} from "@/components/cinema/HomeSections";
import PortfolioIndex from "@/components/index/PortfolioIndex";
import PageShell from "@/components/PageShell";
import { flagshipItems } from "@/content/index-items";
import { chapters } from "@/content/cinema";

/*
 * The homepage is a router, not a copy of the site.
 *
 * It used to be one continuous reel: the hero, then nine projects at a full viewport each, then
 * the approach, the research and the roles. Measured, it came to 49,945px - fifty-five screens -
 * with the last project link at 47,485px. A reader who arrived for one specific project had to
 * scroll past eight others to learn whether it was there, and a reader who wanted an overview
 * never got one, because no single screen held more than a single project.
 *
 * The reel was good at the wrong job. Choosing and reading want different shapes: a compact index
 * to choose from, then a page long enough to read properly. Nothing was thrown away - the stages
 * moved to each project's own detail page, which is where the method, the evidence and the
 * limitations already lived.
 *
 * What is left is one screen of identity, one of choice, then short previews of the other three
 * things a visitor might have come for. Everything is server-rendered and nothing is staged on
 * scroll, so the index is complete on first paint rather than assembled as the reader descends.
 */

export default function Home() {
  return (
    <PageShell>
      <HeroStage />

      <section className="chapter-intro" id="work">
        <div className="chapter-intro-inner">
          <p className="chapter-intro-index" aria-hidden="true">{chapters.work.index}</p>
          <p className="chapter-intro-eyebrow">{chapters.work.eyebrow}</p>
          <h2 className="chapter-intro-title">{chapters.work.title}</h2>
          <p className="chapter-intro-lede">{chapters.work.introduction}</p>

          <PortfolioIndex items={flagshipItems} label="Selected work" tone="stage" />

          <p className="chapter-intro-action">
            <Link className="cine-cta cine-cta-quiet mz-interactive" href="/work">
              Every project and repository
            </Link>
          </p>
        </div>
      </section>

      <ResearchSection />
      <HomeLearn />
      <ExperienceSection />
      <ClosingSection />
    </PageShell>
  );
}
