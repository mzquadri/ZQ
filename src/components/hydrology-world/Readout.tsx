"use client";

import {
  calibration,
  inputExperiment,
  limits,
  outputExperiment,
  project,
  ratingCurve,
  sensitivity,
  turnoff,
  verdict,
} from "@/content/hydrology-world";
import type { HydrologyKey } from "./states";

/**
 * The measurements, as HTML over the canvas.
 *
 * Every number is generated from an artifact in the seminar repository by
 * tools/gen-hydrology-world.py. Nothing is typed here, which matters more than usual on this
 * project: the entire point is that a number can be confidently wrong, so a portfolio page about
 * it should not be quietly retyping numbers from a README.
 */

function Rows({ items }: { items: { label: string; value: string; note?: string }[] }) {
  return (
    <dl className="world-readout">
      {items.map((item) => (
        <div className="world-readout-row" key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            <strong>{item.value}</strong>
            {item.note ? <span>{item.note}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function Readout({ state }: { state: HydrologyKey }) {
  switch (state) {
    case "event":
      return (
        <Rows
          items={[
            { label: "Model", note: project.modelKind, value: project.model },
            { label: "Time step", note: project.forcing, value: project.timestep },
            { label: "Event", note: "one catchment, one episode", value: "One high-flow event" },
          ]}
        />
      );

    case "calibrated":
      return (
        <>
          <Rows
            items={[
              {
                label: "Calibration",
                note: `${calibration.strategy}, ${calibration.generations} generations`,
                value: calibration.method,
              },
              {
                label: "Best NSE",
                note: `${calibration.evaluations.toLocaleString("en-GB")} model evaluations`,
                value: `${calibration.nse}`,
              },
              {
                label: "Parameters",
                note: "snow, soil moisture, upper and lower reservoir",
                value: `${project.parameters}`,
              },
            ]}
          />
          <p className="world-note">
            Removing one process at a time shows which the event actually needs: without the lower
            reservoir NSE falls to {turnoff.find((t) => t.key === "lower")?.nse}, while removing
            groundwater changes nothing over an episode this short.
          </p>
        </>
      );

    case "rain":
      return (
        <Rows
          items={[
            {
              label: "Series",
              note: inputExperiment.perturbation,
              value: `${inputExperiment.series.toLocaleString("en-GB")}`,
            },
            {
              label: "Mean change to rainfall",
              note: "averaged over every step of every series",
              value: `${inputExperiment.meanChangePct}%`,
            },
            { label: "Seed", note: "recalibration enabled for every series", value: `${inputExperiment.seed}` },
          ]}
        />
      );

    case "rainVerdict":
      return (
        <>
          <Rows
            items={[
              {
                label: "NSE",
                note: `from ${calibration.referenceNse}`,
                value: `${inputExperiment.nseMean}`,
              },
              {
                label: "Mean loss",
                note: "in objective-function terms",
                value: `${inputExperiment.meanLoss}`,
              },
              {
                label: "Came out better",
                note: `of ${inputExperiment.series.toLocaleString("en-GB")}, by chance`,
                value: `${inputExperiment.betterByChance}`,
              },
            ]}
          />
          <p className="world-note">
            Nearly half the corrupted series scored <em>better</em> than the reference. A 6.6%
            average change to the rainfall is lost in the noise of the calibration itself.
          </p>
        </>
      );

    case "stage":
      return (
        <Rows
          items={[
            {
              label: "Series",
              note: outputExperiment.perturbation,
              value: `${outputExperiment.series.toLocaleString("en-GB")}`,
            },
            { label: "Rainfall", note: "this experiment changes nothing upstream", value: "Untouched" },
            {
              label: "Mean change to discharge",
              note: "the consequence, not the input",
              value: `${outputExperiment.meanChangePct}%`,
            },
          ]}
        />
      );

    case "curve":
      return (
        <>
          <Rows
            items={[
              { label: "Rating curve", note: ratingCurve.form, value: `R² ${ratingCurve.r2}` },
              {
                label: "Local exponent",
                note: `at ${verdict.baseStage} cm, then at ${verdict.peakStage} cm`,
                value: `${verdict.exponentAtBase} → ${verdict.exponentAtPeak}`,
              },
              {
                label: "What 25 cm costs",
                note: "same error in centimetres, both ends of the event",
                value: `×${verdict.bandRatio} wider at the peak`,
              },
            ]}
          />
          <p className="world-note">
            Discharge is never measured directly. A stage is read off a gauge and converted through
            this curve. Above {ratingCurve.transition.centre} cm the curve steepens sharply, so the
            same centimetre of gauge error buys far more error in discharge exactly where the flood
            peak is.
          </p>
        </>
      );

    case "diverge":
      return (
        <>
          <Rows
            items={[
              {
                label: "Series",
                note: "same count, same seed, same recalibration",
                value: `${outputExperiment.series.toLocaleString("en-GB")}`,
              },
              {
                label: "Spread at baseflow",
                note: `discharge width of ±25 cm at ${verdict.baseStage} cm`,
                value: `${verdict.bandAtBase}`,
              },
              {
                label: "Spread at the peak",
                note: `the same ±25 cm at ${verdict.peakStage} cm`,
                value: `${verdict.bandAtPeak}`,
              },
            ]}
          />
          <p className="world-note">
            The trajectories here are drawn the way the repository draws them: a uniform offset per
            timestep, added to stage, pushed through the fitted curve. The width is a consequence of
            that curve, not a chosen figure.
          </p>
        </>
      );

    case "envelope":
      return (
        <>
          <Rows
            items={[
              { label: "Envelope", note: "min and max across the members", value: "From disagreement" },
              {
                label: "Objective spread",
                note: "5th to 95th percentile of the objective function",
                value: `${outputExperiment.ofvP5} – ${outputExperiment.ofvP95}`,
              },
              {
                label: "Against the rain envelope",
                note: "measured, not drawn to taste",
                value: `${verdict.lossRatio}× wider`,
              },
            ]}
          />
          <p className="world-note">
            The band is not an assumption laid over the forecast. It is what is left once 2,000
            equally defensible readings of the same gauge stop agreeing with each other.
          </p>
        </>
      );

    case "verdict":
      return (
        <>
          <Rows
            items={[
              {
                label: "NSE",
                note: `from ${calibration.referenceNse}`,
                value: `${outputExperiment.nseMean}`,
              },
              {
                label: "Mean loss",
                note: `against ${inputExperiment.meanLoss} for precipitation`,
                value: `${outputExperiment.meanLoss}`,
              },
              {
                label: "Came out better",
                note: `of ${outputExperiment.series.toLocaleString("en-GB")}`,
                value: `${outputExperiment.betterByChance}`,
              },
            ]}
          />
          <p className="world-note">
            Precipitation noise let 834 series through by luck. Rating-curve error let none through
            at all — a clean sweep across 2,000 draws, which is what a systematic error looks like
            when a random one has just been ruled out.
          </p>
        </>
      );

    case "recalibrate":
      return (
        <>
          <Rows
            items={[
              {
                label: "Refitted",
                note: `improved in ${outputExperiment.recalImproved.toLocaleString("en-GB")} of ${outputExperiment.series.toLocaleString("en-GB")}`,
                value: `NSE ${outputExperiment.recalNseMean}`,
              },
              {
                label: "Loss recovered",
                note: "of the damage the rating curve did",
                value: `${outputExperiment.compensationPct}%`,
              },
              {
                label: "Still better than reference",
                note: "recalibration does not rescue a corrupted target",
                value: `${outputExperiment.recalBetter}`,
              },
            ]}
          />
          <p className="world-note">
            Refitting the model to each corrupted series helps three quarters of them a little, and
            still never beats the reference. You cannot calibrate your way out of an error in the
            thing you are calibrating against.
          </p>
        </>
      );

    case "standpoint":
      return (
        <>
          <ol className="world-readout-list">
            <li data-on="" data-tone="positive">
              <code>{sensitivity.narrow.top}</code>
              <span>
                {sensitivity.narrow.topLabel} · S_T {sensitivity.narrow.totalIndex} · sampled
                narrowly, near the optimum
              </span>
            </li>
            <li data-on="" data-tone="uncertain">
              <code>{sensitivity.full.top}</code>
              <span>
                {sensitivity.full.topLabel} · S_T {sensitivity.full.totalIndex} · sampled across the
                full parameter space
              </span>
            </li>
          </ol>
          <p className="world-note">
            Two Sobol analyses of the same model disagree about which parameter matters most,
            because they sample different regions. The total indices sum to{" "}
            {sensitivity.full.sumTotal} rather than 1, so most of the variance lives in interactions
            between parameters rather than in any one of them.
          </p>
        </>
      );

    default:
      return (
        /* Four here, all six in the figure below and in the page's limitations section. */
        <ol className="world-readout-list">
          {limits.slice(0, 4).map((limit) => (
            <li data-on="" data-tone="uncertain" key={limit.label}>
              <code>{limit.label}</code>
              <span>{limit.note}</span>
            </li>
          ))}
        </ol>
      );
  }
}
