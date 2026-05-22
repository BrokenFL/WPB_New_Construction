# Brooke Builder Update Site Safety Test

Generated: 2026-05-22

## Verified Behavior

- `Update Site Checks` runs `typecheck`, `build`, and `qa:launch`; it does not deploy.
- Final deploy workflow still requires `confirmDeploy: true` in the API payload.
- Deploy workflow checks `git status --short` before deploying and blocks unrelated paths outside the allowed site/content set.
- Deploy workflow runs QA before commit/push/deploy.
- `qa:content-studio` blocks public Builder exposure through `dist/content-studio`, `dist/brooke-builder`, production route redirects, and `_redirects`.
- `qa:content-studio` now validates `content/overrides/homepage-card-overrides.json`.
- Status cards surface changed files through the Builder API response after workflows.
- Live bundle status is surfaced in Builder status cards when curl can reach production.

## Remaining Guardrails

- Brooke should run `Update Site Checks`, review `git diff`, then use the guarded deploy path only after QA passes.
- Public Builder exposure remains blocked by redirects and QA; deploy should not proceed if `qa:content-studio` fails.
- Current shell path did not expose `gh`; Builder now reports `gh` path/auth status directly so that failure is visible.
