# Asset Pipeline Audit Report

Generated: 2026-05-27T15:51:15.451Z

Mode: default
Project filter: all

## Summary

- Blockers: 0
- Strict blockers: 5
- Warnings: 230
- Safe to proceed to iCloud -> asset repo intake: no

## iCloud Asset Library

- Root exists: yes
- Is Git repo: no
- Approved folders found: 2
- Approved files found: 49
- Approved projects: alba-palm-beach, berkeley
- Extension counts: `{".jpg":25,".webp":10,".jpeg":4,"(none)":2,".pdf":7,".png":1}`
- Unmapped approved folders: 0

### iCloud alba-palm-beach

- Folder: `01_PROJECTS/alba-palm-beach/approved-for-website`
- Files: 21
- Extensions: `{".jpg":4,".webp":7,".jpeg":2,"(none)":1,".pdf":7}`
- Unsupported files: 1
- Hidden/temp files: 0
- Zero-byte files: 0
- Naming issues: 13
- Duplicate candidates: 0

### iCloud berkeley

- Folder: `01_PROJECTS/berkeley/approved-for-website`
- Files: 28
- Extensions: `{"(none)":1,".jpg":21,".png":1,".webp":3,".jpeg":2}`
- Unsupported files: 1
- Hidden/temp files: 1
- Zero-byte files: 0
- Naming issues: 8
- Duplicate candidates: 0


## Asset Repo

- Root exists: yes
- Branch: main
- Origin: https://github.com/BrokenFL/WPB_New_Construction_Assets.git
- Status: `## main...origin/main ?? asset-manifest.json ?? docs/ ?? public-projects/alba-palm-beach/approved-for-website/ ?? public-projects/berkeley/approved-for-website/ ?? scripts/`
- Git LFS configured: no
- Project folders: 46
- Approved folders: 2
- Approved warehouse assets: 47
- Total files: 1371
- Extension counts: `{"(none)":1,".md":54,".json":163,".png":148,".jpg":555,".svg":45,".pdf":197,".webp":84,".jpeg":6,".html":64,".csv":24,".xlsx":25,".ico":4,".mjs":1}`
- Missing iCloud-approved assets in asset repo by name: 9
- Large files over 3 MB: 100

## Website Public Assets

- Root exists: yes
- Files: 60
- Project folders: alba-palm-beach, berkeley
- Assets by project: `{"alba-palm-beach":33,"berkeley":27}`
- Assets by category: `{"amenities":13,"floorplans":15,"hero":12,"logos":4,"neighborhood":2,"residences":14}`
- Image formats: `{".webp":47,".jpg":4,".jpeg":2}`
- Unsupported files: 0
- Oversized/unoptimized warnings: 0
- Naming inconsistencies: 0
- Category mistakes: 0

## Website References

- Scanned files: 105
- /assets references: 188
- Legacy /projects references: 1148
- Broken /assets references: 0
- Local path leaks: 5
- Unsupported format references: 4
- Duplicate reference candidates: 416
- Missing hero images where website project assets exist: none
- Galleries empty where project assets exist: none

## Missing Pipeline Links

- None

## Unsupported Formats

- iCloud: 01_PROJECTS/alba-palm-beach/approved-for-website/alba-developer-Spina-O'Rourke-logo-v01 ((none))
- iCloud: 01_PROJECTS/berkeley/approved-for-website/.DS_Store ((none))
- assetRepo: .gitignore ((none))
- assetRepo: research-asset-library/projects/banyan-tree/team-logos/architect--oma--logo--976522c5.ico (.ico)
- assetRepo: research-asset-library/projects/forte-on-flagler/team-logos/interior-designer--jean-louis-deniot--logo--18fb70e3.ico (.ico)
- assetRepo: research-asset-library/projects/mandarin-oriental/logos/project-logo--mandarin-oriental--4d4b7d4c.ico (.ico)
- assetRepo: research-asset-library/projects/mandarin-oriental/team-logos/architect--safdie-architects--logo--8d413419.ico (.ico)
- assetRepo: scripts/sync-icloud-approved-assets.mjs (.mjs)

## Oversized / Unoptimized Warnings

