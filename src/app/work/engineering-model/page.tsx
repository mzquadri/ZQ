import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLabel } from "@/components/Icon";
import PageShell from "@/components/PageShell";
import SectionHeading from "@/components/SectionHeading";
import SystemGraph from "@/components/SystemGraph";
import SystemsShowcase from "@/components/systems-showcase/SystemsShowcase";
import { showcase } from "@/content/systems-showcase";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Engineering model",
  description:
    "A synthetic model of a problem common to data platforms — one source, several representations, independently checked — and a map of where each public project sits between data and a decision.",
  path: "/work/engineering-model",
});

/*
 * The two abstract figures, given their own page.
 *
 * Both of these sat on /work, between the hero and most of the case studies: about eight screens
 * of model before the fourth project. They are not navigation, and a reader who has opened /work
 * has already decided to look at projects. Moving them here costs one click for the reader who
 * wants them and saves eight screens for the reader who does not.
 *
 * They belong together. One says what the problem class looks like; the other says where each
 * public artifact sits inside it. Neither describes a real employer system: the model is synthetic
 * throughout, and the graph labels every node as either evidenced by a public artifact or as a
 * direction of study with nothing behind it yet.
 */
export default function EngineeringModelPage() {
  return (
    <PageShell current="/work">
      <article>
        <header className="page-hero section-wrap">
          <Link className="back-link" href="/work">← Selected work</Link>
          <p className="kicker">Public-safe model / Synthetic throughout</p>
          <h1>{showcase.title}</h1>
          <p>{showcase.introduction}</p>
        </header>

        <section className="section-wrap systems-showcase-section" id="model">
          <SectionHeading
            index="01"
            eyebrow={showcase.eyebrow}
            title="What gets captured, what gets derived, what a check proves"
            introduction="Every quantity below is illustrative. The interesting failure is not a store going missing; it is two stores agreeing about a total and disagreeing about everything else."
          />
          <SystemsShowcase />
        </section>

        {/* No reveal animation here: a transform on the section would become the containing
            block for the sticky graph viewport inside it. */}
        <section className="section-wrap systems-section" id="connections">
          <SectionHeading
            index="02"
            eyebrow="How the work connects"
            title="From data to a decision someone can act on"
            introduction="Select any node to see what it means here and which public artifact backs it. Dashed nodes are directions of study with no public project yet."
          />
          <SystemGraph />
        </section>

        <section className="closing-section section-wrap">
          <p className="kicker">Back to the work</p>
          <h2>The model is the frame. The case studies are the evidence.</h2>
          <p>
            Nothing on this page establishes anything on its own — it describes how the problem is
            shaped and where each project sits in it. What a claim rests on is in the case study
            that makes it.
          </p>
          <Link className="button button-primary" href="/work">
            <ArrowLabel kind="forward">Selected work</ArrowLabel>
          </Link>
        </section>
      </article>
    </PageShell>
  );
}
