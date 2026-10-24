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
  classes as authClasses,
  counted as authCounted,
  notClaimed as authNotClaimed,
  sharePercent as authSharePercent,
} from "@/content/authorship-chapter";
import {
  percentOfAxis as careerAxis,
  rejections as careerRejections,
  weights as careerWeights,
} from "@/content/career-chapter";
import {
  exclusivePercent as nlpExclusivePercent,
  outcomes as nlpOutcomes,
  templateCount as nlpTemplateCount,
  text as nlpText,
  vocabulary as nlpVocabulary,
} from "@/content/nlp-chapter";
import {
  baseline as statBaseline,
  correctOf as statCorrectOf,
  gradientChecks as statGradientChecks,
  runs as statRuns,
  searchMarginPoints as statMarginPoints,
  testPoints as statTestPoints,
  text as statText,
} from "@/content/statlearn-chapter";
import {
  components as supplyComponents,
  distinctSignals as supplyDistinct,
  duplicated as supplyDuplicated,
  duplicatedWeight as supplyDuplicatedWeight,
  formulas as supplyFormulas,
  weightText as supplyWeightText,
} from "@/content/supply-chain-chapter";
import {
  centredPercent as weatherCentred,
  cities as weatherCities,
  humidityAxis as weatherHumidityAxis,
  humidityMiss as weatherHumidityMiss,
  tempAxis as weatherTempAxis,
  tempMiss as weatherTempMiss,
  text as weatherText,
} from "@/content/weather-chapter";
import {
  axis as waterAxis,
  axisPercent as waterAxisPercent,
  commonBand as waterBand,
  commonBandText as waterBandText,
  withInterval as waterWithInterval,
  withoutInterval as waterWithoutInterval,
} from "@/content/water-chapter";
import {
  breakEven as claimsBreakEven,
  breakEvenText as claimsBreakEvenText,
  cells as claimsCells,
  defaultCut as claimsDefaultCut,
  stages as claimsStages,
  valueBand as claimsBand,
  valueOfFlagging,
  valueOfHolding,
} from "@/content/claims-chapter";
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
        <polygon className="scene-hydro-band" points={band} {...at(44, 80)} />
        <polyline className="scene-hydro-line" points={hydroLine} pathLength={100} {...at(26, 60)} />
      </svg>
      <p className="scene-hydro-label" {...at(62, 86)}>
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
        <polyline className="scene-sf-truth" points={sfTruth} pathLength={100} {...at(28, 58)} />
        <polyline className="scene-sf-pred" points={sfPred} pathLength={100} {...at(44, 74)} />
      </svg>
      <p className="scene-sf-caption" {...at(64, 88)}>
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
 * Insurance claims - where a probability becomes a decision
 *
 * There is no model result in this figure, because the repository publishes none: no data, no
 * split, no trained model, no calibration output, no evaluation report, and it says so rather
 * than implying otherwise. What it does ship is an illustrative cost matrix, and four numbers
 * plus a calibrated probability fix the decision boundary in closed form - no dataset involved.
 *
 * So the figure is that derivation. Two straight lines: what acting on a policy is worth as its
 * probability of claiming rises, and what leaving it alone is worth. They cross once. Everything
 * to the right of the crossing is worth acting on, and the crossing is nowhere near the one half
 * that almost everything defaults to - which is the entire point of the module.
 * ========================================================================================== */
