# Project Intelligence Architecture

This document captures the source-of-truth layout for public project identity, source-catalog facts, compare/building intelligence, manual overrides, publication gates, and the shared resolver that ties them together.

## Current Strategy

- Public project identity is generated from the tracked canonical snapshot plus Brooke-reviewed identity/publication decisions. `src/main.ts` is no longer a second hand-maintained project registry.
- Project presentation is a separate overlay: ranking, coordinates, approved imagery, summary, page state, and other visual/editorial concerns do not control canonical identity or factual precedence.
- Source-catalog facts remain the caveat and review layer: source-derived facts, conflicts, gaps, review notes, and source counts.
- The compare/building database is the enriched buyer-intelligence layer: amenities, services, parking, storage, pets, rentals, fees, delivery detail, and comparison fields.
- The site reads these layers through shared accessors and the project-intelligence resolver so conflicts stay visible instead of being silently overwritten.
- Publication states are explicit: `published`, `awaiting_imagery`, and `retired_merged`. Only `published` projects receive routes, cards, sitemap entries, and JSON-LD.

## Shared Files

- `content/project-identity-decisions.json` — Brooke-reviewed canonical IDs, aliases, corridor assignment, and publication state
- `content/project-page-overlays.json` — approved presentation and legacy fallback data for published project pages
- `research/scripts/generate-project-model.mjs` — validates and generates the shared project model
- `src/generated/projectModel.ts` / `src/generated/projectModel.json` — generated browser/build projections; do not edit directly
- `src/lib/projectIntelligenceRegistry.ts` — generated-model adapter for slug, compare ID, source IDs, aliases, and collapsed entries
- `src/lib/projectFieldAccessors.ts` — shared field precedence helper
- `src/lib/projectIntelligence.ts` — resolver, field review configs, queue builder, schema safety
- `src/data/projectFactOverrides.ts` — TypeScript type definitions and JSON import
- `content/overrides/project-fact-overrides.json` — Brooke-reviewed override values (the write target)
- `src/lib/buildingDatabase.ts` — compare database resolver
- `src/main.ts` — site data assembly (reads from resolver)
- `research/scripts/check-project-intelligence.ts` — warning-only alignment QA
- `research/scripts/generate-project-schema-safe.ts` — runs the shared schema resolver and generates the build-only prerender projection
- `src/generated/projectSchemaSafe.json` — build-only schema-safe values used by static prerendering; do not expose as public JSON
- `tools/content-studio/server.mjs` — Builder API including `/api/project-fact-override`
- `tools/content-studio/app.js` — Project Intelligence UI and Project Facts panel
- `tools/content-studio/index.html` — Builder shell

## Registry and Resolver

The registry records, per public project:

- public slug and public route
- public display name
- corridor
- public status, delivery, residence count, address
- source-catalog ID(s)
- compare database ID and slug, where available
- alternate aliases used across source, compare, and public lookups
- collapsed source-catalog records where a public page intentionally merges split source entries

The resolver returns a merged object with:

- public identity
- source-catalog summary
- compare row, when present
- Brooke-reviewed manual overrides, when present
- related news and market-note matches
- conflict flags and missing-data flags
- field reviews (one per reviewable field, with all source values and winner logic)
- schema-safe facts

## Source Priority

- **Public identity fields** (name, slug, corridor, route): manual override > public project layer > source catalog > compare data
- **Buyer-facing facts** (status, delivery, address, residenceCount, price, bedrooms, etc.): manual override > compare database > source catalog > public project layer
- **Schema output**: only emits a field when it is conflict-free AND explicitly marked `schemaSafe: true` in the override, OR when the resolver finds no conflict

For generated page facts, the explicit precedence contract is:

1. Brooke-reviewed override
2. appropriate structured source (canonical identity/project model for project pages; compare database for buyer comparison fields)
3. approved fallback from the page overlay

The generator records field provenance. It never converts a conflict into an approved value.

## Publication Gates (2026-09-01)

- Published project pages: 18
- Public candidates awaiting imagery: OLIN Palm Beach, 3031 S. Ocean, Apogee Residences, 201 Arkona Court, and 2085 North Flagler
- Retired/merged: Currie Park Towers → 2085 North Flagler
- Palm Beach is a fourth corridor alongside North Flagler, South Flagler, and Downtown.

