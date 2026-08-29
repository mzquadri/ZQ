/**
 * The nine repositories that are real work but not flagships.
 *
 * They used to be cards in a grid, which is the one thing this portfolio says it will not do to
 * work that has an end-to-end story. Each one now gets a stage: what goes in, what the system does
 * to it, what it establishes, and where it stops.
 *
 * The interesting fact only became visible once all nine READMEs were read side by side. Two of
 * them publish tracked numbers. Five publish none *on purpose*, and each says in its own words why
 * the evidence it would take to publish them is not there. One serves a working endpoint and
 * refuses a forecast claim; one is descriptive and measures only its own generator.
 *
 * So the section is organised around evidence state rather than topic, and the palette carries it:
 * amber is this site's refusal colour, and a withheld metric is a refusal. A reader scrolling the
 * band sees two coloured scenes and five amber ones before reading a word.
 *
 * Every sentence below is summarised from the repository's own README. No number appears here that
 * is not printed in the repository it belongs to.
 */

/** A metric the repository actually publishes, on a shared 0-1 axis. */
export interface EvidenceBar {
  label: string;
  /** The published value. Always between 0 and 1 so one axis is honest for the whole group. */
  value: number;
}

/** A published figure that does not share the bar axis - a different unit, or a different kind. */
export interface EvidenceReadout {
  label: string;
  value: string;
}

export type StrongEvidence =
  | {
      kind: "measured";
      /** What the bars are all measuring. One quantity per chart, or the axis is a lie. */
      axis: string;
      bars: readonly EvidenceBar[];
      readouts: readonly EvidenceReadout[];
      /** What the numbers are actually about. Always narrower than the topic. */
      caveat: string;
    }
  | {
      kind: "demonstrated";
      /** The thing that does work end to end, since it is not a score. */
      axis: string;
      readouts: readonly EvidenceReadout[];
      caveat: string;
    }
  | {
      kind: "withheld";
      /** The repository's own reason, summarised. This is the whole point of the scene. */
      reason: string;
      /** The named quantities it declines to claim. Drawn as the empty axis. */
      absent: readonly string[];
    };

export interface StrongWork {
  /** Exact GitHub repository name. The link is derived from it. */
  repository: string;
  title: string;
  /** One line, before any detail. */
  premise: string;
  /** The accent token this scene binds. Amber is reserved for the refusals. */
  accent: string;
  input: string;
  transform: string;
  limitation: string;
  evidence: StrongEvidence;
}