export function ClaimsThresholdScene() {
  const L = 34;
  const R = 290;
  const T = 16;
  const B = 118;
  const x = (p: number) => L + p * (R - L);
  const y = (v: number) =>
    B - ((v - claimsBand.low) / (claimsBand.high - claimsBand.low)) * (B - T);

  /* Both are linear in p, so two endpoints each describe them exactly. */
  const line = (f: (p: number) => number) =>
    `${x(0).toFixed(1)},${y(f(0)).toFixed(1)} ${x(1).toFixed(1)},${y(f(1)).toFixed(1)}`;

  return (
    <div
      className="scene-claims"
      role="img"
      aria-label={`Two lines over a policy's probability of claiming: the value of acting on it, and the value of leaving it alone. They cross at ${claimsBreakEvenText.percent} percent, which is where the repository's illustrative cost matrix puts the decision boundary - ${claimsBreakEvenText.ratio} times lower than the one half a classifier defaults to.`}
    >
      <svg
        className="scene-svg scene-claims-plot"
        viewBox="0 0 300 136"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <g className="scene-claims-axes">
          <line x1={L} x2={R} y1={y(0)} y2={y(0)} />
          <line x1={L} x2={L} y1={T} y2={B} />
        </g>

        {/* Leaving a policy alone: free until it claims, then the whole payout. */}
        <polyline
          className="scene-claims-line"
          data-side="hold"
          pathLength={100}
          points={line(valueOfHolding)}
          {...at(24, 44)}
        />

        {/* Acting on it: a small standing cost, repaid as the risk rises. */}
        <polyline
          className="scene-claims-line"
          data-side="flag"
          pathLength={100}
          points={line(valueOfFlagging)}
          {...at(28, 48)}
        />

        {/* The crossing. The only threshold those four numbers justify. */}
        <g className="scene-claims-cross" {...at(46, 62)}>
          <line x1={x(claimsBreakEven)} x2={x(claimsBreakEven)} y1={T} y2={B} />
          <circle cx={x(claimsBreakEven)} cy={y(valueOfHolding(claimsBreakEven))} r={3} />
        </g>

        {/* And the habit, for scale. */}
        <g className="scene-claims-default" {...at(54, 70)}>
          <line x1={x(claimsDefaultCut)} x2={x(claimsDefaultCut)} y1={T} y2={B} />
          {/* Anchored left of its own rule: to the right of it the value line climbs straight
              through where this label would otherwise sit. */}
          <text x={x(claimsDefaultCut) - 4} y={T + 9} textAnchor="end">
            the usual 0.5
          </text>
        </g>

        <g className="scene-claims-labels" {...at(58, 74)}>
          <text x={x(claimsBreakEven)} y={B + 13} textAnchor="start">
            {claimsBreakEvenText.percent}%
          </text>
          <text x={R} y={B + 13} textAnchor="end">
            certain to claim
          </text>
        </g>
      </svg>

      {/* The four numbers the crossing is derived from, stated rather than implied. */}
      <ol className="scene-claims-cells" aria-hidden="true">
        {claimsCells.map((c, i) => (
          <li
            className="scene-claims-cell"
            data-sign={c.value < 0 ? "loss" : c.value > 0 ? "gain" : "zero"}
            key={c.key}
            {...at(60 + i * 2.5, 74 + i * 2.5)}
          >
            <span>{c.label}</span>
            <strong>
              {c.value > 0 ? "+" : ""}
              {c.value}
            </strong>
          </li>
        ))}
      </ol>

      <ol className="scene-claims-stages" aria-hidden="true">
        {claimsStages.map((st, i) => (
          <li key={st.key} {...at(70 + i * 3, 84 + i * 3)}>
            <b>{st.label}</b>
            <span>{st.note}</span>
          </li>
        ))}
      </ol>

      <p className="scene-claims-note" {...at(78, 92)}>
        The matrix those four numbers come from is the repository&rsquo;s own example and is not a
        validated policy. The crossing is arithmetic, not a result: no data, no model and no score
        are published here.
      </p>
    </div>
  );
}

/* ============================================================================================
 * Water quality - the leaderboard and the intervals underneath it
 *
 * This repository does publish numbers, so this figure uses them. What it draws is the half of
 * the artefact the README's headline table leaves out: beside each model's single-split score,
 * `model_results.json` also recorded the cross-validated F1 and its standard deviation across
 * folds, and once those are drawn as intervals the ranking stops being a ranking.
 *
 * Three of the four intervals overlap - there is a single value of F1 consistent with all three
 * at once, drawn here as the shaded column. Only logistic regression is separated from the rest.
 * The tuned model, which the table bolds as competitive, has no interval at all, so it is drawn
 * as a bare point and labelled as one rather than quietly given the benefit of the doubt.
 *
 * The axis starts at 0.65 instead of zero, which is stated on the figure: at full scale these
 * intervals are a few pixels and the point of the drawing disappears.
 * ========================================================================================== */
