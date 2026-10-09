# Private building-reference editorial review — 2026-10-08

**Historical preparation snapshot.** See [the complete October 9 emitted-schema audit](BUILDING_SCHEMA_PROPERTY_AUDIT_2026_10_09.md) for final source decisions, schema coverage and subsequent publication authorization.

For the later all-24-profile review, final validation and the separately authorized Vanderbilt release blocker, see [Building/schema review handoff](BUILDING_SCHEMA_REVIEW_2026_10_08.md). The validation below records the earlier clean nine-profile revision.

This is a repository editorial record, not buyer-facing content or a competing project database. Brooke supplied a table headed **Status (Sep 21)** with no year or source URL. The parent is requesting its original URL. September 21 is not an ISO as-of date; October 8 is intake/review context, not proof of current inventory. Brooke clarified Trophy means **South Flagler**.

The first local intake revision exposed reference blocks on public project pages. That approach was superseded before any commit, push or deployment. The clean revision removes those blocks, their renderer/projection, table-derived mutable winners and reference wording from public copy, generated public data and JSON-LD. This file preserves the original table and decision history privately.

## Original supplied table

| Building | Location | Units | Entry/range | Price/SF | Status reference | Delivery reference |
|---|---|---:|---|---|---|---|
| Mr. C Residences | Downtown | 146 | $1.6M | Approximately $1,100 | 16 of 27 floors; 85%+ sold | 2027 |
| Olara | North Flagler | 275 | Approximately $2M | On request | Vertical; $175M presold | Q4 2026–27 |
| South Flagler House | South Flagler | 108 | $5.9M–$70M+ | On request | Topped out November 2025 | Late 2026–27 |
| Ritz-Carlton Residences West Palm Beach | North Flagler (Northwood) | 138 | Approximately $3M | Approximately $1,600 | Broke ground March 2026; $200M loan | 2028 |
| Maison d’Or South Flagler | South Flagler | 39 | $5.8M–$15M | On request | Selling | 2028 |
| Shorecrest | WPB | Unspecified | $2.7M+ | Unspecified | Broke ground April 2026 | 2027 |
| Banyan Tree Residences | Downtown | 88 | $1.8M | Approximately $1,200 | Selling | 2029 |
| Edgeworth | South Flagler | 190 | $5.3M–$35.5M | On request | Selling | 2029 |
| Mandarin Oriental Residences | North Flagler | 87 | $3.9M | Approximately $1,800 | Selling | 2030 |


## Final clean public treatment

