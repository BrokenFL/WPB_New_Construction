# WPB New Construction Automation Inventory

## Confirmed Active Automations

- `com.brooke.wpb-condo-scan` is loaded in `launchctl` and has a matching file in `~/Library/LaunchAgents/com.brooke.wpb-condo-scan.plist`.

## Repo Scripts That Can Be Automated

- `npm run daily:maintenance` runs the safe daily maintenance orchestrator.
- `npm run news:fetch` gathers news candidates into review.
- `npm run news:promote` publishes only approved news from the review file.
- `npm run import:developer-images` imports candidate project imagery.
- `npm run review:developer-images` generates the review report for imported imagery.
- `npm run check:updates` validates imported project updates.
- `npm run qa:copy` checks public copy for awkward operational language.
- `npm run qa:image-repetition` checks repeated image use and project/corridor image mismatches.
- `npm run qa:performance` checks image and bundle budgets.
- `npm run assets:duplicates` writes a duplicate-asset inventory for review.

## LaunchAgents Found

- `launchd/com.brooke.wpb-developer-image-import.plist` exists in the repo, but it was not confirmed as loaded by `launchctl`.
- `launchd/com.brooke.wpb-daily-site-maintenance.plist` exists in the repo for the new daily maintenance run, but it has not been installed automatically.
- `~/Library/LaunchAgents/com.brooke.wpb-condo-scan.plist` exists locally and is loaded.

## Automations Missing

- No loaded LaunchAgent was found for the repo's developer-image import job.
- No loaded LaunchAgent was found for the new daily site maintenance job.
- Cloudflare deploy recovery is scripted, but live deploy still depends on Cloudflare API health and valid Cloudflare credentials in the shell or CI environment.

## Recommended Daily Maintenance Schedule

- 9:00 AM local time: run `npm run daily:maintenance`.
- The daily maintenance run is review-first: it imports/reviews candidate images, checks updates, copy, image repetition, performance, and duplicate assets, then writes `research/source-material-review/daily-maintenance-report.md`.
- Human review after the daily report: approve or reject news, image, and copy findings before anything new is promoted publicly.
- Weekly: run the full launch QA stack and review duplicate-asset recommendations before deleting or moving files.

## Install / Uninstall Commands

Install daily maintenance:

```bash
cp /Volumes/ExternalSSD/WPB_NewConstruction/launchd/com.brooke.wpb-daily-site-maintenance.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.brooke.wpb-daily-site-maintenance.plist
```

Uninstall daily maintenance:

```bash
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.brooke.wpb-daily-site-maintenance.plist
rm ~/Library/LaunchAgents/com.brooke.wpb-daily-site-maintenance.plist
```
