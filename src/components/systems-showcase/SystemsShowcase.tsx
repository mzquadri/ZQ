import SceneReveal from "@/components/scene/SceneReveal";
import VectorSpaceCanvas from "@/components/scene/VectorSpaceCanvas";
import { GRAPH_MARK, sceneGraphEdges, sceneGraphNodes } from "@/content/scene-geometry";
import {
  changeRules,
  checkLevels,
  countIllustration,
  generationRecords,
  generations,
  representations,
  showcase,
} from "@/content/systems-showcase";

/*
 * The public systems showcase.
 *
 * A synthetic model of a problem common to most data platforms: the same information ends up
 * stored several ways, and keeping those copies honest is harder than producing them. It stands
 * for no particular system and carries no data from anywhere.
 *
 * Same construction rules as every other figure on this site. Server components render the
 * finished state, so the section is complete with JavaScript off, under reduced motion, and
 * without WebGL. `SceneReveal` only ever rewinds a finished figure and walks it forward once.
 * Depth is used where depth is the argument - three parallel views of one capture, and
 * generations of state sitting behind one another - and nowhere else.
 */

function RepresentationMark({ id }: { id: string }) {
  if (id === "vectors") return <VectorSpaceCanvas />;

  if (id === "records") {
    return (
      <div aria-hidden="true" className="systems-mark systems-rows">
        {[0, 1, 2, 3, 4].map((row) => (
          <span key={row} style={{ transitionDelay: `${row * 60}ms` }} />
        ))}
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="systems-mark">
      <svg
        className="systems-graph"
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

/** Capture, structure, and the three views that come out of it. */
function FanOut() {
  return (
    <figure className="systems-figure research-figure">
      <figcaption>
        <strong>Model</strong>
        What does one captured source become, and what is each copy checked against?
      </figcaption>

      <SceneReveal className="systems-stage" interval={720} parallax steps={5}>
        <div className="systems-source">
          <div aria-hidden="true" className="systems-sheet">
            <span className="systems-leaf" />
            <span className="systems-leaf" />
            <span className="systems-face">
              <ol className="systems-units">
                {[0, 1, 2, 3, 4, 5].map((unit) => (
                  <li key={unit} style={{ transitionDelay: `${unit * 60}ms` }} />
                ))}
              </ol>
              <span className="systems-seal" />
            </span>
          </div>
          <div className="systems-source-copy">
            <span>Source</span>
            <p className="systems-name">Captured before it is parsed</p>
            <p>
              The bytes are retained first, so everything built afterwards has one fixed thing to be
              compared against — rather than being compared against another copy of itself.
            </p>
            <p className="systems-chip">Capture retained</p>
          </div>
        </div>

        <div aria-hidden="true" className="systems-links">
          <span className="systems-stem" />
          <span className="systems-rule" />
          {[0, 1, 2].map((order) => (
            <span className="systems-drop" key={order} style={{ transitionDelay: `${order * 90}ms` }} />
          ))}
        </div>

        <div className="systems-grid">
          <div aria-hidden="true" className="systems-measure">
            <span />
            <span />
            <span />
          </div>
          {representations.map((representation, order) => (
            <article
              data-representation={representation.id}
              key={representation.id}
              style={{ transitionDelay: `${order * 100}ms` }}
              tabIndex={0}
            >
              <span>{representation.role}</span>
              <p className="systems-name">{representation.name}</p>
              <p>{representation.holds}</p>
              <RepresentationMark id={representation.id} />
              <dl>
                <div>
                  <dt>Derived from</dt>
                  <dd>{representation.derivedFrom}</dd>
                </div>
                <div>
                  <dt>Checked by</dt>
                  <dd>{representation.checkedBy}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </SceneReveal>

      <p className="figure-note">
        Illustrative model, not a measurement. One writer per derived view makes a divergence
        attributable to a single path; it does not on its own establish that the views agree.
      </p>
    </figure>
  );
}

/** The opening argument: equal totals settle quantity and nothing else. */
function CountVsContent() {
  return (
    <figure className="systems-count-figure research-figure">
      <figcaption>
        <strong>Model</strong>
        If the records and the vectors have the same total, what has that established?
      </figcaption>

      <SceneReveal className="systems-count-stage" interval={900} steps={4}>
        <div className="systems-count-grid">
          {countIllustration.map((column) => (
            <article key={column.store}>
              <span>{column.store}</span>
              <strong>{column.total}</strong>
              <p>{column.detail}</p>
            </article>
          ))}
          <p className="systems-verdict" data-verdict="agree">
            Totals agree
          </p>
          <p className="systems-verdict" data-verdict="unresolved">
            Totals still agree
          </p>
        </div>

        <ol className="systems-count-steps">
          <li data-phase="1">
            <span>Totals agree</span>
            <p>Both sides report the same number of records, and a dashboard turns green.</p>
          </li>
          <li data-phase="2">
            <span>One record is removed, one is added</span>
            <p>The source changes. The total does not.</p>
          </li>
          <li data-outcome="unresolved" data-phase="3">
            <span>Totals still agree</span>
            <p>Nothing about which records are present, or what they say, has been checked.</p>
          </li>
        </ol>
      </SceneReveal>

      <p className="figure-note">
        Illustrative quantities, spelled as words so they are not mistaken for a measurement. A
        total survives one removal paired with one addition, so equal totals establish quantity
        alone.
      </p>
    </figure>
  );
}

/** What an update does, and what it deliberately leaves alone. */
function StateChange() {
  return (
    <figure className="systems-change-figure research-figure">
      <figcaption>
        <strong>Model</strong>
        When the source is updated, what happens to what is already stored?
      </figcaption>

      <SceneReveal className="systems-generations" interval={860} steps={4}>
        {generations.map((plane, order) => (
          <section
            aria-label={plane.name}
            className="systems-generation"
            data-generation={plane.id}
            key={plane.id}
            style={{ transitionDelay: `${order * 90}ms` }}
          >
            <header>
              <span>{plane.name}</span>
              <p>{plane.note}</p>
            </header>
            <ol>
              {generationRecords.map((record) => (
                <li
                  data-disposition={plane.id === "current" ? record.disposition : "held"}
                  key={record.id}
                  style={{ transitionDelay: `${record.column * 70}ms` }}
                >
                  <span>{record.label}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </SceneReveal>

      <ol className="systems-dispositions">
        {changeRules.map((rule) => (
          <li data-disposition={rule.disposition} key={rule.change}>
            <span>{rule.change}</span>
            <strong>{rule.outcome}</strong>
            <p>{rule.detail}</p>
          </li>
        ))}
      </ol>

      <p className="figure-note">
        Current state converges on the update; what earlier versions were built from is kept apart
        from it rather than brought forward as though it were current. The model does not claim the
        update itself was correct.
      </p>
    </figure>
  );
}

/** Comparisons, and what each one leaves open. */
function CheckLadder() {
  return (
    <figure className="systems-ladder-figure research-figure">
      <figcaption>
        <strong>Model</strong>
        What does each comparison rule out, and what does it leave open?
      </figcaption>

      <SceneReveal className="systems-ladder-stage" interval={420} steps={checkLevels.length + 1}>
        <ol className="systems-ladder">
          {checkLevels.map((level, order) => (
            <li data-rung={order + 1} key={level.name}>
              <p className="systems-name">{level.name}</p>
              <dl>
                <div>
                  <dt>Rules out</dt>
                  <dd>{level.rulesOut}</dd>
                </div>
                <div>
                  <dt>Still open</dt>
                  <dd>{level.stillOpen}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </SceneReveal>

      <p className="figure-note">
        Each comparison is recorded as its own result rather than folded into one status, because
        passing one is not evidence for another — and none of them turns into proof.
      </p>
    </figure>
  );
}

export default function SystemsShowcase() {
  return (
    <div className="systems-showcase">
      <p className="systems-badge">{showcase.note}</p>
      <FanOut />
      <CountVsContent />
      <StateChange />
      <CheckLadder />
    </div>
  );
}
