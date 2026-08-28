import {
  EnsembleCanvas,
  GraphCityCanvas,
  HorizonCanvas,
  RetrievalCanvas,
} from "@/components/scene/ProjectedCanvases";
import { graphEdges, graphMaxHop, graphNodes, GRAPH } from "@/content/cinema-geometry";

/*
 * One scene per project.
 *
 * The rule these are written against: if you deleted every word except the project's title, the
 * figure should still say something specific about that project. A graph surrogate and a
 * retrieval benchmark do not resemble each other, so they are not allowed to be the same
 * rectangle with different text in it.
 *
 * Every scene is SVG or DOM driven by the same scroll scrub as the hero. `--range` is set per
 * element and read by `animation-range` in CSS, which is how a single scene stages itself across
 * its own slice of the track without any JavaScript. Resting state is the finished state, so a
 * browser without scroll timelines - and a reader who asked for reduced motion - sees the
 * completed diagram rather than an empty frame.
 */

type Ranged = { style: React.CSSProperties };

/** Build the inline custom property that positions an element within its scene's scroll slice. */
function at(from: number, to: number, extra: React.CSSProperties = {}): Ranged {
  /* Rounded because these are usually computed from a division, and binary floating point then
   * emits a long trailing run of digits into the stylesheet. */
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    style: { "--range": `contain ${round(from)}% contain ${round(to)}%`, ...extra } as React.CSSProperties,
  };
}

/* ============================================================================================
 * Transport UQ - a graph surrogate, and where it stops being trustworthy
 *
 * The argument is propagation: information reaches a road link through the graph, not through a
 * table of features. So the figure is a real breadth-first wavefront over a fixed network - the
 * hop numbers come from an actual traversal in the geometry module, not from a designer's guess
 * about which nodes look good lighting up next. Uncertainty then appears as a ring per node, and
 * the nodes the model is least sure about are marked rather than hidden.
 * ========================================================================================== */
