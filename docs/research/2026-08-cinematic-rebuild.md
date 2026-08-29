# Cinematic rebuild — research and art direction

An internal engineering artifact, not website content. Written before implementation, from four
supplied video references plus the sources they point at.

Everything below is marked **[verified]** where I retrieved the source directly, or **[inferred]**
where I am reasoning past what I could access.

---

## Video 1 — "Claude Design = Easy Websites for Beginners"

Kyle Skelly (@kyleslyf), 11m17s, published 2026-04-21. **[verified: oEmbed + yt-dlp metadata +
full English subtitle track + full description]**

The user named this the most important visual reference.

### What actually happens

A wireframe brief goes into Claude Design, which returns three layout variations. One is picked and
promoted to high fidelity. Imagery is generated separately in **Midjourney** at 16:9 on a solid
background, dropped in as a full-screen hero. The build is handed off to Claude Code for
refinement. The hero image is then **animated in Midjourney as a loop**, upscaled to 4K in
**Astra**, compressed, and swapped in as a background video. Hosting is GitHub → Cloudflare.

### Design principles worth taking

- **A design system precedes layout.** Brand colours, type, gradients, stroke weights, accents,
  declared once and reused. Named explicitly as the thing beginners skip.
- **Full-bleed hero with H1 and CTA at bottom-left**, gradient scrim at the base so type stays
  readable over imagery. Grid lines overlaid on the image.
- **Low motion beats high motion for backgrounds.** He generates both and picks low for the loop.
  This is the single most transferable note for a site that must feel slow and premium.
- Parallax used sparingly, on section imagery, not everywhere.
- The last 20% — logo, nav position, colour swaps, micro-adjustments — is explicitly what separates
  a generated page from a designed one.

### What does not transfer

The entire asset pipeline. Midjourney imagery is decorative fiction; this portfolio's images are
evidence. A generated "cyberpunk character" is fine for a game landing page and is exactly the
wrong tool for a confusion matrix. **The technique transfers, the asset source does not.**

---

## Video 2 — "Claude Fable 5 Built a $10K Website in Minutes"

Zubair Trabzada, 15m17s, 2026-07-02. **[verified: metadata, 11 chapters, subtitles, description
links]**

Chapters: 3D demo · Fable 5 setup · **Why 3D scroll websites work** · Higgsfield MCP · **Find
design inspiration** · **One-prompt luxury watch site** · Building "Abyssal" · Jarvis demo · **Full
site tour** · **Portfolio prompt** · Wrap.

### The technical revelation

Quoted from the transcript, chapter "Why 3D scroll websites work":

> "this scrolling effect that you're seeing here, **this is technically a video that's separated in
> multiple frames** and then also images as well"

> "it's very important for you to use a model that has **4K image quality**"

The "3D scroll website" in these references **is not live WebGL**. It is a pre-rendered video
decomposed into frames and scrubbed by scroll position. This reframes the whole rebuild.

The brief used: *"Build me a one-page cinematic 3D scroll website for a fictional Swiss luxury
watch brand."* Design inspiration sourced from Awwwards.

---

## Video 3 — "How to Build $10,000 3D Animated Websites With Claude Code + Seedance 2.5"

Komputer Mechanic, 22m27s, 2026-08-26 — three days old at time of research. **[verified: metadata,
6 chapters, subtitles, description links]** The linked written tutorial at
`komputermechanic.com/tutorials/scroll-animation-website` is **email-gated past the overview**
**[verified: fetched, confirmed gated]**.

### The design logic, in the author's own words

> "have the watch ... **flying out or sort of exploding as we scroll down** on the hero section"

> "**hide every HTML element** that we have on the website. So that means that all the elements that
> we have here would be **the starting frame for the animation**"

> "the product ... **slowly disassemble into an exploded view with every component drifting apart**,
> and **scrolling back basically reverses the whole animation**"

Three things follow, and they are the spine of this rebuild:

1. **The static hero composition is frame zero of the animation.** The page does not cut to a
   sequence; the sequence begins from exactly what is already on screen. That is why it reads as
   one object rather than a page followed by a video.
2. **Scroll is bidirectional time.** Reverse scroll reverses the teardown. Not a one-way trigger.
3. **The exploded view must separate, not scatter.** His correction prompt is the sharpest craft
   note in all four videos:

   > "the exploded view is **scattering instead of separating** ... I want **every part that
   > detaches to travel along the same axis it was attached on**"

   This is the difference between a premium teardown and parts flying apart. Several of the current
   worlds scatter.

