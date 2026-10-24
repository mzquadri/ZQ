import { closestGap, config, corpus, exactTie, parity, sample } from "@/content/parity-chapter";

import type { ParityKey } from "./states";

/** The numbers beside the frame, read out of the repository's committed parity fixtures. */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function Readout({ state }: { state: ParityKey }) {
  if (state === "ranking" || state === "both") {
    return (
      <dl className="world-readout">
        {sample.hits.map((hit) => (
          <Row key={hit.id} label={`${hit.rank}. ${hit.form} ${hit.id}`} value={String(hit.score)} />
        ))}
      </dl>
    );
  }

  if (state === "close") {
    return (
      <dl className="world-readout">
        <Row label="First" value={String(sample.hits[0].score)} />
        <Row label="Second" value={String(sample.hits[1].score)} />
        <Row label="Between them" value={String(closestGap)} tone="warn" />
      </dl>
    );
  }

  if (state === "tie") {
    return (
      <dl className="world-readout">
        <Row label="Question" value={exactTie.questionId} />
        <Row label="Two chunks score" value={String(exactTie.score)} tone="warn" />
        <Row label="Difference" value="None, to every digit a double carries" tone="warn" />
      </dl>
    );
  }

  if (state === "order") {
    return (
      <dl className="world-readout">
        <Row label="Score tolerance" value={parity.scoreTolerance} />
        <Row label="Order tolerance" value="None - compared exactly" tone="good" />
        <Row label="Compared to depth" value={`BM25 ${parity.bm25Depth}, RRF ${parity.rrfDepth}`} />
      </dl>
    );
  }

  if (state === "guards") {
    return (
      <dl className="world-readout">
        <Row label="Loop order" value="The Python one, kept" tone="good" />
        <Row label="Inverted index" value="Refused" tone="good" />
        <Row label="Logarithm" value="StrictMath.log" tone="good" />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="Questions" value={String(parity.questions)} />
      <Row label="Chunks" value={`${parity.chunks} over ${parity.corpusFiles} files`} />
      <Row label="Chunking" value={`${config.chunkSize} with ${config.chunkOverlap} overlap`} />
      <Row label="Parameters" value={`k1 ${config.k1}, b ${config.b}, RRF k ${config.rrfK}`} />
      <Row label="Corpus" value={`${corpus.name} (${corpus.citation})`} />
    </dl>
  );
}
