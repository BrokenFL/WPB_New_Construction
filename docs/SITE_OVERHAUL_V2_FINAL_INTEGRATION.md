# V2 final integration — open requirements

These requirements were carried forward explicitly during the Development Desk sprint on draft PR #115. They are not release approvals. The selected warm Shorecrest hero, responsive derivatives, solid masthead and original closing artwork remain fixed for this sprint.

## Independent architectural verification before release

The approved Shorecrest hero reference already has AI-generation provenance. The selected warm treatment is another AI-assisted derivative. Agreement between those two images establishes neither architectural accuracy nor independent corroboration.

Before release, compare the depicted tower geometry, balconies, podium, site surroundings and visible amenities against an original developer or architect source. Record the source URL/file, provenance, date inspected and specific discrepancies or unresolved details. A larger raster or upscale is not recovered factual detail. This comparison remains **unresolved** at the start of the Development Desk sprint; the existing AI-assisted rendering label must remain visible.

## Complete mobile sequence and final typography pass

Review masthead → hero → Development Desk → building discovery in realistic phone viewports, including 390 × 844 and 375 × 812. The Development Desk sprint captures that complete sequence and measures section positions. The inherited tall hero is intentionally unchanged here. Any non-blocking height adjustment belongs in the final typography/mobile-composition pass, assessed against crown visibility, headline contrast, usable navigation and access to current stories.

## Static-hero performance contract

The optional legacy `research/scripts/check-hero-performance.mjs` expects a lazy next carousel layer and the rotating `wpb-geography-map-hero` asset. The current homepage deliberately has a static, responsive Shorecrest hero. Those two legacy assertions previously failed on both the baseline and the finished hero; that is documented evidence, not a green check.

During final integration, update the obsolete carousel expectations to the intentional static contract while preserving meaningful coverage: one initial eager/high-priority hero, responsive source selection, successful image loading, intrinsic dimensions/layout stability, bounded transfer size, no eager secondary carousel image, and reduced-motion behavior where applicable. Run the revised check against rendered desktop/mobile output and retain the existing performance gates. Do not simply delete or bypass checks to make the suite pass. This reconciliation remains **pending** during the Development Desk presentation task.

## Release boundary

The Development Desk reader-journey review also exposed an existing Alba hydration conflict. On the pre-sprint built preview at `5041bc179ac784300fa01fd32e399f2e8668c4d4`, static project output says **Completed**, while the fully loaded client project hero says **Under Construction**. The approved completion story and its links are unchanged. Resolve the project-page presentation against the existing reviewed canonical source during final integration; do not invent or silently alter a project fact. This trust issue is separate from successful navigation and the Desk layout.

The La Fontana approved source date (`2026-07-18`) differs from the date embedded in its source URL (`2026/07/09`). The publisher blocked direct verification during this sprint. The homepage retains the approved record, with independent publisher-date verification explicitly unresolved for editorial review.

Keep PR #115 draft. No merge, deployment, canonical-fact changes, new paid service or parked-automation activation is authorized by this record. Commit, push, CI, preview and release are separate evidence states.
