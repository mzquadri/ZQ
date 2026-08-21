# Evidence And Privacy Boundary

## Publication Standard

Every project is presented according to what can be supported by versioned local source,
configuration, reports, metrics, or repository history. Repository configuration supports
the public source links, but current third-party availability is not treated as experimental
evidence.

The typed publication source is `src/content/truth.ts`. Its source hierarchy, freshness rules,
canonical thesis decision, and conflict register are documented in
`docs/PORTFOLIO_INTEGRITY.md`.

The portfolio intentionally avoids numerical skill ratings, project counters, certification
counts, employer impact claims, and degree-completion wording that could not be corroborated.

## Thesis Provenance

The formal thesis title is **Uncertainty Quantification for Machine Learning Models in
Transportation Policy Analysis**. The safe status is **submitted at the Technical University
of Munich on May 15, 2026**. No public claim is made about a defense, grade, degree award, or
graduation.

The personal contribution is bounded explicitly: the work builds on the MATSim corpus and
PointNetTransfGAT infrastructure of Natterer et al. It adds and evaluates training variants,
MC Dropout, deep ensembles, sigma scaling, split/adaptive conformal prediction, selective
prediction, CQR, and error/calibration diagnostics. It does not claim original authorship of
the simulation corpus or base architecture.

Reviewed aggregate evidence used by the site includes:

| Claim | Scope and boundary |
|---|---|
| 100 held-out scenarios / 3,163,500 road-link predictions | Fixed 1,000-scenario study subset |
| Deterministic Trial 8: R² 0.596, MAE 3.96 veh/h | Point prediction result |
| MC Dropout Spearman rho 0.482 | Ranking association, not calibration or causation |
| Raw nominal 95% Gaussian coverage about 54.8% | Evidence of under-dispersion |
| 50% selective retention: MAE 2.32, 41.2% reduction | Retrospective review-capacity trade-off |
| Five-model ensemble: R² 0.684, MAE 3.49 | Higher compute; uncertainty rho 0.400 |
| Split conformal: 90.02% / 95.01% | Final-thesis reported marginal coverage |

The replayable graph-based calibration protocol (20/80 graph split, ECE 0.269 to 0.048)
and final-thesis random-node protocol (30/70 split, reported ECE 0.356 to 0.034) remain
separate. They are not pooled or presented as the same experiment.

The correct exact-zero target share is 27.6%. The separate 88.7% value belongs to the
capacity-reduction input feature and is prohibited by validation as a public target claim.
The submitted PDF is immutable; maintained sources describe this as a post-submission
corrigendum or reproducibility update rather than silently changing the submitted artifact.

## Project Boundaries

- InsureAssist is a local engineering prototype. Docker was verified and Kubernetes files
  were authored; a completed GKE or production deployment is not claimed.
- The MLOps project is a reference pipeline with a deterministic synthetic fallback, not a
  deployed production system or a real-data accuracy result.
- Hydrology UQ is three-person TUM group coursework. Individual ownership of each assignment
  result is not claimed and authorized course inputs are unavailable.
- CIFAR-10 reports only the tracked 64.26% bounded run, not an aspirational result.
- Streamflow forecasting reports synthetic one-step behavior, not real-catchment or recursive
  multi-day performance.

## Data And Personal Privacy

The site does not include or collect:

- phone numbers, email addresses, street addresses, student identifiers, or signatures;
- a contact form, analytics, cookies, tracking pixels, or remote font requests;
- raw MATSim scenarios, row-level predictions, spatial road-link exports, model checkpoints,
  serialized loaders, local paths, or confidential research data;
- any resume field not present in the approved Recruiter Core truth registry.

Contact is limited to verified GitHub and LinkedIn profile links. The canonical HTML resume
and generated PDF omit email, phone, address, identifiers, and disputed employment dates.
Linked repositories retain their own licenses and privacy obligations.

## Reviewed publication decisions

**2026-08-22 — profile portrait approved for publication.**

A photograph of the site owner is published in the homepage hero and at the top of
`/about`. This is the first personal identifier on the site and was approved explicitly
rather than by default.

Checked before approval, and re-checked on every build by `scripts/validate-content.ts`:

- all EXIF, XMP and IPTC metadata segments stripped from the committed JPEG
- no GPS reference anywhere in the file
- file is a JPEG and under 900 KB
- the image is served from this origin only; no third-party image host is involved

The check runs against the committed file rather than trusting the strip step, so a
future re-export that reintroduces metadata fails the build.

Nothing else about the privacy boundary changes: no email, phone number, address, or
other personal identifier is published, and the site still collects nothing.
