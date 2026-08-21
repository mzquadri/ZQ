import { canonicalMlopsEvidence, mlopsReferenceRun } from "@/content/portfolio";

/**
 * Visual evidence for the MLOps case study.
 *
 * Everything rendered here comes from the released repository at the pinned commit: the
 * confusion matrix is the one published in its evaluation document, and the terminal
 * lines are the commands it documents together with the output its CI reproduces on
 * every run. No screenshot is fabricated and no number is estimated. Where a value
 * genuinely varies between runs — latency, wall-clock — it is not shown at all.
 */

const { confusion, test, split, referenceCommands } = mlopsReferenceRun;

export function ReferenceRunTerminal() {
  return (
    <figure className="terminal-figure">
      <figcaption>
        <strong>The reference run</strong>
        One command trains, evaluates against the gate, registers and promotes. A second
        asserts the published result still reproduces.
      </figcaption>
      <div className="terminal">
        <div aria-hidden="true" className="terminal-bar">
          <span />
          <span />
          <span />
        </div>
        {/* Scrollable by necessity - pre-formatted output cannot reflow - so it is
            focusable and labelled rather than reachable by pointer only. */}
        <pre aria-label="Reference run terminal output" tabIndex={0}>
          <code>
            <span className="terminal-prompt">$ </span>
            {referenceCommands[0]}
            {"\n"}
            <span className="terminal-dim">[1/5] Acquiring and validating data</span>
            {"\n"}
            <span className="terminal-dim">[2/5] Fitting features on train only, then training</span>
            {"\n"}
            <span className="terminal-dim">[3/5] Evaluating on the held-out test split</span>
            {"\n"}
            <span className="terminal-dim">[4/5] Registering the passing candidate as staging</span>
            {"\n"}
            <span className="terminal-dim">[5/5] Promoting v1 to production</span>
            {"\n\n"}
            <span className="terminal-prompt">$ </span>
            {referenceCommands[1]}
            {"\n"}
            <span className="terminal-ok">
              Reference run matches the documented result: accuracy{" "}
              {test.accuracy.toFixed(4)}, baseline {test.baselineAccuracy.toFixed(4)}, margin{" "}
              {(test.accuracy - test.baselineAccuracy).toFixed(4)},
              {"\n"}sentiment-classifier v1 in production.
            </span>
          </code>
        </pre>
      </div>
      <p className="figure-note">
        The second command exists so the numbers quoted on this page cannot drift away from
        the repository without failing its build.{" "}
        <a href={canonicalMlopsEvidence.evaluation}>See the evaluation record.</a>
      </p>
    </figure>
  );
}

export function HeldOutResultFigure() {
  const [negative, positive] = confusion.rows;
  const total = confusion.rows.flat().reduce((sum, value) => sum + value, 0);
  const correct = negative[0] + positive[1];
  const largest = Math.max(...confusion.rows.flat());
  const modelPct = test.accuracy * 100;
  const baselinePct = test.baselineAccuracy * 100;

  return (
    <figure className="result-figure">
      <figcaption>
        <strong>What the held-out split actually says</strong>
        {split.test} test rows, read once. The baseline is a majority-class predictor
        measured on exactly the same rows.
      </figcaption>

      <div className="result-grid">
        <div className="confusion-block">
          <p className="figure-label">Confusion matrix</p>
          <table className="confusion-matrix">
            <caption className="visually-hidden">
              Held-out confusion matrix: rows are the actual class, columns the predicted class.
            </caption>
            <thead>
              <tr>
                <td />
                {confusion.labels.map((label) => (
                  <th key={label} scope="col">
                    pred {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {confusion.rows.map((row, rowIndex) => (
                <tr key={confusion.labels[rowIndex]}>
                  <th scope="row">actual {confusion.labels[rowIndex]}</th>
                  {row.map((value, columnIndex) => (
                    <td
                      data-correct={rowIndex === columnIndex || undefined}
                      key={`${rowIndex}-${columnIndex}`}
                      style={{ "--fill": `${(value / largest) * 100}%` } as React.CSSProperties}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="figure-note">
            {correct} of {total} correct. The errors are close to symmetric, so the model is
            not simply favouring one class.
          </p>
        </div>

        <div className="baseline-block">
          <p className="figure-label">Accuracy against its baseline</p>
          <ul className="baseline-bars">
            <li>
              <span className="baseline-name">This model</span>
              <span className="baseline-track">
                <span className="baseline-fill" style={{ width: `${modelPct}%` }} />
              </span>
              <span className="baseline-value">{test.accuracy.toFixed(4)}</span>
            </li>
            <li>
              <span className="baseline-name">Majority class</span>
              <span className="baseline-track">
                <span className="baseline-fill is-baseline" style={{ width: `${baselinePct}%` }} />
              </span>
              <span className="baseline-value">{test.baselineAccuracy.toFixed(4)}</span>
            </li>
          </ul>
          <p className="figure-note">
            An accuracy figure means nothing without this comparison. The promotion gate
            requires a margin over the baseline, not just a raw floor, so a model that only
            predicts the larger class cannot pass.
          </p>
        </div>
      </div>
    </figure>
  );
}
