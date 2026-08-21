import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PageShell from "@/components/PageShell";
import SectionHeading from "@/components/SectionHeading";
import WritingCard from "@/components/writing/WritingCard";
import { getProject, getResearchProjects, site, thesis } from "@/content/portfolio";
import { researchEvidence, researchThemes, thesisResearchPath } from "@/content/research";
import { getPublishedWritingForProject } from "@/content/writing/repository";
import { createPageMetadata } from "@/lib/metadata";
import { ExternalArrow } from "@/components/Icon";

export const metadata: Metadata = createPageMetadata({
  title: "Research",
  description:
    "Research in reliable machine learning, uncertainty quantification, graph surrogates, scientific modelling, and evidence-aware decisions.",
  path: "/research",
  imagePath: "/research/opengraph-image",
  imageAlt: "Research by Mohd Zamin Quadri — reliable machine learning from prediction to decisions",
});

export default function ResearchPage() {
  const thesisProject = getProject("transport-uq")!;
  const supportingProjects = getResearchProjects().filter((project) => project.slug !== thesisProject.slug);
  const relatedWriting = getPublishedWritingForProject(thesisProject.slug);
  const halfRetention = researchEvidence.selectiveRisk.points.find((point) => point.retentionPct === 50)!;

  return (
    <PageShell current="/research">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${site.domain}/research#collection`,
          name: "Research by Mohd Zamin Quadri",
          description:
            "Research records in reliable machine learning, uncertainty quantification, graph surrogates, and scientific modelling.",
          url: `${site.domain}/research`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: 1,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                item: {
                  "@type": "Thesis",
                  "@id": `${site.domain}${thesisResearchPath}#thesis`,
                  name: thesis.title,
                  url: `${site.domain}${thesisResearchPath}`,
                  author: { "@type": "Person", name: site.name, url: site.domain },
                },
              },
            ],
          },
        }}
      />

      <header className="page-hero research-index-hero section-wrap">
        <p className="kicker">Research / Reliable ML / Scientific modelling</p>
        <h1>From fast predictions to decisions that expose uncertainty.</h1>
        <p>
          My primary research asks how an ML surrogate can report more than a point estimate:
          where error is likely, whether uncertainty is calibrated, and when a prediction should
          enter a review queue.
        </p>
        <div className="research-audience" aria-label="Ways into the research">
          <div><span>Recruiter</span><strong>What did the work establish?</strong></div>
          <div><span>Engineer</span><strong>How does uncertainty change a system decision?</strong></div>
          <div><span>Researcher / student</span><strong>Which protocol supports each claim?</strong></div>
        </div>
      </header>

      <section className="section-wrap research-focus-section">
        <SectionHeading
          index="01"
          eyebrow="Research focus"
          title="A weighted research identity, not a flat keyword list"
          introduction="Reliable ML and uncertainty-aware graph surrogates are the primary body of work. Scientific modelling supports that direction; identifiability is an emerging mathematical inquiry rather than a claimed result."
        />
        <div className="research-theme-grid">
          {researchThemes.map((theme) => (
            <article key={theme.title}>
              <p>{theme.level}</p>
              <h3>{theme.title}</h3>
              <span>{theme.description}</span>
              <ul aria-label={`${theme.title} topics`}>
                {theme.topics.map((topic) => <li key={topic}>{topic}</li>)}
              </ul>
              {theme.projectSlugs.length > 0 ? (
                <div className="research-theme-links">
                  {theme.projectSlugs.map((slug) => {
                    const project = getProject(slug)!;
                    const href = project.researchPath ?? `/work/${project.slug}`;
                    return <Link href={href} key={slug}>{project.title} <span aria-hidden="true">→</span></Link>;
                  })}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="section-wrap primary-research-section">
        <SectionHeading
          index="02"
          eyebrow="Primary record"
          title="Uncertainty Quantification for ML Models in Transportation Policy Analysis"
          introduction="The submitted master's thesis studies a GNN surrogate for Paris capacity-reduction scenarios, with separate evidence for point accuracy, uncertainty ranking, calibration, conformal coverage, and selective review."
        />
        <article className="research-record">
          <div className="research-record-heading">
            <div>
              <p className="classification">{thesisProject.classification} / {thesis.status}</p>
              <h3>{thesis.title}</h3>
            </div>
            <p>{thesisProject.contribution}</p>
          </div>
          <dl className="research-record-metrics">
            <div><dt>Evaluated scope</dt><dd>{researchEvidence.scope.scenarios} scenarios<small>{researchEvidence.scope.predictions.toLocaleString("en-US")} link predictions</small></dd></div>
            <div><dt>Uncertainty ranking</dt><dd>ρ {researchEvidence.results.mcDropout.spearman.toFixed(3)}<small>MC uncertainty vs. absolute error</small></dd></div>
            <div><dt>Selective review</dt><dd>{halfRetention.reductionPct.toFixed(1)}%<small>Lower MAE at 50% retention</small></dd></div>
          </dl>
          <div className="research-record-actions">
            <Link className="button button-primary" href={thesisResearchPath}>Explore the thesis research <span aria-hidden="true">→</span></Link>
            <Link className="text-link" href="/work/transport-uq">Engineering case study <ExternalArrow /></Link>
            <a className="text-link" href={thesis.repository}>Canonical repository <ExternalArrow /></a>
          </div>
        </article>
      </section>

      <section className="section-wrap supporting-research-section">
        <SectionHeading
          index="03"
          eyebrow="Supporting work"
          title="Scientific uncertainty and time-dependent models"
          introduction="These projects extend the modelling context without being presented as equivalent to the thesis research record."
        />
        <div className="supporting-research-grid">
          {supportingProjects.map((project) => (
            <article key={project.slug}>
              <p>{project.classification}</p>
              <h3><Link href={`/work/${project.slug}`}>{project.title}</Link></h3>
              <span>{project.summary}</span>
              <small>{project.limitations[0]}</small>
            </article>
          ))}
          <aside>
            <p>Emerging inquiry</p>
            <h3>Neural-network identifiability</h3>
            <span>
              I am exploring how symmetries and equivalent parameterizations affect what can be
              inferred from a learned model. This is a direction of study, not a completed result.
            </span>
          </aside>
        </div>
      </section>

      {relatedWriting.length > 0 ? (
        <section className="section-wrap research-writing-section">
          <SectionHeading
            index="04"
            eyebrow="Learn"
            title="Turn the research question into an operational concept"
            introduction="The learning layer explains one decision mechanism at a time, while the thesis record preserves protocols, evidence status, and limitations."
          />
          <div className="writing-grid">
            {relatedWriting.map((entry) => <WritingCard entry={entry} key={entry.slug} />)}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
