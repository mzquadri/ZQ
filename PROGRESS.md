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

**Phase 1 is done.** Every project page on the dynamic route now has a
`caseStories` entry, so every one of them has a pinned figure that stages
itself against the argument, plus the beat reveals. Verified animating at 390
and 1440 on all of them.

Two deliberate exceptions. `mcp-policy-gateway` has no flat figure at all - its
world entry returns null, because it postdates the procedural scene runtime and
SCENES is the only rendering it has ever had - so a story there would pin an
empty stage. `medico` and `reliable-knowledge-systems` have bespoke route files
that do not render `CaseStory`; giving them one is a layout change to two
flagship pages rather than a retrofit, and is left alone.

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
* `npm run check` does **not** include `privacy:scan`, and CI runs that scan
  separately with `VERCEL_ENV=production`. Vercel will therefore happily deploy
  content the privacy gate rejects - which is how two internal service names
  reached the live site for about fifteen minutes. Before pushing anything that
  mentions employer systems, run
  `VERCEL_ENV=production npm run build && npm run privacy:scan`; without that
  env var the scan reports pre-existing `[build]` offences on routes production
  does not emit, so a local run looks worse than CI rather than better.
  The two names were `Legal KB Dashboard` and `Legal KB Health Service`, both
  matching the single `ALWAYS` pattern `/legal[-\s]kb[-\s](health|dashboard)/i`,
  and both only ever in `src/content/authorship-chapter.ts` as `counted[]`
  labels - rendered on `/work/ai-engineering-portfolio` only, as the figure's
  `.scene-auth-name` spans. Re-checked on 24 October 2026 against production:
  all 64 sitemap routes fetched, zero matches for any `ALWAYS` term.
* Scroll-driven progress is not committed to `getComputedStyle` until the next
  frame. A fixed `waitForTimeout(35)` after scrolling reads the *previous*
  frame, which on a long page (jobhunter is 9,700px at 390) reported a scene
  that animates perfectly well as `STATIC`. Wait on two `requestAnimationFrame`
  callbacks instead. Half an hour went into chasing a bug that was in the
  probe.
* `playwright.config.ts` sets `reuseExistingServer: !CI`, so a `npm start` left
  running on port 3100 by an earlier session is reused silently. A server holds
  its route manifest from the build it started with while serving page files
  from disk, which produces a genuinely confusing failure: new routes 404 while
  old routes render the *new* markup. A correct change looked broken until the
  stale process - started three hours and seven commits earlier - was killed.
  Check what is listening on 3100 before believing an e2e failure.
* `checkproject.mjs` reports `complete(above fold)` as a pass. For a page with
  a story that verdict is about the **hero** copy and says nothing about the
  story copy, which is the one that animates. Probe
  `.case-story-body .scene-*` directly, and sample densely - a coarse sweep
  steps straight over a 480px animation window and reports "static".

### Open, not yet decided

* `cifar10-cnn`, `hydrology-uq` and `streamflow-forecasting` report only four
  animations in their story body, which looks like the beat reveals alone.
  Check in Phase 1 whether their scene figures are actually staged.

### Decided: two orders, not one

The dead-end was real - `NextSystem` looked a slug up in `WORLD_ORDER`, found
nothing and rendered nothing, so all seventeen new pages ended with no way on.
The decision was to leave the homepage's running order exactly as it is and
give everything else its own track, `CATALOGUE_ORDER`.

* The catalogue order **is** the order `/work` already lists them in, which is
  `registryItems` following the declaration order of `projects`. It is not a
  second opinion about the ranking; a reader walking it end to end meets the
  pages in the order the index showed them.
* It **terminates rather than wraps**. Nine curated chapters are a loop worth
  closing; seventeen catalogue pages are a list, and the end of a list is the
  index. The last entry offers `/work` under the kicker "End of the catalogue",
  and drops the duplicate "All work" action beneath it.
* The first catalogue entry has no "previous" link. It deliberately does not
  reach back into the chapters: two orders are two claims about the work, and a
  link across the seam would imply one list.
* `NextSystem` now never returns null. A slug in neither order - the withheld
  employer study, which has no world entry - still gets the index. Three tests
  in `portfolio.spec.ts` hold this: the two orders together account for every
  world and neither claims a page twice; the catalogue walks page to page and
  ends at `/work`; anything in neither order is still not a dead end.
* Only the nine chapters have a `SCENES` object to preview, so the band is
  one-column on catalogue pages (`[data-solo]`). Without that override the copy
  sat in `1fr` of a two-column grid with 46% of the band empty beside it.

## Motion parity: the standard every work page has to meet

Started 24 October 2026. The goal is that all 26 work pages carry the same
scroll-driven experience the flagship chapters do, rather than the two tiers
that exist now.

### The instrument comes first, because three obvious metrics all lied

`tools/audit-motion-parity.mjs`. It photographs each figure through one window,
fixed in the figure's own coordinates, at a series of scroll positions across
the stretch where it is pinned, and compares neighbouring frames with a
per-pixel threshold. Everything about that sentence was forced by a failure.

