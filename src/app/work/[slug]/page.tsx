import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import CaseHero from "@/components/cinema/CaseHero";
import CaseStory from "@/components/cinema/CaseStory";
import InsureAssistWorld from "@/components/insureassist-world/InsureAssistWorld";
import HydrologyWorld from "@/components/hydrology-world/HydrologyWorld";
import HydrologyWorldFlat from "@/components/hydrology-world/HydrologyWorldFlat";
import MlopsWorld from "@/components/mlops-world/MlopsWorld";
import CifarWorld from "@/components/cifar-world/CifarWorld";
import CifarWorldFlat from "@/components/cifar-world/CifarWorldFlat";
import StreamflowWorld from "@/components/streamflow-world/StreamflowWorld";
import StreamflowWorldFlat from "@/components/streamflow-world/StreamflowWorldFlat";
import MlopsWorldFlat from "@/components/mlops-world/MlopsWorldFlat";
import InsureAssistWorldFlat from "@/components/insureassist-world/InsureAssistWorldFlat";
import PageShell from "@/components/PageShell";
import { HeldOutResultFigure, ReferenceRunTerminal } from "@/components/MlopsVisuals";
import { MlopsPipeline, SelectiveRiskChart, ThesisPipeline } from "@/components/ResearchVisuals";
import NextSystem from "@/components/cinema/NextSystem";
import RetrievalSelection from "@/components/research/RetrievalSelection";
import {
  ThesisArchitecture,
  ThesisBaselineComparison,
  ThesisTrialLog,
} from "@/components/research/ThesisModelAudit";
import {
  ClosingAnnotation,
  ConfidenceLadder,
  RepresentationFanOut,
  SourceChangeConvergence,
  StoredIsNotCorrect,
} from "@/components/legal-kb/LegalKbVisuals";
import GuidedArticle from "@/components/legal-kb/GuidedArticle";
import WalkthroughLauncher from "@/components/legal-kb/WalkthroughLauncher";
import { getProject, isEmployerConfidential, projects, site } from "@/content/portfolio";
import { createPageMetadata } from "@/lib/metadata";
import { ArrowLabel, ExternalArrow } from "@/components/Icon";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return createPageMetadata({
    title: project.title,
    description: project.summary,
    path: `/work/${project.slug}`,
    type: "article",
    imagePath: `/work/${project.slug}/opengraph-image`,
    imageAlt: `${project.title} — ${project.classification} case study`,
  });
}


