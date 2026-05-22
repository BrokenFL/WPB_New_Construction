# News Review Workflow

1. Run `npm run news:fetch`.
2. Review `research/news-review/development-news-candidates.json`.
3. Keep only relevant West Palm Beach development, construction, planning, financing, city, sales, or clearly marked press-release items.
4. Exclude hard-paywall, login-only, duplicate, unrelated, and generic lifestyle links.
5. Assign `relatedProjectIds` and `relatedCorridorIds` only when the match is confident.
6. Promote approved records into `src/data/approvedExternalNews.ts` with `status: "published"`.
7. Run `npm run qa:news-images`, `npm run qa:project-pages`, and the standard launch QA.

The fetch script is intentionally review-first. It should not auto-publish raw Google News RSS results.
