"use client";

import {
  complementarity,
  config,
  corpus,
  forms,
  generation,
  licence,
  limits,
  notImplemented,
  questions,
  results,
  retrievers,
} from "@/content/insureassist-world";
import { runCount, wrongFormCase, wrongFormCount } from "./geometry";
import type { InsureKey } from "./states";

/**
 * Names, numbers and citations, as HTML over the canvas.
 *
 * Every value comes from the generated evidence module, which is generated from the repository's
 * frozen reference run. Nothing is typed into this component, which is the same discipline the
 * repository applies to its own documentation.
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

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export default function Readout({ state }: { state: InsureKey }) {
  switch (state) {
    case "corpus":
      return (
        <ol className="world-readout-list">
          {forms.map((form) => (
            <li data-on="" key={form.id}>
              <code>{form.form}</code>
              <span>
                {form.citation} &middot; {form.words.toLocaleString("en-GB")} words
              </span>
            </li>
          ))}
        </ol>
      );

    case "duplication":
      return (
        <Rows
          items={[
            {
              label: "Corpus",
              note: `${corpus.documents} forms, one skeleton`,
              value: `${corpus.words.toLocaleString("en-GB")} words`,
            },
            { label: "Redistribution", note: "works of the US Government", value: licence.basis },
            { label: "The problem", note: "right provision, wrong document", value: "Near-duplicates" },
          ]}
        />
      );

    case "chunking":
      return (
        <Rows
          items={[
            {
              label: "Chunk size",
              note: `${config.chunkOverlap} of overlap`,
              value: `${config.chunkSize} ${config.chunkUnit}`,
            },
            { label: "Corpus becomes", note: "deterministic; re-ingest overwrites the same points", value: `${corpus.chunks} chunks` },
            { label: "Selected on", note: "from five chunk configurations", value: "Dev split" },
          ]}
        />
      );

    case "identity":
      return (
        <>
          <p className="world-formula">
            <span>chunk_id</span>
            <em>=</em>
            <span data-mask="">document_id</span>
            <em>#</em>
            <span>sha256(document_id | start | text)</span>
          </p>
          <Rows
            items={[
              { label: "Why", note: "identical passages would hash to the same value", value: "The forms collide" },
              { label: "Consequence", note: "and a label keeps pointing at its evidence", value: "Chunks stay distinct" },
            ]}
          />
        </>
      );

    case "embedding":
      return (
        <Rows
          items={[
            {
              label: "Model",
              note: `${config.dimension} dimensions, ${config.distance}`,
              value: config.denseModel,
            },
            { label: "Points", note: "one per chunk", value: `${corpus.chunks}` },
            { label: "Positions here", note: "the repository publishes metrics and chunk IDs, not vectors", value: "Illustrative" },
          ]}
        />
      );

    case "query":
      return (
        <Rows
          items={[
            {
              label: "Candidates",
              note: `top ${config.servingTopK} served`,
              value: `${config.candidateDepth} per retriever`,
            },
            {
              label: "Question set",
              note: `${questions.answerable} answerable, ${questions.unanswerable} not`,
              value: `${questions.total} labels`,
            },
            { label: "Held out", note: `dev ${questions.dev}, run once after freezing`, value: `${questions.test}` },
          ]}
        />
      );

    case "wrongform":
      return (
        <Rows
          items={[
            {
              label: "Replaying",
              note: `${wrongFormCase.category} · answered by the ${
                forms.find((f) => f.id === wrongFormCase.relevant[0])?.form ?? "corpus"
              }`,
              value: wrongFormCase.id,
            },
            {
              label: "Wrong form at rank one",
              note: "held-out answerable questions",
              value: `${wrongFormCount} of ${runCount}`,
            },
            {
              label: "Top-document accuracy",
              note: "the headline improvement, not hit rate",
              value: pct(results.topDocument),
            },
          ]}
        />
      );

    case "fusion":
      return (
        <ol className="world-readout-list">
          {retrievers.map((retriever) => (
            <li data-on="" data-tone={retriever.selected ? "positive" : undefined} key={retriever.key}>
              <code>
                {retriever.label}
                {retriever.selected ? " · selected" : ""}
              </code>
              <span>
                hit@5 {retriever.hitAt5} &middot; MRR {retriever.mrr} &middot; top-document{" "}
                {retriever.topDocument}
              </span>
            </li>
          ))}
        </ol>
      );

    case "evidence":
      return (
        <Rows
          items={[
            {
              label: "Returned",
              note: "each with its form, CFR citation and character offsets",
              value: `${config.servingTopK} chunks`,
            },
            {
              label: "Citation recall",
              note: `${generation.citationsChecked} citations checked`,
              value: `${generation.citationRecall}`,
            },
            { label: "Unsupported citations", note: "measured deterministically, no model", value: `${generation.unsupportedCitationRate}` },
          ]}
        />
      );

    case "generation":
      return (
        <Rows
          items={[
            { label: "Model", note: `${generation.backend}, not fine-tuned`, value: generation.model },
            { label: "Answers everything", note: "acceptance on answerable questions", value: pct(generation.answerableAcceptance) },
            {
              label: "Declines nothing",
              note: `${generation.falseAnswers} unanswerable questions answered anyway`,
              value: pct(generation.unanswerableRejection),
            },
          ]}
        />
      );

    default:
      return (
        <>
          <ol className="world-readout-list">
            {limits.map((limit) => (
              <li data-on="" data-tone="uncertain" key={limit.label}>
                <code>{limit.label}</code>
                <span>{limit.note}</span>
              </li>
            ))}
          </ol>
          <p className="world-note">
            Dev hit@5 was {complementarity.devHitAt5} against {results.hitAt5} held out.{" "}
            {notImplemented.length} components were deliberately not built.
          </p>
        </>
      );
  }
}
