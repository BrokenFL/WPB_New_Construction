# V2 milestone 1 review evidence — September 19, 2026

This record describes the first V2 milestone at `7e894c2b14f1d0613e4464c0a58aac9cbd0db7af`. The authorized research/mobile continuation is documented in [milestone 2 evidence](milestone2/README.md), which supersedes this milestone's current-state scores and handoff. Historical findings and limits below remain intact.

## Rubric and outcome
Eight means coherent, professional and usable. Above eight requires demonstrable polish without a significant category-specific weakness. Scores are internal review judgments, not usability-study results or conversion claims. Desktop and mobile are assessed separately.

| Perspective | Baseline desktop / mobile | Final desktop | Final mobile | Evidence and limit |
|---|---|---:|---:|---|
| Web / art direction | 6.5 / 4.5 | 9.0 | 8.7 | Independent Sol review of home and Olara: coherent typography, palette, crops and narrative. Mobile project pages remain long. |
| Graphic design | 6.0 / 5.0 | 8.5 | 8.6 | Independent Sol review: consistent mastheads, responsive facts, clear gallery and non-overlapping help dock. Space beside the desktop project inquiry form and small lower-page metadata remain weaker. |
| Buyer UX | 5.5 / 4.5 provisional | 8.2 | **8.0** | Luna's route review plus lead's final task checks. Search, context, plans and error/retry paths work. Final pass moved comparison controls upward and fixed 320px navigation; mobile matrices/forms remain dense. Strictly above-eight mobile target is **not met**. |
| Technical QA | unscored | 8.4 | 8.3 | Lead review based on the checks below. No performance field data, physical-device/Safari certification or live-production verification is claimed. |

Baseline scores preceded implementation. Final independent art/graphic scores preceded only the last compact Compare and inquiry-header corrections. Final UX/technical scores are the lead's synthesis, not independent agent scores. Luna's last narrower review rated mobile comparison/library 7.8 and plan/inquiry 8.0 before those final corrections; those observations remain part of the review record.

Three focused improvement rounds were completed. Functional failures discovered in regression were repaired and retested; design ratings were not used to waive failures. Further density work is a review decision rather than an open-ended fourth redesign cycle.

## Before / after
Baseline images are full-page captures of current main. They can contain offscreen lazy-image gaps and, on the mobile homepage, the old rotating-hero timing. Final captures scroll through visible images and wait for decoding, app readiness and scroll settling. No building imagery was fabricated or retouched.

| Surface | Before | After desktop | After mobile |
|---|---|---|---|
| Homepage | [desktop](before-home-desktop.png), [mobile](before-home-mobile.png) | [cover](after-home-desktop-cover.png) | [cover](after-home-mobile-cover.png) |
| Olara | [desktop](before-olara-desktop.png), [mobile](before-olara-mobile.png) | [cover](after-olara-desktop-cover.png) | [cover](after-olara-mobile-cover.png) |
| Buildings | Existing directory / inventory baseline | [cover](after-buildings-desktop-cover.png) | [cover](after-buildings-mobile-cover.png) |
| Berkeley | Shared project-template baseline | [cover](after-berkeley-desktop-cover.png) | [cover](after-berkeley-mobile-cover.png) |
| Compare | Existing comparison workspace | [cover](after-compare-desktop-cover.png) | [cover](after-compare-mobile-cover.png) |
| Floor-plan library | Existing approved plan library | [cover](after-floorplans-desktop-cover.png) | [320px](after-floorplans-narrow-cover.png) |
| Individual plan | Existing verified entity | [cover](after-plan-desktop-cover.png) | [cover](after-plan-mobile-cover.png) |
| Inquiry | Existing lead form | [cover](after-inquire-desktop-cover.png) | [cover](after-inquire-mobile-cover.png) |

All 24 final cover captures (8 routes × 1440/390/320px) are stored here. Full final captures and detailed interaction screenshots remain in the ignored local `output/playwright/round3/` and `output/playwright/interactions/` directories. [Rendered view measurements](rendered-views.json) record overflow, visible headings, image failures and page errors. [Source fingerprints](source-fingerprints.json) bind the screenshots to their implementation files.

## Validation

| Check | Result / scope |
|---|---|
| `npm run typecheck`; `npm run build` | Pass. 117 final HTML files; canonical routes/prerendering retained. |
| `npm test` | Pass: 102 unit tests plus the full no-write launch suite and gatekeeper (1,150 files). Includes source/copy/SEO/schema/consent/form accessibility/image/map/content-studio checks. |
| `test:intel:phase-a`; `test:p2:shadow` | 57 / 122 tests passed. No activation. |
| `qa:integration` | Pass: desktop/mobile navigation, consent, attribution and 12 intercepted submissions; no-JS native navigation included. |
| `check-comparisons.mjs` | Pass: two focused comparisons, JS/no-JS desktop/mobile, explicit subsets, inquiry and cross-surface context. |
| `qa:floorplan-entities -- --browser` | Pass: 24 views and 36 intercepted submissions across six released Olara plans. |
| `qa:commercial -- --browser` | Pass: 8 views and 8 intercepted submissions. |
| `check-batch6-concierge.mjs` | Pass: 22 views and all five request-intent examples. |
| `check-v2-interactions.mjs` | 12 suites: directory search/URL/reload/filter/reset/sort, comparison persistence, floor-plan dialog keyboard containment and focus return, invalid/corrected/error/retry/success inquiry. 1440/390/320px. |
| `qa:maps-keyed` | Eight real Google Maps scenarios: loader/tiles, zoom in/out, controls unobscured, first-visit consent and pan, concierge open/Escape/focus. No mock/fallback accepted. |
| Gallery review | Desktop/mobile: native dialog, previous/next, arrow keys, Tab wrapping, Escape/focus return, lazy single-image loading and SPA enhancement. |
| Concierge lifecycle review | Home → project → map → inquiry → Back; resize to desktop; actual replacement of the prerendered shell; one launcher preserved with correct context. |
| Visual review | 24 final views: no horizontal document overflow, broken visible images or page errors; one visible H1 per view. |
| Performance budget | Pass at existing thresholds. Main chunk ~532KB raw / 117KB gzip retains Vite's >500KB advisory. Two source stylesheets add ~65KB raw / 11KB gzip, separately linked using the existing editorial stylesheet pattern; no threshold raised. No Core Web Vitals claim. |
| Assets and intelligence | Zero asset blockers/broken references/local-path leaks; 426 advisories. 97 intelligence review items also reproduced on clean main. |

The final built preview uses a dummy analytics ID to exercise consent; tests intercept analytics transport and every lead POST. The preview server is local-only and rejects POSTs. No real leads were sent. Test JSON that includes a Git SHA was produced before commit, so its `testedSha` is the clean base plus the uncommitted source identified in the fingerprint manifest.

The temporary Python preview server intermittently reset connections under image load. A local Node streaming server replaced it; browser checks against the delivered preview were rerun. Earlier failed captures are not the final evidence. The visible inquiry-heading overlap and collapsed directory request actions were corrected before final capture.

CI status is reported separately on the draft PR. No production merge, deployment, account change, parked-automation activation or live-health claim is included.
