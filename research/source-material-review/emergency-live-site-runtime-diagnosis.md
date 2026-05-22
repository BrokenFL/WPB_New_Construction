# Emergency Live Site Runtime Diagnosis

## User-Reported Symptom

The public site at `https://www.wpbnewconstruction.com/` no longer loads properly in browser.

## Live HTTP Status

- Homepage: HTTP 200.
- SPA routes checked by header: `/projects/olara/`, `/map/`, `/market-notes/`, and `/inquire/` returned HTTP 200.
- Legacy redirects checked:
  - `/blog/` redirects to `/market-notes/`.
  - `/contact/` redirects to `/inquire/`.
  - `/floor-plans/` redirects to `/floorplans/`.

## Asset Status

- Live HTML referenced `/assets/index-QVXQbgLl.js` and `/assets/index-BDNJw2SC.css`.
- Both referenced assets returned HTTP 200.
- The failure was not an HTML-to-asset mismatch or missing uploaded asset.

## Browser Console Errors

Playwright reproduced a blank render on the live site with this critical runtime error:

```text
ReferenceError: Cannot access 'c' before initialization
    at https://www.wpbnewconstruction.com/assets/index-QVXQbgLl.js:1560:105
    at Array.filter (<anonymous>)
```

The new live smoke test also reproduced the same blank-root failure on:

- `/`
- `/buildings/`
- `/map/`
- `/compare/`
- `/updates/`
- `/market-notes/`
- `/inquire/`
- `/projects/olara/`

## Network Failures

No blocking missing JS or CSS asset was found. The page shell loaded, but app rendering stopped before visible content mounted.

## Suspected Root Cause

The source crash was in `renderDraftProjectPage()` in `src/main.ts`. `residenceTiles` filtered against `heroImage` before `heroImage` was initialized:

```ts
const gallery = projectBrochureGallery(project, draft);
const residenceTiles = gallery.filter((asset) => asset.src !== heroImage).slice(0, 3);
const heroImage = draft.image ?? project.heroImage ?? project.image;
```

In the minified production bundle this became the browser error `Cannot access 'c' before initialization`, which prevented the app from rendering any route.

## Fix Applied

Fix-forward. `heroImage` is now initialized before it is used to derive `residenceTiles`.

Local production build now emits `/assets/index-C1RPapRV.js`, and `qa:live` passes against local preview at `http://127.0.0.1:4174`.

## Routes Re-tested

Local preview visible-content smoke passed for:

- `/`
- `/buildings/`
- `/map/`
- `/compare/`
- `/updates/`
- `/market-notes/`
- `/inquire/`
- `/projects/olara/`

Current live deploy still fails until the fixed bundle is shipped.

## Remaining Risks

- Live site remains on broken bundle `/assets/index-QVXQbgLl.js` until deployment finishes.
- `qa:live` depends on Playwright and should remain part of post-deploy verification so blank roots and critical console errors are caught before handoff.
