/**
 * Each project in three beats: the problem, why it mattered, and what came of it.
 *
 * Short on purpose. The result is the headline figure from the repository named by `evidence`,
 * checked against that repository's own files on 3 November 2026, and `validate:content` checks
 * that every published project has an entry. A project whose repository publishes no result says
 * what the work established instead, because an invented number is the one thing this site cannot
 * carry.
 */

export interface ProjectStory {
  problem: string;
  why: string;
  /** Three or four labels, drawn as a small flow chart. */
  flow: readonly string[];
  result: { value: string; label: string };
  /** A path inside the project's repository, or a site route beginning with a slash. */
  evidence: string;
}

export const projectStories: Readonly<Record<string, ProjectStory>> = {
  "transport-uq": {
    problem: "A fast traffic model can be wrong with no warning.",
    why: "Analysts need to know which predictions to trust.",
    flow: ["Simulation", "Graph network", "Uncertainty", "Review"],
    result: { value: "41.2%", label: "lower error after setting aside the least confident half" },
    evidence: "README.md",
  },
  "reliable-knowledge-systems": {
    problem: "Derived copies of one source can drift apart silently.",
    why: "Comparing copies cannot show which one is wrong.",
    flow: ["Capture", "Derive", "Verify back"],
    result: { value: "Backwards", label: "every derived view is checked against the captured source" },
    evidence: "/architecture",
  },
  medico: {
    problem: "Three X-ray corpora label different findings.",
    why: "Treating silence as a negative would teach the model something false.",
    flow: ["Three corpora", "Mask", "Focal loss", "Patient split"],
    result: { value: "Masked", label: "labels a corpus cannot give drop out instead of counting as negative" },
    evidence: "README.md",
  },
  "insureassist-rag": {
    problem: "Near-identical policy forms fool a topic retriever.",
    why: "The right clause from the wrong form reads like the right answer.",
    flow: ["Chunk", "Hybrid search", "Cite"],
    result: { value: "0.167 → 0.556", label: "of questions matched to the correct policy form" },
    evidence: "docs/BENCHMARK.md",
  },
  "mlops-reference-pipeline": {
    problem: "A perfect 1.000 score came from duplicated rows.",
    why: "Every stage existed, and nothing could stop a bad model.",
    flow: ["Validate", "Train", "Gate", "Serve"],
    result: { value: "0.8795", label: "held-out ROC-AUC on licensed data, behind a release gate" },
    evidence: "docs/EVALUATION.md",
  },
  "ai-engineering-portfolio": {
    problem: "Workplace architecture is hard to publish honestly.",
    why: "Any diagram can quietly imply sole authorship.",
    flow: ["Measure", "Classify", "Redact", "Publish"],
    result: { value: "22", label: "architecture diagrams, with authorship in four stated classes" },
    evidence: "README.md",
  },
  jobhunter: {
    problem: "Most job results are senior, expired or ineligible.",
    why: "Reading them all is the actual work.",
    flow: ["Sources", "Discard", "Score", "Rank"],
    result: { value: "321", label: "employers in the registry, 117 with a verified feed" },
    evidence: "README.md",
  },
  "nlp-transformers": {
    problem: "A failed download can quietly become a fake score.",
    why: "Template text gives a number nobody should trust.",
    flow: ["AG News", "TF-IDF and DistilBERT", "One evaluation"],
    result: { value: "It stops", label: "without the real dataset the run fails rather than falling back" },
    evidence: "README.md",
  },
  "statistical-learning": {
    problem: "Coursework reports leave out the runs that embarrassed you.",
    why: "Results should be regenerated, not pasted.",
    flow: ["Notebook", "Search", "Held-out test"],
    result: { value: "1 point", label: "between random search and Bayesian optimisation, on 60 test points" },
    evidence: "Assignment_3/solution/Problem_Set_3_Notebook.ipynb",
  },
  "supply-chain": {
    problem: "Five score components look like five opinions.",
    why: "Two of them read the same underlying signal.",
    flow: ["Data", "KPIs", "Weights", "Score"],
    result: { value: "55%", label: "of the supplier score is one signal counted twice" },
    evidence: "src/supplier_scoring.py",
  },
  "weather-eda": {
    problem: "Charts of synthetic data look like findings.",
    why: "The fair test is recovering what was planted.",
    flow: ["Generate", "Analyse", "Compare"],
    result: { value: "0.09 °C", label: "largest temperature gap from the generator, across six cities" },
    evidence: "results/city_summary_statistics.csv",
  },
  "water-quality": {
    problem: "One score per model invites a ranking it cannot support.",
    why: "Fold noise can be larger than the gaps between models.",
    flow: ["Five folds", "Four models", "Compare spread"],
    result: { value: "1 of 4", label: "models truly separated on this generated data" },
    evidence: "results/model_results.json",
  },
  "insurance-claims-threshold": {
    problem: "A model that ranks well still has not made a decision.",
    why: "Acting needs costs, not only probabilities.",
    flow: ["Rank", "Calibrate", "Decide"],
    result: { value: "3.23%", label: "risk where acting pays, under the repository's example costs" },
    evidence: "src/threshold_optimizer.py",
  },
  "battery-soc": {
    problem: "Charge can only be inferred from voltage.",
    why: "As a cell ages, a fresh calibration reads low.",
    flow: ["Signals", "Five models", "Split by cycle"],
    result: { value: "0.0001 V", label: "lost per cycle in the repository's demonstration generator" },
    evidence: "src/data_loader.py",
  },
  "nn-identifiability": {
    problem: "Different weights can compute the same function.",
    why: "A weight is only worth interpreting if it is unique.",
    flow: ["Build", "Permute and flip", "Verify"],
    result: { value: "2", label: "symmetries constructed and checked numerically" },
    evidence: "README.md",
  },
  "flood-lstm": {
    problem: "A high forecast score may only be the calendar.",
    why: "Seasons carry most of this generated signal.",
    flow: ["Rain and flow", "LSTM", "Calendar lookup"],
    result: { value: "+0.0188", label: "R² the network adds over a calendar lookup" },
    evidence: "results/benchmark.json",
  },
  "audi-release-tracking": {
    problem: "About 600 rows and 130 columns, searched by eye.",
    why: "People needed one record, again and again.",
    flow: ["Dropdown", "Lookup", "Four frames", "Write back"],
    result: { value: "4 frames", label: "replaced scanning the sheet, and other departments adopted it" },
    evidence: "README.md",
  },
  "keras-pytorch-parity": {
    problem: "Framework comparisons fail when the models quietly differ.",
    why: "Same images and same model have to be proven first.",
    flow: ["Same indices", "Same model", "Same run"],
    result: { value: "815,018", label: "parameters in both models, asserted on every push" },
    evidence: "README.md",
  },
  "eurostat-modal-split": {
    problem: "Typed findings go stale when the data refreshes.",
    why: "The numbers should come from the data every time.",
    flow: ["Eurostat", "Pinned hash", "Recompute", "Report"],
    result: { value: "+0.5", label: "points of EU car share gained across 24 years" },
    evidence: "README.md",
  },
  "bm25-rrf-java": {
    problem: "A rewrite is easy to get almost right.",
    why: "Summation order alone can swap the top two results.",
    flow: ["Python", "Java", "Parity test"],
    result: { value: "50", label: "real queries compared exactly against the Python ranking" },
    evidence: "README.md",
  },
  "munich-accident-forecasting": {
    problem: "The baseline was forecasting a pandemic year.",
    why: "A margin has to survive an ordinary period.",
    flow: ["Published window", "Ordinary years", "Compare"],
    result: { value: "+23.4% → −15.5%", label: "the model's margin once the years are ordinary" },
    evidence: "README.md",
  },
  "drift-aware-platform": {
    problem: "Watching only the inputs would miss the change.",
    why: "Here the target moved, not the features.",
    flow: ["Monitor", "Retrain", "Gate"],
    result: { value: "0.679 vs 0.09", label: "target drift against feature drift share" },
    evidence: "README.md",
  },
  "hydrology-uq": {
    problem: "A well-fitted model can still hide large uncertainty.",
    why: "Measurement error can matter more than the fit.",
    flow: ["Calibrate", "Perturb", "Sensitivity"],
    result: { value: "NSE 0.908", label: "best calibrated fit in this group seminar" },
    evidence: "README.md",
  },
  "cifar10-cnn": {
    problem: "Often only the best headline number survives.",
    why: "The configuration and per-class results have to stay.",
    flow: ["Data", "CNN", "Per-class results"],
    result: { value: "64.26%", label: "tracked test accuracy, from 33.5% to 82.0% by class" },
    evidence: "README.md",
  },
  "streamflow-forecasting": {
    problem: "Two models were ranked on different targets.",
    why: "Everything needs the same fair baseline.",
    flow: ["Same days", "Persistence", "Models"],
    result: { value: "0.994 vs 0.988", label: "ridge R² against persistence, on synthetic data" },
    evidence: "README.md",
  },
  "mcp-policy-gateway": {
    problem: "A model cannot reliably tell data from instructions.",
    why: "Tool text reaches it at three different moments.",
    flow: ["Discovery", "Request", "Response", "Trace"],
    result: { value: "96.2%", label: "of 26 attack cases handled, at 9.5% false refusals" },
    evidence: "README.md",
  },
};