- **Edgeworth:** current official website checked during this task lists 184 residences, two- to four-bedroom homes advertised from $5.5M and priority-list inquiries. The clean shared display uses **184**, **from $5.5M; request current pricing**, and **Priority List Open / Preconstruction**. This replaces stale 168 and legacy price ranges. The pre-existing authored **2029 projected** timing remains qualified with a schedule-confirmation request; it is not a newly verified completion date and stays out of schema. [Official source](https://www.edgeworthwpb.com/), undated page checked 2026-10-08. Published starting guidance is not a live inventory quote or an exact Offer.
- **South Flagler House:** retain the existing 105-on-project-site / 108-on-Related-Ross count note, $7.98M advertised Signature tier and current-delivery-confirmation copy. The November 2025 top-out has independent primary support and appears as ordinary construction context in public copy and Compare. [RAMSA announcement](https://www.ramsa.com/news/article/south-flagler-house-tops-out-west-palm-beach), published 2025-11-25. Its historical 109 count does not settle current counts. [Project residences](https://www.southflaglerhouse.com/residences) and [Related Ross](https://www.relatedross.com/our-company/properties/south-flagler-house) retain their differing current totals.
- **Olara:** retain official $1.7M starting guidance, 275 residences and existing 2028 timing. [Official homepage](https://www.olarawestpalmbeach.com/) supports $1.7M. The existing catalog records [March 2026 official brochure](https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/RackBrochure_Digital_032026.pdf) support for 2028; no new timing freshness is claimed.
- **Maison d’Or:** retain 39, preconstruction sales, official $5.7M starting guidance and previously qualified late-2028 target. [Official homepage](https://livemaisondor.com/) supports 39/$5.7M. Existing copy mentions a $39.7M penthouse in August 2026, but its specific supporting URL is not preserved in that record; it is prior context, not newly verified evidence.
- **Shorecrest:** retain North Flagler and 98-earlier / 100-Related-Ross count note. Restore **request current pricing** and **request current delivery guidance**. The unavailable old floorplan URL does not support a current $3.69M price; that historic comparison stays in this private record. [Related Ross](https://www.relatedross.com/our-company/properties/shorecrest) lists 100.
- **Mr. C:** retain 146, under-construction status, current-pricing request and qualified timing-to-confirm language; no table-only numeric entry or schedule is substituted.
- **Ritz-Carlton:** retain 138, under construction, current-pricing request and existing **2028 estimate; confirm current schedule**.
- **Banyan Tree:** retain 88, existing sales-open/preconstruction status and pricing/delivery confirmation requests.
- **Mandarin Oriental:** retain 87, previously reviewed authored Sales Open status, qualified $3.5M broker-published starting guidance and timing-to-confirm language. The older generated announced-stage status is aligned with that existing reviewed copy; no specific residence availability is inferred.

All nine public model/quick-fact/Compare winners agree. South Flagler terminology, verified addresses and coordinates are preserved. Other CSV rows retain their values; line endings are normalized to LF. Historical articles/source catalogs are unchanged.

## Exactly which table-only changes remain held

| Building | Held pending original URL / stronger field evidence |
|---|---|
| Mr. C | $1.6M entry; approximately $1,100/SF; 16 of 27 floors; 85%+ sold; a newly adopted 2027 delivery claim |
| Olara | Approximately $2M entry; vertical-progress wording and $175M presold as a new current update; Q4 2026–27 delivery replacing 2028 |
| South Flagler House | Choosing 108 as the sole current total; $5.9M–$70M+ as current pricing; late-2026–27 delivery. November-2025 top-out is independently corroborated and retained. |
| Ritz-Carlton | Approximately $3M entry; approximately $1,600/SF; March-2026 groundbreaking and $200M loan as new current updates; unverified Northwood location qualifier. Existing qualified 2028 estimate is retained independently of the table. |
| Maison d’Or | $5.8M–$15M as current range/maximum. Existing 39, sales status and qualified late-2028 target remain. |
| Shorecrest | $2.7M+ entry; April-2026 groundbreaking as a new update; adopting 2027 delivery. Unspecified count does not erase existing reviewed data, and broad WPB does not replace North Flagler. |
| Banyan Tree | $1.8M entry; approximately $1,200/SF; adopting 2029 delivery. Existing sales status remains. |
| Edgeworth | 190 total; $5.3M–$35.5M range; upgrading priority-list context to current selling based only on this table. Existing qualified 2029 projection is retained, with no table-derived firm date. |
| Mandarin Oriental | $3.9M entry; approximately $1,800/SF; adopting 2030 delivery. Existing reviewed sales status remains. |

The table's unspecified/on-request $/SF fields are not new public fields. No table-only $/SF, sold percentage, presale amount, loan, floor-progress statement, range comparison or source/year disclaimer remains in public output or schema.

## Source limitations and corrections

Official checks are field-specific, not blanket verification. Undated-page check dates are not publication dates. The pre-existing Olara automated override's July 2026 metadata/source label does not match its December 2025 Florida YIMBY URL; retain the existing qualified 2028 value with recorded primary-brochure support rather than treating that inconsistent metadata as a new verification. Conflicting counts remain unresolved and omitted from numeric schema where appropriate.

The earlier draft report mistyped Edgeworth's old authored $2.5M–$35.5M range as $2.5M–$3.5M. Shorecrest's pre-edit reviewed visible copy already requested current pricing; $3.69M came from legacy floorplan/model/Offer data, not a verified current quote. Both distinctions are preserved here.

## Pipeline/schema improvements retained

The generator now applies manual reviewed overrides before automated/canonical/fallback fields, matching shared field accessors. Compare and showcase primary facts consult those reviewed values; meaningful numeric guidance is not hidden merely because it ends with a current-pricing request. Existing Alba and Fern override files are unchanged; generated provenance now consistently records their already-effective manual precedence.

The shared schema helper emits an approved unambiguous total as a `QuantitativeValue`, never available inventory. Edgeworth's official 184 total is approved for this scoped schema update. Status/qualified guidance use supported `PropertyValue` text only when schema-safe; this revision adds no table-only delivery schema. Existing gates still omit unresolved fields/counts. Unsupported raw project-entity fields and reference-project starting-price Offers are removed in browser/static renderers. NORA/Alba Offer omission and literal-dollar JSON-LD fixes from deployed `5b0f240933392471ba909d40db6bc120dc520005` remain intact.

## Repository state and verification

Work is local on `codex/sep21-building-reference`, based on exact HEAD `5b0f240933392471ba909d40db6bc120dc520005`. Remote origin is `BrokenFL/WPB_New_Construction`; refreshed origin/main matches that HEAD. The checkout initially had no unrelated edits; the clean revision edits only this task's work. No commit, push, CI run, merge, deploy, CRM edit, messaging or intelligence-automation activation has occurred.

Generators are the only editors of generated model/database/schema/public-copy/site-data outputs. Unrelated generated image exports, the unchanged Alba PDF and floorplan-only sitemap freshness churn are restored byte-for-byte from HEAD; no asset change is part of this revision. Runtime evidence is ignored under `.runtime/building-reference/` and `output/playwright/building-reference/`. Codebase Memory exposed no usable checkout index, and direct source reads established the pipeline. The installed Playwright runtime supplies local browser QA.

Final clean-revision results are appended after validation. Publication remains pending explicit authorization. The private table intake and held fields need the original table URL or a specific field decision before a later public change.


## Final clean-revision validation

- `npm run build`: passed TypeScript, Vite, all static route generators and both SEO regression tests across 24 project routes. Literal-dollar JSON-LD and NORA/Alba Offer omission remain protected.
- New intake regression tests: 5 passed. They check public/private projection separation, shared display parity, held mutable values, current Edgeworth facts, JSON-LD parsing and schema gates.
- `qa:project-model` / `qa:project-schema-safe`: passed, 24 projects checked, 66 unsafe/unresolved fields omitted.
- Local browser checks: 84 project/Compare checks plus 32 homepage/directory/affected-answer checks passed in Chromium and WebKit at desktop/mobile widths, with JavaScript enabled/disabled where relevant. Private reference blocks/wording and unsupported presale/loan/floor-progress details are absent. Confirmed valid JSON-LD, count gates, no starting-price Offers for the nine projects, one visible H1 and no overflow/browser errors. Representative clean project screenshots were visually inspected under `output/playwright/building-clean/`.
- A final Edgeworth Strongest Compare Points paragraph was corrected from stale 168/one-to-five/old pricing to 184/two-to-four/current published $5.5M guidance. After rebuilding, four additional desktop/mobile Chromium/WebKit Compare checks passed. Total local browser checks: **120/120**.
- `qa:project-intelligence`: advisory review queue now has 96 issues (71 priority 1, 2 priority 2), seven missing compare rows, zero missing source mappings. These unresolved broader issues are not claimed resolved by this task.
- `git diff --check`: passed. Exactly five of the nine selected CSV rows have changed values; other row values remain unchanged, with LF line-ending normalization.

Final scope is 24 uncommitted files: 20 modified tracked files and four new files. Source/code/editorial files are the four edited `content/` files, `package.json`, `src/main.ts`, `src/data/projectCardData.ts`, three edited research scripts (model generation, static rendering, resolver fixtures), the new building-reference regression test, two shared schema helper files and this private report. Generated outputs are public copy JSON and nine `src/generated/` model/database/schema/site-data files. The public reference renderer/type/projection, sorting-year changes and reference-only layout changes are removed from the diff. Nothing is staged; no release or CRM action occurred.

Final `npm test` rerun after the Compare correction completed successfully: **141 Node tests passed, zero failures**, followed by the full `qa:launch:no-write` chain and gatekeeper. No implementation blocker remains; held table-only facts and publication await the separate source/authorization decision.
