# Repository Guidance

## Commands

- `npm run dev` starts the Next.js development server.
- `npm run lint` runs the Next.js ESLint configuration.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run validate:content` checks evidence and privacy invariants.
- `npm run build` creates the production build.
- `npm run test:e2e` runs desktop/mobile Playwright and axe checks against that build.
- `npm run check` runs lint, typecheck, content validation, and build.
- `npm run privacy:scan` checks source and build output for employer-internal detail. The
  confidential-draft exclusion only applies when `VERCEL_ENV=production`, so scan a build made
  that way: `VERCEL_ENV=production npm run build && npm run privacy:scan`. CI does this.

Use Node 24, as declared in `package.json` engines and used by CI. Install with `npm ci`.

## Architecture

This is a server-first Next.js 16 App Router site. Current public facts are centralized in
`src/content/truth.ts`, and project evidence is centralized in `src/content/portfolio.ts`.
Research protocols and audited aggregate values are centralized in `src/content/research.ts`.
The public repository snapshot lives in `src/content/ecosystem.ts`, current focus in
`src/content/focus.ts`, and the systems graph in `src/content/systems-graph.ts`.
Routes and server components render those typed models. Do not duplicate project metrics
or current facts in page components.

Routes are `/`, `/work`, `/work/[slug]`, `/work/medico`, `/work/reliable-knowledge-systems`,
`/research`, `/research/thesis`, `/learn`, `/learn/[slug]`, `/learn/level/[level]`,
`/learn/topic/[topic]`, `/about`, and `/contact`. `/drive` exists only as a redirect to `/work`.
There is no `/resume` route and no published resume in any form; `private/` holds the retired
export and nothing in the build reads it. Trusted local MDX is stored in `content/writing`; never
accept or compile user-provided MDX.

The visual system is plain CSS in `src/app/globals.css`, using local Geist font files and
static HTML/SVG. New components introduced after Website Completion v1 keep their styles in a
CSS module beside the component instead of extending `globals.css`. Do not add remote fonts or
a large client-side framework for decorative effects.

`SystemGraph` on `/work` is hand-written canvas 2D with no 3D dependency,
it explains the data-to-decision path rather than decorating the page, and it must keep all
four of its guarantees: a server-rendered static SVG and stage list that work without
JavaScript, no canvas below 760px, no auto-rotation under `prefers-reduced-motion` or after
the user takes control, and a usable page when the 2D context is unavailable.

There are two drawing layers. The canvas 2D chapter scenes on `/work` are described in
`src/components/sequence`, and the 3D project worlds on the detail routes are the `*-world`
components plus the repository assemblies in `src/components/repo-assembly/`.

Both layers are additive. Adding a new one, on a new page or for a new project, needs its own
decision; it is not implied by the ones that exist. Every scene must keep all of these
properties, or it does not ship:

- The static figure or table is the content of record. It renders always, carries every fact
  the scene can show, and stays fully navigable with JavaScript disabled.
- Scene data comes from the same typed evidence module the surrounding prose cites. No number
  is authored inside a scene, and no scene is padded to a uniform element count.
- three.js is loaded through `next/dynamic` with `ssr: false`, behind an IntersectionObserver
  whose root is shortened so a world under a short hero is not fetched on load. It is absent
  from the initial payload.
- Nothing mounts under `prefers-reduced-motion` or below the component's minimum width (1000px
  for the project worlds, 900px for the assemblies). Those are not degraded modes; they are the
  intended experience.
- Drawing is scroll-driven and stops when the section leaves the viewport: the mount gate is
  one-way, the visibility gate sets `frameloop` to `never`. There is no ambient or idle
  animation, and no world keeps drawing for a reader who has moved on.

The repository assemblies carry two further guards that the project worlds do not: an explicit
WebGL-availability probe, and a frame-budget guard that drops to a degraded band on sustained
slow frames without a frozen frame or layout shift. Extending either to the worlds would be an
improvement, not a requirement they currently meet.

Outside these layers the rule is unchanged: do not add WebGL, perpetual animation, particle
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
