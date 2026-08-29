import {
  classNames,
  confusion,
  limits,
  perClass,
  project,
  result,
  samples,
  stages,
  structure,
  topConfusions,
  training,
} from "@/content/cifar-world";

/**
 * The architecture, the spread, and the matrix - drawn once and completely.
 *
 * What a phone gets, what a reader who declined motion gets, and what is in the document before
 * any JavaScript runs. The confusion matrix is an HTML table rather than a picture of one, because
 * its exact integers are the evidence and a reader should be able to select them.
 */

const worst = topConfusions[0];
const maxCell = Math.max(...confusion.flat());

export default function CifarWorldFlat() {
  return (
    <div className="cifar-flat">
      <div className="cifar-flat-top">
        <figure className="cifar-flat-samples">
          <div className="cifar-flat-tiles">
            {samples.map((s) => (
              <span key={s.cls}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={`A CIFAR-10 test image of class ${s.cls}, 32 by 32 pixels`} src={s.dataUri} />
                <em>{s.cls}</em>
              </span>
            ))}
          </div>
          <figcaption>
            Real CIFAR-10 test images at their native {project.imageSize}. Every input to this model
            is {project.inputNumbers.toLocaleString("en-GB")} numbers, and no more.
          </figcaption>
        </figure>

        <figure className="cifar-flat-stack">
          <figcaption>Shapes, measured from the module rather than described</figcaption>
          <ol>
            {stages.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong>
                <code>{s.shape.join(" × ")}</code>
                <span>{s.params ? `${s.params.toLocaleString("en-GB")} params` : "input"}</span>
              </li>
            ))}
          </ol>
          <p>
            {project.architecture}, {project.parameters.toLocaleString("en-GB")} trainable
            parameters. Trained on {project.trainingSubset.toLocaleString("en-GB")} of the{" "}
            {project.datasetTrain.toLocaleString("en-GB")} training images for {training.epochs}{" "}
            epochs with {training.optimizer} and {training.scheduler}.
          </p>
        </figure>
      </div>

      <figure className="cifar-flat-classes">
        <figcaption>
          Per-class accuracy against the {result.testAccuracy}% aggregate
        </figcaption>
        <ol>
          {perClass.map((c) => (
            <li data-side={c.accuracy >= result.testAccuracy ? "above" : "below"} key={c.cls}>
              <span className="cifar-flat-cls">{c.cls}</span>
              <span className="cifar-flat-track" aria-hidden="true">
                <i style={{ "--w": `${c.accuracy}%` } as React.CSSProperties} />
                <b style={{ "--x": `${result.testAccuracy}%` } as React.CSSProperties} />
              </span>
              <span className="cifar-flat-pct">{c.accuracy}%</span>
            </li>
          ))}
        </ol>
        <p>
          The aggregate is the mean of a {structure.spread}-point spread, from{" "}
          {structure.worstAccuracy}% on {structure.worst} to {structure.bestAccuracy}% on{" "}
          {structure.best}. The four vehicle classes average {structure.vehicleAccuracy}%; the six
          animal classes average {structure.animalAccuracy}%.
        </p>
      </figure>

      <figure className="cifar-flat-matrix">
        <figcaption>
          Confusion matrix, {project.testImages.toLocaleString("en-GB")} test images. Rows are the
          true class, columns the predicted class.
        </figcaption>
        <div className="cifar-flat-matrix-scroll">
          <table>
            <caption className="visually-hidden">
              Counts of test images by true class and predicted class. The largest off-diagonal
              value is {worst.count}, where {worst.from} was predicted as {worst.to}.
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  <span className="visually-hidden">True class</span>
                </th>
                {classNames.map((c) => (
                  <th key={c} scope="col">
                    {c.slice(0, 4)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {confusion.map((row, i) => (
                <tr key={classNames[i]}>
                  <th scope="row">{classNames[i]}</th>
                  {row.map((count, j) => (
                    <td
                      data-diagonal={i === j ? "" : undefined}
                      data-worst={count === worst.count && i !== j ? "" : undefined}
                      key={classNames[j]}
                      style={{ "--v": `${count / maxCell}` } as React.CSSProperties}
                    >
                      {count}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The largest single cell off the diagonal is <strong>{worst.count}</strong>: {worst.from}{" "}
          predicted as {worst.to}. The model finds{" "}
          {perClass.find((c) => c.cls === worst.from)!.accuracy}% of cats, and sends nearly as many
          of them to {worst.to} as it gets right.{" "}
          {Math.round(structure.withinGroupShare * 100)}% of all{" "}
          {(structure.withinGroupErrors + structure.acrossGroupErrors).toLocaleString("en-GB")}{" "}
          mistakes stay inside the vehicle group or inside the animal group — the boundary the model
          learned best is not one of the ten it was asked for.
        </p>
      </figure>

      <dl className="cifar-flat-figures">
        <div>
          <dt>Test accuracy</dt>
          <dd>{result.testAccuracy}%</dd>
        </div>
        <div>
          <dt>Best validation</dt>
          <dd>{result.bestValAccuracy}%</dd>
        </div>
        <div>
          <dt>Final train accuracy</dt>
          <dd>{result.finalTrainAccuracy}%</dd>
        </div>
        <div>
          <dt>Epochs</dt>
          <dd>{training.epochs}</dd>
        </div>
      </dl>

      <ul className="cifar-flat-limits">
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
