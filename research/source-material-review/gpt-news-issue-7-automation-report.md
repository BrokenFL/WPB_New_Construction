# GPT News Issue #7 Automation Report

Generated: 2026-05-23

## Issue Import Result

- Issue: https://github.com/BrokenFL/WPB_New_Construction/issues/7
- Created: 2026-05-23T14:55:56Z
- Required labels present: `news-candidate`, `gpt-draft`, `needs-codex-draft`, `wpb-new-construction`
- Imported into: `content/news-drafts.json`

## Published

- `2026-05-23-nora-residential-gravity`
- `2026-05-23-wpb-vertical-resort-condos`

The vertical-resort item reused the same canonical source URL as the earlier test draft `2026-05-22-test-wpb-luxury-condo-boom`, so the test draft was replaced with the production issue #7 article ID and copy instead of creating a duplicate public article for the same source.

## Held For Review

- `2026-05-23-branded-residences-wpb-context`

Reason: Issue #7 marked this item as medium risk with `needs-editorial-review-before-publishing`. The importer now maps that publishing lane to `needs_review`, and automatic publishing only selects low-risk queued drafts.

## Automation Diagnosis

- `com.brooke.wpb-news-publisher` was loaded in `launchctl`.
- The loaded job showed `runs = 1` and `last exit code = 127` before repair.
- `/tmp/wpb-news-publisher.err.log` showed `zsh:1: command not found: npm`.
- Issue #7 was created at 10:55:56 AM America/New_York, after the 9:20 AM scheduled daily publisher time, so that day's scheduled run could not have imported it even if the job had succeeded.
- After adding a direct ExternalSSD Node/npm PATH, launchd reached npm but failed with `EPERM` opening `/Volumes/ExternalSSD/node_storage/.../npm-cli.js`.
- GitHub CLI is installed at `/Users/brookesnader/.local/bin/gh` and authenticated as `BrokenFL`.
- The importer searches for the required labels in either issue labels or body tags; Issue #7 had the expected labels.
- The importer needed a parser fix because Issue #7's machine-readable block uses `articleCandidates` with nested `source`, `sources`, and `imagePlan` fields.

## Fix Applied

- `research/scripts/import-gpt-news-issues.mjs` now imports `articleCandidates`, merges the machine-readable JSON with the richer markdown issue fields, supports nested source/image metadata, and preserves issue creation time.
- `research/scripts/news-draft-utils.mjs` now reads nested source metadata and restricts automatic publishing to low-risk queued drafts.
- `research/scripts/publish-news-drafts.mjs` now supports explicit low-risk publish-by-id for reviewed manual release runs.
- `launchd/com.brooke.wpb-news-publisher.plist` now uses an `osascript -> Terminal.app` handoff, matching the proven ExternalSSD launchd workaround.
- `tools/launchers/run-news-publisher.sh` centralizes the PATH and daily publisher command used by the LaunchAgent.

## Verification

- Reloaded `~/Library/LaunchAgents/com.brooke.wpb-news-publisher.plist`.
- `launchctl kickstart -k gui/501/com.brooke.wpb-news-publisher` completed the handoff with `last exit code = 0`.
- `research/source-material-review/news-publisher-report.md` shows the publisher pipeline passed after the repair.
