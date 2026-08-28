"""
Generate src/content/hydrology-world.ts from verified seminar evidence.

Every metric below is transcribed from a machine-readable artifact in
mzquadri/UQ-Hydrology-Seminar-TUM, and each one carries the file it came from. The rating
curve is not transcribed at all - it is evaluated here from the coefficients the seminar
fitted, so the envelope the scene draws is the repository's own function, not a shape that
was drawn to look right.

Run:  python tools/gen-hydrology-world.py
"""

import math
import io

REPO = "https://github.com/mzquadri/UQ-Hydrology-Seminar-TUM"
COMMIT = "7a5cf09a800fe66853e125160dd429d331237e82"

# ---------------------------------------------------------------------------
# Verified facts. The source file for each is carried into the module so a
# reader can check any claim against the artifact it came from.
# ---------------------------------------------------------------------------

A1 = "results/assignment1_finial_gen600_atol-3/final_debug_summary.txt"
A1T = "results/assignment1_finial_gen600_atol-3/turned_off_processes/NSE_values_tunroff.txt"
A3 = "results/assignment3/Assignment3_Results_full_range_nse/sobol_summary_corrected.txt"
A3N = "results/assignment3/Assignment3_narrow_NSE/sobol_summary_corrected.txt"
A4 = "results/assignment4_gen600/uncertainty_analysis_summary.txt"
A5 = "results/assignment5/uncertainty_analysis_summary.txt"
A5F = "results/assignment5/results_fiting_curve.txt"

# Assignment 1 - the calibrated baseline.
CAL = dict(nse=0.9076082110404968, ofv=0.09239178895950317, evals=75480,
           generations=600, popsize=10, strategy="best1bin", parameters=18)

# The reference both uncertainty studies compare against.
REF_OFV = 0.092285
REF_NSE = 0.907715

# Assignment 4 - precipitation (input) uncertainty.
IN = dict(series=2000, sigma=0.083, clip_lo=0.75, clip_hi=1.25, seed=42,
          ofv_mean=0.092702, ofv_std=0.001780, ofv_p5=0.089700, ofv_p95=0.095688,
          nse_mean=0.907298, better=834, recal_ofv_mean=0.092483,
          recal_nse_mean=0.907517, recal_better=933, recal_improved=1908, marc=6.62)

# Assignment 5 - rating-curve (output) uncertainty.
OUT = dict(series=2000, low=-25, high=25, seed=42,
           ofv_mean=0.240774, ofv_std=0.010241, ofv_p5=0.223100, ofv_p95=0.257444,
           nse_mean=0.759226, better=0, recal_ofv_mean=0.232215,
           recal_nse_mean=0.767785, recal_better=0, recal_improved=1513,
           marc=15.54, compensation=5.76, unperturbed_nse=0.899967)

# The fitted stage-discharge rating curve (Assignment 5).
RC = dict(a1=1.22871059e-04, h1=25.033145, b1=2.1538,
          a2=5.83762819e-06, h2=315.640655, b2=3.3829,
          h0=450.0, k=6.8602, r2=0.998705, rmse=0.920025,
          single_r2=0.883143, single_rmse=8.740415)


def rating_curve(h):
    """Q(h), exactly as Ass_05_Output_Uncertain_Group_B.py evaluates it."""
    a = h - RC["h2"]
    q2 = RC["a2"] * (-(abs(a) ** RC["b2"])) if a < 0 else RC["a2"] * (a ** RC["b2"])
    q1 = RC["a1"] * max(0.0, h - RC["h1"]) ** RC["b1"]
    w = 1.0 / (1.0 + math.exp(-(h - RC["h0"]) / RC["k"]))
    return (1 - w) * q1 + w * q2


# ---------------------------------------------------------------------------
# Derived series. Computed, not typed.
# ---------------------------------------------------------------------------

# The curve is shown over the range the event itself occupies, widened by the
# perturbation, rather than over the whole fitted domain. Below about 260 cm the
# power law is so flat against the axis that it contributes nothing but empty
# frame, and the transition at 450 cm - the thing worth looking at - ends up
# squeezed into a corner.
H_LO, H_HI, H_N = 260.0, 565.0, 96

