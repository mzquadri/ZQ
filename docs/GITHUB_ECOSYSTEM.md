# GitHub Ecosystem

The public repository index on `/work#ecosystem` and the highlights on the homepage are rendered
from `src/content/ecosystem.ts`. That file is a **reviewed static snapshot**, not a live feed.

## Why a snapshot

- No route may depend on a network call to GitHub. If GitHub is unavailable, rate-limits the
  request, or changes its API, every page renders exactly the same.
- No API token has to exist in the build environment or in the browser.
- Repository descriptions are editorial and reviewed, so a README edit cannot silently publish an
  unbounded claim on this site.
- Nothing about activity volume is published. There are no stars, forks, contribution counts, or
  streaks, because those numbers are trivially misread as a measure of quality.

## What each entry may contain

| Field | Rule |
| --- | --- |
| `name` | Exact GitHub repository name. The public URL is derived from it, never hand-written. |
| `title` | Human-readable title for the interface. |
| `category` | One of `Featured`, `Active`, `Engineering`, `Research`, `Experiment`, `Reference`. Categories describe portfolio status, not technical quality. |
| `language` | Primary implementation language actually observed in the repository. |
| `topics` | Editorial focus labels. These are **not** GitHub topic metadata and must not be presented as such. |
| `description` | One or two sentences summarised from the repository README. |
| `boundary` | What the repository does **not** establish. Required for every entry. |
| `caseStudySlug` | Set only when a chapter exists, either a `projects` entry or a hand-built route under `src/app/work`. |

The schema carries **no activity date**. A last-commit column ranks work by recency, which is a
career chronology in a smaller font, and this portfolio publishes none. Validation fails if a
`lastCommit` or `observedAt` field reappears, and again if the phrase reaches rendered output.

## Refresh procedure

1. List every public repository on the profile:
   `curl -s "https://api.github.com/users/mzquadri/repos?per_page=100"`
2. For each one, read the current README and confirm the description and boundary still describe
   it honestly. The index is **complete**: every public repository is listed, including forks and
   learning artifacts, because a curated index that quietly drops the unflattering ones is a
   different kind of claim.
3. Record no dates.
4. Run `npm run validate:content` and `npm run test:content`.

Validation enforces that repository names are unique, no activity date is carried, every
case-study repository appears in the index, and the index and the case study agree
on the canonical repository URL. A drift between the two models fails the build rather than
publishing two versions of the same fact.

## Promotion rules

A repository moves to `Featured` only when a written case study exists and its evidence is
inspectable. `Active` means current engineering attention, not quality. `Experiment` entries are
never described as production systems, and `Reference` entries are never promoted as flagship
work.