function GraphSurrogateFlat() {
  const hopStart = 18;
  const hopSpan = 44;
  const perHop = hopSpan / (graphMaxHop + 1);

  return (
    <svg
      className="scene-svg scene-graph"
      role="img"
      aria-label="A road network in which information spreads outward from one junction through the graph, after which each junction is marked with how uncertain the surrogate is there."
      viewBox={`0 0 ${GRAPH.width} ${GRAPH.height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* The network at rest, so the structure is legible before anything moves through it. */}
      <g className="scene-graph-base">
        {graphEdges.map((edge) => (
          <line
            key={`b-${edge.a}-${edge.b}`}
            x1={graphNodes[edge.a].x}
            x2={graphNodes[edge.b].x}
            y1={graphNodes[edge.a].y}
            y2={graphNodes[edge.b].y}
          />
        ))}
      </g>

      {/* The wavefront. Each hop owns a slice of the scrub, so the spread has a real speed. */}
      <g className="scene-graph-live">
        {graphEdges.map((edge) => (
          <line
            className="scene-edge"
            key={`l-${edge.a}-${edge.b}`}
            /* Without pathLength the shared `stroke-dasharray: 100` means 100 user units, which
             * turns a long edge into a dashed line instead of drawing it end to end. */
            pathLength={100}
            x1={graphNodes[edge.a].x}
            x2={graphNodes[edge.b].x}
            y1={graphNodes[edge.a].y}
            y2={graphNodes[edge.b].y}
            {...at(hopStart + edge.hop * perHop, hopStart + (edge.hop + 1.6) * perHop)}
          />
        ))}
        {graphNodes.map((node) => (
          <circle
            className="scene-node"
            cx={node.x}
            cy={node.y}
            data-source={node.hop === 0 ? "" : undefined}
            key={`n-${node.id}`}
            r={node.hop === 0 ? 11 : 6.5}
            {...at(hopStart + node.hop * perHop, hopStart + (node.hop + 1.4) * perHop)}
          />
        ))}
      </g>

      {/*
       * Uncertainty. The ring radius is a function of hop distance: the further the information
       * had to travel, the less the surrogate has to go on. That is a claim about the figure's
       * own construction, not a measurement of the model.
       */}
      <g className="scene-graph-uncertainty">
        {graphNodes.map((node) => (
          <circle
            className="scene-ring"
            cx={node.x}
            cy={node.y}
            data-low={node.hop >= graphMaxHop - 1 ? "" : undefined}
            key={`u-${node.id}`}
            r={9 + node.hop * 5.5}
            {...at(66 + node.hop * 2.2, 82 + node.hop * 2.2)}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * The transport figure: flat drawing plus, where the gates allow it, the spatial field over it.
 * The flat version is always rendered - it is the complete figure on its own.
 */
export function GraphSurrogateScene() {
  return <GraphCityCanvas flat={<GraphSurrogateFlat />} />;
}

/* ============================================================================================
 * InsureAssist - retrieval is not generation
 *
 * The whole point of the benchmark is that these are two separable steps that fail separately,
 * so the figure keeps them on opposite sides and draws the tether between them. Chunks leave a
 * document, land in a space, a query arrives, the nearest few are selected, and the answer is
 * physically tied back to the passages it used. Nothing about the answer is shown as generated
 * out of nowhere.
 * ========================================================================================== */
/*
 * Named rather than written inline. The content validator reads this file's source, and a viewBox
 * written out literally is a run of nine digits separated by spaces - indistinguishable from a
 * phone number to a rule that cannot know what attribute it is looking at. Composing the attribute
 * from constants keeps the check strict and the scene unchanged. (For the same reason, do not
 * quote an example of one in a comment here.)
 */
const RETRIEVAL = { width: 1000, height: 380 } as const;

function RetrievalFlat() {
  const chunks = [0, 1, 2, 3, 4, 5, 6, 7];
  /* Fixed scatter - deterministic, so the same passage lands in the same place every build. */
  const placed = chunks.map((c) => ({
    id: c,
    x: 430 + ((c * 137) % 260),
    y: 90 + ((c * 83) % 200),
    hit: c === 2 || c === 5 || c === 6,
  }));

  return (
    <svg
      className="scene-svg scene-retrieval"
      role="img"
      aria-label="Passages leave a document and take positions in a vector space. A query arrives, the nearest passages are selected, and the answer is drawn tied back to the passages it was built from."
      viewBox={`0 0 ${RETRIEVAL.width} ${RETRIEVAL.height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Source document */}
      <g className="scene-doc" {...at(6, 22)}>
        <rect height={230} rx={6} width={150} x={40} y={70} />
        {chunks.map((c) => (
          <rect
            className="scene-doc-line"
            height={12}
            key={c}
            rx={2}
            width={c % 3 === 0 ? 96 : 118}
            x={58}
            y={90 + c * 26}
          />
        ))}
      </g>

      {/* Chunks travelling into the space */}
      <g className="scene-chunks">
        {placed.map((p, i) => (
          <circle
            className="scene-chunk"
            cx={p.x}
            cy={p.y}
            data-hit={p.hit ? "" : undefined}
            key={p.id}
            r={7}
            {...at(20 + i * 2.4, 40 + i * 2.4, {
              "--from-x": `${140 - p.x}px`,
              "--from-y": `${140 - p.y}px`,
            } as React.CSSProperties)}
          />
        ))}
      </g>

      {/* The query, and the neighbourhood it searches */}
      <circle className="scene-query" cx={548} cy={196} r={9} {...at(44, 56)} />
      <circle className="scene-query-radius" cx={548} cy={196} r={104} {...at(50, 66)} />

      {/* Tethers: every selected passage stays physically attached to the answer. */}
      <g className="scene-tethers">
        {placed
          .filter((p) => p.hit)
          .map((p, i) => (
            <path
              className="scene-tether"
              d={`M${p.x} ${p.y} C ${p.x + 90} ${p.y}, ${790} ${190 + i * 26}, ${832} ${190 + i * 26}`}
              key={p.id}
              pathLength={100}
              {...at(66 + i * 4, 84 + i * 4)}
            />
          ))}
      </g>

      {/* The answer, with one citation slot per tether */}
      <g className="scene-answer" {...at(72, 90)}>
        <rect height={120} rx={6} width={128} x={832} y={150} />
        {[0, 1, 2].map((i) => (
          <rect className="scene-cite" height={10} key={i} rx={2} width={92} x={848} y={182 + i * 26} />
        ))}
      </g>
    </svg>
  );
}

/** The retrieval figure, with the vector volume over it where the gates allow. */
export function RetrievalScene() {
  return <RetrievalCanvas flat={<RetrievalFlat />} />;
}

/* ============================================================================================
 * MLOps pipeline - promotion is a gate, not a conveyor
 *
 * The interesting property of the reference pipeline is that an artifact does not simply move
 * forward; it has to pass something to move forward. So the figure is a row of gates, and the
 * artifact token stops at each one before it is allowed through. DOM rather than SVG, because
 * the stages carry text and text in SVG is a worse citizen for screen readers and selection.
 * ========================================================================================== */
export function PipelineScene({ stages }: { stages: readonly string[] }) {
  const span = 78 / Math.max(1, stages.length);

  return (
    <div className="scene-pipeline" role="img" aria-label={`A pipeline in which an artifact must pass a gate at each stage before moving to the next: ${stages.join(", ")}.`}>
      <div className="scene-rail" {...at(6, 20)} />
      <ol className="scene-stages">
        {stages.map((stage, i) => (
          <li className="scene-stage" key={stage} {...at(14 + i * span, 32 + i * span)}>
            <span className="scene-gate" aria-hidden="true" />
            <span className="scene-stage-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <span className="scene-stage-name">{stage}</span>
          </li>
        ))}
      </ol>
      {/* The artifact itself, crossing the rail as the reader scrubs. */}
      <span className="scene-artifact" aria-hidden="true" {...at(14, 92)} />
    </div>
  );
}

/* ============================================================================================
 * Hydrology - an ensemble is a spread before it is an interval
 *
 * Deliberately not the hero's figure. The hero calibrates one interval; this one shows where an
 * interval comes from: many members disagreeing, and their disagreement collapsing into a band.
 * The visual claim is about spread, not about calibration.
 * ========================================================================================== */
function EnsembleFlat() {
  const members = 11;
  const width = 1000;
  const height = 300;

  const trace = (seed: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 60; i += 1) {
      const t = i / 60;
      const spread = Math.sin(t * Math.PI) * (seed - members / 2) * 7.4;
      const y =
        height * 0.5 -
        Math.sin(t * Math.PI * 2.2) * 52 +
        Math.sin(t * 9 + seed) * 6 +
        spread;
      pts.push(`${i === 0 ? "M" : "L"}${Math.round(t * width * 100) / 100} ${Math.round(y * 100) / 100}`);
    }
    return pts.join(" ");
  };

  return (
    <svg
      className="scene-svg scene-ensemble"
      role="img"
      aria-label="Several ensemble members trace different futures from the same starting point. Their disagreement widens through the middle of the horizon and is then summarised as a single band."
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <g className="scene-members">
        {Array.from({ length: members }, (_, m) => (
          <path className="scene-member" d={trace(m)} key={m} pathLength={100} {...at(10 + m * 2.6, 34 + m * 2.6)} />
        ))}
      </g>
      {/* The summary the members collapse into. */}
      <path
        className="scene-envelope"
        d={`${trace(members - 0.6)} L${width} ${height} L0 ${height} Z`}
        {...at(58, 82)}
      />
    </svg>
  );
}

