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

- phone numbers, street addresses, student identifiers, or signatures;
- any email address other than the one approved in the typed registry;
- a contact form, analytics, cookies, tracking pixels, or remote font requests;
- raw MATSim scenarios, row-level predictions, spatial road-link exports, model checkpoints,
  serialized loaders, local paths, or confidential research data;
- any resume field not present in the approved Recruiter Core truth registry;
- a downloadable CV or resume, in any format, at any path.

One email address is published, and only one: the approved personal address recorded in
`src/content/truth.ts`. `scripts/validate-content.ts` compares every address found in the
rendered source against it and fails on anything else, which is a narrower rule than the blanket
prohibition it replaced rather than a looser one.

A generated, web-safe PDF was published for a time and has been withdrawn. What it carried is
unchanged and still published as pages: roles and the periods they ran for, education, the thesis,
certifications and languages, all read from the same typed registry the document was built from.
Linked repositories retain their own licenses and privacy obligations.

### Private evidence, public fact

Several published facts are extracted from a document that is itself unpublished. The registry
names it as the source - `Curriculum vitae, revision of 2026-08-19 (privately held)` - for the
employment periods and locations, the certifications, and the languages.

The distinction the site keeps is between the evidence and the artifact:

```
privately held curriculum vitae   ->   approved extracted fact in truth.ts   ->   public page
        (never served)                    (typed, sourced, dated)              (/about, /contact)
```

Naming the source is provenance, not publication. The document has no public path, and the
generated web-safe PDF that once stood in for it has been withdrawn; what remains public is the
extracted fact and the record of where it came from.

The submitted thesis PDF is the deliberate exception. It is an immutable public artifact in the
canonical research repository and is cited at a pinned path, because a research claim that cannot
be checked against the document it came from is worth less than the document.

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

Nothing else about the privacy boundary changed at that time: no email, phone number, address,
or other personal identifier was published, and the site still collects nothing. The email
position was revisited on 13 September 2026 and is recorded below; phone number, street address
and other identifiers remain unpublished.

**2026-08-26 — employer-confidential case study authored as a draft, not approved for publication.**

A case study about professional work at BP-IT Consulting & Solutions GmbH exists in this
repository at `/work/legal-knowledge-platform`. It is the first project on this site whose
claims cannot be checked against a public repository, and it is **not approved for
publication**. No approval has been requested or granted. It renders locally and on a preview
deployment so it can be reviewed; a Vercel production build drops it from the route list, the
work index, the sitemap and the generated metadata.

What the page does publish:

- the architecture in generic role names — publisher source, ingestion, structure processing,
  projection, verification, relational store, vector store, knowledge graph, source evidence;
- reasoning about correctness: why equal counts are not agreement, why measurement is separated
  from mutation, what each class of evidence rules out and what it leaves open;
- a contribution statement that separates work personally implemented from work materially
  extended and from patterns that pre-existed the author on the platform;
- structural facts in place of scale — how many independent representations exist, how many
  services may write each one, what a verdict is bound to;
- limitations, including the checks the system cannot perform at all.

What is deliberately excluded, and enforced rather than remembered:

- **No employer source code.** Nothing was copied into this repository. The employer
  repositories were read only to reconstruct the architecture and to establish, from commit
  authorship, which contributions are the author's to claim.
- **No corpus scale.** Not the number of documents, verification gates, schema migrations,
  automated tests, services, or records in any store. Illustrative quantities in the figures are
  spelled as words so a reader cannot mistake an example for a measurement.
- **No corpus content.** No document text, no citation, no identifier of any published
  instrument. All figure data is synthetic.
- **No internal identifiers.** No service names, repository names, topic names, bucket names,
  table or column names, file paths, migration numbers, finding identifiers, or commit hashes.
- **No infrastructure.** No hostnames, internal domains, IP addresses, registries, or endpoints.
- **No screenshots.** Every operator view of that system displays live corpus state, so no
  screenshot of it appears here. All figures were drawn for this site.
- **No colleagues.** Authorship is the site owner alone; no other person is named.

Checked on every build by `scripts/validate-content.ts` and
`scripts/confidential-content.ts`, and exercised against deliberately invalid content in
`tests/confidential-project.test.ts`:

