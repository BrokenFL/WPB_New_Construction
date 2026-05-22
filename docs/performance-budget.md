# WPB New Construction Performance Budget

## Build Budgets

- JavaScript chunks: max 450 KB uncompressed.
- CSS chunks: max 140 KB uncompressed.
- Editorial images: max 750 KB per file.
- New public non-project images: max 1.5 MB per file.

## Image Loading Rules

- Hero media may be eager only when it is a true first-viewport image.
- Card, list, news, article, corridor, and editorial panel images should be `loading="lazy"` and `decoding="async"`.
- `decoding="sync"` is not allowed.
- Broad `fetchpriority="high"` is not allowed.

## Current Allowlist

The performance gate allows these inherited large image areas while the site is being incrementally optimized:

- `public/projects/` project media archive.
- `public/concepts/` concept screenshots.
- `public/maps/wpb-atlas-map.png`.

New editorial assets are not allowlisted and must remain under budget.
