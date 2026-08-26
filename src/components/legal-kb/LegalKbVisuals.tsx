import {
  confidenceLadder,
  convergenceRules,
  countIllustration,
  representationFanOut,
  verificationStates,
} from "@/content/legal-kb";
import {
  convergenceOrders,
  generationPlanes,
  generationUnits,
  graphEdges as sceneGraphEdges,
  graphNodes as sceneGraphNodes,
} from "@/content/legal-kb-scene";
import SceneReveal from "./SceneReveal";
import VectorSpaceCanvas from "./VectorSpaceCanvas";

/*
 * Figures for the legal knowledge platform case study.
 *
 * Every figure is a server component and every word it shows is server-rendered at its finished
 * state. The only client code is `SceneReveal`, which walks a finished figure from its beginning
 * once it comes into view, and one scoped WebGL canvas inside the vector card. Turn JavaScript
 * off, prefer reduced motion, or lose WebGL, and the figures are complete - that is the design,
 * not a fallback bolted on afterwards.
 *
 * Depth is used only where it carries the argument: three representations of one source are
 * parallel views rather than pipeline stages, and generations of stored state are literally
 * behind one another. Everything else stays flat, because a drawing of a list is worse than a
 * list.
 *
 * All quantities are illustrative and spelled as words. No figure carries corpus content, corpus
 * scale, or an internal identifier.
 */

export function StoredIsNotCorrect() {
  return (
    <figure className="legal-count-figure research-figure">
      <figcaption>
        <strong>Technical question</strong>
        If the stored units and the indexed vectors have the same total, what has that established?
      </figcaption>

      <SceneReveal className="legal-count-stage" interval={900} scene="count" steps={4}>
        <div className="legal-count-grid">
          {countIllustration.map((column) => (
            <article key={column.store}>
              <span>{column.store}</span>
              <strong>{column.total}</strong>
              <p>{column.detail}</p>
            </article>
          ))}
          <p className="legal-count-verdict" data-verdict="agree">
            Totals agree
          </p>
          <p className="legal-count-verdict" data-verdict="unresolved">
            Totals still agree
          </p>
        </div>

        <ol className="legal-count-steps">
          <li data-phase="1">
            <span>Totals agree</span>
            <p>The two sides report the same number of records, and a status page turns green.</p>
          </li>
          <li data-phase="2">
            <span>One unit is removed, one is added</span>
            <p>The published document changes. The total does not.</p>
          </li>
          <li data-outcome="unresolved" data-phase="3">
            <span>Totals still agree</span>
            <p>Nothing about which units are present, or what they say, has been checked.</p>
          </li>
        </ol>
      </SceneReveal>

      <p className="figure-note">
        Illustrative quantities, not measurements from any corpus. A total survives one removal
        paired with one addition, so equal totals establish quantity alone. Establishing content
        requires comparing ordered identities and hashes of the units themselves.
      </p>
    </figure>
  );
}

/**
 * Drawing bounds for the reference-graph mark.
 *
 * Named rather than written into the `viewBox` string because the privacy validator reads this
 * file as text, and a run of coordinates separated by spaces and minus signs looks exactly like a
 * telephone number to it. `SystemGraph` builds its own viewBox from constants for the same
 * reason. The check is right to be blunt; the drawing can be the thing that adapts.
 */
const GRAPH_MARK = { halfWidth: 100, halfHeight: 62, spreadX: 82, spreadY: 56 } as const;

/**
 * The visual band each representation card carries.
 *
 * Rows for the relational record, a vector space, and a small reference graph. Only the vector
 * space is drawn with WebGL: it is the one whose meaning is positions in a space. The graph keeps
 * one relationship whose target cannot be identified, drawn hollow and left hollow, because
 * attaching it to a plausible neighbour would be the failure this whole page is about.
 */
