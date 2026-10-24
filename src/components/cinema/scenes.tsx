import { at } from "@/components/cinema/scroll";
import { GraphCityCanvas, RetrievalCanvas } from "@/components/scene/ProjectedCanvases";
import { graphEdges, graphMaxHop, graphNodes, GRAPH } from "@/content/cinema-geometry";
import {
  chapter as cifarChapter,
  chapterClasses as cifarChapterClasses,
  chapterSample as cifarChapterSample,
} from "@/content/cifar-chapter";
import { drift as driftScores } from "@/content/drift-chapter";
import {
  capacity as battCapacity,
  detail as battDetail,
  detailMagnification as battMagnification,
  generator as battGenerator,
  misread as battMisread,
  misreadText as battMisreadText,
  ocv as battOcv,
  socRange as battSocRange,
  split as battSplit,
  voltageBand as battBand,
} from "@/content/battery-chapter";
import {
  comparison as identComparison,
  figure as identFigure,
} from "@/content/identifiability-chapter";
import {
  axisPercent as floodAxisPercent,
  gapOverCalendar as floodGap,
  scores as floodScores,
} from "@/content/flood-chapter";
import {
  frames as releaseFrames,
  sheet as releaseSheet,
  tickCount as releaseTicks,
} from "@/content/release-chapter";
import {
  differences as translationDiffs,
  model as translationModel,
  resolvedCount as translationResolved,
  totalCount as translationTotal,
} from "@/content/translation-chapter";
import {
  axis as modalAxis,
  axisPercent as modalAxisPercent,
  coverage as modalCoverage,
  euCarShare as modalEu,
  spread as modalSpread,
} from "@/content/modal-split-chapter";
import {
  closestGap as parityClosestGap,
  parity as parityConfig,
  sample as paritySample,
  sampleMax as paritySampleMax,
} from "@/content/parity-chapter";
import {
  axisPercent as munichAxisPercent,
  seriesTotal as munichSeriesTotal,
  testMonths as munichTestMonths,
  windows as munichWindows,
} from "@/content/munich-chapter";
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
      aria-label={`An earlier benchmark result on synthetic data. XGBoost scored R2 ${streamflowChapter.r2} against SARIMAX ${streamflowChapter.sarimaxR2} and a day-of-year baseline at ${streamflowChapter.naiveR2}, but the predicted and observed lines overlap because each prediction is one day ahead and is given the discharge observed the day before. The two most recent lag features carry ${Math.round(streamflowChapter.topTwoShare * 1000) / 10}% of the model.`}
    >
      <svg
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${SF_W} ${SF_H}`}
      >
        <polyline className="scene-sf-truth" points={sfTruth} pathLength={100} {...at(8, 46)} />
        <polyline className="scene-sf-pred" points={sfPred} pathLength={100} {...at(24, 62)} />
      </svg>
      <p className="scene-sf-caption" {...at(50, 66)}>
        <strong>R2 {streamflowChapter.r2}</strong>
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
 * CIFAR-10 - the aggregate, and the ten numbers under it
 *
 * This chapter used to be three receding planes of cells above four class bars whose widths were
 * `92 - i * 26` percent - invented confidences, for four of the ten classes, on a project whose
 * whole point is that its per-class results are wildly uneven. The bars are now the run's actual
 * per-class accuracies, all ten of them, against the 64.26% aggregate they average out to.
 *
 * Still no renderer: one real 32-pixel test image and ten div-width bars.
 * ========================================================================================== */
export function FeatureMapScene() {
  const above = cifarChapter.testAccuracy;
  return (
    <div
      className="scene-cifar"
      role="img"
      aria-label={`A CIFAR-10 classifier scoring ${cifarChapter.testAccuracy}% overall, with per-class accuracy ranging from ${cifarChapter.worstAccuracy}% on ${cifarChapter.worst} to ${cifarChapter.bestAccuracy}% on ${cifarChapter.best}. Its largest single error is ${cifarChapter.topCount} ${cifarChapter.topFrom} images predicted as ${cifarChapter.topTo}.`}
    >
      <div className="scene-cifar-head" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={cifarChapterSample} {...at(4, 26)} />
        <p {...at(10, 34)}>
          <strong>{cifarChapter.testAccuracy}%</strong>
          <span>overall, across ten classes</span>
        </p>
      </div>
      <ol className="scene-cifar-bars" aria-hidden="true">
        {cifarChapterClasses.map((c, i) => (
          <li
            data-side={c.accuracy >= above ? "above" : "below"}
            key={c.cls}
            {...at(20 + i * 4, 54 + i * 4)}
          >
            <span>{c.cls}</span>
            <i style={{ "--w": `${c.accuracy}%` } as React.CSSProperties} />
            <em>{c.accuracy}%</em>
          </li>
        ))}
      </ol>
      <p className="scene-cifar-note" {...at(66, 88)}>
        {cifarChapter.topCount} {cifarChapter.topFrom} images were predicted as{" "}
        {cifarChapter.topTo}.
      </p>
    </div>
  );
}





/* ============================================================================================
 * Identifiability - two networks that cannot be told apart by what they do
 *
 * There is no measurement in this figure because the repository publishes none, and says so: its
 * experiments and results directories are deliberately empty of configurations, trained models
 * and findings. So the figure draws the thing the code actually constructs and checks.
 *
 * Two columns of hidden units. The second is the first with its units relabelled and two of them
 * sign-flipped, and the lines between them are the relabelling. The networks agree on sampled
 * inputs; their weights do not look alike. The third row is the unrelated network the same
 * comparison is run against, so that the check is one that can fail.
 * ========================================================================================== */
export function IdentifiabilityScene() {
  const units = Array.from({ length: identFigure.hidden }, (_, i) => i);
  return (
    <div
      className="scene-ident"
      role="img"
      aria-label={`Two networks of ${identFigure.hidden} hidden units. The second is the first with its units relabelled and two of them sign-flipped. They agree on sampled inputs while their parameters differ. An unrelated network put through the same comparison is rejected.`}
    >
      <div className="scene-ident-pair">
        <ol className="scene-ident-col" aria-hidden="true">
          {units.map((u, i) => (
            <li className="scene-ident-unit" key={u} {...at(26 + i * 3, 42 + i * 3)}>
              {u + 1}
            </li>
          ))}
        </ol>

        <div className="scene-ident-map" aria-hidden="true">
          {units.map((u, i) => (
            <i
              className="scene-ident-line"
              data-flip={identFigure.flipped[i] ? "" : undefined}
              key={u}
              {...at(
                32 + i * 3,
                50 + i * 3,
                {
                  "--from": `${(i + 0.5) * (100 / identFigure.hidden)}%`,
                } as React.CSSProperties,
              )}
            />
          ))}
        </div>

        <ol className="scene-ident-col" aria-hidden="true">
          {units.map((u, i) => (
            <li
              className="scene-ident-unit"
              data-flip={identFigure.flipped[identFigure.permutation.indexOf(u)] ? "" : undefined}
              key={u}
              {...at(30 + i * 3, 46 + i * 3)}
            >
              {identFigure.permutation.indexOf(u) + 1}
            </li>
          ))}
        </ol>
      </div>

      <ol className="scene-ident-verdicts">
        {identComparison.map((c, i) => (
          <li
            className="scene-ident-verdict"
            data-agrees={c.agrees ? "" : undefined}
            key={c.key}
            {...at(46 + i * 5, 62 + i * 5)}
          >
            <span aria-hidden="true">{c.label}</span>
            <strong aria-hidden="true">{c.agrees ? "outputs agree" : "rejected"}</strong>
          </li>
        ))}
      </ol>

      <p className="scene-ident-note" {...at(58, 74)}>
        A sign flip is drawn on the units that carry one. Nothing here is a measurement: the
        repository keeps no trained model and publishes no numerical finding.
      </p>
    </div>
  );
}


/* ============================================================================================
 * Battery state of charge - the curve the gauge was calibrated on moves
 *
 * No measurement appears in this figure. The repository says it has no versioned split, run
 * configuration, model artifact or metric report to substantiate a score, and that its synthetic
 * results demonstrate code execution rather than estimation performance. So the figure draws the
 * problem instead, and draws it by evaluating the generator's own voltage form rather than by
 * hand: the curve below is `battOcv`, which is the formula transcribed out of `src/data_loader.py`.
 *
 * Two curves, a fresh cell and the same cell 200 cycles later. The ageing term does not depend on
 * state of charge, so the whole curve sinks by a constant. Read that sunk voltage against the
 * fresh curve - which is what a gauge calibrated once does - and the answer is wrong by a couple
 * of points of charge, in the direction that tells a driver they have less than they do.
 * ========================================================================================== */
function BatteryPlot() {
  /* Plot box inside the viewBox. The axis spans exactly the fresh curve's own range. */
  const L = 36;
  const R = 292;
  const T = 16;
  const B = 132;
  const x = (soc: number) =>
    L + ((soc - battSocRange.from) / (battSocRange.to - battSocRange.from)) * (R - L);
  const y = (volts: number) =>
    B - ((volts - battBand.low) / (battBand.high - battBand.low)) * (B - T);

  const samples = Array.from({ length: 49 }, (_, i) => {
    const t = i / 48;
    return battSocRange.from + t * (battSocRange.to - battSocRange.from);
  });
  const curve = (cycle: number) =>
    samples.map((soc) => `${x(soc).toFixed(1)},${y(battOcv(soc, cycle)).toFixed(1)}`).join(" ");

  /* The read-off: the voltage an aged cell shows at its true charge, against both curves. */
  const readVolts = battOcv(battMisread.truth, battGenerator.cycles);
  const yRead = y(readVolts);

  return (
    <svg
      className="scene-svg scene-batt-plot"
      viewBox="0 0 300 150"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <g className="scene-batt-axes">
        <line x1={L} x2={R} y1={B} y2={B} />
        <line x1={L} x2={L} y1={T} y2={B} />
      </g>

      {/* The fresh cell: the curve a gauge would be calibrated against. */}
      <polyline
        className="scene-batt-curve"
        data-age="fresh"
        pathLength={100}
        points={curve(1)}
        {...at(22, 44)}
      />

      {/* The same cell after every cycle the generator produces, sunk by a constant. */}
      <polyline
        className="scene-batt-curve"
        data-age="aged"
        pathLength={100}
        points={curve(battGenerator.cycles)}
        {...at(34, 56)}
      />

      {/* Reading that voltage off the fresh curve lands short of the truth. */}
      <g className="scene-batt-read" {...at(48, 66)}>
        <line className="scene-batt-level" x1={L} x2={x(battMisread.truth)} y1={yRead} y2={yRead} />
        <line
          className="scene-batt-gap"
          x1={x(battMisread.reads)}
          x2={x(battMisread.truth)}
          y1={yRead}
          y2={yRead}
        />
        <circle className="scene-batt-dot" cx={x(battMisread.reads)} cy={yRead} r={3} />
        <circle className="scene-batt-dot" data-truth="" cx={x(battMisread.truth)} cy={yRead} r={3} />
      </g>

      <g className="scene-batt-labels" {...at(56, 72)}>
        <text x={L} y={146}>
          empty
        </text>
        <text x={R} y={146} textAnchor="end">
          full
        </text>
        <text className="scene-batt-vlabel" x={L - 6} y={T + 6} textAnchor="end">
          V
        </text>
      </g>
    </svg>
  );
}

/*
 * The magnified window.
 *
 * Same two curves, same formula, over a narrow band of charge either side of the read-off. The
 * panel states its own magnification and the range it covers, because a zoomed axis that does not
 * say it is zoomed is the oldest way to make a small effect look like a large one.
 */
function BatteryDetail() {
  const L = 36;
  const R = 292;
  const T = 14;
  const B = 56;

  const lo = battOcv(battDetail.from, battGenerator.cycles);
  const hi = battOcv(battDetail.to, 1);
  const pad = (hi - lo) * 0.12;
  const x = (soc: number) =>
    L + ((soc - battDetail.from) / (battDetail.to - battDetail.from)) * (R - L);
  const y = (volts: number) => B - ((volts - (lo - pad)) / (hi - lo + 2 * pad)) * (B - T);

  const samples = Array.from({ length: 25 }, (_, i) => {
    const t = i / 24;
    return battDetail.from + t * (battDetail.to - battDetail.from);
  });
  const curve = (cycle: number) =>
    samples.map((soc) => `${x(soc).toFixed(1)},${y(battOcv(soc, cycle)).toFixed(1)}`).join(" ");

  const vFresh = battOcv(battMisread.truth, 1);
  const vAged = battOcv(battMisread.truth, battGenerator.cycles);

  return (
    <svg
      className="scene-svg scene-batt-detail"
      viewBox="0 0 300 76"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <polyline className="scene-batt-curve" data-age="fresh" points={curve(1)} />
      <polyline className="scene-batt-curve" data-age="aged" points={curve(battGenerator.cycles)} />

      {/* The sink itself, which is the only thing this panel exists to show. */}
      <line
        className="scene-batt-sink"
        x1={x(battMisread.truth)}
        x2={x(battMisread.truth)}
        y1={y(vFresh)}
        y2={y(vAged)}
      />
      <circle className="scene-batt-dot" cx={x(battMisread.truth)} cy={y(vFresh)} r={1.5} />
      <circle
        className="scene-batt-dot"
        data-truth=""
        cx={x(battMisread.truth)}
        cy={y(vAged)}
        r={1.5}
      />

      <text className="scene-batt-detail-label" x={L} y={72}>
        detail: charge {Math.round(battDetail.from * 100)}&ndash;{Math.round(battDetail.to * 100)}%,
        magnified {battMagnification}&times;
      </text>
    </svg>
  );
}

export function BatteryScene() {
  return (
    <div
      className="scene-batt"
      role="img"
      aria-label={`Open-circuit voltage against state of charge for the repository's synthetic cell. Ageing lowers the whole curve by ${battMisreadText.volts} volts, so a gauge calibrated on a fresh cell reads ${battMisreadText.reads} percent when the charge is really ${battMisread.atSoc} percent, understating it by ${battMisreadText.points} points. Capacity over the same span falls from ${battCapacity.fresh.toFixed(1)} to ${battCapacity.aged.toFixed(1)} amp hours.`}
    >
      <BatteryPlot />

      <div className="scene-batt-zoom" {...at(44, 62)}>
        <BatteryDetail />
      </div>

      <ol className="scene-batt-keys" aria-hidden="true">
        <li {...at(50, 66)}>
          <span>the curve sinks with age</span>
          <strong>{battMisreadText.volts} V</strong>
        </li>
        <li {...at(54, 70)}>
          <span>so the gauge understates charge</span>
          <strong>{battMisreadText.points} points</strong>
        </li>
        <li {...at(58, 74)}>
          <span>capacity over the same span</span>
          <strong>
            {battCapacity.fresh.toFixed(1)} to {battCapacity.aged.toFixed(1)} Ah
          </strong>
        </li>
      </ol>

      {/* The split, drawn, because holding back the newest cycles is the only honest version. */}
      <div className="scene-batt-split" {...at(62, 78)} aria-hidden="true">
        <i
          className="scene-batt-train"
          style={{ "--w": `${(battSplit.trainTo / battGenerator.cycles) * 100}%` } as React.CSSProperties}
        />
        <span>
          train {battSplit.trainFrom}&ndash;{battSplit.trainTo}
        </span>
        <b>
          test {battSplit.testFrom}&ndash;{battSplit.testTo}
        </b>
      </div>

      <p className="scene-batt-note" {...at(66, 82)}>
        The curve is the generator&rsquo;s own voltage formula, evaluated rather than drawn. It is a
        synthetic cell: the repository ships no battery data, no trained model and no score.
      </p>
    </div>
  );
}

