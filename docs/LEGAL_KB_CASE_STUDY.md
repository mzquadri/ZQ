# Legal Knowledge Platform case study

The one case study on this site whose claims cannot be checked against a public repository. It
describes employer work, so it is built and reviewed here but **withheld from production until a
real publication approval exists**.

## Why it is draft-only

`src/content/portfolio.ts` carries it as an `employer-confidential` project with
`publication: { status: "draft", … }`. No approval has been requested or granted.

Two independent guards keep that honest:

- **The environment gate.** `draftsAreVisible` is false when `VERCEL_ENV === "production"`, so the
  project is filtered out of `projects` — and therefore out of `generateStaticParams`, the work
  index, the sitemap and the generated metadata. A production build contains no trace of the
  slug.
- **The validator.** `scripts/validate-content.ts` fails the build if a production build would
  publish an unapproved confidential project. Approval is data, not a deployment convention:
  `status: "approved"` is only expressible with an approval reference, the date it was given, and
  the date it must be reviewed again.

Drafts are validated on exactly the same terms as published content, so approval is the only thing
outstanding rather than the point at which review begins.

## What is published, and what never is

Published: the architecture in generic role names; the reasoning about correctness; a contribution
statement that separates work personally implemented from work materially extended and from
patterns that predate the author; structural facts in place of scale; and the limits of what the
verification can establish.

Never published, and enforced rather than remembered — see `scripts/confidential-content.ts`:

- no employer source code, and none was copied into this repository;
- no corpus scale — not documents, gates, migrations, tests, services or records. Illustrative
  quantities in the figures are spelled as words, and **no rendered field may contain a number of
  two digits or more** outside the year;
- no corpus content, and no identifier of any published instrument;
- no service, repository, topic, bucket, table, column or migration names, file paths, finding
  identifiers or commit hashes;
- no hostnames, internal domains, IP addresses, registries or endpoints;
- no screenshots of the employer's own tooling — every figure on the page was drawn for this site;
- no colleagues.

`tests/confidential-project.test.ts` feeds each of those rules content it is supposed to reject.

## Visual architecture

Layered, so that removing any layer leaves a correct page rather than a broken one.

1. **Semantic HTML is the record.** Every figure is a server component rendered at its finished
   state. With JavaScript off, the page is complete.
2. **CSS 3D carries the argument where depth means something.** Three representations of one
   source are parallel views, so they sit on three planes; generations of stored state sit behind
   one another. Forward is current and being examined, behind is derived or superseded, furthest
   back is retained evidence. Depth flattens to a stacked layout below 900 px with identical
   information.
3. **One scoped WebGL canvas**, in the vector card only — the single representation whose meaning
   is genuinely positions in a space. Four gates run before three.js is fetched: near the
   viewport, motion allowed, viewport ≥ 720 px, WebGL available. It renders sixteen fixed points
   with `frameloop="demand"`, settles, and stops. Otherwise the card keeps a flat projection of
   the same sixteen points.
4. **Motion is deterministic state, not a timeline.** `SceneReveal` writes a `data-step` number and
   every transition is CSS keyed off it, so the site's global reduced-motion rule neutralises the
   motion without the components participating.

## Guided walkthrough

Eight steps, about 98 seconds, driven by one controller (`src/components/legal-kb/Walkthrough.tsx`)
over the table in `src/content/legal-kb-walkthrough.ts`. Scenes own no schedule; they render the
state they are handed.

The run publishes its position on the document element — `data-walkthrough`,
`data-walkthrough-step`, `data-walkthrough-beat` — and exposes the same actions the dock's buttons
call on `window.zqWalkthrough`, including `goTo(step, beat)`. `sceneStatesAt(step, beat)` is a pure
function, so a position produces the same picture however it was reached. That contract is what the
video export drives.

Keyboard: `→` next, `←` previous, `Space` play/pause, `Esc` exit. Deliberate input — wheel, touch,
page keys — pauses autoplay rather than fighting it; pressing Play re-frames the current step.

## Recording the video

```bash
npm run build          # the recorder drives the production build
npm run record:video   # 16:9 master
node tools/record-legal-kb-video.mjs --social   # adds the portrait cut
```

**Prerequisites:** a production build in `.next/`, Chromium from `@playwright/test`, and an
ffmpeg binary. ffmpeg is deliberately **not** a declared dependency — it is about eighty megabytes
and would be downloaded on every install, including every Vercel build, for a tool that only runs
locally. Point `FFMPEG_PATH` at one you already have, or `npm i -D ffmpeg-static` to fetch one.
The recorder fails with that instruction if neither is present. None of this enters a client
bundle.

**Output:** `media/legal-knowledge-platform.mp4` — 1920×1080, H.264, 30 fps, about 64 s. The shot
list is written beside it as `media/shot-list.json`, and `media/narration.md` holds the script and
captions. Intermediate frames go to `.video-frames/`, which is gitignored and removed on success.

**Determinism.** Every frame comes from a named `(step, beat)` position reached through
`window.zqWalkthrough.goTo`, then confirmed against the document attributes before any frame is
kept. There is no autoplay and no waiting on wall-clock animation. The pointer is never moved over
the first figure, so its parallax never fires; `--tilt-x` and `--tilt-y` stay at their neutral
`0deg`. WebGL is given an explicit settle window before its shot is captured. The tool fails loudly
— missing build, missing framing target, browser console error, wrong duration, wrong codec —
rather than producing a file nobody checked.