/** Wraps the article in the walkthrough controller, but only where a walkthrough exists. */
function ArticleShell({ guided, children }: { guided: boolean; children: React.ReactNode }) {
  if (!guided) return <article>{children}</article>;
  return <GuidedArticle>{children}</GuidedArticle>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  // Only this case study has a guided run, so only it pays for the controller.
  const guided = project.slug === "legal-knowledge-platform";

  return (
    <PageShell current="/work">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.summary,
          author: project.authors.map((author) => ({ "@type": "Person", ...author })),
          creditText: project.projectRole,
          sourceOrganization: project.institution
            ? { "@type": "Organization", name: project.institution }
            : undefined,
          url: `${site.domain}/work/${project.slug}`,
          // Dropped from the serialized output for confidential work rather than emitted empty:
          // a case study with no public source must not advertise one in its structured data.
          codeRepository: isEmployerConfidential(project) ? undefined : project.repository,
          genre: project.classification,
        }}
      />
      <ArticleShell guided={guided}>
        <CaseHero project={project}>
          {isEmployerConfidential(project) ? (
            <>
              <p className="case-confidential">
                Employer work. The source cannot be shown, so this page describes the architecture
                and the reasoning in generic terms and publishes no corpus content.
              </p>
              {guided ? <WalkthroughLauncher /> : null}
            </>
          ) : (
            <a className="cine-cta mz-interactive" href={project.repository}>
              Inspect repository
            </a>
          )}
        </CaseHero>

        {/*
          The InsureAssist world runs full-bleed, before the prose and before the hero copy has
          been read. Its eleven states are driven entirely by the repository's frozen reference
          run, so a reader who scrolls it has seen the real held-out result before reaching a
          paragraph about it.
        */}
        {/*
          The worlds themselves. They no longer carry the view-transition name: it moved up to the
          opening figure, which is the object a visitor actually clicked and the only one of the
          two that is on screen when the navigation happens.
        */}
        <div>
        {project.slug === "insureassist-rag" ? (
          <InsureAssistWorld flat={<InsureAssistWorldFlat />} />
        ) : null}

        {/*
          The release machine, before the prose. Every threshold it shows is generated from the
          repository's own config, and the gate it draws is the one the code composes.
        */}
        {/*
          How the retrieval configuration was chosen, and the gap between the score that chose it
          and the score on questions it had not seen.
        */}
        {project.slug === "insureassist-rag" ? (
          <section className="section-wrap visual-section" aria-label="How the retrieval configuration was selected">
            <RetrievalSelection />
          </section>
        ) : null}

        {project.slug === "mlops-reference-pipeline" ? (
          <MlopsWorld flat={<MlopsWorldFlat />} />
        ) : null}

        {/*
          Two perturbations of one calibrated event. The bands are the seminar's own fitted rating
          curve evaluated either side of the gauge reading, so the comparison is measured, not drawn.
        */}
        {project.slug === "hydrology-uq" ? (
          <HydrologyWorld flat={<HydrologyWorldFlat />} />
        ) : null}

        {/*
          The benchmark's own leaderboard, then what each row was scored on. Every number is
          reproduced from the repository's fixed-seed generator and its tracked model file.
        */}
        {project.slug === "streamflow-forecasting" ? (
          <StreamflowWorld flat={<StreamflowWorldFlat />} />
        ) : null}

        {/*
          One 32-pixel image taken apart, then the confusion matrix that the finished model
          produces over ten thousand of them. Shapes are measured from the module itself.
        */}
        {project.slug === "cifar10-cnn" ? <CifarWorld flat={<CifarWorldFlat />} /> : null}
        </div>

        {/* The showpiece sits before the prose: the page argues visually first, then explains. */}
        {project.slug === "legal-knowledge-platform" ? (
          <section
            aria-label="What one published document becomes, and who writes each part"
            className="section-wrap visual-section visual-section-lead"
          >
            <RepresentationFanOut />
          </section>
        ) : null}

        <section className="section-wrap case-section two-column-copy">
          <div>
            <p className="section-index"><span>01</span>Problem</p>
            <h2>Why this work exists</h2>
            <p>{project.problem}</p>
          </div>
          <div>
            <p className="section-index"><span>02</span>Contribution</p>
            <h2>What I can claim</h2>
            <p>{project.contribution}</p>
          </div>
        </section>

        {project.slug === "legal-knowledge-platform" ? (
          <section aria-label="Why a count is not a check" className="section-wrap visual-section">
            <StoredIsNotCorrect />
          </section>
        ) : null}

        {project.slug === "transport-uq" ? (
          <section className="section-wrap visual-section" aria-label="Thesis system and result">
            <ThesisPipeline />
            <ThesisArchitecture />
            {/*
              The comparison the surrogate loses, placed before the one it wins. A reader who takes
              only one number from this page should take the one that qualifies the rest of it.
            */}
            <ThesisBaselineComparison />
            <ThesisTrialLog />
            <SelectiveRiskChart />
          </section>
        ) : null}

        {project.slug === "mlops-reference-pipeline" ? (
          <section className="section-wrap visual-section" aria-label="MLOps architecture and held-out result">
            <MlopsPipeline />
            <ReferenceRunTerminal />
            <HeldOutResultFigure />
          </section>
        ) : null}

        <CaseStory project={project} />

        <section className="section-wrap case-section">
          <p className="section-index"><span>03</span>System</p>
          <h2>Workflow and decisions</h2>
          {project.systemSummary ? <p className="system-summary">{project.systemSummary}</p> : null}
          <ol className="workflow-list">
            {project.workflow.map((step, index) => (
              <li key={step}>
                <span>{(index + 1).toString().padStart(2, "0")}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
          <ul className="tool-list case-tools" aria-label="Technologies used">
            {project.tools.map((tool) => <li key={tool}>{tool}</li>)}
          </ul>
        </section>

        {project.slug === "legal-knowledge-platform" ? (
          <section className="section-wrap visual-section" aria-label="What an amended source changes, and what each class of evidence establishes">
            <SourceChangeConvergence />
            <ConfidenceLadder />
          </section>
        ) : null}

        <section className="section-wrap case-section evidence-section">
          <p className="section-index"><span>04</span>Evidence</p>
          <h2>What is actually versioned</h2>
          <div className="metric-grid">
            {project.evidence.map((metric) => (
              <div className="metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.note}</p>
              </div>
            ))}
          </div>
        </section>

        {project.artifacts ? (
          <section className="section-wrap case-section artifact-section">
            <p className="section-index"><span>05</span>Inspection points</p>
            <h2>Go directly to the evidence</h2>
            <div className="artifact-links">
              {project.artifacts.map((artifact) => (
                <a href={artifact.href} key={artifact.href}>
                  <strong>{artifact.label}</strong>
                  <span>{artifact.note}</span><ExternalArrow />
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section-wrap case-section quality-grid">
          <div>
            <p className="section-index"><span>{project.artifacts ? "06" : "05"}</span>Quality controls</p>
            <h2>How the work is checked</h2>
            <ul className="editorial-list positive-list">
              {project.quality.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="limitation-panel">
            <p className="section-index"><span>{project.artifacts ? "07" : "06"}</span>Limitations</p>
            <h2>Where the evidence stops</h2>
            <ul className="editorial-list">
              {project.limitations.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="case-learning section-wrap">
          <p className="kicker">What this changed in my practice</p>
          {/* A pull-quote that is really a paragraph gets paragraph-sized type. General rule, not
              a per-project override: the slot is designed for a sentence or two. */}
          <blockquote data-length={project.learned.trim().split(/\s+/).length > 40 ? "long" : undefined}>
            {project.learned}
          </blockquote>
          {project.slug === "legal-knowledge-platform" ? <ClosingAnnotation /> : null}
          {project.nextStep ? <p className="next-step"><strong>Next evidence milestone:</strong> {project.nextStep}</p> : null}
          <div className="case-actions">
            {project.researchPath ? (
              <Link className="text-link" href={project.researchPath}>
<ArrowLabel kind="forward">Scientific research record</ArrowLabel>
              </Link>
            ) : null}
            {isEmployerConfidential(project) ? null : (
              <a className="text-link" href={project.repository}>
                <ArrowLabel>Source and documentation</ArrowLabel>
              </a>
            )}
            <Link className="text-link" href="/contact">
<ArrowLabel kind="forward">Discuss relevant work</ArrowLabel>
            </Link>
          </div>
        </section>
        {/* The way onward is the next system, not the index. */}
        <NextSystem slug={project.slug} />
      </ArticleShell>
    </PageShell>
  );
}
