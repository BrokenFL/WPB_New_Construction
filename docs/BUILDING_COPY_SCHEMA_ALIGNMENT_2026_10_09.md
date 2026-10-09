# Building copy and schema alignment — October 9, 2026

Brooke authorized correcting the remaining building copy/schema differences using the strongest field-specific evidence and publishing the correction. This follow-up starts from `main` at `8e7d3602cffcce775bdc9b851346c0ef48bd0319`. It preserves the earlier official-source audit, JSON-LD safeguards and published Vanderbilt article.

## Field decisions

| Project / field | Correction and evidence scope |
| --- | --- |
| Maison d’Or / delivery | Remove the reported late-2028 target from summary, card fallback, sort year and delivery guide. Current primary delivery guidance is required; no replacement date is invented. [Official project website](https://livemaisondor.com/) did not substantiate a current delivery target in this review. |
| 3031 S. Ocean / approval status | Use proposed redevelopment with architectural approval recorded and final Town Council zoning approval to confirm. [Application agenda, file 15075](https://palmbeachfl.api.civicclerk.com/v1/Meetings/GetMeetingFileStream(fileId=15075,plainText=false)) describes the five-story, 12-unit application. [Architectural Commission minutes, file 15185](https://palmbeachfl.api.civicclerk.com/v1/Meetings/GetMeetingFileStream(fileId=15185,plainText=false)), pages 3–6, record design approval. Architectural review does not independently prove the final zoning decision or permits. Secondary April approval reporting was located, but a final primary Town Council zoning decision was not verified in this bounded review. Status remains `schemaSafe: false`; address/count/approval holds remain. The showcase intro and sales-stage tag preserve the same limits. |
| Berkeley / address scope | Show the official marketed residence site, **550 S. Australian Avenue**, separately from the sales gallery, **500 S. Australian Avenue, Suite 910**, as labeled by the [official website](https://www.theberkeleypalmbeach.com/). Municipal Clearwater Park Road references describe a different address scope; legal address confirmation remains required and the schema address stays held. |
| Shorecrest / Compare trade-offs | Replace stale “still pre-construction” wording with under construction after the April 2026 groundbreaking and qualified anticipated 2027 completion, supported by [Related Ross’s April 3 release](https://www.relatedross.com/press-releases/2026-04-03/related-ross-breaks-ground-shorecrest-ushering-new-chapter-west-palm). The 98-versus-100 program conflict stays qualified and the disputed schema total stays held. |
| Olara / landscape and storage | Attribute EDSA and advertised 5-by-5-foot climate-controlled storage to the [official March 2026 fact sheet](https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Olara-Fact-Sheet-March-2026-2.pdf), pages 4 and 2 respectively. The statement does not establish per-residence allocation, conveyance, ownership/use rights or charges; Compare explicitly asks buyers to confirm these. No new storage or team schema properties are introduced. |
| Mandarin Oriental / delivery presentation | Replace header “To confirm” with **2031 anticipated opening (brand target); confirm current schedule**, consistent with the existing reviewed model and safe schema, supported by the [brand announcement](https://press.mandarinoriental.com/residences-west-palm/?lang=eng). The summary, sorting guidance and buyer read preserve the target qualification. |

The showcase renderer now resolves Delivery tags and Delivery fact-strip values through the same reviewed field resolver already used by the overview. Status continues using that resolver. This prevents stale showcase configuration from overriding approved delivery guidance.

Visual inspection also found an existing `white-space: nowrap` mobile override clipping 3031’s title. The project-specific mobile override now allows wrapping; the stylesheet version changes so clients receive the correction. Image selection and page layout are unchanged. Browser verification checks the visible heading bounds as well as document overflow.

## Pipeline and boundaries

Authoritative edits are limited to the existing page overlays, copy package, building comparison CSV, paired fact override/change log and presentation code. Outputs were regenerated with the existing model, comparison and site-intelligence generators. Generated files were not hand-edited. No parallel project database or article pipeline was created.

The schema-safe projection remains 24 projects, four emitted addresses and 59 omitted fields. Qualified totals/delivery are unchanged, including Olara 275 / 2028, Ritz-Carlton 138 / Q1 2028, South Flagler House 105 / 2027 and Mandarin Oriental 87 / anticipated 2031. South Flagler House retains the scoped Signature residence marketing guidance from $7.98M. No purchasable price Offers, availability counts, exact completion dates or building-wide HOA claims were added.

The supplied “Status (Sep 21)” table still lacks a year and source URL; its dated-reference provenance remains preserved by the earlier audit. Unknown provenance and stronger primary source conflicts were not silently promoted to current inventory.

The generator rewrote 23 image derivatives and sitemap lastmod dates without changing routes. Those verified side effects were backed up privately and restored from the clean base; they are excluded from this content release. Historical articles, CRM Space, automations, private evidence and other checkouts were untouched.

Codebase-memory MCP was not callable in this execution environment. Direct code, source boundary, dependency and generated-output inspection confirmed the pipeline.

## Validation

- `npm test`: passed, including the no-write launch QA and gatekeeper gates.
- Typecheck and production build/postbuild: passed. The final copy adjustment was rebuilt and the focused regression tests rerun.
- `qa:project-model` and `qa:project-schema-safe`: passed; safe projection totals above unchanged.
- `test:building-reference`: 11 passed, including regression coverage for these six residual differences and 3031’s alternate showcase intro.
- Asset audit: no blockers, broken references or local-path leaks; 435 existing advisory warnings.
- `qa:project-intelligence`: exited successfully and reports **121 open catalog review items** (89 priority 1, nine priority 2, seven missing comparison rows). This diagnostic is not a clean factual audit and does not authorize any held claim.
- Local production preview: all **161 audited static routes** returned HTTP 200 and valid JSON-LD identical to the prior inspected graph inventory. No Offer/availability properties were revived.
- Real browser: **16 project desktop/mobile views** and **eight additional checks** passed, covering Compare’s Olara/Shorecrest fields, client navigation/schema, both affected buyer guides, Maison’s building card and the preserved Vanderbilt article. One visible H1, no horizontal overflow or JavaScript page errors on the checked project views. Mandarin and 3031 screenshots were inspected privately.

Runtime QA logs, downloaded source PDFs, screenshots and release verification evidence remain ignored artifacts; they are not part of the public website or tracked source package. Deployment and live verification must be confirmed separately from these preparation checks.
