import type { ProjectDiagram } from "./types";

/**
 * Two retrievers that disagree, and the one rule that is allowed to settle it.
 *
 * Read out of the repository. `src/retrieval.py` holds a hand-written Okapi BM25 - about eighty
 * lines, deliberately not a library dependency - and `reciprocal_rank_fusion`, whose own comment
 * explains the shape this diagram is drawn to show: dense cosine similarity and BM25 scores are
 * on different unnormalised scales, so they cannot be added or averaged without inventing a
 * weighting. RRF reads positions only. k=60 is the value from Cormack et al., not a tuned number.
 *
 * That is why fusion is drawn as a gate rather than a merge. A merge would imply the two ranks
 * are combined; what actually happens is that one rule decides, and neither retriever's scores
 * survive the decision.
 *
 * The return path is the project's whole claim. `src/rag.py` builds every context as a citation
 * carrying the chunk ID, the document, the CFR citation and the exact character offsets, so an
 * answer resolves back to committed text rather than to a paraphrase of it. Drawn crossing back
 * to the corpus because that is what "traceable" means here - it is a path, not an adjective.
 */
export const insureAssistDiagram: ProjectDiagram = {
  slug: "insureassist-rag",
  title: "Two retrievers, one fusion rule, and a citation that resolves",
  caption:
    "Dense and lexical ranks are never averaged - they are on different scales, so reciprocal rank fusion reads only their positions. The path back to the corpus is what makes a citation checkable rather than decorative.",
  accent: "var(--accent-corpus)",
  nodes: [
    {
      id: "corpus",
      label: "NFIP corpus",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      note: "Licensed federal flood-insurance text, committed to the repository.",
    },
    {
      id: "ingest",
      label: "Chunk and identify",
      kind: "process",
      col: 1,
      row: 1,
      stages: [1],
      note: "Offsets kept. IDs derived from document, offset and text, so re-ingest is idempotent.",
    },
    {
      id: "dense",
      label: "Dense index",
      kind: "store",
      col: 2,
      row: 0,
      stages: [2],
      tools: ["Qdrant", "BGE embeddings"],
      note: "Cosine similarity over embedded chunks.",
    },
    {
      id: "lexical",
      label: "Lexical index",
      kind: "store",
      col: 2,
      row: 2,
      stages: [2],
      tools: ["BM25"],
      note: "Okapi BM25, written out rather than imported.",
    },
    {
      id: "fusion",
      label: "Rank fusion",
      kind: "gate",
      col: 3,
      row: 1,
      stages: [3],
      note: "Reciprocal rank, k=60. Positions only - the two scales are never added.",
    },
    {
      id: "generate",
      label: "Prompt and answer",
      kind: "process",
      col: 4,
      row: 1,
      tools: ["Ollama"],
      note: "Contexts are numbered in the prompt so the answer can refer to them.",
    },
    {
      id: "citations",
      label: "Citations",
      kind: "artifact",
      col: 4,
      row: 2,
      stages: [4],
      note: "Chunk ID, document, CFR citation and character offsets. Never generated.",
    },
    {
      id: "api",
      label: "Query service",
      kind: "sink",
      col: 5,
      row: 1,
      tools: ["FastAPI"],
      note: "Answer and citations returned together, never separately.",
    },
  ],
  edges: [
    { from: "corpus", to: "ingest", kind: "data" },
    { from: "ingest", to: "dense", kind: "data", label: "embed" },
    { from: "ingest", to: "lexical", kind: "data", label: "tokenise" },
    { from: "dense", to: "fusion", kind: "data", label: "dense rank" },
    { from: "lexical", to: "fusion", kind: "data", label: "lexical rank" },
    { from: "fusion", to: "generate", kind: "data", label: "top-k contexts" },
    { from: "generate", to: "api", kind: "data" },
    { from: "generate", to: "citations", kind: "control", label: "per context" },
    { from: "citations", to: "corpus", kind: "feedback", label: "resolves to offsets" },
  ],
};
