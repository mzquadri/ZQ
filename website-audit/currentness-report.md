# Currentness report

Every date, status and count on the public site, checked against the CV
revision of 19 Aug 2026 and the repositories, on 13 Sep 2026.

## Stale items found, and what was done

| Item | Found | Resolution |
|---|---|---|
| **The architecture case studies were linked from nowhere** | `grep` over `src/`, `content/` and `scripts/` returned zero references to `ai-engineering-portfolio` or `mzquadri.github.io`. The strongest single artifact in the portfolio was reachable only by guessing the GitHub URL. | Added `/architecture`, a navigation entry, a hero action and a footer link. |
| **No CV** | The site published none, and the private PDF had been purged from git history on 2 Sep 2026 after it was found reachable at `raw.githubusercontent.com`. | Published a **generated, web-safe** CV. It is built from the fact registry by `tools/gen-cv.ts`, so it has no phone number, street address or photograph to leak — those are not in the module the generator reads. |
| **No email** | The registry held `email: null` with the reason "no durable email approved for publication". | Published the address already attached to public commit history. It is durable, and it is already disclosed, which answers both halves of the original objection. The university address on the CV was rejected: it expires with the enrolment. |
| **No employment dates** | A deliberate policy, enforced by a build gate. It left a reader unable to tell whether a role ran for three months or three years. | Published the five periods from the CV. The gate was not removed: it now checks that every period matches one approved format and that every range rendered anywhere is one of the five, so an invented date still fails the build. |
| **Certifications and languages absent** | Both are on the CV; neither was anywhere on the site. | Added to `/about` as section 04. |
| **Paired roles ran oldest-first** | Under *Numerical methods*, Apr 2022 preceded Aug 2023. Harmless while undated; reads as a mistake once dates are visible. | Reordered newest-first. |
| **The identity was below the fold under reduced motion** | With the scroll choreography off, the hero figure becomes an ordinary ~700px block and pushed the name to `top=877`, the location to `1480` and every call to action to `1525`. The reader least well served by a scroll-driven page had to scroll furthest to learn whose site it was. | Under `prefers-reduced-motion: reduce` the identity is now ordered first. Both paths put name, role, location, availability and four actions in the first viewport. |
| **Footer carried no identity** | Name, role and location appeared nowhere on it. | Added, with CV and email alongside the existing links. |

## Checked and found current — no change needed

- **Thesis title.** `Uncertainty Quantification for Machine Learning Models in
  Transportation Policy Analysis`, sourced from the submitted PDF. The
  alternative title proposed in the brief is not what the document says.
- **Thesis status.** "Master's thesis submitted", never "graduated", "degree
  awarded" or "completed". The forbidden-claims gate still enforces this.
- **Employment title.** "AI Engineer (Working Student)" — the working-student
  status is stated, not elided.
- **Education.** TUM 2026, AMU 2021, both as printed on the CV.
- **Slide and diagram counts** on the case-study site: twenty diagrams, twelve
  deck slides, eleven walkthrough steps. Corrected in that repository earlier
  the same day and referenced here at those values.
- **Repository snapshot.** `origin/main` carried a commit from this morning
  dropping two repositories that had gone private and correcting one rename.
- **No "student" claim** appears anywhere except inside the approved job title.
- **No `portfolio/index.html`, no BP-prefixed filenames, no old repository
  names** anywhere in this repository.

## Gates that now hold these facts

Run by `npm run check` and `npm run test:e2e`:

- Every email in the rendered source must equal the one approved address.
- The published CV path must be the approved one and the file must exist.
- No telephone number may appear in the rendered source.
- No private CV filename may appear in the rendered source.
- Every employment period must match the approved format; at most one may end
  in "Present".
- Every date range rendered anywhere must be one of the five approved periods.
- The published CV must be served, must not contain a phone number, and the
  private filenames must 404.
- The architecture entry must exist in the navigation, and the gateway must
  offer at least five routes into the case studies.

`tools/privacy-scan.mjs` passes clean against a production build
(`VERCEL_ENV=production`). Against a local build it reports the confidential
draft, which is correct and expected: `draftsAreVisible` is
`process.env.VERCEL_ENV !== "production"`, so the draft renders locally for
review and is absent from production. `https://mzquadri.de/work/legal-knowledge-platform`
returns 404, which is the check that matters.
