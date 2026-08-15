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

This is a server-first Next.js 14 App Router site. Public claims are centralized in
`src/content/portfolio.ts`; routes and server components render that typed evidence model.
Do not duplicate project metrics in page components.

Routes are `/`, `/work`, `/work/[slug]`, `/research`, `/about`, and `/contact`. `/drive`
exists only as a redirect to `/work`.

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
- Run `npm run validate:content` whenever content changes.

## Style

Preserve semantic HTML, visible focus states, WCAG AA contrast, reduced-motion behavior,
mobile layouts, and server components by default. Reuse existing components and classes
before adding new abstractions.