export function WaterIntervalScene() {
  return (
    <div
      className="scene-water"
      role="img"
      aria-label={`Cross-validated F1 for four models with one-standard-deviation intervals across folds. The intervals for ${waterWithInterval.slice(0, 3).map((r) => r.name).join(", ")} all overlap, leaving a band from ${waterBandText.from} to ${waterBandText.to} consistent with all three, so the run does not separate them. Only ${waterWithInterval[waterWithInterval.length - 1].name} sits clear of the others. No interval was recorded for ${waterWithoutInterval.map((r) => r.name).join(", ")}.`}
    >
      <ol className="scene-water-rows">
        {waterWithInterval.map((r, i) => (
          <li className="scene-water-row" key={r.name} {...at(24 + i * 4, 42 + i * 4)}>
            <span className="scene-water-name" aria-hidden="true">
              {r.name}
            </span>
            <span className="scene-water-track" aria-hidden="true">
              {/*
               * The band every contender's interval passes through - drawn only on the rows whose
               * interval actually reaches it. Drawn on all of them it appeared behind logistic
               * regression too, which is the one model the run does separate, and implied the
               * opposite of the finding.
               */}
              {r.cvMean - r.cvSd <= waterBand.to && r.cvMean + r.cvSd >= waterBand.from ? (
                <i
                  className="scene-water-common"
                  style={
                    {
                      "--from": `${waterAxisPercent(waterBand.from)}%`,
                      "--to": `${waterAxisPercent(waterBand.to)}%`,
                    } as React.CSSProperties
                  }
                />
              ) : null}
              <i
                className="scene-water-interval"
                style={
                  {
                    "--from": `${waterAxisPercent(r.cvMean - r.cvSd)}%`,
                    "--to": `${waterAxisPercent(r.cvMean + r.cvSd)}%`,
                  } as React.CSSProperties
                }
              />
              <b
                className="scene-water-point"
                style={{ "--p": `${waterAxisPercent(r.cvMean)}%` } as React.CSSProperties}
              />
            </span>
            <strong className="scene-water-value" aria-hidden="true">
              {r.cvMean.toFixed(3)}
            </strong>
          </li>
        ))}

        {/* No fold statistics were recorded for the tuned model, so it gets no bar. */}
        {waterWithoutInterval.map((r, i) => (
          <li className="scene-water-row" data-bare="" key={r.name} {...at(40 + i * 4, 58 + i * 4)}>
            <span className="scene-water-name" aria-hidden="true">
              {r.name}
            </span>
            <span className="scene-water-track" aria-hidden="true">
              <em className="scene-water-missing">no interval recorded</em>
            </span>
            <strong className="scene-water-value" aria-hidden="true">
              &mdash;
            </strong>
          </li>
        ))}
      </ol>

      <p className="scene-water-axis" aria-hidden="true" {...at(50, 66)}>
        <span>cross-validated F1, {waterAxis.from}</span>
        <span>{waterAxis.to}</span>
      </p>

      <p className="scene-water-note" {...at(56, 72)}>
        The shaded column is the range consistent with all {waterBand.models} intervals at once,
        {" "}
        {waterBandText.from} to {waterBandText.to}. The axis begins at {waterAxis.from} rather than
        zero so the intervals are legible, and the data is generated rather than measured: this
        says nothing about whether any real water is safe.
      </p>
    </div>
  );
}

/* ============================================================================================
 * Weather EDA - the analysis against the generator that produced it
 *
 * Every number in this project comes out of a seeded generator, so no figure drawn from it says
 * anything about weather. What the figure can do - and what makes the project checkable rather
 * than decorative - is hold the analysis to the configuration that produced the data, because
 * both are in the repository.
 *
 * Two panels, both centred on zero, both showing how far the recovered statistic landed from the
 * value that was set. The temperature panel scatters either side of zero, which is what noise
 * looks like. The humidity panel does not: every city misses the same way by about the same
 * amount, which is a property of how the generator builds humidity and the only thing here that
 * nobody put in deliberately.
 * ========================================================================================== */
