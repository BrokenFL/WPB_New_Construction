# Asset Pipeline Visual Route QA

Generated: 2026-05-27

## Summary

- Result: pass
- Recommendation: safe to commit the website asset pipeline work in separated chunks
- Routes checked:
  - `/projects/alba-palm-beach`
  - `/projects/berkeley`
- Viewports checked:
  - Desktop: 1440 x 1100
  - Mobile-ish: 390 x 900

## Commands Run

- `npm run assets:audit`
- `npm run typecheck`
- `npm run build`
- `npm test`
- `npm run preview -- --host 127.0.0.1`
- Playwright route checks against `http://127.0.0.1:4173/projects/alba-palm-beach`
- Playwright route checks against `http://127.0.0.1:4173/projects/berkeley`

## Route Findings

### Alba Palm Beach

- Page loaded with HTTP 200.
- Browser title: `Alba Palm Beach West Palm Beach | Buyer Guide`
- Hero image rendered from `/assets/projects/alba-palm-beach/...`.
- Gallery rendered 22 approved `/assets/projects/...` images.
- Floorplan links/cards were present.
- No visible broken images after scrolling and decoding lazy images.
- No console errors or failed network requests were observed.
- No `/Users`, `/Volumes`, iCloud, or asset repo paths appeared in rendered route HTML.
- No obvious horizontal overflow was detected at desktop or mobile-ish width.
- Screenshots:
  - `output/playwright/alba-palm-beach-desktop.png`
  - `output/playwright/alba-palm-beach-mobile.png`

### Berkeley

- Page loaded with HTTP 200.
- Browser title: `The Berkeley West Palm Beach | Buyer Guide`
- Hero image rendered from `/assets/projects/berkeley/hero/berkeley-hero-exterior-lake-view-v01.webp`.
- Gallery rendered 19 approved `/assets/projects/...` images.
- Legacy `/projects/berkeley/media/imported/...` gallery images were replaced by approved registry-backed public assets.
- Floorplan links/cards were present.
- No visible broken images after scrolling and decoding lazy images.
- No console errors or failed network requests were observed.
- No `/Users`, `/Volumes`, iCloud, or asset repo paths appeared in rendered route HTML.
- No obvious horizontal overflow was detected at desktop or mobile-ish width.
- Screenshots:
  - `output/playwright/berkeley-desktop.png`
  - `output/playwright/berkeley-mobile.png`

## Asset Checks

- Published website project asset files: 60
- Broken `/assets` references: 0
- Missing pipeline links after refresh: 0
- Remaining strict audit findings are pre-existing research-script local path warnings, not generated website registry references.

## Notes

- No curated pricing, project descriptions, local takes, buyer profiles, or status copy was intentionally changed.
- The only project-page code change was to prefer approved registry-backed project assets for the gallery when they exist.
