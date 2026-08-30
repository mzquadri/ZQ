# Motion review: the site as continuous video, not as a filmstrip

Every visual review of this site before this one was a filmstrip - screenshots taken at chosen
scroll offsets and read side by side. A filmstrip is a good instrument for composition and a
useless one for motion. Stutter, a scene that snaps rather than settles, and a long task that eats
a third of a second while the reader is mid-gesture all live strictly *between* two screenshots.

So this pass recorded the production build the way it is actually used: real wheel events at a
reader's velocity, in wall-clock time, at 1440x900, with a frame timeline captured inside the same
pass. Two artifacts per route, from one run - a video, and a record of every frame interval in it,
stamped against the same clock. `tools/record-motion.mjs` records; `tools/analyse-motion.mjs`
reads the timeline back.

Both are QA instruments. The videos are gitignored: they are 1-23 MB each, regenerable, and have
no business on the public site.

## The measurement was wrong the first time

The first full pass reported the WebGL detail routes at 8-20 fps, with medico's world at a median
of 133 ms per frame. That finding was false, and the way it was false is worth recording.

Headless Chromium defaults to **SwiftShader**, a software rasteriser. It has no GPU behind it, so
every fragment is shaded on the CPU. The routes that were "slow" were exactly the routes that draw
with WebGL, and they were slow because of the harness.

```
renderer, default headless   ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)
renderer, --use-gl=angle     ANGLE (Intel, Intel(R) Arc(TM) Pro 140T GPU, Direct3D11, D3D11)
```

Re-run against the real adapter, the same cuts on the same build:

| Route | Median frame, SwiftShader | Median frame, real GPU |
|---|---|---|
| medico, through the world | 133 ms (8 fps) | 16.7 ms (60 fps) |
| RKS, through the world | 50 ms (20 fps) | 16.7 ms (60 fps) |

Both recorders now launch with the GPU flags, and the reason is written into the tool. Draw-call
counts are unaffected by which rasteriser executes them, so the offscreen audit below stays valid
under either.

I had begun optimising against the phantom before checking the renderer string. That is the
mistake this section exists to record.

## The real defect: worlds that never stopped drawing

The frame timeline turned up an inversion that was not a harness artifact. On the homepage, the
plain prose sections *below* the reel were dropping more frames than the canvas chapters above
them. Heavier work running smoother than lighter work is a bookkeeping result, not a rendering
one.

`tools/audit-offscreen.mjs` counts draw calls per canvas, then parks the page at the bottom, well
past everything, and watches which counters keep climbing. Parked there for three seconds:

| Route | Draw calls/second while off screen, before |
|---|---|
| `/work/hydrology-uq` | 4,763 |
| `/work/reliable-knowledge-systems` | 997 |
| `/` (eight procedural chapters) | 0 |

The cause was in every one of the eight worlds. Each mounted its renderer behind an
IntersectionObserver that called `setMounted(true)` and never called it back, and each `<Canvas>`
took react-three-fiber's default `frameloop="always"`. Together those mean: once a reader has
scrolled past a world, it renders at 60 fps for the rest of the session, at nobody.

The homepage was clean because its eight chapters are procedural Canvas 2D scenes that draw on
scroll and stop when scroll stops. Only the WebGL detail routes leaked.

### The fix

`src/components/world/stage-visibility.ts` separates two questions that had been collapsed into
one:

- **Has the reader ever reached this section?** Decides whether the WebGL bundle is fetched and a
  context created. Deliberately one-way, with the existing shrunken root (`-35%`) that keeps a
  megabyte of renderer out of the first screen. Tearing the context down on exit would mean
  rebuilding it, and re-uploading every buffer, the moment the reader scrolled back.
- **Is it on screen right now?** Decides whether that context should be drawing. Two-way, against
  the true viewport plus a 200px margin so returning to a world never shows a stalled first frame.

The second answer drives `frameloop={drawing ? "always" : "never"}` and gates the per-frame scroll
sampler. After the change, all eight routes issue **0 draw calls per second off screen**, and each
still draws at full rate on screen (hydrology 5,687/s, RKS 676/s, insureassist 385/s,
streamflow 303/s, mlops 132/s).

Guarded by three tests in `tests/portfolio.spec.ts` that count draw calls rather than frame rate,
so they mean the same thing on CI's software renderer as on a real adapter.

## Canvas DPR strategy

Audited across both rendering paths; the caps are consistent and deliberate.

