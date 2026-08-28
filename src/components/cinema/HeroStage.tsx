import Link from "next/link";

import HeroFieldCanvas from "@/components/scene/HeroFieldCanvas";

import { bandPath, CONFIDENCE_FLOOR, linePath, SERIES, series, seriesMarks } from "@/content/cinema-geometry";
import { heroStage } from "@/content/cinema";
import { site } from "@/content/portfolio";

/*
 * The opening sequence.
 *
 * The reader's scroll is the time axis. Over roughly three viewports the hero builds the argument
 * that the rest of this site is about: a model produces a prediction; a prediction without a
 * calibrated interval is not yet usable; a calibrated interval can be checked against what
 * actually happened; and a system that knows where it is uncertain can decline to answer there.
 *
 * That is the thesis, the hydrology work, and the selective-prediction explorer, compressed into
 * one figure - so the first thing a visitor sees is the actual subject matter rather than an
 * adjective about it.
 *
 * There is no JavaScript here. The whole sequence is CSS scroll timelines, which means it is a
 * server component, it costs nothing to download, and where the feature is unsupported the figure
 * simply renders finished: prediction, calibrated envelope, observations, and the declined region
 * all composed at once. That composed state is also exactly what reduced motion should show, so
 * the fallback and the accessibility path are the same path.
 */

const predictionPath = linePath("y");
const observedPath = linePath("observed");
const rawBand = bandPath("rawBand");
const calBand = bandPath("calBand");

/* The x at which confidence first drops under the floor, used to place the declined region. */
const declineStart = series.find((s) => s.confidence < CONFIDENCE_FLOOR)?.x ?? 0;
const declineEnd = [...series].reverse().find((s) => s.confidence < CONFIDENCE_FLOOR)?.x ?? 0;

export default function HeroStage() {
  return (
    <section className="cine-hero mz-pin-track" aria-labelledby="hero-title">
      <div className="cine-hero-pin mz-pin">
        <div className="cine-hero-inner">
          {/* ---- The instrument ------------------------------------------------------------ */}
          <figure className="cine-instrument" aria-labelledby="cine-instrument-caption">
            <HeroFieldCanvas flat={<svg
              className="cine-instrument-svg"
              role="img"
              aria-labelledby="cine-instrument-title cine-instrument-desc"
              viewBox={`0 -40 ${SERIES.width} ${SERIES.height + 80}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <title id="cine-instrument-title">
                A forecast with a calibrated uncertainty interval
              </title>
              <desc id="cine-instrument-desc">
                {heroStage.figureDescription}
              </desc>

              {/* The region a selective-prediction rule declines to answer in. */}
              <rect
                className="cine-decline"
                x={declineStart}
                y={-40}
                width={Math.max(0, declineEnd - declineStart)}
                height={SERIES.height + 80}
              />

              {/* Uncorrected envelope: uniformly wide, because it does not know where it is wrong. */}
              <path className="cine-band cine-band-raw" d={rawBand} />
              {/* Calibrated envelope: tracks local difficulty. */}
              <path className="cine-band cine-band-cal" d={calBand} />

              <path className="cine-line cine-line-pred" d={predictionPath} pathLength={100} />
              <path className="cine-line cine-line-obs" d={observedPath} pathLength={100} />

              <g className="cine-marks">
                {seriesMarks.map((mark, i) => (
                  <circle
                    className="cine-mark"
                    cx={mark.x}
                    cy={mark.y}
                    data-covered={mark.covered ? "" : undefined}
                    data-kept={mark.kept ? "" : undefined}
                    key={mark.x}
                    r={4.5}
                    style={{ "--i": i } as React.CSSProperties}
                  />
                ))}
              </g>
            </svg>} />

            {/*
             * The running caption. Each line owns a slice of the scroll range, so the words are
             * scrubbed by the same scroll head as the figure and cannot drift out of sync with it.
             * All of them are in the DOM at all times; only their presentation is staged.
             */}
            <figcaption className="cine-caption" id="cine-instrument-caption">
              {heroStage.beats.map((beat, i) => (
                <span className="cine-beat" data-beat={i} key={beat.verb}>
                  <b>{beat.verb}</b>
                  {beat.text}
                </span>
              ))}
            </figcaption>
          </figure>

          {/* ---- The identity -------------------------------------------------------------- */}
          <div className="cine-identity">
            <h1 className="cine-name" id="hero-title">
              <span className="cine-name-line">
                {"Mohd".split("").map((c, i) => (
                  <span key={i} style={{ "--i": i } as React.CSSProperties}>{c}</span>
                ))}
              </span>
              <span className="cine-name-line">
                {"Zamin".split("").map((c, i) => (
                  <span key={i} style={{ "--i": i + 4 } as React.CSSProperties}>{c}</span>
                ))}
              </span>
              <span className="cine-name-line">
                {"Quadri".split("").map((c, i) => (
                  <span key={i} style={{ "--i": i + 9 } as React.CSSProperties}>{c}</span>
                ))}
              </span>
            </h1>

            <p className="cine-role">
              {heroStage.disciplines.map((discipline) => (
                <span key={discipline}>{discipline}</span>
              ))}
            </p>

            <p className="cine-positioning">{site.positioning}</p>

            <div className="cine-actions">
              <Link className="cine-cta mz-interactive" href="/work">
                {heroStage.primaryAction}
              </Link>
              <Link className="cine-cta cine-cta-quiet mz-interactive" href="/research/thesis">
                {heroStage.secondaryAction}
              </Link>
            </div>
          </div>

          <p className="cine-scroll-hint" aria-hidden="true">
            <span>{heroStage.scrollHint}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