export const strongWork: readonly StrongWork[] = [
  {
    repository: "Deep-Learning-Flood-Prediction-LSTM",
    title: "Flood Prediction with an LSTM",
    premise:
      "River discharge is well understood physics and expensive computation. This is the deep-learning shortcut, measured on a catchment that can be regenerated anywhere.",
    accent: "var(--accent-flow)",
    input:
      "Thirty days of precipitation, temperature and soil moisture, produced by a deterministic rainfall-runoff generator written for the repository.",
    transform:
      "An LSTM reads the window and predicts the next day's discharge in a single forward pass, trained with early stopping and a learning-rate schedule.",
    evidence: {
      kind: "measured",
      axis: "Reported score, 0 to 1",
      bars: [
        { label: "R²", value: 0.899 },
        { label: "Nash-Sutcliffe", value: 0.899 },
        { label: "Flood-event precision", value: 0.574 },
        { label: "Flood-event recall", value: 0.648 },
        { label: "Flood-event F1", value: 0.609 },
      ],
      readouts: [
        { label: "RMSE", value: "2.551 m³/s" },
        { label: "MAE", value: "1.833 m³/s" },
        { label: "PBIAS", value: "3.57%" },
      ],
      caveat:
        "Flood events are the 95th percentile of the generated series. Detection is markedly harder than the fit, and the repository publishes both rather than the flattering one.",
    },
    limitation:
      "The catchment is synthetic. Every score describes the generated benchmark, and none of it is real-catchment performance.",
  },
  {
    repository: "ML-Water-Quality-Classification",
    title: "Water Quality: Four Classifiers, One Axis",
    premise:
      "Four families of model on the same generated task, compared under cross-validation instead of asserted.",
    accent: "var(--accent-systems)",
    input:
      "Five thousand samples from a seeded generator whose features are deliberately class-correlated.",
    transform:
      "Logistic regression, random forest, XGBoost and an RBF SVM run through the same pipeline, with cross-validation and hyperparameter tuning.",
    evidence: {
      kind: "measured",
      axis: "ROC-AUC",
      bars: [
        { label: "Logistic regression", value: 0.838 },
        { label: "Random forest", value: 0.889 },
        { label: "XGBoost", value: 0.896 },
        { label: "SVM (RBF)", value: 0.909 },
        { label: "XGBoost (tuned)", value: 0.898 },
      ],
      readouts: [
        { label: "Best accuracy", value: "0.826 · SVM" },
        { label: "Best F1", value: "0.790 · SVM" },
      ],
      caveat:
        "Tuning moved XGBoost from 0.896 to 0.898 and left the untuned SVM ahead. The comparison is reported as it came out.",
    },
    limitation:
      "The labels are generated, not laboratory measurements. These scores measure how well each model recovers the generator's own distributions and say nothing about whether real water is safe to drink.",
  },
  {
    repository: "DPS",
    title: "Traffic Accident Prediction API",
    premise:
      "A model behind a typed HTTP contract. What it establishes is that the path works, not that the forecast is right.",
    accent: "var(--accent-pipeline)",
    input:
      "A calendar year and month, validated at the boundary before anything reaches the model.",
    transform:
      "A FastAPI service loads a regression model trained on Munich traffic-accident records and returns a rounded predicted count.",
    evidence: {
      kind: "demonstrated",
      axis: "What the repository establishes",
      readouts: [
        { label: "Contract", value: "POST /deaths/ · typed request and response" },
        { label: "Artifact", value: "Model loaded relative to the app, not the caller's directory" },
        { label: "Documentation", value: "Interactive schema served at /docs" },
      ],
      caveat:
        "A working request-to-prediction path is a real engineering result and a small one. It is reported as such, with no accuracy figure attached to it.",
    },
    limitation:
      "An educational prototype, not a public-safety forecast. The tracked model and CSV come from a historical-data exercise and establish no accuracy for any future decision.",
  },
  {
    repository: "Weather-Data-Analytics-EDA",
    title: "Weather Analytics: Measuring a Generator",
    premise:
      "An exploratory analysis that is scrupulous about what it is exploring: its own synthetic dataset, and nothing else.",
    accent: "var(--accent-vision)",
    input:
      "Ten years of daily observations for six cities, produced by a fixed-seed generator with per-city climate parameters.",
    transform:
      "Wrangling, statistical summaries, seasonality and correlation, rendered as a set of figures.",
    evidence: {
      kind: "demonstrated",
      axis: "What the figures describe",
      readouts: [
        { label: "Coverage", value: "Six cities across five climate zones" },
        { label: "Recovered structure", value: "Monsoon, reversed seasons, continental range" },
        { label: "Source", value: "src/generate_data.py, fixed seed" },
      ],
      caveat:
        "The seasonality the analysis finds is the seasonality the generator was given. That is a check on the pipeline, not a finding about climate.",
    },
    limitation:
      "Not weather-station observations, climate evidence or forecasts. Nothing here supports an operational, scientific or policy decision.",
  },
  {
    repository: "Battery-SOC-Estimation-ML",
    title: "Battery State of Charge",
    premise:
      "A lithium-ion cell carries no fuel gauge. Six approaches to inferring one, gathered so they can be compared instead of trusted.",
    accent: "var(--accent-retrieval)",
    input:
      "Voltage, current, temperature and cycling history, from authorised NASA battery files or a deterministic synthetic generator.",
    transform:
      "SVR, random forest, XGBoost, LightGBM and an LSTM regress state of charge, alongside clustering for operating regimes and a genetic-optimised fuzzy estimator.",
    evidence: {
      kind: "withheld",
      reason:
        "Earlier score tables and degradation claims were removed on purpose. The repository has no versioned source split, run configuration, model artifact or metric report to substantiate them, and it names exactly what a meaningful benchmark would have to record: cell identifiers, data version, preprocessing parameters, temporal split, seed, dependency versions and evaluation artifacts.",
      absent: ["SOC accuracy", "Capacity fade", "State of health", "Remaining useful life"],
    },
    limitation:
      "No dataset, trained weights or tracked evaluation are included. It must not be used to operate a battery-management system or make a safety decision.",
  },
  {
    repository: "Insurance-Claims-Prediction-ML",
    title: "Insurance Claims: Calibration and Attribution",
    premise:
      "Predicting a claim is half the problem. The probabilities also have to mean something, and someone has to explain them.",
    accent: "var(--accent-retrieval)",
    input:
      "Policy and vehicle columns from a Kaggle claims dataset, fetched by the user under its own terms and never versioned here.",
    transform:
      "Encoders and scalers fit on training data only, then classifiers, Platt or isotonic calibration, cost-sensitive threshold selection and SHAP attribution.",
    evidence: {
      kind: "withheld",
      reason:
        "The repository contains source and notebooks only. It versions no data, no split, no trained model, no calibration output and no evaluation report, so there is nothing to substantiate a number with.",
      absent: ["Accuracy", "AUC", "Calibration improvement", "Business value"],
    },
    limitation:
      "The example cost matrix is illustrative and is not a validated business policy. Nothing here may be used to make automated decisions about people or policies.",
  },
  {
    repository: "NLP-Text-Classification-Transformers",
    title: "Classical Baselines Against DistilBERT",
    premise:
      "Two tracks on one task, evaluated the same way, so the comparison is worth something when someone runs it.",
    accent: "var(--accent-retrieval)",
    input:
      "AG News headlines fetched at run time. If access fails the pipeline stops rather than quietly evaluating template-generated text.",
    transform:
      "TF-IDF with logistic regression, linear SVM or random forest on one side; DistilBERT fine-tuned through the Hugging Face Trainer on the other.",
    evidence: {
      kind: "withheld",
      reason:
        "Data, trained models, checkpoints, metrics, plots and run metadata are all untracked, so the repository declines to state how the two tracks compared.",
      absent: ["Accuracy", "F1", "Latency", "Baseline-versus-transformer comparison"],
    },
    limitation:
      "The offline synthetic fixture exists for development only. Its results are not comparable to AG News or to real news classification.",
  },
  {
    repository: "Neural-Network-Identifiability-Analysis",
    title: "Can Two Networks Hide the Same Function?",
    premise:
      "Identical weights always behave identically. The interesting question runs the other way, and it is the subject of a TUM mathematics seminar.",
    accent: "var(--accent-retrieval)",
    input:
      "Small fully connected networks with tanh, sigmoid or ReLU activations, constructed to be related by hidden-unit permutations and sign flips.",
    transform:
      "Numerical diagnostics look for exact and near-exact clone pairs, sampled non-degeneracy and parameter alignment, then test proposed symmetry-breaking regularisers.",
    evidence: {
      kind: "withheld",
      reason:
        "The checks are finite numerical diagnostics on sampled inputs. They can expose a symmetry; they cannot prove global functional equivalence or satisfy the hypotheses of a published identifiability theorem, and the repository versions no experiment configuration or trained model.",
      absent: ["Established identifiability", "Global functional equivalence", "Empirical benchmark"],
    },
    limitation:
      "The activation labels describe the assumptions this prototype considers. The formal statements live in the cited papers, not here.",
  },
  {
    repository: "Supply-Chain-Analytics-Dashboard",
    title: "Supply Chain KPIs and Inventory Classics",
    premise:
      "Demand forecasting, supplier dependability and how much stock to hold, in one dashboard, with each proxy named as a proxy.",
    accent: "var(--accent-retrieval)",
    input:
      "Order records from the DataCo dataset, downloaded under its own terms and deliberately ignored by version control.",
    transform:
      "Cleaning and KPIs, a comparison of demand-forecasting baselines, and the classical EOQ, safety-stock and reorder-point calculations, served through a Plotly Dash app.",
    evidence: {
      kind: "withheld",
      reason:
        "No dataset, processed data, forecast artifact or verified business metric is versioned. The source carries no supplier identifiers and no defect measurements either, so supplier analysis groups departments as an explicit proxy and derives its quality-like score from late delivery.",
      absent: ["Fill rate", "On-time delivery", "Forecast accuracy", "Supplier quality"],
    },
    limitation:
      "The inventory values are illustrative outputs whose assumptions must be validated before they touch a real operation, and the proxy must never be read as a supplier-quality assessment.",
  },
];

/** Repositories that publish a tracked number, and those that decline to. */
export function evidenceSplit() {
  const measured = strongWork.filter((work) => work.evidence.kind === "measured");
  const demonstrated = strongWork.filter((work) => work.evidence.kind === "demonstrated");
  const withheld = strongWork.filter((work) => work.evidence.kind === "withheld");
  return { measured, demonstrated, withheld };
}
