# WPB V2 overhaul — review record

## Review state
Implementation is ready for local review on `codex/site-overhaul-v2`. This is a draft, not a production release. The mobile buyer-journey score remains at 8.0, below the brief's strictly above-eight target; the remaining table/form density is documented rather than hidden by an average.

- Preview: `http://127.0.0.1:5188/` (local computer only).
- Evidence and scorecard: [review evidence](evidence/site-overhaul-v2/README.md).
- Base: `origin/main` at `e0ff6b43faf9cec1b5450e6e830ca32466181b92`, verified September 19, 2026.
- Brief: copied verbatim from planning branch `4f590095ac88e966264f56f7ba45f31065806d45`; no planning merge.
- Isolated worktree: `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction`. The primary SSD checkout and other worktrees were preserved.
- Implementation identity: the draft PR head plus [source fingerprints](evidence/site-overhaul-v2/source-fingerprints.json). Captures were made against the working tree before its first commit; older test tools therefore record the base SHA.

## Delivered
Warm ivory, deep ink and restrained bronze establish an editorial visual system. The homepage now uses one approved waterfront image, a direct browse/compare path, balanced corridor and featured-building grids, and less repeated decorative content. Shared navigation remains visible on mobile.

The directory adds name search, URL persistence, clear filters and a useful empty state. Project pages gain readable mobile facts, section navigation, better copy scale, an accessible image viewer and a more compact inquiry form. Comparison, floor-plan library/entity and inquiry surfaces share the direction. Mobile home/project help expands in normal flow, with correct route context across hydration, navigation and resize.

Inquiry validation can be corrected and retried; server errors retain entries, while successful receipt clears personal entries and preserves the building/interest. Existing facts, canonical sources, URLs, consent, attribution and the lead endpoint contract remain authoritative. No generated building imagery, canonical-data edits, article rewrites, 3D integration or automation activation were introduced.

## Review cycles and model use
1. Astra (`gpt-6-astra`, xhigh) established the direction and desktop/mobile baseline. Luna (`gpt-5.6-luna`, max) inventoried buyer routes and implemented bounded journey styling. The lead integrated the shared design and behavior.
2. Rendered critique corrected contrast, brand treatment, project-form composition, gallery keyboard behavior, comparison height and inquiry order. Astra became unavailable at capacity; `gpt-5.6-sol`, xhigh, supplied the gallery, mobile concierge work and independent art/graphic review.
3. Final buyer-task review shortened Compare, restored all four narrow-screen navigation links, and corrected the inquiry masthead overlap. Browser integration found and fixed collapsed request actions and the prerender-to-app concierge placement race. Optional gallery loading no longer delays request-context wiring.

Available tools used: native image generation for a private design concept, Codebase Memory MCP for architecture, Playwright Chromium, local TypeScript/Vite and existing approved assets. The illustrative concept never entered the public asset library. The existing Visual Editor and source approval workflows were preserved; no new service was required.

## Validation and remaining work
See the evidence record for exact counts, scripts and limits. Full repository gates, targeted interactions, floor-plan/comparison/commercial/concierge browser journeys and real keyed Maps checks are required for this handoff. All lead requests in tests were intercepted. The local preview refuses POSTs.

Current-main comparison confirmed 97 existing intelligence review items (71 priority-one classifications, seven missing compare rows). The asset audit has zero blockers, broken references or local-path leaks and 426 advisories. These existing content-review decisions were not resolved by changing facts during a visual sprint.

Next action: Brooke reviews the preview and draft PR, especially comparison-table density and inquiry length. Merge and deployment require explicit approval. CI, merge, deployment and live health remain separate evidence states.

## Run locally
From this worktree, run `npm run dev -- --host 127.0.0.1 --port 5186` for the editable preview. For the built preview, run `npm run build`, then `node research/scripts/preview-v2.mjs` (port 5188).

The current local test build uses the existing local Maps configuration and a dummy analytics measurement ID. Analytics traffic was blocked in browser QA; no real analytics destination or production configuration was changed. To reproduce consent QA, build with `VITE_GA4_MEASUREMENT_ID=G-QATEST1234 npm run build`.
