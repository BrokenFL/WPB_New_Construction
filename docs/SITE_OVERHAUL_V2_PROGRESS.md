# WPB V2 overhaul — review record

## Focused follow-up — four-area homepage collection

This bounded continuation of draft PR #115 keeps the completed hero, masthead, Development Desk, closing artwork and buyer journeys intact while making the selected homepage preview more intentional. The collection now uses the exact order Olara / North Flagler, Nora House / Downtown, South Flagler House / South Flagler and OLIN Palm Beach / Palm Beach, with the copy `4 buildings, four different areas.` and `A curated preview across North Flagler, Downtown, South Flagler, and Palm Beach, drawn from 24 tracked buildings.` The existing selected-examples note and both complete-directory actions remain. Four-up desktop, two-by-two tablet and one-up mobile layouts use square media frames and aligned card actions.

OLIN uses the existing approved side-exterior asset, published from the user-provided approved PNG through the asset publisher; no new or generated imagery was introduced. [Focused evidence](evidence/site-overhaul-v2/homepage-four-area/README.md) includes the prior three-card references, fresh full-section Chromium desktop/tablet/mobile captures, loaded image metadata and the visual checks. Typecheck, build/postbuild, `qa:discovery-coherence` (36/36 Chromium/WebKit checks) and diff hygiene passed. Implementation source: `e580c04e0bd7b456f119043b4b89e699a47cbb90`; the later evidence commit contains documentation and captures only. Sol extra-high owned the ordering and composition decision, Luna Max handled the bounded implementation and capture work, and the lead performed the closing integration check. No model substitution was needed. Merge and deployment remain withheld.

## Current milestone — discovery and site coherence

This milestone continues draft PR #115 from `c2b2a00c01da5f46299d32092d0525e3b8fcd14c` and preserves the completed hero, Development Desk, bridge artwork, consent, Maps and buyer-flow contracts. It clarifies how visitors move from a representative homepage selection into all 24 buildings, all five areas, individual guides, comparison and relevant article research. It also replaces the active legacy-purple icon family with a reproducible WPB identity and keeps “WPB New Construction” as three words in site metadata.

Implementation source: `f826ceb3a6dece8bb5424d02995c15069119177a`. The later evidence commit contains screenshots and documentation only. The [discovery and site-coherence evidence](evidence/site-overhaul-v2/discovery-coherence/README.md) records the 24-building reconciliation, before/after desktop and mobile captures, two focused correction rounds, the independent final critique and verification results.

Sol extra-high owned the consequential discovery/art-direction review and returned a bounded GO after the final corrections, scoring discovery clarity 9.3/10, buyer UX 9.1/10 and art direction 9.0/10. Luna Max handled bounded inventory, implementation support, screenshots and regression verification. No model substitution was needed. No canonical facts, publishing order, paid service, parked automation, merge or deployment is included.

Local verification passed the production build, 36/36 Chromium/WebKit discovery checks, 54/54 final integration checks, search-identity checks, six Development Desk fixtures and diff hygiene. The exact final pushed head and CI result are recorded in the draft PR handoff.

## Current milestone — final composition and integration

This milestone continues draft PR #115 from `ca7893df1315fd484382a515b99c7ffb0fecd199`. It preserves the selected warm hero pixels, responsive derivatives, masthead, image-led Development Desk, newest-three publishing logic and original bridge artwork. The work resolves whole-page typography and actions, the phone opening, Alba's canonical-status presentation and the static hero's accessible/loading contract. It adds isolated future-news fixtures and targeted browser regressions without another content system or redesign.

Implementation source: `1d0dc31e15d0ae1916ad187f2575317436f9ea68`. Later evidence commits contain documentation and screenshots only unless explicitly recorded otherwise in the final evidence.

The [final integration evidence](evidence/site-overhaul-v2/final-integration/README.md) records the rendered critique, two focused visual correction rounds, source comparison, final captures and verification. The independent Astra extra-high reviewer judged the result 8.2/10 overall (desktop 8.4, phone 8.2, tablet 7.9). The tablet's inherited 2+1 featured grid remains less resolved; the score is not inflated to meet a target. Luna Max handled bounded implementation/capture work, Luna low ran the final bounded integration checks, and GPT-5.6 Sol extra-high performed the closing consequential review requested by Brooke. The lead retained integration ownership.

The [integration checklist](SITE_OVERHAUL_V2_FINAL_INTEGRATION.md) separates completed repairs from two owner decisions: the AI-assisted hero's architectural differences and the La Fontana citation/date pairing. No approved editorial data, canonical facts or public image assets are changed in this milestone. This is readiness for Brooke's review, not release approval.

Local verification at test HEAD `13d8f79cedfd062c5cc6c90c53456bde097a5d30` passed typecheck, plain build, the full repository test command, 54/54 final gap checks, 12/12 rendered static-hero checks, 84/84 milestone browser checks, synthetic-consent journeys and keyed Maps. The plain build was restored and is available at `http://127.0.0.1:5188/`; write requests are refused. [Full desktop/mobile, consecutive-phone and WebKit evidence](evidence/site-overhaul-v2/final-integration/visual-inspection.md) is tied to that source. Final pushed-head and CI identity belong to the later evidence commit and remain separate from this local result.

