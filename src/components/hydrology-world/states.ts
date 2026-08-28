import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * Two ways to disturb one calibrated event, and only one of them matters.
 *
 * The seminar is not a forecasting project and this world does not pretend it is. There is no
 * issue point and no future: there is a single observed high-flow event, a model calibrated
 * against it to NSE 0.908, and then the same question asked twice. Perturb the rain going in,
 * and the answer barely moves. Perturb the water level the discharge was *measured* from, and
 * the calibration collapses - and cannot be recovered by recalibrating.
 *
 * So the many trajectories here are not possible futures. They are 2,000 possible versions of
 * the same past, which is the more uncomfortable idea and the one the repository actually
 * demonstrates. The camera runs the identical shot twice, once per experiment, because the
 * comparison between those two shots is the entire finding.
 */

export type HydrologyKey =
  | "event"
  | "calibrated"
  | "rain"
  | "rainVerdict"
  | "stage"
  | "curve"
  | "diverge"
  | "envelope"
  | "verdict"
  | "recalibrate"
  | "standpoint"
  | "limits";

export const STATES: readonly WorldState<HydrologyKey>[] = [
  {
    key: "event",
    from: 0.0,
    to: 0.07,
    label: "One event",
    caption: "A short, rainfall-dominated high-flow event, at an hourly step.",
  },
  {
    key: "calibrated",
    from: 0.07,
    to: 0.15,
    label: "Calibrated",
    caption: "Eighteen parameters, 75,480 model evaluations, NSE 0.908. The fit is not the problem.",
  },
  {
    key: "rain",
    from: 0.15,
    to: 0.24,
    label: "Perturb the rain",
    caption: "2,000 precipitation series, each scaled by noise. The usual suspect.",
  },
  {
    key: "rainVerdict",
    from: 0.24,
    to: 0.33,
    label: "Almost nothing happens",
    caption: "834 of the 2,000 came out better than the reference. By luck.",
  },
  {
    key: "stage",
    from: 0.33,
    to: 0.41,
    label: "Now perturb the ruler",
    caption: "Leave the rain alone. Move the measured water level by 25 cm either way.",
  },
  {
    key: "curve",
    from: 0.41,
    to: 0.51,
    label: "Why centimetres matter",
    caption: "Discharge is never measured. It is inferred from stage through a fitted curve.",
  },
  {
    key: "diverge",
    from: 0.51,
    to: 0.6,
    label: "The same 2,000, again",
    caption: "Identical apparatus, identical count. Watch the peak.",
  },
  {
    key: "envelope",
    from: 0.6,
    to: 0.69,
    label: "The envelope",
    caption: "Not drawn on. Left behind by trajectories that no longer agree.",
  },
  {
    key: "verdict",
    from: 0.69,
    to: 0.78,
    label: "Zero",
    caption: "Not one of the 2,000 beat the reference. Not one.",
  },
  {
    key: "recalibrate",
    from: 0.78,
    to: 0.86,
    label: "Recalibration cannot save it",
    caption: "Refitting every series recovers 5.76% of the loss, and still never wins.",
  },
  {
    key: "standpoint",
    from: 0.86,
    to: 0.93,
    label: "Which parameter matters?",
    caption: "Depends where you stand. Near the optimum and across the space disagree.",
  },
  {
    key: "limits",
    from: 0.93,
    to: 1.0,
    label: "What this does not show",
    caption: "Group coursework, one catchment, one event, and inputs that cannot be shared.",
  },
];

const readers = choreograph(STATES);
export const at = readers.at;
export const active = readers.active;

/**
 * Camera keyframes.
 *
 * `swing` is the angle away from side-on. It starts at zero, and it matters that it does: at zero
 * this reads as an ordinary hydrograph on a page, which is how a reader already expects to meet a
 * time series. The rain experiment stays there deliberately, because a spread you cannot see is
 * the honest picture of a spread that is not there.
 *
 * The rotation only arrives with the stage experiment, where there is finally something in depth
 * worth turning to look at. That turn is the argument: the familiar flat plot was hiding a volume.
 */
export const SHOTS: Record<
  HydrologyKey,
  { swing: number; height: number; distance: number; look: number }
> = {
  event: { swing: 0.0, height: 0.55, distance: 11.4, look: 0.0 },
  calibrated: { swing: 0.0, height: 0.5, distance: 10.2, look: 0.0 },
  rain: { swing: 0.04, height: 0.6, distance: 9.8, look: 0.05 },
  rainVerdict: { swing: 0.0, height: 0.45, distance: 8.6, look: 0.05 },
  stage: { swing: 0.02, height: 0.5, distance: 9.4, look: 0.05 },
  curve: { swing: 0.05, height: 1.05, distance: 9.8, look: 0.42 },
  diverge: { swing: 0.58, height: 1.35, distance: 10.2, look: 0.25 },
  envelope: { swing: 0.26, height: 0.8, distance: 9.4, look: 0.12 },
  verdict: { swing: 0.05, height: 0.6, distance: 9.0, look: 0.08 },
  recalibrate: { swing: 0.2, height: 0.75, distance: 8.8, look: 0.1 },
  standpoint: { swing: 0.35, height: 1.25, distance: 9.2, look: 0.25 },
  limits: { swing: 0.1, height: 0.9, distance: 11.0, look: 0.1 },
};