Awaiting-imagery projects are present in the identity registry so aliases and future compare reconciliation are stable, but they intentionally have no route, card, sitemap entry, presentation overlay, or JSON-LD.

## Reviewable Fields

The following 16 fields are tracked through the full review pipeline:

| Field key | Label | Scope |
|-----------|-------|-------|
| `status` | Status | identity |
| `deliveryTiming` | Delivery timing | identity |
| `residenceCount` | Residence count | identity |
| `address` | Address | identity |
| `priceDisplay` | Price display | buyer |
| `bedroomRange` | Bedroom range | buyer |
| `sizeRange` | Square footage range | buyer |
| `floorCount` | Floor count | buyer |
| `parking` | Parking | buyer |
| `storage` | Storage | buyer |
| `pets` | Pets | buyer |
| `rentals` | Rental policy | buyer |
| `fees` | Fees / maintenance | buyer |
| `amenities` | Amenities | buyer |
| `waterfront` | Waterfront | buyer |
| `dockage` | Dockage / marina | buyer |

## Manual Override Layer

**File:** `content/overrides/project-fact-overrides.json`

**Schema** (per field entry):

```json
{
  "value": "confirmed value string",
  "source": "manual_review",
  "preferredFrom": "public | compare | source | custom",
  "reviewedBy": "Brooke",
  "reviewedAt": "ISO-8601 timestamp",
  "note": "why this value wins",
  "schemaSafe": false
}
```

- `preferredFrom` records which source Brooke approved or whether she typed a custom value.
- `schemaSafe` defaults to `false`. Must be explicitly set `true` before a field is emitted in JSON-LD.
- Brooke is the only person who sets `schemaSafe: true`.
- Overrides are never auto-generated. No guesses, no AI-filled values.

**TypeScript type:** `ProjectFactOverride` in `src/data/projectFactOverrides.ts`

**API endpoint:** `POST /api/project-fact-override` on the local Builder server (port 8787)

Payload:
```json
{
  "projectSlug": "building-slug",
  "field": "fieldKey",
  "value": "confirmed value",
  "preferredFrom": "public | compare | source | custom",
  "reviewedBy": "Brooke",
  "schemaSafe": "false",
  "note": "optional review note"
}
```

## Brooke Builder — Project Intelligence Sections

### Opening the Builder

```bash
node /Users/brookesnader/Documents/WPB_New_Consrtuction_Git/tools/content-studio/server.mjs
```

Or double-click `tools/launchers/Open Brooke Builder.command`. Then open:

```
http://127.0.0.1:8787/
```

The server must be restarted (Control-C + restart) after any change to `server.mjs`. Changes to `app.js` and `style.css` are served fresh on every page load.

### Project Intelligence Review Queue

Click **Project Intelligence** in the left sidebar.

The review queue lists all fields with conflicts, missing data, or pending manual review, grouped by priority:

- **Priority 1**: schema-impacting fields with source conflicts — address, status, delivery, residence count
- **Priority 2**: buyer-facing fields with compare/source divergence
- **Priority 3**: missing compare rows or split-source handling gaps
- **Priority 4**: editorial drift, related content gaps, floor count divergence

**Workflow:**

1. Click any queue item on the left.
2. The right panel shows: project name, slug, priority, reason, current winner, schema behavior, recommended action.
3. The values grid shows public/compare/source/current winner for that field.
4. The conflict table shows all queue items for that project.
5. **Source chooser** — four buttons:
   - **Approve Public Value** — fills the reviewed-value input with the public site value; sets `preferredFrom: public`
   - **Approve Compare Value** — fills from compare DB; sets `preferredFrom: compare`
   - **Approve Source Value** — fills from source catalog; sets `preferredFrom: source`
   - **Use Custom Value** — opens a freeform input; sets `preferredFrom: custom`
   - Buttons are disabled when that source has no value for the field.
