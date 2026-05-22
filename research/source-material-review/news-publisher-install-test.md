# News Publisher LaunchAgent Install Test

Generated: 2026-05-22

## Install / Load

- Installed with `tools/launchers/install-news-publisher-automation.command`.
- Loaded label confirmed by `launchctl list`: `com.brooke.wpb-news-publisher`.
- Installed plist: `~/Library/LaunchAgents/com.brooke.wpb-news-publisher.plist`.
- Schedule: daily at 9:20 AM local time.

## Manual Dry Run

Command:

```bash
npm run news:daily-publisher -- --dry-run
```

Observed results:

- GPT issue import ran and imported 0 new drafts because issue #2 was already imported.
- News draft validation passed for 1 draft.
- Newsletter digest generation produced `digest-2026-05-22` with 1 story.
- Approved news QA passed for 5 published items.
- News image/source QA passed for 5 published external links.
- Public JSON safety passed.
- Content Studio safety passed.
- Report written to `research/source-material-review/news-publisher-report.md`.

## Publishing Safety

Dry-run mode skipped publishing. Publish mode uses `news:publish-queued`, which only publishes drafts that pass `eligibleForAutoPublish`; high-risk drafts are excluded.