- a confidential project publishes no repository link and no artifact links, in the page, in the
  work index, and in the `CreativeWork` structured data;
- no rendered field contains a URL, bare scheme, IPv4 address, `localhost`, or a private domain
  suffix;
- no rendered field contains a number of two digits or more, which is how scale disclosure would
  most plausibly arrive;
- a draft states why it is a draft, and an approved project carries an approval reference, the
  date it was given, and the date it must be reviewed again;
- a production build fails if an unapproved confidential project would be published.

Drafts are validated on the same terms as published content, so approval is the only thing
outstanding rather than the point at which review begins.

**Approval status at the time of this work: none.** Publication requires an employer approval
recorded against the project as `publication: { status: "approved", … }`. Until that exists, the
page cannot reach production, and this note should not be read as suggesting that it may.

**2026-09-13 — a withheld case study's narration was reaching production, and has stopped.**

The confidential case study is excluded from production builds by the publication gate, and the
route was correctly absent. Its *walkthrough script* was not. The guided-run controller is a client
component loaded through `next/dynamic`, which keeps it out of the initial payload but still emits
it as a separately fetchable chunk — and the controller imported the script, so the study's title
and its eleven step captions were served as a static asset to anyone who requested that file.

The copy was sanitised: generic reasoning about counts, captures and evidence, with no service
name, no corpus content and no employer identifier. The defect is not what it said. It is that an
unapproved page was readable in pieces from an approved build, which is the thing the gate exists
to prevent.

Fixed structurally rather than by redaction. The script is now a prop passed down from the server
component that renders the walkthrough, and that component only renders for a project the
publication gate has allowed. A production build has nothing to emit, verified against
`.next/static` directly.

*How it was found, and what changed in the check.* `tools/privacy-scan.mjs` had two tiers: terms
that may never appear anywhere, and a build-only tier holding five store technologies — Neo4j,
MinIO, PostgreSQL, Apache Kafka, BGE-M3 — on the reasoning that those words appear in the draft
and nowhere else. That tier was wrong in both directions. It was weaker than it looked, since a
leak of the draft carries its title, its provisions and its employer framing, and matching five
product names is a poor way to notice. And it was over-broad, because those names are not employer
secrets: the architecture case-study site publishes them against this same work under its own
redaction review, and a tutorial here that cannot write "Kafka" is not protecting anything. Qdrant
was already exempted on exactly that reasoning.

The tier now asserts the withheld study's own route, slug, title and role line are absent from
anything a browser can fetch. That is the property the gate is for, and it is what caught this.
Everything genuinely employer-identifying — repository names, internal hosts, internal service,
table and state names, local filesystem paths — stays in the always-tier, unchanged and unrelaxed.

**2026-09-13 — contact address and employment periods published; downloadable CV withdrawn.**

Three decisions, recorded together because they were taken together and one of them was reversed.

*The approved personal email is published*, on `/contact` and in the footer. It was withheld for
want of a durable address; the address published is the one already carried by public commit
history, so publishing it discloses nothing that was not already disclosed. The university
address on the privately held CV is deliberately not used, because it expires with the
enrolment. `scripts/validate-content.ts` fails the build on any address in the rendered source
other than the approved one.

*The five approved employment periods are published*, in one format, from the registry. They were
withheld on the reasoning that an undated list of five roles still reads as a career narrative;
the disciplines grouping on `/about` answers that better, and it never answered how long anything
ran, which a reader of a portfolio is entitled to. Each period is transcribed from the privately
held curriculum vitae, and `validate:content` fails on any rendered range that is not one of them.

*A generated, web-safe CV was published and has since been withdrawn.* It carried no phone number,
street address or photograph, because none of those were in the content module the generator read.
It is gone: the PDF, the generator, and the module that fed it. `/resume`, `/cv` and every CV or
resume PDF path return 404, no page offers a document download, and both the content validator and
the end-to-end suite assert the absence rather than merely no longer asserting the presence.

What did not change: no phone number, no street address, no student identifier, no signature, no
contact form, and no collection of any kind. The privately held CV remains evidence rather than
an artifact — named in the registry as the source of specific facts, and served nowhere.
