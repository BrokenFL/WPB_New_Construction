# V2 milestone 2 — research, implementation and review

September 19, 2026. Continues [draft PR #115](https://github.com/BrokenFL/WPB_New_Construction/pull/115) on `codex/site-overhaul-v2`. Local built preview: `http://127.0.0.1:5188/`.

## Delivered and identity

The discovery/news hybrid puts three approved, dated stories immediately after the homepage opening, connects them to useful building/corridor research, and preserves direct discovery/compare actions. The original skyline/bridge illustration is restored unchanged. Mobile comparison uses readable named values by criterion; inquiries retain shortlist or selected-plan context, recover from errors, and clear a prior receipt when a new request is opened. Canonical card facts survive hydration. The existing Visual Editor works with the canonical project projection again.

- Base/current main verified: `e0ff6b43faf9cec1b5450e6e830ca32466181b92`.
- Starting V2 milestone: `7e894c2b14f1d0613e4464c0a58aac9cbd0db7af`.
- Updated brief read directly from planning head `11bf0ce748c453dd247e2996da335049e1f25f0e`; no planning merge.
- **Exact tested implementation commit:** `0c36a09375dbd1cbe8fa3187aeaefcb49c8873e6`. Final build, 72 cross-browser checks, 24 captures, integration/comparison/plan suites and eight real Maps cases use this source state. Only documentation/evidence follows it.
- [Source fingerprints](source-fingerprints.json), [validation summary](validation.json), [browser assertions](browser-qa.json), [rendered views](rendered-views.json).
- This implementation commit is included in the pushed draft branch. The final evidence-only head and its independently verified GitHub CI results are recorded in the PR description and delivery handoff; a document cannot contain its own future commit hash.

The primary SSD checkout remains clean on main. No unrelated work, generated facts, assets-repository files or automation state was changed. Merge, deploy and live health are separate states; no merge or deployment was performed.

## Research and design decision

[Seven-site benchmark and three hypotheses](research.md) documents official sources and September 19 access dates. The Modern House, Corcoran Sunshine and Olara received deeper rendered desktop/mobile inspection. No competitor conversion rate or estimated traffic was treated as performance evidence. Search Console returned an authentication failure, and verified consented analytics reports were unavailable. The dated repository search snapshot is useful historical context only.

The chosen order is hero → newest three approved stories → corridors → featured buildings → compare → neighborhood context → map → guidance → original bridge. Publication dates and source-report dates are separate; stories remain until replaced by newer approved publications. No fake freshness or additional publishing system was added. [Graphic recovery](graphic-recovery.md) identifies the original asset, exact hiding change and lack of a documented graphic-specific removal reason.

Three focused cycles covered initial implementation, rendered art/graphic refinements, then fresh UX and cross-browser regression repairs. The text-led news refinement reduced observed mobile section height from about 2,082 to 1,483px at 390px while retaining all three stories and readable 16px body copy. The final cycle repaired stale card hydration, inquiry context/receipt state, WebKit focus and inherited corridor-grid overflow. No test threshold was raised or failing assertion waived.

## Separate review perspectives

Eight means coherent, professional and usable; above eight requires demonstrated polish without a significant category-specific weakness. Scores are internal judgments, not measured conversion gains or a usability study.

| Perspective | Desktop | Mobile, including 320px | Evidence and remaining weakness |
|---|---:|---:|---|
| Web / art direction | **8.6** | **8.3** | [Astra review](design-review.md): coherent editorial/photo rhythm, early news and distinctive closing graphic. Lower homepage still repeats discovery/advisory invitations. |
| Graphic design | **8.4** | **8.2** | Separate perspective in the same nonimplementing Astra review: repaired heading/contrast/320px header. Small metadata and long narrow-screen headlines remain weaker. Dense modal consent noted in that review was subsequently given normal case and readable scale. |
| Buyer UX | **8.5** | **8.2** | [Fresh nonimplementing Astra review](ux-review.md), [final built recheck](ux-final-recheck.json): news-to-research, compare, gallery, plan, retry and new-request tasks pass. Mobile comparison and forms remain long. |
| Technical QA | **8.5** | **8.3** | [Luna review](technical-review.md): final regression matrix and source/state checks pass. This reviewer authored the harness and one scoped CSS repair; it is not an independent security audit. Field performance and physical devices remain unverified. |

All categories exceed the strict target for this milestone. Art and graphic review were separate perspectives from one reviewer, not two separate people. Astra extra-high handled synthesis/direction and fresh UX; Luna Max handled bounded collection, implementation and QA. No milestone-2 model substitution occurred. The first milestone's lower mobile score and earlier model substitution remain in its [historical record](../README.md).

## Before / after and actual tasks

| Surface | Before milestone 2 | Final evidence |
|---|---|---|
| Homepage | [desktop](before-home-desktop-cover.png), [mobile](before-home-mobile-cover.png) | [desktop](after-home-desktop-cover.png), [mobile](after-home-mobile-cover.png), [320px](after-home-narrow-cover.png), [full desktop](after-home-desktop-full.png), [full mobile](after-home-mobile-full.png) |
| News | Previously one lower-page story | [three-column news](cycle2-home-desktop-news.png), [mobile top](cycle2-home-mobile-news-top.png), [mobile continuation](cycle2-home-mobile-news-bottom.png) |
| Original graphic | Hidden by the first V2 stylesheet | [mobile](after-bridge-mobile.png), [final narrow](final-narrow-restored-graphic.png) |
| Compare | [mobile controls](before-compare-mobile-cover.png) | [desktop](after-compare-desktop-cover.png), [mobile controls](after-compare-mobile-cover.png), [shortlist inquiry](final-mobile-compare-inquiry.png) |
| Inquiry | [mobile](before-inquire-mobile-cover.png) | [desktop](after-inquire-desktop-cover.png), [mobile](after-inquire-mobile-cover.png), [503 retained entries](narrow-inquiry-server-error.png), [successful receipt](narrow-inquiry-success.png) |
| Selected plan | Initial viewer CTA lost context | [320px viewer](final-narrow-plan-viewer.png), [contextual inquiry](final-narrow-plan-inquiry.png) |
| Trust / integrations | Stale card hydration and local editor API failure | [canonical cards](final-desktop-collection.png), [Visual Editor](visual-editor-preview.png), [real narrow Maps](maps-narrow-real.png) |

Before captures use the first V2 implementation. Cycle-2 detail captures document that review state; final-prefixed and after captures use the tested implementation commit. All 24 final route/viewport summaries are committed; full local originals remain in ignored `output/playwright/milestone2-final/`. Competitor full-page captures can have offscreen lazy-image gaps; they are not evidence of broken production images. Early design captures blocked all POSTs and could affect Maps RPC, so the separate real Maps evidence governs Maps conclusions.

## Final QA

| Check on tested implementation | Result |
|---|---|
| Typecheck and synthetic-analytics production build | Pass; 117 HTML files. |
| `npm test` | 102 unit tests, full no-write launch suite and 1,150-file gatekeeper pass. Source/copy/SEO/schema/consent/form/image/link/content-studio checks retained. |
| New cross-browser regression | **72/72** in Chromium and WebKit at 1440/390/320px: exact news order/dates, related routes, canonical card facts, original graphic, gallery/plan keyboard/focus, compare data parity, consent, inquiry 503→200 and fresh-request state. |
| Integrated journeys | Pass; desktop/mobile navigation, consent and 12 intercepted submissions. [Results](integration-final-results.json). |
| Existing focused comparisons | Pass; two comparisons, JS/no-JS desktop/mobile and 12 intercepted context-bearing submissions. [Results](comparisons-final-results.json). |
| Released plan entities | Pass; 24 views and 36 intercepted submissions. [Results](floorplans-final-results.json). |
| Real keyed Maps | **8/8**; actual loader/tiles/zoom, controls, first-visit consent and concierge. No mock/fallback accepted. [Results](maps-final-results.json). |
| Final rendered capture | 24 views, one visible H1 each, no broken visible images, page errors or document overflow. Dedicated mobile assertions also require body width to equal the viewport. |
| Visual Editor | Actual local state API returned 24 projects; real preview iframe and selector rendered. Safety QA passes. No editor writes/publication. |

Earlier in this milestone, commercial browser QA (8 views/8 intercepted submissions), concierge QA (22 views) and the 12 V2 interaction suites also passed. They preceded the final targeted fixes; the table above is the exact final-source verification. Unchanged Phase A/P2 automation suites were not rerun for this milestone. No automation was activated.

The main JS chunk is about 534.95KB raw / 118.25KB gzip and retains Vite's >500KB advisory. Main CSS is 189.43KB, close to its existing 189,440-byte limit. The two separately linked V2 stylesheets total 74,583 bytes raw / 12,714 gzip; budgets were not increased. No Lighthouse, Core Web Vitals or field-performance improvement is claimed.

Every test lead and analytics transport was intercepted; no real lead or analytics event was sent. The preview refuses POSTs. WebKit is browser-engine evidence, not a real iPhone/Safari test. Current Search Console, consented analytics reports, external lead delivery, physical-device use and live production health remain unverified.

## After an approved release

Follow the [measurement plan](measurement-plan.md) for useful exploration, news-to-building journeys, returning sessions and receipt-backed qualified inquiries. It names existing events, denominators, consent/data gaps and review windows. It does not schedule work, enable analytics or claim uplift.
