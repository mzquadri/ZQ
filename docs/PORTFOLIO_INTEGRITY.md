# Portfolio Integrity v1

## Frozen Baseline

The production baseline was recorded before the integrity changes on August 20, 2026.

| Item | Baseline |
|---|---|
| Repository | `https://github.com/mzquadri/ZQ` |
| Deployment branch | `main` (`origin/HEAD` and `origin/main`) |
| Commit | `4682564de4165b232590acc123fc881ae4a916eb` |
| Production URL | `https://mzquadri.de` |
| Runtime | Node.js 20.20.1, npm 10.8.2 |
| Framework | Next.js 14.2.35, React 18.3.1 |
| Working tree | Clean and aligned with `origin/main` |

The live production URL returned the content represented by this commit. Baseline lint,
type checking, content validation, compilation, and all 34 Playwright checks passed. The
dependency audit reported five high-severity vulnerable package entries and no critical
entries. No baseline tag was created because repository commits and tags are only written
with explicit release approval.

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

`https://github.com/mzquadri/ml-surrogates-thesis`

The submitted thesis PDF remains immutable. Corrections are labelled as post-submission
corrigenda or reproducibility updates. The two local migration sources reviewed for the
canonical repository were:

| Source | Reviewed commit | Disposition |
|---|---|---|
| `ml_surrogates_for_agent_based_transport_models` | `fdb4ef0c9c736576ae34d5e331d8b66a7a6d877a` | Merge audited evidence, tests, CI, limitations, and corrections |
| `ml_surrogates_thesis_final` | `4b95a3d8aca5929bb88b84bb7f7ae86c48e2f428` | Preserve submitted thesis artifact and canonical public slug |

Repository consolidation itself is a separate release operation. Until it is completed, the
portfolio points only to the agreed canonical destination and does not describe either local
source as canonical.

## Conflict Register

| Topic | Public decision | Evidence boundary |
|---|---|---|
| Exact-zero target share | 27.6% | Reproducibly audited target artifact; 88.7% belongs to the capacity-reduction input feature |
| Calibration | Keep both protocols separate | Graph 20/80 replay: ECE 0.269 to 0.048; final-thesis node 30/70 report: approximately 0.356 to 0.034 |
| Dataset scope | 100 held-out scenarios and 3,163,500 cached road-link predictions within a fixed 1,000-scenario subset | Not a claim about all MATSim data or fresh raw-data replay |
| Defect status | Do not publish “zero bugs” | Tests and audits bound known checks; they cannot prove absence of defects |
| Experience titles | Approved titles and organizations published in Recruiter Core v1 | No private duties, client details, or quantified employment impact inferred |
| Experience dates | Dates omitted; only the approved current BP status is shown | No employment dates are published |
| Education | TUM M.Sc. program with thesis submitted; AMU B.Sc. (Hons.) Mathematics | No claim of TUM defense, grade, graduation, or degree conferral |
| Contact email | Not published | No durable address has passed privacy review |
| Resume | One HTML record and one generated redacted PDF | Both derive from the typed registry; no email, phone, address, identifiers, or disputed dates |
| Repository status | `ml-surrogates-thesis` is the only canonical destination | It preserves the submitted artifact and separates post-submission corrections and audited evidence |
| Services | No public services offer | Services remain inactive until a real offer and operating boundary are approved |

Unresolved or unpublished facts must not be inferred into page copy, metadata, structured data,
repository descriptions, or social copy.

## Security Migration Result

The integrity changes upgrade to Next.js 16.3.1, React 19.2.8, ESLint 9.39.1, and the matching
Next.js ESLint configuration. It also migrates asynchronous App Router parameters and removes
the deprecated Edge runtime declaration from the generated Open Graph image.

After migration:

- `npm audit --audit-level=high`: zero vulnerabilities;
- `npm run check`: passed;
- Portfolio Integrity v1 `npm run test:e2e`: 39 passed and one expected desktop-only skip.
- Recruiter Core v1 local verification: 47 passed and one expected desktop-only skip across desktop
  and mobile Chromium, including 320 px reflow and resume coverage.
- Content Foundation v1 local verification: 55 passed and one expected desktop-only skip, including
  Learn routes, RSS, article metadata, static code and equations, axe scans, and 320 px reflow.
- Research Experience v1 local verification: 63 passed and one expected desktop-only skip, including
  the research index, thesis record, discrete selective-prediction control, scholarly metadata,
  axe scans, and 320 px reflow.
- Public website, GitHub profile, project repositories, and credited contributor profiles:
  resolved successfully on August 20, 2026. LinkedIn's exact profile path was manually
  verified because automated requests receive its anti-bot status.

Recruiter Core v1 was deployed from commit `8ac1cce5d5c362040a453dfdd5ec9f0d94fcbc2e`.
GitHub Actions passed all checks, both configured production deployments succeeded, and the live
home, resume, and MLOps case-study routes were smoke-tested on August 20, 2026.
