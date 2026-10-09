# Complete emitted building-schema audit — October 9, 2026

This is the final schema review for the Sep 21 building-reference task. It supersedes the earlier preparation reports’ approval and verification status. Brooke explicitly authorized supported website/schema corrections, then authorized publication after verification on October 9. No extra per-field confirmation is required for facts supported by the inspected official evidence. The original reference table has no supplied year or source URL; it remains private dated input, not a current inventory assertion.

The release is integrated from current main `41cdced3aaff0097c67b12ed35946a6a18bfb2c4`, retaining today’s SEO fixes at `5b0f240933392471ba909d40db6bc120dc520005` and the separately published Vanderbilt article. No historical article source, CRM Space page, project identity or publication workflow was changed.

## Actual emitted coverage

The audited build contains **24 building routes, 106 floor-plan routes and 31 Answers routes**. These include 96 discovery-generated plan routes, 10 legacy plan entities, the Answers index, 20 buyer FAQ guides, two comparison entities and nine preserved historical Article routes. Every JSON-LD block on these routes is parsed. Client-navigation graphs are separately captured so the browser’s reuse of prerendered schema does not conceal runtime emission: 151 generated graphs and 10 existing enriched-route full-page reloads, all 161 parsed and validated.

The [machine-readable inventory](reports/building-schema-property-audit-2026-10-09.json) includes every emitted graph, route, property path and value for both modes. It is an audit snapshot, never an application database. The [official-source report](BUILDING_OFFICIAL_SOURCE_AUDIT_2026_10_09.md) supplies the 24-profile primary evidence, publication/event/target distinctions, source discrepancies and all 384 existing intelligence slots. Those 384 slots are an inventory, not a claim that every unused visible catalog detail has been freshly verified. Nine historical Article descriptions and dates remain snapshots; they are inventoried and preserved, not rewritten or claimed current.

## Disposition of every claim class

| Schema property / claim | Decision and supporting evidence |
|---|---|
| `numberOfAccommodationUnits` (`QuantitativeValue`, numeric value, unitText) | Six undisputed supported residence totals: Alba 55, Berkeley 193, Maison 39, Ritz-Carlton 138, OLIN 32, The Sound 358. Project/contractor/municipal sources listed below and in the official-source audit. These are program totals, never available inventory. |
| `additionalProperty` / `PropertyValue` | Only reviewed residence-offering, development-status and delivery-guidance text. Qualified offerings: Olara 275 condominiums, SFH 105 marketed residences with municipal discrepancy, Mr. C 146 private residences, Edgeworth 184 marketed residences, Mandarin 87 branded residences, Banyan 88 marketed residences. Their scope/qualification remains in the emitted value. |
| Future delivery periods | Officially attributed planning targets: Olara 2028; Shorecrest 2027 (April 2026 release); Ritz Q1 2028; SFH 2027 (June 2025 release); Mr. C 2027 with conflicting seasons held; Mandarin anticipated 2031. No exact invented dates or contract closing guarantees. |
| Completed guidance | Alba developer-reported completion announcement June 2026, residence-specific occupancy still to confirm; Forté developer-confirmed completion without assuming resale-only inventory; La Clara opened 2023 per Stantec while architect HPA lists completion 2024. |
| `address` / `PostalAddress` / city/state/country | Only four supported street addresses emitted (Alba, Fern, 201 & 203 Arkona, Sound). Street text is separated from the city/state/country. Postal codes are not newly asserted. Other exact addresses are held for marketing/site/gallery/parcel differences or missing primary plan. Municipal/official sources support locality; Palm Beach remains distinct from West Palm Beach. |
| `@type`, `name`, identity, `containedInPlace` | Existing canonical routing and official project identity. Unconfirmed Rosewood association is explicitly qualified as the 2001 North Flagler site and a `Place`; Alba Reserve, Arkona and 2085 are `Place` watch entities. Proposed/mixed-use types express the project/site category, not approval, occupancy or unit availability. Existing URLs/aliases are preserved. |
| Project `description` and WebPage metadata | Research-guide descriptions omit unsupported counts, dates, amenities, sizes and brand-approval assertions. Rosewood title is qualified. Rental guide text does not assert a delivered amenity or available lease. |
| Exact coordinates / `latitude`, `longitude` | Removed for all building schema; their exact provenance was not established. Map data is unchanged. |
| `amenityFeature` “Floorplans available” | Removed; a website library is not a building amenity. No unreviewed amenity, parking, stories, height, bedroom/bathroom or area schema property remains. |
| Fern’s authored `structuredDetails` | All 15 formerly emitted additional details withheld, including height, site area, stories, commercial/parking program, amenities/design, developer/architect, acquisition price/date, filing and proposal history. The older 194-residence authored detail had already been suppressed by the count gate. Current city program lists 197; old 13th Floor material is not proof of the later Ross plan. |
| Floor-plan WebPage / CreativeWork `description` | Generic guide/drawing-reference description; bedroom, bathroom and square-foot metadata withheld pending latest drawing/area-definition verification. 94 discovery descriptions previously embedded physical figures. Archived drawings and visible artifact details remain available, qualified by request-current-documents guidance. |
| `CreativeWork` name/version/image/isBasedOn; `MediaObject` format/contentUrl/thumbnail/dateModified/description | First-party artifact manifest and supplied/released drawing references. Ten legacy and four additional reviewed creative works describe source files; ten 3D encodings explicitly identify illustrative derived visualization. Recorded artifact review/modification dates are not delivery dates or new offering revisions. No exact physical-room facts are generated from 3D models. |
| `FAQPage`, `Question`, `Answer` | Exactly seven reviewed advice answers retained by exact-text allowlist. Modified answers fail closed. Building comparisons, unsourced cost/pet/rental/fee policy, legal requirements, geographical superlatives and date assumptions are omitted from FAQ schema. Relevant visible buyer-guide copy also corrects stale Nora/Mandarin/Maison/Edgeworth timing, Shorecrest pricing, Forté inventory claims and Fern’s older count-bearing descriptions. |
| `Offer`, price, availability, sold/presold counts, loans, fee amounts | No offers, availability, live inventory, firm starting-price offers, new price/SF, presales availability, loan or HOA assertions are emitted. Qualified visible prices follow inspected primary marketing and request current terms. |
| WebSite, Organization, RealEstateAgent, Person, publisher, author, reviewedBy, telephone, sameAs, knowsAbout | Existing first-party site/team/about metadata and configured contact identity. These identify the editorial publisher, not developer endorsement or evidence that Brooke personally certified every new field today. Original bylines preserved. |
| WebPage, Article, BreadcrumbList, ItemList names/URLs/IDs/position/count/citation | Canonical route registry and displayed editorial/library resources. List counts count website items, not residences or sale inventory. Historical Article headlines/descriptions/publication/modification dates are preserved source snapshots. Comparison citation arrays remain source links, not independent verification of every possible project fact. |

