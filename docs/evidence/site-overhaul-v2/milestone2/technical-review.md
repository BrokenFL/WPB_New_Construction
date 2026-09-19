# Technical QA review — Milestone 2

Reviewed September 19, 2026 against built preview `http://127.0.0.1:5188/` at exact SHA `0c36a09375dbd1cbe8fa3187aeaefcb49c8873e6`. Configured QA model: `gpt-5.6-luna/max`. This separate reviewer authored the regression harness and the scoped corridor-grid CSS repair; this is not a fully independent code or security audit.

## Judgment

| Surface | Score | Judgment |
|---|---:|---|
| Desktop | **8.5/10** | Professional and usable with demonstrable polish in source-bound content, interaction state, route continuity, and visual containment. |
| Mobile | **8.3/10** | Professional and usable with demonstrable polish after the corridor-grid overflow repair; the score stays lower because device and field-performance evidence is limited. |

These are technical review scores, not a conversion score and not a restatement of the 100% assertion pass rate. The rubric weighs five areas out of two points each: build/integration, source and fact trust, interaction/state continuity, responsive geometry/readability, and performance/production evidence.

Desktop scored 1.9/2 for build and integration, 1.8/2 for source trust, 1.8/2 for interaction and state continuity, 1.7/2 for geometry and readability, and 1.3/2 for performance and production evidence. Mobile scored 1.9, 1.8, 1.8, 1.6, and 1.2 respectively. The deductions are evidence limits and bundle advisory weight, not failed covered behavior.

## Evidence reviewed

- [browser QA](browser-qa.json) reports **72/72 passed, 0 failed**: Chromium and WebKit at 1440, 390, and 320 CSS pixels. Desktop coverage is 28/28; mobile coverage is 44/44.
- [validation summary](validation.json) records a successful TypeScript/Vite build and postbuild route generation. [validation summary](validation.json) records `tsc --noEmit` completion.
- [validation summary](validation.json) records the final test and QA pipeline passing, including `performanceBudget: pass`, approved-news, internal links, forms, floorplan entities, and commercial checks.
- [real Maps results](maps-final-results.json) records keyed map verification passing with real loader responses, loaded map tiles, and zoom-changed tiles at desktop and mobile cases.

The behavioral suite confirms exact homepage publication order and source dates, Alba completion against the reviewed canonical field, Olara delivery `2028` against the reviewed canonical field, related routes, original graphic loading and containment, keyboard and dialog focus behavior, compare desktop/mobile fact parity, compare inquiry context, intercepted 503 then 200 lead handling, readable consent, and consent-blocked analytics.

The stale-receipt regression begins immediately after the intercepted successful 200 receipt. It uses the visible primary navigation to open Floor plans, opens Alba Residence A, follows the viewer CTA, and verifies the new project and plan title/message plus an empty `.form-status` without another POST. The report records `leadPosts: 2`, showing that only the preceding 503 and 200 were sent to the local interception.

## Overflow finding

The mobile body-width failure was a real layout conflict. Legacy mobile rules set `.corridor-guide-grid` to column flow, while the higher-specificity V2 rule left the grid exposed with `overflow: visible`. At 390px, the computed grid had `grid-template-columns: 0 0 168px 168px`; the Palm Beach card extended to x=406 against a 390px viewport. At 320px, the card extended to x=469 against a 320px viewport. The section-jump navigation remains an intentional horizontal rail with its own `overflow-x: auto`.

The scoped repair in [v2-editorial.css](../../../../public/assets/styles/v2-editorial.css) resets only the corridor grid to `grid-auto-flow: row` and `grid-auto-columns: auto`. The QA script retains strict document and body scroll-width assertions; it does not hide or weaken them. Final results show document and body widths equal to the viewport at both 390px and 320px in both engines.

## Limits and residual risk

Playwright WebKit is a desktop browser-engine emulation. It is useful cross-engine evidence, but it is not a physical iPhone, iPad, or mobile Safari session. The run does not establish field performance, device thermals, cellular behavior, installed-user behavior, or live-site health. Lead submissions were intercepted locally and analytics/tag-manager requests were blocked, so the run provides no external-lead delivery, production conversion, or telemetry evidence.

The build passed while retaining advisories: the main JavaScript chunk is about 534.95 kB minified and the main CSS bundle is about 189.43 kB. The Vite output warns about chunks over 500 kB. The performance-budget check passed, but that does not remove the need for field performance measurement or bundle follow-up. No threshold was raised for this review.