## Previous sprint — image-led Development Desk

This focused presentation sprint continues draft PR #115 from `5041bc179ac784300fa01fd32e399f2e8668c4d4`. The three newest approved publications and their genuine order remain controlled by the existing news pipeline. The selected warm hero, responsive derivatives, masthead and original closing artwork are locked.

The initial rendered review found a stretched desktop lead with a large gap above its actions, and three equally dense mobile articles. The new direction is one image-led feature with two compact illustrated briefs, shorter homepage-only wording and natural image/text proportions. Publication and source-report dates retain distinct meanings; contextual city imagery must not be presented as an acquisition-site or construction photograph.

The visual implementation and captures are based on `2ab98d65ec41eff5ba948e6bba15a5e35668b0be`; the final source with article-entry and QA repairs is `b23a4db9e7adb9d5ed8b74e702bc0d08c56a5f36`. [Development Desk evidence](evidence/site-overhaul-v2/development-desk/README.md) includes complete before/after desktop and mobile sections, source provenance, four optimized derivatives, responsive loading measurements and a fresh independent critique after two focused correction rounds. The built preview is `http://127.0.0.1:5188/#latest-developments`. No new generated scene or animation was introduced. Homepage visual sections and styles outside the Desk are byte-identical to the starting head. A bounded direct-article reliability fix hoists the existing inline image helper without changing its output; the evidence separates that repair and the source-aware repetition QA correction from the accepted visual composition.

[Final-integration requirements](SITE_OVERHAUL_V2_FINAL_INTEGRATION.md) explicitly carry the unresolved independent architectural verification of the AI-assisted hero, the full mobile opening sequence and the legacy-carousel/static-hero test reconciliation. No release approval follows from this sprint.

## Previous sprint — finish the Shorecrest hero