export function WeatherRecoveryScene() {
  return (
    <div
      className="scene-weather"
      role="img"
      aria-label={`For six cities, the distance between the value the generator was configured with and the value the analysis recovered. Mean temperature lands within ${weatherText.worstTemp} degrees in every city, scattered either side of zero. Mean humidity is above its configured value in all six, by between ${weatherText.humidityLow} and ${weatherText.humidityHigh} percentage points, which is a systematic offset rather than noise.`}
    >
      <div className="scene-weather-heads" aria-hidden="true">
        <span />
        <span>mean temperature, &deg;C</span>
        <span>mean humidity, points</span>
      </div>

      <ol className="scene-weather-rows">
        {weatherCities.map((c, i) => (
          <li className="scene-weather-row" key={c.city} {...at(24 + i * 3.5, 42 + i * 3.5)}>
            <span className="scene-weather-city" aria-hidden="true">
              {c.city}
            </span>

            <span className="scene-weather-track" aria-hidden="true">
              <i className="scene-weather-zero" />
              <b
                className="scene-weather-dot"
                style={
                  { "--p": `${weatherCentred(weatherTempMiss(c), weatherTempAxis)}%` } as React.CSSProperties
                }
              />
            </span>

            <span className="scene-weather-track" data-systematic="" aria-hidden="true">
              <i className="scene-weather-zero" />
              <b
                className="scene-weather-dot"
                data-systematic=""
                style={
                  {
                    "--p": `${weatherCentred(weatherHumidityMiss(c), weatherHumidityAxis)}%`,
                  } as React.CSSProperties
                }
              />
            </span>
          </li>
        ))}
      </ol>

      <p className="scene-weather-axis" aria-hidden="true" {...at(46, 62)}>
        <span />
        <span>
          &minus;{weatherTempAxis} &middot; 0 &middot; +{weatherTempAxis}
        </span>
        <span>
          &minus;{weatherHumidityAxis} &middot; 0 &middot; +{weatherHumidityAxis}
        </span>
      </p>

      <p className="scene-weather-note" {...at(52, 68)}>
        Temperature lands within {weatherText.worstTemp}&nbsp;&deg;C of the figure it was set to,
        either side of zero. Humidity misses high in all {weatherCities.length} cities, by{" "}
        {weatherText.humidityLow} to {weatherText.humidityHigh} points &mdash; one sign, one size,
        which is the generator rather than chance. None of it is weather.
      </p>
    </div>
  );
}

/* ============================================================================================
 * Supply chain - a scorecard that counts one signal twice
 *
 * No business metric appears here; the repository versions no data and publishes no figures.
 * What it does publish is a weighting, and a weighting can be read against the functions it
 * weights.
 *
 * Two of the five components are computed from the same column. One normalises the on-time rate
 * ascending, the other normalises one minus the on-time rate descending, which is the same
 * transform written backwards - so the scorecard's two largest weights are one signal under two
 * names. The bar below is the weighting at true proportion, with those two segments joined.
 * ========================================================================================== */
export function SupplierWeightScene() {
  return (
    <div
      className="scene-supply"
      role="img"
      aria-label={`The supplier scorecard's five weights drawn in proportion. ${supplyDuplicated.map((c) => c.label).join(" and ")} are computed from the same column by the same transform, so together they carry ${supplyWeightText.duplicated} of the composite as a single signal counted twice, leaving ${supplyDistinct} distinct signals rather than ${supplyComponents.length}.`}
    >
      <div className="scene-supply-bar" {...at(24, 44)} aria-hidden="true">
        {supplyComponents.map((c) => (
          <i
            className="scene-supply-seg"
            data-duplicate={c.duplicate ? "" : undefined}
            key={c.key}
            style={{ "--w": `${c.weight * 100}%` } as React.CSSProperties}
          >
            <span>{Math.round(c.weight * 100)}</span>
          </i>
        ))}
      </div>

      {/* The bracket spans exactly the two segments it is about. */}
      <div
        className="scene-supply-brace"
        {...at(34, 52, { "--w": `${supplyDuplicatedWeight * 100}%` } as React.CSSProperties)}
        aria-hidden="true"
      >
        <i />
        <span>
          one signal, counted twice &mdash; {supplyWeightText.duplicated} of the score
        </span>
      </div>

      <ol className="scene-supply-keys" aria-hidden="true">
        {supplyComponents.map((c, i) => (
          <li
            className="scene-supply-key"
            data-duplicate={c.duplicate ? "" : undefined}
            key={c.key}
            {...at(42 + i * 2.5, 56 + i * 2.5)}
          >
            <b>{c.label}</b>
            <span>{c.source}</span>
          </li>
        ))}
      </ol>

      {/* The inventory side is arithmetic the repository implements, stated as arithmetic. */}
      <ol className="scene-supply-formulas" aria-hidden="true">
        {supplyFormulas.map((f, i) => (
          <li key={f.key} {...at(56 + i * 3, 70 + i * 3)}>
            <b>{f.label}</b>
            <code>{f.body}</code>
          </li>
        ))}
      </ol>

      <p className="scene-supply-note" {...at(66, 80)}>
        Inverting a min-max normalisation of one minus a series returns the series, so those two
        components are equal for every supplier. The repository publishes no data and no metric;
        the inventory formulas are classical and their assumptions are the user&rsquo;s to justify.
      </p>
    </div>
  );
}

