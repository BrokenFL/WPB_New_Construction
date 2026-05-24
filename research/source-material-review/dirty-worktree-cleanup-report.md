# Dirty Worktree Cleanup Report

Generated: 2026-05-24

## Starting State

- Branch at start: `main`
- Starting commit: `011027e`
- Dirty paths at start: 19 tracked files, 0 untracked files
- Stash: `stash@{0}: On main: post-deploy QA report churn`

## Classification

### Useful generated/source changes to commit

- `research/scripts/build-site-intelligence.mjs` - real source update for South Flagler House pricing language, plus public-copy rewrite from "pipeline context" to a buyer-facing future-project explanation.
- `research/source-material-review/project-source-catalog.json` - useful source-catalog refresh with updated Forte on Flagler sourcing and conflict notes.
- `public/data/answer-engine-faq.json` - generated public answer data carrying the South Flagler pricing update and the public-copy rewrite.
- `src/generated/siteData.ts` - generated app data carrying the source-catalog refresh, the South Flagler pricing update, and the public-copy rewrite.

### Real public source/content changes to commit

- `src/main.ts` - Quick Facts / Project Snapshot wording, Buyer Lens advisory language, related-project comparison copy, and public document microcopy.
- `public/data/project-copy-package.json` - Shorecrest buyer-facing copy polish.
- `src/data/approvedExternalNews.ts` - Rosewood update copy changed from "pipeline context" to future-project language.
- `research/news-review/approved-development-news.json` - source data for the approved Rosewood update copy.

### Noisy generated report/content churn discarded

- `content/news-drafts.json` - timestamp-only daily news draft churn.
- `content/newsletter-digest-drafts.json` - generated digest draft unrelated to this public-copy release.
- `public/data/floorplans.json` - timestamp-only site-intelligence churn.
- `public/data/image-clearance-candidates.json` - timestamp-only site-intelligence churn.
- `public/data/news-feed.json` - timestamp-only generated feed churn.
- `public/data/project-asset-status.json` - timestamp-only generated tracker churn.
- `public/data/project-team-credits.json` - timestamp-only generated tracker churn.
- `public/data/published-floorplan-assets.json` - timestamp-only generated tracker churn.
- `public/sitemap.xml` - generated date churn unrelated to this release.
- `research/source-material-review/homepage-visual-flow-report.md` - QA report churn.
- `research/source-material-review/image-candidate-catalog.json` - timestamp-only generated review churn.
- `research/source-material-review/image-repetition-audit.md` - QA report timestamp churn.
- `research/source-material-review/launch-qa-report.md` - QA report timestamp churn.
- `research/source-material-review/news-issue-importer-last-run.json` - failed manual importer report caused by dirty worktree.
- `research/source-material-review/news-publisher-report.md` - generated publisher report churn.

### Local-only Builder/content overrides to preserve but ignore

- None found in the dirty state.

### Stale files to delete

- None found.

### Files to add to `.gitignore`

- None. The noisy files are tracked generated artifacts; `.gitignore` would not prevent future tracked modifications.

## Root Cause

The dirty tree came from a mix of generated site-intelligence timestamps, QA report rewrites after deployment, a failed news issue importer run that recorded the dirty-worktree stop, and a small number of useful source-backed content refreshes. The blocking automation problem was tracked-file dirt, not untracked clutter.

## Stash Decision

`stash@{0}` only contained post-deploy QA report churn in:

- `research/source-material-review/homepage-visual-flow-report.md`
- `research/source-material-review/image-repetition-audit.md`
- `research/source-material-review/launch-qa-report.md`

It was safe to drop after documenting because the same files are generated reports and no source/content work was present in the stash.
