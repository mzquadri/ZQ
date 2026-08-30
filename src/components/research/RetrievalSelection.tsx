import {
  chunkingSweep,
  chunkingSweepSource,
  config,
  results,
  selectionGap,
} from "@/content/insureassist-world";

/**
 * How the chunking was chosen, and what choosing it on fourteen questions cost.
 *
 * The repository sweeps ten chunking configurations on the development split. The one it froze
 * put a relevant passage in the top five for *every* development question - and on the held-out
 * questions the same configuration manages it a little over half the time.
 *
 * The figure exists to put those two numbers next to each other. A perfect development score is
 * what selecting on development data produces, and showing the sweep it came out of is more
 * honest than reporting the held-out number alone, because it shows how narrow the margin over
 * the neighbouring configurations actually was.
 */
export default function RetrievalSelection() {
  const width = 720;
  const left = 172;
  const barW = (v: number) => (width - left - 78) * v;

  return (
    <figure className="chart-figure research-figure">
      <figcaption>
        <strong>Technical question</strong>
        How was the chunk size chosen, and does the score that chose it survive the held-out set?
      </figcaption>

      <div className="chart-visual" aria-hidden="true">
        <svg viewBox={`0 0 ${width} ${chunkingSweep.length * 30 + 50}`}>
          <g className="chart-grid">
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
              <path key={tick} d={`M${left + barW(tick)} 12V${chunkingSweep.length * 30 + 6}`} />
            ))}
          </g>
          {chunkingSweep.map((row, i) => (
            <g key={`${row.size}-${row.overlap}-${row.depth}`} data-selected={"selected" in row ? "" : undefined}>
              <rect className="sweep-bar" x={left} y={i * 30 + 16} width={barW(row.hit5)} height="16" />
              <text className="bar-label" x={left - 10} y={i * 30 + 29} textAnchor="end">
                {row.size} / {row.overlap} / depth {row.depth}
              </text>
              <text className="bar-value" x={left + barW(row.hit5) + 8} y={i * 30 + 29}>
                {row.hit5.toFixed(4)}
              </text>
            </g>
          ))}
          <g className="chart-labels">
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
              <text key={tick} x={left + barW(tick)} y={chunkingSweep.length * 30 + 26} textAnchor="middle">
                {tick}
              </text>
            ))}
          </g>
        </svg>
      </div>

      {/* The two numbers the whole figure exists to place beside each other. */}
      <div className="selection-gap">
        <div>
          <p className="selection-gap-value">{selectionGap.devHitAt5.toFixed(2)}</p>
          <p className="selection-gap-label">
            hit@5 on the {selectionGap.devQuestions} questions it was chosen on
          </p>
        </div>
        <div data-held-out="">
          <p className="selection-gap-value">{selectionGap.testHitAt5.toFixed(4)}</p>
          <p className="selection-gap-label">
            hit@5 on the {selectionGap.testQuestions} it was not
          </p>
        </div>
      </div>

      <p className="research-note">{selectionGap.note}</p>

      <div className="research-table-wrap">
        <table className="research-data-table">
          <caption>
            Development sweep over {selectionGap.devQuestions} answerable questions. The frozen
            configuration is {config.chunkSize} characters with {config.chunkOverlap} of overlap,
            giving {chunkingSweep.find((r) => "selected" in r)?.chunks} chunks. Held-out hit@5 is{" "}
            {results.hitAt5}. Source: {chunkingSweepSource}
          </caption>
          <thead>
            <tr>
              <th scope="col">Chunk size</th>
              <th scope="col">Overlap</th>
              <th scope="col">Depth</th>
              <th scope="col">Chunks</th>
              <th scope="col">hit@5</th>
              <th scope="col">MRR</th>
            </tr>
          </thead>
          <tbody>
            {chunkingSweep.map((row) => (
              <tr
                key={`${row.size}-${row.overlap}-${row.depth}`}
                data-selected={"selected" in row ? "" : undefined}
              >
                <th scope="row">{row.size}</th>
                <td>{row.overlap}</td>
                <td>{row.depth}</td>
                <td>{row.chunks}</td>
                <td>{row.hit5.toFixed(4)}</td>
                <td>{row.mrr.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
