# November 5 building-fact review

Base: clean synchronized `main`, `d7be45a48f49cee655050c60a051ae64ebce2228`. Preserve the October 10 3031 approval release and every later release. Brooke's current instruction authorizes routine verified fact updates through publication; it does not authorize schedules, blanket schema promotion, unrelated news policy changes or acquisition of credentials.

| Project / field | Previous guidance | Reviewed current guidance and scope |
|---|---|---|
| Ritz-Carlton / delivery | Q1 2028 developer target | **Q2 2028 BH Group expected completion; confirm current schedule.** Update the winning reviewed value, canonical/Compare/copy and existing emitted delivery PropertyValue together. This is a changed sponsor target, not proof of a delay's cause/date or a contractual guarantee. |
| 2001 North Flagler / identity | Reported Rosewood association unconfirmed | **2001 North Flagler (Rosewood Residences per BH Group).** BH Group explicitly identifies this site as its Rosewood project. Keep the site-first identity, existing route and Place schema; independent Rosewood confirmation and offering documents remain separate. |
| 2001 North Flagler / program and size | Municipal 90-unit program; size unknown | BH Group describes **90 condominiums averaging approximately 3,300 sq ft**. An average is not a residence-specific range or floor plan. Numeric count/physical schema holds remain; no inventory, launch, pricing, construction or delivery inference. |
| Arkona / proposal | 16 reported; primary plan to confirm; 26/16-story secondary discrepancy | City **June 25, 2026 pre-application agenda**, page 2, describes **PRE-APP-26060039**, a **25-story mixed-use proposal with 16 multifamily units and commercial uses**. Display this as a historical proposal and retain planning status, current-plan/height uncertainty and numeric inventory omissions. |
| Arkona / later municipal action | Limited easement evidence | City's **September 1** recap of **August 31** decisions and the August 31 agenda concern **sidewalk development-space easements at 201/203 Arkona**, not full tower approval, building permits, construction or sales launch. Preserve the heading **212-26** versus paragraph **212-16** discrepancy. |

## Sources and date provenance

- [BH Group Ritz-Carlton](https://www.bhgroupmiami.com/projects/the-ritz-carlton-residences-at-west-palm-beach/): HTML and browser inspected November 5. Expected-completion target is Q2 2028; publication and target-change event dates are unknown.
- [BH Group Rosewood](https://www.bhgroupmiami.com/projects/rosewood-residences/): HTML and browser inspected November 5. It names 2001 N. Flagler, 90 units and the 3,300 sq ft average. Publication/event date unknown. The “Currently Selling / Under Construction” text belongs to separate related-project cards, not evidence of this project's stage.
- [City June 25 pre-application agenda, page 2](https://www.wpb.org/files/assets/city/v/1/development-services/documents/plans-amp-plats-review-committee/2026-pprc-agendas/pprc-pre-app-agenda-june-25th-2026.pdf): text and rendered page inspected. An agenda is proposal evidence, not proof of the meeting's outcome or current inventory.
- [City recap published September 1](https://www.wpb.org/News-Folder/News-2026/090126-Mayor-CC-Approvals-and-Decisions): ordinary browser inspected after text-fetch 403. It describes August 31 decisions. No authentication or access controls bypassed.
- [August 31 agenda, page 8](https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-pass-fail-agendas-pfa/2026-08-aug-pfa/pf-08_31_26_city-commission-agenda.pdf): rendered page inspected. The inconsistent resolution numbers are preserved instead of silently corrected.

Private source bytes/hashes, served baseline, screenshots and verification results remain under `.runtime/building-facts-2026-11-05/` and `output/playwright/building-facts-2026-11-05/`. The paired override changelog and Git parent record prior values/reasons. Current retrieval/revision dates are not substituted for unknown event/publication dates.

## Unresolved queue

- **Rosewood:** independent brand confirmation, offering documents, current inventory/pricing, sales launch, construction stage, delivery and residence-specific dimensions. Keep numeric/status/timing/address schema holds; the qualified name does not emit a Brand relationship.
- **Arkona:** current/final plan and height versus historical 25-story and secondary 26/16-floor descriptions; full tower approvals, permits, schedule, offering and inventory; resolution **212-26/212-16** discrepancy. Preserve planning status and count/status/timing schema holds.
- **Ritz-Carlton:** residence-specific/contractual completion, current availability and unchanged address distinctions. The sponsor target alone does not resolve them.
- **Fees:** listing-level secondary fee claims remain unit-specific research; no new numeric or building-wide dues are approved by this review. Existing fee and policy values are outside this correction.

## Durable integration

Use [the incremental release procedure](REVIEWED_BUILDING_FACT_RELEASE.md) in this same release-owner task. `npm run facts:refresh -- --projects=<reviewed-public-slugs>` regenerates existing consumers without media/news churn; the same scope on `facts:check` verifies idempotence and restores its temporary output. Failure rollback, required scope, no-change behavior, preservation of unrelated curated rows, export adjacency and literal URL/dollar-value handling have dedicated regression coverage. The P2 manual-override guard and all prior schema-safe flags are preserved. Codebase-memory tools were unavailable; direct source tracing, history and current consumers confirmed the boundaries.

Acceptance also aligns existing resource links in prerendered and client-generated project schema through one shared helper, without changing factual holds or identities. Directory sorting reads the first reported count instead of concatenating numbers from dated qualifications. Map title/detail readback uses keyboard selection because existing adjacent marker hit areas overlap; pointer hitbox redesign is outside this release.

Final validation, exact commit/push, deployment and live readback are recorded in the task handoff and private release evidence. No schedule was created or changed.

Local validation passed: typecheck; production build using Vite's runner loader after a local bundler startup stall; all **160** full-suite Node tests; **55** Fast Cycle tests; launch QA and gatekeeper; **40** affected-page checks including fresh/client navigation in Chromium/WebKit at desktop/mobile sizes; **24** client-navigation resource-link parity checks; **256** parsed route graphs without Offers/availability; scoped regeneration idempotence; asset audit with no blockers, broken references or local-path leaks. All 21 other public models and site-fact rows, routes, schema-safe flags and fee/policy values are preserved. Real lead submission was not performed; map pointer hitbox redesign was not part of this acceptance.
