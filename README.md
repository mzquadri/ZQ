# ZQ Research Portfolio

The evidence-led portfolio for Mohd Zamin Quadri, focused on reliable machine learning,
Applied AI, graph neural networks, scientific computing, and MLOps engineering.

The site is built with Next.js 14, React 18, TypeScript, and a small CSS design system.
It is server-rendered and statically generated wherever possible. There is no analytics,
cookie, contact form, remote font, WebGL scene, or third-party client script.

## Information Architecture

| Route | Purpose |
|---|---|
| `/` | Recruiter-readable overview, thesis evidence, selected work, and capabilities |
| `/work` | Six projects with explicit evidence classifications |
| `/work/[slug]` | Problem, contribution, workflow, evidence, quality controls, and limitations |
| `/research` | Thesis methodology, protocol distinctions, results, and scientific boundaries |
| `/about` | Current status, working principles, and proof-linked capabilities |
| `/contact` | Verified GitHub and LinkedIn channels; no personal-data collection |

The retired `/drive` experiment redirects to `/work`. The broken CV route was removed;
no document should be added until an approved, redacted PDF is available.

## Run Locally

Node 20 is required.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Verify

```bash
npm run check
npx playwright install chromium
npm run test:e2e
```

`npm run check` runs lint, TypeScript, evidence/content validation, and a production build.
Playwright exercises all public routes at desktop and mobile sizes with reduced-motion
emulation and axe accessibility analysis.

## Content Integrity

Public claims live in `src/content/portfolio.ts`. `scripts/validate-content.ts` checks:

- unique project slugs and valid proof links;
- evidence, quality controls, and limitations for every project;
- required routes and metadata endpoints;
- absence of public email, phone, broken CV paths, and selected unsupported claims.

Research figures are site-native diagrams built from reviewed aggregate values. No raw
simulation data, row-level predictions, serialized models, confidential files, or local
filesystem paths are included. See `docs/EVIDENCE_AND_PRIVACY.md` for the publication
boundary.

## Architecture

![Server-first portfolio architecture](docs/diagrams/architecture.svg)

The site uses React Server Components by default. Shared typed content feeds static pages,
metadata, structured data, sitemap entries, and content validation. The only runtime
dependencies are Next.js, React, and React DOM.

## Deployment

Vercel installs the locked dependency graph with `npm ci` and runs `npm run build`.
Security headers disable framing, MIME sniffing, browser access to cameras, microphones,
and geolocation, and limit referrer disclosure.

## License

Website source is licensed under the [MIT License](LICENSE). Linked research repositories,
thesis material, data, models, and figures retain their own terms and are not relicensed by
this portfolio.
