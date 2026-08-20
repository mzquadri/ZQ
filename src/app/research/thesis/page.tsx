import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PageShell from "@/components/PageShell";
import {
  CalibrationComparison,
  MarginalCoverageFigure,
  ResearchMethodMatrix,
  ThesisPipeline,
} from "@/components/ResearchVisuals";
import SelectivePredictionExplorer from "@/components/SelectivePredictionExplorer";
import WritingCard from "@/components/writing/WritingCard";
import { getProject, site, thesis } from "@/content/portfolio";
import { canonicalThesisEvidence, researchEvidence, thesisResearchPath } from "@/content/research";
import { getPublishedWritingForProject } from "@/content/writing/repository";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Transport Surrogate Thesis Research",
  description:
    "A progressive research record for uncertainty-aware GNN surrogates: methods, audited findings, selective review, calibration, marginal coverage, limitations, and reproducibility.",
  path: thesisResearchPath,
  imagePath: `${thesisResearchPath}/opengraph-image`,
  imageAlt: "Transport surrogate thesis research — uncertainty, calibration, and selective review",
});

export default function ThesisResearchPage() {
  const project = getProject("transport-uq")!;
  const relatedWriting = getPublishedWritingForProject(project.slug);
  const halfRetention = researchEvidence.selectiveRisk.points.find((point) => point.retentionPct === 50)!;
  const [coverage90, coverage95] = researchEvidence.marginalCoverage;

  return (
    <PageShell current="/research">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Thesis",
          "@id": `${site.domain}${thesisResearchPath}#thesis`,
          name: thesis.title,
          description: project.summary,
          author: { "@type": "Person", name: site.name, url: site.domain },
          sourceOrganization: { "@type": "CollegeOrUniversity", name: thesis.institution },
          inSupportOf: thesis.program,
          dateCreated: thesis.submittedOn,
          creativeWorkStatus: thesis.status,
          mainEntityOfPage: `${site.domain}${thesisResearchPath}`,
          url: `${site.domain}${thesisResearchPath}`,
          sameAs: [canonicalThesisEvidence.repository, canonicalThesisEvidence.submittedPdf],
          about: [
            "Uncertainty quantification",
            "Graph neural networks",
            "Calibration",
            "Conformal prediction",
            "Selective prediction",
            "Transportation policy analysis",
          ],
        }}
      />

      <article>
        <header className="page-hero research-hero thesis-research-hero section-wrap">
          <Link className="back-link" href="/research">← Research overview</Link>
          <p className="kicker">Master&apos;s thesis / {thesis.status}</p>
          <h1>{thesis.title}</h1>
          <p>
            A scientific record of what was tested, which reliability property each method
            measures, what the aggregate evidence supports, and where the result stops.
          </p>
          <dl className="research-meta">
            <div><dt>Institution</dt><dd>{thesis.institution}</dd></div>
            <div><dt>Program</dt><dd>{thesis.program}</dd></div>
            <div><dt>Submitted</dt><dd>{thesis.submittedOn}</dd></div>
            <div><dt>Role</dt><dd>{project.projectRole}</dd></div>
          </dl>
          <div className="hero-actions">
            <a className="button button-primary" href={canonicalThesisEvidence.repository}>Canonical repository <span aria-hidden="true">↗</span></a>
            <a className="button button-secondary" href={canonicalThesisEvidence.corrigendum}>Read the corrigendum <span aria-hidden="true">↗</span></a>
          </div>
        </header>

        <section className="section-wrap research-question">
          <p className="section-index"><span>01</span>Research question</p>
          <h2>Fast prediction is useful only when failure is visible.</h2>
          <p>
            Agent-based transport simulations can be expensive to run. A graph neural network
            surrogate can approximate the change in traffic volume on each road link, but a point
            estimate alone cannot tell an analyst where that approximation is likely to fail.
          </p>
          <aside>
            <strong>Question</strong>
            <p>
              Can model uncertainty rank likely error, support calibrated or conformal intervals,
              and define a transparent retained-versus-review policy?
            </p>
          </aside>
        </section>

        <section className="section-wrap thesis-system-section">
          <div className="research-section-copy">
            <p className="section-index"><span>02</span>System context</p>
            <h2>From simulation output to a graph surrogate</h2>
            <p>
              Each scenario becomes a road-link graph. A PointNet, TransformerConv, and GAT model
              family learns the policy-induced traffic-volume change at each link. Uncertainty is
              then evaluated as a separate layer rather than inferred from point accuracy.
            </p>
          </div>
          <ThesisPipeline />
        </section>

        <section className="section-wrap method-section">
          <div className="research-section-copy">
            <p className="section-index"><span>03</span>Methods</p>
            <h2>Different tools answer different reliability questions.</h2>
            <p>
              MC Dropout and deep ensembles estimate spread in different ways. Calibration tests
              whether that spread corresponds to observed error. Conformal prediction targets
              empirical marginal coverage. Selective prediction uses a ranking to allocate review;
              it does not calibrate an interval.
            </p>
          </div>
          <ResearchMethodMatrix />
          <details className="method-inventory">
            <summary>All evaluated method families</summary>
            <ul>{researchEvidence.evaluatedMethods.map((method) => <li key={method}>{method}</li>)}</ul>
          </details>
        </section>

        <section className="section-wrap selective-research-section">
          <div className="research-section-copy">
            <p className="section-index"><span>04</span>Selective prediction</p>
            <h2>Choose review capacity; observe the retained-set trade-off.</h2>
            <p>
              Trial 8 MC Dropout uncertainty was used to sort predictions from least to most
              uncertain. The interaction below exposes six audited operating points only. Moving
              a prediction to review is a routing decision, not a declaration that it is wrong.
            </p>
          </div>
          <SelectivePredictionExplorer />
        </section>

        <section className="section-wrap calibration-research-section">
          <div className="research-section-copy">
            <p className="section-index"><span>05</span>Calibration & coverage</p>
            <h2>Ranking error is not the same as calibrating uncertainty.</h2>
            <p>
              A model can rank hard cases while still producing under-dispersed uncertainty.
              Scaling was evaluated under two distinct protocols, and split conformal coverage is
              reported separately as marginal evidence under exchangeability assumptions.
            </p>
          </div>
          <div className="calibration-visual-stack">
            <CalibrationComparison />
            <MarginalCoverageFigure />
          </div>
        </section>

        <section className="section-wrap findings-section">
          <div className="research-section-copy">
            <p className="section-index"><span>06</span>Findings</p>
            <h2>What the aggregate evidence supports</h2>
          </div>
          <div className="research-finding-grid">
            <article><span>Point prediction</span><strong>Deep ensemble</strong><p>{researchEvidence.results.deepEnsemble.members} members produced the strongest cached-test point accuracy: R² {researchEvidence.results.deepEnsemble.r2.toFixed(3)} and MAE {researchEvidence.results.deepEnsemble.mae.toFixed(2)} veh/h.</p></article>
            <article><span>Uncertainty ranking</span><strong>MC Dropout</strong><p>Trial 8 produced the stronger uncertainty–absolute-error rank association: Spearman ρ {researchEvidence.results.mcDropout.spearman.toFixed(3)}.</p></article>
            <article><span>Review trade-off</span><strong>{halfRetention.retentionPct}% retained</strong><p>Accepted-set MAE was {halfRetention.mae.toFixed(2)} veh/h, {halfRetention.reductionPct.toFixed(1)}% below accepting every cached prediction.</p></article>
            <article><span>Coverage</span><strong>Empirical marginal</strong><p>Reported split-conformal coverage was {coverage90.observedPct.toFixed(2)}% and {coverage95.observedPct.toFixed(2)}% at nominal {coverage90.nominalPct}% and {coverage95.nominalPct}%.</p></article>
          </div>
        </section>

        <section className="section-wrap reproducibility-section">
          <div className="research-section-copy">
            <p className="section-index"><span>07</span>Reproducibility boundary</p>
            <h2>Public aggregate evidence, explicit exclusions</h2>
            <p>
              The submitted PDF remains immutable and contains a numerical claim corrected after
              submission. The corrigendum and audited aggregate bundle are the current evidence
              boundary for numerical claims.
            </p>
          </div>
          <div className="evidence-boundary-grid">
            <div>
              <h3>Public record</h3>
              <ul className="editorial-list positive-list">
                {researchEvidence.publicBoundary.included.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h3>Not published here</h3>
              <ul className="editorial-list">
                {researchEvidence.publicBoundary.excluded.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
          <div className="artifact-links research-artifact-links">
            <a href={canonicalThesisEvidence.submittedPdf}><strong>Immutable submitted PDF</strong><span>Baseline artifact; read with the corrigendum.</span><span aria-hidden="true">↗</span></a>
            <a href={canonicalThesisEvidence.corrigendum}><strong>Post-submission corrigendum</strong><span>Corrections, protocol labels, and replay boundaries.</span><span aria-hidden="true">↗</span></a>
            <a href={canonicalThesisEvidence.aggregateReport}><strong>Aggregate evidence report</strong><span>Privacy-safe findings generated from controlled artifacts.</span><span aria-hidden="true">↗</span></a>
            <a href={canonicalThesisEvidence.provenance}><strong>Artifact provenance</strong><span>Hashes, immutable boundaries, and excluded assets.</span><span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section className="section-wrap limitation-section">
          <div>
            <p className="section-index"><span>08</span>Scientific limits</p>
            <h2>What this thesis does not establish</h2>
          </div>
          <ul className="editorial-list">
            {project.limitations.map((item) => <li key={item}>{item}</li>)}
            <li>Pooled road links are dependent within scenarios; they are not independent observations.</li>
            <li>MC Dropout replays are stochastic, and thresholds require recalibration after model or distribution changes.</li>
          </ul>
        </section>

        {relatedWriting.length > 0 ? (
          <section className="section-wrap thesis-next-section">
            <div>
              <p className="section-index"><span>09</span>Learn and inspect</p>
              <h2>Move between the scientific record, teaching layer, and source trail.</h2>
            </div>
            <div className="writing-grid">
              {relatedWriting.map((entry) => <WritingCard entry={entry} key={entry.slug} />)}
            </div>
            <div className="research-record-actions">
              <Link className="text-link" href="/work/transport-uq">Engineering case study <span aria-hidden="true">→</span></Link>
              <a className="text-link" href={canonicalThesisEvidence.aggregateJson}>Audited aggregate JSON <span aria-hidden="true">↗</span></a>
              <a className="text-link" href={canonicalThesisEvidence.manifest}>Artifact manifest <span aria-hidden="true">↗</span></a>
            </div>
          </section>
        ) : null}
      </article>
    </PageShell>
  );
}
