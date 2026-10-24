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
import CaseScene from "@/components/cinema/CaseScene";
import AuthorshipWorld from "@/components/authorship-world/AuthorshipWorld";
import CareerWorld from "@/components/career-world/CareerWorld";
import GatewayWorld from "@/components/gateway-world/GatewayWorld";
import NlpWorld from "@/components/nlp-world/NlpWorld";
import ThesisWorld from "@/components/thesis-world/ThesisWorld";
import ThesisWorldFlat from "@/components/thesis-world/ThesisWorldFlat";
import SceneIdentity from "@/components/sequence/SceneIdentity";
import WritingCard from "@/components/writing/WritingCard";
import { getPublishedWritingForProject } from "@/content/writing/repository";
import RatingAmplification from "@/components/research/RatingAmplification";
import {
  GatewayBypass,
  GatewayComparison,
  GatewayControls,
  GatewayFailures,
  GatewayLimits,
  GatewayProvenance,
  TrustBoundary,
} from "@/components/research/GatewayStory";
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
import { walkthroughSteps } from "@/content/legal-kb-walkthrough";
import WalkthroughLauncher from "@/components/legal-kb/WalkthroughLauncher";
import { getProject, isEmployerConfidential, projects, site } from "@/content/portfolio";
import { createPageMetadata } from "@/lib/metadata";
import { ArrowLabel, ExternalArrow } from "@/components/Icon";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

/*
 * A slug this build did not prerender does not exist.
 *
 * `dynamicParams` defaults to true, which means a request for any other slug is
 * rendered on demand instead of refused. `/learn/[slug]`, `/learn/topic/[topic]`
 * and `/learn/level/[level]` all set it to false; this route, the only one that
 * can render the confidential case study, did not.
 *
 * What that cost: `generateStaticParams` is built from `projects`, which is
 * already filtered by `isPublishable`, so a drafts-hidden build correctly
 * prerendered nothing for the withheld study. A request for it still reached
 * the page, which called `getProject` again *at request time*, against an
 * environment that might no longer say the same thing. A server started without
 * `HIDE_DRAFTS` set then rendered the whole case study at HTTP 200 and wrote it
 * into the route cache, where every later request was served it, including from
 * a process that did have the variable set.
 *
 * Production was never exposed, because `VERCEL_ENV` is "production" at build
 * and at runtime and the first clause of `draftsAreVisible` holds on its own.
 * But that is the draft staying withheld because an environment variable agreed
 * with itself, and the rule for this material is that it must 404. With this
 * line the absence is a property of the build: there is no route to render.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return createPageMetadata({
    title: project.title,
    // The search snippet where one is written, the page prose otherwise. The
    // JSON-LD below keeps the full summary: structured data is not truncated.
    description: project.metaDescription ?? project.summary,
    path: `/work/${project.slug}`,
    type: "article",
    imagePath: `/work/${project.slug}/opengraph-image`,
    imageAlt: `${project.title}, ${project.classification} case study`,
  });
}


/**
 * Wraps the article in the walkthrough controller, but only where a walkthrough exists.
 *
 * The script is read here, on the server, and handed down. It is the only place it is read from,
 * so a build with no guided project emits none of it.
 */
