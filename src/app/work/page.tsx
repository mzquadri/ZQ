import type { Metadata } from "next";
import Link from "next/link";
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
    "Evidence-rich case studies across reliable knowledge systems, agent security, retrieval, MLOps and uncertainty quantification, plus a catalogued index of public repositories.",
  path: "/work",
});

/*
 * The work index.
 *
 * Two rounds of work got this page from twenty screens to five. The first moved the case studies
 * ahead of the two abstract figures and then moved those figures to a page of their own. The
 * second moved the repository catalogue to /work/repositories, which is what this comment is
 * about: at 390px the catalogue was most of an eighteen-screen page, so a visitor who came to see
 * the work scrolled past thirty repository cards to reach the end, and a visitor who came for the
 * catalogue could not link to it. A route serves both.
 *
 * What is left is three indexes and two pointers. Nothing here restates a project; each entry says
 * what kind of thing it is and what question it answers, and the case study carries the evidence.
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
          <Link href="/work/repositories">Repository index</Link>
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

      {/*
        The catalogue is a destination, not a section. A recruiter should be able to finish this
        page without meeting thirty repository cards, and anyone who wants them should be able to
        send someone a link.
      */}
      <section className="section-wrap work-onward" id="repositories">
        <SectionHeading
          index="04"
          eyebrow="Everything else"
          title="The public repositories, catalogued"
          introduction={`Beyond the case studies there are ${ecosystemRepositories.length} public repositories in ${groups.length} categories, each labelled by portfolio status rather than by technical quality.`}
        />
        <p className="hero-actions">
          <Link className="button button-primary" href="/work/repositories">
            <ArrowLabel kind="forward">Explore all public repositories</ArrowLabel>
          </Link>
          <a className="button button-secondary" href={site.github}>
            <ArrowLabel>GitHub profile</ArrowLabel>
          </a>
        </p>
      </section>

      <section className="closing-section section-wrap">
        <p className="kicker">Where the reasoning is written down</p>
        <h2>The patterns behind this work have their own explanations.</h2>
        <p>
          Idempotent ingestion, independent verification, refusal paths, retrieval that reports its
          own degradation: the engineering decisions these case studies rest on are written up as
          tutorials, with original code and stated limitations.
        </p>
        <Link className="button button-primary" href="/learn">
          <ArrowLabel kind="forward">Technical tutorials</ArrowLabel>
        </Link>
      </section>
    </PageShell>
  );
}
