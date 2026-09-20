# Final rendered inspection

The final plain build was inspected directly at application source/test HEAD `13d8f79cedfd062c5cc6c90c53456bde097a5d30`. This is local rendered evidence, not a physical-device, field-performance, deployment or conversion claim.

## Accepted composition

- [Desktop 1440 × 1000](final/full/home-1440x1000-full.png), [tablet 1024 × 1000](final/full/home-1024x1000-full.png) and [compact tablet 768 × 1000](final/full/home-768x1000-full.png) show the complete page from the solid masthead through the preserved bridge artwork.
- [390 × 844](final/full/home-390x844-full.png), [375 × 812](final/full/home-375x812-full.png) and [320 × 812](final/full/home-320x812-full.png) show the complete responsive page without horizontal overflow.
- The [13 consecutive 390 × 844 frames](final/phone-390/) establish the actual masthead → hero → Development Desk → discovery → comparison → map → advisory sequence. The first two frames keep all primary paths visible while bringing current reporting into reach without shrinking the hero copy or hiding the rendering label.
- The Development Desk retains one image-led story and two compact illustrated briefs. Its labels, genuine publication/source-report dates and story/building links remain visible. The building preview, comparison module, real Maps tiles, advisory panels and original bridge remain coherent below it.
- [Shared mastheads](final/headers/) remain usable at 390 and 320 on the buildings directory and Alba project page. Alba visibly renders `Completed`. [Normal and 200% stress captures](final/stress/) retain readable navigation and usable controls.

The final art-direction score remains 8.2/10 overall: desktop 8.4, phone 8.2 and tablet 7.9. The inherited tablet 2+1 featured-building grid is the clearest remaining visual weakness; it is usable and intentionally left for a later discovery milestone rather than reopening this bounded integration pass.

## WebKit evidence boundary

WebKit passed the 1024, 768 and 375 layout/image checks with zero overflow, three Desk previews, decoded images and no page errors. Its automated `fullPage` screenshot API can omit pixels for offscreen lazy-painted images even after those images have decoded. The WebKit full-page PNGs are therefore diagnostic only and are not used as sole visual proof.

WebKit visual acceptance uses the [14 consecutive 375 × 812 viewport frames](final/webkit-375/), the separately captured [Desk lead at 375](final/element/webkit-home-375x812-terra.png) and [Desk lead at 768](final/element/webkit-home-768x1000-terra.png), plus the decoded-image inventory in [capture metrics](final/data/metrics.json). Those viewport captures visibly paint the hero, Desk lead, project cards, Maps tiles and lower editorial modules.

## Capture integrity

The capture stayed on the local home route, refused unexpected mutations, stubbed no real lead delivery, blocked non-Maps external requests and omitted all external query strings from recorded metrics. Maps evidence required a real decoded Google tile. The source SHA, working-tree fingerprint and plain-build fingerprint remained stable during the run. [Generated capture record](final-captures.md).
