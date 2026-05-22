# Approved Asset Cleanup Report

Generated: 2026-05-22T13:31:33.149Z

Approved cleanup removes exact duplicate stale public aliases, per-project generated placeholder copies, generated build output, and old QA CLI artifacts. Raw project research originals are preserved.

## Summary

- Removed files/paths: 5
- Updated files: 2
- Removed bytes: 439.4 MB
- Skipped items: 3

## Removed

- public/projects/olara/docs/floorplans/all-floor-plans--fc168288.pdf (25.5 MB): removed exact duplicate public alias; canonical is public/projects/olara/docs/olara-floorplans-all-march-2026.pdf
- public/projects/olara/docs/floorplans/olara-floor-plans-all-march-2026--9503a396.pdf (25.5 MB): removed exact duplicate public alias; canonical is public/projects/olara/docs/olara-floorplans-all-march-2026.pdf
- public/projects/alba-palm-beach/.DS_Store (6.0 KB): removed exact duplicate public alias; canonical is public/projects/15-cityplace/.DS_Store
- dist (383.6 MB): removed disposable generated dist artifacts
- .playwright-cli (4.8 MB): removed disposable generated .playwright-cli artifacts

## Updated

- research/source-material-review/wpb-project-asset-tracker.csv: marked all project image authorization rows authorized
- research/asset-library/shared/generated-placeholders/downtown-wpb-hero-editorial.png: shared placeholder copied from research/source-repos/WestPalmNewConstruction/public/assets/downtown-wpb-hero-editorial.png

## Skipped

- public/projects/15-cityplace/media/cityplace-shared-hero-1536x1024.jpg: still referenced by source/data
- public/projects/15-cityplace/media/cityplace-shared-mobile-1122x1402.jpg: still referenced by source/data
- public/projects/15-cityplace/media/cityplace-shared-card-1448x1086.jpg: still referenced by source/data

