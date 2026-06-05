# WPB New Construction Automation Inventory

## Confirmed Active Automations

- Codex automation `WPB Site Health Check` is the broad safety net. It runs build, launch QA, news QA, and live QA, then reports blockers only.
- The desired news automation is a review-only morning Codex job that prepares up to two article drafts and image recommendations for Brooke approval.

## Repo Scripts That Can Be Automated

- `npm run daily:maintenance` runs the safe daily maintenance orchestrator. Scheduled QA report output is redirected to `.runtime/qa/` with `QA_NO_WRITE=1`.
- `npm run monitor:worktree` writes a clean/dirty branch report to `.runtime/qa/worktree-status.json`.
- `npm run research:site-intelligence:dry-run` previews source-refresh generated deltas, writes `.runtime/qa/source-refresh-dry-run.json`, and restores generated files so the checkout stays clean.
- `npm run news:fetch` gathers news candidates into review.
- `npm run news:prepare-review` runs the review-only morning support path: fetch candidates, refresh newsletter draft, run news QA, and write `.runtime/qa/news-review-queue-report.md`.
- `npm run news:promote` publishes only approved news from the review file.
- `npm run news:daily-publisher` is legacy/manual-only. Do not schedule it unless Brooke explicitly restores auto-publishing.
- `npm run news:process-gpt-issues` is legacy/manual-only. Do not schedule it unless Brooke explicitly restores GitHub issue importing.
- `npm run news:import-gpt-issues` imports matching GPT/news-candidate GitHub issues into `content/news-drafts.json`.
- `npm run news:publish-eligible` publishes only drafts that pass the hard Brooke approval gate. It is manual-only.
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

- Old local LaunchAgents may exist in historical checkouts or user Library folders, but they are not the desired current control surface.
- Prefer Codex automations for the morning news review and weekly site health jobs.

## Automations Missing

- No loaded LaunchAgent was found for the repo's developer-image import job.
- Cloudflare deploy recovery is scripted, but live deploy still depends on Cloudflare API health and valid Cloudflare credentials in the shell or CI environment.
- Brooke Content Studio shows a read-only automation status panel. It reports known scripts and local LaunchAgent presence only; it does not mark automation as installed unless local files or `launchctl` confirm it.

## Recommended Schedule

- Morning, local time: run the review-only WPB Development Desk automation. It should prepare two article drafts, source links, image direction, and approval choices.
- Friday 9:00 AM local time: run `WPB Site Health Check`.
- No scheduled news job should publish, promote, commit, push, deploy, or generate live site changes without Brooke approval.

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
