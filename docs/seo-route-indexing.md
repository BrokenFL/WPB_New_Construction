# SEO Route Indexing

## Index

- `/`
- `/buildings`
- `/map`
- `/compare`
- `/updates`
- `/floorplans/`
- `/floor-plans`
- `/market-notes/`
- `/market-notes/:slug/`
- `/blog/` compatibility route
- `/blog/:slug/` compatibility route
- `/projects/:slug/`
- `/corridors/north-flagler/`
- `/corridors/downtown/`
- `/corridors/south-flagler/`

## Consider Noindex

- `/inquire/`
- `/contact/` compatibility route

Reason: these are primarily lead-form utility routes. They can remain crawlable for now, but they do not yet add much unique public search value beyond contact intent.

## Sitemap Notes

- `/market-notes/` is present in the sitemap.
- `/blog/` is present as a compatibility route.
- This branch adds article detail URLs to the generated sitemap.
- Building detail pages should remain indexed with unique titles/descriptions.

## Canonical Recommendations

- Canonical Market Notes articles to `/market-notes/:slug/`.
- Treat `/blog/:slug/` as compatibility. If redirects are later added, redirect `/blog/:slug/` to `/market-notes/:slug/`.
- Canonical `/floor-plans` to `/floorplans/` if route redirects are added.
- Canonical `/contact` to `/inquire/` if route redirects are added.

## Search Console Checklist

- Submit updated sitemap after deployment.
- Inspect `/market-notes/active-sales-vs-pipeline-watch/`.
- Inspect one building detail page.
- Inspect `/updates/`.
- Watch for duplicate indexing between `/blog/:slug/` and `/market-notes/:slug/`.
