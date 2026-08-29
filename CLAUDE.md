# Repository Guidance

## Commands

- `npm run dev` starts the Next.js development server.
- `npm run lint` runs the Next.js ESLint configuration.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run validate:content` checks evidence and privacy invariants.
- `npm run build` creates the production build.
- `npm run test:e2e` runs desktop/mobile Playwright and axe checks against that build.
- `npm run check` runs lint, typecheck, content validation, and build.

Use Node 20 and install with `npm ci`.

## Architecture

This is a server-first Next.js 16 App Router site. Current public facts are centralized in
`src/content/truth.ts`, and project evidence is centralized in `src/content/portfolio.ts`.
Research protocols and audited aggregate values are centralized in `src/content/research.ts`.
The public repository snapshot lives in `src/content/ecosystem.ts`, current focus in
`src/content/focus.ts`, and the systems graph in `src/content/systems-graph.ts`.
Routes and server components render those typed models. Do not duplicate project metrics
or current facts in page components.

Routes are `/`, `/work`, `/work/[slug]`, `/research`, `/research/thesis`, `/learn`, `/learn/[slug]`, `/about`,
`/resume`, and `/contact`. `/drive` exists only as a redirect to `/work`. Trusted local MDX
is stored in `content/writing`; never accept or compile user-provided MDX.

The visual system is plain CSS in `src/app/globals.css`, using local Geist font files and
static HTML/SVG. New components introduced after Website Completion v1 keep their styles in a
CSS module beside the component instead of extending `globals.css`. Do not add remote fonts or
a large client-side framework for decorative effects.

`SystemGraph` is the sanctioned canvas 2D visual. It is hand-written with no 3D dependency,
it explains the data-to-decision path rather than decorating the page, and it must keep all
four of its guarantees: a server-rendered static SVG and stage list that work without
JavaScript, no canvas below 760px, no auto-rotation under `prefers-reduced-motion` or after
the user takes control, and a usable page when the 2D context is unavailable.

WebGL is permitted in exactly one place: the repository assemblies in
`src/components/repo-assembly/`, on `/work`. That exception was granted deliberately and is
narrow. It does not generalise. Any other proposal to add WebGL, to a different page or a
different component, is out of scope and needs its own decision.

The assemblies must keep every one of these properties, or the exception no longer applies:

- The server-rendered card strip is the content of record. It renders always, carries every
  fact the 3D layer can show, and stays fully navigable with JavaScript disabled.
- three.js is loaded through `next/dynamic` with `ssr: false`, behind an IntersectionObserver,
  and is absent from the initial payload.
- The layer does not mount at all under `prefers-reduced-motion`, below 900px, or without
  WebGL. Those are not degraded modes; they are the intended experience.
- Rendering is `frameloop="demand"` and scroll-driven. Nothing renders while the page is
  still. There is no ambient or idle animation.
- A frame-budget guard unmounts the layer on sustained slow frames, leaving the strip visible
  with no frozen frame and no layout shift.
- Part labels come only from the typed registry through `src/content/assembly.ts`, which is a
  pure mapping. No copy is authored there and assemblies are never padded to a uniform part
  count.

Outside that exception the rule is unchanged: do not add WebGL, perpetual animation, particle
fields, or decorative motion.

## Evidence And Privacy

- Classify every project honestly: academic research, group coursework, engineering
  prototype, reference implementation, reproducible experiment, or synthetic demonstration.
- Keep evidence, limitations, and personal contribution boundaries together.
- Use “thesis submitted”; do not imply degree conferral, defense, grade, or graduation.
- Do not publish an email, phone number, address, personal identifier, private path, contact
  form, or CV until explicitly reviewed and approved.
- Do not copy confidential data, row-level predictions, model artifacts, or proprietary
  research figures into this repository.
- Confidential professional work may be described only through an approved `practice` string on
  an experience record, at an abstract level. Never publish a client name, endpoint, internal
  URL or IP, credential, private screenshot, or unpublished company document.
- The GitHub ecosystem is a reviewed static snapshot. Never add a live GitHub API call to a
  render path, and never publish stars, forks, or contribution counts.
- A systems-graph node may only link to a public artifact when its status is `Evidenced`.
  Directions of study carry no link.
- Keep `/research` as the index, `/research/thesis` as the scientific record, and
  `/work/transport-uq` as the engineering case study. Do not expose empty research branches.
- Run `npm run validate:content` whenever content changes.

## Style

Preserve semantic HTML, visible focus states, WCAG AA contrast, reduced-motion behavior,
mobile layouts, and server components by default. Reuse existing components and classes
before adding new abstractions.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
