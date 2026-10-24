import { detector, drift, rescored, runs, seasonal, seasonalFix } from "@/content/drift-chapter";

import {
  beat,
  caption,
  clamp01,
  focus,
  palette,
  type Palette,
  type SceneDefinition,
} from "../scene";
import type { Surface } from "../surface";

/**
 * Drift: everything here is an argument about windows.
 *
 * The object is a single axis of rows - the 8,734 observations the platform has seen, in order -
 * and no other scene is built on one. Every beat is that same axis being cut differently: the
 * control window it calibrated on, the window the detector alarmed in, the windows each retraining
 * run was fitted to, and finally the window width that was quietly producing false alarms. The
 * finding of the repository is a statement about a window, so the drawing is one too.
 *
 *   rest   the axis, with the 2011 control window marked on it
 *   0.08   the eleven feature columns as lanes; one of them moves
 *   0.20   both drift scores against the thresholds they are tested against
 *   0.34   the detector: silent across the whole control window, then the first alarm
 *   0.48   the three runs, where each was fitted, and what it scored
 *   0.62   the refusal - the same model offered twice is not better than itself
 *   0.76   the seasonal defect: the narrow windows are January measured against a whole year
 *   0.88   after the fix, the false alarm declines and the real signal arrives earlier
 *
 * Every number is read from `@/content/drift-chapter`, which reads them from the repository's
 * exported artefacts rather than its prose. Nothing here is transcribed twice: the bar for a
 * drift score is positioned by dividing the score by the axis maximum, so a changed artefact moves
 * the picture rather than leaving it disagreeing with its own caption.
 */

const TOTAL = detector.currentRows;
/* The drift axis runs a little past the target score so the overshoot is visible as overshoot. */
const DRIFT_MAX = 0.8;
/* Which lane the one moved column is drawn in. See the note where it is used. */
const MOVED_LANE = 8;

/**
 * A beat raised off a floor rather than gating the thing it animates.
 *
 * Every part of the inventory is on screen in the resting frame, because that frame is what ships
 * in the HTML, what a reduced-motion reader gets and what the canvas has to match when it takes
 * over. A scene built out of `if (beat > 0) draw(...)` has an almost empty still - this one had six
 * elements at rest against sixty at the end - which fails the site's own rule that the fallback is
 * the informative frame. So the beats move emphasis across a picture that is already complete.
 */
const lift = (b: number, floor: number) => floor + (1 - floor) * b;

/*
 * The vertical budget, stated rather than discovered.
 *
 * The first version of this scene placed each block relative to the focus radius and three of them
 * landed off the top of the frame: the eleven lanes were clipped to four, and the resting frame -
 * the one that ships in the HTML - was the clipped one. Laying the bands out as explicit shares of
 * the frame height makes the overflow a number that can be read here rather than a surprise in a
 * render.
 *
 * Shares are of the frame height, measured from the top, and they differ by orientation because a
 * phone gets a taller frame with the same content stacked rather than the same picture shrunk.
 */
const BANDS = {
  wide: { lanes: 0.1, lanesHeight: 0.14, axis: 0.33, scores: 0.4, runs: 0.56, fix: 0.88 },
  /*
   * The tall bands straddle the caption rather than ignoring it. `caption()` puts a phone's line
   * of type across the middle of the frame at 0.575, not along the bottom as it does on a wide
   * stage, so the runs have to start below it: at 0.5 they were printed straight through.
   */
  tall: { lanes: 0.07, lanesHeight: 0.12, axis: 0.25, scores: 0.31, runs: 0.64, fix: 0.9 },
} as const;

