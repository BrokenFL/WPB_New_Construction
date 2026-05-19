# News Refresh Automation

Run this command from the repository root for the recurring news-refresh agent:

```bash
npm run news:refresh
```

The command regenerates `public/data/news-feed.json`, `public/feed.json`, `public/rss.xml`, `public/llms.txt`, `public/sitemap.xml`, and `src/generated/siteData.ts` from the source-review workspace.

## Agent Contract

- Read source facts from `research/source-material-review/project-source-catalog.json`.
- Keep each update linked to its original source via `sourceUrl` and `sourceLinks`.
- Use `rewrittenSummary` for buyer-facing article copy, not copied article text.
- Use `image` metadata from the image catalog when an authorized source asset exists.
- Preserve `image.credit` as the original-source credit line.
- Do not publish scraped article text verbatim.
- Do not mark a new image source authorized without a recorded sign-off.
- Run `npm run build` and `npm run qa:launch` after refreshing before any launch handoff.

## Suggested Cadence

Daily while the site is in launch mode, then weekly after launch unless there is active project news.