---

## Video 4 — "Fable 5 for 3D Web Design is Next Level!!!"

Viktor Oddy, 59m56s, 2026-08-06. **[verified: metadata, subtitles, description links]** No
chapters. Longest and most technical of the four.

### Confirmations

Independently arrives at the same delivery mechanism, and states the reason:

> "you can just **convert the video to frames** using ... **MP4 to JPEG sequence** and you'll have a
> **sequence of images that will not be lagging on any device**"

Frames over video because video scrubbing stutters; a decoded frame array does not.

And a compositing note for stitching generated scenes:

> "use image two first frame and the second frame and **the top of the cable stays fixed in place,
> never moving**"

An **anchor that does not move between scenes** is what makes consecutive sequences feel continuous.

Linked properties: `motionsites.ai`, `getdesign.ai`, `designrocket.io` **[verified: present in
description]**.

---

## External references followed

- **GSAP ScrollTrigger image-sequence pattern** — the canonical implementation: scrub maps scroll
  progress to a frame index, each update draws one image to a canvas, container pinned for the
  duration. **[verified via search results and GSAP community material]**
- **Format economics** — Apple's AirPods sequence is 65 PNGs at 15.2 MB; the same frames as WebP
  come to ~1.7 MB, roughly a 90% reduction. **[verified via search results]**
- **Accessibility pattern** — under `prefers-reduced-motion`, render frame zero statically and
  never scrub. **[verified]**
- **Pure-CSS variants** exist (scroll-driven animations over a sprite/frame set) and avoid JS
  entirely, at the cost of frame-count flexibility. **[verified: referenced, not implemented]**

---

## Techniques worth borrowing

| Technique | Why |
|---|---|
| Scroll-scrubbed frame sequence on canvas | The premium teardown feel, deterministic, no per-frame simulation, no jank on mobile |
| Static composition = frame zero | Removes the seam between page and animation |
| Bidirectional scrub | Scroll is time; reversing rewinds |
| Separation along attachment axes | The actual difference between teardown and confetti |
| Fixed anchor across scenes | Lets consecutive sequences stitch |
| Low-motion loops for ambience | Slow and premium instead of hyperactive |
| Design-system-first | Tokens before layout |
| Bottom-left title + scrim over full-bleed visual | Proven hero composition |
| WebP frames | ~90% smaller than PNG |
| Reduced motion = frame zero | Same asset serves the accessible path |

## Techniques NOT worth borrowing

| Technique | Why not |
|---|---|
| AI-generated imagery of technical content | Fabricates evidence. Non-negotiable: every figure here is derived from a real artifact |
| Midjourney / Higgsfield / Seedance assets | Same reason. A generated "neural network" image asserts internals that do not exist |
| Glitch text, neon cyberpunk palette | Wrong register for research work |
| One-prompt whole-site generation | The evidence modules and negative-claim tests are the value; they are not regenerable from a prompt |
| Fake loading percentages | Only show progress that is actually known |
| Constant parallax on everything | Directly opposed to the requested stillness |

---

## Tool and library evaluation

| Option | Verdict |
|---|---|
| **GSAP + ScrollTrigger** | Rejected. ~50 KB for scrub + pin, both of which the existing rAF sampler and CSS scroll timelines already do. Nothing here needs its timeline model |
| **Lenis** (smooth scroll) | Rejected. Hijacks native scrolling, fights trackpad inertia, and hurts the accessible path |
| **Framer Motion / Motion** | Rejected. Component-level animation is not the problem being solved |
| **Spline** | Rejected. Hosted runtime, opaque assets, and the geometry here has to come from evidence |
| **GLB + Draco/Meshopt** | Not needed. Every object in this portfolio is procedural from data; there is no modelled asset to compress |
| **Existing R3F/three stack** | **Keep**, for the worlds where camera travel and depth genuinely aid understanding |
| **Canvas 2D frame scrubbing** | **Adopt.** New capability, no dependency, works where WebGL is refused |
| **Offline Python frame renderer** | **Adopt.** Pillow already present; renders truthful frames from the evidence modules |
| **View Transitions** | **Keep.** Already shipped, platform-native, degrades to nothing |

---

## Performance implications

