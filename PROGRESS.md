# Work in progress: every public repository gets a page

Started 23 October 2026. This file is the resume point: if the session stops,
read it and continue from the first row that is not `done`.

## The rule this work follows

A page may say only what the repository's code and README actually show. No
invented metric, user, result or adoption. Where a repository's own README
qualifies a number, the page carries the qualification in the same breath -
that is the site's existing "interval, not the point" device, and it is why
several of these projects are worth a page at all: most of them are honest
negative results.

Motion is scroll-driven or pointer-driven only, never ambient, and every scene
keeps its reduced-motion fallback as the informative final frame.

## Order of work

One project at a time, fully finished before the next: read the repository,
build the page, check it at 390 / 768 / 1440 in light and dark and with
reduced motion, commit, push, deploy, verify live, then move on.

| # | Repository | Slug | State |
|---|---|---|---|
| 1 | `drift-aware-ml-platform` | `drift-aware-platform` | **done** |
| 2 | `munich-accident-forecasting` | `munich-accident-forecasting` | **done** |
| 3 | `bm25-rrf-java` | `bm25-rrf-java` | **done** |
| 4 | `r-ggplot2-eurostat-report` | `eurostat-modal-split` | **done** |
| 5 | `tf-keras-vs-pytorch-cifar10` | `keras-pytorch-parity` | **done** |
| 6 | `audi-release-tracking-case-study` | `audi-release-tracking` | next |
| 7 | `Deep-Learning-Flood-Prediction-LSTM` | `flood-lstm` | todo |
| 8 | `Neural-Network-Identifiability-Analysis` | `nn-identifiability` | todo |
| 9 | `Battery-SOC-Estimation-ML` | `battery-soc` | todo |
| 10 | `Insurance-Claims-Prediction-ML` | `insurance-claims-threshold` | todo |
| 11 | `ML-Water-Quality-Classification` | `water-quality` | todo |
| 12 | `Weather-Data-Analytics-EDA` | `weather-eda` | todo |
| 13 | `Supply-Chain-Analytics-Dashboard` | `supply-chain-analytics` | todo |
| 14 | `Statistical-Learning-Transportation` | `statistical-learning-transport` | todo |
| 15 | `NLP-Text-Classification-Transformers` | `ag-news-classification` | todo |
| 16 | `jobhunter` | `jobhunter` | todo |
| 17 | `ai-engineering-portfolio` | `ai-engineering-portfolio` | todo |

Slugs are provisional until the page is written; the row is updated with the
one that shipped.

## Two motion defects found while building the first page, and fixed

Both were site-wide, and between them they are why every project scene looked
static at every width. Found by measuring, not by reading the CSS.

**1. The scene bindings named the wrong ancestor.** `scenes.css` staged every
scene element with `.case-stage .scene-*`, and `CaseStory` renders the scene
inside `.case-story-body`. The descendant combinator matched nothing, so all
fifty selectors were inert and every staged element computed
`animation-name: none`. Both hosts are now named.

**2. Every range was `contain`, and the subject is taller than the viewport.**
`contain` is only defined while the timeline's subject fits inside the
scrollport and collapses to zero length when it does not. `.case-story-body`
measures 1.28x the viewport at 768, 1.43x at 390 and 1.87x at 1440, so the
range was zero-length everywhere and progress was pinned at 0. `at()` now
emits `cover`, which is well defined at any subject size.

**3. A figure staged on its own timeline stalls where the stage is sticky.** Binding
each figure to its own `view-timeline` looked like the robust fix and is wrong
at desktop: `.case-story-stage` is sticky above 1000px, and a sticky element
stops moving relative to the viewport once it pins, so its own view progress
freezes exactly while the reader is looking at it. The figures stage against
the chapter track, whose subject keeps scrolling.

**What that leaves.** `--range` is a position in the *chapter's* travel, and the
chapter's cover begins when the story body first touches the viewport, well
before the figure is on screen. The new figures start at 26% rather than 8% for
that reason. Where a figure is above the fold at load, no scroll window remains
and it renders complete, which is the site's own contract rather than a defect:
demanding motion there would be demanding an arrival animation.

Still open, for Phase 1 rather than now:

- `mlops-reference-pipeline` stages with the separate `entering()` helper,
  which emits `entry` ranges; it has not been re-measured since the fix.
- `transport-uq` reports static only because the probe reads its flat SVG,
  which is `opacity: 0` behind the WebGL canvas that replaced it. Not a defect.

## After the new pages

| Phase | What | State |
|---|---|---|
| 1 | Bring every existing work page to the same motion standard | todo |
| 2 | Full review: 390/768/1440, light/dark, reduced motion, links, copy, Lighthouse, meta, sitemap, 404 | todo |

## The ecosystem index was missing four public repositories

`ecosystemSnapshot.method` says the index is a manual audit of every public
repository on the profile. Four were absent: `bm25-rrf-java`,
`r-ggplot2-eurostat-report`, `tf-keras-vs-pytorch-cifar10` and
`audi-release-tracking-case-study`. Only the last is still absent. Each is added as its page is built, which
is also what the content test requires: a case study whose repository is not
in the index fails the build.

## Already covered, no work needed

| Repository | Where it already lives |
|---|---|
| `CNN-Image-Classification-PyTorch` | `/work/cifar10-cnn` |
| `UQ-Hydrology-Seminar-TUM` | `/work/hydrology-uq` |
| `insureassist-rag-mlops` | `/work/insureassist-rag` |
| `mcp-policy-gateway` | `/work/mcp-policy-gateway` |
| `MLOps-End-to-End-Pipeline` | `/work/mlops-reference-pipeline` |
| `Time-Series-Streamflow-Forecasting` | `/work/streamflow-forecasting` |
| `ml_surrogates_for_agent_based_transport_models` | `/work/transport-uq` |
| `medico` | `/work/medico` |

## Skipped, and why

| Repository | Reason |
|---|---|
| `colpali` | Fork of `illuin-tech/colpali`, 0 commits ahead - no changes of mine |
| `express` | Fork of `expressjs/express`, 0 ahead and 92 behind - no changes of mine |
| `ZQ` | This website |
| `mzquadri` | The GitHub profile README, not a project |
| `portfolio-work` | Private - a page would link to a 404 |
| `ml-surrogates-thesis-backup` | Private |
| `nyc-tlc-julia` | Private |
| `career-data-lab` | Private |
| `embedded-ai-edgevision-lab` | Private |
| `snake-water-gun` | Private |
| `complete-python-warmup` | Private |
| `git-python-basics` | Private |
| `iftaar-invitation-2026` | Private, and not a project |

Private repositories are skipped because the page would publish a link that
answers 404 for every reader. If any of them is made public, it moves into the
order of work above.
