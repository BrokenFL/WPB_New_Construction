# P2 Batch 6 implementation review

September 10, 2026 · PR [#86](https://github.com/BrokenFL/WPB_New_Construction/pull/86) · `p2-batch6-concierge-intents`.

## Disposition and revision evidence

**Batch 6 application verification: PASS. Open draft and undeployed; all current PR checks remain a release prerequisite.**

| Evidence | Exact revision/result |
| --- | --- |
| Tested feature + QA revision | `593abf507ed302b8b422f95b2510892b87173156` |
| Last application change | `85eeae70d59fdbc87f169692dc6464128910bbbf`; successor changes the unit-test fixture only |
| CI synthetic test merge | `a22a3f9f9bd603693ac864d6b3cdfaa69e190b49`, against production `c568746b545804bfab48cda8a9e7f214ddda9d36` |
| Concierge implementation review | [34464411041](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34464411041): keyed **SUCCESS**, no-key **SUCCESS**, aggregate **SUCCESS** |
| Social regression review | [34464411029](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34464411029): keyed **SUCCESS**, no-key **SUCCESS**, aggregate **SUCCESS** |

Application and QA script sources match the green revision above. Documentation/evidence successor `ea524231834bac5963dddc214ae4d0ee87fc9acd` also passed both complete Batch 6 workflows: [concierge 34465568121](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34465568121) and [social 34465568344](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34465568344).

The tracker link in that documentation update additionally activated the older Batch 5 complete-review workflow. Its historical protected-file freeze rejected the authorized Batch 6 inquiry/lead changes before building; subsequent preflight failures were missing-build cascades. The follow-up scopes that original freeze to its original authorship branch, while retaining ancestry, deferred-track exclusions and every actual Batch 5 regression. No application or QA-script change accompanies this workflow maintenance. Consult the [current PR checks](https://github.com/BrokenFL/WPB_New_Construction/pull/86/checks) and PR description for the final workflow-only successor and all nine job results. Recheck current refs/checks and obtain Brooke's authorization before any merge or release.

## Corrections

**The original casing mismatch was CSS presentation.** On Olara and Maison d'Or, button `textContent` and the accessible name are exactly `Request current availability`; button `value` is empty, with no overriding `aria-label`. Existing `.brochure-inquiry-card button` CSS applies `text-transform: uppercase`, producing `innerText` of `REQUEST CURRENT AVAILABILITY`. The hidden interest and normalized server interest retain the canonical sentence-case label; `request_intent` is `availability`. No case-insensitive matching was introduced. The checker asserts exact semantic text, accessible name, actual DOM FormData and normalized server values, and retains the visual capitalization evidence.

**Legacy request initialization needed two application corrections.** Query-string initialization recognized only a few short aliases, so a legacy private floor-plan packet URL could stay on availability. `main.ts` now resolves the shared intent registry and selects a matching existing option. Separately, the remembered-origin owner in `src/lib/inquiryContext.ts` assigned old labels after the enhancer canonicalized the options. During later commercial, corridor and comparison submissions, that assignment selected no option and removed `interest` from FormData. The owner now selects by normalized intent ID before or after enhancement, preserves explicit manual choices, and refreshes the request summary and hidden intent after updating context metadata. New-context refresh also covers unchanged dropdown values.

Legacy input URLs remain covered. Integration, corridor, comparison and Batch 4 assertions expect the exact canonical output from the shared registry and verify both submitted `interest` and `request_intent`. Batch 4 separately retains its original URL/source-page labels. Tests wait for the explicit intent-wired form before inspecting its semantic contract.

**The full authorship regression exposed a hidden-view H1 defect.** The heading normalizer previously selected hidden project headings before the active Rosewood view. `bootstrap.ts` now scopes its correction to the rendered project and rendered identity/hero headings. The one-active-H1 and one-JSON-LD-graph assertions remain strict, including SPA navigation.

**Screenshots exposed inherited style conflicts.** The concierge sets scoped heading/control typography and colors. Brochure request summaries use dark text on an opaque pale background. Normal-resource desktop/mobile captures start with declined analytics consent and dismiss the separate Building Watch prompt through its own control.

**Review harness corrections preserve the release gates.** PR #87's social-only file allowlist now applies to its original social branch; all later PRs retain social behavior, ancestry, deferred-track exclusions and full keyed/no-key checks. A local probe also demonstrated that analytics consent was absent at `domcontentloaded` but appeared 50 ms later, defeating the keyed Maps check's one-time visibility check. Maps QA now starts with the same explicit denied preference and records safe failure-phase labels. It still requires a real loader response, real rendered tiles, correct dimensions and changed tiles after zoom; no fallback is accepted. The earlier cold homepage CI failure had insufficient diagnostics to assign a definitive cause. The resolved `/map/` runtime correction was not reopened.

The concierge workflow retains keyed Maps results/screenshots as a separate artifact, scans both evidence directories, and permits upload only after a successful scan. The production deploy workflow is unchanged.

## Verification record

Local verification uses an ordinary production build with the environment-specific `--configLoader runner` option: the default Vite loader occasionally stalled on this Mac. CI must independently pass ordinary `npm run build` on Ubuntu. Earlier corrective commit `d2ba843405f9737f721cec2c5d9da4a782ddd135` passed both CI builds, focused contracts, the full repository suite, authorship, floor-plan and commercial checks, before the legacy integration expectation stopped concierge run `34462532925`. Social run `34462532910` passed all non-Maps checks and its entire no-key job; its first desktop homepage keyed Maps probe failed while the other three Maps views passed. Those runs are diagnostic history, not final acceptance. Revision `85eeae7` subsequently exposed an outdated unit-test Select mock; `593abf5` models native option matching and bubbling for both legacy and canonical option sets. The complete local no-key suite and both final CI workflows then passed.

Both complete CI workflows passed. Retained coverage:

- Typecheck and production build; 14 five-intent contracts; controlled lead validation, dedupe, retry and storage mocks.
- Isolated `/map/` readiness; all 22 concierge views (11 desktop/mobile routes), lazy launcher/dialog/focus/Escape, lightweight ownership, bounded browser lifecycle, and five real DOM form examples with normalized server interest.
- Complete `npm test`; existing floor-plan (24 browser views, 36 intercepted submissions) and commercial (8 views, 8 submissions) journeys; integrated navigation, corridor and comparison request transitions; explicit shortlist, manual selections and first-touch attribution.
- Batch 4 request transitions and guides; Batch 5/authorship (7 unit tests and 48 browser/schema checks), one active H1 and one canonical graph, including SPA navigation.
- Assets and strict assets, SEO/GEO, Agent Skills, accessibility/forms, privacy/gatekeeper, and social raw/JS-off/hydrated/SPA/image checks.
- Restricted keyed preflight and real desktop/mobile homepage/map tile and zoom checks; expected no-key production rejection; successful aggregate gates.

## Screenshots

Final CI evidence is retained with a [SHA-256 manifest](evidence/batch6-2026-09-10/manifest.json), [semantic/form/lifecycle results](evidence/batch6-2026-09-10/concierge-results.json), [keyed Maps results](evidence/batch6-2026-09-10/keyed-maps-results.json), and exact workflow snapshots. All ten retained screenshots were visually reviewed; the six focused screenshots are byte-identical to the earlier application-revision CI captures.

| Surface | Desktop | Mobile |
| --- | --- | --- |
| Comparison concierge | [Screenshot](evidence/batch6-2026-09-10/after-comparison-desktop.png) | [Screenshot](evidence/batch6-2026-09-10/after-comparison-mobile.png) |
| Olara availability form | [Screenshot](evidence/batch6-2026-09-10/after-olara-form-desktop.png) | [Screenshot](evidence/batch6-2026-09-10/after-olara-form-mobile.png) |
| Maison availability form | [Screenshot](evidence/batch6-2026-09-10/after-maison-dor-form-desktop.png) | [Screenshot](evidence/batch6-2026-09-10/after-maison-dor-form-mobile.png) |
| Keyed homepage map | [Screenshot](evidence/batch6-2026-09-10/home-1366-map-card.png) | [Screenshot](evidence/batch6-2026-09-10/home-390-map-card.png) |
| Keyed standalone map | [Screenshot](evidence/batch6-2026-09-10/map-1366-map-card.png) | [Screenshot](evidence/batch6-2026-09-10/map-390-map-card.png) |

Source artifacts: [no-key concierge](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34464411041/artifacts/10147208149), [keyed concierge](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34464411041/artifacts/10147236226), [keyed Maps including full-page captures](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34464411041/artifacts/10147236885). These are candidate-build screenshots, not live production evidence. GitHub Actions artifacts expire after 14 days; the selected repository copies remain reviewable.

## Limitations and release boundary

All automated lead submissions are intercepted or use controlled endpoint/storage mocks. Real production Turnstile, D1 persistence, email/CRM delivery and human fulfillment remain unverified. No real lead was sent. The concierge routes research and human follow-up; it does not promise current inventory, pricing, automated booking or generative answers. No traffic, ranking, GA4 transport, conversion or revenue uplift is established.

No merge or deployment occurred in this continuation. Production remains `c568746b545804bfab48cda8a9e7f214ddda9d36` pending a fresh check before any authorized release. PR #89 has a separate **hold** recommendation; see the [authoritative handoff](WPB_CODEX_MASTER_HANDOFF.md) for its safety findings, exact Codex/Sheet intake architecture, preserved publishing/model boundaries and next work.