curve = []
for i in range(H_N):
    h = H_LO + (H_HI - H_LO) * i / (H_N - 1)
    curve.append((h, rating_curve(h), rating_curve(h + OUT["low"]),
                  rating_curve(h + OUT["high"])))

qmax = max(c[3] for c in curve)

# The schematic event. Shape only: a short rainfall-dominated high-flow event,
# fast rise and slow recession, expressed in STAGE. The course forcing series is
# not redistributable, so no observed series is reproduced. What is real is what
# happens to that shape: every point goes through the fitted curve above, and the
# band is the same curve evaluated 25 cm either side.
#
# The stage bounds are chosen so the event crosses the sigmoid transition at 450 cm,
# which is where the argument lives - below it the curve is mild, above it steep. A
# lower baseflow is equally plausible hydrologically but produces a 95:1 discharge
# range that renders as a needle with a flat line either side, and a figure nobody
# can read is not a more honest figure.
BASE_H, PEAK_H = 300.0, 525.0
T_N = 120
PEAK_AT = 0.34

event = []
for i in range(T_N):
    t = i / (T_N - 1)
    if t <= PEAK_AT:
        shape = (t / PEAK_AT) ** 1.9
    else:
        shape = math.exp(-2.3 * (t - PEAK_AT) / (1 - PEAK_AT))
    h = BASE_H + (PEAK_H - BASE_H) * shape
    event.append((t, h, rating_curve(h), rating_curve(h + OUT["low"]),
                  rating_curve(h + OUT["high"])))

# What each experiment cost, as the repository measures it: mean OFV loss against
# the same reference calibration.
loss_in = IN["ofv_mean"] - REF_OFV
loss_out = OUT["ofv_mean"] - REF_OFV
ratio = loss_out / loss_in


def exponent(h, d=1.0):
    """Local d(log Q)/d(log h) - the mechanism that makes centimetres cost more at the peak."""
    q0, q1 = rating_curve(h - d), rating_curve(h + d)
    if q0 <= 0 or q1 <= 0:
        return 0.0
    return (math.log(q1) - math.log(q0)) / (math.log(h + d) - math.log(h - d))


def band(h):
    """Absolute discharge width of a fixed 25 cm stage error at stage h."""
    return rating_curve(h + OUT["high"]) - rating_curve(h + OUT["low"])


exp_base, exp_peak = exponent(BASE_H), exponent(PEAK_H)
band_base, band_peak = band(BASE_H), band(PEAK_H)
band_ratio = band_peak / band_base


def num(v, places=4):
    s = ("%." + str(places) + "f") % v
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return s if s not in ("", "-") else "0"


L = []
w = L.append
w("/*")
w(" * GENERATED by tools/gen-hydrology-world.py - do not edit by hand.")
w(" *")
w(" * Uncertainty Quantification in Hydrology, TUM project seminar, Group B.")
w(" * " + REPO)
w(" * commit " + COMMIT)
w(" *")
w(" * Every metric here is transcribed from a machine-readable artifact in that repository and")
w(" * carries the file it came from. The rating curve and both series are evaluated from the")
w(" * coefficients the seminar fitted, so the envelope in the scene is the project's own function.")
w(" */")
w("")
w("export const project = {")
w('  repository: "' + REPO + '",')
w('  commit: "' + COMMIT + '",')
w('  model: "HBV001a",')
w('  modelKind: "Lumped conceptual rainfall-runoff",')
w('  timestep: "Hourly",')
w("  parameters: " + str(CAL["parameters"]) + ",")
w('  forcing: "Temperature, precipitation, potential evapotranspiration",')
w('  event: "A short, rainfall-dominated high-flow event",')
w('  institution: "Chair of Hydrology and River Basin Management, TUM",')
w('  team: "Group B, three contributors",')
w("} as const;")
w("")
w("/** Assignment 1: the calibrated baseline everything else is measured against. */")
w("export const calibration = {")
w('  method: "Differential Evolution",')
w('  strategy: "' + CAL["strategy"] + '",')
w("  generations: " + str(CAL["generations"]) + ",")
w("  popsize: " + str(CAL["popsize"]) + ",")
w("  evaluations: " + str(CAL["evals"]) + ",")
w("  nse: " + num(CAL["nse"]) + ",")
w("  ofv: " + num(CAL["ofv"], 6) + ",")
w("  referenceNse: " + num(REF_NSE, 6) + ",")
w("  referenceOfv: " + num(REF_OFV, 6) + ",")
w('  source: "' + A1 + '",')
w("} as const;")
w("")
w("/** Assignment 1: which processes the event actually needs, established by removing them. */")
w("export const turnoff = [")
for label, key, v in [("Nothing removed", "base", 0.9076084494590759),
                      ("Snow module off", "snow", 0.4959281086921692),
                      ("Lower reservoir off", "lower", -0.7538880109786987),
                      ("Groundwater off", "groundwater", 0.9076258540153503)]:
    w('  { key: "' + key + '", label: "' + label + '", nse: ' + num(v) + " },")