/* ============================================================================================
 * Statistical learning - sixty test points, and what they can resolve
 *
 * The axis is ruled at one tick per test point, because the test set has sixty of them and a tick
 * is therefore the smallest difference that exists. Everything the report concludes has to be
 * read at that resolution, which is the whole reason for drawing it this way: the gap between
 * the two hyperparameter searches is one tick wide.
 *
 * The baseline is drawn as a wall rather than a mark. Guessing the majority class scores better
 * than the untouched configuration does, so the left-hand result is not a weak model - it is a
 * model that has yet to earn the right to exist, and the figure should not let it hide among the
 * others.
 * ========================================================================================== */
export function StatLearnScene() {
  const L = 8;
  const R = 292;
  const x = (a: number) => L + a * (R - L);

  return (
    <div
      className="scene-stat"
      role="img"
      aria-label={`Test accuracy on ${statTestPoints} held-out points, ruled one tick per point. The default configuration scores below the majority-class baseline. After a learning-rate sweep and under either hyperparameter search the model clears it, and random search finishes ${statMarginPoints} test point ahead of Bayesian optimisation.`}
    >
      <svg
        className="scene-svg scene-stat-axis"
        viewBox="0 0 300 42"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* One tick per test point: the resolution of every number on this page. */}
        <g className="scene-stat-ticks">
          {Array.from({ length: statTestPoints + 1 }, (_, i) => (
            <line key={i} x1={x(i / statTestPoints)} x2={x(i / statTestPoints)} y1={26} y2={32} />
          ))}
        </g>
        <line className="scene-stat-rule" x1={L} x2={R} y1={32} y2={32} />

        {/* The baseline, as a wall. */}
        <g className="scene-stat-wall" {...at(34, 50)}>
          <line x1={x(statBaseline.accuracy)} x2={x(statBaseline.accuracy)} y1={4} y2={32} />
        </g>

        {statRuns
          .filter((r) => r.kind !== "baseline")
          .map((r, i) => (
            <g
              className="scene-stat-mark"
              data-kind={r.kind ?? undefined}
              data-under={r.accuracy < statBaseline.accuracy ? "" : undefined}
              key={r.key}
              {...at(38 + i * 4, 54 + i * 4)}
            >
              <line x1={x(r.accuracy)} x2={x(r.accuracy)} y1={10 + i * 4} y2={32} />
              <circle cx={x(r.accuracy)} cy={10 + i * 4} r={3} />
            </g>
          ))}
      </svg>

      <ol className="scene-stat-keys">
        {statRuns.map((r, i) => (
          <li
            className="scene-stat-key"
            data-kind={r.kind ?? undefined}
            data-under={r.accuracy < statBaseline.accuracy ? "" : undefined}
            key={r.key}
            {...at(42 + i * 3, 58 + i * 3)}
          >
            <b>
              {statCorrectOf(r)}/{statTestPoints}
            </b>
            <span>{r.label}</span>
            <em>{r.note}</em>
          </li>
        ))}
      </ol>

      {/* The two gradient checks, which are the reason to believe any of the above. */}
      <ol className="scene-stat-checks" aria-hidden="true">
        {statGradientChecks.map((c, i) => (
          <li key={c.key} {...at(58 + i * 3, 72 + i * 3)}>
            <b>{c.value.toExponential(1)}</b>
            <span>
              {c.kind} {c.label}
            </span>
          </li>
        ))}
      </ol>

      <p className="scene-stat-note" {...at(66, 80)}>
        One tick is one test point, {statText.onePoint} of the axis, and random search finishes
        exactly {statMarginPoints} tick ahead of Bayesian optimisation. The untouched
        configuration sits {statText.belowBaseline} below guessing the majority class; what fixed
        it was a learning rate {statText.lrFactor} times larger, not a better model.
      </p>
    </div>
  );
}