function RepresentationMark({ name }: { name: string }) {
  if (name.startsWith("Vector")) return <VectorSpaceCanvas />;

  if (name.startsWith("Relational")) {
    return (
      <div aria-hidden="true" className="legal-fanout-mark legal-fanout-rows">
        {[0, 1, 2, 3, 4].map((row) => (
          <span key={row} style={{ transitionDelay: `${row * 60}ms` }} />
        ))}
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="legal-fanout-mark">
      <svg
        className="legal-fanout-graph"
        role="presentation"
        viewBox={`${-GRAPH_MARK.halfWidth} ${-GRAPH_MARK.halfHeight} ${GRAPH_MARK.halfWidth * 2} ${GRAPH_MARK.halfHeight * 2}`}
      >
        {sceneGraphEdges.map((edge) => {
          const from = sceneGraphNodes.find((node) => node.id === edge.from)!;
          const to = sceneGraphNodes.find((node) => node.id === edge.to)!;
          return (
            <line
              data-kind={edge.kind}
              key={`${edge.from}-${edge.to}`}
              x1={from.position[0] * GRAPH_MARK.spreadX}
              x2={to.position[0] * GRAPH_MARK.spreadX}
              y1={from.position[1] * -GRAPH_MARK.spreadY}
              y2={to.position[1] * -GRAPH_MARK.spreadY}
            />
          );
        })}
        {sceneGraphNodes.map((node) => (
          <circle
            cx={node.position[0] * GRAPH_MARK.spreadX}
            cy={node.position[1] * -GRAPH_MARK.spreadY}
            data-kind={node.kind}
            key={node.id}
            r={node.kind === "unresolved" ? 6.5 : 5.5}
          />
        ))}
      </svg>
    </div>
  );
}

export function RepresentationFanOut() {
  return (
    <figure className="legal-fanout-figure research-figure">
      <figcaption>
        <strong>Technical question</strong>
        What does one published document become, and who is allowed to write each part of it?
      </figcaption>

      <SceneReveal className="legal-fanout-stage" interval={720} parallax scene="fanout" steps={5}>
        <div className="legal-fanout-source">
          {/* Three stacked leaves give the sheet thickness. Decorative only - the words are below. */}
          <div aria-hidden="true" className="legal-fanout-sheet">
            <span className="legal-fanout-leaf" />
            <span className="legal-fanout-leaf" />
            <span className="legal-fanout-face">
              <ol className="legal-fanout-units">
                {[0, 1, 2, 3, 4, 5].map((unit) => (
                  <li key={unit} style={{ transitionDelay: `${unit * 60}ms` }} />
                ))}
              </ol>
              <span className="legal-fanout-seal" />
            </span>
          </div>
          <div className="legal-fanout-source-copy">
            <span>Published source</span>
            <p className="legal-fanout-name">Captured as immutable evidence</p>
            <p>
              The exact bytes are retained before anything is parsed, so every later claim has a
              fixed subject. A representation can then be compared against the capture rather than
              against another representation.
            </p>
            <p className="legal-fanout-chip">Capture retained</p>
          </div>
        </div>

        {/* A rule and three drops. A curved SVG stretched across this width distorted badly and
            said nothing the rule does not; the depth below carries the parallel-views point. */}
        <div aria-hidden="true" className="legal-fanout-links">
          <span className="legal-fanout-stem" />
          <span className="legal-fanout-rule" />
          {[0, 1, 2].map((order) => (
            <span
              className="legal-fanout-drop"
              key={order}
              style={{ transitionDelay: `${order * 90}ms` }}
            />
          ))}
        </div>

        <div className="legal-fanout-grid">
          {/* One measurement line per representation, drawn back towards the capture. It says
              "this was compared", not "this became correct". */}
          <div aria-hidden="true" className="legal-fanout-measure">
            <span />
            <span />
            <span />
          </div>
          {representationFanOut.map((representation, order) => (
            <article
              data-representation={representation.name.split(" ")[0].toLowerCase()}
              key={representation.name}
              style={{ transitionDelay: `${order * 100}ms` }}
              tabIndex={0}
            >
              <span>{representation.role}</span>
              <p className="legal-fanout-name">{representation.name}</p>
              <p>{representation.holds}</p>
              <RepresentationMark name={representation.name} />
              <dl>
                <div>
                  <dt>Written by</dt>
                  <dd>{representation.writer}</dd>
                </div>
                <div>
                  <dt>Checked against</dt>
                  <dd>{representation.checkedAgainst}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </SceneReveal>

      <p className="figure-note">
        Service names are generic descriptions of role, not the names used internally. One writer
        per derived store makes a divergence attributable to a single path; it does not on its own
        establish that the stores agree.
      </p>
    </figure>
  );
}

export function SourceChangeConvergence() {
  return (
    <figure className="legal-convergence-figure research-figure">
      <figcaption>
        <strong>Technical question</strong>
        When the published source is amended, what happens to what is already stored?
      </figcaption>

      <SceneReveal className="legal-generations" interval={860} scene="generations" steps={4}>
        {generationPlanes.map((plane, order) => (
          <section
            aria-label={plane.name}
            className="legal-generation"
            data-generation={plane.id}
            key={plane.id}
            style={{ transitionDelay: `${order * 90}ms` }}
          >
            <header>
              <span>{plane.name}</span>
              <p>{plane.note}</p>
            </header>
            <ol>
              {generationUnits.map((unit) => (
                <li
                  data-disposition={plane.id === "current" ? unit.disposition : "held"}
                  key={unit.id}
                  style={{ transitionDelay: `${unit.column * 70}ms` }}
                >
                  <span className="legal-generation-unit-label">{unit.label}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </SceneReveal>

      <ol className="legal-convergence">
        {convergenceRules.map((rule) => (
          <li data-disposition={rule.disposition} key={rule.change}>
            <span>{rule.change}</span>
            <strong>{rule.outcome}</strong>
            <p>{rule.detail}</p>
          </li>
        ))}
      </ol>

      <div className="legal-convergence-retained">
        <span>Captured source evidence</span>
        <h3>Retained, not rewritten</h3>
        <p>
          The evidence a previous version was measured against stays exactly as captured. Current
          state converges on the amended source; history is kept apart from it rather than being
          brought forward as if it were current.
        </p>
      </div>

      <div className="legal-orders">
        <h3>Which intermediate state each store is willing to be caught in</h3>
        <dl>
          {convergenceOrders.map((order) => (
            <div key={order.store}>
              <dt>{order.store}</dt>
              <dd>
                <ol className="legal-order-steps">
                  <li>{order.first}</li>
                  <li>{order.then}</li>
                </ol>
                <p>
                  <em>{order.intermediate}</em> — {order.why}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="figure-note">
        The invariant is that current representations converge on the new source without a stale
        record being treated as current, and without the old version disappearing before the new
        one is ready. It does not establish that the amended source was itself correct.
      </p>
    </figure>
  );
}

/**
 * The closing annotation, beneath the learning blockquote.
 *
 * Two marginal notes in the page's established language: an ink rule means captured evidence and
 * does not move; a dashed rule means superseded. Stated flat, it is what the paragraph above it
 * says in two lines. During the guided run's final beat the interpretation recedes and the
 * measurement stays exactly where it is, which is the whole idea rendered rather than asserted.
 *
 * No WebGL, no celebration, no tick. A research-paper annotation is the right register for an
 * ending about being wrong.
 */
export function ClosingAnnotation() {
  return (
    <div className="legal-closing">
      <p className="legal-closing-row" data-mark="measurement">
        <span>Measurement</span>
        <strong>Recorded, and still valid as the historical measurement it was.</strong>
      </p>
      <p className="legal-closing-row" data-mark="interpretation">
        <span>Interpretation</span>
        <strong>Withdrawn, and re-measured against the extractor that had changed.</strong>
      </p>
    </div>
  );
}

export function ConfidenceLadder() {
  return (
    <figure className="legal-ladder-figure research-figure">
      <figcaption>
        <strong>Technical question</strong>
        What does each class of evidence rule out, and what does it leave open?
      </figcaption>

      <SceneReveal className="legal-ladder-stage" interval={420} scene="ladder" steps={confidenceLadder.length + 1}>
        <ol className="legal-ladder">
          {confidenceLadder.map((rung, order) => (
            <li data-rung={order + 1} key={rung.name}>
              <h3>{rung.name}</h3>
              <dl>
                <div>
                  <dt>Rules out</dt>
                  <dd>{rung.rulesOut}</dd>
                </div>
                <div>
                  <dt>Still open</dt>
                  <dd>{rung.stillOpen}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </SceneReveal>

      <div className="legal-states">
        <h3>Five results that are not interchangeable</h3>
        <dl>
          {verificationStates.map((state) => (
            <div key={state.name} data-tone={state.tone}>
              <dt>
                <span aria-hidden="true" className="legal-state-mark" data-tone={state.tone} />
                {state.name}
              </dt>
              <dd>{state.means}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="figure-note">
        The classes are recorded as separate results rather than reduced to one status, because a
        pass in one is not evidence for another. A result that could not be measured is weaker
        than a pass and is never displayed as one.
      </p>
    </figure>
  );
}
