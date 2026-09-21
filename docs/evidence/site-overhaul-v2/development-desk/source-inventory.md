# Development Desk source inventory

Bounded read-only inventory for the three newest approved/published stories in PR115’s existing news consumer. Generated 2026-09-19 from worktree `codex/site-overhaul-v2` at `5041bc179ac784300fa01fd32e399f2e8668c4d4`.

The authoritative source is `research/news-review/approved-development-news.json`. The existing consumer filters `status === "published"`, sorts through `newsSortTimestamp` in `src/data/approvedExternalNews.ts`, and takes `publishedExternalNews.slice(0, 3)` in `src/main.ts`. That order is preserved here. `publishedAt` is the site publication date; `sourcePublishedDate`/`sourcePublishedAt` remains the source report date and is recorded separately.

## Ordered story snapshot

### 1. Terra and Frisbie Add $20M Parcel to West Palm Beach Assemblage

- Story ID: `intel-story-7e8443a31a1b3fbb`
- Article: `/updates/terra-frisbie-20m-west-palm-beach-assemblage-2026-2026-09-15/`
- Site publication: `2026-09-15T04:50:01.037Z`
- Source date: `2026-09-09` — [The Real Deal](https://therealdeal.com/miami/2026/09/09/terra-frisbie-buy-more-of-former-palm-beach-kennel-club/)
- Approved deck: “Terra and Frisbie Group have acquired another parcel of the former Palm Beach Kennel Club site for $20 million, expanding their master-planned West Palm Beach footprint.”
- Approved buyer takeaway: “The acquisition expands a master-planned site intended for large-scale mixed-use and residential development; detailed project programming is still to come.”
- Faithful short-teaser candidates:
  - “Terra and Frisbie add another $20 million parcel to a growing West Palm Beach assemblage.”
  - “A new $20 million acquisition expands the planned mixed-use and residential footprint.”
  - “The assemblage grows, while detailed programming remains to come.”
- Relationship: `terra-frisbie-wpb-assemblage`; no dedicated current project route was found. Use the approved article route and, if needed, the generic `/corridors/` hub labeled as West Palm Beach context.
- Lead image: `/assets/home/downtown-corridor-bridge-daytime-v01.jpg` — 1920×1080, 743,505 bytes, SHA-256 `b781657090ac7338b3c3f6dae12532adf40f7e84e47ce070ff2f30171bd66d10`.
- Truthful image treatment: visible label `West Palm Beach · editorial context`; caption `Downtown bridge and waterfront context for a West Palm Beach development story.` Credit `Approved front-page asset; visual origin not certified in manifest.` The approved-folder and publish-manifest records establish placement approval, not whether the visual is a photo, rendering, or AI-generated image. Do not imply it depicts the Terra/Frisbie parcel or a site plan.

### 2. Unicorp Under Contract for $200M La Fontana Buyout on North Flagler

- Story ID: `intel-story-26c1c72f59519b2e`
- Article: `/updates/unicorp-200m-la-fontana-buyout-north-flagler-2026-2026-09-15/`
- Site publication: `2026-09-15T04:49:30.941Z`
- Source date: `2026-07-18` — [The Real Deal / Discover South Florida](https://therealdeal.com/miami/2026/07/09/chuck-whittall-buying-la-fontana-co-op-in-west-palm-beach/). The approved `sourcePublishedDate` conflicts with the `/2026/07/09/` URL path; preserve the approved record for UI display and do not imply the source-date mismatch is independently resolved.
- Approved deck: “Chuck Whittall’s Unicorp is under contract to acquire the 140-unit La Fontana waterfront co-op for roughly $200 million, with closing projected for 2027.”
- Approved buyer takeaway: “The verified update is the roughly $200 million acquisition contract and projected 2027 closing; a future redevelopment program has not yet been established.”
- Faithful short-teaser candidates:
  - “Unicorp is under contract for La Fontana at roughly $200 million, with closing projected for 2027.”
  - “The North Flagler transaction is verified; a future redevelopment program is not yet established.”
  - “A 140-unit waterfront co-op becomes a major North Flagler transaction to watch.”
- Relationship: `la-fontana-north-flagler-buyout`; no dedicated current project route was found. Related corridor: `/corridors/north-flagler/`.
- Lead/secondary image: `/assets/editorial/wpb-corridors-aerial-hero-v01.jpg` — 1280×533, 313,612 bytes, SHA-256 `245115ba40b082a98260f87af99f2adff4ae6d8e4db2575147ae7a9b346cdfe0`.
- Truthful image treatment: visible label `Corridor context`; caption `West Palm Beach corridor orientation.` Credit `User-provided editorial image, optimized for site use; visual origin not certified.` The current editorial record marks the asset available, but no approved-folder or asset-manifest record was found. Use as geographic context only; do not imply it depicts La Fontana, its existing building, a future replacement, or a redevelopment rendering. The existing approved article body image `/assets/home/north-flagler-3-buildings-daytime-v01.jpg` is retained as a separately recorded approved context fallback, not silently substituted here.

### 3. Alba Palm Beach Is Complete and Move-In Ready on North Flagler

- Story ID: `intel-story-544ca384b5f936f2`
- Article: `/updates/alba-palm-beach-complete-move-in-ready-north-flagler-2026-09-14/`
- Site publication: `2026-09-14T18:56:38.846Z`
- Source date: `2026-06-22` — [Florida YIMBY](https://floridayimby.com/2026/06/new-photos-showcase-completed-alba-palm-beach-at-4714-n-flagler-drive-in-west-palm-beach.html)
- Approved deck: “The 22-story, 55-residence tower at 4714 N. Flagler Drive has completed construction, giving buyers a move-in-ready new-construction option on North Flagler.”
- Approved buyer takeaway: “Alba offers buyers a completed, move-in-ready new-construction option rather than a future-delivery commitment.”
- Faithful short-teaser candidates:
  - “Alba is complete and move-in ready, with 55 residences across 22 stories on North Flagler.”
  - “Completion gives buyers a finished new-construction option instead of a future-delivery commitment.”
  - “The verified update is completion; check current inventory and pricing separately.”
- Related routes: `/projects/alba-palm-beach/`, `/corridors/north-flagler/`.
- Project image: `/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-wide-aerial-v01.webp` — 1316×740, 139,328 bytes, SHA-256 `eb99c2a2b0f586034825101e2d44e16527819d05ca24b2ad75168fc34a10d79f`.
- Truthful image treatment: visible label `Alba · Architectural rendering`; caption `Alba Palm Beach architectural rendering from approved project marketing materials.` Credit `Alba Palm Beach project marketing materials.` The project registry explicitly records this as a rendering and status `approved`. The image does not establish completion; that claim comes from the approved story record.

## Asset organizer and evidence boundary

No callable asset-organizer MCP/tool was available. The bounded read-only interface used was the SSD asset warehouse README and manifest at `/Volumes/ExternalSSD/WPB_NewConstruction_Assets/README.md` and `/Volumes/ExternalSSD/WPB_NewConstruction_Assets/asset-manifest.json`, checked against the website’s `data/generated_homepage_asset_publish_manifest.json`, `data/project_assets.json`, and `src/data/editorialImagery.ts`. No intake, publisher, resize, copy, service, or repository write command was run.

The bridge asset has approved-front-page source and generated-publish-manifest provenance. The North Flagler fallback has the same approved-front-page evidence. Alba has approved project-asset registry and SSD manifest evidence. The corridor aerial is an existing available editorial asset with a source record but no approved-folder manifest record. For the first two images, actual pixels establish only visible context; they do not establish AI, photograph, or rendering origin, so the inventory keeps that field `unknown`.

The image record and machine-readable story snapshot are adjacent to this file:

- `.runtime/development-desk/bounded-story-snapshot.json`
- `.runtime/development-desk/asset-record.json`

No approved news data, generated data, article, asset pipeline, masthead, closing image, or new hero concept was changed.

## Source-date verification limitation

The approved La Fontana source date is July 18, 2026, while its [source URL](https://therealdeal.com/miami/2026/07/09/chuck-whittall-buying-la-fontana-co-op-in-west-palm-beach/) contains July 9. A direct read on September 19 returned a JavaScript/robot-verification page, so it did not independently establish the publisher date. The presentation retains the approved source date unchanged; the discrepancy remains unresolved for editorial review. Date QA in this sprint verifies faithful display of approved records, not independent re-reporting.
