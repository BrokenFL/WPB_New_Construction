# October 10 building copy and schema corrections

Prepared from synchronized, clean `main` at `20bf495e1d003bf005f20fccd1290ccf273a519d` in the SSD checkout. Brooke explicitly approved these eight corrections and publication on October 10: “Ok for the new verified facts make them live.” Earlier SEO/schema fixes and the previously published articles remain intact.

## Corrected fields and source limits

| Building | Correction | Qualification retained |
|---|---|---|
| The Sound | Studios through three bedrooms; **520 Gregory Road** residential/leasing address; **open/leasing, operator-reported and checked October 10**. Catalog, brochure and JSON-LD use the same reviewed address/status. | **8111 South Dixie Highway** remains older construction/retail context. The existing **358** total describes the construction program, not available apartments. No CO, exact opening date, completion of every component, available-unit count or rent Offer is inferred. |
| OLIN | Remove inquiry choices from actual-price implications in buyer take, comparison text and confidence notes. | “Residence Type” selections of Up to $20M, Up to $30M and Over $40M are inquiry preferences; obtain residence-specific pricing. Price remains absent from schema. |
| Rybovich | Add the Commission’s **November 10, 2025** approval of a **259-unit Level III site plan for PBAs 4, 8, 9 and 10**, reported November 12. | This decision does not establish approval of the full 660-home concept or reconcile the city map’s 291-unit program. Whole-project status/count schema holds remain. |
| Alba | Remove resale-driven and guaranteed timing implications. State that the developer’s completion announcement was dated **June 25, 2026**; confirm current developer/resale options and residence-specific occupancy. | The current inquiry path and advertised guidance from just under $3M do not establish live inventory. The historical 95% sold announcement is not a current unsold count or sellout. |
| Banyan Tree | Replace unqualified 25-story display with **26 marketed stories; earlier municipal record 25 floors**, including Compare and canonical source data. | Official marketing’s **88 residences** remains distinct from the earlier municipal **86-unit** program. No numeric floor count or physical details are added to schema. |
| Forté | Remove the shared completed-building template’s categorical exclusion of developer inventory; broaden collection and buyer guidance to confirm developer/resale options. | Developer reports completion; the contact page still mixes sales inquiries with stale construction language. Neither proves available units or sellout. Existing count/height conflicts remain held. |
| Apogee | Qualify architect attribution in catalog, team credits and copy; date the **21-story/235-foot** context to the **September 29, 2025 city agenda**. | Prior review names Sieger Suarez, while the undated ULU schematic-design page credits Arquitectonica. No definitive replacement or current final height is asserted; 39/46-unit conflict remains. |
| 2001 North Flagler | Use a qualified site name and status: **reported Rosewood association unconfirmed**. Align headings, cards, Compare, adjacent-site copy and buyer guides with the already qualified Place schema. | Related’s current Rosewood portfolio entry is **Hillsboro Beach**. That entry and municipal site decisions do not establish a West Palm Beach branded offering. Existing route/aliases are preserved. |

## Primary evidence checked October 10

- The Sound: [operator homepage](https://thesoundwpb.com/) and [Now Open / leasing map](https://thesoundwpb.com/sightmap/).
- OLIN: [official inquiry form](https://olinpalmbeach.com/), inspected without submission.
- Rybovich: [city decision summary published November 12, 2025](https://www.wpb.org/News-Folder/News-2025/111225-Mayor-CCCRA-Approvals-and-Decisions). The city page loaded in an ordinary browser when the text fetcher returned 403; no authentication or access restriction was bypassed.
- Alba: [current official site](https://www.albapalmbeach.com/) and [June 25 completion announcement](https://www.albapalmbeach.com/press/alba-palm-beach-completed-along-west-palm-beachs-billionaires-corridor-waterfront-at-95-sold).
- Banyan Tree: [official fact sheet](https://www.banyantreeresidenceswpb.com/wp-content/uploads/2026/06/BanyanTreeWPB_FactSheet.pdf), text and rendered second page inspected. Filename month is not treated as publication date.
- Forté: [Two Roads developer site](https://tworoadsre.com/) and [project contact page](https://fortewpb.com/contact/).
- Apogee: [ULU schematic credits](https://ulustudio.com/apogee/) and [September 29, 2025 city agenda, pages 27–28](https://www.wpb.org/files/assets/city/v/2/city-clerk/documents/agendas/2025-pass-fail-agendas-pfa/2025-09-sep-pfa/pf-city-commission-agenda_9_29_25.pdf).
- Reported Rosewood association: [Related condominium portfolio](https://relatedgroup.com/luxury-condominium/), rendered portfolio inspected. Lack of WPB confirmation is preserved as uncertainty, not proof an association is impossible.

Undated webpages are retrieval checks, not new event dates. Actual served baseline copy and JSON-LD were captured for all eight profiles before editing. Evidence, PDFs, logs, full schema graphs and screenshots remain in ignored `.runtime/verified-building-corrections-2026-10-10/` and `output/playwright/building-corrections-2026-10-10/`.

## Pipeline and verification

Existing canonical snapshot, paired overrides/changelog, presentation overlays, copy package and five existing Compare rows were edited. Existing repository generators produced their public consumers. The rental bedroom fallback now reads canonical residence-feature wording; missing ranges ask for layouts. Story formatting preserves municipal qualifications. The existing reviewed-name projection is explicitly allowed by public-data QA. Source captions use the fact revision date and identify it as a revision, rather than blanket verification of every fact. Supplementary buyer summaries consume the reviewed status instead of stale approval labels.

No alternative project database was created. Historical articles, HOA values, policies, residence-count source columns, CRM pages, schedules, publication permissions, asset warehouse and deployment configuration are unchanged. The generator’s 23 JPEG derivative changes and date-only sitemap churn were verified and restored to baseline. Codebase-memory tools were unavailable; direct source tracing and repository checks confirmed the architecture.

- Typecheck and production build passed, including postbuild SEO/JSON-LD regressions.
- Full `npm test` passed **150 Node tests**, plus the complete launch QA and gatekeeper chain.
- Asset audit passed with zero broken public asset references; project model and schema freshness checks passed for **24 profiles**, **4 emitted addresses**, and **59 held fields**.
- All **161 audited static-route JSON-LD graphs** parse; no marketing Offers, availability or available-unit counts are emitted.
- **32/32 Chromium/WebKit desktop/mobile checks** passed for the eight corrected profiles, plus **14/14 checks** covering the affected guides, Compare, building cards, adjacent 2085 site and shared completed-building behavior. Mobile visual review confirmed the qualified site/approval text. Release/live proof is recorded in the task handoff and ignored evidence files.
- Project-intelligence QA remains advisory: **124 items**, including **91 priority 1**, **9 priority 2**, **7 missing Compare rows**, and existing source-catalog gaps. Passing tests do not resolve those source conflicts.

Publication uses the existing push-to-main Cloudflare workflow under the explicit approval above. The final task handoff records the exact release commit, remote ref, CI/deployment and fresh live checks separately.
