# Batch 6 live evidence — September 10, 2026

**Status: BLOCKED by a confirmed mobile hit-target overlap; not LIVE-VERIFIED.**

The approved PR #86 head was `e8483fc3a7a43aabd1827b98667f60f64ff0deb1`. It reached production as merge commit `2d0175eed5157afa58b57cfb8327ec590e2dda95` through the single normal deploy [34523585398](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34523585398) at `https://c0498f38.wpbnewconstruction.pages.dev`. The current public bundle is `assets/index-BNfunLZT.js`.

The selected evidence records 11 routes at 1440px and 390px, four real Maps checks (home and `/map/` at 1366px and 390px), hydrated metadata, concierge intent behavior, and an explicit shortlist selection. The four real Maps loader/tile/zoom/layout checks and the other selected probes pass; all lead submissions were intercepted. The larger Olara and site-health collections remain at `/Volumes/ExternalSSD/WPB_PR86_Review/.runtime/batch6-live-2026-09-10/` and are not required by these links.

The focused mobile check failed after the live `/map/` card was brought into view at 390×844: the Ask WPB launcher overlaps the native Google Maps Zoom-out control by **1,495px²**, and both center and top-left pointer checks hit Ask WPB. The direct pointer confirmation opened the concierge instead of Zoom-out. This confirmed failure blocks final live acceptance and requires a bounded fix and retest; no second deployment is authorized by this evidence.

Draft PR #93 (`fix/batch6-mobile-map-controls`) is **candidate-only, not approved or deployed**. Candidate revision `ae076dc5926baeebedb30b8d45b23a2ade710c05` carries application source `f761a0057460a98a45c333b2ffb16fad5b22e59d` against production base `2d0175eed5157afa58b57cfb8327ec590e2dda95` and moves the shared native Google Maps zoom controls with `zoomControlOptions` `LEFT_CENTER`. Local typecheck, build, 22 concierge views and no-key Maps checks pass, and a candidate-only real-Maps override reports zero overlap. Revision-specific CI is linked at [concierge 34531549077](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34531549077) and [social 34531549133](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34531549133); the latest conclusion belongs to [PR #93](https://github.com/BrokenFL/WPB_New_Construction/pull/93). The final QA contract retains six scenarios for bounded native-control readiness and independent fresh-context mobile zoom directions. A complete successful check set and separate Brooke release approval are required; production remains blocked by the recorded overlap and one authorized deploy has already been used. This selected directory remains PR #86 production evidence and does not prove the candidate or a release.

Selected files:

- [deployment-proof.json](deployment-proof.json)
- [route-matrix.json](route-matrix.json)
- [wpb86-live-concierge-acceptance.json](wpb86-live-concierge-acceptance.json)
- [real-maps.json](real-maps.json)
- [shortlist.json](shortlist.json)
- [hydrated-metadata.json](hydrated-metadata.json)
- [map-mobile-hit-test.json](map-mobile-hit-test.json)
- [map-mobile-pointer-confirm.json](map-mobile-pointer-confirm.json)
- [home-1366-working-map.png](home-1366-working-map.png)
- [map-390-hit-test.png](map-390-hit-test.png)
- [shortlist-selection.png](shortlist-selection.png)

The selected JSON and screenshots were inspected before copying. No API key, token value, authentication header/cookie, email, phone, address, or test-person data is present; the deployment credential statement is already masked and the public Maps key was not recorded. No additional redaction was needed.
