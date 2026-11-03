import type { ProjectDiagram } from "./types";

/**
 * A loop, drawn as a loop.
 *
 * `src/mlplatform/` is the whole system: `data.py` pins the dataset, `train.py` fits the
 * challenger, `registry.py` owns the alias the service loads, `service.py` serves, and `drift.py`
 * decides. `airflow/dags/demand_platform.py` is what runs it on a schedule.
 *
 * Two things are drawn deliberately against the obvious version of this picture.
 *
 * The monitors sit *downstream of the service*, not beside the training data, because that is
 * where the window they read comes from - this is a loop, and drawing it as a pipeline with a
 * monitoring box bolted on the side would hide that the thing being monitored is production
 * traffic. The retrain decision therefore returns to the challenger gate rather than terminating.
 *
 * The two drift signals are separate boxes because they disagree, and the project is about which
 * one you would have built first. The obvious monitor watches the inputs; here the inputs barely
 * move and the thing being predicted moves enormously. The comparison window is a year earlier
 * rather than a few weeks earlier, so a seasonal swing is not read as drift.
 *
 * Deployment is the alias move. Nothing is copied to a server: `registry.py` repoints what the
 * service already loads, which is why the alias is a store in the path rather than a final step.
 */
export const driftPlatformDiagram: ProjectDiagram = {
  slug: "drift-aware-platform",
  title: "A retraining loop that watches what it predicts",
  caption:
    "The monitors read production traffic, so they sit after the service rather than beside the data. The two signals are separate because they disagree - the inputs barely move and the target moves a long way past its threshold.",
  accent: "var(--accent-systems)",
  nodes: [
    {
      id: "dataset",
      label: "Pinned dataset",
      kind: "source",
      col: 0,
      row: 1,
      stages: [0],
      note: "Fixed by SHA-256, so a run can name the data it used.",
    },
    {
      id: "challenger",
      label: "Challenger gate",
      kind: "gate",
      col: 1,
      row: 1,
      stages: [1],
      tools: ["scikit-learn", "MLflow"],
      note: "Must beat the champion re-scored on the same window. Offered itself, it is refused.",
    },
    {
      id: "alias",
      label: "Champion alias",
      kind: "store",
      col: 2,
      row: 1,
      stages: [4],
      tools: ["MLflow"],
      note: "Moving this pointer is the deployment. Nothing is copied anywhere.",
    },
    {
      id: "service",
      label: "Prediction service",
      kind: "sink",
      col: 3,
      row: 1,
      tools: ["FastAPI"],
      note: "Loads whatever the alias currently names.",
    },
    {
      id: "featuredrift",
      label: "Feature drift",
      kind: "process",
      col: 4,
      row: 0,
      stages: [2],
      tools: ["Evidently"],
      note: "Serving window against the same seasons a year earlier.",
    },
    {
      id: "targetdrift",
      label: "Target drift",
      kind: "process",
      col: 4,
      row: 2,
      stages: [2],
      note: "What is being predicted, which moves far more than the inputs.",
    },
    {
      id: "decide",
      label: "Retrain decision",
      kind: "gate",
      col: 5,
      row: 1,
      stages: [3],
      tools: ["Airflow"],
      note: "Either signal crossing its own threshold is enough.",
    },
  ],
  edges: [
    { from: "dataset", to: "challenger", kind: "data" },
    { from: "challenger", to: "alias", kind: "data", label: "clears the gate" },
    { from: "alias", to: "service", kind: "control", label: "loaded" },
    { from: "service", to: "featuredrift", kind: "data", label: "serving window" },
    { from: "service", to: "targetdrift", kind: "data" },
    { from: "featuredrift", to: "decide", kind: "control" },
    { from: "targetdrift", to: "decide", kind: "control" },
    { from: "decide", to: "challenger", kind: "feedback", label: "retrain on either signal" },
  ],
};
