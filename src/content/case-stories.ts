/**
 * Case-study narratives.
 *
 * Each flagship project gets a pinned section where its own figure stages itself while the
 * argument is told beside it. The beats below are the argument - what the reader should be
 * understanding at each point of the scroll, in the project's own terms.
 *
 * Rules these are written under:
 *   - No number appears here. Where a case study states a result, it comes from the evidence
 *     registry, which is the only place numbers are allowed to live.
 *   - A beat says what the figure is doing and why it matters, not what the figure looks like.
 *   - Limitations are not deferred to the end of the page when they belong inside the argument.
 */

export interface StoryBeat {
  /** The motion verb this beat corresponds to, used as its label. */
  verb: string;
  text: string;
}

export interface CaseStory {
  /** Names the question the section answers. */
  title: string;
  intro: string;
  beats: readonly StoryBeat[];
  /** The honest caveat for this narrative, shown at the end of it rather than buried. */
  caveat: string;
}

export const caseStories: Readonly<Record<string, CaseStory>> = {
  "transport-uq": {
    title: "How a fast approximation earns the right to be used",
    intro:
      "An agent-based transport simulation is expensive enough that policy questions get asked less often than they should. A surrogate answers in a fraction of the time - and a surrogate that is confidently wrong is worse than the simulation it replaced. This is the sequence that closes that gap.",
    beats: [
      {
        verb: "Represent",
        text: "The network is the input. A road link's behaviour depends on what it connects to, so the model reads a graph rather than a table of independent rows.",
      },
      {
        verb: "Propagate",
        text: "Information reaches a link by travelling through the structure. The wavefront here is a real breadth-first traversal of the fixed network, so the order is the graph's, not a designer's.",
      },
      {
        verb: "Predict",
        text: "Every junction now has an estimate. On its own that is a number with no indication of when to believe it.",
      },
      {
        verb: "Quantify",
        text: "Each junction gets a measure of how much the model had to work with. The further information had to travel, the less there was to go on.",
      },
      {
        verb: "Decline",
        text: "The junctions the model is least sure about are marked rather than hidden, which is what makes a review queue possible instead of a blanket trust decision.",
      },
    ],
    caveat:
      "The figure is a construction, not a measurement: ring size is a function of hop distance in this drawing. The measured relationship between uncertainty and error is in the evidence table below, along with what it does not establish.",
  },

  "insureassist-rag": {
    title: "Why retrieval quality and answer quality are two different results",
    intro:
      "A retrieval-augmented system fails in two distinct ways, and reporting one number hides both. This separates them: what was found, and what was written from it.",
    beats: [
      {
        verb: "Ingest",
        text: "Source documents are split into passages. The split is part of the system, not preparation for it - a passage boundary in the wrong place removes an answer from reach before retrieval ever runs.",
      },
      {
        verb: "Represent",
        text: "Each passage takes a position in a space where distance is meant to stand for relevance. Meant to: whether it does is the thing being measured.",
      },
      {
        verb: "Retrieve",
        text: "A question arrives and the nearest passages are selected. This step can be scored on its own, against known-correct sources, without generating anything.",
      },
      {
        verb: "Ground",
        text: "The answer is tied back to the passages it was built from. An answer that cannot be traced to its evidence is not a better answer, it is an unverifiable one.",
      },
      {
        verb: "Verify",
        text: "Retrieval is scored separately from generation, so a fluent answer built on the wrong passage is visible as the failure it is.",
      },
    ],
    caveat:
      "Retrieval scores in the evidence table are measured on a fixed question set over public policy text. They say nothing about performance on other corpora, other question styles, or questions whose answer is not present at all.",
  },

  "mlops-reference-pipeline": {
    title: "Promotion is conditional, and the pipeline has to be able to refuse",
    intro:
      "A pipeline that always finishes is not a pipeline, it is a conveyor. What makes this one a reference is that each stage can decline to pass the artifact on, and the refusal is the interesting behaviour.",
    beats: [
      {
        verb: "Ingest",
        text: "Data enters under a licence the pipeline can verify. A gate that cannot check its input is decoration.",
      },
      {
        verb: "Separate",
        text: "Train, validation and test are split before anything is fitted, so the held-out set is genuinely held out rather than nominally so.",
      },
      {
        verb: "Fit",
        text: "Features are fitted on the training split alone. This is where leakage usually enters, quietly, and never announces itself later.",
      },
      {
        verb: "Gate",
        text: "The held-out result is compared against a threshold. If it falls short the artifact stops here - it is not registered, not promoted, and not served.",
      },
      {
        verb: "Promote",
        text: "Only an artifact that passed is registered and served, and what it passed is recorded alongside it.",
      },
    ],
    caveat:
      "The gate proves the artifact met a threshold on one held-out split at one moment. It does not establish that the split is representative, that the threshold is the right one, or that the model will hold up on data collected later.",
  },

  "hydrology-uq": {
    title: "Where an interval comes from",
    intro:
      "An uncertainty band is not produced by widening a line. It is what disagreement looks like once it has been summarised.",
    beats: [
      {
        verb: "Simulate",
        text: "Several members are run from the same starting point under different assumptions.",
      },
      {
        verb: "Diverge",
        text: "They agree near the start and separate through the middle of the horizon, which is where the modelled system is genuinely hardest.",
      },
      {
        verb: "Summarise",
        text: "The spread is collapsed into a band. The band is a description of the disagreement, and it is only as honest as the ensemble that produced it.",
      },
    ],
    caveat:
      "An ensemble only explores the assumptions it was given. Agreement between members is not evidence of correctness - it can equally mean they share a blind spot.",
  },

  "streamflow-forecasting": {
    title: "Uncertainty is a function of how far ahead you are looking",
    intro:
      "A forecast is not uniformly uncertain. Drawing it with a constant band is the single most common way of overstating what is known about the far end of a horizon.",
    beats: [
      {
        verb: "Observe",
        text: "History runs up to the moment the forecast is issued. Everything left of that line is measured rather than predicted.",
      },
      {
        verb: "Issue",
        text: "At the issue point the prediction is nearly tight - the immediate future is heavily constrained by the present.",
      },
      {
        verb: "Open",
        text: "The interval widens with lead time, because each step forward compounds what the previous step did not pin down.",
      },
    ],
    caveat:
      "This benchmark is deterministic and synthetic. It compares methods against each other under identical conditions; it is not a claim about any particular river.",
  },

  "cifar10-cnn": {
    title: "Detail traded for meaning",
    intro:
      "A convolutional stack answers a classification question by discarding almost everything, in a specific order.",
    beats: [
      {
        verb: "Represent",
        text: "The input is a grid of pixels - all detail, no interpretation.",
      },
      {
        verb: "Abstract",
        text: "Each layer keeps fewer, larger features. Resolution falls as meaning rises, which is the trade the architecture exists to make.",
      },
      {
        verb: "Decide",
        text: "What survives is a short list of scores over classes.",
      },
    ],
    caveat:
      "This is a compact baseline on a small, well-studied dataset. Its value is a reproducible reference point, not a competitive result.",
  },
};
