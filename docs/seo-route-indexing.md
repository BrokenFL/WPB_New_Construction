# WPB New Construction SEO Route Indexing

## Canonical Route Strategy

| Public surface | Canonical route | Alias route | Behavior | Indexing recommendation |
| --- | --- | --- | --- | --- |
| Market Notes index | `/market-notes/` | `/blog/` | `public/_redirects` 301 plus client-side replaceState fallback | Index canonical; keep alias out of sitemap |
| Market Notes article | `/market-notes/:slug/` | `/blog/:slug/` | `public/_redirects` 301 plus client-side replaceState fallback | Index canonical; keep alias out of sitemap |
| Inquiry | `/inquire/` | `/contact/` | `public/_redirects` 301 plus client-side replaceState fallback | Consider noindex if it remains only a form; canonical to `/inquire/` |
| Floor plans | `/floorplans/` | `/floor-plans/` | `public/_redirects` 301 plus client-side replaceState fallback | Index `/floorplans/`; keep alias out of sitemap |
| Building detail | `/projects/:id/` | query-string project routes | Render canonical metadata for `/projects/:id/` | Index project detail pages |
| Corridor detail | `/corridors/:key/` | none | Direct route | Index corridor pages |

## Indexed Routes

- `/`
- `/buildings/`
- `/projects/:id/`
- `/map/`
- `/compare/`
- `/updates/`
- `/floorplans/`
- `/market-notes/`
- `/market-notes/:slug/`
- `/corridors/north-flagler/`
- `/corridors/downtown/`
- `/corridors/south-flagler/`

## Alias Handling

Static redirects are declared in `public/_redirects`:

```text
/blog/ /market-notes/ 301
/blog/:slug/ /market-notes/:slug/ 301
/contact/ /inquire/ 301
/floor-plans/ /floorplans/ 301
```

The client route resolver also replaces those aliases with the canonical URL after JavaScript loads. The prerender step writes canonical metadata to the preferred URL even if an alias page is generated for compatibility.

## Notes

- Alias routes are intentionally removed from `public/sitemap.xml`.
- `/inquire/` is useful for buyer conversion but thin as a search result. Keep it canonicalized and consider adding `noindex` only if Search Console shows it competing with richer buyer pages.
- Do not keyword-stuff corridor pages. Let the local geography and buyer questions carry the page.