## Final building facts actually emitted

A dash means the field is omitted, not zero, null, unknown inventory, or a negative claim. Values below are copied from final JSON-LD rather than inferred from the 384-slot review.

| Project | Residence total or qualified offering | Status / delivery text | Street address | Primary evidence / verification lead |
|---|---|---|---|---|
| The Berkeley Palm Beach | 193 | Under Construction | — | [Official source](https://www.theberkeleypalmbeach.com/) |
| 201 Arkona Court | — | — | 201 & 203 Arkona Court | [Official source](https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-agendas/2026-draft-city-commission-agendas/08-aug-2026-draft-cca/08_31_26_draft-city-commission-agenda.pdf) |
| Nora House | — | — | — | [Official source](https://norahouse.com/residences/) |
| Alba Reserve | — | — | — | [Official source](https://services1.arcgis.com/RTiKiFNGzgAobBzy/arcgis/rest/services/Citywide_Projects_For_Dash_Board/FeatureServer/0) |
| OLIN Palm Beach | 32 | Pre-Construction Sales | — | [Official source](https://www.okogroup.com/portfolio/olin) |
| Maison d’Or | 39 | — | — | [Official source](https://livemaisondor.com/) |
| Edgeworth | 184 marketed residences | Priority List Open / Preconstruction | — | [Official source](https://www.edgeworthwpb.com/) |
| Residences at 464 Fern Street | — | Proposed / Municipal Review | 464 Fern Street | [Official source](https://services1.arcgis.com/RTiKiFNGzgAobBzy/arcgis/rest/services/Citywide_Projects_For_Dash_Board/FeatureServer/0) |
| Forté on Flagler | — | Completed (developer-confirmed); Completed per developer; confirm residence-specific occupancy | — | [Official source](https://tworoadsre.com/) |
| 2085 North Flagler | — | — | — | [Official source](https://www.terragroup.com/) |
| The Sound Apartments | 358 | Under Construction | 8111 South Dixie Highway | [Official source](https://verdex.com/the-sound-apartments/) |
| 2001 North Flagler site (reported Rosewood association unconfirmed) | — | — | — | [Official source](https://relatedgroup.com/luxury-condominium/) |
| Rybovich Marina Redevelopment | — | — | — | [Official source](https://www.kpf.com/news/rybovich-marina-redevelopment-receives-initial-approval-in-florida) |
| Apogee Residences | — | — | — | [Official source](https://ulustudio.com/apogee/) |
| La Clara | — | Completed Comp; Opened in 2023 per Stantec; architect lists completion 2024; confirm occupancy history | — | [Official source](https://www.stantec.com/en/news/2023/stantec-designed-la-clara-condominiums-open-west-palm-beach-florida) |
| 3031 S. Ocean | — | — | — | [Official source](https://palmbeachfl.api.civicclerk.com/v1/Meetings/GetMeetingFileStream(fileId=15075,plainText=false)) |
| Shorecrest | — | Under Construction; 2027 anticipated completion (Apr 2026 developer target); confirm current schedule | — | [Official source](https://www.relatedross.com/press-releases/2026-04-03/related-ross-breaks-ground-shorecrest-ushering-new-chapter-west-palm) |
| Olara West Palm Beach | 275 condominium residences (project offering) | Under Construction; 2028 scheduled completion (official brochure); confirm current schedule | — | [Official source](https://www.olarawestpalmbeach.com/downloads/) |
| South Flagler House | 105 marketed residences; municipal count differs | Under Construction; 2027 scheduled delivery (Jun 2025 developer target); confirm current schedule | — | [Official source](https://www.southflaglerhouse.com/residences) |
| Mandarin Oriental Residences West Palm Beach | 87 branded residences (brand announcement) | 2031 anticipated opening (brand target); confirm current schedule | — | [Official source](https://press.mandarinoriental.com/residences-west-palm/?lang=eng) |
| Mr. C Residences West Palm Beach | 146 private residences (project fact sheet) | 2027 brand target; season and closing schedule to confirm | — | [Official source](https://www.mrcresidenceswpb.com/downloads/) |
| Alba Palm Beach | 55 | Completed (developer-reported); confirm occupancy; Completion announced June 2026; confirm residence-specific occupancy | 4714 N. Flagler Drive | [Official source](https://www.albapalmbeach.com/) |
| The Ritz-Carlton Residences, West Palm Beach | 138 | Under Construction; Q1 2028 developer target; confirm current schedule | — | [Official source](https://www.bhgroupmiami.com/projects/the-ritz-carlton-residences-at-west-palm-beach/) |
| Banyan Tree Residences West Palm Beach | 88 marketed residences (official fact sheet) | — | — | [Official source](https://news.groupbanyan.com/263640-banyan-group-enters-the-united-states-with-banyan-tree-residences-west-palm-beach/) |

Official pages were inspected October 9 UTC. Undated pages, CMS timestamps, filename months and search-index dates are not claimed as publication dates. The city dashboard’s shared October 2 import timestamp is not an approval/occupancy event. Full-page quotations and retrieval records remain private in `.runtime/`; specific public source URLs remain in the audit and paired override changelog.

## Material unresolved discrepancies

Shorecrest 98 in April release versus 100 in corporate/city material; Olara 275 condominium offering versus larger municipal program; SFH 105 versus municipal 109/older corporate 108; Mr. C 146 private plus 110 hotel versus municipal 210 multifamily/110 hotel and 25 versus marketed 27 stories; Nora marketed 117 versus municipal 122; Forté 41/42; La Clara 83/84 and 2023 opening/2024 architectural completion; Banyan 88/86 and 26/25 stories; Mandarin branded 87/31 versus city 97/32 with unconfirmed identity scope; Fern 197 municipal versus older 194 reporting; OLIN current 32 versus prior town-plan 41; Rybovich up to 660 full-buildout versus different municipal phase programs. Address, gallery, parcel and ZIP differences remain visible and held from exact-address schema where unresolved. No mathematical reconciliation is invented.

Final entries 19–24: **OLIN** current official 32, OMA/GACHOT, preconstruction, no supported public price/delivery; **3031 S. Ocean** 12-unit application and deferred/agenda records do not establish final approval, count/status/delivery held; **Apogee** city 46 approved versus older 39/21 stories, exact plan not reconciled; **Arkona** August agenda supports 201 & 203 court/easement action, not proposed tower approval/count/date; **2085 North Flagler** no inspected current Terra/BH primary plan resolves 281/two-tower/31-floor reporting; **The Sound** contractor/city 358 and construction at 8111 South Dixie, no primary completion target. These gaps are not release blockers because their unsupported claims are omitted.

## Retained FAQ schema

- What should I confirm before scheduling buyer appointment tours? — Confirm live availability, deposit structure, estimated monthly carrying costs, parking, storage, view premiums, completion timing, assignment or resale restrictions, included finishes, and whether the residence line you like is actually available. Public websites set the mood; the current sales packet tells you whether the opportunity still exists.
- How can I request current availability? — Use the inquiry page and name the buildings, corridors, budget range, timing, and whether you need floor plans or a sales-gallery visit. The Scott Gordon Group can help request current availability, pricing, floor-plan packets, view-stack context, and items to verify before you tour.
- What should be requested before touring? — Ask for current estimated monthly costs, reserves, parking/storage details, deposit schedule, and what services are included.
- How should buyers compare prices across the two markets? — Use price per square foot on comparable residence types, plus monthly fees and tax context, from current verified listings in each market — not press starting prices from one side.
- Which pages should buyers compare first? — Start with the corridor pages, the comparison page, and the individual project pages for the buildings that match the buyer's lifestyle lane.
- When should completed buildings be compared? — Use completed or recently delivered buildings as reality checks for finishes, fees, building operations, and resale alternatives.
- Which page should buyers use first? — Start with the floorplan library, then compare the project page and request the current buyer packet.

## Exhaustive emitted property paths

Object/array containers and primitive array entries are included. Counts combine static and captured client-navigation graphs; the linked JSON provides every exact emitted value and per-route context.

| Property path | Occurrences | Evidence class |
|---|---:|---|
| `@context` | 11 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `@id` | 1671 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `@type` | 1970 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `@type[]` | 8 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `additionalProperty` | 30 | Official building evidence / qualified decisions above |
| `additionalProperty[].@type` | 54 | Official building evidence / qualified decisions above |
| `additionalProperty[].name` | 54 | Official building evidence / qualified decisions above |
| `additionalProperty[].value` | 54 | Official building evidence / qualified decisions above |
| `address` | 159 | Official building evidence / qualified decisions above |
| `address.@type` | 159 | Official building evidence / qualified decisions above |
| `address.addressCountry` | 159 | Official building evidence / qualified decisions above |
| `address.addressLocality` | 159 | Official building evidence / qualified decisions above |
| `address.addressRegion` | 159 | Official building evidence / qualified decisions above |
| `address.streetAddress` | 8 | Official building evidence / qualified decisions above |
| `alternateName` | 312 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `areaServed` | 318 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `areaServed[]` | 16 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `articleSection` | 9 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `author` | 18 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `author.@id` | 18 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `breadcrumb` | 12 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `breadcrumb.@id` | 12 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `citation` | 2 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `citation[]` | 21 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `containedInPlace` | 48 | Official building evidence / qualified decisions above |
| `containedInPlace.@type` | 48 | Official building evidence / qualified decisions above |
| `containedInPlace.name` | 48 | Official building evidence / qualified decisions above |
| `dateModified` | 46 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `datePublished` | 18 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `description` | 677 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `encoding` | 8 | First-party artifact manifest / source drawing |
| `encoding[].@type` | 16 | First-party artifact manifest / source drawing |
| `encoding[].contentUrl` | 16 | First-party artifact manifest / source drawing |
| `encoding[].dateModified` | 8 | First-party artifact manifest / source drawing |
| `encoding[].description` | 8 | First-party artifact manifest / source drawing |
| `encoding[].encodingFormat` | 16 | First-party artifact manifest / source drawing |
| `encoding[].isBasedOn` | 8 | First-party artifact manifest / source drawing |
| `encoding[].name` | 8 | First-party artifact manifest / source drawing |
| `encoding[].thumbnailUrl` | 8 | First-party artifact manifest / source drawing |
| `headline` | 18 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `image` | 63 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `isBasedOn` | 8 | First-party artifact manifest / source drawing |
| `isPartOf` | 293 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `isPartOf.@id` | 293 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `isPartOf.@type` | 10 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `isPartOf.alternateName` | 10 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `isPartOf.name` | 10 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `isPartOf.url` | 10 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `itemListElement` | 342 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `itemListElement[].@type` | 1395 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `itemListElement[].item` | 926 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `itemListElement[].name` | 1395 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `itemListElement[].position` | 1395 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `itemListElement[].url` | 469 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `jobTitle` | 318 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `knowsAbout` | 8 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `knowsAbout[]` | 16 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `lastReviewed` | 18 | First-party artifact manifest / source drawing |
| `mainEntity` | 31 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `mainEntity.@id` | 20 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `mainEntity.@type` | 10 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `mainEntity.description` | 10 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `mainEntity.encoding` | 10 | First-party artifact manifest / source drawing |
| `mainEntity.encoding.@type` | 4 | First-party artifact manifest / source drawing |
| `mainEntity.encoding.contentUrl` | 4 | First-party artifact manifest / source drawing |
| `mainEntity.encoding.encodingFormat` | 4 | First-party artifact manifest / source drawing |
| `mainEntity.encoding[].@type` | 12 | First-party artifact manifest / source drawing |
| `mainEntity.encoding[].contentUrl` | 12 | First-party artifact manifest / source drawing |
| `mainEntity.encoding[].dateModified` | 6 | First-party artifact manifest / source drawing |
| `mainEntity.encoding[].description` | 6 | First-party artifact manifest / source drawing |
| `mainEntity.encoding[].encodingFormat` | 12 | First-party artifact manifest / source drawing |
| `mainEntity.encoding[].isBasedOn` | 6 | First-party artifact manifest / source drawing |
| `mainEntity.encoding[].name` | 6 | First-party artifact manifest / source drawing |
| `mainEntity.encoding[].thumbnailUrl` | 6 | First-party artifact manifest / source drawing |
| `mainEntity.image` | 10 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `mainEntity.isBasedOn` | 10 | First-party artifact manifest / source drawing |
| `mainEntity.name` | 10 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `mainEntity.version` | 10 | First-party artifact manifest / source drawing |
| `mainEntityOfPage` | 18 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `mainEntity[].@type` | 12 | Seven inspected advice answers |
| `mainEntity[].acceptedAnswer` | 12 | Seven inspected advice answers |
| `mainEntity[].acceptedAnswer.@type` | 12 | Seven inspected advice answers |
| `mainEntity[].acceptedAnswer.text` | 12 | Seven inspected advice answers |
| `mainEntity[].name` | 12 | Seven inspected advice answers |
| `name` | 1641 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `numberOfAccommodationUnits` | 12 | Official building evidence / qualified decisions above |
| `numberOfAccommodationUnits.@type` | 12 | Official building evidence / qualified decisions above |
| `numberOfAccommodationUnits.unitText` | 12 | Official building evidence / qualified decisions above |
| `numberOfAccommodationUnits.value` | 12 | Official building evidence / qualified decisions above |
| `numberOfItems` | 2 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `parentOrganization` | 310 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `parentOrganization.@id` | 310 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `publisher` | 450 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `publisher.@id` | 450 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `reviewedBy` | 281 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `reviewedBy.@id` | 281 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `sameAs` | 8 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `sameAs[]` | 8 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `subjectOf` | 48 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `subjectOf.@id` | 28 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `subjectOf[].@type` | 40 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `subjectOf[].name` | 40 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `subjectOf[].url` | 40 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `telephone` | 620 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `url` | 971 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `version` | 8 | First-party artifact manifest / source drawing |
| `worksFor` | 318 | Site identity, editorial artifact or route metadata; descriptions gated as above |
| `worksFor.@id` | 318 | Site identity, editorial artifact or route metadata; descriptions gated as above |

## Integration verification and release contract

Standard `npm run build` passed with valid JSON-LD and both postbuild regression tests. `npm test` passed 146 Node tests plus launch/no-write and gatekeeper QA; focused final building-reference tests pass 10/10; model/schema generator checks pass. Buyer-guide browser QA passes 37 checks; Chromium/WebKit desktop/mobile with JavaScript on/off and Compare checks pass 216/216. Client-navigation inventory is recorded separately in the JSON snapshot. Project-intelligence QA reports 120 advisory alignment items across the catalog (including intentionally held fields and missing Compare rows), not verified facts or failed build gates.

Source/generated boundaries remain unchanged: paired reviewed overrides/changelog, existing authored copy, existing Compare CSV, then model/schema/site generators. Unrelated generated image/PDF/sitemap churn is excluded from the commit. No unsupported Shorecrest zero/null, competing project database or historical-article rewrite was introduced. The exact release commit, push result, CI run, deployment and live checks are reported separately after publication, rather than claiming a prepared local build is live.

Weekly public-listing maintenance-fee research is scheduled as requested. The initial Zillow La Clara #801 observation is historical (sold November 2025; $5,055 monthly fee displayed, fee-as-of unknown); it is private unit-level evidence, not a current building-wide fee or schema value. Future observations preserve unit/date/source/frequency/uncertainty and cannot automatically publish.
