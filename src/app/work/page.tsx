import type { Metadata } from "next";
import Link from "next/link";
import { EcosystemGroups, SnapshotNote } from "@/components/EcosystemGrid";
import PageShell from "@/components/PageShell";
import RepoShowcase from "@/components/repo-assembly/RepoShowcase";
import ProjectList from "@/components/ProjectList";
import SectionHeading from "@/components/SectionHeading";
import { ecosystemRepositories, getPopulatedCategories } from "@/content/ecosystem";
import { projects, site } from "@/content/portfolio";
import { createPageMetadata } from "@/lib/metadata";
import { ExternalArrow } from "@/components/Icon";

export const metadata: Metadata = createPageMetadata({
  title: "Selected Work",
  description:
    "Evidence-rich case studies plus a catalogued index of public repositories across reliable ML, graph neural networks, MLOps, AI applications, and scientific computing.",
  path: "/work",
});

export default function WorkPage() {
  const groups = getPopulatedCategories();
  const caseStudyCount = projects.length.toString().padStart(2, "0");

  return (
    <PageShell current="/work">
      <header className="page-hero section-wrap">
        <p className="kicker">
          Selected work / {caseStudyCount} case studies / {ecosystemRepositories.length} public repositories
        </p>
        <h1>Engineering claims that can be inspected.</h1>
        <p>
          Research, coursework, prototypes, reference implementations, and synthetic
          demonstrations are labelled separately. Every case study includes evidence and
          limitations, not only a tool list, and every repository states what it does not establish.
        </p>
        <div className="work-jump">
          <a href="#case-studies">Case studies</a>
          <a href="#ecosystem">Repository index</a>
        </div>
      </header>

      <section className="section-wrap work-index" id="case-studies">
        <SectionHeading
          index="01"
          eyebrow="Featured case studies"
          title="The work written up in full"
          introduction="Each case study states the problem, my contribution, the versioned evidence, the quality controls, and the limitations that bound the claim."
        />
        <ProjectList projects={projects} />
      </section>

      <section className="section-wrap ecosystem-index" id="ecosystem">
        <SectionHeading
          index="02"
          eyebrow="Repository index"
          title="The repositories, taken apart"
          introduction="The flagship repositories are shown as assemblies: one part for each focus area the registry records, plus its portfolio status and its evidence boundary. Categories describe status, not technical quality, and experiments are never presented as production systems."
        />
        <RepoShowcase />
        <div className="ecosystem-index-rest" data-showcase="index">
          <p className="section-index"><span>03</span>Every public repository</p>
          <EcosystemGroups groups={groups} />
          <SnapshotNote />
        </div>
        <div className="section-action">
          <a className="text-link" href={site.github}>
            Full GitHub profile <ExternalArrow />
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
        <Link className="button button-primary" href="/research">Research record <span aria-hidden="true">→</span></Link>
      </section>
    </PageShell>
  );
}