A 120-frame WebP sequence at 1280×720 is roughly 1.2–2 MB, loaded lazily when the section
approaches, decoded once, then scrubbed with zero per-frame computation. Compared with the current
WebGL worlds this is **cheaper on mobile**, where three.js is refused entirely today and those
readers currently get a static figure instead of the story. Frames give mobile the cinema back.

Budget rules carried forward: no renderer on homepage arrival, nothing heavy on mobile or under
reduced motion, CLS held, no new runtime dependency.

---

## Proposed art direction

**One system per screen, opened slowly, and it never becomes a different object.**

- **Type** — the existing display/mono pairing is right and stays. Larger display sizes, tighter
  tracking at scale, more air.
- **Palette** — near-black ground, one accent per project, warm amber reserved exclusively for
  error and refusal. Unchanged, because it already carries meaning.
- **Motion** — move, rest, read, move. Every state has a resting frame that holds. Nothing floats
  to prove it is animated.
- **Camera** — one continuous move per chapter, never a cut.
- **Composition** — full-viewport stages, visual dominant, text as a plate beside it. Never cards
  for real work.

## Repository visual taxonomy

25 public repositories **[verified: GitHub API]**. The current index carries 13 and is missing
several meaningful ones, including `medico`, `DPS`, `Weather-Data-Analytics-EDA` and
`ML-Water-Quality-Classification`.

- **Flagship (8)** — full worlds, already built on verified evidence: transport/thesis, reliable
  knowledge systems, medico, insureassist, MLOps, hydrology, streamflow, CIFAR.
- **Strong (9)** — deserve a real visual sequence, not a card: flood-prediction LSTM, DPS
  traffic-accident prototype, battery SOC, water-quality classification, weather analytics EDA,
  insurance claims, NLP text classification, neural-network identifiability, supply-chain analytics.
- **Archive / learning (8)** — indexed and discoverable, no hero treatment: python warmup,
  pde-problems, local-repo, legacy landing page, profile README, event page, an upstream fork, and
  this site's own source.

## Storyboards

**Homepage.** Frame 01 identity, held. 02 the exhibition index. 03–10 one chapter per flagship,
each a full viewport with a single resting frame. 11 the strong-work index. 12 about. 13 contact.

**Flagship detail.** 00 the complete system, still. 20% first separation along attachment axes. 40%
internals exposed. 60% data or model moving through. 80% result, and where it fails. 100% resolved,
reassembled, evidence links.

**Strong repository.** Four beats: input → transform → output → limitation.

## Mobile

Frames are the answer. The same sequence at lower resolution and frame count gives phones the
actual story instead of a static fallback. No WebGL on mobile, unchanged.

## Asset plan

Frames rendered offline by Python from the existing evidence modules. Deterministic, regenerable,
committed as WebP. No AI-generated imagery anywhere.

---

## What shipped from this research

Written after implementation, so the document does not read as a plan that was never checked.

**Adopted.** The scroll-scrubbed frame sequence, built as `src/components/frames/FrameSequence.tsx`
with no new dependency. Frames are rendered offline by `tools/gen-frames-transport.py` from geometry
exported out of the site's own modules, so the picture is the same graph the site draws. Ninety
WebP frames at 1280x720 total 1.1 MB, mean 12.7 KB. Frame zero is the poster, which is what a
reduced-motion reader and a first paint both get.

The largest win was the one the references did not advertise. Every WebGL world here is refused on
mobile and under reduced motion, and those readers used to get a static figure instead of the
story. A frame sequence runs identically everywhere, so **the sequence is now the mobile
experience** for the chapter that has one.

**Rejected in practice, not only on paper.** No generated imagery. The reference pipelines all end
in Midjourney, Higgsfield or Seedance, and a generated picture of a technical system asserts
internals that do not exist. The technique transferred; the asset source could not.

**Where the taxonomy went.** The research proposed flagship / strong / archive. Building it turned
up a better axis. Reading all nine strong READMEs side by side, two publish tracked numbers and
five publish none *on purpose*, each naming the artifact it would need first. The supporting
movement is therefore organised by evidence state rather than by topic, and the five refusals are
drawn as empty measurement frames. That was not in the storyboard; it came out of the repositories.

**Still open.** Sequences exist for one chapter. The remaining flagships still use their WebGL
worlds with static figures on mobile, and each additional sequence needs its own offline renderer
written against that project's real evidence - which is the cost of not generating imagery.
