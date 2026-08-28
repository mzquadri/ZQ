import Link from "next/link";

import MedicoMatrix from "@/components/medico-world/MedicoMatrix";
import { coverage } from "@/components/medico-world/geometry";
import { findings } from "@/content/medico-world";

/**
 * The medico chapter, compressed to the homepage.
 *
 * It uses the same chapter markup every other project uses, deliberately, so it reads as one of
 * the set rather than as a bolt-on - but its metric line says "None", because the repository
 * publishes no weights and no results. Every other chapter on this page ends in a measured number;
 * this one ends in a statement about what is not known, which is the honest shape of the work.
 *
 * The figure is the coverage matrix, drawn once, and not a scroll sequence.
 *
 * A projector version was built for this slot and then removed. A compact chapter is about five
 * hundred pixels tall, and a four-beat sequence given three hundred pixels of track does not read
 * as cinema - it reads as a figure flickering through states on the way past. The compact budget
 * is also the right one: this project publishes no results, and giving it the visual weight of the
 * chapters that do would flatten exactly the distinction a reader is trying to make. The full
 * eleven-state world, lit and in WebGL, is one click away.
 *
 * It also keeps the homepage free of three.js entirely, which it is today.
 */
export default function MedicoChapter() {
  return (
    <div className="chapters">
      <article
        className="chapter"
        data-scale="compact"
        id="work-medico"
        style={{ "--accent": "var(--accent-pipeline)" } as React.CSSProperties}
      >
        <div className="chapter-inner">
          <header className="chapter-head">
            <p className="chapter-index" aria-hidden="true">07</p>
            <p className="chapter-eyebrow">Research prototype / Medical imaging</p>
            <h3 className="chapter-title">
              <Link className="chapter-link" href="/work/medico">Uncertain is not negative</Link>
            </h3>
          </header>

          <figure className="chapter-figure">
            <MedicoMatrix />
            <figcaption>
              Fourteen finding channels lift off a chest image. The ones a corpus cannot label drop
              away rather than counting as absent.
            </figcaption>
          </figure>

          <div className="chapter-copy">
            <p className="chapter-summary">
              A multi-label chest X-ray classifier over {findings.length} findings, trained across
              three corpora that disagree about what they label. CheXpert supplies{" "}
              {coverage[0].covered} of the {findings.length}; the pneumonia set supplies{" "}
              {coverage[2].covered}. The rest is masked out of the loss rather than treated as
              negative.
            </p>

            <p className="chapter-metric">
              <span>Published results</span>
              <strong>None</strong>
            </p>

            <p className="chapter-meta">
              <span>Research prototype</span>
              <span>Not for clinical use</span>
            </p>

            <Link className="chapter-more mz-interactive" href="/work/medico">
              Open the system
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