/* ============================================================================================
 * News classification - the branch that refuses
 *
 * No metric appears here; the repository publishes none. The figure draws the loader's control
 * flow instead, because the decision in it is the thing worth showing: when the dataset will not
 * download, the default outcome is to stop. The synthetic fixture exists and is unreachable
 * without asking for it on the command line.
 *
 * The bars underneath are why. Almost every word in that fixture belongs to exactly one class,
 * so a score measured on it would be a description of a template list wearing the clothes of a
 * result - which is precisely the number an automatic fallback would have produced.
 * ========================================================================================== */
export function NewsLoaderScene() {
  return (
    <div
      className="scene-nlp"
      role="img"
      aria-label={`The loader's three outcomes: AG News loads and evaluation proceeds on the published test split; the download fails and the loader raises, which is the default; or the synthetic fixture is used, which requires an explicit flag. Across that fixture's ${nlpTemplateCount} template sentences, ${nlpText.exclusiveShare} of the vocabulary appears in only one class, so a score measured on it would describe the templates rather than any model.`}
    >
      <ol className="scene-nlp-flow">
        {nlpOutcomes.map((o, i) => (
          <li
            className="scene-nlp-outcome"
            data-kind={o.kind}
            key={o.key}
            {...at(24 + i * 5, 42 + i * 5)}
          >
            <b>{o.label}</b>
            <span>{o.detail}</span>
          </li>
        ))}
      </ol>

      <p className="scene-nlp-why" {...at(42, 58)}>
        Why the middle one is the default
      </p>

      <ol className="scene-nlp-bars">
        {nlpVocabulary.map((v, i) => (
          <li className="scene-nlp-bar" key={v.label} {...at(46 + i * 3.5, 62 + i * 3.5)}>
            <span className="scene-nlp-class" aria-hidden="true">
              {v.label}
            </span>
            <span className="scene-nlp-track" aria-hidden="true">
              <i style={{ "--w": `${nlpExclusivePercent(v)}%` } as React.CSSProperties} />
            </span>
            <strong aria-hidden="true">
              {v.exclusive}/{v.words}
            </strong>
          </li>
        ))}
      </ol>

      <p className="scene-nlp-note" {...at(62, 78)}>
        Words belonging to only one of the four classes, counted across the fixture&rsquo;s{" "}
        {nlpTemplateCount} template sentences: {nlpText.exclusiveShare} of its vocabulary. Sorting
        text like that is a lookup rather than a classification, which is why the loader will not
        reach for it on its own. The repository publishes no accuracy, and this page reports none.
      </p>
    </div>
  );
}

/* ============================================================================================
 * CareerOS - where the weighted average ran out of room
 *
 * The score is a weighted sum over seven components, so each term can move the total by at most
 * its own weight. That is fine for "slightly junior" and useless for "the job requires native
 * German", which is not a weak match but an unavailable one.
 *
 * So the figure draws each weight as a bar and, on the two components that needed it, the flat
 * penalty that sits on top - deliberately on the same axis, because the whole point is that the
 * penalty is longer than the term it belongs to. Language can contribute thirteen points and is
 * docked thirty.
 * ========================================================================================== */
