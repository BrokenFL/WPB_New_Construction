# Final V2 homepage captures

- Result: **automated capture checks passed; direct visual inspection accepted with the WebKit boundary below**
- Local origin: `http://127.0.0.1:5188`
- Source/test SHA: `13d8f79cedfd062c5cc6c90c53456bde097a5d30`
- Captured: `2026-09-20T04:13:40.999Z`–`2026-09-20T04:14:32.949Z`
- Build command: `tsc && node node_modules/vite/bin/vite.js build`

The capture stayed on the active home route. It intercepted no real lead or analytics delivery, refused unexpected mutations, allowed Maps reads, required a visibly decoded Google tile and omitted external query strings from its report.

## Chromium

| Viewport | Full page | Consecutive viewport evidence | Visible local images | Page errors |
| --- | --- | --- | ---: | ---: |
| 1440 × 1000 | [PNG](final/full/home-1440x1000-full.png) | — | 24 | 0 |
| 1024 × 1000 | [PNG](final/full/home-1024x1000-full.png) | — | 24 | 0 |
| 768 × 1000 | [PNG](final/full/home-768x1000-full.png) | — | 24 | 0 |
| 390 × 844 | [PNG](final/full/home-390x844-full.png) | [13 frames](final/phone-390/) | 17 | 0 |
| 375 × 812 | [PNG](final/full/home-375x812-full.png) | captured locally | 17 | 0 |
| 320 × 812 | [PNG](final/full/home-320x812-full.png) | captured locally | 17 | 0 |

All six widths reported zero horizontal overflow. The 390 sequence reaches the actual footer without a vertical gap and includes the real Maps tile state.

## WebKit

Layout/image checks at 1024 × 1000, 768 × 1000 and 375 × 812 each reported zero overflow, three Desk cards, decoded Desk imagery and zero page errors. [Fourteen consecutive 375 × 812 frames](final/webkit-375/) and direct [Desk lead captures](final/element/) are the visual evidence.

WebKit's automated `fullPage` screenshot API omitted some offscreen lazy-painted pixels even after those images decoded. Its single full-page files are diagnostic and intentionally excluded here. This limitation is not presented as a visual pass inferred from image dimensions. See the [direct inspection record](visual-inspection.md).

## Additional evidence

- [Shared buildings and Alba headers at 390 and 320](final/headers/)
- [Normal and 200% text-stress captures](final/stress/)
- [Hero and Development Desk element captures](final/element/)
- [Raw metrics with source/build fingerprints](final/data/metrics.json)
- [Alba no-JavaScript/client continuity proof](final/data/alba-ssr-proof.json)
- [Static-hero browser report](final/data/hero-performance.json)
