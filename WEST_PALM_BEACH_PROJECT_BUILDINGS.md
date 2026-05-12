# West Palm Beach Project Buildings

This file is a project-side inventory of every building currently modeled or tracked in this skyline study. It is compiled from [src/proposals.ts](/Users/brookesnader/Library/Mobile%20Documents/com~apple~CloudDocs/New%20Construction%20/src/proposals.ts) and reflects the current assumptions, placement data, and source links used by the app.

## Project Scope

- Total scenarios: 4
- Total tracked buildings: 16
- Markets covered:
  - North Flagler waterfront
  - South Flagler waterfront
  - Downtown residential / mixed-use
  - Downtown office core

## Scenario 1: North Flagler Pipeline

- Scenario ID: `north-flagler-pipeline`
- Market: `West Palm Beach, Florida`
- Description: major North Flagler projects shaping the next waterfront skyline
- Included buildings: 6

### Ritz-Carlton Residences

- Project ID: `ritz-carlton-wpb`
- Status: `Under Construction`
- Confidence: `Medium`
- Address: `1717 N Flagler Dr, West Palm Beach, FL 33407`
- Description: Related Group and BH Group branded condo tower on Flagler Drive; official materials list 138 residences; March 2026 financing coverage described it as a 27-story tower.
- Modeled coordinates: `26.72848, -80.05057`
- Modeled size:
  - Height: `101 m`
  - Floors: `27`
  - Footprint: `47 m x 40 m`
  - Heading: `113°`
  - Target year: `2028`
  - Color: `#ff7a59`
- Visualization:
  - Model: `/models/ritz-carlton.glb`
  - Model scale: `0.37`
  - Height offset: `10 m`
- Modeling note: the imported `.glb` appears to include more than just the tower, so placement is still a conservative first-pass fit.
- Source URLs:
  - https://relatedgroup.com/properties/the-ritz-carlton-residences-west-palm-beach/
  - https://theresidenceswestpalmbeach.com/
- Assets:
  - Floor plan index: https://theresidenceswestpalmbeach.com/floorplans/
  - Residence 01: https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res01.pdf
  - Residence 02: https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res02.pdf
  - Residence 03: https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res03.pdf
  - Residence 04: https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res04.pdf
  - Residence 05: https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res05.pdf
  - Residence 06: https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/05/Residence06.pdf
  - Lake Home 07: https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res07.pdf
  - Lake Home 08: https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res08.pdf
  - Lake Home 09: https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res09.pdf
  - Lake Home 10: https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res10.pdf
  - Lake Home 11: https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res11.pdf
  - Lake Home 12: https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res12.pdf

### Shorecrest

- Project ID: `shorecrest`
- Status: `Under Construction`
- Confidence: `High`
- Address: `1865 N Flagler Dr, West Palm Beach, FL 33407`
- Description: Related Ross secured construction financing on February 18, 2026; developer says 28 stories, 98 residences, and 2027 completion.
- Modeled coordinates: `26.72985, -80.05012`
- Modeled size:
  - Height: `106 m`
  - Floors: `28`
  - Footprint: `54 m x 40 m`
  - Heading: `109°`
  - Target year: `2027`
  - Color: `#f4b942`
- Visualization:
  - Model: `/models/shorecrest.glb`
  - Model scale: `0.38`
  - Height offset: `20 m`
- Modeling note: moved east toward the waterfront road so it replaces the front existing mass rather than reading too far inland.
- Source URLs:
  - https://www.relatedross.com/press-releases/2026-02-18/related-ross-secures-157-million-construction-loan-shorecrest-west-palm