function ArticleShell({ guided, children }: { guided: boolean; children: React.ReactNode }) {
  if (!guided) return <article>{children}</article>;
  return <GuidedArticle steps={walkthroughSteps}>{children}</GuidedArticle>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  // Only this case study has a guided run, so only it pays for the controller.
  const guided = project.slug === "legal-knowledge-platform";
  /*
   * At most three.
   *
   * The public-safe model is named by eight tutorials, and rendering all eight closed that case
   * study with more cards than it had sections. Three is what the tutorial routes already show
   * each other; /learn/all is one click from every card.
   */
  const relatedWriting = getPublishedWritingForProject(project.slug).slice(0, 3);

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
        {/*
          The object the reader just clicked, opening under their scroll.

          This is the scene the hero shows at rest, run as a pure function of scroll position
          against a pinned full-bleed canvas. It is deliberately above the WebGL world rather than
          instead of it: the scene is the identity of the project and renders at every width, on
          every renderer and under reduced motion, where a world is gated on all three. On a phone
          this is the only moving stage a page has.
        */}
        <CaseScene slug={project.slug} />

        <div>
        {/*
          The thesis world, on the case study as well as on the thesis record.

          These are two pages about one piece of work, and the world draws the surrogate with its
          uncertainty on it - which is the subject of both. Building a second world for this page
          would mean two different pictures of one system, which is the exact mistake the opening
          figures were rewritten to end: transport once showed an extruded bar field here and a
          flat isometric network on the homepage, recognisably the same topic and visibly not the
          same picture.
        */}
        {project.slug === "transport-uq" ? <ThesisWorld flat={<ThesisWorldFlat />} /> : null}

        {/*
          Five solids sized by the whole of each component's history, with the share that is mine
          lit inside them. The dark part is never shrunk - that is the point of the figure - and
          one of the five never lights at all.
        */}
        {project.slug === "ai-engineering-portfolio" ? (
          <AuthorshipWorld flat={<SceneIdentity slug="ai-engineering-portfolio" />} />
        ) : null}

        {/*
          Seven weighted terms with a ceiling over each, and the two flat penalties drawn in the
          same unit so that passing through a ceiling is a fact about the picture rather than a
          claim made over it.
        */}
        {project.slug === "jobhunter" ? (
          <CareerWorld flat={<SceneIdentity slug="jobhunter" />} />
        ) : null}

        {/*
          A road that stops at a barrier, then the fixture's vocabulary separating into four
          columns. The refusal is animated rather than labelled: nothing is drawn continuing past
          the barrier, because nothing does.
        */}
        {project.slug === "nlp-transformers" ? (
          <NlpWorld flat={<SceneIdentity slug="nlp-transformers" />} />
        ) : null}

        {/*
          The boundary, in depth. Its flat figure is the project's own scene at rest - the same
          drawing the hero and the stage above use - because this project has never had a second
          one: it postdates the procedural scene runtime, and inventing a separate static diagram
          for the fallback would mean maintaining two pictures of one argument.
        */}
        {project.slug === "mcp-policy-gateway" ? (
          <GatewayWorld flat={<SceneIdentity slug="mcp-policy-gateway" />} />
        ) : null}

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

        {/*
          The amplification, under the reader's own hand. The page reports it at two stages; this is
          where the reason becomes a derivative rather than a pair of numbers.
        */}
        {project.slug === "hydrology-uq" ? (
          <section className="section-wrap visual-section" aria-label="How gauge uncertainty becomes discharge uncertainty">
            <RatingAmplification />
          </section>
        ) : null}

        {/*
          The gateway's case study runs in the order the argument does: the trust boundary first,
          because everything else depends on the reader accepting that the three moments differ;
          then the controls; then the comparison, which is the finding; then what does not hold.
          Provenance sits at the end rather than the top - it is a claim about authorship, and it
          reads better once there is something to attribute.
        */}
        {project.slug === "mcp-policy-gateway" ? (
          <>
            <section className="section-wrap visual-section" aria-label="What an MCP client trusts, and when">
              <TrustBoundary />
            </section>
            <section className="section-wrap visual-section" aria-label="The controls and where uncertainty lives">
              <GatewayControls />
            </section>
            <section className="section-wrap visual-section" aria-label="Attacks caught against legitimate traffic refused">
              <GatewayComparison />
            </section>
            <section className="section-wrap visual-section" aria-label="Known failures">
              <GatewayFailures />
            </section>
            <section className="section-wrap visual-section" aria-label="A bypass found by the integration tests">
              <GatewayBypass />
            </section>
            <section className="section-wrap visual-section" aria-label="Limitations of a deterministic design">
              <GatewayLimits />
            </section>
            <section className="section-wrap visual-section" aria-label="Upstream dependency and original work">
              <GatewayProvenance />
            </section>
          </>
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
            <p className="section-index">Problem</p>
            <h2>Why this work exists</h2>
            <p>{project.problem}</p>
          </div>
          <div>
            <p className="section-index">Contribution</p>
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
          <p className="section-index">System</p>
          <h2>Workflow and decisions</h2>
          {project.systemSummary ? <p className="system-summary">{project.systemSummary}</p> : null}
          <ol className="workflow-list">
            {project.workflow.map((step, index) => (
              <li key={step}>
                <span>{(index + 1).toString()}</span>
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
          <p className="section-index">Evidence</p>
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
            <p className="section-index">Inspection points</p>
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
            <p className="section-index">Quality controls</p>
            <h2>How the work is checked</h2>
            <ul className="editorial-list positive-list">
              {project.quality.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="limitation-panel">
            <p className="section-index">Limitations</p>
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
        {/*
          The tutorials written from this work.

          The link graph was one-directional: a tutorial named the projects it came from, and no
          project said which reasoning had been written up. A reader who wanted the engineering
          behind a case study had no way from here to the piece that explains it.
        */}
        {relatedWriting.length > 0 ? (
          <section className="section-wrap article-related" aria-labelledby="related-writing-title">
            <p className="section-index"><span>Learn</span>The reasoning, written up</p>
            <h2 id="related-writing-title">
              {relatedWriting.length === 1 ? "A tutorial from this work" : "Tutorials from this work"}
            </h2>
            <div className="writing-grid">
              {relatedWriting.map((entry) => <WritingCard entry={entry} key={entry.slug} />)}
            </div>
          </section>
        ) : null}

        {/* The way onward is the next system, not the index. */}
        <NextSystem slug={project.slug} />
      </ArticleShell>
    </PageShell>
  );
}