export function CareerWeightScene() {
  return (
    <div
      className="scene-career"
      role="img"
      aria-label={`The scoring model's seven weights drawn as bars, with the flat penalties applied on two of them. Location is worth ${careerWeights[1].weight} points and an unreachable location is docked ${careerWeights[1].penalty}; language is worth ${careerWeights[4].weight} and a native-German requirement is docked ${careerWeights[4].penalty}. In both cases the penalty is larger than the term it sits beside, which is why the weighted average alone could not express them.`}
    >
      <ol className="scene-career-rows">
        {careerWeights.map((w, i) => (
          <li className="scene-career-row" key={w.key} {...at(22 + i * 3, 40 + i * 3)}>
            <span className="scene-career-name" aria-hidden="true">
              {w.label}
            </span>
            <span className="scene-career-track" aria-hidden="true">
              <i
                className="scene-career-weight"
                style={{ "--w": `${careerAxis(w.weight)}%` } as React.CSSProperties}
              />
              {w.penalty !== undefined ? (
                <i
                  className="scene-career-penalty"
                  style={{ "--w": `${careerAxis(w.penalty)}%` } as React.CSSProperties}
                />
              ) : null}
            </span>
            <strong className="scene-career-value" aria-hidden="true">
              {w.penalty !== undefined ? `${w.weight} / \u2212${w.penalty}` : w.weight}
            </strong>
          </li>
        ))}
      </ol>

      <p className="scene-career-legend" aria-hidden="true" {...at(44, 60)}>
        <span data-kind="weight">what the term can contribute</span>
        <span data-kind="penalty">what it is docked when the job is unavailable</span>
      </p>

      {/* The four things that are thrown away, as against everything that is merely penalised. */}
      <ol className="scene-career-rejects" {...at(50, 66)}>
        {careerRejections.map((r) => (
          <li key={r.key}>
            <b>{r.label}</b>
            <span>{r.detail}</span>
          </li>
        ))}
      </ol>

      <p className="scene-career-note" {...at(58, 74)}>
        Those four are the only conditions that discard a posting, and each one answers whether
        the opportunity exists rather than whether the candidate is good enough. Everything else
        is a penalty, because a penalty can be read and argued with and a filter cannot.
      </p>
    </div>
  );
}

/* ============================================================================================
 * Architecture case studies - the two lists that bound the claim
 *
 * There is no measurement to draw here, and that is the subject. This repository publishes
 * architecture for systems built at an employer, which is the easiest kind of work to overstate
 * and the hardest to evidence, so it is built around two lists instead.
 *
 * The first is authorship: four classes, strongest claim first, with the commit shares the
 * repository measured where it has them. The RAG service is in the figure precisely because the
 * share is zero - a component listed as somebody else's is what makes the other rows legible as
 * something more than self-description.
 *
 * The second is what is not claimed. Drawn struck through, because each one is a sentence the
 * repository could have written and chose not to.
 * ========================================================================================== */
export function AuthorshipScene() {
  return (
    <div
      className="scene-auth"
      role="img"
      aria-label={`Authorship across four classes, from primary implementation down to existing platform, with measured commit shares for five components ranging from ${Math.round(authSharePercent(authCounted[0]))} percent down to zero. Beside them, four things the repository explicitly does not claim: ${authNotClaimed.map((n) => n.label).join(", ")}.`}
    >
      <ol className="scene-auth-shares">
        {authCounted.map((c, i) => (
          <li className="scene-auth-share" data-zero={c.mine === 0 ? "" : undefined} key={c.name} {...at(22 + i * 3, 40 + i * 3)}>
            <span className="scene-auth-name" aria-hidden="true">
              {c.name}
            </span>
            <span className="scene-auth-track" aria-hidden="true">
              <i style={{ "--w": `${authSharePercent(c)}%` } as React.CSSProperties} />
            </span>
            <strong aria-hidden="true">
              {c.mine}/{c.total}
            </strong>
          </li>
        ))}
      </ol>

      <p className="scene-auth-caveat" {...at(40, 56)}>
        The services are unnamed because their names are internal, and the shape is the point
        either way. A commit count is evidence of weight, not of authorship &mdash; two
        classifications in the repository disagree with these counts deliberately, and say so.
      </p>

      <ol className="scene-auth-classes" aria-hidden="true">
        {authClasses.map((c, i) => (
          <li className="scene-auth-class" data-rank={i} key={c.key} {...at(46 + i * 3, 60 + i * 3)}>
            <b>{c.label}</b>
            <span>{c.detail}</span>
          </li>
        ))}
      </ol>

      <ol className="scene-auth-notclaimed" aria-hidden="true">
        {authNotClaimed.map((n, i) => (
          <li key={n.key} {...at(58 + i * 3, 72 + i * 3)}>
            <b>{n.label}</b>
            <span>{n.detail}</span>
          </li>
        ))}
      </ol>

      <p className="scene-auth-note" {...at(70, 84)}>
        Not official documentation of those systems, and internal detail is generalised or
        omitted. The four lines above are the ones that keep everything else readable.
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
