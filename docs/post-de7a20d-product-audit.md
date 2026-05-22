# Post-de7a20d Product Audit

Date: 2026-05-22  
Branch baseline: `de7a20d`

Live bundle check on 2026-05-22 returned `/assets/index-CdRFVfuO.js` and `/assets/index-BTT2FP0A.css`, so live still reflects the previously reported bundle at the time of this audit. Route assertions below were performed against local preview of this branch.

## Route Audit

| Route | Audit |
| --- | --- |
| `/` | Corridor cards are image-first with distinct North Flagler, Downtown/Rosemary, and South Flagler imagery. Homepage news slot uses external source-linked article cards. No horizontal overflow found in mobile checks. |
| `/map/` | Corridor guide cards use imagery and buyer thesis copy. Cards no longer rely on stacked project names. |
| `/updates/` | Displays approved external development headlines with source, date, description, related label, and direct article links. Old pseudo-update cards are no longer part of this route. |
| `/market-notes/` | Existing buyer-note editorial surface remains separate from external-news feed. It still references market guidance, but not as fake external news. |
| `/market-notes/active-sales-vs-pipeline-watch/` | Article route keeps buyer guidance framing. Related updates should continue to use the shared image resolver when external/news cards are rendered. |
| `/corridors/north-flagler/` | Route hero uses North Flagler image and buyer thesis. No South Flagler/Downtown image leakage observed in code mapping. |
| `/corridors/downtown/` | Route hero uses Downtown/Rosemary imagery and walkability copy. |
| `/corridors/south-flagler/` | Route hero uses South Flagler imagery and quieter waterfront copy. |
| `/projects/rosewood/` | Identity header is clear with text fallback. Planning CTA uses updates, not current availability. Missing-info and related-news panels are useful. |
| `/projects/olara/` | Identity header shows logo plus readable project name. Complete-profile CTA remains current availability. |
| `/projects/nora-house/` | Identity header uses text fallback. Market-marker page uses email signup and avoids treating the project like a fully available sales page. |
| `/projects/shorecrest/` | Advisory page has clear identity header and full inquiry path. Logo added on this branch. |
| `/inquire/` | Full inquiry remains available. A lightweight email signup exists beside the advisory copy and does not require phone, budget, message, or residence size. |

## Findings

- Corridor cards: good direction after `de7a20d`; mobile card height is reasonable and image crops are visible.
- External news: approved items are real article links using original headlines and external source names.
- Hokey pseudo-updates: old handwritten update cards were removed from the public updates route; generated buyer-note content still belongs in Market Notes.
- Project identity: every project page renders project name text at the top; logo fallback behavior works.
- Planning/source-watch pages: Rosewood and NORA House use softer update CTAs and missing-info panels.
- Email signup: lightweight path exists; this branch tightened the success copy to `You're on the list.`
- Buyer interior image: still deferred; placeholder is preferable to an unsourced generic image.
- Broken links: approved news source links were checked by HTTP status and returned 200.

## Priority Fixes Completed On This Branch

- Added more local project logos and documented fallback decisions.
- Added JSON-based approved-news promotion workflow.
- Added approved-news and project-logo QA gates.
- Added explicit inventory/audit docs.

## Remaining Watch Items

- Source a proper buyer-intelligence interior image only when a source-cleared asset exists.
- Use browser-authenticated review for NORA House and Maison d'Or logos if command-line fetch remains blocked.
- Consider a small private editor for approving news JSON if manual file editing becomes too slow.