function draw(s: Surface, progress: number, p: Palette) {
  const columns = beat(progress, 0.08, 0.18);
  const scores = beat(progress, 0.2, 0.31);
  const alarm = beat(progress, 0.34, 0.45);
  const trained = beat(progress, 0.48, 0.59);
  const refused = beat(progress, 0.62, 0.73);
  const season = beat(progress, 0.76, 0.86);
  const fixed = beat(progress, 0.88, 0.98);

  const b = s.portrait ? BANDS.tall : BANDS.wide;
  const f = focus(s);
  const axisW = s.portrait ? s.w * 0.8 : f.r * 1.95;
  const x0 = s.portrait ? (s.w - axisW) / 2 : f.x - axisW * 0.5;
  const x1 = x0 + axisW;
  const ay = s.h * b.axis;
  const atRow = (row: number) => x0 + clamp01(row / TOTAL) * axisW;
  const type = s.unit * (s.portrait ? 0.022 : 0.019);

  /*
   * Where a row's name goes. Beside the bar on a wide stage, where there is room to the left of
   * the axis; above it on a phone, where there is not - at 780 the axis starts 78px in and a name
   * set to its left would run off the frame.
   */
  const name = (y: number, height: number, text: string, fill: string, alpha: number) => {
    if (s.portrait) {
      s.text(x0, y - height * 0.22, text, { size: type * 0.9, fill, alpha, mono: true });
    } else {
      s.text(x0 - s.unit * 0.018, y + height * 0.5, text, {
        size: type,
        fill,
        alpha,
        mono: true,
        anchor: "end",
        baseline: "middle",
      });
    }
  };

  /* ---- the row axis, and the control window on it ---- */
  s.line(x0, ay, x1, ay, { stroke: p.line, width: 2 });
  s.text(x0, ay + s.unit * 0.036, "row 0", { size: type * 0.9, fill: p.soft, alpha: 0.8, mono: true });
  s.text(x1, ay + s.unit * 0.036, String(TOTAL), {
    size: type * 0.9,
    fill: p.soft,
    alpha: 0.8,
    mono: true,
    anchor: "end",
  });

  /*
   * The control window is drawn from the first frame because it is the premise of everything else:
   * the detector was tuned here, where an alarm is false by construction, and never looked at the
   * rest of the axis before being fixed.
   */
  const cx = atRow(detector.controlRows);
  s.rect(x0, ay - s.unit * 0.018, cx - x0, s.unit * 0.036, { fill: p.line, alpha: 0.55 });
  s.text(x0, ay - s.unit * 0.03, `control window, ${detector.controlRows} rows`, {
    size: type * 0.88,
    fill: p.soft,
    alpha: 0.85,
    mono: true,
  });

  /* ---- the eleven feature columns, as lanes over the axis ---- */
  {
    const laneTop = s.h * b.lanes;
    const step = (s.h * b.lanesHeight) / drift.featureColumns;
    /* The lanes dim away as the seasonal windows take the same band later in the sequence. */
    const room = 1 - season * 0.9;
    for (let i = 0; i < drift.featureColumns; i += 1) {
      const on = lift(
        beat(columns, (i / drift.featureColumns) * 0.5, (i / drift.featureColumns) * 0.5 + 0.5),
        0.35,
      );
      /*
       * One column of eleven crossed its own threshold, and it is drawn as the one that is lit.
       * Which lane it occupies is a composition choice rather than a claim: the artefact names the
       * column that moved but does not publish the column order, so the position carries no
       * information and is fixed only so the picture does not reshuffle between frames.
       */
      const moved = i === MOVED_LANE;
      const y = laneTop + i * step;
      /*
       * The lanes are full width from the first frame and only their weight changes. Drawing them
       * part-way and extending them looked like a progress bar, and it left the one labelled lane
       * ending four hundred pixels short of its own label.
       */
      s.line(x0, y, x1, y, {
        stroke: moved ? p.warn : p.soft,
        width: moved ? 2 : 1,
        alpha: on * room * (moved ? 0.95 : 0.28),
      });
      if (moved) {
        /*
         * Inside the axis on a phone. The lanes run the full width of an 80%-wide axis, so there
         * are only seventy-odd pixels to the right of them at 780 and a label set there is cut by
         * the frame.
         */
        s.text(s.portrait ? x1 : x1 + s.unit * 0.012, s.portrait ? y - type * 0.6 : y, drift.movedColumn, {
          size: type * 0.9,
          fill: p.warn,
          alpha: on * room,
          mono: true,
          anchor: s.portrait ? "end" : "start",
          baseline: s.portrait ? "alphabetic" : "middle",
        });
      }
    }
  }

  /* ---- the two drift scores, each against the threshold it is tested against ---- */
  {
    const on = lift(scores, 0.4);
    const sy = s.h * b.scores;
    const sh = s.h * 0.055;
    const bar = (index: number, value: number, threshold: number, label: string, crosses: boolean) => {
      const y = sy + index * sh * 1.75;
      const w = (value / DRIFT_MAX) * axisW;
      const tx = x0 + (threshold / DRIFT_MAX) * axisW;
      s.rect(x0, y, w, sh, { fill: crosses ? p.warn : p.soft, alpha: on * (crosses ? 0.7 : 0.4) });
      /* The threshold is a hard line, not a gradient: the policy compares against it exactly. */
      s.line(tx, y - sh * 0.3, tx, y + sh * 1.3, {
        stroke: p.ink,
        width: 2,
        alpha: on * 0.9,
        dash: [4, 4],
      });
      s.text(tx, y - sh * 0.45, String(threshold), {
        size: type * 0.85,
        fill: p.ink,
        alpha: on * 0.8,
        mono: true,
        anchor: "middle",
      });
      /*
       * The value sits past the end of its own bar, never inside it - the bars are dark - and past
       * the threshold mark too. For the feature score the threshold is to the *right* of the bar,
       * because the score did not reach it, so a label placed only past the bar lands on the
       * dashed line.
       */
      s.text(Math.max(x0 + w, tx) + s.unit * 0.014, y + sh * 0.5, value.toFixed(value < 0.1 ? 2 : 3), {
        size: type * 1.15,
        fill: crosses ? p.warn : p.soft,
        alpha: on,
        mono: true,
        baseline: "middle",
      });
      name(y, sh, label, crosses ? p.warn : p.soft, on);
    };
    bar(0, drift.featureShare, drift.columnThreshold, "features", false);
    bar(1, drift.target, drift.targetThreshold, "target", true);
  }

  /* ---- the detector: silent through the control window, then the first alarm ---- */
  {
    /*
     * Withdrawn as the seasonal windows arrive, because they take the same band above the axis and
     * the alarm's leader line ran straight through them. It is also the right reading order: the
     * seasonal defect is the reason to stop trusting this alarm's timing.
     */
    const on = alarm * (1 - season * 0.95);
    if (on > 0.02) {
      const fx = atRow(detector.firstAlarmRow);
      const tip = ay - s.unit * 0.09 * alarm;
      s.text(x0, ay - s.unit * 0.055, `${detector.name} silent, ${detector.controlAlarms} alarms`, {
        size: type * 0.88,
        fill: p.accent,
        alpha: on,
        mono: true,
      });
      s.line(fx, tip, fx, ay + s.unit * 0.018, { stroke: p.warn, width: 2, alpha: on });
      s.circle(fx, tip, s.unit * 0.007 * alarm, { fill: p.warn, alpha: on });
      s.text(fx + s.unit * 0.01, tip - s.unit * 0.008, `first alarm, row ${detector.firstAlarmRow}`, {
        size: type * 0.88,
        fill: p.warn,
        alpha: on,
        mono: true,
      });
    }
  }

  /* ---- the three runs, each over the window it was fitted to ---- */
  {
    const ry = s.h * b.runs;
    const rh = s.h * 0.042;
    runs.forEach((run, i) => {
      const on = lift(beat(trained, i * 0.22, i * 0.22 + 0.5), 0.38);
      const y = ry + i * rh * 1.6;
      const w = (run.rows / TOTAL) * axisW;
      const colour = run.promoted ? p.accent : p.warn;
      s.rect(x0, y, w, rh, { fill: colour, alpha: on * (run.promoted ? 0.45 : 0.3) });
      s.rect(x0, y, w, rh, { stroke: colour, width: 1, alpha: on * 0.9 });
      name(y, rh, run.label, colour, on);
      s.text(x1, y + rh * 0.5, `MAE ${run.mae}`, {
        size: type,
        fill: colour,
        alpha: on,
        mono: true,
        anchor: "end",
        baseline: "middle",
      });
      /*
       * The refusal, drawn on the bar it refused rather than written out underneath. The bar the
       * third run was offered over is the same bar as the second - that identity is the argument,
       * so the mark is the gate it had to clear and did not.
       */
      if (!run.promoted && refused > 0.02) {
        const needed = rescored.challengerOnNewWindow * (1 - rescored.promotionMargin);
        s.line(x0, y + rh * 0.5, x0 + w, y + rh * 0.5, {
          stroke: p.warn,
          width: 2,
          alpha: refused,
        });
        s.text(x1, y + rh * 1.5, `needed ${needed.toFixed(2)}`, {
          size: type * 0.9,
          fill: p.warn,
          alpha: refused,
          mono: true,
          anchor: "end",
        });
      }
    });
  }

  /* ---- the seasonal defect: narrow windows are one month measured against a year ---- */
  if (season > 0.02) {
    const wy = s.h * b.lanes;
    seasonal.forEach((window, i) => {
      const on = beat(season, i * 0.18, i * 0.18 + 0.5);
      if (on <= 0.02) return;
      const y = wy + i * s.h * 0.042;
      const w = (window.rows / TOTAL) * axisW * on;
      /* The two narrow windows are the defective ones: their verdict changed when it was fixed. */
      const spurious = window.before !== window.after;
      s.rect(x0, y, w, s.h * 0.026, { fill: spurious ? p.warn : p.accent, alpha: on * 0.6 });
      /*
       * The widest window is the whole axis, so its label has nowhere to go past the bar: on a
       * phone it ran off the frame. When the bar leaves no room beside it the label moves inside
       * its own right-hand end, in ink rather than the bar's colour so it reads against the fill.
       */
      const beside = x0 + w + s.unit * 0.012;
      const inside = beside > x1 - s.unit * 0.04;
      s.text(inside ? x1 - s.unit * 0.012 : beside, y + s.h * 0.013, `${window.rows} rows, ${window.months}`, {
        size: type * 0.85,
        fill: inside ? p.ink : spurious ? p.warn : p.soft,
        alpha: on,
        mono: true,
        anchor: inside ? "end" : "start",
        baseline: "middle",
      });
    });
  }

  /* ---- what the fix moved ---- */
  if (fixed > 0.02) {
    const y = s.h * b.fix;
    const span = seasonal[seasonal.length - 1].days;
    const was = x0 + (seasonalFix.realSignalWasDay / span) * axisW;
    const now = x0 + (seasonalFix.realSignalNowDay / span) * axisW;
    s.line(now, y, was, y, { stroke: p.accent, width: 2, alpha: fixed, dash: [5, 4] });
    s.circle(was, y, s.unit * 0.006, { fill: p.soft, alpha: fixed });
    s.circle(now, y, s.unit * 0.008, { fill: p.accent, alpha: fixed });
    s.text(was, y - s.unit * 0.016, `day ${seasonalFix.realSignalWasDay}`, {
      size: type * 0.88,
      fill: p.soft,
      alpha: fixed,
      mono: true,
      anchor: "middle",
    });
    s.text(now, y - s.unit * 0.016, `day ${seasonalFix.realSignalNowDay}`, {
      size: type * 0.88,
      fill: p.accent,
      alpha: fixed,
      mono: true,
      anchor: "middle",
    });
  }

  /* ---- one line of type ---- */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, { size: c.size, fill, alpha, mono: true, anchor: c.anchor });
  };
  if (fixed > 0.05) {
    say(`the real signal arrives on day ${seasonalFix.realSignalNowDay}, not ${seasonalFix.realSignalWasDay}`, fixed, p.accent);
    say(`and the day ${seasonalFix.falseAlarmAtDay} alarm declines`, fixed * 0.85, p.soft, 1);
  } else if (season > 0.05) {
    say(`a ${seasonalFix.minWindowRows}-row window is January`, season * (1 - fixed * 0.8), p.warn);
    say("compared against twelve months", season * 0.85 * (1 - fixed * 0.8), p.soft, 1);
  } else if (refused > 0.05) {
    say("the same model, offered twice", refused * (1 - season * 0.8), p.warn);
    say("is not better than itself", refused * 0.85 * (1 - season * 0.8), p.soft, 1);
  } else if (trained > 0.05) {
    say("two promoted, one refused", trained * (1 - refused * 0.8), p.ink);
  } else if (alarm > 0.05) {
    say("calibrated where an alarm is false by construction", alarm * (1 - trained * 0.8), p.accent);
  } else if (scores > 0.05) {
    say(`the target moved ${drift.target}, the features ${drift.featureShare}`, scores * (1 - alarm * 0.8), p.warn);
  } else if (columns > 0.05) {
    say(`one of ${drift.featureColumns} columns crossed`, columns * (1 - scores * 0.8), p.ink);
  } else {
    say(`${TOTAL} rows, in the order they arrived`, 1 - columns * 0.9, p.soft);
  }
}

export const driftScene: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3.2,
  portraitTravel: 2.7,
  rest: 0,
  label:
    "One axis of 8,734 observations in the order they arrived, cut eight different ways. The 2011 control window is marked across the first 1,729 rows. Eleven feature-column lanes draw across it and one, humidity, lights: it is the only column that crossed its own 0.1 threshold, which is why the feature share is 0.09. Two drift scores then lift onto a common scale against the thresholds the policy compares them with - the features stop short of 0.1, the target runs to 0.679 against a threshold of 0.2. The ADWIN detector is silent for every row of the control window and raises its first alarm at row 1,855. Three training runs are drawn over the windows they were fitted to: 1,729 rows scoring MAE 51.49 and promoted, 3,476 rows scoring 95.48 and promoted over a champion re-scored at 116.57, and the same model offered again and refused because 95.48 is not two per cent better than 95.48, which would have needed 93.57. Four candidate window widths follow, with the two narrowest marked as the defect: a 500-row window is twenty-one days of January being compared against a reference spanning twelve months. After the seasonal alignment fix the day twenty-one false alarm declines and the real signal arrives on day 42 rather than day 104.",
  palette: palette("systems"),
  draw,
};
