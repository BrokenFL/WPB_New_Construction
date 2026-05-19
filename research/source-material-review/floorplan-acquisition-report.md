# Floorplan Acquisition Report

Acquisition pass completed with official/source browsing on May 15, 2026. Scope was limited to public floorplan PDFs, official floorplan pages, and floorplan/site-plan images under `research/asset-library/projects/*/floorplans`.

## Files Added

| Project | Added | Official/source basis |
| --- | ---: | --- |
| Alba Palm Beach | 9 PDFs | Official Alba WP media library and public floorplan PDF URLs. |
| The Berkeley Palm Beach | 8 JPGs | Official Berkeley WP media library floorplan template images. |
| NORA House | 32 HTML pages + 32 floorplan images | Official `norahouse.com/wp-json/wp/v2/floorplan` index and each public floorplan page `og:image`. |
| Forté on Flagler | 3 PDFs | Official Forté public PDF URLs for north/south kitchen plans and penthouse floorplan insert. |
| South Flagler House North Tower | 3 JPGs | Official South Flagler House residence tier/site-plan images from the public residences page. |
| South Flagler House South Tower | 3 JPGs | Same official combined South Flagler House tier/site-plan images copied to the south project card because the source site covers both towers as one project. |

## Sources Used

- Alba Palm Beach: `https://www.albapalmbeach.com/wp-json/wp/v2/media?search=Floor&per_page=100`
- Alba public PDFs: `Alba-Floorplans-A_Unbranded.pdf`, `B_Unbranded.pdf`, `C_Unbranded.pdf`, `D_Unbranded.pdf`, `LPHA_Unbranded.pdf`, `LPHB_Unbranded.pdf`, `19LPHA_Unbranded.pdf`, `19LPHB_Unbranded.pdf`, `THC_Unbranded.pdf`
- The Berkeley Palm Beach: `https://www.theberkeleypalmbeach.com/wp-json/wp/v2/media?search=floorplan&per_page=100`
- NORA House: `https://norahouse.com/wp-json/wp/v2/floorplan?orderby=title&order=asc&per_page=100`
- Forté on Flagler: `https://fortewpb.com/wp-content/uploads/North-Open-Kitchen-Plan.pdf`, `https://fortewpb.com/wp-content/uploads/South-Open-Kitchen.pdf`, `https://fortewpb.com/wp-content/uploads/FLAG-010363-Penthouse-Floorplan-Insert-Printing.pdf`
- South Flagler House: `https://www.southflaglerhouse.com/residences` and its public `SFH_Site_Plan_Illustration_V07` tier images.

## Skipped

- Alba had many branded, older, and duplicate media-library variants. I kept the clean unbranded floorplan set and skipped redundant branded/legacy copies.
- Berkeley also exposes duplicate `-1` variants of some floorplan template JPGs. I kept the non-suffixed/current-looking set.
- South Flagler House has a fact sheet and residence tier/site-plan imagery, but no complete public unit-by-unit floorplan PDF library found.
- Forté magazine/press PDFs were skipped unless they were floorplan-specific.

## Remaining Blockers

- Banyan Tree Residences, Edgeworth North/South, Mandarin Oriental, Apogee, Alba Reserve, La Clara, Related Ross Fern Street, Portofino/Flagler Yacht Club, Rybovich Marina, 10 CityPlace, and 15 CityPlace still have no confirmed official public floorplan PDFs/pages in the catalog or live source pass.
- South Flagler House remains partial: official tier/site-plan imagery is captured, but detailed residence plan PDFs appear gated or unpublished.
- NORA House publishes floorplans as pages and images, not downloadable PDFs.

## Verification

- Added files checked as non-empty.
- File type check recognized all additions as PDF, HTML, JPEG, or WebP.
- No edits were made to `src/main.ts`, `src/style.css`, `index.html`, `package.json`, or generator scripts.
