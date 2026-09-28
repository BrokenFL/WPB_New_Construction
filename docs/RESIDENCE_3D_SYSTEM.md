# Interactive residence models

The existing individual floor-plan entities remain the source of truth for residence facts, canonical routes, source drawings, inquiry context and structured data. `src/data/residence3DModels.ts` adds reviewed visualization assets to those entities; it is not a second project inventory.

## Runtime and discovery

- `src/residence3DViewer.ts` renders a static poster and text first. Its browser enhancement creates a `<model-viewer>` and imports the library only after the visitor activates the model.
- `src/floorplanPage.ts` mounts the enhancement while retaining source drawings, residence facts, review notes and existing inquiry attribution.
- `src/lib/residence3DDiscovery.ts` renders `/3d-floorplans/` as grouped HTML cards. It never initializes viewers.
- `research/scripts/prerender-floorplan-entities.mjs` generates residence HTML, discovery HTML and schema, and extends the existing sitemap. The site-intelligence renderer owns `public/llms.txt`; the residence prerender pass also reconciles its built counterpart.
- Building floor-plan sections link to canonical residence pages. There are no building-card GLB downloads.

The public allowlist is explicit. It retains the released Olara pages and adds only the two reviewed Shorecrest and two reviewed Ritz-Carlton plans. Alba's reviewed but unpublished entity stays withheld. Source snapshots fail when approved-library facts drift. Shorecrest drawings do not report a combined total area, so none is invented.

## Asset contract

The existing asset publisher has a `--models` mode. It reads exact model/poster pairs from the residence manifest and requires a hash-bound private warehouse review:

```text
Google Drive completed production package
  -> private asset repository
     public-projects/{projectId}/approved-for-website/models/{residenceSlug}/
       source.glb             selected original, private
       model.glb              optimized public derivative
       poster.webp            landscape website poster
       poster-mobile.webp     optional portrait render
       asset-review.json      source/derivative hashes and review, private
  -> existing website publisher --models
  -> public/assets/projects/{projectId}/3d/{residenceSlug}/
       model.glb
       poster.webp
       poster-mobile.webp
```

Only the manifest-referenced optimized GLB and poster derivatives are copied. `mobilePosterUrl` uses a true portrait render through `<picture>`; it does not crop residence geometry. The publisher preflights the complete batch, validates GLB containers and embedded resources, checks source and derivative hashes, and refuses to overwrite different existing assets. Changed releases should use reviewed versioned destinations. A generated publication record is appended to `data/generated_asset_publish_manifest.json`. Model presentation is resolved from the residence manifest rather than the image gallery registry, preventing models and posters from appearing in unrelated gallery sequences.

```bash
npm run assets:publish:models:dry
npm run assets:publish:models
npm run qa:residence-3d:assets
```

`scripts/optimize-residence-model.mjs` creates a new derivative and audit without overwriting its source. It deduplicates resources, prunes unused data, welds identical vertices, joins compatible opaque geometry, and applies Meshopt compression with 16-bit positions. It preserves transparent objects for sorting. Textures, when present, are converted to WebP at quality 90 and at most 2048 pixels. It performs no geometry simplification. Internal names and extras are removed from the public GLB. Source/optimized browser comparisons are required before approval; file-size reduction alone is insufficient.

## Adding a residence

1. Map the package to an exact approved source plan. If needed, add an exact reviewed floor-plan snapshot; never relax the publication filter globally.
2. Select the clearest consumer model and preserve the selection rationale in private asset review. Optimize, compare the source and derivative, and approve a poster.
3. Add a residence-model manifest record. Keep factual area/bedroom values in the existing plan library. Keep Drive IDs, local paths and production notes out of the public record.
4. Publish the reviewed pair through `--models`, then change the public record to `approved` only after QA. The same renderer handles models associated with a plan, with no residence-specific viewer code. Additional useful variants use another record for the same plan, a unique model ID, versioned `model-{variant}.glb` / `poster-{variant}.webp` paths, and a matching private `model-{variant}-review.json`.
5. Run the asset, entity, build, discovery and browser checks. Review desktop, tablet and mobile posters and activated models before release.

## Analytics and resilience

Events use the existing consent-aware analytics transport: `residence_3d_open`, `residence_3d_loaded`, `residence_3d_fullscreen` and `residence_3d_cta`. Payloads include project, residence, model, canonical path and placement. GA4 event names begin with a letter, per [Google's naming rules](https://support.google.com/analytics/answer/13316687?hl=en). Orbit and zoom are not individually tracked.

The experience uses an ivory poster stage, explicit activation, camera reset and supported fullscreen. It does not auto-rotate. Library/download/WebGL failures keep the poster, source plan, facts and inquiry available. Static rendering keeps the page useful without JavaScript. The source drawing remains authoritative; the model is an illustrative derivative represented as an additional media encoding in the existing graph. The vocabulary follows Schema.org [CreativeWork encoding](https://schema.org/encoding), [MediaObject](https://schema.org/MediaObject), and [isBasedOn](https://schema.org/isBasedOn).

## Verification and bundle boundaries

```bash
npm run test:floorplan-entities
npm run test:residence-3d
npm run typecheck
VITE_GA4_MEASUREMENT_ID=G-P2TEST0001 npm run build
npm run qa:residence-3d
QA_NO_WRITE=1 npm run assets:audit:strict
npm run qa:launch:no-write
npm run qa:gatekeeper
npm run qa:integration
npm run qa:discovery-coherence
```

The synthetic analytics ID matches the existing integration-QA workflow and is only for local QA. Browser tests intercept external analytics and lead submissions. A real release uses the existing deployment configuration.

Feature CSS is loaded by the relevant page entrypoint and linked in prerendered HTML for no-JavaScript rendering. The click-triggered viewer has separate model-viewer, Three core, and Three WebGL chunks. The global JavaScript and CSS size budgets remain unchanged. Browser QA rejects requests for all those chunks, the decoder, or any GLB before activation. Narrow copy-check exceptions cover the exact Three.js console diagnostic “WebGLRenderer: Attempt to use non-existing WebGL internal format” in its isolated renderer chunk and fflate’s “no stream handler” error string in the model-viewer chunk. Other content in those chunks is still scanned; neither exception exempts visible copy or outbound links.

`qa:residence-3d` captures Chromium and WebKit at desktop (1440), tablet (820), and mobile (390), plus model/library failure, no-JavaScript, no-WebGL, slow loading, native mobile touch, reset, fullscreen, and inquiry attribution. Screenshot and audit reports remain in ignored runtime/output folders.

## Review boundary

Local generation and QA do not imply approval to deploy. This implementation is prepared on dedicated website and asset branches. Merge, push, deployment and production verification require a separate release decision.
