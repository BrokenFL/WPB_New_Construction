# News Review Workflow

The public news feed is manual-review first. Raw RSS/search candidates never publish directly.

1. Run `npm run news:prepare-review` for the morning review packet, or `npm run news:fetch` for a lower-level candidate refresh.
2. Review `research/news-review/development-news-candidates.json`.
3. Copy selected records into `research/news-review/approved-development-news.json`.
4. Confirm each approved item has a buyer-facing WPB New Construction headline, original source name, direct source URL, published date, short premium description, category, `relatedProjectIds`, `relatedCorridorIds`, `paywallStatus`, and `status: "published"`.
5. Exclude hard-paywall, login-only, duplicate, unrelated, generic lifestyle, and syndication-spam links.
6. If the item comes from another publication, search for at least one additional support source before publication. Use `sourceLinks` for all sources used, including official project pages, city/planning records, earlier coverage, or the original publication.
7. Rewrite the public article as WPB New Construction reporting. The article can cite the original source, but it should not read like an outlet summary or scraped abstract.
8. Only publish after Brooke approval. Drafts require `approvedForPublication: true`, `approvedBy: "Brooke"`, and `approvedAt` before a publish script can move them into the public approved file.
9. Run `npm run news:promote` after approved JSON changes.
10. Confirm `src/data/approvedExternalNews.ts` regenerated from the approved JSON file.
11. Run `npm run qa:approved-news`, `npm run qa:news-images`, and `npm run qa:launch`.

Promotion rules:

- `needs-review` candidates stay out of public site data.
- Do not scrape full article text.
- Do not copy or closely paraphrase external coverage. Use it as source evidence, then write a distinct WPB New Construction article with buyer-facing analysis, citations, and clear verification notes.
- Do not use a Google News redirect as the public canonical URL.
- Only assign a project or corridor when the match is confident.
- Mark press releases clearly as `press-release` when used.
- Do not auto-publish. Morning news work is review-first until Brooke explicitly approves copy and image direction.
