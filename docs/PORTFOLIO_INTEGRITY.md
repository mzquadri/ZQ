# Portfolio Integrity v1

## Current Operational Snapshot

**Verified: 2026-09-13**, against the application state at `40b207a` — the commit this document
was written against, named once here rather than repeated, so that editing the document does not
immediately invalidate its own claim.

| Item | Current |
|---|---|
| Repository | `https://github.com/mzquadri/ZQ` |
| Deployment branch | `main` (`origin/HEAD` and `origin/main`) |
| Production URL | `https://mzquadri.de` — HTTP 200 |
| Continuous integration | GitHub Actions: success |
| Working tree | Clean and aligned with `origin/main` |
| Runtime | Node.js 24.12.0, npm 11.6.4 (`engines`: `node >=24 <25`) |
| Framework | Next.js 16.3.1, React 19.2.8 |
| Tooling | TypeScript 5.9.3, ESLint 9.39.1, Playwright 1.62.1 |

### Current verification

Every figure below was measured by running the command named, not carried forward from a previous
snapshot.

| Check | Command | Result |
|---|---|---|
| Content validation | `npm run validate:content` | 28 truth facts, 8 projects, 1 published writing entry, 5 capability groups, 17 route files |
| Lint, types, build | `npm run check` | Passed |
| End-to-end | `npx playwright test` | 390 passed, 14 skipped, 0 failed |
| Privacy scan | `npm run privacy:scan` | Clean, against a production build |
| Route and accessibility audit | `node tools/audit-site.mjs` | 18 routes × 6 viewports; 0 critical, 0 high, 0 axe violations at WCAG 2.1 AA |
| Journeys | `node tools/check-journeys.mjs https://mzquadri.de` | All passed against production |
| WebGL worlds | `node tools/check-worlds.mjs https://mzquadri.de` | All 8 correct on the software and hardware paths |
| Dependency audit | `npm audit` | **4 advisories: 1 critical, 2 high, 1 low**, across 693 dependencies |

The audit result is not clean and is recorded as measured rather than as hoped. The critical
advisory is [GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36), CVSS 9.0,
unauthenticated remote code execution on Windows-hosted servers, affecting Next.js `>=16.0.0
<16.3.3`; this site runs 16.3.1 and the fix is 16.3.5. Production is served by Vercel on Linux,
which is not the affected host platform, but the upgrade is outstanding and is a code change
rather than a documentation one. The two high advisories (`js-yaml`, `sharp`) and the low
(`postcss-selector-parser`) are transitive.

The two remaining audit findings are cosmetic and long-standing: one tap target whose *width* is
short because the link text is a three-letter repository name, and 109 small-label instances at
10.2–10.9px, which is the design's label scale rather than a defect.

The August 20, 2026 integrity baseline — Node 20, Next.js 14.2.35, React 18.3.1, 34 Playwright
checks — is preserved in Git history; this document reports the current verified state.

## Source Hierarchy

Public claims use the strongest available source in this order:

1. Official or primary records.
2. Immutable submitted artifacts.
3. Audited reproducible repository evidence.
4. Approved CV or professional documents.
5. GitHub profiles and repository descriptions.
6. Website or social copy.

For numerical research claims, reproducible artifacts take precedence over prose. A conflict
never changes an immutable submitted artifact; it produces a visible post-submission
corrigendum or reproducibility note in maintained public sources.

`src/content/truth.ts` is the typed publication registry. Each fact records its source tier,
source reference, verification date, visibility, and, for current facts, a review deadline.
`npm run validate:content` fails after a current public fact becomes stale.

## Thesis Canonicalization

The sole canonical destination is:

`https://github.com/mzquadri/ml_surrogates_for_agent_based_transport_models`

This section previously named `ml-surrogates-thesis` as the canonical destination and described
consolidation as outstanding. Both statements are now wrong, and the first was a link that
answered 404. The consolidation happened: the work moved into the fork of the upstream
repository on 1 September 2026 and `ml-surrogates-thesis` was archived, then deleted on
4 September 2026 rather than left archived. `src/content/truth.ts` records the move and the
reason, and every citation on the site was repointed at the surviving repository.

The submitted thesis PDF remains immutable and is intentionally public at its pinned path in
that repository. Corrections are labelled as post-submission corrigenda or reproducibility
updates rather than applied silently to the submitted artifact. The two local sources reviewed
before the move were:

| Source | Reviewed commit | Disposition |
|---|---|---|
| `ml_surrogates_for_agent_based_transport_models` | `fdb4ef0c9c736576ae34d5e331d8b66a7a6d877a` | Became the canonical repository; holds audited evidence, tests, CI, limitations, and corrections |
| `ml_surrogates_thesis_final` | `4b95a3d8aca5929bb88b84bb7f7ae86c48e2f428` | Submitted thesis artifact preserved in the canonical repository |

