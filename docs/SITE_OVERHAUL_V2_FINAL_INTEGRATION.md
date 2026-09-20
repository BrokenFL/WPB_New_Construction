# V2 final integration checklist

This record supersedes the open requirements carried from the Development Desk sprint. It continues draft PR #115 from `ca7893df1315fd484382a515b99c7ffb0fecd199`. It is a review record, not merge, deployment or release approval. Exact source identity and final verification are recorded in the [evidence index](evidence/site-overhaul-v2/final-integration/README.md).

## Composition and presentation

| Item | Status | Resolution and evidence |
| --- | --- | --- |
| Whole-page typography and rhythm | **FIXED** | Sentence-case navigation/actions, explicit arrow gaps, readable 13px secondary links and 44px targets; consistent phone gutters; corridor spacing and natural NORA headline wrapping. Only touched CSS was consolidated. [Fresh rendered critique](evidence/site-overhaul-v2/final-integration/fresh-review.md). |
| Complete phone opening | **FIXED** | Hero minimum reduced from 820px to 760px with copy sizes preserved. Explore remains primary; Compare and Latest share the secondary row. Crown and AI-assisted caption remain visible. Latest moves roughly 90px earlier, with all three Desk previews retained. Final phone sequences cover masthead through footer. |
| Static hero accessibility | **FIXED** | Removed the obsolete screen-reader descriptions of five carousel slides. The selected image alt and visible caption remain; regression coverage requires one actual hero image and no unused-slide list. |
| Project inquiry semantics | **FIXED** | The manual form describes its existing inquiry interest and submits as “Send inquiry”; direct released-floorplan access remains open. No fact, destination or lead endpoint changed. |
| Fresh design review | **FIXED** | Independent Astra extra-high UI/art-direction, graphic-design and buyer review inspected rendered pages and actual keyboard/journeys. Two focused visual rounds completed. Overall 8.2/10, desktop 8.4, phone 8.2, tablet 7.9; these are subjective critique scores. |
| Tablet featured grid | **NON-BLOCKING LIMITATION** | Inherited 2+1 layout is usable but compositionally less resolved than desktop/phone. The reviewer explicitly retained the below-8 tablet score rather than reopening the design. |
| Fonts and device coverage | **NON-BLOCKING LIMITATION** | This Mac renders Iowan Old Style and Avenir Next. Browser-only Georgia/Arial fallback stress was inspected; identical Windows/Android rendering is not established. Chromium/WebKit phone viewports are emulation, not a physical iPhone or assistive-technology certification. |

## Factual continuity and ownership

| Item | Status | Resolution and evidence |
| --- | --- | --- |
| Alba SSR/client status conflict | **FIXED** | The existing resolver now supplies status to showcase hero tags and existing Status facts. It preserves the canonical `Completed` projection instead of allowing stale showcase `Under Construction` to win. The source is the existing qualified automated projection, not a newly claimed manual approval. No canonical data changed; historical articles remain snapshots. Direct/reload/SPA/back/card/compare tests protect continuity. Structured-data omission remains intentional. |
| Independent Shorecrest comparison | **AWAITING OWNER DECISION** | Official developer/architect imagery corroborates broad massing and terrace language, but the selected AI treatment changes facade, podium and foreground details. The complete original supports the dock/pergola's presence; the earlier crop cannot establish its absence. Exact architectural accuracy remains a release issue. [Sources and comparison](evidence/site-overhaul-v2/final-integration/source-verification.md). |
| Shorecrest correction/fallback | **AWAITING OWNER DECISION** | Preferred bounded correction: retain the composition and use a non-generative warm grade of the official developer EXT02 original after its website rights/use is approved. The warehouse copy is marked `rights review required`; no byte-identical approved original was found. Its Topaz upscale metadata is not recovered-detail proof. No silent promotion or replacement occurred. |
| La Fontana source/date pairing | **AWAITING OWNER DECISION** | Discover South Florida's readable publisher metadata establishes July 18. The Real Deal's permitted publisher search record establishes July 9; its direct page remains WAF-blocked, with no bypass. The approved record pairs July 18 with the TRD URL. Choose July 18 + DSF citation (retaining TRD underneath), or July 9 + TRD citation (retaining DSF as secondary), through the existing editorial approval process. Website publication on September 15 remains distinct; the stored event/discovery date is not proof of a transaction date. No approved data changed. |

## Technical integration

| Item | Status | Resolution and evidence |
| --- | --- | --- |
| Static hero performance contract | **FIXED** | The retired carousel assertions were replaced with the intentional static contract: one eager/high-priority hero request, responsive desktop/mobile sources, reserved geometry, bounded bytes, successful loading and reduced-motion behavior. Browser coverage passed 12/12; no check was disabled. |
| Future-news/count-neutral contract | **FIXED** | Isolated fixtures cover genuine date ordering, source-override invalidation, one/zero story states, missing imagery and long headlines. The milestone check now expects the intentional count-neutral Desk note and passed 84/84 across Chromium/WebKit and desktop/phone widths. |
| Buyer-flow regression | **FIXED** | The full test command passed. Final gaps passed 54/54 in Chromium/WebKit, including direct/reload/back paths, Alba status continuity, floorplan/compare inquiry context and accessible static-hero output. Synthetic consent journeys passed with 12/12 intercepted submissions; no real lead or analytics payload was sent. |
| Maps and plain preview | **FIXED** | Keyed Maps passed desktop/mobile home and map routes with decoded real tiles, zoom changes and mobile control geometry. A plain build was restored afterward; `/`, `/market-notes/` and Alba returned HTTP 200, while preview `POST /api/leads` returned 405. |
| Responsive rendered inspection | **FIXED WITH CAPTURE LIMIT** | Six Chromium sizes and three WebKit sizes had zero overflow or page errors. Chromium full pages and consecutive 390px frames were visually accepted. WebKit's automation `fullPage` API omitted some decoded offscreen paints, so WebKit acceptance uses consecutive viewport and element captures; the limitation is explicit. [Rendered evidence](evidence/site-overhaul-v2/final-integration/visual-inspection.md). |
| Asset audit | **NON-BLOCKING LIMITATION** | Strict audit passed with zero blockers, broken references or local-path leaks and 426 retained warnings. Existing Vite large-chunk advice remains. |
| Field/device validation | **NON-BLOCKING LIMITATION** | Browser emulation does not establish physical-iPhone, assistive-technology, field-performance, delivered-lead, deployed or live-health behavior. |

Implementation source freeze: `1d0dc31e15d0ae1916ad187f2575317436f9ea68`. Test-only correction: `13d8f79cedfd062c5cc6c90c53456bde097a5d30`. [Final QA](evidence/site-overhaul-v2/final-integration/final-qa.md) and the [evidence index](evidence/site-overhaul-v2/final-integration/README.md) bind the exact local results. Final pushed identity and current-head CI are added only after the documentation/evidence commit reaches the draft branch.

No new images, motion libraries, paid services, publishing system, canonical-fact edits or automation activation are part of this milestone. The selected hero derivatives, image-led Desk assets and original bridge remain preserved. PR #115 stays draft; main and unrelated work remain protected.
