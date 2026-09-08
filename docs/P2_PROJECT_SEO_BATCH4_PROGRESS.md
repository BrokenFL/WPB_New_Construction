# P2 Project SEO Batch 4 — Rosewood + Maison d’Or

Updated September 8, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`. Draft PR: #80.

## Release state

**Implemented and fully tested; NOT approved, merged, deployed or measured.** Brooke review remains the release gate. PR #80 must remain draft until that review. This correction did not start another non-3D growth batch and did not change PR #75, analytics, Maps behavior, Alba’s unpublished state, or any 3D work.

Batch 4 improves only the existing canonical Rosewood Residences West Palm Beach and Maison d’Or buyer-guide pages. Copy, source qualifications, schema/metadata, target-page-only CSS, H1 correction, inquiry attribution, and the previously corrected CSS static-file link validation are retained.

## Deterministic same-session request defect

Historical failed candidate [run 34264240516](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34264240516) at `d061b8883cf6a33deb79e0054c50f6be373e3263` is preserved. Both keyed and no-key modes reached the Batch 4 browser contract and failed the same deterministic transition: after a prior availability request, the next explicit pricing-packet URL carried `Pricing + floor-plan packet`, but the inquiry form and submitted payload retained `Request current availability`. Rosewood alias normalization and `source_page` were already correct.

Root cause: the legacy route/query initializer recognizes the existing inquiry values (`availability`, `floorplans`, `compare`) but has no select option or mapping for Batch 4’s exact buyer-facing `Pricing + floor-plan packet` value. The shared inquiry bridge deliberately defers whenever an explicit query-driven request is present. Therefore, within one SPA session, a new Batch 4 query could inherit the previous auto-populated interest.

The narrowest architecture-consistent correction is scoped to the existing Batch 4 enhancer, not the shared inquiry bridge or a new endpoint. Corrective implementation commit `e04b83908b789b075997ef02905668049134a7b1` adds an allowlisted Batch 4 inquiry-request resolver and a per-navigation request fingerprint. On a changed, explicit Batch 4 `/inquire/` query, it applies the canonical project and exact requested interest once, adds the packet option only when required, refreshes `source_page`, and clears only stale request-family presentation metadata. Repeated DOM mutations for the same fingerprint do not reset buyer edits. First-touch landing/referrer/campaign attribution remains owned by the existing attribution store and is not cleared or rewritten.

An intermediate attempt to put this synchronization in the shared inquiry bridge was rejected by the workflow’s protected-surface guard. The bridge was restored byte-for-byte before the final candidate. This is retained as architecture evidence rather than recast as a passing candidate.

## Regression coverage

Focused coverage now verifies Batch 4 query ownership and real same-browser transitions without clearing session storage or creating a new context for every CTA. The browser contract verifies CTA alias, URL interest, canonical form project, exact form interest, canonical payload project, exact payload interest, explicit `source_page`, preserved first-touch `landing_page`, one intercepted submission per action, and no contact PII in analytics.

Same-session coverage includes Rosewood availability → pricing packet, Rosewood pricing packet → availability, Maison d’Or availability → pricing packet, Maison d’Or pricing packet → availability, Rosewood ↔ Maison d’Or switching, an existing Olara request → Batch 4, and Batch 4 → an existing corridor request. Existing commercial, corridor, comparison, shortlist, floor-plan and inquiry regressions remain part of the complete candidate suite. The fingerprint applies each changed Batch 4 request once so later form changes remain buyer-controlled rather than being reset by a MutationObserver/render loop.

## Final green implementation candidate

**Exact tested implementation SHA: `b0f0f216f73abb4d42466c6c0aeaeb50325f380f`.**

Final implementation [run 34266304318](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34266304318) is fully green:

- Live six-page Olara audit: SUCCESS, job `102196476654`.
- Keyed candidate: SUCCESS, job `102196476903`.
- No-key candidate: SUCCESS, job `102196476943`.
- Aggregate Batch 4 review gate: SUCCESS, job `102198970372`.
- Both candidate modes passed production ancestry/protected-surface checks, typecheck, build, complete `npm test`, Batch 4 source/browser/inquiry contracts, standard and strict asset audits, SEO, gatekeeper, and all existing commercial/corridor/comparison/floor-plan/integration journeys.
- Keyed mode passed deployment preflight and actual Google Maps verification.
- No-key mode passed the expected production-deployment rejection.
- Batch 4 desktop/mobile, JavaScript-on/off screenshots and inquiry evidence were generated and retained in the candidate artifacts.

Artifacts:

- Keyed `10072221163`, SHA-256 `9d2e9a90c31bbbad836c883a38c39122c32ccceaac12d1a0cf2815deebf24b8b`.
- No-key `10072232379`, SHA-256 `f9b6b63ebef670358fb1372ab3bde14594d34ecf3c9a2fc32fea86e94ed0580f`.
- Live Olara `10072055929`, SHA-256 `42db7b4871d583595982f168f1c8fb5f131ffa8e719477af3e2a063ab9ca38b2`.

The earlier stylesheet/internal-link failure [run 34257823442](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34257823442) remains historical evidence. It is resolved and was not revisited during this correction.

## Limitations

All lead submissions in candidate browser QA are intercepted; no real lead, email, CRM delivery or CAPTCHA production path is certified by this draft review. The live Olara audit validates the already deployed six-page Olara release, not deployment of Batch 4. PR #80 has not been deployed, so there is no production Batch 4 live verification or measured search/conversion outcome yet. Existing dependency findings, asset advisories and chunk-size warnings remain separate maintenance items rather than Batch 4 regressions.

No merge or deployment is authorized by this record. Brooke’s final review is required.