/* ============================================================================================
 * Flood LSTM - how little room there is, and how much of it the calendar already has
 *
 * The repository's own blunt sentence is the figure's brief: most of what the model scores comes
 * from learning the seasonal cycle, which a table of 365 numbers also learns. So the axis runs
 * the whole way from nothing to the noise ceiling, and the two marks land almost on top of each
 * other near the right-hand end. The clustering is the argument, which is why the axis is not
 * truncated to make the gap look larger than it is.
 * ========================================================================================== */
export function FloodScene() {
  const ceiling = floodAxisPercent(floodScores.ceiling);
  const lstm = floodAxisPercent(floodScores.lstm);
  const calendar = floodAxisPercent(floodScores.calendar);
  return (
    <div
      className="scene-flood"
      role="img"
      aria-label={`Coefficient of determination on held-out days. Independent noise in the generator caps any method at ${floodScores.ceiling}. A lookup table of mean discharge per calendar day reaches ${floodScores.calendar}, and the network reaches ${floodScores.lstm}, a gap of ${floodGap}.`}
    >
      <div className="scene-flood-track" {...at(26, 48)}>
        <i className="scene-flood-fill" style={{ "--w": `${ceiling}%` } as React.CSSProperties} />
        <span
          className="scene-flood-ceiling"
          style={{ "--p": `${ceiling}%` } as React.CSSProperties}
          aria-hidden="true"
        />
        <b
          className="scene-flood-mark"
          data-kind="calendar"
          style={{ "--p": `${calendar}%` } as React.CSSProperties}
          aria-hidden="true"
        />
        <b
          className="scene-flood-mark"
          data-kind="lstm"
          style={{ "--p": `${lstm}%` } as React.CSSProperties}
          aria-hidden="true"
        />
      </div>

      <ol className="scene-flood-keys" aria-hidden="true">
        <li {...at(34, 52)}>
          <span>the calendar alone</span>
          <strong>{floodScores.calendar}</strong>
        </li>
        <li {...at(38, 56)}>
          <span>the network</span>
          <strong>{floodScores.lstm}</strong>
        </li>
        <li {...at(42, 60)}>
          <span>nothing can beat</span>
          <strong>{floodScores.ceiling}</strong>
        </li>
      </ol>

      <p className="scene-flood-note" {...at(54, 70)}>
        The gap between a table of 365 numbers and the network is {floodGap}. That is the whole of
        what the network adds, on a catchment that was generated rather than observed.
      </p>
    </div>
  );
}

