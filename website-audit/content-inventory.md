# Content inventory

Compiled 13 Sep 2026, before the professional-portfolio pass.

Sources consulted: the private CV revision of 19 Aug 2026, this repository's
`src/content/truth.ts` fact registry, the public GitHub account, the
`ai-engineering-portfolio` repository and its published site, and the deployed
site at `mzquadri.de`.

## Where the website actually lives

Two sites were in play, and only one is the professional website.

| | |
|---|---|
| **Website repository** | `github.com/mzquadri/ZQ` (Next.js 16, React 19, TypeScript) |
| **Deployment** | Vercel, on every push to `main` |
| **Production URL** | `https://mzquadri.de` (`zq-one.vercel.app` serves the same build) |
| **Architecture case studies** | `github.com/mzquadri/ai-engineering-portfolio`, served by GitHub Pages at `mzquadri.github.io/ai-engineering-portfolio/` |

The case-study site stays where it is. It is a separate artifact with its own
redaction review and its own public/private split, and folding it into this
repository would mean re-reviewing all of it under a different set of rules. It
is linked from here instead.

### The local working copy was not the site

`C:\Users\MohdZaminQuadri\zq` is a clone left at 31 Aug 2026: 102 commits ahead
of `origin/main` on a diverged branch and 120 behind it. The deployed site is
`origin/main`, which had a commit from the morning of this audit. All work in
this pass was done against a fresh clone of `origin/main`; the stale copy was
left untouched.

## Routes before this pass

`/` · `/work` · `/work/[slug]` (8 case studies) · `/work/medico` ·
`/work/reliable-knowledge-systems` · `/research` · `/research/thesis` ·
`/learn` (+ topic and level indexes) · `/about` · `/contact` · `/drive`
(redirect).

## Inventory

| Content | Website status before | Source | Freshness | Publish? | Belongs | Required update |
|---|---|---|---|---|---|---|
| Name, role, positioning | Published | Truth registry | Current | Yes | Hero, footer | None |
| Location (Munich) | Published on `/about` and `/contact` only | Truth registry | Current | Yes | Hero, footer | **Add to hero and footer** |
| Availability | Published | Truth registry | Current | Yes | Hero, contact | **Add to hero** |
| Email | **Withheld** — registry held `null`, "no durable email approved" | CV; public commit history | Current | Yes | Contact, footer | **Publish** the durable address |
| Phone number | Withheld | CV | Current | **No** | — | Keep withheld; gate added |
| Street address, photograph | Withheld | CV | Current | **No** | — | Keep withheld |
| CV / résumé | **Withheld** — purged from git history on 2 Sep 2026 after the private PDF was found reachable from the public repo | CV | Stale (none published) | Yes, **web-safe only** | Hero, About, footer, contact | **Generate** a web-safe PDF from the registry |
| Employment periods | **Withheld** by policy | CV | Current | Yes | About, home | **Publish** five approved periods |
| Employment titles and organisations | Published | Truth registry | Current | Yes | About, home | None |
| Education | Published, undated | CV | Current | Yes | About | **Add** years and locations |
| Master's thesis | Published in depth at `/research/thesis` | Submitted PDF | Current | Yes | Research | None — strongest section on the site |
| Certifications (2 × DeepLearning.AI) | **Missing** | CV | Current | Yes | About | **Add** |
| Languages (EN C1, DE A2→B1, HI/UR native) | **Missing** | CV | Current | Yes | About | **Add** |
| Architecture case studies | **Linked from nowhere** | Public repository | Current | Yes | Nav, hero, footer, own page | **Add** `/architecture` gateway |
| Legal-knowledge work (synthetic) | Published at `/work/reliable-knowledge-systems` | Own content module | Current | Yes | Work | Cross-link to the case studies |
| Medical-imaging work | Published at `/work/medico` | Own content module | Current | Yes | Work | None |
| Eight flagship case studies | Published | Public repositories | Current | Yes | Work, home | None |
| Nine supporting repositories | Published | Public repositories | Current | Yes | `/work` | None |
| AIESEC volunteering | Not published | CV | Current | **Demoted** | — | Left off: it is real, and it is not what an AI engineering portfolio is judged on |
| Capabilities with proof | Published | Registry | Current | Yes | About | None |
| Skills as a keyword wall | Never published | — | — | **No** | — | Stays out; capabilities carry proof instead, and the CV carries the grouped list |

## Verified against the CV, and corrected

- **Thesis title.** The brief proposed *Uncertainty Quantification for Graph
  Neural Network Surrogates of Agent-Based Transport Models*. The submitted PDF
  and the CV both give *Uncertainty Quantification for Machine Learning Models
  in Transportation Policy Analysis*. The site was already correct; no change.
- **Employment status.** *AI Engineer (Working Student)*, not *AI Engineer*.
  The site was already correct; no change.
- **Degree status.** The CV prints `2026` against the TUM entry and states
  *Master's thesis submitted May 15, 2026*. Published as a year plus the
  submission status; no conferral is claimed anywhere.

## What was deliberately not published

Phone number, street address, photograph, the private CV file, university
email (it expires with the enrolment), AIESEC, and any employer detail beyond
what the case-study repository already publishes after its own review.