6. A banner confirms which source was selected.
7. Set **Schema safe**: `No` by default. Set `Yes` only when Brooke confirms the value is safe for JSON-LD.
8. Add a **Review note** explaining what was confirmed and why.
9. Click **Save Manual Override**. The button is disabled until a value is selected.
10. After saving, the queue item disappears from the main "All" view and moves to the "Has manual override" filter tab.

**Queue filter tabs:**
- **All** — open conflicts only (excludes already-overridden items)
- **Priority 1 only** — schema-impacting items
- **Schema-impacting** — same as Priority 1
- **Buyer-facing** — Priority 2 buyer facts
- **Missing compare row** — projects without compare DB entries
- **Has manual override** — audit trail of resolved items
- **Needs Brooke review** — Priority 1–3 combined

### Project Facts — Direct Update

Click **Project Facts** in the left sidebar.

Use this when Brooke has new information (developer email, site visit, updated listing) and wants to update a specific field without going through the review queue.

**Workflow:**

1. Select a **building** from the dropdown (all 18 public projects).
2. Select a **field** from the dropdown (all 16 reviewable fields).
3. The current values panel shows: public site, compare DB, source catalog, current winner, schema state, and existing override (if set).
4. Type the **new confirmed value** in the input field.
5. Leave a **review note** documenting the source.
6. Set **Schema safe** to `Yes` only if this value is verified safe for JSON-LD.
7. Click **Save Override**. After saving, both the Project Facts panel and the PI queue refresh.

## Schema and SEO Usage

- Project-page SEO titles and JSON-LD read from the shared resolver where safe.
- JSON-LD only uses fields that are both conflict-free and `schemaSafe: true`.
- Status, delivery timing, residence count, and address are omitted from schema when the resolver marks them for review.
- `npm run build` regenerates JSON-LD and prerendered HTML. Run after any schema-safe override.

## What Should Never Be Auto-Resolved

- **Never** auto-fill overrides from AI inference or guesses.
- **Never** set `schemaSafe: true` without Brooke confirmation.
- **Never** populate `value` from an untrusted source (API responses, scraped content, AI completions).
- The compare database is the preferred source for buyer facts but Brooke must confirm before saving.

## Known Review Items

### Overrides Set

- `alba-palm-beach · address` — override set: `4714 N. Flagler Drive, West Palm Beach, FL 33407`, preferred from public source. Schema safe: false (pending review).

### Conflicts Requiring Human Review (63 Priority 1 items as of last audit)

Every project needs Brooke-confirmed overrides for: address, status, deliveryTiming (and residenceCount for some). Use the Project Intelligence queue or Project Facts panel to resolve them one by one.

### Public Projects Without Compare Rows

- `alba-reserve`
- `fern-and-gardenia-related-ross-fern-street`
- `rybovich-marina-redevelopment`

### Source-Catalog Gap

- `rosewood-residences-west-palm-beach` — no matching source-catalog record. Keep in review mode until the source layer is restored or renamed.

### Split Source Records Intentionally Collapsed

- `south-flagler-house-north` + `south-flagler-house-south` → `south-flagler-house`
- `edgeworth-north` + `edgeworth-south` → `edgeworth`
- `rybovich-marina` → `rybovich-marina-redevelopment`

## QA Commands

```bash
npm run qa:project-intelligence   # warning-only alignment audit (reports all open issues)
npm run qa:content-studio         # validates builder is not exposed publicly
npm run typecheck                 # catches type errors in override schema
npm run build                     # regenerates JSON-LD and prerendered HTML
npm run qa:seo                    # checks SEO metadata on prerendered routes
```

Add `--write` to `qa:project-intelligence` to emit a markdown snapshot at `docs/project-intelligence-audit.md`.

## Next Phase

- Review and approve project-specific imagery for the five `awaiting_imagery` candidates before adding presentation overlays or public routes.
- Review the proposed master fact changes before replacing the active compare CSV; the dry-run report intentionally keeps all changed cells and conflicts visible.
- Resolve the 63 open Priority 1 items using the Builder queue — one field per session.
- Add `schemaSafe: true` overrides only after Brooke confirms each value through the Builder.
- Keep the priority queue and warning-only audit aligned so Brooke sees the same issue ordering in the cockpit and QA output.
- Add a lightweight regression check for new alias collisions and compare/source drift.