- Assets:
  - Floor plan index: https://www.shorecrestwpb.com/floorplans
  - Residence 704: https://www.shorecrestwpb.com/sites/default/files/2025-12/1153_0704_floorplan.pdf
  - Residence 303: https://www.shorecrestwpb.com/sites/default/files/2025-07/1153_0303_floorplan.pdf
  - Residence 301: https://www.shorecrestwpb.com/sites/default/files/2025-12/1153_0301_floorplan.pdf
  - Residence 1602: https://www.shorecrestwpb.com/sites/default/files/2026-03/1153_%201602_floorplan.pdf
  - Brochure: https://www.shorecrestwpb.com/sites/g/files/ujywhv436/files/2025-06/SHC_Rack%20Brochure_0625.pdf
  - Fact sheet: https://www.shorecrestwpb.com/sites/g/files/ujywhv436/files/2026-02/Shorecrest%20West%20Palm%20Beach%20Fact%20Sheet.pdf

### Olara

- Project ID: `olara`
- Status: `Under Construction`
- Confidence: `High`
- Address: `1919 N Flagler Dr, West Palm Beach, FL 33407`
- Description: official site says under construction; architecture page describes a 26-story Arquitectonica design with nearly 80,000 square feet of amenities.
- Modeled coordinates: `26.73070, -80.05010`
- Modeled size:
  - Height: `98 m`
  - Floors: `26`
  - Footprint: `62 m x 44 m`
  - Heading: `-89°`
  - Target year: `2026`
  - Color: `#4bb3fd`
- Visualization:
  - Model: `/models/olara.glb`
  - Model scale: `0.33`
  - Height offset: `20 m`
- Modeling note: current fit is first-pass based on imported model bounds; final tuning can still be done in placement controls.
- Source URLs:
  - https://www.olarawestpalmbeach.com/
  - https://www.olarawestpalmbeach.com/architecture/
- Assets:
  - Floor plan index: https://www.olarawestpalmbeach.com/floor-plans
  - All floor plans: https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Olara-Floor-Plans-All-March-2026.pdf
  - Brochure: https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/RackBrochure_Digital_032026.pdf
  - Amenities brochure: https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Olara_Amenities_DigitalBrochure_032026.pdf
  - Fact sheet: https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Olara-Fact-Sheet-March-2026-2.pdf
  - Download pack: https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Downloads-1.zip

### Mandarin Oriental Residences

- Project ID: `mandarin-oriental`
- Status: `Concept`
- Confidence: `High`
- Address: `5400 N Flagler Dr, West Palm Beach, FL 33407`
- Description: launched by Mandarin Oriental and Great Gulf in March 2026; official site lists 87 residences across 31 stories with anticipated opening in 2031.
- Modeled coordinates: `26.7590, -80.0516`
- Modeled size:
  - Height: `122 m`
  - Floors: `31`
  - Footprint: `48 m x 42 m`
  - Heading: `0°`
  - Target year: `2031`
  - Color: `#8f7cff`
- Modeling note: story count and address are official; roof height is inferred from story count.
- Source URLs:
  - https://mandarinorientalwestpalmbeach.com/

### Alba Palm Beach

- Project ID: `alba-palm-beach`
- Status: `Under Construction`
- Confidence: `Medium`
- Address: `4714 N Flagler Dr, West Palm Beach, FL 33407`
- Description: included because it materially changes the corridor silhouette; April 2025 coverage said the 22-story, 55-unit tower topped out and was targeting early 2026 delivery.
- Modeled coordinates: `26.7526, -80.0510`
- Modeled size:
  - Height: `86 m`
  - Floors: `22`
  - Footprint: `58 m x 39 m`
  - Heading: `0°`
  - Target year: `2026`
  - Color: `#79c9a5`
- Modeling note: data is from reporting rather than an official sales site.
- Source URLs:
  - https://floridayimby.com/2025/04/alba-palm-beach-tops-out-at-4714-north-flagler-drive-in-west-palm-beach.html

### Apogee

- Project ID: `apogee-wpb`
- Status: `Planning`
- Confidence: `Low`
- Address: `4906 N Flagler Dr, West Palm Beach, FL 33407`
- Description: planning-stage North Flagler tower by Related Group and BH Group; recent reporting described it as a 21-story, 39-unit project.
- Modeled coordinates: `26.7511, -80.0512`
- Modeled size:
  - Height: `82 m`
  - Floors: `21`
  - Footprint: `36 m x 34 m`
  - Heading: `0°`
  - Target year: `2029`
  - Color: `#b0a7ff`
