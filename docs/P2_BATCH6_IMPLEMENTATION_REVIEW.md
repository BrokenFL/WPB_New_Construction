# P2 Batch 6 implementation review

September 10, 2026 · PR [#86](https://github.com/BrokenFL/WPB_New_Construction/pull/86) historical baseline · PR [#93](https://github.com/BrokenFL/WPB_New_Construction/pull/93) current corrective release.

## Disposition and revision evidence

**PR #86 acceptance: PASS — all nine keyed/no-key/aggregate jobs are green.** Approved PR #86 head is `e8483fc3a7a43aabd1827b98667f60f64ff0deb1`; merge commit/production was `2d0175eed5157afa58b57cfb8327ec590e2dda95`. The mobile hit-target overlap that originally blocked live acceptance was resolved by PR #93 (merge `2469a47`, deploy `34534298501`) and PR #94 (approved head `46dd798126dc0aeb51915dfdbb4f72c6d0604476`, merge/production `21fbee181f2e9a7c0a0a59eb90dede5b81b57db6` at `2026-09-10T23:41:42Z`, deploy `34543286815` at `https://5027093e.wpbnewconstruction.pages.dev`). Post-deploy live acceptance on fresh 320px/390px and desktop contexts passed all consent, Maps-control, Ask WPB, denial-persistence and overflow checks. **Batch 6 is IMPLEMENTED / TESTED / APPROVED / DEPLOYED / LIVE-VERIFIED; NOT MEASURED.**

| Evidence | Exact revision/result |
| --- | --- |
| Last application change | `85eeae70d59fdbc87f169692dc6464128910bbbf`; application sources are unchanged in subsequent QA/workflow/documentation commits |
| Retained screenshots/evidence | QA revision `593abf507ed302b8b422f95b2510892b87173156`; provenance is preserved in [Screenshots](#screenshots) |
| Pushed QA revision | `3cc9052c0c52d094aa888ce5a4c42d90c3b71f48`; legacy keyed Maps readiness-wait correction only |
| Approved PR head / merge / production | PR head `e8483fc3a7a43aabd1827b98667f60f64ff0deb1`; merge commit/production `2d0175eed5157afa58b57cfb8327ec590e2dda95` at `2026-09-10T19:58:49Z`; normal deploy `34523585398` succeeded at `https://c0498f38.wpbnewconstruction.pages.dev`; no duplicate manual deploy |
| Synthetic 3cc QA merge | `eb95c9057c67349acb2929789a931f7e55fc9c35`, against production `c568746b545804bfab48cda8a9e7f214ddda9d36`; this is the retained QA-source acceptance context, not the current e848 PR acceptance |
| Approved PR #86 synthetic merge | `74a9da5b8b3a262588f37cf62117629fe9041a12`, for approved PR head `e8483fc3a7a43aabd1827b98667f60f64ff0deb1` |
| PR #93 approved head / merge / deployment | Head `ae076dc5926baeebedb30b8d45b23a2ade710c05`; application source `f761a0057460a98a45c333b2ffb16fad5b22e59d`; merge/production `2469a470c4d7cd0391682e9566ef79d44ee417e4`; normal deploy `34534298501` succeeded at `https://de109853.wpbnewconstruction.pages.dev` |
| PR #93 representative live evidence | 9 route/viewport cases and 7 intercepted inquiry proofs passed; selected evidence is in [corrective live evidence](evidence/batch6-corrective-live-2026-09-10/README.md) |

The retained [final acceptance JSON](evidence/batch6-2026-09-10/final-acceptance.json) is the acceptance record for QA source `3cc9052c0c52d094aa888ce5a4c42d90c3b71f48`, with synthetic merge `eb95c9057c67349acb2929789a931f7e55fc9c35`; it is not the current approved `e8483fc3a7a43aabd1827b98667f60f64ff0deb1` acceptance record. The approved head's synthetic merge context is `74a9da5b8b3a262588f37cf62117629fe9041a12`; use the current CI and production records above for PR #86.

The `3cc9052c0c52d094aa888ce5a4c42d90c3b71f48` QA correction changes `research/scripts/check-map-functionality.mjs`: keyed legacy map checks wait up to 30 seconds for a visible ready Google map with a loaded tile of real dimensions; the no-key path retains its fixed 2.5-second homepage / 3.5-second standalone-map waits. It does not change application code. Commit `8401e8dc70c063c42115e1c5aefee5ef3f9702f6` scopes the historical Batch 5 protected-file freeze to its original authorship branch, preserving ancestry, deferred-track exclusions and complete Batch 5 regressions; that removes the earlier pre-build rejection of authorized Batch 6 inquiry/lead changes.

## Final CI acceptance

The table below records the original PR #86 nine-job acceptance. PR #93's approved head and deployment are recorded above; the current representative production evidence and the remaining fresh-consent blocker are recorded in the selected [corrective evidence](evidence/batch6-corrective-live-2026-09-10/README.md).

| Workflow | Run | Required jobs | Result |
| --- | --- | --- | --- |
| Batch 6 concierge implementation review (no deploy) | [34468567260](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34468567260) | keyed / no-key / aggregate | **SUCCESS**; 3/3 jobs green |
| P2 Batch 5 complete authorship verification (no deploy) | [34468567325](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34468567325) | keyed / no-key / aggregate | **SUCCESS**; 3/3 jobs green |
| Batch 6C social preview review (no deploy) | [34468567278](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34468567278) | keyed / no-key / aggregate | **SUCCESS**; 3/3 jobs green |

All 9/9 jobs passed at the tested revision. The [final acceptance record](evidence/batch6-2026-09-10/final-acceptance.json) retains exact workflow/job identities, results and artifact references. Documentation-only successors do not change the application, QA or workflows; inspect the current PR description/checks for their head and verification status.

The production manifest at `/Volumes/ExternalSSD/WPB_PR86_Review/.runtime/batch6-live-2026-09-10/manifest.json` records 11 representative routes × desktop/mobile, six Olara plans × desktop/mobile, real Maps tile/zoom checks, an explicit shortlist submission, hydrated metadata checks, and intercepted inquiries only. Those live probes pass. The focused 390px `/map/` Ask WPB/Maps Zoom-out check originally failed with a 1,495px² overlap and pointer interception; that defect was resolved by PR #93 + PR #94 and the corrected production bundle passed post-deploy live acceptance, so Batch 6 is LIVE-VERIFIED. See the [durable live evidence](evidence/batch6-live-2026-09-10/README.md).

PR #93 (`fix/batch6-mobile-map-controls`) is **approved, merged and deployed**. Approved head `ae076dc5926baeebedb30b8d45b23a2ade710c05` carries application source `f761a0057460a98a45c333b2ffb16fad5b22e59d`; it merged as `2469a470c4d7cd0391682e9566ef79d44ee417e4` against production base `2d0175eed5157afa58b57cfb8327ec590e2dda95` and deployed through [34534298501](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34534298501) at `https://de109853.wpbnewconstruction.pages.dev`. The representative production review passed 9 route/viewport cases and 7 intercepted inquiry proofs, covering the five canonical intents, legacy prefills, manual selection, floor-plan context and first-touch preservation. After consent dismissal the original native-control collision is clear, and fresh denied-consent zoom-in/out contexts pass. Selected [corrective live evidence](evidence/batch6-corrective-live-2026-09-10/README.md) retains the result JSON and three screenshots.

PR #94 (`fix/batch6-consent-control-ownership`, approved head `46dd798126dc0aeb51915dfdbb4f72c6d0604476`) resolved the remaining fresh first-visit consent ownership defect by moving the mobile analytics-consent notice into normal page flow before `#app` while preserving desktop fixed positioning; it merged as `21fbee181f2e9a7c0a0a59eb90dede5b81b57db6` and deployed via `34543286815` at `https://5027093e.wpbnewconstruction.pages.dev`. Post-deploy live acceptance passed on fresh 320px/390px contexts across `/map/`, `/`, `/projects/olara/`, `/floorplans/olara/residence-d/`, `/inquire/` and a desktop `/map/` regression: in-flow mobile consent, real Maps tiles, zoom in/out, pan, Ask WPB open/Escape/focus-return, zero consent tap theft, denial persistence with analytics blocked, no meaningful console errors, no new horizontal overflow. The pre-existing ~12px 320px homepage `.home-section-jump` overflow is unchanged. No real lead was sent.

## Corrective live evidence (historical)

The selected [evidence directory](evidence/batch6-corrective-live-2026-09-10/README.md) separates the two live states recorded before PR #94. Dismissed-consent and fresh denied-consent contexts passed native control ownership and the representative route/form contract. On a fresh first visit at 390×844, the Zoom-out center was hit by `ASIDE#wpb-analytics-consent`; the consent surface had `role="dialog"` without `aria-modal`, covered the launcher, and left the background map control actionable. PR #94 resolved this by placing the consent notice in normal page flow on mobile; the post-#94 production bundle passed the full live acceptance recorded above.

## Corrections

**The original casing mismatch was CSS presentation.** On Olara and Maison d'Or, button `textContent` and the accessible name are exactly `Request current availability`; button `value` is empty, with no overriding `aria-label`. Existing `.brochure-inquiry-card button` CSS applies `text-transform: uppercase`, producing `innerText` of `REQUEST CURRENT AVAILABILITY`. The hidden interest and normalized server interest retain the canonical sentence-case label; `request_intent` is `availability`. No case-insensitive matching was introduced. The checker asserts exact semantic text, accessible name, actual DOM FormData and normalized server values, and retains the visual capitalization evidence.

**Legacy request initialization needed two application corrections.** Query-string initialization recognized only a few short aliases, so a legacy private floor-plan packet URL could stay on availability. `main.ts` now resolves the shared intent registry and selects a matching existing option. Separately, the remembered-origin owner in `src/lib/inquiryContext.ts` assigned old labels after the enhancer canonicalized the options. During later commercial, corridor and comparison submissions, that assignment selected no option and removed `interest` from FormData. The owner now selects by normalized intent ID before or after enhancement, preserves explicit manual choices, and refreshes the request summary and hidden intent after updating context metadata. New-context refresh also covers unchanged dropdown values.

Legacy input URLs remain covered. Integration, corridor, comparison and Batch 4 assertions expect the exact canonical output from the shared registry and verify both submitted `interest` and `request_intent`. Batch 4 separately retains its original URL/source-page labels. Tests wait for the explicit intent-wired form before inspecting its semantic contract.

**The full authorship regression exposed a hidden-view H1 defect.** The heading normalizer previously selected hidden project headings before the active Rosewood view. `bootstrap.ts` now scopes its correction to the rendered project and rendered identity/hero headings. The one-active-H1 and one-JSON-LD-graph assertions remain strict, including SPA navigation.

**Screenshots exposed inherited style conflicts.** The concierge sets scoped heading/control typography and colors. Brochure request summaries use dark text on an opaque pale background. Normal-resource desktop/mobile captures start with declined analytics consent and dismiss the separate Building Watch prompt through its own control.

**Review harness corrections preserve the release gates.** PR #87's social-only file allowlist now applies to its original social branch; all later PRs retain social behavior, ancestry, deferred-track exclusions and full keyed/no-key checks. A local probe also demonstrated that analytics consent was absent at `domcontentloaded` but appeared 50 ms later, defeating the keyed Maps check's one-time visibility check. Maps QA now starts with the same explicit denied preference and records safe failure-phase labels. The `3cc9052c0c52d094aa888ce5a4c42d90c3b71f48` correction replaces the keyed legacy map check's fixed 2.5-second homepage / 3.5-second standalone-map wait with a bounded wait of up to 30 seconds for visible semantic readiness and loaded Google tile evidence; the no-key waits are unchanged. The dedicated keyed Maps checker still requires a real loader response, real rendered tiles, correct dimensions and changed tiles after zoom; no fallback is accepted. The earlier cold homepage CI failure had insufficient diagnostics to assign a definitive cause. The resolved `/map/` runtime correction was not reopened.

The concierge workflow retains keyed Maps results/screenshots as a separate artifact, scans both evidence directories, and permits upload only after a successful scan. The production deploy workflow is unchanged.

## Verification record

Local verification used the environment-specific `npm run build -- --configLoader runner` option because the default Vite loader occasionally stalled on this Mac. All three final CI workflows independently passed ordinary `npm run build` on Ubuntu. The complete local no-key suite also passed. The corrected Select fixture models native option matching and bubbling across legacy/canonical option sets; it retains replacement and manual-choice coverage.

Historical PR #86 final CI coverage:

- Typecheck and production build; 14 five-intent contracts; controlled lead validation, dedupe, retry and storage mocks.
- Isolated `/map/` readiness; all 22 concierge views (11 desktop/mobile routes), lazy launcher/dialog/focus/Escape, lightweight ownership, bounded browser lifecycle, and five real DOM form examples with normalized server interest.
- Complete `npm test`; existing floor-plan (24 browser views, 36 intercepted submissions) and commercial (8 views, 8 submissions) journeys; integrated navigation, corridor and comparison request transitions; explicit shortlist, manual selections and first-touch attribution.
- Batch 4 request transitions and guides; Batch 5/authorship (7 unit tests and 48 browser/schema checks), one active H1 and one canonical graph, including SPA navigation.
- Assets and strict assets, SEO/GEO, Agent Skills, accessibility/forms, privacy/gatekeeper, and social raw/JS-off/hydrated/SPA/image checks.
- Restricted keyed preflight and real desktop/mobile homepage/map tile and zoom checks; expected no-key production rejection; successful aggregate gates.

## Screenshots

Retained screenshots/results were captured at QA revision `593abf507ed302b8b422f95b2510892b87173156`. Application sources are unchanged since `85eeae70d59fdbc87f169692dc6464128910bbbf`; the final acceptance record above separately identifies the latest QA/workflow revision. It is stored with a [SHA-256 manifest](evidence/batch6-2026-09-10/manifest.json), [semantic/form/lifecycle results](evidence/batch6-2026-09-10/concierge-results.json), [keyed Maps results](evidence/batch6-2026-09-10/keyed-maps-results.json), and exact workflow snapshots. All ten retained screenshots were visually reviewed; the six focused screenshots are byte-identical to the earlier application-revision CI captures.

| Surface | Desktop | Mobile |
| --- | --- | --- |
| Comparison concierge | [Screenshot](evidence/batch6-2026-09-10/after-comparison-desktop.png) | [Screenshot](evidence/batch6-2026-09-10/after-comparison-mobile.png) |
| Olara availability form | [Screenshot](evidence/batch6-2026-09-10/after-olara-form-desktop.png) | [Screenshot](evidence/batch6-2026-09-10/after-olara-form-mobile.png) |
| Maison availability form | [Screenshot](evidence/batch6-2026-09-10/after-maison-dor-form-desktop.png) | [Screenshot](evidence/batch6-2026-09-10/after-maison-dor-form-mobile.png) |
| Keyed homepage map | [Screenshot](evidence/batch6-2026-09-10/home-1366-map-card.png) | [Screenshot](evidence/batch6-2026-09-10/home-390-map-card.png) |
| Keyed standalone map | [Screenshot](evidence/batch6-2026-09-10/map-1366-map-card.png) | [Screenshot](evidence/batch6-2026-09-10/map-390-map-card.png) |

Source artifacts for the retained `593abf507ed302b8b422f95b2510892b87173156` evidence: [no-key concierge](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34464411041/artifacts/10147208149), [keyed concierge](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34464411041/artifacts/10147236226), [keyed Maps including full-page captures](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34464411041/artifacts/10147236885). These are candidate-build screenshots, not live production evidence. Artifact references from the successful `3cc9052c0c52d094aa888ce5a4c42d90c3b71f48` workflows are also preserved in the final acceptance record. GitHub Actions artifacts expire after 14 days; the selected repository copies remain reviewable.

## Limitations and release boundary

All automated lead submissions are intercepted or use controlled endpoint/storage mocks. Real production Turnstile, D1 persistence, email/CRM delivery and human fulfillment remain unverified. No real lead was sent. The concierge routes research and human follow-up; it does not promise current inventory, pricing, automated booking or generative answers. No traffic, ranking, GA4 transport, conversion or revenue uplift is established.

PR #86 was approved, merged and deployed through the single normal workflow `34523585398` at `https://c0498f38.wpbnewconstruction.pages.dev`; no manual or duplicate deployment occurred. Its live Maps, shortlist and hydrated metadata probes pass in the retained production manifest, with all inquiries intercepted and no real lead sent, but its focused 390px `/map/` Ask WPB/Maps Zoom-out check failed with a 1,495px² overlap and pointer interception. PR #93 is the current approved, merged and deployed buyer-facing correction; its representative review passes, while the fresh first-visit consent ownership defect above withholds whole Batch 6 LIVE-VERIFIED status. PR #89 is separately **APPROVED / MERGED / DEPLOYED — INTERNAL TOOLING ONLY** at current main `baac91f5aa1a25d1013dcc762528cad558668512`; its buyer-facing bundles are unchanged and Phase A remains `apply:false` / review-only. No live article publication was invoked. See the [durable live evidence](evidence/batch6-live-2026-09-10/README.md), [corrective live evidence](evidence/batch6-corrective-live-2026-09-10/README.md) and [authoritative handoff](WPB_CODEX_MASTER_HANDOFF.md) for exact boundaries and next work.
