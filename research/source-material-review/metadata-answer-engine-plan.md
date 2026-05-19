# Metadata And Answer Engine Plan

Implemented in this pass:

- Static site metadata in `public/data/site-meta.json`.
- FAQ/answer blocks in `public/data/answer-engine-faq.json`.
- Floorplan data in `public/data/floorplans.json`.
- Internal image candidate catalog in `research/source-material-review/image-candidate-catalog.json`.
- News/update feed in `public/data/news-feed.json`.
- JSON Feed and RSS exports at `public/feed.json` and `public/rss.xml`.
- `llms.txt`, `robots.txt`, and `sitemap.xml` for crawler orientation.
- App-ready generated data in `src/generated/siteData.ts`.

Recommended refresh task:

- Weekly source refresh against official project pages and trusted reporting.
- Draft new feed titles, modified dates, source links, and conflict notes.
- Require human review before publishing changed copy or new images.

Current feed item count: 3