Draft PR [#115](https://github.com/BrokenFL/WPB_New_Construction/pull/115) now carries a focused hero finish over sprint 3. The solid masthead, unified opening, commercial copy and other homepage sections remain established. [Hero evidence](evidence/site-overhaul-v2/hero-finish/README.md) includes actual A/B ImageGen production, the approved source inventory, provenance, responsive derivatives, before/after screenshots, two correction rounds and a fresh final graphic critique.

The selected warm-mineral treatment is derived from the approved 1672 × 941 full-tower Shorecrest panorama. Larger approved entrance and terrace views were inspected and rejected for this composition, rather than confused with higher-resolution versions of the same view. The source already carries AI provenance. Desktop has three WebP sizes; mobile has two sizes of an independently composed portrait crop. No asset is upscaled. Localized contrast preserves a bright tower, and the caption explicitly identifies AI-assisted architectural rendering.

Implementation source: `e1b0becf89bb8e0e1c6c60e1c142376746d0ced9`. Final QA and pushed-head identity are recorded in the hero evidence and PR handoff. The final visual pass approved 1440/1024/768/390/320 captures. Mobile trades part of the left panorama and a shorter first screen for an unobstructed crown and upper facade; the source resolution still limits high-density detail. No numeric contrast-certification or field-performance improvement claim is made.

The closing bridge PNG is unchanged, as are canonical facts, buyer flows, news and automation. Existing floor-plan placeholders retain their previous image instead of inheriting the new hero binding. Generated derivatives are draft review assets; no warehouse approval promotion, merge or deployment occurred. Previews remain `http://127.0.0.1:5186/` (editable) and `http://127.0.0.1:5188/` (built, write requests refused).

## Sprint 3 — historical focused art direction

Sprint 3 continues draft PR [#115](https://github.com/BrokenFL/WPB_New_Construction/pull/115) on `codex/site-overhaul-v2`, from milestone-2 head `431b57dede3a23840f9c893d7c5ae2bedcbb27c8`. The [sprint evidence](evidence/site-overhaul-v2/sprint3/README.md) records the initial visual critique, improvement cycles, image provenance, before/after captures, independent reviewer findings and exact tested source identity. It supersedes earlier aesthetic grades for the current homepage; prior evidence remains historical.

The first impression now combines a solid ink masthead, a single image-led hero, a clear serif headline and direct building/compare/latest-story paths. The hero reuses the existing user-provided Shorecrest project rendering with an explicit rendering caption. No image pixels or architecture were generated. The original closing bridge remains unchanged. Quieter utility links, an asymmetric Development Desk, taller building images with subject-aware crops, flatter metadata, coordinated compare/NORA controls and balanced advisory/guide panels improve the page's hierarchy and rhythm. Initial hero copy now matches the existing commercial content before hydration.

Only restrained fine-pointer image hover and brief transitions remain; reduced motion disables them. No new motion library, parallax, autoplay, content pipeline or project facts were introduced. Existing shortlist, comparison, plan, inquiry-context, Maps and consent behavior is retained. This is a visual sprint over the functioning V2, not an architecture restart.

Final implementation source: `63608542c1d9be95138c2c7606d3fe9aec82d80a`. The later evidence commit contains documentation/screenshots only. The pushed PR head and final-head CI are recorded in the PR handoff, separately from local validation. No merge or deployment was performed.

Built preview: `http://127.0.0.1:5188/` (local, write requests refused); editable preview: `http://127.0.0.1:5186/`. Source-resolution limits in the reused hero, long mobile news/comparison sections, mixed inherited guidance components and unmeasured physical-device/field performance remain explicit limitations.

## Milestone 2 — historical implementation record

Milestone 2 continues draft PR [#115](https://github.com/BrokenFL/WPB_New_Construction/pull/115) on `codex/site-overhaul-v2`. It builds on the successful first V2 milestone; it is not a production release. Current evidence, scores, exact commit identities and validation are in [milestone 2 evidence](evidence/site-overhaul-v2/milestone2/README.md). The [first milestone record](evidence/site-overhaul-v2/README.md) remains historical evidence, including its below-target mobile score.

- Built preview: `http://127.0.0.1:5188/` (this computer only; POSTs refused).
- Editable preview: `http://127.0.0.1:5186/`.
- Visual Editor used and verified: `http://127.0.0.1:8797/`, with the real Vite iframe and 24 canonical project choices. No editor publication or content writes were performed.
- Base/current `origin/main`: `e0ff6b43faf9cec1b5450e6e830ca32466181b92`, verified September 19, 2026.
- Updated brief v1.1 copied verbatim from planning branch `11bf0ce748c453dd247e2996da335049e1f25f0e`; no planning-branch merge.
- Existing V2 starting head: `7e894c2b14f1d0613e4464c0a58aac9cbd0db7af`.
- Isolated worktree: `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction`. The primary SSD checkout remains clean on main; unrelated worktrees and the assets repository were preserved.

## Implemented direction

Seven official luxury/property/editorial sites informed the direction; The Modern House, Corcoran Sunshine and Olara were inspected more deeply on desktop/mobile. The [benchmark](evidence/site-overhaul-v2/milestone2/research.md) separates observed interface patterns from absent conversion evidence. Current Search Console access failed authentication; the older repository baseline is explicitly dated. No verified consented analytics report was available and parked analytics work remains parked.

The homepage retains direct building/compare discovery and adds a prominent Development Desk with the three newest approved stories. Publication and source-report dates are distinct; approved buyer implications connect into real project/corridor research. The existing publication pipeline determines ordering. The original skyline/bridge graphic is restored unchanged at the footer. Compare follows featured buildings, and the lower duplicate news feature is removed.

Mobile comparison now presents named project values by criterion with section navigation, while desktop retains the matrix. Forms use readable labels, flatter spacing and clear request summaries. Compare and selected-plan inquiries preserve buyer context. A new context clears an earlier request receipt. The plan viewer restores keyboard focus in WebKit as well as Chromium. Existing canonical status/delivery is no longer overwritten by stale asynchronous card copy; a conflicting legacy Olara count was removed from presentation prose, without changing canonical data.

The local Visual Editor's state endpoint and project selector were repaired to consume the canonical schema-safe helper and generated project projection. It remains local-only and noindex. No source approval, publication or lead-endpoint contract was replaced.

## Three focused cycles

1. Research checkpoint chose the discovery/news hybrid; restored the original artwork and implemented the initial news, mobile comparison and form treatment.
2. Independent art/graphic review led to a compact text-led news section, repaired modal contrast, readable consent, an improved embedded inquiry heading and an uncrowded 320px header. No fabricated development imagery was introduced.
3. Fresh buyer-task and cross-browser review repaired canonical-card hydration, compare/plan inquiry context, stale receipt state, WebKit focus return and a genuine inherited mobile corridor-grid overflow. Functional regressions were retested, not waived by scores.

Astra extra-high handled synthesis, design and fresh independent UX review; Luna Max handled bounded research, inventory, mobile implementation and browser QA. The lead owned integration. No model substitution was needed in milestone 2. The earlier milestone's disclosed Sol substitution remains in its historical evidence. Codebase Memory, approved assets, the Visual Editor and real browser tools were used; existing imagery was sufficient, so no new generated asset or paid service was needed.

## Scope and next decision

The [measurement plan](evidence/site-overhaul-v2/milestone2/measurement-plan.md) covers useful exploration, news-to-building journeys, return visits and qualified inquiries after a separately approved release. Scores are internal judgments, not measured conversion gains. Mobile comparison/form length and repeated lower-page invitations remain bounded weaknesses; physical iPhone/Safari and field performance are unverified.

No merge, deployment, live-health claim, 3D integration, canonical-fact mutation, new publishing pipeline or parked-automation activation is included. Brooke's next decision is review of the functioning preview and draft PR.

## Run locally

Run `npm run dev -- --host 127.0.0.1 --port 5186` for editing. For built preview, run `npm run build`, then `node research/scripts/preview-v2.mjs` (port 5188). Reproduce consent QA with `VITE_GA4_MEASUREMENT_ID=G-QATEST1234 npm run build`; all test analytics and leads must remain intercepted. The synthetic identifier changes no production configuration. Real Maps QA uses the existing local configuration without exposing its value.
