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
| `lastCommit` | Date of the most recent public commit observed during the audit. |
| `caseStudySlug` | Set only when a written case study exists. |

## Refresh procedure

1. For each repository, read the current README and confirm the description and boundary still
   describe it honestly.
2. Record the last public commit date. From a local clone:
   `git -C <repo> log -1 --format=%cs`
3. Update `ecosystemSnapshot.observedAt` to the audit date.
4. Run `npm run validate:content` and `npm run test:content`.

Validation enforces that repository names are unique, dates are ISO-formatted and not in the
future, every case-study repository appears in the index, and the index and the case study agree
on the canonical repository URL. A drift between the two models fails the build rather than
publishing two versions of the same fact.

## Promotion rules

A repository moves to `Featured` only when a written case study exists and its evidence is
inspectable. `Active` means current engineering attention, not quality. `Experiment` entries are
never described as production systems, and `Reference` entries are never promoted as flagship
work.