- Modeling note: directional placeholder until stronger city filing or official project-site data exists.
- Source URLs:
  - https://therealdeal.com/miami/2025/11/18/related-group-bh-group-plan-apogee-condo-in-west-palm-beach/

## Scenario 2: South Flagler Waterfront

- Scenario ID: `south-flagler-waterfront`
- Market: `South Flagler Drive, West Palm Beach`
- Description: ultra-luxury waterfront twin-tower corridor opposite Palm Beach Island
- Included buildings: 4

### South Flagler House North

- Project ID: `south-flagler-house-north`
- Status: `Under Construction`
- Confidence: `High`
- Address: `1355 S Flagler Dr, West Palm Beach, FL 33401`
- Description: one of the two limestone-clad South Flagler House towers; official fact sheet says the overall project consists of two 28-story buildings.
- Modeled coordinates: `26.7015, -80.0511`
- Modeled size:
  - Height: `108 m`
  - Floors: `28`
  - Footprint: `37 m x 35 m`
  - Heading: `0°`
  - Target year: `2027`
  - Color: `#e9d8a6`
- Modeling note: explicitly split into north and south towers to preserve the real twin-building composition.
- Source URLs:
  - https://www.southflaglerhouse.com/
  - https://www.southflaglerhouse.com/sites/g/files/ujywhv446/files/2025-05/SFH_Fact%20Sheet_0425.pdf

### South Flagler House South

- Project ID: `south-flagler-house-south`
- Status: `Under Construction`
- Confidence: `High`
- Address: `1355 S Flagler Dr, West Palm Beach, FL 33401`
- Description: second South Flagler House tower, modeled separately for the official twin-building silhouette.
- Modeled coordinates: `26.7007, -80.0511`
- Modeled size:
  - Height: `108 m`
  - Floors: `28`
  - Footprint: `37 m x 35 m`
  - Heading: `0°`
  - Target year: `2027`
  - Color: `#d4c38c`
- Modeling note: paired with the north tower to preserve the two-building composition.
- Source URLs:
  - https://www.southflaglerhouse.com/
  - https://www.southflaglerhouse.com/sites/g/files/ujywhv446/files/2025-05/SFH_Fact%20Sheet_0425.pdf

### Edgeworth North

- Project ID: `edgeworth-north`
- Status: `Planning`
- Confidence: `Medium`
- Address: `1155 S Flagler Dr, West Palm Beach, FL 33401`
- Description: official launch site confirms the address; March 2026 reporting and design-team material describe a two-tower, 28-story waterfront project due around 2029.
- Modeled coordinates: `26.6996, -80.0514`
- Modeled size:
  - Height: `108 m`
  - Floors: `28`
  - Footprint: `35 m x 34 m`
  - Heading: `0°`
  - Target year: `2029`
  - Color: `#ffb36b`
- Modeling note: story count is from recent coverage/design material and still needs future validation from a fact sheet or city filing.
- Source URLs:
  - https://www.edgeworthwpb.com/
  - https://mawd.co/projects/residential/edgeworth

### Edgeworth South

- Project ID: `edgeworth-south`
- Status: `Planning`
- Confidence: `Medium`
- Address: `1155 S Flagler Dr, West Palm Beach, FL 33401`
- Description: second Edgeworth tower, split out to show the paired South Flagler composition.
- Modeled coordinates: `26.6988, -80.0514`
- Modeled size:
  - Height: `108 m`
  - Floors: `28`
  - Footprint: `35 m x 34 m`
  - Heading: `0°`
  - Target year: `2029`
  - Color: `#ff8f5a`
- Modeling note: second tower remains an inferred placeholder until more exact public geometry is available.
- Source URLs:
  - https://www.edgeworthwpb.com/
  - https://mawd.co/projects/residential/edgeworth

## Scenario 3: Downtown Residential Wave

- Scenario ID: `downtown-residential-wave`
- Market: `Downtown West Palm Beach`
- Description: next residential and mixed-use additions around Lakeview, Hibiscus, South Australian, and NORA
- Included buildings: 4

