# Project Intelligence Architecture

This note captures the current Phase 1 source-of-truth layout for public project identity, source-catalog facts, compare/building intelligence, and the shared resolver that ties them together.

## Current Strategy

- Public project identity is the public route layer: display name, route slug, corridor, public status, delivery text, residence count, and public address.
- Source-catalog facts remain the caveat and review layer: source-derived facts, conflicts, gaps, review notes, and source counts.
- The compare/building database is the enriched buyer-intelligence layer: amenities, services, parking, storage, pets, rentals, fees, delivery detail, and comparison fields.
- The site should read these layers through one shared resolver so conflicts stay visible instead of being silently overwritten.

## Shared Files

- `src/lib/projectIntelligenceRegistry.ts`
- `src/lib/projectIntelligence.ts`
- `src/lib/buildingDatabase.ts`
- `src/main.ts`

## Registry And Resolver

The registry now records, per public project:

- public slug and public route
- public display name
- corridor
- public status
- public delivery
- public residence count
- public address
- source-catalog ID(s)
- compare database ID and slug where available
- alternate aliases used across source, compare, and public lookups
- collapsed source-catalog records where a public page intentionally merges split source entries

The resolver returns a merged object with:

- public identity
- source-catalog summary
- compare row, when present
- related news and market-note matches
- conflict flags
- missing-data flags
- schema-safe facts and review fields

## What Is Now Connected

- `src/main.ts` now resolves source-catalog IDs through the shared registry instead of a separate one-off alias map.
- `src/lib/buildingDatabase.ts` now resolves compare aliases through the shared registry.
- `research/scripts/check-project-intelligence.ts` now reads the same registry and resolver output for a warning-only alignment audit.

## Known Review Items

These are the current high-signal conflicts or gaps surfaced by the resolver.

### Conflicts Requiring Human Review

- `olara`: public residence count and delivery timing do not match the compare row.
- `banyan-tree`: public delivery timing does not match the compare row.
- `alba-palm-beach`: public status and compare status diverge.

### Public Projects Without Compare Rows

- `alba-reserve`
- `fern-and-gardenia-related-ross-fern-street`
- `rybovich-marina-redevelopment`

### Source-Catalog Gap

- `rosewood-residences-west-palm-beach` is present as a public project, but the current resolver still cannot find a matching source-catalog fact record. Keep it in review mode until the source layer is restored or renamed.

### Split Source Records Intentionally Collapsed

- `south-flagler-house-north` and `south-flagler-house-south` collapse into the public `south-flagler-house` page.
- `edgeworth-north` and `edgeworth-south` collapse into the public `edgeworth` page.
- `rybovich-marina` remains the source-catalog ID behind the public `rybovich-marina-redevelopment` page.

## Schema Safety

Safe for future JSON-LD generation when no conflict exists:

- name
- route
- corridor
- address
- public status
- delivery
- residence count

Fields requiring manual review when the resolver reports conflicts:

- status
- delivery
- residence count

## QA

Run the warning-only alignment audit with:

```bash
npm run qa:project-intelligence
```

Add `--write` to emit a markdown snapshot at `docs/project-intelligence-audit.md`.

## Next Phase

- Use the shared resolver directly in project-page data assembly.
- Feed compare-page rows and related insights from the same merged object.
- Generate conservative SEO and JSON-LD output from the resolver, with conflict-aware field gating.
- Add a lightweight regression check for new alias collisions and compare/source drift.