The test that forced each fix is the same one: **run it against production with
reduced motion**, where every scroll-driven animation is switched off, so every
figure must report static. It did not, three times.

1. **Hashing screenshots counts antialiasing.** A sticky element lands on a
   different subpixel offset at different scroll positions and every glyph and
   vector edge re-renders against a different fractional grid. Reduced motion
   reported two to six distinct hashes per figure, none of it animation. Frames
   are now decoded, reduced to a small greyscale thumbnail and compared with a
   threshold.
2. **`locator.screenshot()` scrolls.** It calls `scrollIntoViewIfNeeded` first,
   which throws away the scroll position the loop just set - so every sample
   was taken at whatever offset Playwright chose and the figure was measured at
   one progress over and over. It is a viewport clip now.
3. **A clip to the visible intersection changes size.** Resizing two
   differently-cropped rectangles to a common thumbnail compares different
   parts of the picture, which reads as 26% to 44% movement on a page where
   nothing moves. The window is now computed once, in the figure's own
   coordinates, as the region on screen at every sampled position.

Two more things it has to do, both of which changed the answer:

* **Measure over the pinned plateau, not the whole track.** A uniform sweep
  across a page carrying a world track several viewports tall steps straight
  over a story figure's animation window. The tool finds the stretch where the
  figure holds one position in the viewport - which is both when it animates
  and when a reader is looking at it - and drops the outermost sample at each
  end, because at the boundaries the figure is physically sliding.
* **`--gpu`, or the worlds are invisible.** Headless Chromium rasterises with
  SwiftShader and `worldRenderingIsWorthIt()` correctly refuses to mount a
  world on a software renderer. Without the flag every WebGL world reports
  static whether it works or not.

**The residual.** `insureassist-rag` still reports `world:3/9` under reduced
motion. Its readout caption updates with scroll position, which is information
rather than motion, and is left alone deliberately.

### The standard, taken from the best chapter

`insureassist-rag` is the reference: it is the only page carrying all five
layers that also moves on every layer that can be measured.

| # | Layer | What it is | Selector |
|---|---|---|---|
| 1 | Hero identity | The project's own scene drawn at its resting progress, as SSR'd SVG. Deliberately still - it is at the top of the document, so no scroll window remains below it. | `.case-stage .scn-identity` |
| 2 | Scrubbed scene stage | A pinned full-bleed canvas running `draw(surface, progress)` as a pure function of scroll. The same drawing is SSR'd to SVG as the reduced-motion and no-JS frame. | `.scn-frame` |
| 3 | WebGL world | A bespoke 3D world for the project, lazy-loaded on its own page, gated on width, motion and a real renderer, with the flat figure as the fallback. | `.world-stage` |
| 4 | Pinned story | `CaseStory` pins the project's flat figure while the argument scrolls beside it, staging the figure and revealing the beats. | `.case-story-stage` |
| 5 | Staged sections | Diagrams and result charts built from the repository's committed numbers, staged on scroll. | `section.visual-section` |
| 6 | Next-system object | The band at the foot of the page previews the next project with its own scene object rather than a link. Follows from having a `SCENES` entry. | `.next-system-object` |

Layer 2 is the one that makes this tractable. `SceneStage` and `SceneCanvas`
already exist, complete with their CSS in `scenes.css` - and are imported by
**nothing**. They are left over from the removed homepage reel. Reviving them
is what gives every page a scroll-scrubbed scene at every width, including the
phone widths where a WebGL world deliberately does not render.

### Measured before this work, production, 1440px, GPU

`moving steps` is how many of nine sampled intervals changed; `peak` is the
largest share of the picture that moved between two neighbours.