### Mr. C Hotel & Residences

- Project ID: `mr-c`
- Status: `Under Construction`
- Confidence: `Medium`
- Address: `320 Lakeview Ave, West Palm Beach, FL 33401`
- Description: mixed hotel-and-residences tower with 146 residences and 110 hotel keys; most 2025 and 2026 reporting calls it 27 stories, though some earlier coverage said 25.
- Modeled coordinates: `26.7060, -80.0578`
- Modeled size:
  - Height: `103 m`
  - Floors: `27`
  - Footprint: `50 m x 36 m`
  - Heading: `8°`
  - Target year: `2027`
  - Color: `#6ec1a5`
- Visualization:
  - Model: `/models/mr-c.glb`
  - Model scale: `2.7`
  - Height offset: `52 m`
- Modeling note: imported model bounds are tighter than the North Flagler models, so only light visual tuning should be needed.
- Source URLs:
  - https://www.mrcwpalmbeach.com/
  - https://floridayimby.com/2025/08/terra-secures-285-million-construction-loan-and-breaks-ground-on-mr-c-hotel-residences-in-west-palm-beach.html
- Assets:
  - Downloads: https://www.mrcresidenceswpb.com/downloads/
  - Fact sheet: https://www.mrcresidenceswpb.com/wp-content/uploads/MrC_FactSheet_Aug24_digi_1.pdf
  - West Palm Beach guide: https://www.mrcresidenceswpb.com/wp-content/uploads/MrC-WPB-Guide-body-R13-Digital-Web.pdf
  - Residence 01: https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res01_FloorPlan_Illustrated-1.pdf
  - Residence 01A: https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res01A_FloorPlan_Illustrated-1.pdf
  - Residence 02: https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res02_FloorPlan_Illustrated-1.pdf
  - Residence 02A: https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res02A_FloorPlan_Illustrated-1.pdf
  - Residence 03: https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res03_FloorPlan_Illustrated-1.pdf
  - Residence 04: https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res04_FloorPlan_Illustrated-1.pdf
  - Residence 05: https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res05_FloorPlan_Illustrated-1.pdf
  - Residence 06: https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res06_FloorPlan_Illustrated-1.pdf
  - Residence 07: https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res07_FloorPlan_Illustrated-1.pdf
  - Residence 08: https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res08_FloorPlan_Illustrated-1.pdf
  - Residence 10: https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res10_FloorPlan_Illustrated-1.pdf
  - Residence 11: https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res11_FloorPlan_Illustrated-1.pdf
  - Residence 12: https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res12_FloorPlan_Illustrated-1.pdf

### Banyan Tree Residences

- Project ID: `banyan-tree`
- Status: `Planning`
- Confidence: `Medium`
- Address: `400 Hibiscus St, West Palm Beach, FL 33401`
- Description: official site says 88 exclusive corner residences; March 12, 2026 city pre-application agenda described the site as a proposed 25-story mixed-use high-rise.
- Modeled coordinates: `26.7069, -80.0553`
- Modeled size:
  - Height: `96 m`
  - Floors: `25`
  - Footprint: `44 m x 39 m`
  - Heading: `0°`
  - Target year: `2029`
  - Color: `#7ec7ff`
- Modeling note: official marketing supports address and unit count; story count comes from city planning material.
- Source URLs:
  - https://www.banyantreeresidenceswpb.com/
  - https://www.wpb.org/files/assets/city/v/1/development-services/documents/plans-amp-plats-review-committee/2026-pprc-agendas/pprc-pre-app-agenda-march-12-2026.pdf

### The Berkeley Palm Beach

- Project ID: `berkeley`
- Status: `Under Construction`
- Confidence: `Medium`
- Address: `550 S Australian Ave, West Palm Beach, FL 33401`
- Description: official site confirms the project; September 2025 financing coverage described a 25-story tower with 193 residences.
- Modeled coordinates: `26.7087, -80.0642`
- Modeled size:
  - Height: `96 m`
  - Floors: `25`
  - Footprint: `52 m x 40 m`
  - Heading: `0°`
  - Target year: `2028`
  - Color: `#4f8df7`
