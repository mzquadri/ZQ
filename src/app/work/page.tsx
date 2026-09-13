import type { Metadata } from "next";
import Link from "next/link";
import { EcosystemGroups, SnapshotNote } from "@/components/EcosystemGrid";
import { StageHero } from "@/components/cinema/PageStages";
import PortfolioIndex from "@/components/index/PortfolioIndex";
import PageShell from "@/components/PageShell";
import SectionHeading from "@/components/SectionHeading";
import { ecosystemRepositories, getPopulatedCategories } from "@/content/ecosystem";
import { registryItems, selectedItems, supportingItems } from "@/content/index-items";
import { projects, site } from "@/content/portfolio";
import { createPageMetadata } from "@/lib/metadata";
import { ArrowLabel } from "@/components/Icon";

export const metadata: Metadata = createPageMetadata({
  title: "Selected Work",
  description:
    "Evidence-rich case studies plus a catalogued index of public repositories across reliable ML, graph neural networks, MLOps, AI applications, and scientific computing.",
  path: "/work",
});

/*
 * The work index.
 *
 * This page used to describe the same nine projects twice in a row - once as marks, once as a list
 * - and then spend eight screens on two abstract figures: a synthetic systems model and a node
 * graph of how the work connects. Measured, it came to 18,197px, twenty screens, with the last
 * project link at 16,894px.
 *
 * Both figures are good, and neither is navigation. Someone who has opened /work has already
 * decided to look at projects; asking them to read a conceptual model first answers a question
 * they did not ask. They now have their own page, /work/engineering-model, reached from the index
 * like anything else. Nothing was cut.
 *
 * What is left is four lists, tiered by what they can prove: the work with the strongest evidence,
 * the employer surfaces published under their own review, the coursework and experiments, and the
 * repository catalogue at the bottom where a catalogue belongs.
 */

/**
 * The employer surfaces that are not themselves case studies on this site.
 *
 * The two employer case studies that do have detail pages are in the selected index above, so
 * naming them again here would rebuild the duplication this page was rewritten to remove.
 */
const PROFESSIONAL = [
  {
    slug: "architecture-site",
    title: "Architecture case studies",
    kind: "BP-ITCS / Separate site",
    summary:
      "Twenty diagrams of the systems contributed to at BP-ITCS, published under their own redaction review, with a contribution map that says what was and was not mine.",
    href: "/architecture",
    accent: "var(--accent-corpus)",
  },
  {
    slug: "engineering-model",
    title: "Engineering model",
    kind: "Public-safe model / Synthetic",
    summary:
      "One source, several representations, independently checked: the problem class the employer work sits in, modelled with synthetic data and no real system named.",
    href: "/work/engineering-model",
    accent: "var(--accent-pipeline)",
  },
] as const;

export default function WorkPage() {
  const groups = getPopulatedCategories();
  const caseStudyCount = projects.length.toString().padStart(2, "0");
  const supporting = [...supportingItems, ...registryItems(projects)];

  return (
    <PageShell current="/work">
      <StageHero
        accent="var(--accent-graph)"
        eyebrow="Selected work"
        title="Engineering claims that can be inspected."
        standfirst="Research, coursework, prototypes, reference implementations, and synthetic demonstrations are labelled separately. Every case study includes evidence and limitations, not only a tool list, and every repository states what it does not establish."
        meta={[
          { label: "Case studies", value: caseStudyCount },
          { label: "Public repositories", value: ecosystemRepositories.length.toString() },
        ]}
      >
        <div className="work-jump">
          <a href="#selected">Selected work</a>
          <a href="#professional">Professional engineering</a>
          <a href="#supporting">Supporting projects</a>
          <a href="#ecosystem">Repository index</a>
        </div>
      </StageHero>

      <section className="section-wrap work-index" id="selected">
        <SectionHeading
          index="01"
          eyebrow="Selected work"
          title="The work written up in full"
          introduction="Each case study states the problem, my contribution, the versioned evidence, the quality controls, and the limitations that bound the claim."
        />
        <PortfolioIndex items={selectedItems} label="Selected work" />
      </section>

      <section className="section-wrap work-index" id="professional">
        <SectionHeading
          index="02"
          eyebrow="Professional engineering"
          title="Employer work, at the level it can be published"
          introduction="What can be shown of the BP-ITCS systems is published two ways: as named architecture on a separate site with its own approval, and as a synthetic model here where the class of problem is the content rather than the system."
        />
        <PortfolioIndex items={PROFESSIONAL} label="Professional engineering" numbered={false} />
      </section>

      <section className="section-wrap work-index" id="supporting">
        <SectionHeading
          index="03"
          eyebrow="Supporting projects"
          title="Coursework, references and experiments"
          introduction="Smaller in scope and weaker in evidence than the work above, and labelled that way rather than presented as equivalent. Each one still says what it establishes and what it does not."
        />
        <PortfolioIndex items={supporting} label="Supporting projects" numbered={false} />
      </section>

      <section className="section-wrap ecosystem-index" id="ecosystem">
        <SectionHeading
          index="04"
          eyebrow="Repository index"
          title="Every public repository"
          introduction="Categories describe status, not technical quality. Experiments are never presented as production systems, and a repository that carries no evidence says so in its own entry."
        />
        <div className="ecosystem-index-rest" data-showcase="index">
          <EcosystemGroups groups={groups} />
          <SnapshotNote />
        </div>
        <div className="section-action">
          <a className="text-link" href={site.github}>
            <ArrowLabel>Full GitHub profile</ArrowLabel>
          </a>
        </div>
      </section>

      <section className="closing-section section-wrap">
        <p className="kicker">Reading the labels</p>
        <h2>Not every repository is flagship work, and none of them pretend to be.</h2>
        <p>
          Reference and experiment repositories are kept public because the reasoning in them is
          useful, not because they carry production evidence. Where a claim needs proof, the case
          study links directly to the artifact.
        </p>
        <Link className="button button-primary" href="/research"><ArrowLabel kind="forward">Research record</ArrowLabel></Link>
      </section>
    </PageShell>
  );
}
