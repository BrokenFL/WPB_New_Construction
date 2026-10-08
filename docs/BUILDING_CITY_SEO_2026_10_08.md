# Building and city SEO — 2026-10-08

The reviewed public project model supplies each building's official identity and actual city. Authored metadata remains in `content/project-copy-package.json`. `shared/project-page-seo.mjs` now resolves the page title, description and building/city heading consistently for the browser renderer, site-intelligence generator and legacy project-guide enhancer. OLIN and 3031 S. Ocean remain Palm Beach island projects. Branded names such as Alba Palm Beach and The Berkeley Palm Beach retain their names and clarify their West Palm Beach location.

The 24 existing project routes retain their URLs and canonical identities. Pages use one semantic H1, natural city wording in substantive copy, and descriptive building-card links. NORA's established SEO title and meta description remain unchanged; its H1 is `NORA House West Palm Beach`, its overview identifies the NORA District in West Palm Beach, and its neighborhood heading is `Life in West Palm Beach's NORA District.` The existing NORA District article research block links back with a descriptive building/city anchor; the article snapshot itself is unchanged.

## Schema safety

Two postbuild transformations used JavaScript replacement strings containing serialized data. Dollar-prefixed prices such as `$2.5M` and `$20M` were interpreted as replacement tokens, injecting capture groups into Alba and OLIN JSON-LD. Both transformations now use replacement callbacks. The build and launch gates run `test:project-page-seo`, which parses every project schema, checks authored metadata/social/canonical/H1 parity, and exercises the actual postbuild transformations with literal dollar tokens.

Approximate NORA `from the low $2Ms` and Alba `just under $3M` guidance does not establish exact $2,000,000 or $3,000,000 Offers. Their exact Offer entries were removed from both rendering paths. Visible qualified guidance remains available. No canonical fact override, schema-safe approval, Compare data or historical article was changed.

## Source review

- [NORA House](https://norahouse.com/) and its [amenities page](https://norahouse.com/amenities/) support the condominium, West Palm Beach NORA District, released plans and rooftop amenity wording.
- [South Flagler House residences](https://www.southflaglerhouse.com/residences) and [amenities](https://www.southflaglerhouse.com/amenities) support the West Palm Beach waterfront setting, RAMSA/Pembrooke & Ives, residence tiers, loggias and private-club amenities.
- [Mr. C Residences West Palm Beach](https://www.mrcresidenceswpb.com/) supports its official name, Cipriani hospitality and downtown setting. The intro prompts buyers to clarify resident/hotel/shared services.
- [Alba Palm Beach](https://www.albapalmbeach.com/) continues to market residences and approximate pricing. The copy no longer asserts that all availability is resale-only.
- [OLIN Palm Beach](https://olinpalmbeach.com/) supports Palm Beach island, 32 residences, OMA, GACHOT, OKO Group and Cain. Inquiry budget choices are not residence asking prices; delivery guidance remains qualified.

The optional South Flagler historical-name FAQ was not added because the supplied city agenda could not be reliably re-read. No new official-name claim was introduced.

## Local validation and release boundary

Work began on clean `main` at `2371dda51d199335adce0ffbf90408bc8c13e458`, with the required BrokenFL/WPB_New_Construction remote. A fresh fetch and independent remote-main check still matched that base before release preparation. Codebase Memory MCP was unavailable in this environment; direct source, generator and dependency reads confirmed the architecture boundaries.

Typecheck, build/postbuild, full `QA_NO_WRITE=1 npm test`, launch QA and gatekeeper passed. Chromium and WebKit checked all 24 pages on desktop/mobile and with JavaScript disabled: 152 checks passed, including metadata/schema/canonical parity, one H1, descriptive directory links, browser Back and no horizontal overflow or page errors. Screenshots were reviewed locally. The asset audit found zero blockers, broken references or local path leaks, with existing warnings retained.

The optional legacy `qa:project-seo-batch4` progressed through static/schema checks, then failed its old uniform CTA expectation for Alba: the unchanged source link requests current resale listings rather than the test's expected current availability. This is outside the SEO change; request-intent behavior and the assertion were preserved. Required release gates passed.

Evidence stays ignored under `.runtime/building-city-seo-*.log` and `output/playwright/building-city-seo/`. Source edits, generated copy/discovery outputs and this contract record are intended changes; there are no unrelated tracked edits, runtime reports or assets to stage.

Publishing uses the existing push-to-main Cloudflare Pages workflow after authorized commit/push. A Git commit, successful push, CI/deploy success, exact production bundle and Search Console indexing request are separate states. Final deployment and indexing outcomes must be independently recorded at handoff; this document alone does not assert publication or indexing.