/* ============================================================================================
 * Release tracking - a wide sheet, and four frames
 *
 * The case study's own summary of the work: the column order is an accident of how the sheet
 * grew, and deciding which fields belong beside which others was the job. Drawing the tool would
 * mean drawing an interface nobody outside the company may see, so the figure draws the change
 * in shape instead, which is the part that is publishable and also the part that mattered.
 *
 * The ticks are a standing-in for a wide sheet, not a count: the repository says about 600 rows
 * and 130 or more columns, and a figure claiming to show 130 of anything would be asserting a
 * precision the source does not have.
 * ========================================================================================== */
export function ReleaseScene() {
  return (
    <div
      className="scene-release"
      role="img"
      aria-label={`A sheet of about ${releaseSheet.rows} rows and ${releaseSheet.columns} or more columns, read by scanning, becoming ${releaseFrames.length} frames grouped by subject: ${releaseFrames.map((f) => f.label).join(", ")}.`}
    >
      <div className="scene-release-before" {...at(26, 44)}>
        <p className="scene-release-label" aria-hidden="true">
          about {releaseSheet.columns}+ columns, read by scanning
        </p>
        <div className="scene-release-ticks" aria-hidden="true">
          {Array.from({ length: releaseTicks }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      </div>

      <ol className="scene-release-frames">
        {releaseFrames.map((f, i) => (
          <li className="scene-release-frame" key={f.key} {...at(34 + i * 4, 52 + i * 4)}>
            <span aria-hidden="true">{f.label}</span>
          </li>
        ))}
      </ol>

      <p className="scene-release-note" {...at(54, 70)}>
        The column order is an accident of how the sheet grew. The grouping is what a reader
        actually wants, and choosing it was the work.
      </p>
    </div>
  );
}

/* ============================================================================================
 * Keras against PyTorch - the list of things that cannot be matched
 *
 * The repository's own framing: this is a translation, not a race, and the interesting part is
 * not an accuracy number. It is the five differences between the frameworks and what each one
 * costs, four of which were corrected for and one of which is the irreducible floor.
 *
 * The figure draws exactly that. No accuracy appears in it, because the Keras run has not been
 * made: the repository's results directory holds a .gitkeep and its own table records the number
 * as pending. A figure showing two bars here would be inventing the project's only missing
 * result.
 * ========================================================================================== */
export function TranslationScene() {
  return (
    <div
      className="scene-translation"
      role="img"
      aria-label={`Five differences between the two frameworks. ${translationResolved} of ${translationTotal} were corrected for; the reduction order of the kernels is accepted as the irreducible floor. Both models are asserted at ${translationModel.parameters.toLocaleString("en-US")} trainable parameters.`}
    >
      <ol className="scene-translation-list">
        {translationDiffs.map((d, i) => (
          <li
            className="scene-translation-row"
            data-resolved={d.resolved ? "" : undefined}
            key={d.key}
            {...at(26 + i * 4, 44 + i * 4)}
          >
            <span className="scene-translation-what" aria-hidden="true">{d.what}</span>
            <span className="scene-translation-rule" aria-hidden="true" />
            <span className="scene-translation-how" aria-hidden="true">{d.handled}</span>
          </li>
        ))}
      </ol>
      <p className="scene-translation-note" {...at(52, 68)}>
        {translationResolved} of {translationTotal} corrected for. The last is the floor on any
        comparison of this kind, and both models are asserted at{" "}
        {translationModel.parameters.toLocaleString("en-US")} trainable parameters on every push.
      </p>
    </div>
  );
}

/* ============================================================================================
 * Eurostat modal split - what 24 years moved, against what a border moves
 *
 * The report's finding is an absence: the EU car share went from 82.0 to 82.5 per cent between
 * 2000 and 2024. A line chart of that is a flat line, and a flat line read on its own says
 * "nothing here" rather than "this is the result".
 *
 * So the figure puts the change next to something that did move. One axis of car share carries
 * both: the 24-year EU change, which is half a point wide and barely a mark, and the spread
 * across countries in a single year, which is 30.9 points. The comparison is the argument.
 * ========================================================================================== */
export function ModalSplitScene() {
  const { from, to, fromYear, toYear, changePoints, years } = modalEu;
  const left = modalAxisPercent(Math.min(from, to));
  const width = Math.max(modalAxisPercent(Math.max(from, to)) - left, 0.6);
  const spreadLeft = modalAxisPercent(modalSpread.lowest.share);
  const spreadWidth = modalAxisPercent(modalSpread.highest.share) - spreadLeft;
  return (
    <div
      className="scene-modal"
      role="img"
      aria-label={`Car share of inland passenger transport. The European Union aggregate moved from ${from} per cent in ${fromYear} to ${to} in ${toYear}, a change of ${changePoints} points over ${years} years. In ${modalCoverage.comparisonYear} the spread across countries is ${modalSpread.points} points, from ${modalSpread.lowest.share} per cent in ${modalSpread.lowest.country} to ${modalSpread.highest.share} in ${modalSpread.highest.country}, with Germany at ${modalSpread.germany.share}.`}
    >
      <div className="scene-modal-row" {...at(26, 46)}>
        <p className="scene-modal-name" aria-hidden="true">
          The EU, {fromYear} to {toYear}
        </p>
        <div className="scene-modal-track" aria-hidden="true">
          <i
            className="scene-modal-span"
            data-kind="change"
            style={{ "--l": `${left}%`, "--w": `${width}%` } as React.CSSProperties}
          />
        </div>
        <p className="scene-modal-read" aria-hidden="true">
          <strong>+{changePoints}</strong>
          <span>points in {years} years</span>
        </p>
      </div>

      <div className="scene-modal-row" {...at(34, 54)}>
        <p className="scene-modal-name" aria-hidden="true">
          Across countries, {modalCoverage.comparisonYear}
        </p>
        <div className="scene-modal-track" aria-hidden="true">
          <i
            className="scene-modal-span"
            data-kind="spread"
            style={{ "--l": `${spreadLeft}%`, "--w": `${spreadWidth}%` } as React.CSSProperties}
          />
          <b
            className="scene-modal-mark"
            style={{ "--p": `${modalAxisPercent(modalSpread.germany.share)}%` } as React.CSSProperties}
          />
        </div>
        <p className="scene-modal-read" aria-hidden="true">
          <strong>{modalSpread.points}</strong>
          <span>points wide</span>
        </p>
      </div>

      <p className="scene-modal-note" {...at(52, 68)}>
        {modalSpread.lowest.share} per cent in {modalSpread.lowest.country} to{" "}
        {modalSpread.highest.share} in {modalSpread.highest.country}, with Germany marked at{" "}
        {modalSpread.germany.share}. The axis starts at {modalAxis.min}, not zero.
      </p>
    </div>
  );
}

/* ============================================================================================
 * BM25 parity - the ranking two implementations have to agree on
 *
 * The claim is not that BM25 can be written in Java. It is that two independent implementations
 * return the same order, and the figure has to make clear why that is hard rather than obvious.
 *
 * So it draws one real ranking from the fixture and marks the pair at the top that are four
 * thousandths apart. That gap is the whole reason the Java side keeps the Python loop order and
 * refuses an inverted index: floating-point addition is not associative, and a few units in the
 * last place would swap exactly this pair. The scores are the fixture's own.
 * ========================================================================================== */
export function ParityScene() {
  const width = (s: number) => `${Math.round((s / paritySampleMax) * 1000) / 10}%`;
  return (
    <div
      className="scene-parity"
      role="img"
      aria-label={`The BM25 ranking for question ${paritySample.questionId}. The top two chunks score ${paritySample.hits[0].score} and ${paritySample.hits[1].score}, ${parityClosestGap} apart. Both implementations return this order for all ${parityConfig.questions} questions.`}
    >
      <ol className="scene-parity-list">
        {paritySample.hits.map((h, i) => (
          <li className="scene-parity-row" key={h.id} {...at(26 + i * 4, 44 + i * 4)}>
            <span className="scene-parity-rank" aria-hidden="true">
              {h.rank}
            </span>
            <span className="scene-parity-id" aria-hidden="true">
              {h.form}
            </span>
            <span className="scene-parity-track" aria-hidden="true">
              <i className="scene-parity-bar" style={{ "--w": width(h.score) } as React.CSSProperties} />
            </span>
            <span className="scene-parity-score" aria-hidden="true">
              {h.score.toFixed(4)}
            </span>
          </li>
        ))}
      </ol>
      <p className="scene-parity-note" {...at(52, 68)}>
        The top two are {parityClosestGap} apart. Summing the same contributions in a different
        order would swap them, so the Java side keeps the Python loop order and both return this
        ranking for all {parityConfig.questions} questions.
      </p>
    </div>
  );
}

/* ============================================================================================
 * Munich forecasting - a margin, and the same margin three years earlier
 *
 * This is the site's own device used on the project it was made for: the interval, not the
 * point. The published result is a single confident number, and the repository spends most of
 * its length arguing against it, so a figure that drew the number alone would be taking the
 * side the author does not take.
 *
 * Both rows are the same protocol on different held-out years, on one axis through zero. The
 * published margin sits entirely to the right of it. The ordinary-years margin crosses it, and
 * crossing it is the finding: on 24 months that margin cannot be told apart from no difference.
 *
 * The bounds are the moving-block bootstrap, which is the wider of the two the repository
 * publishes and the one it says to believe.
 * ========================================================================================== */
export function MarginIntervalScene() {
  const zero = munichAxisPercent(0);
  return (
    <div
      className="scene-margin"
      role="img"
      aria-label={munichWindows
        .map(
          (w) =>
            `${w.label}: margin ${(w.margin * 100).toFixed(1)} per cent, interval ${(w.low * 100).toFixed(1)} to ${(w.high * 100).toFixed(1)}, winning on ${w.seriesWon} of ${munichSeriesTotal} series.`,
        )
        .join(" ")}
    >
      {munichWindows.map((w, i) => {
        const left = munichAxisPercent(w.low);
        const right = munichAxisPercent(w.high);
        return (
          <div
            className="scene-margin-row"
            data-clears={w.clearsZero ? "" : undefined}
            key={w.key}
            {...at(26 + i * 10, 46 + i * 10)}
          >
            <p className="scene-margin-name" aria-hidden="true">
              {w.label}
            </p>
            <div className="scene-margin-track" aria-hidden="true">
              <span className="scene-margin-zero" style={{ "--z": `${zero}%` } as React.CSSProperties} />
              <i
                className="scene-margin-interval"
                style={
                  { "--l": `${left}%`, "--w": `${right - left}%` } as React.CSSProperties
                }
              />
              <b
                className="scene-margin-point"
                style={{ "--p": `${munichAxisPercent(w.margin)}%` } as React.CSSProperties}
              />
            </div>
            <p className="scene-margin-read" aria-hidden="true">
              <strong>
                {w.margin > 0 ? "+" : ""}
                {(w.margin * 100).toFixed(1)}%
              </strong>
              <span>
                {w.seriesWon} of {munichSeriesTotal} series
              </span>
            </p>
          </div>
        );
      })}
      <p className="scene-margin-note" {...at(50, 66)}>
        The lower interval crosses zero, so on {munichTestMonths} months that margin is not
        separable from no difference at all.
      </p>
    </div>
  );
}

/* ============================================================================================
 * Drift platform - the inputs barely moved, the target moved a lot
 *
 * The whole project turns on one comparison, so the figure is that comparison and nothing else:
 * two drift scores on one shared scale, each against the threshold it is actually tested
 * against. The feature bar stops short of its line. The target bar runs past its own.
 *
 * What is deliberately *not* drawn: eleven per-column bars. The repository publishes the drift
 * share across the feature columns and names the one column that crossed, and it does not
 * publish a score per column. Eleven bars at plausible heights would be the figure inventing
 * ten numbers to look more detailed, which is the thing this site argues against. So the
 * feature side shows what is known: a share, a count, and which column it was.
 * ========================================================================================== */
export function DriftScene() {
  const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
  return (
    <div
      className="scene-drift"
      role="img"
      aria-label={`Two drift scores on one scale. The features moved ${driftScores.featureShare}, below their ${driftScores.columnThreshold} threshold, with ${driftScores.movedColumn} the only one of ${driftScores.featureColumns} columns to cross it. The target moved ${driftScores.target}, far past its ${driftScores.targetThreshold} threshold.`}
    >
      <div className="scene-drift-row" data-kind="features" {...at(26, 48)}>
        <p className="scene-drift-name" aria-hidden="true">
          Features
        </p>
        <div className="scene-drift-track" aria-hidden="true">
          <i
            className="scene-drift-fill"
            style={{ "--v": pct(driftScores.featureShare) } as React.CSSProperties}
          />
          <span
            className="scene-drift-gate"
            style={{ "--t": pct(driftScores.columnThreshold) } as React.CSSProperties}
          />
        </div>
        <p className="scene-drift-read" aria-hidden="true">
          <strong>{driftScores.featureShare}</strong>
          <span>
            {driftScores.movedColumn} only, 1 of {driftScores.featureColumns}
          </span>
        </p>
      </div>

      <div className="scene-drift-row" data-kind="target" {...at(34, 56)}>
        <p className="scene-drift-name" aria-hidden="true">
          Target
        </p>
        <div className="scene-drift-track" aria-hidden="true">
          <i
            className="scene-drift-fill"
            style={{ "--v": pct(driftScores.target) } as React.CSSProperties}
          />
          <span
            className="scene-drift-gate"
            style={{ "--t": pct(driftScores.targetThreshold) } as React.CSSProperties}
          />
        </div>
        <p className="scene-drift-read" aria-hidden="true">
          <strong>{driftScores.target}</strong>
          <span>past its {driftScores.targetThreshold} line</span>
        </p>
      </div>

      <p className="scene-drift-note" {...at(50, 66)}>
        A monitor watching the inputs alone would have declined to act.
      </p>
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
