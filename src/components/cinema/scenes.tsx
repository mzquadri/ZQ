import { GraphCityCanvas, RetrievalCanvas } from "@/components/scene/ProjectedCanvases";
import { graphEdges, graphMaxHop, graphNodes, GRAPH } from "@/content/cinema-geometry";
import { chapter, chapterEvent, chapterMaxQ } from "@/content/hydrology-chapter";
import {
  chapter as streamflowChapter,
  chapterZoom,
} from "@/content/streamflow-chapter";

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

/**
 * The same thing, measured while the element is arriving rather than after it has arrived.
 *
 * `contain` does not begin until the subject is completely inside the scrollport, so a short
 * figure sitting in the middle of the viewport can still be at zero progress - which is how the
 * pipeline came to show an empty bordered box directly beneath its own headline. `entry` runs
 * across the approach instead, so the figure is finished by the time it is fully on screen.
 */
function entering(from: number, to: number, extra: React.CSSProperties = {}): Ranged {
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    style: { "--range": `entry ${round(from)}% entry ${round(to)}%`, ...extra } as React.CSSProperties,
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
  /*
   * The stages are the apparatus, not the reveal.
   *
   * Spread over most of the view range, the last gate only arrived at 97% - so a reader meeting
   * this chapter saw its headline sitting above an empty bordered box, which reads as broken
   * rather than as anticipation. The rail and the gates are now drawn early and the artifact
   * crossing them is what the remaining scroll is spent on, which is the claim the caption makes.
   */
  const span = 40 / Math.max(1, stages.length);

  return (
    <div className="scene-pipeline" role="img" aria-label={`A pipeline in which an artifact must pass a gate at each stage before moving to the next: ${stages.join(", ")}.`}>
      <div className="scene-rail" {...entering(18, 42)} />
      <ol className="scene-stages">
        {stages.map((stage, i) => (
          <li className="scene-stage" key={stage} {...entering(34 + i * span, 58 + i * span)}>
            <span className="scene-gate" aria-hidden="true" />
            <span className="scene-stage-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <span className="scene-stage-name">{stage}</span>
          </li>
        ))}
      </ol>
      {/* The artifact itself, crossing the rail as the reader scrubs. */}
      <span className="scene-artifact" aria-hidden="true" {...at(10, 78)} />
    </div>
  );
}

/* ============================================================================================
 * Hydrology - two perturbations, one of which matters
 *
 * The previous figure here showed ensemble members fanning into a horizon, which is a forecasting
 * picture. This project does no forecasting: it takes one calibrated historical event and asks
 * where its uncertainty actually comes from. The honest compressed story is a comparison, so the
 * chapter is a comparison - two panels on one shared discharge scale, both bands drawn at their
 * measured widths.
 *
 * The left panel looks like it is missing its band. It is not: the precipitation band is there,
 * 356 times narrower than the one beside it, which is the finding rather than a rendering fault.
 * ========================================================================================== */

/*
 * The chapter reads a module generated just for it. Importing the full hydrology world here
 * pulled the rating curve and every metric into the homepage bundle for a thumbnail.
 */
const HYDRO_POINTS = chapterEvent;
const HYDRO_W = 460;
const HYDRO_H = 132;
const HYDRO_QMAX = chapterMaxQ;

const hydroX = (t: number) => 8 + t * (HYDRO_W - 16);
const hydroY = (q: number) => HYDRO_H - 10 - (q / HYDRO_QMAX) * (HYDRO_H - 22);

const HYDRO_RAIN_RATIO = chapter.rainRatio;

function hydroBand(scale: number) {
  const top = HYDRO_POINTS.map((p) => `${hydroX(p[0])},${hydroY(p[1] + (p[3] - p[1]) * scale)}`);
  const bottom = [...HYDRO_POINTS]
    .reverse()
    .map((p) => `${hydroX(p[0])},${hydroY(p[1] - (p[1] - p[2]) * scale)}`);
  return [...top, ...bottom].join(" ");
}

const hydroLine = HYDRO_POINTS.map((p) => `${hydroX(p[0])},${hydroY(p[1])}`).join(" ");

