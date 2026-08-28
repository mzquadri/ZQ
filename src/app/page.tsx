import Link from "next/link";

import HeroStage from "@/components/cinema/HeroStage";
import {
  ClosingSection,
  EngineeringSection,
  ExperienceSection,
  ResearchSection,
} from "@/components/cinema/HomeSections";
import WorkChapters from "@/components/cinema/WorkChapters";
import MedicoChapter from "@/components/cinema/MedicoChapter";
import PageShell from "@/components/PageShell";
import { chapters } from "@/content/cinema";

/*
 * The homepage is one continuous stage.
 *
 * It opens by drawing the argument the rest of the site is about, then walks six projects, each
 * as the mechanism it actually is, then the engineering, the research and the roles behind them.
 * The order is deliberate: a visitor should be able to stop after any section and have taken
 * something real from it.
 *
 * Everything here is server-rendered, and the page ships no animation JavaScript at all.
 *
 * Two surfaces that used to live here now live where they are more useful rather than being
 * duplicated: the repository catalogue is the third section of /work, and the capability and
 * systems-graph material is covered by the work sequence and the systems showcase. The closing
 * links to both.
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
        </div>
      </section>

      <WorkChapters />

      {/* Filed after the case studies and labelled as what it is: a prototype with no results. */}
      <MedicoChapter />

      <section className="chapter-outro">
        <Link className="cine-cta cine-cta-quiet mz-interactive" href="/work">
          View the full portfolio
        </Link>
      </section>

      <EngineeringSection />
      <ResearchSection />
      <ExperienceSection />
      <ClosingSection />
    </PageShell>
  );
}
