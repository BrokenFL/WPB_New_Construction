# WPB New Construction Automation Inventory

## Verified Automation Audit — 2026-09-12

Inspected on Brooke's Mac against `origin/main` @ `2d1b82f`. States: **configured active** (schedule exists), **executed** (ran), **useful output** (produced a review artifact), **blocked safely** (preflight stop), **paused**, **disconnected** (producer with no consumer), **unknown** (not inspectable from this environment).

### Codex automations (`~/.codex/automations/`)

| Automation | Schedule | State | Evidence |
|---|---|---|---|
| `wpb-content-scout-safe-daily-publish` ("WPB Content Scout — route-aware daily publish") | Daily 09:15 local | configured active, executed | `memory.md` shows runs through 2026-09-12. Recent runs are preflight stops (SSD checkout on `codex/wpb-3d-city-map` until the 2026-09-11 repair) or clean no-write editorial skips. A safe preflight stop is not a completed research run. No publish evidence. |
| `wpb-launch-qa-check` ("WPB Site Health Check") | Fri 09:00 local | **paused** | `status = "PAUSED"` in `automation.toml`. Earlier prose in this file calling it "confirmed active" was stale. |
| `wpb-development-desk-morning-drafts` | Daily 07:00 local | paused | `status = "PAUSED"`. This is the desired review-only morning job — currently off. |
| `wpb-source-and-news-refresh` | Mon 08:30 local | paused | `status = "PAUSED"`. |
| `daily-wpb-project-fact-refresh` | Daily 08:00 local | paused | `status = "PAUSED"`. |
| `restats-mls-refresh` | Every 2 days 07:45 local | configured active | Unrelated to WPB site (ReStats MLS). |

### GitHub scheduled workflows

| Workflow | Schedule | State | Evidence |
|---|---|---|---|
| `live-news-agent-task.yml` | Mon/Wed/Fri 13:30 UTC | configured active, **disconnected** | Creates deduped `live-news-agent` issues (latest #96, 2026-09-11). 10 open issues 2026-08-21→09-11 accumulate; no consumer runs. `news:process-gpt-issues` is manual-only. |
| `biweekly-content-agent-task.yml` | Mon 14:00 UTC, even weeks | configured active, **disconnected** | 8 open `content-agent` issues 2026-05-25→08-31 accumulate unprocessed. |

### LaunchAgents (`~/Library/LaunchAgents/`)

| Agent | State | Evidence |
|---|---|---|
| `com.brooke.builder-cloudflare-tunnel` | **loaded** (KeepAlive) | cloudflared tunnel exposing the local Builder. Review remote-exposure/auth before relying on it. |
| `com.brooke.wpb-news-review-queue` | plist present, **not loaded** | Target `tools/launchers/run-news-review-queue.sh` does not exist in the repo — dead config. |
| `com.brooke.wpb-condo-scan` | plist present, **not loaded** | Points at `/Volumes/ExternalSSD/openclaw-lab`, not this repo. |

### External tasks (not inspectable from this environment)

| Task | State | Evidence |
|---|---|---|
| ChatGPT "WPB Daily Fact Check" (`6aa382b5…`) | configured active | ChatGPT-side confirmation: enabled, daily 06:00 Eastern, last run ~06:04 ET 2026-09-12, push/email flags off. Report/designated-review-column writeback only — no Sheet-write for the processor. |
| Gemini actions / Apps Script | unknown | No Apps Script deployment or script ID exists in the repo. Sheet gviz export returns a login page from this environment; neither Sheet is publicly readable here. |

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