w("] as const;")
w('export const turnoffSource = "' + A1T + '" as const;')
w("")
w("/** The stage-discharge rating curve the seminar fitted, and the single power law it rejected. */")
w("export const ratingCurve = {")
w('  form: "Two power laws blended by a sigmoid",')
w("  q1: { a: " + ("%.8e" % RC["a1"]) + ", h0: " + num(RC["h1"], 6) + ", b: " + num(RC["b1"], 4) + " },")
w("  q2: { a: " + ("%.8e" % RC["a2"]) + ", h0: " + num(RC["h2"], 6) + ", b: " + num(RC["b2"], 4) + " },")
w("  transition: { centre: " + num(RC["h0"], 1) + ", width: " + num(RC["k"], 4) + " },")
w("  r2: " + num(RC["r2"], 6) + ",")
w("  rmse: " + num(RC["rmse"], 6) + ",")
w("  singleR2: " + num(RC["single_r2"], 6) + ",")
w("  singleRmse: " + num(RC["single_rmse"], 6) + ",")
w('  source: "' + A5F + '",')
w("} as const;")
w("")
w("/** Assignment 4: perturb the rain. */")
w("export const inputExperiment = {")
w('  label: "Precipitation",')
w("  series: " + str(IN["series"]) + ",")
w('  perturbation: "C ~ N(1.0, ' + num(IN["sigma"], 3) + '), multiplicative, clipped to ['
  + num(IN["clip_lo"], 2) + ", " + num(IN["clip_hi"], 2) + ']",')
w("  seed: " + str(IN["seed"]) + ",")
w("  ofvMean: " + num(IN["ofv_mean"], 6) + ",")
w("  ofvStd: " + num(IN["ofv_std"], 6) + ",")
w("  ofvP5: " + num(IN["ofv_p5"], 6) + ",")
w("  ofvP95: " + num(IN["ofv_p95"], 6) + ",")
w("  nseMean: " + num(IN["nse_mean"], 6) + ",")
w("  betterByChance: " + str(IN["better"]) + ",")
w("  recalOfvMean: " + num(IN["recal_ofv_mean"], 6) + ",")
w("  recalNseMean: " + num(IN["recal_nse_mean"], 6) + ",")
w("  recalBetter: " + str(IN["recal_better"]) + ",")
w("  recalImproved: " + str(IN["recal_improved"]) + ",")
w("  meanChangePct: " + num(IN["marc"], 2) + ",")
w("  meanLoss: " + num(loss_in, 6) + ",")
w('  source: "' + A4 + '",')
w("} as const;")
w("")
w("/** Assignment 5: leave the rain alone and perturb the ruler instead. */")
w("export const outputExperiment = {")
w('  label: "Water level",')
w("  series: " + str(OUT["series"]) + ",")
w('  perturbation: "Additive, uniform on [' + str(OUT["low"]) + ", " + str(OUT["high"])
  + '] cm, drawn per timestep",')
