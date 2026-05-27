# Cloudflare Deploy Configuration Report

Generated: 2026-05-27

## Summary

The Cloudflare Pages deployment path is configured and working for `BrokenFL/WPB_New_Construction`.

The earlier concern came from the GitHub Actions step list showing the fallback step named `Cloudflare deploy not configured`. In the completed run, that fallback step was skipped. The real deploy step ran successfully, uploaded the built site to Cloudflare Pages, and changed the live bundle.

## Files Inspected

- `.github/workflows/deploy-cloudflare-pages.yml`
- `research/scripts/deploy-cloudflare-pages-with-retry.mjs`
- `package.json`
- `docs/project-workflow-and-asset-pipeline.md`
- `docs/project-workflow-and-asset-map.md`
- `docs/reports/repo-state-before-asset-automation.md`
- `docs/geo-measurement.md`
- `docs/geo-measurement-results.md`
- `docs/automation-inventory.md`
- GitHub Actions run `26524624398`

## Current Workflow Behavior

Workflow: `Deploy Cloudflare Pages`

Triggers:

- Push to `main`
- Manual `workflow_dispatch`

Main steps:

1. Check out repository.
2. Set up Node 22.
3. Install dependencies with `npm ci`.
4. Install Playwright Chromium.
5. Build with Google Maps build-time environment injected.
6. Run launch QA.
7. Run gatekeeper QA.
8. Deploy to Cloudflare Pages when `CLOUDFLARE_API_TOKEN` is present.
9. Print a fallback message only when the Cloudflare token is not present.

## Required Secrets And Variables

Required GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_GOOGLE_MAPS_API_KEY`

Optional repository variable:

- `VITE_GOOGLE_MAPS_MAP_ID`

Optional environment variable:

- `CLOUDFLARE_PAGES_PROJECT`

If `CLOUDFLARE_PAGES_PROJECT` is not set, the deploy script defaults to `wpbnewconstruction`.

## GitHub Configuration Observed

The following repository secrets are present by name:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `VITE_GOOGLE_MAPS_API_KEY`

No repository variables were listed. `VITE_GOOGLE_MAPS_MAP_ID` therefore appears unset as a GitHub Actions variable, but the deploy script treats the Map ID as optional and the latest build/deploy run passed.

No secret values were printed or inspected.

## Expected Cloudflare Project

Expected Cloudflare Pages project:

- `wpbnewconstruction`

Production domains:

- `wpbnewconstruction.com`
- `www.wpbnewconstruction.com`

The GitHub Actions run's Wrangler diagnostics confirmed a Cloudflare Pages project named `wpbnewconstruction` with domains:

- `wpbnewconstruction.pages.dev`
- `wpbnewconstruction.com`
- `www.wpbnewconstruction.com`

## Latest Run Evidence

GitHub Actions run:

- URL: `https://github.com/BrokenFL/WPB_New_Construction/actions/runs/26524624398`
- Workflow: `Deploy Cloudflare Pages`
- Final status: success
- Head SHA: `4ace950f581d7c25f76da66bb52eeba4ace6a94a`

Deploy log evidence:

- `HAS_CLOUDFLARE_TOKEN: true`
- `CLOUDFLARE_API_TOKEN: ***`
- `CLOUDFLARE_ACCOUNT_ID: ***`
- `Cloudflare Pages deploy: wpbnewconstruction`
- `Production map guard passed`
- `Success! Uploaded 93 files (319 already uploaded)`
- `Deployment complete! Take a peek over at https://e901a7a0.wpbnewconstruction.pages.dev`
- Live JS bundle changed from `/assets/index-hQ_W2zSw.js` to `/assets/index-CMPjqao9.js`

## Root Cause

No missing Cloudflare deployment configuration was found.

The apparent issue was a status interpretation problem: GitHub's workflow watch output listed the fallback step `Cloudflare deploy not configured`, but the fallback step was skipped. The actual `Deploy to Cloudflare Pages` step ran and succeeded.

## Code Fix Needed

No deploy code fix is required.

The current workflow and script already provide a safe deployment path:

- Build and QA must pass before deploy.
- Deploy uses repository secrets.
- Wrangler is pinned through `WRANGLER_VERSION`.
- The deploy script verifies the production map bundle before upload.
- The deploy script retries transient Cloudflare upload failures.
- The deploy script prints before/after live bundle evidence.

## Recommended Follow-Ups

No immediate deployment repair is needed.

Recommended optional cleanup:

- Add `VITE_GOOGLE_MAPS_MAP_ID` as a repository variable if the interactive map should always build with the configured Map ID.
- Consider renaming the fallback step to `Cloudflare deploy skipped when secrets are missing` so future `gh run watch` output is less easy to misread.
- Track the GitHub Actions Node.js 20 action deprecation warning separately. The workflow uses Node 22 for the site build, but GitHub warned that `actions/checkout@v4` and `actions/setup-node@v4` currently run on Node 20 internally.

## Manual Deploy Trigger

After commits are pushed to `main`, a safe manual deployment can be triggered with:

```bash
gh workflow run deploy-cloudflare-pages.yml --ref main
```

Then watch the run and verify live bundle changes:

```bash
gh run watch --repo BrokenFL/WPB_New_Construction
```

## Current Recommendation

The Cloudflare Pages deployment path is operational. No new production deploy push is required for configuration repair.

Only commit this report if Brooke wants the diagnostic record preserved in the repository.
