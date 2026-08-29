import { over } from "@/components/cinema/scroll";
import { evidenceSplit, strongWork, type StrongWork } from "@/content/strong-work";

/*
 * The second movement.
 *
 * Eight flagships run above this as full worlds. These nine repositories are real work with a real
 * end-to-end story, and they used to be cards in a grid - the one treatment this site says it will
 * not give to work that has one.
 *
 * Each gets a stage with four beats in a fixed order: what goes in, what the system does, what it
 * establishes, and where it stops. The third beat is the reason the section exists. Two of these
 * repositories publish tracked numbers and they are drawn as bars on a single honest axis. Five
 * publish none on purpose, and those are drawn as an empty measurement frame with the quantities
 * they decline to claim written along the axis they are missing from.
 *
 * An empty chart is a strange thing to put on a portfolio, and it is the most accurate thing on
 * the page. Every one of those five repositories names, in its own README, the artifact it would
 * need before it could print a number - so the absence is a decision, and drawing it as a decision
 * is more informative than drawing a bar that was never measured.
 *
 * Server-rendered, no JavaScript. The beats stage themselves off the shared scroll primitive and
 * a browser without scroll timelines gets the finished frame, which is the whole scene at rest.
 */

function EvidenceFigure({ work }: { work: StrongWork }) {
  const { evidence } = work;

  if (evidence.kind === "withheld") {
    return (
      <figure className="sw-figure sw-figure-empty">
        <figcaption className="sw-figure-head">
          <span className="sw-figure-kind">No metric published</span>
          <span className="sw-figure-axis">By decision, not omission</span>
        </figcaption>

        {/*
         * The empty frame. Gridlines and an axis are drawn because the measurement is well
         * defined - it is the series that is absent, and an unlabelled void would read as a
         * loading state rather than as a refusal.
         */}
        <div className="sw-empty" role="img" aria-label={`No published metric for ${work.title}. ${evidence.reason}`}>
          <ol className="sw-empty-rows">
            {evidence.absent.map((quantity, index) => (
              <li key={quantity} {...over(18 + index * 4, 34 + index * 4)}>
                <span className="sw-empty-label">{quantity}</span>
                <span className="sw-empty-track" aria-hidden="true" />
                <span className="sw-empty-mark" aria-hidden="true">
                  not claimed
                </span>
              </li>
            ))}
          </ol>
          <p className="sw-empty-axis" aria-hidden="true">
            <span>0</span>
            <span>1</span>
          </p>
        </div>

        <p className="sw-figure-note">{evidence.reason}</p>
      </figure>
    );
  }

  if (evidence.kind === "demonstrated") {
    return (
      <figure className="sw-figure sw-figure-path">
        <figcaption className="sw-figure-head">
          <span className="sw-figure-kind">Working path</span>
          <span className="sw-figure-axis">{evidence.axis}</span>
        </figcaption>

        <dl className="sw-path">
          {evidence.readouts.map((readout, index) => (
            <div key={readout.label} {...over(18 + index * 5, 34 + index * 5)}>
              <dt>{readout.label}</dt>
              <dd>{readout.value}</dd>
            </div>
          ))}
        </dl>

        <p className="sw-figure-note">{evidence.caveat}</p>
      </figure>
    );
  }

  return (
    <figure className="sw-figure sw-figure-bars">
      <figcaption className="sw-figure-head">
        <span className="sw-figure-kind">Published in the repository</span>
        <span className="sw-figure-axis">{evidence.axis}</span>
      </figcaption>

      <ol className="sw-bars">
        {evidence.bars.map((bar, index) => (
          <li
            key={bar.label}
            {...over(18 + index * 3, 32 + index * 3, {
              /* The bar's own width is its value, so the axis needs no separate scale. */
              "--bar": String(bar.value),
            } as React.CSSProperties)}
          >
            <span className="sw-bar-label">{bar.label}</span>
            <span className="sw-bar-track" aria-hidden="true">
              <span className="sw-bar-fill" />
            </span>
            <span className="sw-bar-value">{bar.value.toFixed(3)}</span>
          </li>
        ))}
      </ol>

      <p className="sw-axis" aria-hidden="true">
        <span>0</span>
        <span>1</span>
      </p>

      {evidence.readouts.length > 0 ? (
        <dl className="sw-readouts">
          {evidence.readouts.map((readout) => (
            <div key={readout.label}>
              <dt>{readout.label}</dt>
              <dd>{readout.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <p className="sw-figure-note">{evidence.caveat}</p>
    </figure>
  );
}

function StrongScene({ work, index }: { work: StrongWork; index: number }) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <article
      className="sw-scene"
      data-evidence={work.evidence.kind}
      id={`repo-${work.repository.toLowerCase()}`}
      style={{ "--accent": work.accent } as React.CSSProperties}
    >
      <div className="sw-plate">
        <p className="sw-index" aria-hidden="true">
          {number}
        </p>
        <h3 className="sw-title">{work.title}</h3>
        <p className="sw-premise">{work.premise}</p>

        <ol className="sw-beats">
          <li {...over(16, 30)}>
            <span className="sw-beat-label">Input</span>
            <p>{work.input}</p>
          </li>
          <li {...over(22, 36)}>
            <span className="sw-beat-label">System</span>
            <p>{work.transform}</p>
          </li>
          <li {...over(28, 42)}>
            <span className="sw-beat-label">Limit</span>
            <p>{work.limitation}</p>
          </li>
        </ol>

        <p className="sw-repo">
          <a
            href={`https://github.com/mzquadri/${work.repository}`}
            rel="noopener noreferrer external"
            target="_blank"
          >
            {work.repository}
          </a>
        </p>
      </div>

      <div className="sw-stage">
        <EvidenceFigure work={work} />
      </div>
    </article>
  );
}

export default function StrongWorkBand() {
  const { measured, demonstrated, withheld } = evidenceSplit();

  return (
    <section className="sw" id="strong-work" aria-labelledby="strong-work-title">
      <div className="sw-intro">
        {/*
          The stage's own eyebrow, not the light page's `.section-index` - that one is teal-dark
          on paper and came out at 1.94:1 against the near-black ground.
        */}
        <p className="chapter-intro-index" aria-hidden="true">
          02
        </p>
        <p className="chapter-intro-eyebrow">Supporting work</p>
        <h2 id="strong-work-title">Nine more repositories, and what each one can prove</h2>
        <p className="sw-lede">
          Smaller than the flagships and built the same way. Reading all nine READMEs side by side
          turned up the only fact worth leading with:{" "}
          <strong>{measured.length} of them publish tracked numbers</strong>,{" "}
          {demonstrated.length} establish a working path without claiming accuracy, and{" "}
          <strong>{withheld.length} publish no metric at all</strong> &mdash; each one naming the
          artifact it would need first. Those five are drawn as the empty charts they are.
        </p>
      </div>

      {strongWork.map((work, index) => (
        <StrongScene index={index} key={work.repository} work={work} />
      ))}
    </section>
  );
}