w("  seed: " + str(OUT["seed"]) + ",")
w("  ofvMean: " + num(OUT["ofv_mean"], 6) + ",")
w("  ofvStd: " + num(OUT["ofv_std"], 6) + ",")
w("  ofvP5: " + num(OUT["ofv_p5"], 6) + ",")
w("  ofvP95: " + num(OUT["ofv_p95"], 6) + ",")
w("  nseMean: " + num(OUT["nse_mean"], 6) + ",")
w("  betterByChance: " + str(OUT["better"]) + ",")
w("  recalOfvMean: " + num(OUT["recal_ofv_mean"], 6) + ",")
w("  recalNseMean: " + num(OUT["recal_nse_mean"], 6) + ",")
w("  recalBetter: " + str(OUT["recal_better"]) + ",")
w("  recalImproved: " + str(OUT["recal_improved"]) + ",")
w("  compensationPct: " + num(OUT["compensation"], 2) + ",")
w("  meanChangePct: " + num(OUT["marc"], 2) + ",")
w("  meanLoss: " + num(loss_out, 6) + ",")
w("  unperturbedNse: " + num(OUT["unperturbed_nse"], 6) + ",")
w('  source: "' + A5 + '",')
w("} as const;")
w("")
w("/** The comparison the seminar exists to make. Computed from the two means above. */")
w("export const verdict = {")
w("  lossRatio: " + num(ratio, 1) + ",")
w("  exponentAtBase: " + num(exp_base, 2) + ",")
w("  exponentAtPeak: " + num(exp_peak, 2) + ",")
w("  bandAtBase: " + num(band_base, 3) + ",")
w("  bandAtPeak: " + num(band_peak, 2) + ",")
w("  bandRatio: " + num(band_ratio, 0) + ",")
w("  baseStage: " + num(BASE_H, 1) + ",")
w("  peakStage: " + num(PEAK_H, 1) + ",")
w("} as const;")
w("")
w("/** Assignments 2 and 3: which parameter matters depends on where you stand. */")
w("export const sensitivity = {")
w("  local: {")
w('    method: "One-at-a-time, each parameter swept -30% to +30% in 120 steps",')
w('    top: "sl0_fcy",')
w('    topLabel: "Field capacity",')
w("  },")
w("  narrow: {")
w('    method: "Sobol indices, Saltelli sampling, narrow range, NSE",')
w('    top: "sl0_fcy",')
w('    topLabel: "Field capacity",')
w("    totalIndex: " + num(0.496113) + ",")
w("    variance: " + num(0.001941, 6) + ",")
w("    sumTotal: " + num(1.345147) + ",")
w('    source: "' + A3N + '",')
w("  },")
w("  full: {")
w('    method: "Sobol indices, Saltelli sampling, full range, NSE",')
w('    top: "lrr_dre",')
w('    topLabel: "Lower reservoir drainage ratio",')
w("    totalIndex: " + num(0.594678) + ",")
w("    variance: " + num(0.462608, 6) + ",")
w("    sumTotal: " + num(1.856004) + ",")
w("    interaction: " + num(1.380414) + ",")
w('    source: "' + A3 + '",')
w("  },")
w("} as const;")
w("")
w("/** The fitted curve across the stage domain, with the band 25 cm either side. */")
w("export const curve = [")
for h, q, lo, hi in curve:
    w("  [" + num(h, 1) + ", " + num(q, 4) + ", " + num(lo, 4) + ", " + num(hi, 4) + "],")
w("] as const;")
w("export const curveMax = " + num(qmax, 4) + " as const;")
w("")
w("/**")
w(" * The event, as stage and as discharge.")
w(" *")
w(" * [t, stage_cm, discharge, discharge_at_minus_25cm, discharge_at_plus_25cm]")
w(" *")
w(" * The SHAPE is schematic - fast rise, slow recession, one peak - because the course forcing")
w(" * series is not redistributable and no observed series is reproduced here. Everything done TO")
w(" * that shape is real: each stage is pushed through the fitted rating curve above, and the band")
w(" * is that same curve evaluated 25 cm either side. The band widens at the peak because the")
w(" * curve steepens there, not because it was drawn that way.")
w(" */")
w("export const event = [")
for t, h, q, lo, hi in event:
    w("  [" + num(t, 4) + ", " + num(h, 2) + ", " + num(q, 4) + ", " + num(lo, 4)
      + ", " + num(hi, 4) + "],")
