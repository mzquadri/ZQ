# ZQ Research Portfolio

The portfolio site for Mohd Zamin Quadri, covering reliable machine learning, applied AI,
graph neural networks, scientific computing, and MLOps engineering.

Every number on the site comes from a typed content model, and every claim that can be checked
links to a specific commit in the repository it came from. The build fails rather than publish a
project whose evidence, limitations, or contribution boundary is missing.

Built with Next.js 16, React 19, TypeScript, and plain CSS. Pages are React Server Components by
default and statically generated wherever the content allows. There is no analytics, no cookie,
no contact form, no remote font, and no third-party client script.

## Routes

| Route | Purpose |
|---|---|
| `/` | Current focus, selected work, systems graph, research, repository index, experience, capabilities, writing |
| `/work` | Case-study index plus a catalogue of 26 public repositories |
| `/work/[slug]` | Problem, contribution, workflow, evidence, quality controls, and limitations |
| `/work/medico` | Standalone case study with its own scene |
| `/work/reliable-knowledge-systems` | Standalone case study with its own scene |
| `/research` | Research overview: primary, supporting, and emerging directions |
| `/research/thesis` | Thesis record with methods, aggregate findings, limits, and provenance |
| `/learn`, `/learn/[slug]` | Technical notes from a typed local MDX collection |
| `/learn/level/[level]`, `/learn/topic/[topic]` | Taxonomy indexes derived from published entries |
| `/about`, `/contact` | Status and working principles; verified GitHub and LinkedIn only |
| `/rss.xml`, `/sitemap.xml`, `/robots.txt` | Feed and metadata endpoints |

The retired `/drive` experiment redirects to `/work`. The site does not publish a resume: there is
no route, no download, and no sitemap entry. The generated PDF is kept in `private/` as a source of
record for a document sent privately, and nothing in the build reads it.

Eight case studies are authored. Seven render in production. The eighth describes employer work,
cannot be backed by a public repository, and is held as a draft: a production build excludes it
entirely until a real approval is recorded against it, and the content validator fails the build
rather than publish an unapproved one. See `docs/LEGAL_KB_CASE_STUDY.md`.

## Scenes

Two drawing layers, both fed from the same evidence modules the prose cites, so neither can drift
from the numbers beside it.

On `/work`, nine chapters are drawn with the canvas 2D API from a shared scene description in
`src/components/sequence`. On the detail routes, eight projects carry a 3D scene built with
three.js through react-three-fiber.

Neither layer is the content of record. Every chapter renders a static figure or table that
carries the same facts, stays in the document, and works with JavaScript disabled. A scene is
added on top of that, and only when three gates pass:

- the viewport is at least 1000px wide (900px for the repository assemblies on `/work`),
- the reader has not asked for reduced motion,
- the section has reached the upper two thirds of the viewport.

Everything touching WebGL sits behind `next/dynamic` with `ssr: false`, so it is absent from the
initial payload. A separate visibility gate sets `frameloop` to `never` once a section scrolls
away, because a world that keeps drawing after the reader has moved on competes with them for the
main thread. `docs/research/motion-review.md` records how that was measured;
`docs/research/video-evaluation.md` records why the scenes are drawn at runtime rather than
pre-rendered to video.

## Run locally

`package.json` requires Node 24.

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
npx tsx tools/check-evidence-links.ts
```

`npm run check` runs lint, TypeScript, content validation, the content test suite, and a
production build. Playwright exercises the public routes at desktop and mobile sizes with
reduced-motion emulation and axe accessibility analysis.

`check-evidence-links.ts` resolves every external link the site publishes by importing the content
modules and walking their values, so a pinned path is checked as the page renders it rather than as
a regular expression guesses it. It is deliberately outside `npm run check` and CI: it depends on
GitHub being reachable, and a build that goes red because a third party is having a bad morning
teaches people to ignore red.

## Content integrity

Public facts live in `src/content/truth.ts`, project evidence in `src/content/portfolio.ts`,
research protocols and aggregate values in `src/content/research.ts`, the repository snapshot in
`src/content/ecosystem.ts`, current focus in `src/content/focus.ts`, and long-form content in
`content/writing`. Routes render those models; they do not restate metrics.

`scripts/validate-content.ts` checks:

- source tiers, verification dates, review deadlines, and approved visibility;
- unique project slugs, authorship records, and valid proof links;
- evidence, quality controls, and limitations for every project;
- required routes and metadata endpoints;
- approved experience and education records, and omitted disputed dates;
- absence of public email, phone, stale paths, and selected unsupported claims;
- MDX metadata, publication dates, taxonomy consistency, and privacy boundaries;
- research route ownership, pinned thesis provenance, and distinct calibration protocols;
- repository-index consistency: unique names, non-future commit dates, and agreement with each
  case study on the canonical repository URL;
- systems-graph integrity: every stage populated, every edge resolvable, and no link on a node
  that is only a direction of study;
- sanitized confidential-work descriptions, which may name no endpoint, host, or address.

Figures use reviewed aggregate values only. No raw simulation data, row-level predictions,
serialized models, confidential files, or local filesystem paths are included.
`docs/EVIDENCE_AND_PRIVACY.md` sets out the publication boundary.

The GitHub ecosystem is a reviewed static snapshot rather than a live integration: no route calls
GitHub at render time, no stars, forks, or contribution counts are published, and every page
renders identically when GitHub is unavailable. See `docs/GITHUB_ECOSYSTEM.md`.

## Architecture

![Server-first portfolio architecture](docs/diagrams/architecture.svg)

Shared typed content and trusted local MDX feed static pages, metadata, structured data, sitemap
entries, and validation. Beyond Next.js and React, the runtime dependencies are content parsing,
rendering, and the scene layer.

## Deployment

Vercel installs the locked dependency graph with `npm ci` and runs `npm run check` as the build
command, so a content or type failure blocks the deployment. Security headers disable framing and
MIME sniffing, block browser access to cameras, microphones, and geolocation, and limit referrer
disclosure. CI additionally runs the Playwright suite and a guard that rejects commit metadata
attributing authorship to an assistant.

## License

Website source is under the [MIT License](LICENSE). Linked research repositories, thesis material,
data, models, and figures keep their own terms and are not relicensed by this portfolio.
