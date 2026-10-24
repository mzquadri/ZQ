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

## The two-tier page structure, and what Phase 1 now has to do

Found while building `battery-soc`, and it changes what "the same structure as
the best existing pages" means.

A case study renders its figure in one or both of two places:

* the **hero** (`.case-stage`), when the project has no `SCENES` entry, and
* the **story** (`.case-story-body`), when the project has a `caseStories`
  entry - a pinned stage with the argument scrolling beside it.

Only six projects have a story: `transport-uq`, `insureassist-rag`,
`mlops-reference-pipeline`, `hydrology-uq`, `streamflow-forecasting`,
`cifar10-cnn`. Those are the pages worth matching. Every other project page -
including projects 1 to 8 here - renders a hero figure only, and **a hero
figure cannot scroll-animate**: `.case-stage` is at the top of the document, so
its own view timeline is already 40% to 55% elapsed before the reader scrolls
at all, which left every staged element frozen partway through itself.

Two fixes went in with project 9:

1. `.case-stage .case-stage-figure *:not(figcaption) { animation: none }` so
   the hero renders the finished figure. Measured before: six of eight pages
   were showing a half-drawn diagram in the first viewport (release frames at
   84%, 62% and 39%; drift rows at 98%; margin rows at 88%).
2. `battery-soc` gets a `caseStories` entry, which is what gives it real
   scroll-driven motion and the beat reveals.

**So Phase 1 is now: give every project page a `caseStories` entry.** That is
what "bring every work page to the same animation standard" actually requires.
Projects 1-8 need it retrofitted.

### Traps that cost time here, worth not repeating

* Removing the *timeline* rather than the animation makes it worse. An
  animation whose named timeline resolves to nothing is inactive, and an
  inactive animation with `fill: both` holds its **first** keyframe - which
  blanks the figure entirely.
* `getComputedStyle` reports `opacity: 1` for such an element while Chrome
  paints it at zero. These faults are only visible in a screenshot. Probing
  computed styles says everything is fine.
* A CSS override keyed on `[class*="scene-"]` misses the bare `<li>` elements
  the key rows are built from. Match descendants, not classed descendants.
* `stroke-dasharray: 100` without `pathLength={100}` means 100 *user units*,
  which renders a polyline as disconnected segments. Already documented in
  `GraphSurrogateFlat`; it caught the battery detail panel too.
* Scroll-driven progress is not committed to `getComputedStyle` until the next
  frame. A fixed `waitForTimeout(35)` after scrolling reads the *previous*
  frame, which on a long page (jobhunter is 9,700px at 390) reported a scene
  that animates perfectly well as `STATIC`. Wait on two `requestAnimationFrame`
  callbacks instead. Half an hour went into chasing a bug that was in the
  probe.
* `checkproject.mjs` reports `complete(above fold)` as a pass. For a page with
  a story that verdict is about the **hero** copy and says nothing about the
  story copy, which is the one that animates. Probe
  `.case-story-body .scene-*` directly, and sample densely - a coarse sweep
  steps straight over a 480px animation window and reports "static".

### Open, not yet decided

* `WORLD_ORDER` contains only the nine homepage chapters, so `NextSystem`
  returns null on every new project page: they dead-end with no "next system"
  link. Extending it changes the curated homepage running order, which is a
  design decision rather than a bug fix - raise it rather than silently
  restructure.
* `cifar10-cnn`, `hydrology-uq` and `streamflow-forecasting` report only four
  animations in their story body, which looks like the beat reveals alone.
  Check in Phase 1 whether their scene figures are actually staged.

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
| 6 | `audi-release-tracking-case-study` | `audi-release-tracking` | **done** |
| 7 | `Deep-Learning-Flood-Prediction-LSTM` | `flood-lstm` | **done** |
| 8 | `Neural-Network-Identifiability-Analysis` | `nn-identifiability` | **done** |
| 9 | `Battery-SOC-Estimation-ML` | `battery-soc` | **done** |
| 10 | `Insurance-Claims-Prediction-ML` | `insurance-claims-threshold` | **done** |
| 11 | `ML-Water-Quality-Classification` | `water-quality` | **done** |
| 12 | `Weather-Data-Analytics-EDA` | `weather-eda` | **done** |
| 13 | `Supply-Chain-Analytics-Dashboard` | `supply-chain-analytics` | todo |
| 14 | `Statistical-Learning-Transportation` | `statistical-learning-transport` | todo |
| 15 | `NLP-Text-Classification-Transformers` | `nlp-transformers` | **done** |
| 16 | `jobhunter` | `jobhunter` | **done** |
| 17 | `ai-engineering-portfolio` | `ai-engineering-portfolio` | next |

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

## Do not use `git add -A` in this tree

Another session works in this repository at the same time. Committing with
`git add -A` swept two of its untracked, half-finished test files into a
commit of mine and pushed them. They referenced fields that did not exist yet,
so `tsc --noEmit` failed, and `npm run check` is both the CI gate and the
Vercel build command: the production build errored. The previous good
deployment stayed live throughout, and the fix was to untrack the two files
while leaving them on disk.

Stage explicitly from now on, by path, and run the check against what is
actually staged rather than against the working tree.

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
