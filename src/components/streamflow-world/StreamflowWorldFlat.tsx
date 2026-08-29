import {
  configuration,
  failure,
  generator,
  importances,
  lag1Autocorrelation,
  limits,
  models,
  project,
  split,
  topTwoShare,
  trendDiagnosis,
  zoom,
} from "@/content/streamflow-world";

/**
 * The table, and what it hides, in one figure.
 *
 * What a phone gets, what a reader who declined motion gets, and what is in the document before
 * any JavaScript runs. It is deliberately the leaderboard first, because that is the artefact
 * being questioned - and then, immediately underneath, the column that makes the ranking
 * unreadable as a ranking: what each row was actually scored on.
 */

const W = 460;
const H = 132;
const PAD = { left: 30, right: 8, top: 10, bottom: 20 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

/* The zoomed window: prediction over truth at daily resolution, the repository's own figure 05. */
const Q_MIN = Math.min(...zoom.map((p) => Math.min(p[1], p[2])));
const Q_MAX = Math.max(...zoom.map((p) => Math.max(p[1], p[2])));

const px = (t: number) => PAD.left + t * IW;
const py = (q: number) => PAD.top + IH - ((q - Q_MIN) / (Q_MAX - Q_MIN)) * IH;

const truthLine = zoom.map((p) => `${px(p[0])},${py(p[1])}`).join(" ");
const predLine = zoom.map((p) => `${px(p[0])},${py(p[2])}`).join(" ");

/* R² is unbounded below, so the bar scale is squashed; the exact numbers sit beside it. */
const squash = (r2: number) => (r2 >= 0 ? r2 : -Math.log10(1 - r2) / 2.2);
const barMax = Math.max(...models.map((m) => Math.abs(squash(m.r2))));

const naive = models.find((m) => m.key === "naive")!;

export default function StreamflowWorldFlat() {
  return (
    <div className="streamflow-flat">
      <figure className="streamflow-flat-board">
        <figcaption>
          Reported result, and what each row was scored on
        </figcaption>
        <ol className="streamflow-flat-rows">
          {models.map((m) => (
            <li data-sign={m.r2 < 0 ? "negative" : "positive"} key={m.key}>
              <span className="streamflow-flat-name">{m.label}</span>
              <span className="streamflow-flat-bar" aria-hidden="true">
                <i style={{ "--w": `${(Math.abs(squash(m.r2)) / barMax) * 100}%` } as React.CSSProperties} />
              </span>
              <span className="streamflow-flat-r2">R² {m.r2}</span>
              <span className="streamflow-flat-scored">
                RMSE {m.rmse} · MAE {m.mae} · scored on {m.scoredOn}
              </span>
            </li>
          ))}
        </ol>
      </figure>

      <p className="streamflow-flat-note">
        Read as a ranking, the table says gradient boosting beats classical statistics by a wide
        margin. Read against the code, the three rows are not answering the same question. XGBoost
        is scored one step ahead with the previous day&rsquo;s measured discharge supplied as an
        input feature; SARIMAX forecasts {models.find((m) => m.key === "sarimax")!.scoredOn} without
        seeing any of them; the baseline repeats a seasonal average that has no trend term at all.
      </p>

      <figure className="streamflow-flat-figure">
        <svg
          aria-label={`The first ${zoom.length} days of the test period. The XGBoost prediction and the observed series are almost indistinguishable, because each prediction is one day ahead and is given the discharge observed the day before.`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          viewBox={`0 0 ${W} ${H}`}
        >
          <line className="streamflow-flat-axis" x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + IH} />
          <line
            className="streamflow-flat-axis"
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + IH}
            y2={PAD.top + IH}
          />
          <polyline className="streamflow-flat-truth" points={truthLine} />
          <polyline className="streamflow-flat-pred" points={predLine} />
          <text className="streamflow-flat-axis-label" x={2} y={PAD.top + 8}>
            Q
          </text>
          <text className="streamflow-flat-axis-label" x={W - PAD.right} y={H - 5} textAnchor="end">
            {zoom.length} days
          </text>
        </svg>
        <figcaption>
          Observed (white) and predicted (teal) over the first {zoom.length} test days. They overlap
          because the model is predicting tomorrow having been told today.
        </figcaption>
      </figure>

      <p className="streamflow-flat-note">
        Two things explain the table. The series was written rather than measured &mdash; a fixed-seed
        generator whose recursion is <code>y[t] = {generator.ar}·y[t−1] + …</code>, so its
        day-to-day autocorrelation is {lag1Autocorrelation} and the two most recent lags carry{" "}
        <strong>{Math.round(topTwoShare * 1000) / 10}%</strong> of the fitted model while rainfall
        carries {importances.find((f) => f.feature === "precip_lag1")?.value}. And the baseline is
        undefended against trend: the same generator adds {generator.trendPerDay} a day, which its
        own feedback multiplies by {generator.arGain}, so the series climbs{" "}
        {trendDiagnosis.levelShift} between the training and test periods while the baseline&rsquo;s
        mean bias is {trendDiagnosis.naiveBias}. Its MAE ({naive.mae}) and RMSE ({naive.rmse}) are
        nearly equal because the error is an offset, not scatter.
      </p>

      <p className="streamflow-flat-note">
        Where it is worst is measurable rather than impressionistic. On the highest tenth of test
        days &mdash; observed flow above {failure.peakThreshold} &mdash; the mean absolute error is{" "}
        {failure.peakMae} against {failure.elsewhereMae} everywhere else, and the signed mean is{" "}
        <strong>{failure.peakBias}</strong>: the misses are undershoots. Those days are 10% of the
        holdout and carry {Math.round(failure.peakShareOfSquaredError * 100)}% of the squared error.
        The worst single day observed {failure.worstObserved} and came in{" "}
        {Math.abs(failure.worstError)} low.
      </p>

      <dl className="streamflow-flat-figures">
        <div>
          <dt>Record</dt>
          <dd>{project.days.toLocaleString("en-GB")} days</dd>
        </div>
        <div>
          <dt>Holdout</dt>
          <dd>{split.testDays} days</dd>
        </div>
        <div>
          <dt>Features</dt>
          <dd>{configuration.features}</dd>
        </div>
        <div>
          <dt>Horizon</dt>
          <dd>One step</dd>
        </div>
      </dl>

      <ul className="streamflow-flat-limits">
        {limits.map((limit) => (
          <li key={limit.label}>
            <strong>{limit.label}</strong>
            <span>{limit.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