- assetRepo: public-projects/olara/docs/floorplans/all-floor-plans--fc168288.pdf 26113 KB
- assetRepo: public-projects/olara/docs/floorplans/olara-floor-plans-all-march-2026--9503a396.pdf 26113 KB
- assetRepo: public-projects/olara/docs/olara-floorplans-all-march-2026.pdf 26113 KB
- assetRepo: research-asset-library/projects/olara/floorplans/all-floor-plans--fc168288.pdf 26113 KB
- assetRepo: research-asset-library/projects/olara/floorplans/olara-floor-plans-all-march-2026--9503a396.pdf 26113 KB
- assetRepo: research-asset-library/projects/mr-c/brochures/west-palm-beach-guide--3f539116.pdf 12880 KB
- assetRepo: public-projects/berkeley/approved-for-website/images/berkeley-hero-exterior-lake-view-v01.webp 11141 KB
- assetRepo: public-projects/forte-on-flagler/docs/floorplans/north-open-kitchen-plan--e3976295.pdf 9800 KB
- assetRepo: research-asset-library/projects/forte-on-flagler/downloads/north-open-kitchen-plan--570a05d0.pdf 9800 KB
- assetRepo: research-asset-library/projects/forte-on-flagler/floorplans/north-open-kitchen-plan--e3976295.pdf 9800 KB
- assetRepo: public-projects/forte-on-flagler/docs/floorplans/south-open-kitchen--530e51d2.pdf 9502 KB
- assetRepo: research-asset-library/projects/forte-on-flagler/floorplans/south-open-kitchen--530e51d2.pdf 9502 KB
- assetRepo: research-asset-library/projects/olara/brochures/amenities-brochure--df5932b1.pdf 8697 KB
- assetRepo: research-asset-library/projects/south-flagler-house-north/images/public-research/image-05--heroexterior--southflaglerhouse.com--53e28a55.jpg 8416 KB
- assetRepo: research-asset-library/projects/south-flagler-house-south/images/public-research/image-05--heroexterior--southflaglerhouse.com--53e28a55.jpg 8416 KB
- assetRepo: public-projects/south-flagler-house/docs/floorplans/shared/site-plan-floors-19-20--113324cb.jpg 7085 KB
- assetRepo: research-asset-library/projects/south-flagler-house-north/floorplans/site-plan-floors-19-20--113324cb.jpg 7085 KB
- assetRepo: research-asset-library/projects/south-flagler-house-south/floorplans/site-plan-floors-19-20--113324cb.jpg 7085 KB
- assetRepo: public-projects/south-flagler-house/docs/floorplans/shared/site-plan-floors-10-18--29f041ee.jpg 6985 KB
- assetRepo: research-asset-library/projects/south-flagler-house-north/floorplans/site-plan-floors-10-18--29f041ee.jpg 6985 KB
- assetRepo: research-asset-library/projects/south-flagler-house-south/floorplans/site-plan-floors-10-18--29f041ee.jpg 6985 KB
- assetRepo: public-projects/south-flagler-house/docs/floorplans/shared/site-plan-floors-5-9--7e6bd746.jpg 6865 KB
- assetRepo: research-asset-library/projects/south-flagler-house-north/floorplans/site-plan-floors-5-9--7e6bd746.jpg 6865 KB
- assetRepo: research-asset-library/projects/south-flagler-house-south/floorplans/site-plan-floors-5-9--7e6bd746.jpg 6865 KB
- assetRepo: public-projects/ritz-carlton-wpb/media/ritz-hero-waterfront-building-2880x1800.png 6147 KB
- assetRepo: public-projects/ritz-carlton-wpb/media/ritz-amenity-fitness-center-2400x1600.png 6010 KB
- assetRepo: public-projects/shorecrest/media/shorecrest-exterior-hero.jpg 5852 KB
- assetRepo: research-asset-library/projects/shorecrest/images/public-research/image-07--heroexterior--shorecrestwpb.com--a03a8ac8.jpg 5852 KB
- assetRepo: research-asset-library/projects/south-flagler-house-north/images/public-research/image-07--viewscontext--southflaglerhouse.com--dd18725c.jpg 5766 KB
- assetRepo: public-projects/ritz-carlton-wpb/media/ritz-amenity-pool-cabanas-2400x1600.png 5658 KB
- assetRepo: public-projects/olara/media/olara-marina-boat-dock-2400x1600.png 5560 KB
- assetRepo: research-asset-library/projects/olara/user-supplied/boat_dock_lifestyle_2400x1600.png 5560 KB
- assetRepo: research-asset-library/projects/olara/user-supplied/24_Lifestyle_Boat_Dock.jpg 5492 KB
- assetRepo: public-projects/olara/media/olara-amenity-gym-2400x1600.png 5328 KB
- assetRepo: research-asset-library/projects/olara/user-supplied/gym_interior_2400x1600.png 5328 KB
- assetRepo: public-projects/ritz-carlton-wpb/media/ritz-view-intracoastal-day-2400x1600.png 5305 KB
- assetRepo: public-projects/olara/media/olara-amenity-pool-veranda-refreshments-2400x1600.png 5049 KB
- assetRepo: research-asset-library/projects/olara/user-supplied/pool_veranda_women_refreshments_2400x1600.png 5049 KB
- assetRepo: public-projects/ritz-carlton-wpb/media/ritz-lobby-lounge-waterfront-2400x1600.png 4970 KB
- assetRepo: public-projects/mr-c/docs/floorplans/mrcwpb-res19-floorplan-illustrated-1--ce20734e.pdf 4934 KB
- assetRepo: research-asset-library/projects/mr-c/floorplans/mrcwpb-res19-floorplan-illustrated-1--ce20734e.pdf 4934 KB
- assetRepo: public-projects/ritz-carlton-wpb/media/ritz-lobby-service-2400x1600.png 4920 KB
- assetRepo: public-projects/olara/media/olara-amenity-rooftop-pool-reading-2400x1600.png 4843 KB
- assetRepo: research-asset-library/projects/olara/user-supplied/rooftop_pool_couple_reading_2400x1600.png 4843 KB
- assetRepo: public-projects/olara/media/olara-arrival-valet-lobby-2400x1600.png 4808 KB
- assetRepo: research-asset-library/projects/olara/user-supplied/valet_lobby_mercedes_driver_door_2400x1600.png 4808 KB
- assetRepo: public-projects/ritz-carlton-wpb/media/ritz-evening-aerial-road-motion-2400x1600.png 4806 KB
- assetRepo: public-projects/olara/media/olara-amenity-hot-cold-plunge-2400x1600.png 4805 KB
- assetRepo: research-asset-library/projects/olara/user-supplied/rooftop_cooldown_jets_no_guy_2400x1600.png 4805 KB
- assetRepo: research-asset-library/projects/edgeworth-north/images/public-research/image-10--residencesinteriors--static.therealdeal.com--1b4a66c3.jpg 4726 KB

