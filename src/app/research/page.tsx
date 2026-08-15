import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { SelectiveRiskChart, ThesisPipeline } from "@/components/ResearchVisuals";
import { getProject, researchEvidence, thesis } from "@/content/portfolio";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Research",
  description:
    "Master's thesis research in uncertainty-aware graph neural network surrogates for transportation policy analysis.",
  path: "/research",
});

export default function ResearchPage() {
  const project = getProject("transport-uq")!;

  return (
    <PageShell current="/research">
      <header className="page-hero research-hero section-wrap">
        <p className="kicker">Research record / Thesis submitted May 2026</p>
        <h1>{thesis.title}</h1>
        <p>
          A study of predictive quality, uncertainty ranking, calibration, and selective
          review for a GNN surrogate of Paris transport-policy simulations.
        </p>
        <dl className="research-meta">
          <div><dt>Institution</dt><dd>{thesis.institution}</dd></div>
          <div><dt>Program</dt><dd>{thesis.program}</dd></div>
          <div><dt>Examiner</dt><dd>{thesis.examiner}</dd></div>
          <div><dt>Advisors</dt><dd>{thesis.advisors}</dd></div>
        </dl>
      </header>

      <section className="section-wrap research-question">
        <p className="section-index"><span>01</span>Research question</p>
        <h2>Fast prediction is useful only when failure is visible.</h2>
        <p>
          When an ML surrogate replaces an expensive agent-based simulation, can its
          uncertainty rank likely errors, produce calibrated intervals, and support an
          explicit accept-or-review policy?
        </p>
        <aside>
          <strong>Contribution boundary</strong>
          <p>{project.contribution}</p>
        </aside>
      </section>

      <section className="section-wrap visual-section">
        <ThesisPipeline />
        <SelectiveRiskChart />
      </section>

      <section className="section-wrap">
        <p className="section-index"><span>02</span>Selected evidence</p>
        <h2 className="standalone-heading">Point accuracy, uncertainty quality, and review trade-offs</h2>
        <div className="metric-grid research-metrics">
          {project.evidence.map((metric) => (
            <div className="metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-wrap protocol-section">
        <p className="section-index"><span>03</span>Calibration protocols</p>
        <h2>Similar labels do not mean identical experiments.</h2>
        <table className="protocol-table">
          <caption className="visually-hidden">Calibration protocol comparison</caption>
          <thead>
            <tr>
              <th scope="col">Protocol</th>
              <th scope="col">Split</th>
              <th scope="col">Result</th>
              <th scope="col">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {researchEvidence.calibrationProtocols.map((protocol) => (
              <tr key={protocol.id}>
                <th scope="row" data-label="Protocol">{protocol.id}</th>
                <td data-label="Split">{protocol.split}</td>
                <td data-label="Result">{protocol.result}</td>
                <td data-label="Evidence">{protocol.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section-wrap limitation-section">
        <div>
          <p className="section-index"><span>04</span>Scientific limits</p>
          <h2>What the thesis does not establish</h2>
        </div>
        <ul className="editorial-list">
          {project.limitations.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="section-wrap research-links">
        <h2>Inspect the research trail</h2>
        <p>
          The public repository contains source, aggregate reports, thesis material, and
          tracked prediction artifacts. Raw MATSim data and serialized local graph data are
          intentionally excluded.
        </p>
        <a className="button button-primary" href={project.repository} target="_blank" rel="noreferrer">
          Open research repository <span aria-hidden="true">↗</span>
        </a>
        <Link className="text-link" href="/work/transport-uq">
          Read the engineering case study <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
