# Incremental reviewed building-fact releases

Release owner: this existing WPB building/schema Codex task, in the authorized Mac mini checkout `/Volumes/ExternalSSD/WPB_NewConstruction`. The recurring fact checker should send newly supported claims and source links to this owner and follow this procedure. It must not create a second schedule or release owner.

Brooke's November 5, 2026 instruction authorizes verified routine building information to reach current profiles, schema and corresponding factual surfaces through publication. Routine supported corrections do not need another approval. This does not activate P2 shadow mutations, disable Fast Cycle's manual-override guard, authorize unverified overwrites, promote held schema fields, change article policy or schedules, or override a pinned user decision. If the computer, checkout, network or existing authorization is unavailable, report the pending state and exact blocker; do not claim publication or acquire access.

## Review and edit

1. Read `AGENTS.md` and both project guides. Verify remote, main, clean/known work, fetch, and compare `HEAD` with `origin/main`. Coordinate exclusive use of the checkout. Preserve unrelated work and all later releases.
2. Open the actual source and current live page/schema. Save private snapshots in `.runtime/`; record URL, retrieval time/hash, exact claim scope, event date, publication date and target date separately. An undated sponsor page has no invented publication/event date. A historical application, municipal easement, sales inquiry, related-project card or unit listing does not establish current inventory, building-wide fees, permits, delivery certainty or brand confirmation.
3. Compare with the current winning reviewed value and reason. Apply supported independent corrections; record genuine conflicts and missing evidence in the unresolved queue. Do not block another supported field. If nothing changed semantically, do not rewrite review dates, logs or metadata and do not commit/deploy.
4. Edit the existing canonical snapshot, appropriate reviewed override and paired `content/overrides/change-log.json`, Compare CSV, copy package and presentation overlay. Use the current identity aliases; preserve routes and project IDs. Check current guides, map/card titles, adjacent-site references and floor-plan context for authored factual claims. Historical articles and dated research notes remain snapshots.
5. Update stale winning overrides after the source review; a lower-priority automated value cannot supersede them. Record the reviewer as Codex under the standing instruction, never impersonate a new personal review by Brooke. Preserve existing `schemaSafe` authority and hold reasons. Newly resolving one scope does not resolve a different held field. An explicit pinned user decision or genuine source contradiction stays held and is reported.

## Regenerate and verify

```bash
npm run facts:refresh -- --projects=ritz-carlton-wpb,rosewood-residences-west-palm-beach,201-arkona-court
npm run facts:check -- --projects=ritz-carlton-wpb,rosewood-residences-west-palm-beach,201-arkona-court
npm run typecheck
npm run build
npm test
QA_NO_WRITE=1 npm run assets:audit
```

`facts:refresh` is the repeatable incremental entry point. Supply only the reviewed **public slugs** for that run; the example lists this release's three projects. Missing scope fails closed. It validates the canonical snapshot and runs the existing model, Compare, schema-safe, site-fact projection and public-copy generators. The site-fact projection replaces only selected rows, preserving other curated summaries and pinned copy. It does not apply scraped values or publish. It avoids the full media/news/sitemap generator and its unrelated image churn. It snapshots the ten generated consumers, restores those exact working bytes on a generator failure, and leaves reviewed source edits available for correction. `facts:check` temporarily regenerates and restores outputs, exits nonzero if stale, and reports `no-change` when current. Do not run either concurrently with another release. Reports live only in `.runtime/reviewed-building-facts/`.

The schema projection uses the same resolver and independent safety gates as before. The existing P2 projection now tolerates intervening generated exports and accepts the owner's explicit scope; it still preserves literal dollar values/URLs. No Fast Cycle safety policy or manual precedence changed. Interrupted runs remain pending until complete regeneration and validation; never publish partial outputs.

If the local Vite config bundler stalls before its startup banner, stop only this task's build process and preserve its log; the documented `npm run build -- --configLoader runner` loader is a local workaround. It does not change repository build/deploy configuration. The existing standard CI build must still pass before live success is reported.

Before release, inspect every diff and classify source/code, generated outputs, evidence/docs and unrelated files. Assert unchanged identities, pinned values, other projects, fees/policies and historical articles. Test changed factual values in actual static HTML and JSON-LD, fresh desktop/mobile browser loads and client navigation. Check relevant cards, Compare, map, corridor/current buyer guides and floor-plan project context. JSON-LD must parse, match the supported scoped values and preserve qualified omissions; no exact-price Offers or availability may be inferred. Document checks not run.

## Publish and prove

Use the existing release path: stage only the reviewed scope, commit, push `main`, and monitor `deploy-cloudflare-pages.yml` for that exact SHA. Do not add a new publishing pipeline or alter deployment permissions. Confirm the real Cloudflare deploy step and new deployment URL, then run `npm run qa:live` and read the affected live pages, client navigation and JSON-LD again against the tested build. A successful push or HTTP 200 alone is insufficient.

Record separate states: **reviewed source edit → generated/prepared → tested → committed → remote push verified → exact-SHA deployment succeeded → live readback verified**. Report live success only at the last state; otherwise identify the precise completed and pending stages. Save the final SHA, remote ref, CI URL, deployment URL, live values/holds, test results and clean status in the release evidence. Preserve the unresolved queue for the next run.

If a released correction needs rollback, inspect later work first and prepare a focused corrective/revert commit for this release's exact paths and values, regenerate, test, publish and verify it through the same path. Never reset/force-push, revert unrelated changes or assume restoring a local file rolls back production. Source review records and Git history retain previous values and their reasons.
