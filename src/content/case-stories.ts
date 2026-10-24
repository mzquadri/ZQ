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
    title: "Three numbers that are not the same measurement",
    intro:
      "A benchmark table invites one reading: rank the rows. This one rewards a second look, because the three rows were not asked the same question, and the differences between the questions are larger than the differences between the models.",
    beats: [
      {
        verb: "Rank",
        text: "Read as a leaderboard, gradient boosting beats classical statistics by a wide margin and the naive baseline is not close.",
      },
      {
        verb: "Open",
        text: "One row predicts tomorrow having been given today's measurement. One forecasts two years of monthly means without seeing any of them. One repeats a seasonal average that carries no trend term.",
      },
      {
        verb: "Attribute",
        text: "The two most recent lag features carry most of the strongest model, on a series whose day-to-day autocorrelation is very close to one - because the series was generated by a recursion that is public.",
      },
    ],
    caveat:
      "This benchmark is deterministic and synthetic, and its evaluation is one step ahead with observed discharge supplied as an input. It exercises an evaluation pipeline honestly; it is not a claim about any particular river.",
  },

  "jobhunter": {
    title: "When a preference turns out to be a constraint",
    intro:
      "The tool is built on one claim: a job advert is a wish list, not a minimum, so a search should rank rather than filter. That holds for almost everything it reads, and then it stops holding, and the place it stops is the interesting part.",
    beats: [
      {
        verb: "Read",
        text: "Employers rent their career pages from a handful of applicant-tracking systems, each with a public endpoint. So there is one adapter per system rather than one scraper per company, and every configured employer was probed against its real endpoint before being written down.",
      },
      {
        verb: "Keep",
        text: "Only four conditions throw a posting away, and each asks whether the opportunity exists or is in this profession. Not whether the candidate is good enough - that question never deletes anything.",
      },
      {
        verb: "Penalise",
        text: "Everything else lowers the score and is named on the job. A missing tool, an ambitious experience requirement, a language you do not have: all visible, all arguable, none hidden.",
      },
      {
        verb: "Fail",
        text: "Then two roles scored in the high seventies that nobody could take: one requiring native German, one on another continent. Both were ranked highly because their technical fit was genuinely good.",
      },
      {
        verb: "Separate",
        text: "A weighted term can only move the total by its own weight, so no setting of those weights could express unavailability. Both now carry a flat penalty on top - larger, in each case, than the whole term beside it.",
      },
    ],
    caveat:
      "The weights are one person's judgement about their own search, calibrated against nothing: there is no outcome data behind them, and the premise that a graduate should apply at roughly sixty percent of a posting is an argument rather than a finding. Coverage is uneven - manually watched employers are not monitored automatically - and the tool never applies on anyone's behalf.",
  },

  "nlp-transformers": {
    title: "What to do when the data does not arrive",
    intro:
      "Two tracks, one task, one evaluation: TF-IDF baselines against a fine-tuned transformer on news headlines. The decision this section is about is not in either model. It is in the twenty lines that run before both of them.",
    beats: [
      {
        verb: "Request",
        text: "The pipeline needs a public dataset, fetched at run time. That is an ordinary dependency and, like every network dependency, it will sometimes not be there.",
      },
      {
        verb: "Fail",
        text: "There is a synthetic fixture in the repository for developing offline. Reaching for it automatically would keep the run green and produce a full results table, which is exactly the problem.",
      },
      {
        verb: "Refuse",
        text: "So the loader raises instead. The fixture stays reachable, but only by saying --synthetic out loud, and the README states its results are not comparable to anything.",
      },
      {
        verb: "Count",
        text: "The reason is in the fixture itself. Across its twenty sentences almost every word belongs to exactly one class, so separating them is a lookup rather than a classification - and the score would have been excellent.",
      },
      {
        verb: "Compare",
        text: "With real data the two tracks are then measured the same way, on a test split kept out of tuning entirely. That is the only arrangement under which comparing them says anything.",
      },
    ],
    caveat:
      "No result is published and none is claimed. The repository versions no data, no trained model, no checkpoints, no metrics and no run metadata, so there is no accuracy, no F1 and no verdict on whether the transformer earns its cost here. The vocabulary counts on this page describe the synthetic fixture, which exists for offline development and must not be used to report model capability.",
  },

  "statistical-learning": {
    title: "What a report can be stopped from leaving out",
    intro:
      "Coursework reports are easy to make look right: figures get pasted, numbers get retyped, and the runs that went badly simply never appear. These were written so that could not happen, and the two results worth reading are both ones that would otherwise have been dropped.",
    beats: [
      {
        verb: "Derive",
        text: "Backpropagation is worked out by hand and implemented from the derivation rather than from a library. At that point there is no reason yet to believe any of it.",
      },
      {
        verb: "Check",
        text: "So the gradients are compared against central differences, and then against autograd. Two independent references, because one agreement can be a shared mistake.",
      },
      {
        verb: "Baseline",
        text: "The untouched configuration is scored beside the accuracy of simply guessing the majority class - and loses to it. That comparison is the only reason the failure reads as a failure.",
      },
      {
        verb: "Tune",
        text: "What fixed it was the learning rate, four orders of magnitude up, rather than anything about the model. Two hyperparameter searches then run on the same budget, one with a surrogate and one without.",
      },
      {
        verb: "Resolve",
        text: "The search with the surrogate loses, by a single correctly classified point out of sixty. On a test set that size, that is the smallest difference it is possible to observe, which makes it the wrong thing to call a winner.",
      },
    ],
    caveat:
      "Sixty held-out points, single runs, no seeds repeated. Every margin here is an observation rather than an estimate, and the closest of them is one test point wide - which is why the figure is ruled in test points rather than in percentages. This is coursework: the questions were set rather than chosen, and the problem sheets in the repository are the chair's material, included for context only.",
  },

  "supply-chain": {
    title: "How a composite score hides its own structure",
    intro:
      "Five weighted components, adding to one, presented as a single number per supplier. That shape is persuasive precisely because it stops you asking what is inside it. This section asks.",
    beats: [
      {
        verb: "Aggregate",
        text: "Orders are grouped into per-supplier metrics. The source has no supplier identifiers, so departments and categories stand in - which is a proxy, and is named as one before anything is computed from it.",
      },
      {
        verb: "Weight",
        text: "Five components are given weights that sum to one: reliability, quality, cost, lead time, flexibility. Read as a list, that is five different opinions about a supplier.",
      },
      {
        verb: "Trace",
        text: "Each component is a normalisation of one column. Reliability normalises the on-time rate upward; quality normalises the late-delivery rate downward. The aggregation defines the second as one minus the first.",
      },
      {
        verb: "Collapse",
        text: "Inverting a min-max normalisation of one minus a series returns the series. The two components are equal for every supplier, so the scorecard's two largest weights are one signal wearing two names.",
      },
      {
        verb: "Concede",
        text: "Which leaves four signals, not five, and more than half the score resting on delivery timeliness alone. That is a defect in the design rather than a caveat about the data, and it is mine.",
      },
    ],
    caveat:
      "Nothing here is measured. The repository versions source and notebooks only - no dataset, no processed data, no forecast artefacts, no verified metrics - and makes no claim about any fill rate, delivery rate, region or forecast accuracy. The supplier grouping is a proxy and must not be read as a supplier-quality assessment, and the inventory outputs are classical formulas whose assumptions belong to whoever applies them.",
  },

  "weather-eda": {
    title: "What an analysis of invented data can be held to",
    intro:
      "Everything in this dataset was put there on purpose, so every pattern in it is a pattern someone chose. That sounds like a reason not to publish the analysis. It is actually the reason the analysis can be marked - the answer sheet is in the same repository.",
    beats: [
      {
        verb: "Configure",
        text: "Each city is a handful of parameters: a base temperature, a seasonal swing, a precipitation scale, a humidity level. Two of the six sit in the southern hemisphere and have their seasons reversed.",
      },
      {
        verb: "Generate",
        text: "Ten years of daily observations follow from those parameters at a fixed seed. The values carry real units, which makes the plots legible and makes them correspondingly easy to mistake for measurements.",
      },
      {
        verb: "Explore",
        text: "The exploratory pass does what such a pass does: distributions, seasonal comparisons, exceedance curves, correlations. On its own this is a gallery, and a gallery cannot be wrong about anything.",
      },
      {
        verb: "Recover",
        text: "So each summary statistic is put beside the parameter that produced it. Mean temperature comes back essentially exactly, and the spread ranks the cities in the configured order of seasonal swing. The analysis is doing its job.",
      },
      {
        verb: "Catch",
        text: "Humidity does not come back. Every city sits above its configured level, by about the same amount - one direction, one size, six times. That is the generator's construction showing through, and it is the only thing here nobody chose.",
      },
    ],
    caveat:
      "None of this is weather. The dataset, the findings and the figures are produced by a seeded generator and are not station observations, climate evidence, forecasts, or a basis for any operational, scientific or policy decision. The humidity offset is a fact about the generator and of no consequence outside it; it is shown because it demonstrates that the check is capable of failing.",
  },

  "water-quality": {
    title: "What a leaderboard hides from itself",
    intro:
      "Four models, five rows, a winner in bold. The same run also recorded how far each model moved between folds, and that number was left out of the table it undermines. Putting it back is the whole of this section.",
    beats: [
      {
        verb: "Generate",
        text: "The dataset is produced by a seeded generator with deliberately class-correlated features. Anything measured here is about recovering those correlations, not about water.",
      },
      {
        verb: "Compare",
        text: "Each model runs inside a pipeline, so imputation and scaling are fitted per fold rather than once over everything. That is what makes the fold scores comparable with each other.",
      },
      {
        verb: "Rank",
        text: "Scored on a single held-out split, the models fall into a clean order with a clear best. This is the table that gets copied, and it is the reading the rest of this section takes apart.",
      },
      {
        verb: "Widen",
        text: "Each model also has a standard deviation across folds. Drawn as intervals rather than as points, the top three overlap - there is one value of F1 that every one of them is consistent with.",
      },
      {
        verb: "Concede",
        text: "So the finding is narrower than the table: one model is clearly worse than the others, and the order of the rest is not established. The tuned model has no interval at all, which is its own answer.",
      },
    ],
    caveat:
      "The labels and features are generated, not laboratory measurements, and the repository states it does not predict whether real water is safe to drink and must not be used for water-quality or regulatory decisions. The intervals here are fold-to-fold standard deviations from a single seeded run, which is a floor on the uncertainty rather than a confidence interval.",
  },

  "insurance-claims-threshold": {
    title: "Three problems that get reported as one",
    intro:
      "A claims model is usually judged by a single number, which quietly assumes that ranking policies, stating honest probabilities and deciding what to do about them are the same achievement. They are not, and they fail separately. This pipeline keeps them apart.",
    beats: [
      {
        verb: "Rank",
        text: "The first question is only whether the model orders policies by risk at all. A model can do this well and still be badly wrong about how likely anything is.",
      },
      {
        verb: "Calibrate",
        text: "The second is whether the numbers mean what they say - whether policies given a one in five chance claim about one time in five. This is fitted and then scored, because a calibration step nobody measured is an assumption.",
      },
      {
        verb: "Weigh",
        text: "The two errors are not comparable. Investigating a policy that was never going to claim costs a little; missing one that does costs the payout. Those magnitudes are inputs, not details.",
      },
      {
        verb: "Cut",
        text: "Given calibrated probabilities and those costs, the break-even follows as arithmetic: act when acting is worth more than not acting. It lands a long way from the one half a classifier hands you by default.",
      },
      {
        verb: "Attribute",
        text: "Last, the decision has to be explainable to someone who did not build it, which is why attribution is part of the pipeline rather than a postscript to it.",
      },
    ],
    caveat:
      "The cost matrix is the repository's own example and is not a validated business policy. Nothing here is a result: no data, split, trained model, calibration output or evaluation report is versioned, so there is no accuracy, no AUC and no business value to report - and the code must not be used to make automated decisions about people or policies.",
  },

  "battery-soc": {
    title: "Why a charge gauge goes wrong in one direction",
    intro:
      "A lithium-ion cell has no fuel gauge. Charge is inferred from voltage, and the voltage a cell shows at a given charge falls as it ages - so a gauge calibrated once is wrong later, by a predictable amount, in a predictable direction. This is that failure, drawn from the generator's own formula.",
    beats: [
      {
        verb: "Infer",
        text: "Nothing measures charge directly. It has to be read back out of voltage, current and temperature, which means the gauge is a model and not a sensor.",
      },
      {
        verb: "Calibrate",
        text: "A fresh cell gives the curve the lookup is built from: this voltage means this much charge. For as long as the cell stays fresh, that is a fair trade.",
      },
      {
        verb: "Age",
        text: "Cycling lowers the whole curve. The term that does it does not depend on charge at all, so the cell sits below its own calibration everywhere, not just when it is nearly empty.",
      },
      {
        verb: "Misread",
        text: "Read the aged cell's voltage against the fresh curve and the answer comes back low. The gauge now understates charge, which is the safer direction to be wrong in and still a fault.",
      },
      {
        verb: "Hold back",
        text: "So the split has to be by cycle, with the newest and most degraded cycles held out. Shuffle the rows instead and each test sample's near-identical neighbour sits in the training set, which hides this failure behind a very good score.",
      },
    ],
    caveat:
      "The curve is a synthetic cell, and the sinking term is one the repository's own demonstration generator applies. It is a statement about the code, not a measurement of a battery: there is no dataset here, no trained model and no score, and none of it may be used to operate a battery-management system.",
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
