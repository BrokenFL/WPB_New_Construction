# Dirty Worktree Automation Blocker

Generated: 2026-05-23

## Summary

The news issue processor stops before touching GitHub issues when `git status --porcelain` returns any dirty path. The blocker was not an untracked-file problem: `git ls-files --others --exclude-standard` returned no files. The checkout had tracked modifications from Builder draft activity, site-intelligence regeneration, QA report refreshes, and floorplan asset updates.

Decision: preserve the tracked work and commit it deliberately on `codex/fix-map-and-unblock-news-automation` after adding the map fix and reports. No file is being deleted or reverted.

## Classification

| Path | Classification | Action |
| --- | --- | --- |
| `content/overrides/change-log.json` | Builder/local override draft | Preserve and commit. Records two draft homepage-card override events. |
| `content/overrides/content-studio-change-log.json` | Builder/local override draft | Preserve and commit. Mirrors the Builder draft audit trail. |
| `content/overrides/homepage-card-overrides.json` | Builder/local override draft | Preserve and commit. Contains draft image overrides for updates/guidance cards; status remains `draft`. |
| `content/overrides/image-caption-overrides.json` | Builder/local override draft | Preserve and commit. Captions/alt remain empty and marked `needs_review`. |
| `public/data/answer-engine-faq.json` | Real source/content change that should be committed | Preserve and commit. Generated from source-intelligence updates, including South Flagler House pricing guidance and refreshed access dates. |
| `public/data/floorplans.json` | Safe generated QA/report artifact | Preserve and commit. Date-only regeneration across floorplan records. |
| `public/data/image-clearance-candidates.json` | Safe generated QA/report artifact | Preserve and commit. Generated timestamp refresh. |
| `public/data/news-feed.json` | Safe generated QA/report artifact | Preserve and commit. Generated timestamp refresh. |
| `public/data/project-asset-status.json` | Safe generated QA/report artifact | Preserve and commit. Generated timestamp refresh. |
| `public/data/project-team-credits.json` | Safe generated QA/report artifact | Preserve and commit. Generated timestamp refresh. |
| `public/data/published-floorplan-assets.json` | Safe generated QA/report artifact | Preserve and commit. Generated timestamp refresh. |
| `package.json` | Real source/content change that should be committed | Preserve and commit. Uses the direct Vite CLI path for stable non-interactive builds. |
| `public/projects/berkeley/docs/floorplans/penthouse-floorplan-template--a68d7efe.jpg` | Imported image/research artifact | Preserve and commit. Tracked floorplan asset changed size. |
| `public/projects/berkeley/docs/floorplans/residence-a-floorplan-template--3f71b9ce.jpg` | Imported image/research artifact | Preserve and commit. Tracked floorplan asset changed size. |
| `public/projects/berkeley/docs/floorplans/residence-b-floorplan-template--9d9ba081.jpg` | Imported image/research artifact | Preserve and commit. Tracked floorplan asset changed size. |
| `public/projects/berkeley/docs/floorplans/residence-c-floorplan-template--b089a348.jpg` | Imported image/research artifact | Preserve and commit. Tracked floorplan asset changed size. |
| `public/projects/berkeley/docs/floorplans/residence-d-floorplan-template--904ee317.jpg` | Imported image/research artifact | Preserve and commit. Tracked floorplan asset changed size. |
| `public/projects/berkeley/docs/floorplans/residence-e-floorplan-template--c3bd0c2e.jpg` | Imported image/research artifact | Preserve and commit. Tracked floorplan asset changed size. |
| `public/projects/berkeley/docs/floorplans/residence-f-floorplan-template--5c0f8efd.jpg` | Imported image/research artifact | Preserve and commit. Tracked floorplan asset changed size. |
| `public/projects/berkeley/docs/floorplans/residence-g-floorplan-template--95ec6883.jpg` | Imported image/research artifact | Preserve and commit. Tracked floorplan asset changed size. |
| `public/projects/south-flagler-house/docs/floorplans/shared/site-plan-floors-10-18--29f041ee.jpg` | Imported image/research artifact | Preserve and commit. Tracked floorplan asset changed size. |
| `public/projects/south-flagler-house/docs/floorplans/shared/site-plan-floors-19-20--113324cb.jpg` | Imported image/research artifact | Preserve and commit. Tracked floorplan asset changed size. |
| `public/projects/south-flagler-house/docs/floorplans/shared/site-plan-floors-5-9--7e6bd746.jpg` | Imported image/research artifact | Preserve and commit. Tracked floorplan asset changed size. |
| `public/sitemap.xml` | Safe generated QA/report artifact | Preserve and commit. Generated sitemap date refresh. |
| `research/scripts/build-site-intelligence.mjs` | Real source/content change that should be committed | Preserve and commit. Updates South Flagler House pricing guidance in generated answers. |
| `research/scripts/check-map-functionality.mjs` | Real source/content change that should be committed | Preserve and commit. Strengthens map QA so live/keyed builds must render Google Maps. |
| `research/scripts/deploy-cloudflare-pages-with-retry.mjs` | Real source/content change that should be committed | Preserve and commit. Adds a deploy guard that blocks fallback-only production map bundles. |
| `research/scripts/process-gpt-news-issues.mjs` | Real source/content change that should be committed | Preserve and commit. Fixes post-run dirty-path parsing and allows QA reports produced by the processor's own QA pass. |
| `research/source-material-review/asset-duplicate-inventory.json` | Safe generated QA/report artifact | Preserve and commit. Refreshed by `npm run assets:duplicates`. |
| `research/source-material-review/asset-duplicate-inventory.md` | Safe generated QA/report artifact | Preserve and commit. Refreshed by `npm run assets:duplicates`. |
| `research/source-material-review/dirty-worktree-automation-blocker.md` | Safe generated QA/report artifact | Preserve and commit. This audit report. |
| `research/source-material-review/homepage-visual-flow-report.md` | Safe generated QA/report artifact | Preserve and commit. Latest visual-flow report from QA. |
| `research/source-material-review/image-candidate-catalog.json` | Safe generated QA/report artifact | Preserve and commit. Generated timestamp refresh. |
| `research/source-material-review/image-repetition-audit.md` | Safe generated QA/report artifact | Preserve and commit. Latest image repetition report from QA. |
| `research/source-material-review/launch-qa-report.md` | Safe generated QA/report artifact | Preserve and commit. Latest launch QA report from QA. |
| `research/source-material-review/map-failure-diagnosis.md` | Safe generated QA/report artifact | Preserve and commit. This map failure diagnosis. |
| `research/source-material-review/project-source-catalog.json` | Real source/content change that should be committed | Preserve and commit. Updates South Flagler House pricing notes and NORA conflict wording. |
| `src/generated/siteData.ts` | Safe generated QA/report artifact | Preserve and commit. Generated site data matching source-intelligence refresh. |

## No-Action Categories

- Should be reverted/deleted: none identified.
- Should be ignored via `.gitignore`: none identified. No untracked generated files were blocking this run.

## Automation Impact

The blocker is the start-of-run dirty-worktree guard in `research/scripts/process-gpt-news-issues.mjs`. Once the tracked changes above are committed, `npm run news:process-gpt-issues` can proceed without `NEWS_PROCESS_ALLOW_DIRTY=1`.
