import type { ProjectDiagram } from "./types";

/**
 * A reimplementation, and the test that is allowed to decide whether it worked.
 *
 * The classes are the repository's: `Chunker`, `Tokenizer`, `Bm25Index`, `ReciprocalRankFusion`,
 * and `ParityTest` over a reference exported by `tools/export_python_reference.py`.
 *
 * The one structural decision worth drawing is that chunking happens on the JVM. The Python
 * fixture contains chunks already, and reading them would have made the parity test pass while
 * proving nothing about the chunker - so the corpus goes in and the JVM does the whole job. That
 * is why there is no edge from the reference into anything but the test.
 *
 * The reference is drawn as a source rather than as something derived here, because from this
 * repository's point of view that is what it is: an input to a comparison, produced elsewhere and
 * committed.
 *
 * The parity gate's rule is asymmetric and the return path is why. Order is compared exactly and
 * scores only to a tolerance, which sounds lax until you look at the ranking it is run on: the top
 * two results are four thousandths apart, so the pair that a different summation order would swap
 * is exactly the pair the exact-order check is protecting.
 */
export const bm25JavaDiagram: ProjectDiagram = {
  slug: "bm25-rrf-java",
  title: "Chunked on the JVM, compared against an exported ranking",
  caption:
    "Chunking is done here rather than read from the Python fixture, or the parity test would pass without exercising the chunker. Order is compared exactly; only the scores get a tolerance.",
  accent: "var(--accent-corpus)",
  nodes: [
    {
      id: "corpus",
      label: "Checksummed corpus",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      note: "Verified first, so both implementations provably read the same bytes.",
    },
    {
      id: "chunk",
      label: "Chunk and tokenise",
      kind: "process",
      col: 1,
      row: 1,
      stages: [1],
      tools: ["Java 21"],
      note: "Done on the JVM, not loaded from the fixture.",
    },
    {
      id: "index",
      label: "BM25 index",
      kind: "process",
      col: 2,
      row: 1,
      stages: [2],
      note: "Okapi scoring with the reference implementation's k1 and b.",
    },
    {
      id: "fuse",
      label: "Rank fusion",
      kind: "process",
      col: 3,
      row: 1,
      stages: [3],
      note: "By position, so two score scales never have to be reconciled.",
    },
    {
      id: "reference",
      label: "Exported reference",
      kind: "source",
      col: 3,
      row: 2,
      tools: ["Jackson"],
      note: "The Python ranking, committed as JSON.",
    },
    {
      id: "parity",
      label: "Parity test",
      kind: "gate",
      col: 4,
      row: 1,
      stages: [4],
      tools: ["JUnit 5"],
      note: "Order exactly. Scores only to a tolerance.",
    },
  ],
  edges: [
    { from: "corpus", to: "chunk", kind: "data" },
    { from: "chunk", to: "index", kind: "data" },
    { from: "index", to: "fuse", kind: "data" },
    { from: "fuse", to: "parity", kind: "data", label: "JVM ranking" },
    { from: "reference", to: "parity", kind: "control", label: "expected order" },
    { from: "parity", to: "fuse", kind: "feedback", label: "the top two are 0.004 apart" },
  ],
};
