# Builder Remote Report Focal Point Audit

Generated: 2026-05-22

## Status

- Remote access status: planned and documented; not exposed because `cloudflared` is unavailable and Access could not be verified safely.
- Report viewer status: Builder now has an approved report list, report index API, report body API, and in-Builder Markdown viewer.
- Focal point controls status: homepage card overrides now support `imagePosition`, `focalPoint`, and `objectFit`.
- Card preview status: Builder shows current published, draft desktop, draft mobile crop, and approved override previews.
- Repetition approval status: overrides support `allowRepeatedImage` plus required `repetitionApprovalReason`; image repetition QA lists approvals.
- Public Builder exposure: production route redirects remain required for `/brooke-builder/` and `/content-studio/`.

## Visual Route Checks

Local preview route sweep completed against `http://127.0.0.1:4173` after `npm run build`.

All routes returned HTTP 200, rendered non-empty body text, and reported 0 console errors:

- `/`
- `/updates/`
- `/market-notes/`
- `/guidance/`
- `/floorplans/`
- `/buildings/`
- `/map/`
- `/compare/`
- `/inquire/`
- `/projects/olara/`
- `/projects/rosewood/`
- `/projects/south-flagler-house/`

## Notes

- Tunnel installer and LaunchAgent templates exist but are intentionally not loaded.
- `qa:builder-remote` is wired into `qa:launch`.
- Remote mode can be simulated with `BROOKE_BUILDER_REMOTE_MODE=true npm run brooke:builder`.
