# WPB New Construction Automation Inventory

## Confirmed Active Automations

- `com.brooke.wpb-condo-scan` is loaded in `launchctl` and has a matching file in `~/Library/LaunchAgents/com.brooke.wpb-condo-scan.plist`.
- `com.brooke.wpb-daily-site-maintenance` is installed in `~/Library/LaunchAgents` and loaded with `launchctl`.
- `com.brooke.wpb-news-publisher` is installed in `~/Library/LaunchAgents` and loaded with `launchctl`.
- `com.brooke.wpb-news-issue-importer` is installed in `~/Library/LaunchAgents` and loaded with `launchctl`.

## Repo Scripts That Can Be Automated

- `npm run daily:maintenance` runs the safe daily maintenance orchestrator. Scheduled QA report output is redirected to `.runtime/qa/` with `QA_NO_WRITE=1`.
- `npm run monitor:worktree` writes a clean/dirty branch report to `.runtime/qa/worktree-status.json`.
- `npm run research:site-intelligence:dry-run` previews source-refresh generated deltas, writes `.runtime/qa/source-refresh-dry-run.json`, and restores generated files so the checkout stays clean.
- `npm run news:fetch` gathers news candidates into review.
- `npm run news:promote` publishes only approved news from the review file.
- `npm run news:daily-publisher` imports GPT issue drafts, validates news drafts, publishes only eligible low-risk queued items, generates the newsletter digest, runs news QA, and writes a publisher report.
- `npm run news:process-gpt-issues` is the safe scheduled GPT issue processor: import matching GitHub issues, publish eligible low-risk items, hold review items, comment/label issues, run no-write QA, and deploy only after passing gates.
- `npm run news:import-gpt-issues` imports matching GPT/news-candidate GitHub issues into `content/news-drafts.json`.
- `npm run news:publish-eligible` publishes only drafts that pass `eligibleForAutoPublish`.
- `npm run newsletter:draft` builds a newsletter-ready digest from published `/updates/` articles plus published/queued intake drafts.
- `npm run import:developer-images` imports candidate project imagery.
- `npm run review:developer-images` generates the review report for imported imagery.
- `npm run check:updates` validates imported project updates.
- `npm run qa:copy` checks public copy for awkward operational language.
- `npm run qa:image-repetition` checks repeated image use and project/corridor image mismatches.
- `npm run qa:launch:no-write` runs launch QA with generated reports written to `.runtime/qa/` instead of tracked Markdown.
- `npm run qa:launch:write-reports` runs launch QA and refreshes the tracked Markdown audit reports.
- `npm run test` and deploy preflight use no-write launch QA so verification does not create tracked timestamp churn.
- `npm run qa:performance` checks image and bundle budgets.
- `npm run qa:live` checks the live domain for HTTP status, bundle availability, visible route rendering, blank roots, and critical console errors.
- `npm run qa:content-studio` checks that Brooke Content Studio remains local-only and validates override files.
- `npm run content:studio` starts Brooke Content Studio at `http://localhost:8787`.
- `npm run assets:duplicates` writes a duplicate-asset inventory for review.

## LaunchAgents Found

- `launchd/com.brooke.wpb-developer-image-import.plist` exists in the repo, but it was not confirmed as loaded by `launchctl`.
- `launchd/com.brooke.wpb-daily-site-maintenance.plist` exists in the repo and is installed locally.
- `launchd/com.brooke.wpb-news-publisher.plist` exists in the repo and is installed locally.
- `launchd/com.brooke.wpb-news-issue-importer.plist` exists in the repo and is installed locally.
- `~/Library/LaunchAgents/com.brooke.wpb-condo-scan.plist` exists locally and is loaded.

## Automations Missing

- No loaded LaunchAgent was found for the repo's developer-image import job.
- Cloudflare deploy recovery is scripted, but live deploy still depends on Cloudflare API health and valid Cloudflare credentials in the shell or CI environment.
- Brooke Content Studio shows a read-only automation status panel. It reports known scripts and local LaunchAgent presence only; it does not mark automation as installed unless local files or `launchctl` confirm it.

## Recommended Daily Maintenance Schedule

- 9:00 AM local time: run `npm run daily:maintenance`.
- 9:20 AM local time: run `npm run news:daily-publisher`.
- 9:00 AM, 12:00 PM, 3:00 PM, and 6:00 PM local time: run `npm run news:process-gpt-issues` from `com.brooke.wpb-news-issue-importer`.
- The daily maintenance run is review-first: it checks updates, copy, image repetition, performance, and duplicate assets, then writes `.runtime/qa/daily-maintenance-report.md` in scheduled mode.
- Human review after the daily report: approve or reject news, image, and copy findings before anything medium/high-risk is promoted publicly.
- Low-risk news can move from GitHub issue intake to `content/news-drafts.json`, then through `news:publish-queued`, `news:promote`, and `newsletter:draft` without Brooke using the Builder UI.
- Weekly: run `npm run research:site-intelligence:dry-run`, the full launch QA stack, and review duplicate-asset recommendations before deleting or moving files.

## QA Report Modes

- Automation mode: `QA_NO_WRITE=1 npm run qa:launch` or `npm run qa:launch:no-write`. Generated QA reports go to `.runtime/qa/`, which is gitignored. `npm run test`, `npm run news:process-gpt-issues`, `npm run daily:maintenance`, `npm run monitor:worktree`, `npm run research:site-intelligence:dry-run`, and deploy preflight use this mode.
- Manual audit mode: `npm run qa:launch:write-reports` refreshes tracked reports under `research/source-material-review/` for a deliberate human review artifact.
- Scheduled news issue processing uses no-write mode by default so no-change runs do not dirty the worktree with report timestamps.

## Install / Uninstall Commands

Install daily maintenance:

```bash
cp /Volumes/ExternalSSD/WPB_NewConstruction/launchd/com.brooke.wpb-daily-site-maintenance.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.brooke.wpb-daily-site-maintenance.plist
```

Install news publisher:

```bash
/Volumes/ExternalSSD/WPB_NewConstruction/tools/launchers/install-news-publisher-automation.command
```

Install GPT news issue importer:

```bash
cp /Volumes/ExternalSSD/WPB_NewConstruction/launchd/com.brooke.wpb-news-issue-importer.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.brooke.wpb-news-issue-importer.plist
launchctl enable gui/$(id -u)/com.brooke.wpb-news-issue-importer
```

Uninstall daily maintenance:

```bash
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.brooke.wpb-daily-site-maintenance.plist
rm ~/Library/LaunchAgents/com.brooke.wpb-daily-site-maintenance.plist
```

Disable GPT news issue importer:

```bash
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.brooke.wpb-news-issue-importer.plist
rm ~/Library/LaunchAgents/com.brooke.wpb-news-issue-importer.plist
```