## Slug Mismatches

- None

## Broken References

- None

## Local Path Leaks

- research/scripts/apply-approved-asset-cleanup.mjs: source-repos
- research/scripts/check-builder-remote-images.mjs: /Volumes/ExternalSSD
- research/scripts/expand-public-asset-library.mjs: source-repos
- research/scripts/harvest-assets.mjs: source-repos
- research/scripts/report-duplicate-assets.mjs: source-repos

## Duplicate Candidates

- assetRepo: cityplace-shared-card-1448x1086:632343 (2)
- assetRepo: cityplace-shared-hero-1536x1024:739355 (2)
- assetRepo: cityplace-shared-mobile-1122x1402:662275 (2)
- assetRepo: alba-floorplans-19lpha-unbranded-553224c4:2253234 (2)
- assetRepo: alba-floorplans-19lphb-unbranded-f6e25856:2220045 (2)
- assetRepo: alba-floorplans-a-unbranded-52561765:2214794 (2)
- assetRepo: alba-floorplans-b-unbranded-0904612c:2214907 (2)
- assetRepo: alba-floorplans-c-unbranded-858d4e18:2207940 (2)
- assetRepo: alba-floorplans-d-unbranded-b6510b3b:2215583 (2)
- assetRepo: alba-floorplans-lpha-unbranded-cfde7c5e:2251750 (2)
- assetRepo: alba-floorplans-lphb-unbranded-4dec1b6c:2218144 (2)
- assetRepo: alba-floorplans-thc-unbranded-2f37dd97:2335220 (2)
- assetRepo: penthouse-floorplan-template-a68d7efe:1960169 (2)
- assetRepo: residence-a-floorplan-template-3f71b9ce:1750358 (2)
- assetRepo: residence-b-floorplan-template-9d9ba081:1685129 (2)
- assetRepo: residence-c-floorplan-template-b089a348:1710668 (2)
- assetRepo: residence-d-floorplan-template-904ee317:1746568 (2)
- assetRepo: residence-e-floorplan-template-c3bd0c2e:1847318 (2)
- assetRepo: residence-f-floorplan-template-5c0f8efd:1753584 (2)
- assetRepo: residence-g-floorplan-template-95ec6883:1731909 (2)
- assetRepo: north-open-kitchen-plan-e3976295:10034786 (2)
- assetRepo: penthouse-floorplan-insert-44c404b2:4791890 (2)
- assetRepo: south-open-kitchen-530e51d2:9729942 (2)
- assetRepo: maisondor-fact-sheet-f983cc62:1420264 (2)
- assetRepo: mrcwpb-res01-floorplan-illustrated-1-85f9b4cc:1666749 (2)
- assetRepo: mrcwpb-res02-floorplan-illustrated-1-c9a23ab0:1150884 (2)
- assetRepo: mrcwpb-res03a-floorplan-illustrated-1-5bd7a0a7:1593185 (2)
- assetRepo: mrcwpb-res04a-floorplan-illustrated-1-534379f7:1927168 (2)
- assetRepo: mrcwpb-res06a-floorplan-illustrated-1-f57905a4:1492115 (2)
- assetRepo: mrcwpb-res07a-floorplan-illustrated-1-6616d702:1608633 (2)
- assetRepo: mrcwpb-res08a-floorplan-illustrated-1-f250368d:1347726 (2)
- assetRepo: mrcwpb-res13-floorplan-illustrated-1-509a3e5e:3571426 (2)
- assetRepo: mrcwpb-res14-floorplan-illustrated-1-9b18c4e3:1576986 (2)
- assetRepo: mrcwpb-res15-floorplan-illustrated-1-dbf7b2b7:1280462 (2)
- assetRepo: mrcwpb-res16-floorplan-illustrated-1-7e8a2c95:3916332 (2)
- assetRepo: mrcwpb-res17-floorplan-illustrated-1-a48c9cef:1462193 (2)
- assetRepo: mrcwpb-res18-floorplan-illustrated-1-c9f8621b:4285651 (2)
- assetRepo: mrcwpb-res19-floorplan-illustrated-1-ce20734e:5052854 (2)
- assetRepo: mrcwpb-res211-floorplan-illustrated-1-e8de62cf:3666251 (2)
- assetRepo: mrcwpb-res215-floorplan-illustrated-1-3faea402:4246707 (2)
- assetRepo: mrcwpb-res216-floorplan-illustrated-1-d98b753a:3826050 (2)
- assetRepo: mrcwpb-res217-floorplan-illustrated-1-baf065bd:3636823 (2)
- assetRepo: mrcwpb-res813-floorplan-illustrated-1-47517f83:1340338 (2)
- assetRepo: mrcwpb-res814-floorplan-illustrated-1-9b7e221f:1507559 (2)
- assetRepo: mrcwpb-res815-floorplan-illustrated-1-c7f37852:1339694 (2)
- assetRepo: residence-01a-4c4e8025:1584507 (2)
- assetRepo: residence-02a-c0b62912:1148716 (2)
- assetRepo: residence-03-809edf7a:2049860 (2)
- assetRepo: residence-04-7e2f1920:1188702 (2)
- assetRepo: residence-05-a9880839:1503160 (2)

## Recommended Next Fixes

- Remove local absolute path leaks from website source/data before strict publication.
- Normalize approved iCloud filenames during intake; do not publish source names directly.