| Path | Cap | Where |
|---|---|---|
| WebGL worlds (8) | `dpr={[1, 1.75]}` | each `*WorldCanvas.tsx` |
| Procedural scenes | `min(devicePixelRatio, 2)` | `sequence/SceneCanvas.tsx` |
| Pinned 2D stage | `min(devicePixelRatio, 1.75)` | `scene/CanvasStage.tsx` |
| Graph / assembly | `min(devicePixelRatio, 2)` | `SystemGraph.tsx`, `AssemblyScene.tsx` |

Uncapped DPR on a 3x phone quadruples fragment work for detail no one can resolve at reading
distance. Nothing here is uncapped.

## What the recordings show

Production build, 1440x900, real GPU, scroll emitted at ~60 Hz at reading speed. Median and p95
are the numbers that describe what reading the page feels like; the worst frame is included
because it is the one a reader would notice, and because attributing it mattered.

| Cut | Duration | Median | p95 | Dropped | CLS |
|---|---|---|---|---|---|
| Homepage, hero to bottom | 3:55 | 16.7 ms (60 fps) | 16.8 ms | 0.72% | **0.0000** |
| transport-uq | 0:34 | 16.7 ms | 16.8 ms | 0.9% | 0.0000 |
| reliable-knowledge-systems | 0:43 | 16.7 ms | 16.8 ms | 0.6% | 0.0017 |
| medico | 0:43 | 16.7 ms | 16.8 ms | 0.7% | 0.0041 |
| insureassist-rag | 0:44 | 16.7 ms | 16.8 ms | 0.5% | 0.0000 |
| mlops-reference-pipeline | 0:43 | 16.7 ms | 16.8 ms | 0.5% | 0.0000 |
| hydrology-uq | 0:41 | 16.7 ms | 16.8 ms | 1.3% | 0.0022 |
| streamflow-forecasting | 0:41 | 16.7 ms | 16.8 ms | 0.2% | 0.0061 |
| cifar10-cnn | 0:42 | 16.7 ms | 16.8 ms | 0.4% | 0.0000 |

Every chapter of the reel and every detail route holds a 60 fps median with a p95 one tick above
it. The homepage records **no layout shift at all** across a four-minute scroll from the hero to
the footer, and the worst detail route is 0.0061 against a 0.1 requirement.

### The worst frames were the recorder

The first read of this table showed worst frames of 460-680 ms and suggested a serious periodic
stall. `NO_VIDEO=1` runs the identical cut with the recorder off, which separates the site's frame
timing from the cost of encoding it - and VP8's cost scales with how much of the frame changed, so
scrolling prose is far more expensive to encode than a pinned scene.

| Route | Worst frame, recording | Worst frame, control |
|---|---|---|
| medico | 517 ms | 117 ms |
| mlops | 679 ms | 233 ms |

What remains in the control is a 100-233 ms hitch at "leave the identity object" on every detail
route. That one is real and it is architectural: it is the moment the reader first scrolls into
the world, the deferred WebGL bundle mounts and its shaders compile. It is the price of not
shipping a renderer to a first screen that is a title and a paragraph, it happens once, and it
happens while the reader is moving rather than reading.

A remaining ~2% of frames run late on long homepage passes, uniformly, including in prose sections
that draw nothing at all, with **no long tasks recorded** and the median and p95 unmoved. A 400 ms
frame with an unblocked main thread in a section the site is not painting is host scheduling, not
the page - the machine was also running a production server and, at one point, 39 stray browser
processes from earlier runs. It is recorded here rather than chased.

## A collision I reported from a screenshot, and then measured

A screenshot of medico's label state looked wrong: the matrix cells appeared to run straight
through the caption, with "…the three sources **can** speak to all of them" sitting under a row of
coloured blocks. I nearly moved the matrix.

`tools/audit-caption-collision.mjs` measures it instead. At nine positions per world it locates the
caption's own text boxes, captures the region twice - as the reader sees it, and with the canvas
hidden - and counts the pixels where a dark scrim became bright. That is the failure that matters:
light text needs a dark ground, and a bright object arriving behind it is what takes the contrast
away.

Across all eight worlds, at every sampled position: **0.0%**. On the medico state that prompted
the alarm, of 65,676 dark-scrim pixels behind the caption, the brightest the object reaches is a
luminance of **60**, against text at roughly 240. The scrim is doing exactly its job. The cells
are visible behind the words and they are dimmed to the point where they cost nothing.

A first version of this tool counted *every* changed pixel and scored medico's backbone state at
53% - a composition that reads perfectly well, where a dark plate merely shifts a dark background.
Both the alarm and the first metric were wrong in the same direction, and only the narrower
question - what happens to contrast - answered it.