- Modeling note: story count comes from financing coverage rather than directly from the sales site.
- Source URLs:
  - https://www.theberkeleypalmbeach.com/
  - https://floridayimby.com/2025/09/the-berkeley-palm-beach-secures-62-5-million-pre-construction-loan-from-jvp-management-in-downtown-west-palm-beach.html

### NORA House

- Project ID: `nora-house`
- Status: `Planning`
- Confidence: `Low`
- Address: `Modeled at district core between 955 N Railroad Ave and 1105 N Dixie Hwy, West Palm Beach, FL 33401`
- Description: official site lists 955 North Railroad Avenue for inquiries, while March 2026 reporting placed the planned 11-story condominium at 1105 North Dixie Highway.
- Modeled coordinates: `26.7178, -80.0581`
- Modeled size:
  - Height: `43 m`
  - Floors: `11`
  - Footprint: `50 m x 34 m`
  - Heading: `0°`
  - Target year: `2028`
  - Color: `#9f86ff`
- Modeling note: public sources conflict on address, so this should be treated as a district-level marker for now.
- Source URLs:
  - https://norahouse.com/
  - https://profilemiamire.com/miamirealestate/2026/3/26/the-ronto-group-launches-sales-for-nora-house-in-west-palm-beachs-nora-district

## Scenario 4: Downtown Office Core

- Scenario ID: `downtown-office-core`
- Market: `CityPlace, West Palm Beach`
- Description: Related Ross office build-out reshaping the downtown core
- Included buildings: 2

### 15 CityPlace

- Project ID: `15-cityplace`
- Status: `Under Construction`
- Confidence: `Medium`
- Address: `15 CityPlace, West Palm Beach, FL 33401`
- Description: Related Ross broke ground in March 2025; groundbreaking release described a 25-story office tower, while the leasing page currently lists 24 floors and a 2026 completion target.
- Modeled coordinates: `26.7091, -80.0562`
- Modeled size:
  - Height: `114 m`
  - Floors: `25`
  - Footprint: `55 m x 52 m`
  - Heading: `0°`
  - Target year: `2027`
  - Color: `#ff6584`
- Modeling note: public sources conflict between 24 floors and 25 stories; current massing uses the taller figure from the groundbreaking release.
- Source URLs:
  - https://www.relatedross.com/press-releases/2025-03-13/related-ross-breaks-ground-10-and-15-cityplace-west-palm-beach
  - https://www.lifestyleoffice.com/15-cityplace

### 10 CityPlace

- Project ID: `10-cityplace`
- Status: `Under Construction`
- Confidence: `Low`
- Address: `10 CityPlace, West Palm Beach, FL 33401`
- Description: Related Ross property page lists the project at 468,000 square feet and in development; CityPlace district materials have described it as a 21-story tower.
- Modeled coordinates: `26.7092, -80.0571`
- Modeled size:
  - Height: `95 m`
  - Floors: `21`
  - Footprint: `58 m x 48 m`
  - Heading: `0°`
  - Target year: `2027`
  - Color: `#65c18c`
- Modeling note: project is confirmed, but precise story count is still a planning-stage assumption.
- Source URLs:
  - https://www.relatedross.com/our-company/properties/10-cityplace
  - https://www.relatedross.com/press-releases/2025-03-13/related-ross-breaks-ground-10-and-15-cityplace-west-palm-beach

## Quick Counts

- Under Construction: `10`
- Planning: `5`
- Concept: `1`
- Entitled: `0`

## Notes On Data Quality

- `confidence` reflects how solid the public information is, not whether the project is important.
- `heightMeters` is modeled massing height used in the app; in some cases it is inferred from floor count.
- `targetYear` is the project-side expected delivery / skyline-impact year used in this study.
- Some projects are represented as split twin towers because that better matches public materials.
- Several entries include imported `.glb` files and placement tuning notes; those are visualization assumptions, not entitlement documents.
