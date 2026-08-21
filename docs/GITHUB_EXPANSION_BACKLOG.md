# GitHub Expansion Backlog

Identified during Website Completion v1, updated after GitHub Expansion Sprint 1. This
document **identifies** future work. It does not authorise creating repositories, and
nothing here has been created, forked, or archived.

Ordering preference for every pillar, without exception:

1. Extend a strong existing repository.
2. Start an original project only when no existing repository can carry the capability.
3. Fork only when the due diligence below is complete and recorded.

Never create activity for its own sake. An empty repository, a scaffold, or a fork with no
substantive extension is worse than an absent one, because it dilutes the repositories that do
carry evidence.

## Capability pillars

| # | Pillar | Current state | Preferred next move |
| --- | --- | --- | --- |
| 1 | Reliable ML / UQ | Strongest pillar. `ml-surrogates-thesis` carries audited artifacts and a corrigendum. | **Extend.** The replication named in the case study: fit preprocessing on training data only, then test transfer across networks and intervention families. |
| 2 | MLOps | Released. `MLOps-End-to-End-Pipeline` now runs on a licensed dataset with a published bundle, container integration in CI, and 99 tests. | **Extend.** Slice-aware evaluation: per-source metrics on the held-out split, and a gate that can refuse a model strong overall but weak on one source. |
| 3 | RAG / Document Intelligence | `insureassist-rag-mlops` is an engineering prototype. | **Extend.** Real unit and integration tests, then a defensible retrieval evaluation, before any flagship promotion. |
| 4 | Agentic AI | No public project. Represented on the site only as a direction of study. | **Original**, once a specific problem justifies tool routing. Do not ship a chat demo. |
| 5 | Decision Analytics | `Supply-Chain-Analytics-Dashboard` versions code without data or verified metrics. | **Extend.** A licensed fixture, a deterministic reference run, screenshots, and callback tests. |
| 6 | Time-Series Forecasting | Split across `Time-Series-Streamflow-Forecasting` and `Deep-Learning-Flood-Prediction-LSTM`, both synthetic. | **Consolidate and extend** into one benchmark with identical chronological and recursive horizons. Prefer licensed real data; keep synthetic data only as a CI fixture. |
| 7 | Data Engineering / Streaming | `career-data-lab` is local only. | **Extend privately** until it contains a substantive validated ingestion-to-store workflow. Do not publish a scaffold. |
| 8 | Multimodal AI | No public project. | **Original**, lowest priority. No credible near-term evidence path. |
| 9 | LLM Evaluation | Partially present inside the RAG prototype's evaluation fixture. | **Extract and extend** once the retrieval evaluation in pillar 3 exists and is worth generalising. |
| 10 | ZQ platform engineering | This repository. Active. | **Extend.** Video system, then lab, per the platform roadmap. |

## Consolidation carried over

From the workspace project catalogue, still outstanding:

- Merge `ml_surrogates_for_agent_based_transport_models` and `ml_surrogates_thesis_final` into the
  canonical `ml-surrogates-thesis`, then archive the duplicate remote.
- Merge the two forecasting repositories as described in pillar 6.

Archiving is a separate, explicitly approved action. Nothing is archived as part of this
milestone.

## Fork due diligence

No fork is recommended at this time. The required diligence has not been performed for any
candidate upstream, and recommending one without it would be exactly the "random fork to populate
the profile" this backlog exists to prevent.

Before any fork is proposed, all nine records below must be filled in and reviewed:

1. **Upstream repository** — canonical URL and current default branch.
2. **License** — exact license, and whether the intended extension and attribution comply with it.
3. **Maintenance quality** — release cadence, open issue and PR responsiveness, last meaningful
   commit. A dormant upstream is a reason to reconsider, not a reason to fork faster.
4. **What it currently provides** — the capability that already works, stated concretely.
5. **Missing capability** — the specific gap, stated as a problem rather than a feature list.
6. **Substantial extension idea** — what would be built, and why it is substantial rather than
   cosmetic.
7. **Tests and evaluation** — how the extension would be proven, including the fixture or dataset
   and its licensing.
8. **Attribution plan** — how the upstream authors are credited in the README, the repository
   description, and any published write-up.
9. **Upstream PR potential** — whether the extension should be contributed back instead of
   maintained as a fork. If it should, the fork is a staging area, not the destination.