## Conflict Register

| Topic | Public decision | Evidence boundary |
|---|---|---|
| Exact-zero target share | 27.6% | Reproducibly audited target artifact; 88.7% belongs to the capacity-reduction input feature |
| Calibration | Keep both protocols separate | Graph 20/80 replay: ECE 0.269 to 0.048; final-thesis node 30/70 report: approximately 0.356 to 0.034 |
| Dataset scope | 100 held-out scenarios and 3,163,500 cached road-link predictions within a fixed 1,000-scenario subset | Not a claim about all MATSim data or fresh raw-data replay |
| Defect status | Do not publish “zero bugs” | Tests and audits bound known checks; they cannot prove absence of defects |
| Experience titles | Approved titles and organizations published in Recruiter Core v1 | No private duties, client details, or quantified employment impact inferred |
| Experience dates | The five approved periods are published, in one format, from the registry | Each period is transcribed from the privately held curriculum vitae; `validate:content` fails on any rendered range that is not one of them |
| Education | TUM M.Sc. program with thesis submitted; AMU B.Sc. (Hons.) Mathematics | No claim of TUM defense, grade, graduation, or degree conferral |
| Contact email | The approved personal address is published on `/contact` and in the footer | It is the address already carried by public commit history, so publishing it discloses nothing new; `validate:content` fails on any other address |
| Resume | None published; `/resume`, `/cv` and every PDF path return 404 | A generated, web-safe PDF was published for a time and has been withdrawn. The facts it carried are rendered as pages; the privately held source document is evidence and is not served |
| Repository status | `ml_surrogates_for_agent_based_transport_models` is the only canonical destination | Consolidation completed on 1 September 2026; `ml-surrogates-thesis` was deleted on 4 September 2026 and no longer resolves |
| Personal identifiers | No phone number, street address, or private identifier is published | The portrait is the only personal identifier approved, on 22 August 2026; `validate:content` fails on a telephone number in the rendered source |
| Services | No public services offer | Services remain inactive until a real offer and operating boundary are approved |

Unresolved or unpublished facts must not be inferred into page copy, metadata, structured data,
repository descriptions, or social copy.

## Framework Migration

**2026-08 — Next.js 14 to 16, React 18 to 19.** The migration moved the site from Next.js 14.2.35
and React 18.3.1 to 16.3.1 and 19.2.8, with ESLint 9.39.1 and the matching Next.js configuration.
It migrated asynchronous App Router parameters and removed the deprecated Edge runtime
declaration from the generated Open Graph image.

The decision and its scope are the durable part and are kept. The operational figures that
accompanied it are not: the four stage-by-stage Playwright counts recorded at the time (39, 47,
55 and 63 passed, each with one desktop-only skip) described intermediate states of a suite that
now reports 390 passed, and the `npm audit` result recorded alongside them has since changed. The
current numbers, including the audit, are in the operational snapshot at the top of this document,
measured rather than carried forward.

One consequence is worth stating plainly rather than leaving implied: that migration's clean audit
result is what the snapshot now contradicts. A dependency audit is a statement about a moment, and
this one stopped being true without anything in this repository changing.

## Documentation Freshness

The problem this convention exists to prevent is the one that produced this rewrite: a document
that reported August figures in September, confidently, because the numbers had been copied
forward rather than measured.

- **Operational snapshots carry a `Verified:` date.** A figure without one is not a claim about
  today, and should be read as history.
- **Counts are measured, never copied.** Every number in the snapshot above names the command that
  produced it, so the next person can re-run it rather than trust it.
- **Dated decisions are immutable.** A decision recorded on a date stays as written; it is
  superseded by a later dated entry, never edited to match the present. `docs/EVIDENCE_AND_PRIVACY.md`
  keeps its decision log on these terms.
- **Git is the archive.** Previous operational snapshots do not need to be reproduced here to be
  preserved; `git log -p` on this file is the record, which is why the August baseline table was
  removed rather than kept alongside its replacement.
- **The snapshot names one commit, once.** Recording the documentation commit's own hash would
  make every documentation change instantly self-invalidating, so the snapshot is anchored to the
  application state it was verified against.

`npm run check:docs` compares the framework and runtime versions stated in the snapshot against
what is actually installed, and fails when the `Verified:` date is missing or older than ninety
days. It checks staleness, not correctness: it cannot tell whether a test count is right, only
whether the document still claims to be current.
