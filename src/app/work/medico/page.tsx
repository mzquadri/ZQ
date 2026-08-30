import type { Metadata } from "next";
import Link from "next/link";

import NextSystem from "@/components/cinema/NextSystem";
import SceneIdentity from "@/components/sequence/SceneIdentity";
import MedicoWorld from "@/components/medico-world/MedicoWorld";
import MedicoWorldFlat from "@/components/medico-world/MedicoWorldFlat";
import PageShell from "@/components/PageShell";
import { ArrowLabel } from "@/components/Icon";
import { config, evaluation, findings, limits, sources } from "@/content/medico-world";
import { coverage } from "@/components/medico-world/geometry";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Medico: multi-label chest X-ray modelling",
  description:
    "A research prototype for multi-label chest X-ray classification with DenseNet-121 and a mask-aware focal loss. No trained weights, no patient data, no held-out metrics, and no clinical validation.",
  path: "/work/medico",
});

const REPOSITORY = "https://github.com/mzquadri/medico";

/*
 * Deliberately not filed as a case study.
 *
 * Every case study on this site states a problem, a contribution, versioned evidence, and the
 * limitations that bound the claim. This project has no evidence to version: the repository
 * publishes no trained weights and no metrics, by its own design. Listing it beside work that does
 * carry evidence would quietly borrow their credibility for it. It is a research prototype, it is
 * labelled as one throughout, and what it is worth looking at is the engineering - specifically
 * what the loss does with labels that three different corpora disagree about.
 */
export default function MedicoPage() {
  return (
    <PageShell current="/work">
      <article>
        <header className="page-hero section-wrap">
          <Link className="back-link" href="/work">← Selected work</Link>
          <p className="kicker">Research prototype / Medical imaging</p>
          <h1>Uncertain is not negative.</h1>

          {/*
            The object from the homepage chapter, at the same resting beat. This route had no
            opening figure at all, so a click from the reel arrived on prose and the thing that had
            just been on screen was nowhere in the first viewport.

            Directly after the title, so a phone sees it without scrolling. At desktop widths the
            hero is a two-column grid and this is placed into the second column regardless of where
            it sits in the source.
          */}
          <SceneIdentity
            caption="A synthetic film, then the three corpora that disagree about what they can label."
            slug="medico"
            viewTransitionName="world-medico"
          />
          <p>
            A multi-label chest X-ray classifier over {findings.length} findings, trained across
            three corpora that do not agree about what they label. The interesting part is not the
            network. It is the mask that decides which labels are allowed to teach it anything.
          </p>
          <dl className="research-meta">
            <div><dt>Backbone</dt><dd>DenseNet-121</dd></div>
            <div><dt>Findings</dt><dd>{findings.length}, multi-label</dd></div>
            <div><dt>Sources</dt><dd>{sources.length}</dd></div>
            <div><dt>Published results</dt><dd>None</dd></div>
          </dl>
          <div className="hero-actions">
            <a className="button button-primary" href={REPOSITORY}><ArrowLabel>Repository</ArrowLabel></a>
          </div>

        </header>

        {/*
          The system before the prose. Every value the sequence shows is parsed out of the training
          script; on a phone, a narrow window, or for a reader who declined motion, the coverage
          matrix is drawn once and completely instead.
        */}
        <div>
          <MedicoWorld flat={<MedicoWorldFlat />} />
        </div>

        <section className="section-wrap">
          <p className="section-index"><span>01</span>What this is</p>
          <h2>Three corpora, one label space, and a great deal of silence.</h2>
          <p>
            The model predicts {findings.length} findings at once. Only one of its three sources
            can speak to all {findings.length} of them: NIH ChestX-ray14. CheXpert supplies{" "}
            {coverage[0].covered}, and the pneumonia set supplies {coverage[2].covered}. Within the
            findings CheXpert does carry, an entry can still be explicitly uncertain, or simply not
            mentioned at all.
          </p>
          <p>
            The decision that shapes the whole project is what to do with that silence. Treating it
            as a negative is cheap and wrong: it would teach the model that every CheXpert chest is
            free of emphysema, fibrosis and hernia, and that every image in the pneumonia set is
            free of the other thirteen findings. Instead each of those entries is masked, and a
            masked entry contributes nothing to the loss and nothing to the metrics.
          </p>
        </section>

        <section className="section-wrap">
          <p className="section-index"><span>02</span>The loss</p>
          <h2>Focal weighting, and then a switch that can turn the whole term off.</h2>
          <p>
            The loss is a focal loss with label smoothing ({config.labelSmoothing}), alpha{" "}
            {config.focalAlpha} so positives are weighted three to one, gamma {config.focalGamma}{" "}
            so confident examples stop dominating, and a class weight applied to positives only so
            that boosting a rare finding does not also boost the flood of negatives around it. All
            of that is multiplied by the mask, and normalised by the sum of the mask times the
            weights rather than by the element count &mdash; otherwise batches with a lot of masked
            entries would be scaled as though those entries had been learned from.
          </p>
        </section>

        <section className="section-wrap">
          <p className="section-index"><span>03</span>Splits and evaluation</p>
          <h2>Split by patient, and judged on the worst finding.</h2>
          <p>
            Both CheXpert and NIH are split 80/10/10 at the level of the patient, not the image, so
            two views of the same person cannot land on both sides of the split. The NIH split is
            retried until every finding has at least twenty positives in both validation and test,
            because a split that leaves a rare finding with three positives produces a metric that
            means nothing.
          </p>
          <p>
            {evaluation.metric}, computed only over samples where that channel is certain. The
            checkpoint is then selected on the <em>minimum</em> class AUC rather than the mean, with
            Hernia excluded as too rare to steer on &mdash; a mean would let a strong majority class
            hide a finding the model cannot do at all.
          </p>
          <p className="section-note">
            {evaluation.publishedNote}
          </p>
        </section>

        <section className="closing-section section-wrap">
          <p className="kicker">Boundaries</p>
          <h2>A research prototype, and not a clinical one.</h2>
          <ul className="medico-flat-limits">
            {limits.map((limit) => (
              <li key={limit.label}>
                <strong>{limit.label}</strong>
                <span>{limit.note}</span>
              </li>
            ))}
          </ul>
          <p>
            The repository states that the implementation must not be used for diagnosis, triage,
            treatment decisions, or any other clinical purpose. Nothing on this page is a medical
            claim, no image shown anywhere in it is a real radiograph, and no patient data is used,
            stored, or published.
          </p>
        </section>
        <NextSystem slug="medico" />
      </article>
    </PageShell>
  );
}
