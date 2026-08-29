import Link from "next/link";

import HeroStage from "@/components/cinema/HeroStage";
import {
  ClosingSection,
  EngineeringSection,
  ExperienceSection,
  ResearchSection,
} from "@/components/cinema/HomeSections";
import ExhibitionIndex from "@/components/cinema/ExhibitionIndex";
import WorkChapters from "@/components/cinema/WorkChapters";
import PageShell from "@/components/PageShell";
import StrongWorkBand from "@/components/cinema/StrongWork";
import { chapters } from "@/content/cinema";

/*
 * The homepage is one continuous stage.
 *
 * It opens by drawing the argument the rest of the site is about, then runs eight projects as a
 * reel - each one a full stage rather than a card - and then the approach, the research and the
 * roles behind them. The order is deliberate: a visitor should be able to stop after any chapter
 * and have taken something real from it.
 *
 * Two chapters used to sit outside that reel. Medico was appended after the sequence had closed,
 * and the current-engineering work was a section further down the page, which meant the two pieces
 * of work a visitor most needs to see were the two furthest from the top. Both are now in the
 * running order.
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
          <ExhibitionIndex />
        </div>
      </section>

      <WorkChapters />

      {/*
        The second movement. Eight flagships run above; these nine repositories are the rest of
        the public work, and they are staged rather than listed because each has an end-to-end
        story. What they are organised by is what each one can actually prove.
      */}
      <StrongWorkBand />

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