function HydrologyPanel({
  band,
  count,
  label,
  tone,
}: {
  band: string;
  count: string;
  label: string;
  tone: "rain" | "stage";
}) {
  return (
    <div className="scene-hydro-panel" data-tone={tone}>
      <svg
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${HYDRO_W} ${HYDRO_H}`}
      >
        <polygon className="scene-hydro-band" points={band} {...at(24, 70)} />
        <polyline className="scene-hydro-line" points={hydroLine} pathLength={100} {...at(6, 46)} />
      </svg>
      <p className="scene-hydro-label">
        <strong>{label}</strong>
        <span>{count}</span>
      </p>
    </div>
  );
}

function EnsembleFlat() {
  return (
    <div
      className="scene-hydro"
      role="img"
      aria-label={`Two panels on one discharge scale. Perturbing the precipitation of a calibrated hydrological event leaves a band too narrow to see and ${chapter.rainBetter} of ${chapter.series} corrupted series still beat the reference by chance. Perturbing the measured water level by 25 cm instead opens a wide band around the flood peak, and ${chapter.stageBetter} of ${chapter.series} beat the reference.`}
    >
      <HydrologyPanel
        band={hydroBand(HYDRO_RAIN_RATIO)}
        count={`${chapter.rainBetter} of ${chapter.series.toLocaleString("en-GB")} still beat the reference`}
        label="Perturb the rain"
        tone="rain"
      />
      <HydrologyPanel
        band={hydroBand(1)}
        count={`${chapter.stageBetter} of ${chapter.series.toLocaleString("en-GB")} beat the reference`}
        label="Perturb the ruler"
        tone="stage"
      />
    </div>
  );
}

/* ============================================================================================
 * Streamflow - the number, and what it was given
 *
 * This chapter used to be a forecast cone: an observed series, an issue point, and an interval
 * opening with lead time. It was drawn from a formula, and the repository it stands for produces
 * no intervals and no multi-step horizon at all - every prediction in it is one step ahead with
 * the previous day's measured discharge supplied as an input feature. The cone was asserting the
 * one capability the project is careful to say it never tested, so it is gone rather than
 * relabelled.
 *
 * What replaces it is the actual reference run: the tracked model's predictions over the first
 * days of the holdout, laid on the observed series they are almost identical to, and the three
 * rows of the leaderboard labelled with what each was really scored on.
 * ========================================================================================== */

const SF_W = 460;
const SF_H = 116;
const SF_PAD = { left: 8, right: 8, top: 8, bottom: 8 };
const SF_IW = SF_W - SF_PAD.left - SF_PAD.right;
const SF_IH = SF_H - SF_PAD.top - SF_PAD.bottom;

const SF_MIN = Math.min(...chapterZoom.map((p) => Math.min(p[1], p[2])));
const SF_MAX = Math.max(...chapterZoom.map((p) => Math.max(p[1], p[2])));

const sfx = (t: number) => SF_PAD.left + t * SF_IW;
const sfy = (q: number) => SF_PAD.top + SF_IH - ((q - SF_MIN) / (SF_MAX - SF_MIN)) * SF_IH;

const sfTruth = chapterZoom.map((p) => `${sfx(p[0])},${sfy(p[1])}`).join(" ");
const sfPred = chapterZoom.map((p) => `${sfx(p[0])},${sfy(p[2])}`).join(" ");

function HorizonFlat() {
  return (
    <div
      className="scene-streamflow"
      role="img"
      aria-label={`A benchmark result on synthetic data. XGBoost scores R² ${streamflowChapter.r2} against SARIMAX ${streamflowChapter.sarimaxR2} and a seasonal-naive baseline at ${streamflowChapter.naiveR2}, but the predicted and observed lines overlap because each prediction is one day ahead and is given the discharge observed the day before. The two most recent lag features carry ${Math.round(streamflowChapter.topTwoShare * 1000) / 10}% of the model.`}
    >
      <svg
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${SF_W} ${SF_H}`}
      >
        <polyline className="scene-sf-truth" points={sfTruth} pathLength={100} {...at(8, 46)} />
        <polyline className="scene-sf-pred" points={sfPred} pathLength={100} {...at(24, 62)} />
      </svg>
      <p className="scene-sf-caption" {...at(56, 78)}>
        <strong>R² {streamflowChapter.r2}</strong>
        <span>
          one step ahead, given yesterday&rsquo;s measurement &mdash; lag&nbsp;1 and lag&nbsp;2
          carry {Math.round(streamflowChapter.topTwoShare * 1000) / 10}% of the model
        </span>
      </p>
    </div>
  );
}

/*
 * The three projected figures: flat drawing plus, where the gates allow, the spatial layer over
 * it. Each flat version is the complete figure on its own.
 */
export function EnsembleScene() {
  return <EnsembleFlat />;
}

export function HorizonScene() {
  return <HorizonFlat />;
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
