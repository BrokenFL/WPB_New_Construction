# News Publisher Report

Generated: 2026-05-23T17:05:24.579Z

Mode: publish

## Scripts Run

- import GPT news issue drafts: passed
- validate news drafts: passed
- publish eligible queued low-risk news: passed
- generate newsletter digest draft: passed
- check approved news surface: passed
- check news image mapping: passed
- check public JSON safety: passed
- check content studio safety: passed

## Publishing Rules

- High-risk drafts are review-first and are not auto-published by `news:publish-queued`.
- Dry-run mode skips the publish step but still imports/validates drafts and refreshes the newsletter digest.
- Publish mode only promotes drafts that pass `eligibleForAutoPublish` in `research/scripts/news-draft-utils.mjs`.

## Review Targets

- News Desk drafts: `content/news-drafts.json`
- Newsletter drafts: `content/newsletter-digest-drafts.json`
- Approved external news: `research/news-review/approved-development-news.json`
