# GPT News Issue Importer Automation

Generated: 2026-05-23

## LaunchAgent Status

- Name: `com.brooke.wpb-news-issue-importer`
- Repo file: `launchd/com.brooke.wpb-news-issue-importer.plist`
- Installed file: `~/Library/LaunchAgents/com.brooke.wpb-news-issue-importer.plist`
- Current `launchctl` state: loaded, not running at inspection time
- Logs:
  - `/Users/brookesnader/wpb-news-issue-importer.launchd.out.log`
  - `/Users/brookesnader/wpb-news-issue-importer.launchd.err.log`

## Schedule

Runs local time at:

- 9:00 AM
- 12:00 PM
- 3:00 PM
- 6:00 PM

This complements the GPT draft issue task running at 9:00 AM and 3:00 PM.

## GitHub Auth Status

- `gh auth status -h github.com`: authenticated as `BrokenFL`
- Token scope reported by `gh`: `repo`
- Automation stops before import if `gh` is not authenticated.

## Issue Discovery

Repository: `BrokenFL/WPB_New_Construction`

Open issues are eligible when:

- title starts with `Daily WPB News Drafts`, or
- labels include `gpt-draft`, `news-candidate`, or `needs-codex-draft`

Skipped:

- issues already labeled `codex-imported`, unless `force-reimport` is present
- issues without parseable candidate content

## Publishing Rules

Auto-publish only when every guardrail passes:

- risk is `low`
- status is `queued`
- source URL is present
- rewritten headline, deck, body, and newsletter blurb are present
- project or corridor mapping is clear
- confidence is high when a confidence field is supplied
- no legal/regulatory/paywall/unsupported-claim flags are detected
- configured auto-publish delay and daily cap allow it

Hold for review:

- medium/high-risk items
- missing or unclear source URL
- paywalled-only source
- unsupported or judgment-heavy claims
- project/team/legal/address uncertainty
- anything requiring human review

## Manual Run

```bash
cd /Volumes/ExternalSSD/WPB_NewConstruction
npm run news:process-gpt-issues
```

Dry-run safety check:

```bash
npm run news:process-gpt-issues -- --dry-run
```

## Disable

Temporarily stop the schedule:

```bash
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.brooke.wpb-news-issue-importer.plist
```

Remove the installed LaunchAgent:

```bash
rm ~/Library/LaunchAgents/com.brooke.wpb-news-issue-importer.plist
```

Re-enable:

```bash
cp /Volumes/ExternalSSD/WPB_NewConstruction/launchd/com.brooke.wpb-news-issue-importer.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.brooke.wpb-news-issue-importer.plist
launchctl enable gui/$(id -u)/com.brooke.wpb-news-issue-importer
```

## Last Run Status

- `npm run news:process-gpt-issues -- --dry-run` stopped before import because the current repo already had unrelated dirty files.
- No deploy was attempted from this implementation run.
- `npm run news:import-gpt-issues` detected issue `#8` by label match, but imported 0 candidates because the parsed candidates did not include source URLs. The safe processor would hold those items for review rather than publish them.

Detailed machine-readable status is written to:

- `research/source-material-review/news-issue-importer-last-run.json`
