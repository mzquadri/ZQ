# Professional Platform Roadmap

The website is a long-term AI/ML engineering, research, and education platform. Recruiter Core
remains the fast entry point, but it is not the limit of the information architecture.

## Architecture Principles

- Keep public facts and project evidence typed; use professional judgment rather than attaching
  proof to ordinary career or capability descriptions.
- Keep confidential work useful through safe abstraction. Never publish company code, internal
  systems, customer data, private screenshots, local paths, credentials, or unpublished details.
- Use one trusted local content collection for articles, tutorials, and notes. Content declares its
  public section so `/learn` and `/blog` can evolve without duplicating loaders or metadata logic.
- Publish no empty section. Navigation, sitemap, feeds, taxonomy pages, and related-content links
  must be derived from real published entries.
- Prefer static/server rendering and build-time code, math, and metadata processing. Add client
  JavaScript only when an interaction teaches or enables something meaningful.

## Milestone 1 — Recruiter Core

Status: released. The homepage, experience and education records, case-study context, canonical
resume, project social images, accessibility coverage, and production deployment are complete.

## Milestone 2 — Content Foundation

### v1

- Typed local MDX with draft/published state and explicit `/learn` or `/blog` ownership.
- Metadata for title, description, dates, author, kind, category, tags, references, related work,
  optional cover art, and future content relationships.
- Static code highlighting, KaTeX equations, table of contents, reading time, Article JSON-LD,
  project-aware internal links, social images, RSS, sitemap entries, and validation.
- Launch `/learn` only with a substantive technical tutorial. Keep `/blog` private until a real
  essay is ready.

### Later Content Foundation increments

- Non-empty tag and category routes with deterministic related-content ranking.
- A blog index when the first genuine blog article exists.
- Content authoring documentation, preview workflow, and optional visual regression coverage.
- Modularize article styles when the content surface is large enough to justify the split.

## Milestone 3 — Research Experience

- Evolve `/research` into a research index and move the current thesis experience to
  `/research/thesis` with a stable redirect or canonical transition.
- Add experiment summaries only when methodology, artifacts, limitations, and ownership are clear.
- Build a reusable research visual language for calibration, coverage, uncertainty, graph models,
  and reproducibility boundaries.
- Keep publications and raw-data links absent until real public records exist.

## Milestone 4 — Video System

- Add a typed video collection with public-platform ID, duration, thumbnail, chapters, transcript
  or notes, resources, and related content/project links.
- Launch `/learn/videos` only with a real video. Use privacy-enhanced lazy embeds and never commit
  large video binaries by default.
- Let tutorials embed the same validated video record instead of duplicating iframe metadata.

## Milestone 5 — Lab

- Start with `/lab/uncertainty`: an accessible teaching tool for confidence, calibration,
  intervals, selective prediction, and conformal coverage.
- Keep calculations deterministic and client code isolated behind lazy loading.
- Add RAG and agent labs only when they demonstrate retrieval/evaluation or tool-routing concepts;
  do not ship decorative chatbots.

## Milestone 6 — Services

- Publish services only after the public case studies support the positioning.
- Organize each service around the problem, suitable use cases, deliverables, process, evidence,
  boundaries, and a direct contact action.
- Avoid agency-scale, guaranteed-outcome, or confidential-client claims.

## Milestone 7 — Flagship Projects

Develop one capability gap at a time: reliable ML, MLOps, document intelligence, decision
analytics, forecasting, data engineering/streaming, and the ZQ platform itself. Extend strong
existing repositories before creating new ones; preserve licenses and upstream attribution.

## Intended Route Growth

```text
/
├── work
│   ├── case-studies
│   ├── projects
│   └── experience
├── research
│   ├── thesis
│   ├── experiments
│   └── publications
├── lab
│   ├── uncertainty
│   ├── rag
│   └── agents
├── learn
│   ├── articles
│   ├── tutorials
│   ├── notes
│   └── videos
├── blog
├── services
├── about
├── resume
├── now
└── contact
```

This is a direction, not a requirement to expose empty routes. Each branch becomes public only
when it has meaningful content and passes accessibility, metadata, performance, and privacy review.
