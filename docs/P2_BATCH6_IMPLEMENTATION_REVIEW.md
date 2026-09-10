# P2 Batch 6 implementation review

September 10, 2026 · PR [#86](https://github.com/BrokenFL/WPB_New_Construction/pull/86) · `p2-batch6-concierge-intents`.

## Disposition and revision evidence

**PR acceptance: PASS — all nine keyed/no-key/aggregate jobs are green.** The draft remains open and undeployed, awaiting Brooke's review and release authorization.

| Evidence | Exact revision/result |
| --- | --- |
| Last application change | `85eeae70d59fdbc87f169692dc6464128910bbbf`; application sources are unchanged in subsequent QA/workflow/documentation commits |
| Retained screenshots/evidence | QA revision `593abf507ed302b8b422f95b2510892b87173156`; provenance is preserved in [Screenshots](#screenshots) |
| Pushed QA revision | `3cc9052c0c52d094aa888ce5a4c42d90c3b71f48`; legacy keyed Maps readiness-wait correction only |
| Synthetic test merge | `eb95c9057c67349acb2929789a931f7e55fc9c35`, against production `c568746b545804bfab48cda8a9e7f214ddda9d36` |

The `3cc9052c0c52d094aa888ce5a4c42d90c3b71f48` QA correction changes `research/scripts/check-map-functionality.mjs`: keyed legacy map checks wait up to 30 seconds for a visible ready Google map with a loaded tile of real dimensions; the no-key path retains its fixed 2.5-second homepage / 3.5-second standalone-map waits. It does not change application code. Commit `8401e8dc70c063c42115e1c5aefee5ef3f9702f6` scopes the historical Batch 5 protected-file freeze to its original authorship branch, preserving ancestry, deferred-track exclusions and complete Batch 5 regressions; that removes the earlier pre-build rejection of authorized Batch 6 inquiry/lead changes.

## Final CI acceptance

| Workflow | Run | Required jobs | Result |
| --- | --- | --- | --- |
| Batch 6 concierge implementation review (no deploy) | [34467536610](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34467536610) | keyed / no-key / aggregate | **SUCCESS**; 3/3 jobs green |
| P2 Batch 5 complete authorship verification (no deploy) | [34467536644](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34467536644) | keyed / no-key / aggregate | **SUCCESS**; 3/3 jobs green |
| Batch 6C social preview review (no deploy) | [34467536649](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34467536649) | keyed / no-key / aggregate | **SUCCESS**; 3/3 jobs green |

All 9/9 jobs passed at the tested revision. The [final acceptance record](evidence/batch6-2026-09-10/final-acceptance.json) retains exact workflow/job identities, results and artifact references. Documentation-only successors do not change the application, QA or workflows; inspect the current PR description/checks for their head and verification status.

Recheck current refs/checks and obtain Brooke's authorization before any merge or release.

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

Final CI coverage:

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

No merge or deployment occurred in this continuation. No live article publication or deployment was invoked; automated publisher QA used isolated fixtures. Production remains `c568746b545804bfab48cda8a9e7f214ddda9d36` pending a fresh check before any authorized release. PR #89 has a separate **hold** recommendation; see the [authoritative handoff](WPB_CODEX_MASTER_HANDOFF.md) for its safety findings, exact Codex/Sheet intake architecture, preserved publishing/model boundaries and next work.
