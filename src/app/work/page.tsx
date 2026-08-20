import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import ProjectList from "@/components/ProjectList";
import { projects } from "@/content/portfolio";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Selected Work",
  description:
    "Evidence-rich case studies in reliable ML, graph neural networks, MLOps, AI applications, and scientific computing.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <PageShell current="/work">
      <header className="page-hero section-wrap">
        <p className="kicker">Selected work / {projects.length.toString().padStart(2, "0")} case studies</p>
        <h1>Engineering claims that can be inspected.</h1>
        <p>
          Research, coursework, prototypes, reference implementations, and synthetic
          demonstrations are labelled separately. Every case study includes evidence and
          limitations, not only a tool list.
        </p>
      </header>
      <section className="section-wrap work-index" aria-labelledby="work-index-title">
        <h2 id="work-index-title" className="visually-hidden">Project case studies</h2>
        <ProjectList projects={projects} />
      </section>
    </PageShell>
  );
}