w("] as const;")
w("")
w("export const limits = [")
LIMITS = [
    ("Group coursework",
     "Three contributors across five assignments; individual ownership of any single result is not claimed."),
    ("Course inputs are not redistributable",
     "The forcing series, catchment area and the hmg package holding HBV001A are course-provided. The scientific runs cannot be reproduced from the public repository alone."),
    ("The event shape here is schematic",
     "No observed hydrograph is reproduced. The rating curve, the perturbation and every metric are the repository's own; the trajectory they act on is a placeholder."),
    ("The README and the code disagree",
     "The README describes a plus/minus 15 cm water-level perturbation. The module bounds and the results file both record plus/minus 25 cm; 15 survives only as a stale default argument. The figures here follow the code."),
    ("Random error only",
     "The precipitation study perturbs without systematic bias, which its own summary notes is the more consequential case and was not tested."),
    ("One event, one catchment",
     "A single short high-flow event. Nothing here establishes that the same ordering holds for longer records or other catchments."),
]
for label, note in LIMITS:
    w('  { label: "' + label + '", note: "' + note + '" },')
w("] as const;")
w("")

io.open("src/content/hydrology-world.ts", "w", encoding="utf-8", newline="\n").write("\n".join(L))

print("curve points   %d" % len(curve))
print("event points   %d" % len(event))
print("loss ratio     %.1fx  (rain %.6f -> stage %.6f)" % (ratio, loss_in, loss_out))
print("exponent       %.2f at %.0f cm  ->  %.2f at %.0f cm" % (exp_base, BASE_H, exp_peak, PEAK_H))
print("25 cm band     %.3f at base  ->  %.2f at peak  (%.0fx wider)" % (band_base, band_peak, band_ratio))


# ---------------------------------------------------------------------------
# A second, much smaller module for the homepage chapter.
#
# The chapter draws a thumbnail of the same comparison and needs 40 points and four
# numbers. Importing the full world module for that pulled the 96-point rating curve and
# every metric into the homepage bundle - about 22 KB for a figure the size of a postage
# stamp. This keeps the homepage paying only for what it draws.
# ---------------------------------------------------------------------------

CH = []
c = CH.append
c("/*")
c(" * GENERATED by tools/gen-hydrology-world.py - do not edit by hand.")
c(" *")
c(" * The homepage chapter's share of the hydrology evidence, and nothing else. See")
c(" * src/content/hydrology-world.ts for the full set and for where each number comes from.")
c(" */")
c("")
c("/** [t, discharge, discharge_at_minus_25cm, discharge_at_plus_25cm], every third step. */")
c("export const chapterEvent = [")
for _i, (_t, _h, _q, _lo, _hi) in enumerate(event):
    if _i % 3 == 0:
        c("  [" + num(_t, 4) + ", " + num(_q, 4) + ", " + num(_lo, 4) + ", " + num(_hi, 4) + "],")
c("] as const;")
c("")
c("export const chapterMaxQ = " + num(max(p[4] for p in event), 4) + " as const;")
c("")
c("export const chapter = {")
c("  series: " + str(IN["series"]) + ",")
c("  rainBetter: " + str(IN["better"]) + ",")
c("  stageBetter: " + str(OUT["better"]) + ",")
c("  rainRatio: " + num(loss_in / loss_out, 8) + ",")
c("  lossRatio: " + num(ratio, 1) + ",")
c("} as const;")
c("")

NL = chr(10)
io.open("src/content/hydrology-chapter.ts", "w", encoding="utf-8", newline=NL).write(NL.join(CH))
print("chapter points %d" % len([1 for _i in range(len(event)) if _i % 3 == 0]))
