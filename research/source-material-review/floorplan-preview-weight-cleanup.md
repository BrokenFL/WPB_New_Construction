# Floorplan Preview Weight Cleanup

Updated 2026-05-22.

## Result

Public floorplan/site-plan preview JPGs were resized in place while preserving the matching research/archive copies.

## Files Resized

| Public path | Source/archive path | Original size | New size | New dimensions | Expected savings |
| --- | --- | ---: | ---: | ---: | ---: |
| `/projects/south-flagler-house/docs/floorplans/shared/site-plan-floors-19-20--113324cb.jpg` | `research/asset-library/projects/south-flagler-house-south/floorplans/site-plan-floors-19-20--113324cb.jpg`; `research/asset-library/projects/south-flagler-house-north/floorplans/site-plan-floors-19-20--113324cb.jpg` | 7,255,512 B | 1,076,615 B | 2000x1600 | 6,178,897 B |
| `/projects/south-flagler-house/docs/floorplans/shared/site-plan-floors-10-18--29f041ee.jpg` | `research/asset-library/projects/south-flagler-house-south/floorplans/site-plan-floors-10-18--29f041ee.jpg`; `research/asset-library/projects/south-flagler-house-north/floorplans/site-plan-floors-10-18--29f041ee.jpg` | 7,152,535 B | 1,060,158 B | 2000x1600 | 6,092,377 B |
| `/projects/south-flagler-house/docs/floorplans/shared/site-plan-floors-5-9--7e6bd746.jpg` | `research/asset-library/projects/south-flagler-house-south/floorplans/site-plan-floors-5-9--7e6bd746.jpg`; `research/asset-library/projects/south-flagler-house-north/floorplans/site-plan-floors-5-9--7e6bd746.jpg` | 7,029,534 B | 1,042,808 B | 2000x1600 | 5,986,726 B |
| `/projects/berkeley/docs/floorplans/penthouse-floorplan-template--a68d7efe.jpg` | `research/asset-library/projects/berkeley/floorplans/penthouse-floorplan-template--a68d7efe.jpg` | 1,960,169 B | 534,440 B | 1800x2329 | 1,425,729 B |
| `/projects/berkeley/docs/floorplans/residence-a-floorplan-template--3f71b9ce.jpg` | `research/asset-library/projects/berkeley/floorplans/residence-a-floorplan-template--3f71b9ce.jpg` | 1,750,358 B | 473,328 B | 1800x2329 | 1,277,030 B |
| `/projects/berkeley/docs/floorplans/residence-b-floorplan-template--9d9ba081.jpg` | `research/asset-library/projects/berkeley/floorplans/residence-b-floorplan-template--9d9ba081.jpg` | 1,685,129 B | 445,774 B | 1800x2329 | 1,239,355 B |
| `/projects/berkeley/docs/floorplans/residence-c-floorplan-template--b089a348.jpg` | `research/asset-library/projects/berkeley/floorplans/residence-c-floorplan-template--b089a348.jpg` | 1,710,668 B | 454,174 B | 1800x2329 | 1,256,494 B |
| `/projects/berkeley/docs/floorplans/residence-d-floorplan-template--904ee317.jpg` | `research/asset-library/projects/berkeley/floorplans/residence-d-floorplan-template--904ee317.jpg` | 1,746,568 B | 471,329 B | 1800x2329 | 1,275,239 B |
| `/projects/berkeley/docs/floorplans/residence-e-floorplan-template--c3bd0c2e.jpg` | `research/asset-library/projects/berkeley/floorplans/residence-e-floorplan-template--c3bd0c2e.jpg` | 1,847,318 B | 502,429 B | 1800x2329 | 1,344,889 B |
| `/projects/berkeley/docs/floorplans/residence-f-floorplan-template--5c0f8efd.jpg` | `research/asset-library/projects/berkeley/floorplans/residence-f-floorplan-template--5c0f8efd.jpg` | 1,753,584 B | 472,484 B | 1800x2329 | 1,281,100 B |
| `/projects/berkeley/docs/floorplans/residence-g-floorplan-template--95ec6883.jpg` | `research/asset-library/projects/berkeley/floorplans/residence-g-floorplan-template--95ec6883.jpg` | 1,731,909 B | 465,839 B | 1800x2329 | 1,266,070 B |

## Summary

- Files reviewed: top public and research image assets by byte weight, plus all public `docs/floorplans` raster previews.
- Files resized: 11 public JPG previews.
- Total public preview bytes before: 35,623,284 B.
- Total public preview bytes after: 6,999,378 B.
- Expected savings: 28,623,906 B, about 27.3 MiB.
- Public preview policy applied: South Flagler site-plan previews capped at 2000px width; Berkeley floorplan previews capped at 1800px width.
- Source traceability: research copies were not removed or resized.

## Deferred Items

- Large project media outside `docs/floorplans` remains intentionally deferred because those images are used as hero/gallery assets and need separate visual QA.
- Source/research duplicate mirrors remain documented in `research/source-material-review/asset-duplicate-inventory.md`; no source files were deleted.