/* ============================================================================================
 * Streamflow - uncertainty is a function of lead time
 *
 * Distinct again: the shape here is a cone. What the figure says is that a forecast is not
 * uniformly uncertain - it is nearly tight at the moment of issue and necessarily loose far out,
 * and the honest way to draw a horizon is to let it open.
 * ========================================================================================== */
function HorizonFlat() {
  const width = 1000;
  const height = 300;
  const issue = 300;

  const history: string[] = [];
  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40;
    const x = t * issue;
    const y = height * 0.55 - Math.sin(t * Math.PI * 2.4) * 34 + Math.sin(t * 13) * 5;
    history.push(`${i === 0 ? "M" : "L"}${Math.round(x * 100) / 100} ${Math.round(y * 100) / 100}`);
  }

  const centre = height * 0.55 - Math.sin(Math.PI * 2.4) * 34;
  const upper: string[] = [];
  const lower: string[] = [];
  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40;
    const x = issue + t * (width - issue);
    const drift = Math.sin(t * Math.PI * 1.3) * 26;
    const open = 6 + t * t * 96;
    upper.push(`${i === 0 ? "M" : "L"}${Math.round(x * 100) / 100} ${Math.round((centre + drift - open) * 100) / 100}`);
    lower.push(`L${Math.round(x * 100) / 100} ${Math.round((centre + drift + open) * 100) / 100}`);
  }
  const cone = `${upper.join(" ")} ${lower.reverse().join(" ")} Z`;

  return (
    <svg
      className="scene-svg scene-horizon"
      role="img"
      aria-label="An observed series runs up to the moment a forecast is issued, after which the predicted interval opens out as the lead time grows."
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <path className="scene-history" d={history.join(" ")} pathLength={100} {...at(8, 30)} />
      <line className="scene-issue" x1={issue} x2={issue} y1={24} y2={height - 24} {...at(30, 40)} />
      <path className="scene-cone" d={cone} {...at(40, 74)} />
      {/* Lead-time ticks, so the widening is read as a function of distance rather than decoration. */}
      <g className="scene-leads">
        {[0.25, 0.5, 0.75, 1].map((t, i) => (
          <line
            className="scene-lead"
            key={t}
            x1={issue + t * (width - issue)}
            x2={issue + t * (width - issue)}
            y1={height - 34}
            y2={height - 18}
            {...at(62 + i * 5, 76 + i * 5)}
          />
        ))}
      </g>
    </svg>
  );
}

