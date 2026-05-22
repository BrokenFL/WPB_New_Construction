# WPB New Construction Post-Launch Product Audit

## Executive Summary

The deployed site is the `BrokenFL/WPB_New_Construction` repo, not `BrokenFL/WestPalmNewConstruction`. Commit `e968612` is present on local `main`, the working tree was clean before this branch, and the live site is serving the new bundle with `/market-notes/`, `/blog/`, and `/inquire/` responding successfully.

The product is meaningfully stronger than a generic project directory: it has corridor framing, source-aware updates, project detail pages, floor-plan context, advisor CTAs, and progressive lead capture. The next weakness is depth: Market Notes needed article pages, the update pipeline needed a review gate, and the legacy route names needed clearer handling.

## What Improved

- Homepage hierarchy now leads with the buyer atlas, corridors, updates, Market Notes, and building cards.
- Navigation reads more buyer-friendly: Buildings, Map, Compare, Updates, Floor Plans, Buyer Notes, Contact.
- Contact flow uses Brooke Snader and Douglas Elliman contact details rather than placeholder language.
- Lead capture waits until a second distinct building detail view and does not hard-block browsing.
- Updates include last-checked language and stale-update labeling behavior.
- Public media-status data no longer exposes internal sign-off or authorization phrasing.

## Critical Issues

- The expected repo name in the mission does not match the deployed/local remote. External inspection of `BrokenFL/WestPalmNewConstruction` can show stale or unrelated code.
- `/buildings`, `/map`, `/compare`, and `/floor-plans` returned the app shell live, but were not all first-class routes with unique page content at the start of this audit.
- Market Notes was useful but shallow as a card list before this branch.
- Some mirrored source HTML under `public/projects/**/docs/floorplans` contains source-site navigation text such as Contact; that is source material, not site UI, but it can confuse broad text scans.

## UX / Navigation Notes

- The primary nav is clear and compact.
- The logo returns to the homepage.
- Corridor cards communicate that headers are clickable.
- The map preview works well as orientation, but a dedicated map route should eventually have its own intro and stronger geographic explanation.
- Compare is currently more of a homepage section entry than a complete standalone comparison tool.

## Lead Capture Notes

- Progressive lead capture timing is appropriate: no modal on first building, prompt after second distinct building.
- The modal copy is respectful and does not create false urgency.
- Viewed-building context is stored in session storage and passed into the inquiry flow.
- Mobile sticky CTA and desktop floating CTA are visible; QA should continue checking overlap as new sections are added.

## Visual / Editorial Notes

- The site is polished but still somewhat data-forward.
- Editorial images should emphasize West Palm Beach geography: Downtown west of the Intracoastal, Palm Beach island east across the water, and the Atlantic beyond Palm Beach.
- Avoid generic beach-stock imagery and avoid implying official project renderings where none exist.
- Market Notes should feel like short, useful advisory pieces rather than raw update cards.

## SEO / Content Notes

- Sitemap includes `/market-notes/` and `/blog/`; this branch adds article-detail route planning.
- Building pages need continued unique meta review as new project pages are refreshed.
- `/inquire/` is useful for users but should be considered for `noindex` if it remains a pure lead form.
- Market Notes article pages should be indexed once they contain full article content.

## Recommended Next Branch

`codex/news-automation-and-article-pages`
