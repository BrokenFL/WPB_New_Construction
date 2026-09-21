# Sprint 3 technical QA — final art-direction checkpoint

Reviewed 2026-09-19 against the rebuilt local preview `http://127.0.0.1:5188/` at exact source SHA `63608542c1d9be95138c2c7606d3fe9aec82d80a`. Configured QA model: `gpt-5.6-luna/max`. The final source is the CSS-only follow-up to the art-direction checkpoint; no route, lead, analytics, or Maps code changed after the integrated and keyed Maps suites recorded below.

The validation chain is preserved by source: the initial frozen candidate was `8b6d70a3c3e07b7794abd07b5b837a806386faef`, the art-review typography follow-up was `a26faad73518e8663bcc8177e3f1b63dfa90b12d`, and the final native-select containment fix is `63608542c1d9be95138c2c7606d3fe9aec82d80a`. Source-specific artifacts remain under `.runtime/v2-sprint3/qa/source-8b6d70a3/`, `.runtime/v2-sprint3/qa/source-a26faad7/`, and `.runtime/v2-sprint3/qa/source-63608542/`.

## Results

| Check | Result |
|---|---|
| Source SHA and preview transport | **Pass.** The checkout HEAD and the milestone/tablet reports both identify `63608542c1d9be95138c2c7606d3fe9aec82d80a`. The built preview returned `200` for `GET /` and `405` for `POST /`; it accepts no write requests. |
| Cross-browser regression | **72/72 passed** in Chromium and WebKit at 1440, 390, and 320 CSS pixels. This includes homepage facts and dates, hero and bridge-image loading/containment, related routes, compare parity and inquiry context, gallery/floorplan keyboard state, intercepted 503→200 inquiry behavior, consent readability, and analytics blocking. Evidence: `.runtime/v2-sprint3/qa/source-63608542/milestone2-qa.json`. |
| Integrated journeys | **Pass** from the unchanged `a26faad73518e8663bcc8177e3f1b63dfa90b12d` proof: 12 locally intercepted lead submissions across desktop/mobile, PII excluded from analytics state, consent persistence, native/no-JavaScript route continuity, and duplicate-event checks clear. Evidence: `.runtime/v2-sprint3/qa/source-a26faad7/integration/results.json`. |
| Keyed Maps | **8/8 passed** in the unchanged `a26faad73518e8663bcc8177e3f1b63dfa90b12d` proof with the real Google Maps loader, loaded map tiles, zoom-changed tiles, mobile control hit testing, first-visit consent geometry, and no fallback accepted. Visible loaded homepage map captures: `.runtime/v2-sprint3/qa/source-a26faad7/maps/home-1366-zoom-in-working-map.png` and `.runtime/v2-sprint3/qa/source-a26faad7/maps/home-390-zoom-in-working-map.png`. |
| Focused tablet probe | **4/4 passed** at 768px and 1024px CSS widths, plus 200%-equivalent half-CSS-width probes at 384px and 512px. Evidence: `.runtime/v2-sprint3/qa/source-63608542/focused-tablet-qa.json`. |
| 320px comparison control | **Pass** in Chromium and WebKit before and after changing the second selection from the default long Ritz value to Shorecrest. Both browsers kept document/body width at 320px; the picker/form stayed at 284px, two preview cards rendered, and no page errors occurred. Evidence: `.runtime/v2-sprint3/qa/source-63608542/native-select-320-final.json` and the paired compare-section screenshots in the same directory. |
| Full test suite | **Pass** for the root-run `npm test` at final SHA `63608542c1d9be95138c2c7606d3fe9aec82d80a`. |

## Art direction and accessibility evidence

The homepage active hero now renders the Shorecrest source asset `/projects/shorecrest/media/user-provided-shorecrest-hero.jpg`. At 1440px it loaded completely at natural dimensions `1280x955`, rendered in a `1440x690` box, and exposed the alt text `Architectural rendering of Shorecrest's waterfront tower on North Flagler Drive.` The visible caption is `Shorecrest · North Flagler · Architectural rendering`. Evidence: `.runtime/v2-sprint3/qa/source-63608542/art-direction-check.json`.

The reduced-motion tablet contexts reported `transitionDuration: 0s`, `animationDuration: 0s`, and `transform: none` for the hero and featured project card at both 768px and 1024px. Keyboard focus reached the masthead brand, Buildings navigation link, and hero primary CTA. Each rendered a solid 2px `rgb(143, 185, 173)` outline with a 3px offset, and keyboard activation reached Buildings.

All final milestone viewports had document and body widths within the viewport. The earlier `a26faad` run preserved one WebKit-only failure at 320px: the long native Ritz comparison selection caused the second picker label/grid to report `scrollWidth=304px` from a 284px box, propagating to `body.scrollWidth=322px`. The final scoped rule contains the comparison select with `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`. The final 636 run is 72/72, and the default long selection plus the Shorecrest selection both remain at body width 320px. The full Ritz name remains available in the comparison preview card.

## Transport and evidence limits

Lead POSTs in the browser suites were intercepted locally; no external lead was sent. Analytics and tag-manager requests were blocked or intercepted. The keyed Maps suite used real loader and tile responses, but it did not send lead or analytics traffic. The focused tablet probe issued zero lead requests and zero analytics requests.

The tablet 200%-equivalent checks use half CSS viewport widths (384px and 512px), not physical-device testing or real browser text zoom. This checkpoint does not establish external lead delivery, production analytics, physical-device behavior, live production health, merge, deployment, or installed-user/device use. The full-page Maps captures can show gray offscreen tiles while the keyed viewport checks confirm loaded tiles, zoom changes, and usable controls; the visible desktop/mobile captures above are the keyed homepage viewport evidence.

The prior source checkpoint remains archived under `.runtime/v2-sprint3/qa/source-3905a12f/`; the intermediate 8b and a26 artifacts remain under their source-specific directories. No release, merge, push, or deployment was performed by this QA pass.
