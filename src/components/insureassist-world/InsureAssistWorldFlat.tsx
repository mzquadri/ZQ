import { corpus, forms, licence, limits, results, retrievers } from "@/content/insureassist-world";
import { runCount, wrongFormCount } from "./geometry";

/**
 * The retriever comparison, drawn once and completely.
 *
 * This is what a phone gets, what a reader who declined motion gets, and what is in the document
 * before any JavaScript runs. It is the strongest single figure this project has, because it is
 * the one that cannot be reduced to a headline: BM25 alone retrieves more relevant chunks in the
 * top five, and is the worst of the three at returning the right form. Any single number would
 * pick a winner the evidence does not support.
 *
 * Two paired bars per retriever. Left is hit@5, right is top-document accuracy. The selected
 * architecture is the one that is second-best on the left and joint-best on the right.
 */

const W = 460;
const ROW = 46;
const PAD = 118;
const BAR = 15;
const TRACK = 250;

export default function InsureAssistWorldFlat() {
  const height = 34 + retrievers.length * ROW + 34;
  const x = (v: number) => PAD + v * TRACK;

  return (
    <div className="insure-flat">
      <figure className="insure-flat-figure">
        <svg
          aria-label={retrievers
            .map(
              (r) =>
                `${r.label}: hit at 5 ${r.hitAt5}, top-document accuracy ${r.topDocument}${
                  r.selected ? ", selected" : ""
                }`,
            )
            .join(". ")}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          viewBox={`0 0 ${W} ${height}`}
        >
          <text className="insure-flat-key" x={PAD} y={18}>
            hit@5
          </text>
          <text className="insure-flat-key" data-doc="" x={PAD} y={30}>
            top-document accuracy
          </text>

          {retrievers.map((retriever, i) => {
            const top = 44 + i * ROW;
            return (
              <g data-selected={retriever.selected ? "" : undefined} key={retriever.key}>
                <text className="insure-flat-name" x={PAD - 10} y={top + 13}>
                  {retriever.label}
                </text>
                <rect className="insure-flat-track" height={BAR} width={TRACK} x={PAD} y={top} />
                <rect className="insure-flat-hit" height={BAR} width={retriever.hitAt5 * TRACK} x={PAD} y={top} />
                <rect
                  className="insure-flat-doc"
                  height={BAR}
                  width={retriever.topDocument * TRACK}
                  x={PAD}
                  y={top + BAR + 3}
                />
                <text className="insure-flat-value" x={x(1) + 8} y={top + 13}>
                  {retriever.hitAt5}
                </text>
                <text className="insure-flat-value" data-doc="" x={x(1) + 8} y={top + BAR + 15}>
                  {retriever.topDocument}
                </text>
              </g>
            );
          })}
        </svg>
        <figcaption>
          Measured on {corpus.documents} forms and {corpus.chunks} chunks, same labels and same
          held-out split. BM25 alone retrieves the most relevant chunks and is the worst at
          returning the right form; the selected hybrid is second on one and joint-first on the
          other. {wrongFormCount} of {runCount} held-out questions still put the wrong form at rank
          one, down from a configuration that got the form right 16.7% of the time.
        </figcaption>
      </figure>

      <p className="insure-flat-licence">
        The corpus is the three forms below, published by the {licence.publisher} in the Code of
        Federal Regulations. They are redistributable under {licence.basis}: works of the United
        States Government are not subject to copyright protection.
      </p>

      <ul className="insure-flat-forms">
        {forms.map((form) => (
          <li key={form.id}>
            <strong>{form.form}</strong>
            <span>{form.citation}</span>
          </li>
        ))}
      </ul>

      <ul className="insure-flat-limits">
        {limits.map((limit) => (
          <li key={limit.label}>
            <strong>{limit.label}</strong>
            <span>{limit.note}</span>
          </li>
        ))}
      </ul>

      <p className="insure-flat-scope">
        Held-out MRR {results.mrr}, hit@5 {results.hitAt5}, top-document accuracy{" "}
        {results.topDocument}. Every figure here is read from the repository&rsquo;s frozen
        reference run.
      </p>
    </div>
  );
}
