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
Routes and server components render those typed models. Do not duplicate project metrics
or current facts in page components.

Routes are `/`, `/work`, `/work/[slug]`, `/research`, `/research/thesis`, `/learn`, `/learn/[slug]`, `/about`,
`/resume`, and `/contact`. `/drive` exists only as a redirect to `/work`. Trusted local MDX
is stored in `content/writing`; never accept or compile user-provided MDX.

The visual system is plain CSS in `src/app/globals.css`, using local Geist font files and
static HTML/SVG. Do not reintroduce WebGL, perpetual animation, remote fonts, or a large
client-side framework for decorative effects.

## Evidence And Privacy

- Classify every project honestly: academic research, group coursework, engineering
  prototype, reference implementation, reproducible experiment, or synthetic demonstration.
- Keep evidence, limitations, and personal contribution boundaries together.
- Use “thesis submitted”; do not imply degree conferral, defense, grade, or graduation.
- Do not publish an email, phone number, address, personal identifier, private path, contact
  form, or CV until explicitly reviewed and approved.
- Do not copy confidential data, row-level predictions, model artifacts, or proprietary
  research figures into this repository.
- Keep `/research` as the index, `/research/thesis` as the scientific record, and
  `/work/transport-uq` as the engineering case study. Do not expose empty research branches.
- Run `npm run validate:content` whenever content changes.

## Style

Preserve semantic HTML, visible focus states, WCAG AA contrast, reduced-motion behavior,
mobile layouts, and server components by default. Reuse existing components and classes
before adding new abstractions.
