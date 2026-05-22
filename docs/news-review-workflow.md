# News Review Workflow

The public news feed is manual-review first. Raw RSS/search candidates never publish directly.

1. Run `npm run news:fetch`.
2. Review `research/news-review/development-news-candidates.json`.
3. Copy selected records into `research/news-review/approved-development-news.json`.
4. Confirm each approved item has the original article headline, original source, direct source URL, published date, short neutral description, category, `relatedProjectIds`, `relatedCorridorIds`, `paywallStatus`, and `status: "published"`.
5. Exclude hard-paywall, login-only, duplicate, unrelated, generic lifestyle, and syndication-spam links.
6. Run `npm run news:promote`.
7. Confirm `src/data/approvedExternalNews.ts` regenerated from the approved JSON file.
8. Run `npm run qa:approved-news`, `npm run qa:news-images`, and `npm run qa:launch`.

Promotion rules:

- `needs-review` candidates stay out of public site data.
- Do not scrape full article text.
- Do not rewrite external coverage as WPB New Construction reporting.
- Do not use a Google News redirect as the public canonical URL.
- Only assign a project or corridor when the match is confident.
- Mark press releases clearly as `press-release` when used.