| Page | 1 hero | 2 scene | 3 world | 4 story | 5 sect | 6 next | Measured |
|---|---|---|---|---|---|---|---|
| `transport-uq` | scene | - | - | yes | 1 | yes | story 9/9 (12.1%) |
| `mcp-policy-gateway` | scene | - | - | - | 7 | yes | **nothing measurable** |
| `reliable-knowledge-systems` | - | - | yes | - | 0 | yes | world 9/9 (26.5%) |
| `medico` | - | - | yes | - | 0 | yes | world 9/9 (33.7%) |
| `insureassist-rag` | scene | - | yes | yes | 1 | yes | world 9/9 (16.0%), story 9/9 (6.9%) |
| `mlops-reference-pipeline` | scene | - | yes | yes | 1 | yes | world 9/9 (24.3%), story 8/9 (**0.5%**) |
| `hydrology-uq` | scene | - | yes | yes | 1 | yes | world 9/9 (9.3%), story **0/9 STATIC** |
| `streamflow-forecasting` | scene | - | yes | yes | 0 | yes | world 9/9 (9.7%), story **0/9 STATIC** |
| `cifar10-cnn` | scene | - | yes | yes | 0 | yes | world 9/9 (44.0%), story **0/9 STATIC** |
| `ai-engineering-portfolio` | flat | - | - | yes | 0 | - | story 9/9 (7.3%) |
| `jobhunter` | flat | - | - | yes | 0 | - | story 9/9 (13.5%) |
| `nlp-transformers` | flat | - | - | yes | 0 | - | story 9/9 (12.2%) |
| `statistical-learning` | flat | - | - | yes | 0 | - | story 6/9 (3.3%) |
| `supply-chain` | flat | - | - | yes | 0 | - | story 9/9 (10.3%) |
| `weather-eda` | flat | - | - | yes | 0 | - | story 7/9 (10.6%) |
| `water-quality` | flat | - | - | yes | 0 | - | story 7/9 (14.3%) |
| `insurance-claims-threshold` | flat | - | - | yes | 0 | - | story 8/9 (2.4%) |
| `battery-soc` | flat | - | - | yes | 0 | - | story 2/9 (**0.6%**) |
| `nn-identifiability` | flat | - | - | yes | 0 | - | story 8/9 (8.4%) |
| `flood-lstm` | flat | - | - | yes | 0 | - | story 7/9 (16.2%) |
| `audi-release-tracking` | flat | - | - | yes | 0 | - | story 7/9 (19.2%) |
| `keras-pytorch-parity` | flat | - | - | yes | 0 | - | story 7/9 (10.1%) |
| `eurostat-modal-split` | flat | - | - | yes | 0 | - | story 5/9 (8.3%) |
| `bm25-rrf-java` | flat | - | - | yes | 0 | - | story 6/9 (13.8%) |
| `munich-accident-forecasting` | flat | - | - | yes | 0 | - | story 6/9 (6.7%) |
| `drift-aware-platform` | flat | - | - | yes | 0 | - | story 6/9 (11.1%) |

### What is missing, grouped

* **Layer 2 is missing from all 26.** No page renders a scrubbed scene stage.
* **Layer 3 is missing from 19.** The seventeen catalogue pages, plus
  `transport-uq` (whose world lives on `/research/thesis`, not on its case
  study) and `mcp-policy-gateway` (which has never had one).
* **Layers 1 and 6 are missing from the seventeen catalogue pages**, because
  both follow from a `SCENES` entry and only the nine chapters have one. Those
  pages open on a flat hero figure and close on a band with no object.
* **Layer 5 is missing from the seventeen**, which carry no staged diagram or
  result section at all against the chapters' one to seven.
* **Layer 4 is broken on three chapters** - `hydrology-uq`,
  `streamflow-forecasting` and `cifar10-cnn` pin a figure that does not move -
  and is close to it on `mlops-reference-pipeline` (0.5%) and `battery-soc`
  (0.6%). The 2026-10-23 note above guessed this was "the beat reveals alone"
  and guessed right for the wrong reason; it is measured now.
* **`mcp-policy-gateway` has no measurable moving figure.** Its seven sections
  are each taller than the viewport and never pin, so nothing about them can be
  compared frame to frame, and it has neither a story nor a world.

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
| 17 | `ai-engineering-portfolio` | `ai-engineering-portfolio` | **done** |

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

## Phase 2: the end-to-end review

Run against production over every route in the sitemap - 64 of them - at 390,
768 and 1440, in light and dark. Console errors, failed requests, horizontal
overflow, images without alt text, links with no accessible name, heading
order, titles, descriptions, Open Graph images, and every internal link
target followed.

**Findings: two, both mine, both the same thing** - a meta description over
the length a search engine will show. Ten were tightened in the end, since the
field's own doc comment sets the target at about 160 and the two the audit
flagged were only the worst of them.

Everything else came back clean: no console errors, no failed requests, no
horizontal overflow at any width, every image carries alt text, every link has
an accessible name, one `h1` per page with no skipped heading levels, and all
65 internal link targets resolve. A missing page returns 404. All 38 external
links resolve. Open Graph images render for every new route.

Three American spellings were corrected in British prose. The wider
`artifact`/`artefact` split is real, predates this work and runs both ways;
it is left alone deliberately, because sweeping it would mean editing quoted
repository text and the `"immutable-artifact"` type literal.

### Lighthouse

| | performance | accessibility | best practices | SEO |
|---|---|---|---|---|
| `/` | 70 | 100 | 100 | 100 |
| `/work/battery-soc` | 91 | 100 | 100 | 100 |
| `/work/jobhunter` | 90 | 100 | 100 | 100 |

The home page's score is main-thread work, not weight: 780ms total blocking
time against a 1.0s largest contentful paint, zero layout shift and 167KiB of
JavaScript. It is the WebGL portrait's shader initialising. `DepthPortrait`
already defers behind an `IntersectionObserver`, and on the home page it is
visible immediately because it is the hero - so deferring it further would
delay the one visual the page is built around in order to improve a number.
**Left as it is, deliberately.** Worth revisiting only with a cheaper first
frame, not with a later one.
