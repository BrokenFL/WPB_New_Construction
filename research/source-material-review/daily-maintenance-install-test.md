# Daily Maintenance LaunchAgent Install Test

Generated: 2026-05-22

## Install / Load

- Installed with `tools/launchers/install-daily-maintenance.command`.
- Loaded label confirmed by `launchctl list`: `com.brooke.wpb-daily-site-maintenance`.
- Installed plist: `~/Library/LaunchAgents/com.brooke.wpb-daily-site-maintenance.plist`.
- Schedule: daily at 9:00 AM local time.

## Manual Run

Command:

```bash
npm run daily:maintenance
```

Observed results:

- GPT issue import ran and imported 0 new drafts because the existing issue #2 draft was already present.
- News draft validation passed for 1 draft.
- Safe publisher ran and published 1 eligible queued medium-risk draft.
- Newsletter digest generation produced `digest-2026-05-22` with 1 story.
- Developer/project image import completed with 8 newly imported records.
- Developer/project image review completed with 57 records and 35 placed images.
- News candidate fetch wrote 256 candidates.
- Copy, image repetition, and performance QA passed.
- Duplicate asset inventory was refreshed.

## Follow-Up From Run

The first launch QA pass flagged importer-generated public filenames on placed images. Those public files and generated references were renamed to project-prefixed filenames, and `npm run qa:renamed-images` now passes.

High-risk news remains review-first through `eligibleForAutoPublish` and was not auto-published by this run.