/*
 * The three projected figures: flat drawing plus, where the gates allow, the spatial layer over
 * it. Each flat version is the complete figure on its own.
 */
export function EnsembleScene() {
  return <EnsembleCanvas flat={<EnsembleFlat />} />;
}

export function HorizonScene() {
  return <HorizonCanvas flat={<HorizonFlat />} />;
}

/* ============================================================================================
 * CIFAR-10 - abstraction, compactly
 *
 * A smaller project gets a smaller budget. The idea is only that detail is traded for meaning
 * layer by layer, so it is three receding planes and a result - CSS 3D rather than WebGL,
 * because nothing here needs a renderer.
 * ========================================================================================== */
export function FeatureMapScene({ classes }: { classes: readonly string[] }) {
  return (
    <div
      className="scene-featuremap"
      role="img"
      aria-label="A pixel grid is reduced through successive feature maps into a small set of class scores."
    >
      <div className="scene-planes" aria-hidden="true">
        {[0, 1, 2].map((layer) => (
          <div className="scene-plane" data-layer={layer} key={layer} {...at(10 + layer * 16, 40 + layer * 16)}>
            {Array.from({ length: (4 - layer) * (4 - layer) * 4 }, (_, cell) => (
              <span key={cell} />
            ))}
          </div>
        ))}
      </div>
      <ol className="scene-classes" aria-hidden="true">
        {classes.map((name, i) => (
          <li className="scene-class" data-top={i === 0 ? "" : undefined} key={name} {...at(64 + i * 4, 80 + i * 4)}>
            <span>{name}</span>
            <i style={{ "--w": `${92 - i * 26}%` } as React.CSSProperties} />
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ============================================================================================
 * The four verbs of the public engineering section.
 *
 * Each is a small synthetic figure with its own movement, because four identical marks made the
 * four steps look interchangeable when the whole point is that they are different kinds of work.
 *
 * Everything here is generic by construction. There is no service, store, topic, dataset or
 * identifier in any of them - they are shapes describing a class of problem that any organisation
 * holding a large document corpus has, and they would be equally true of a system that does not
 * exist. That is the standard this section is held to.
 * ========================================================================================== */

const VERB_BOX = { size: 96 } as const;

export function VerbScene({ verb }: { verb: string }) {
  const s = VERB_BOX.size;
  const box = `0 0 ${s} ${s}`;

  /* INGEST - something arrives and is then held still. */
  if (verb === "Ingest") {
    return (
      <svg className="verb-svg" role="presentation" viewBox={box}>
        <path className="verb-arrive" d="M48 10 L48 56" pathLength={100} />
        <path className="verb-arrive-head" d="M36 46 L48 58 L60 46" pathLength={100} />
        <rect className="verb-hold" height={16} rx={2} width={56} x={20} y={66} />
      </svg>
    );
  }

  /* REPRESENT - one thing becomes several, without ceasing to be one thing. */
  if (verb === "Represent") {
    return (
      <svg className="verb-svg" role="presentation" viewBox={box}>
        <circle className="verb-source" cx={48} cy={20} r={9} />
        {[22, 48, 74].map((x, i) => (
          <g key={x} style={{ "--i": i } as React.CSSProperties}>
            <path className="verb-branch" d={`M48 29 C48 48, ${x} 48, ${x} 66`} pathLength={100} />
            <circle className="verb-form" cx={x} cy={75} r={7} />
          </g>
        ))}
      </svg>
    );
  }

  /* VERIFY - the comparison travels back to what it is checked against. */
  if (verb === "Verify") {
    return (
      <svg className="verb-svg" role="presentation" viewBox={box}>
        <rect className="verb-hold" height={14} rx={2} width={30} x={8} y={41} />
        <rect className="verb-derived" height={14} rx={2} width={30} x={58} y={41} />
        <path className="verb-return" d="M56 48 L42 48" pathLength={100} />
        <path className="verb-tick" d="M40 62 L46 68 L58 54" pathLength={100} />
      </svg>
    );
  }

  /* OBSERVE - a state that was already true becomes visible. */
  return (
    <svg className="verb-svg" role="presentation" viewBox={box}>
      <path className="verb-trace" d="M8 62 L24 62 L32 40 L42 76 L50 52 L62 52 L74 34 L88 34" pathLength={100} />
      <circle className="verb-reading" cx={74} cy={34} r={6} />
    </svg>
  );
}
