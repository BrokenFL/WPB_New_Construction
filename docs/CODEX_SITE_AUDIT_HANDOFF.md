# WPBNewConstruction — Codex Site Audit & Growth Handoff

**Created:** 2026-09-04  
**Site:** https://www.wpbnewconstruction.com  
**Purpose:** Give Codex one authoritative entry point for implementing the SEO, AI-agent, data-quality, UX, and conversion findings from the September 2026 site audit.

---

## 0. START HERE — DO NOT GUESS THE REPO

### Active production website repo
- GitHub: `BrokenFL/WPB_New_Construction`
- Primary local checkout: `/Volumes/ExternalSSD/WPB_NewConstruction`
- Approved laptop fallback: `/Users/brookesnader/Documents/WPB_New_Consrtuction_Git`

### Active asset repo
- GitHub: `BrokenFL/WPB_New_Construction_Assets`
- Primary local asset checkout: `/Volumes/ExternalSSD/WPB_NewConstruction_Assets`

### Historical / stale repo — DO NOT IMPLEMENT HERE
- `BrokenFL/WestPalmNewConstruction`

The stale repo is an older May 2026 prototype and is **not** the production source of truth.

Before changing anything, run:

```bash
pwd
git remote -v
git branch --show-current
git status --short --branch
git log -5 --oneline
```

If the checkout is not aligned with `BrokenFL/WPB_New_Construction`, stop before editing.

---

## 1. REQUIRED READING ORDER

Read these files before implementation:

1. `docs/AI_PROJECT_GUIDE.md`
2. `AGENTS.md`
3. `README.md`
4. `docs/ai-search-optimization.md`
5. `docs/analytics-events.md`
6. `docs/editorial-showcase-production-playbook.md` when touching showcase project pages
7. This file again after reading the repo guidance

Existing repo rules override assumptions in this audit when the current repo proves they have changed.

---

## 2. EXTERNAL AUDIT ARCHIVE

The deep audit is stored in Google Drive.

### Audit folder
`https://drive.google.com/drive/folders/1NYUakypspDDuQN9hSezwZ9rUILH5fkDC`

### Master audit
**WPBNewConstruction — Master Audit & Codex Handoff**  
`https://docs.google.com/document/d/1zONX64qJvl7oHfn1iuhRfnXencwMIGmYhYFNm7PTGjM/edit`

### Search Console baseline
**WPBNewConstruction — Search Console Baseline & SEO Opportunities — 2026-09-01**  
`https://docs.google.com/document/d/1Vhn4ppVVrFRcVVuSwmwuMqMEfftGOV2f5vLTfVSJFoM/edit`

If Codex cannot access Google Drive, **do not block**. This Markdown file contains enough information to begin the P0/P1 implementation. Use the Drive docs only as additional evidence/context.

---

## 3. CURRENT PRODUCT STRATEGY

Do **not** turn this into a generic Realtor lead-generation website.

The intended product position is:

> **The independent intelligence platform for West Palm Beach and Palm Beach new development, backed by a real buyer-side advisory team.**

The strongest moat is the combination of:

- canonical project entities
- source-backed project history
- corridor pages
- project comparisons
- released floor-plan intelligence
- planning/development reporting
- buyer Q&A
- map/geospatial context
- machine-readable data
- direct buyer representation

The site should feel closer to a local development intelligence publication + buyer research product than a brochure site.

---

## 4. SEARCH CONSOLE BASELINE

First-party Google Search Console data for **2026-08-05 through 2026-09-01**, compared with the prior 28 days:

| Metric | Current | Previous | Change |
|---|---:|---:|---:|
| Clicks | 65 | 49 | +32.7% |
| Impressions | 3,305 | 1,721 | +92.0% |
| CTR | 1.97% | 2.85% | down 0.88 percentage points |
| Avg. position | 23.59 | 23.87 | roughly flat |

Interpretation:

- Google visibility is expanding quickly.
- Development/news/project pages are earning visibility before the main buyer funnel.
- The homepage and broad category pages are still weak for high-value generic condo intent.
- CTR needs work on several pages already ranking in positions 5–15.

### Current organic winners

- `/projects/rybovich-marina-redevelopment/` — 376 impressions, 12 clicks, avg. position 9.55
- `/corridors/north-flagler/` — 332 impressions, 7 clicks, avg. position 12.22
- `/updates/west-palm-point-back-in-motion-2026-07-11/` — 53 impressions, 7 clicks, avg. position 9.17
- `/updates/frisbie-group-palm-beach-county-setbacks-investment-fund-2026-06-08/` — 137 impressions, 6 clicks
- `/updates/sound-apartments-right-of-way-maintenance-2026-07-12/` — 461 impressions, 6 clicks, avg. position 10.05
- `/projects/fern-and-gardenia-related-ross-fern-street/` — 75 impressions, 5 clicks, avg. position 6.79

### High-opportunity query cluster: The Sound

Queries already ranking:

- `the sound apartments west palm beach` — position ~9
- `the sound apartments west palm beach prices` — position ~6.8
- `the sound wpb` — around page-one territory
- `the sound west palm beach` — around position 11

Problem: the ranking URL is a right-of-way-maintenance news article.  
Action: create a stable project/entity page for The Sound, preserve the existing article, and internally link article → entity. Do not erase the article's earned equity.

### High-opportunity commercial cluster

Prioritize:
1. North Flagler
2. Rybovich Marina
3. Fern / Gardenia / 464 Fern
4. Rosewood
5. Maison d'Or
6. North Flagler vs South Flagler
7. building + floor-plan queries

---

## 5. P0 — PUBLIC / PRIVATE DATA BOUNDARY

### Problem
Internal research state and operational metadata have leaked into public/indexable content and public JSON.

Examples previously observed on the live site include language such as:

- `Agent 2 recommends do not merge`
- review flags / conflict logs
- database-record language
- AI crawler instructions in buyer-facing copy
- human-review workflow language
- source conflict mechanics
- internal asset/research paths

The repo also publishes operational files under `public/data/`, including files such as:

- `image-clearance-candidates.json`
- `project-asset-status.json`
- `project-copy-package.json`

Some contain research paths, media-review state, source-use classifications, candidate URLs, and workflow metadata.

### Required architecture
Create an explicit **public-safe serialization boundary**.

Private/internal objects may contain everything needed for research.

Public data must be generated only from allowlisted schemas.

Example conceptual split:

```ts
type InternalProjectResearch = {
  // conflicts, candidates, notes, QA state, source comparisons, internal paths, etc.
}

type PublicProjectView = {
  projectId: string
  name: string
  canonicalUrl: string
  currentStatus?: string
  projectAddress?: string
  residenceCount?: number
  delivery?: string
  pricingGuidance?: string
  lastReviewed?: string
  sources?: PublicSource[]
  publicAssets?: PublicAsset[]
}
```

### Acceptance criteria
- No public HTML, JSON, feeds, `llms.txt`, schema, sitemap, or client bundle contains internal QA language.
- No `/Users/...`, `/Volumes/...`, `research/...`, asset-repo path, or iCloud path appears in public output.
- Public JSON is generated through allowlists, not primarily filtered with forbidden-word regexes.
- Internal research files should move outside `public/` unless there is a defensible public use.
- Existing QA should fail when an unapproved field reaches public output.

---

## 6. P0 — CANONICAL FACT / ENTITY RESOLUTION LAYER

### Problem
The research system correctly captures disagreements, but public pages should not reproduce raw unresolved conflicts as the main buyer-facing narrative.

Examples historically observed:
- delivery-year disagreement
- project vs sales-gallery address confusion
- residence-count changes
- planning parcel vs marketing address confusion

### Required model
Do not overload one string field. Prefer typed facts:

```ts
projectAddress
salesGalleryAddress
mailingAddress
planningParcelAddress

canonicalResidenceCount
historicalResidenceCounts[]

expectedDeliveryCurrent
priorDeliveryGuidance[]

factEffectiveDate
lastVerifiedDate
sourcePriority
```

Public presentation should:
1. show the current canonical value;
2. show a short historical note only when genuinely useful;
3. link to relevant sources;
4. preserve full conflict history internally.

### Acceptance criteria
- One canonical public fact per fact category.
- No public raw merge/reconciliation logs.
- Project address and sales-gallery address are semantically distinguished.
- Date-sensitive facts carry effective/review dates.

---

## 7. P1 — SITEMAP `lastmod` IS CURRENTLY MISLEADING

The sitemap generator currently falls back to a hard-coded `2026-06-03` value for most routes.

This causes August/September articles and newly changed routes to appear as though they were last modified in June.

### Required fix
Generate accurate route-level `lastmod`:

- news: article modification/publication date
- market notes: modification/publication date
- projects: meaningful project-data or project-copy update date
- corridor/index pages: meaningful generated-content update date
- static/legal pages: source/file update date when reliable
- if a reliable significant-change date cannot be determined, omit `lastmod`

Do not spend engineering effort tuning sitemap `<priority>`; search engines do not rely on it meaningfully.

### Acceptance criteria
- New/updated pages never receive fake June dates.
- `lastmod` reflects significant content changes.
- QA checks impossible future dates and stale hard-coded defaults.

---

## 8. P1 — STRUCTURED DATA IDENTITY GRAPH

### Problem
Current schema logic has treated `The Scott Gordon Group` as a `Person` and uses a simplified identity graph.

### Target graph
Use real entities consistently:

- **WPB New Construction** — WebSite / publishing brand
- **The Scott Gordon Group** — RealEstateAgent or Organization
- **Douglas Elliman Florida, LLC d/b/a Douglas Elliman** — brokerage/parent organization
- actual individual authors/reviewers — Person
- project entities — type appropriate to the project

Do not represent an office tower, rental apartment project, pipeline assemblage, hotel, and for-sale condominium with one universal project type simply because they share a template.

### Acceptance criteria
- Team entity is not typed as a person.
- Person schema represents actual named people only.
- Project schema type follows project category when defensible.
- Author/reviewer relationships use real entities.
- Validate generated JSON-LD.

---

## 9. P1 — AGENT / AI DISCOVERABILITY

Strong existing foundations:
- `robots.txt` explicitly allows major AI/search crawlers
- `llms.txt`
- `/.well-known/api-catalog`
- RSS + JSON Feed
- `/.well-known/agent-skills/`
- buyer-research skill
- prerendered route content
- route-specific structured data

### Current issue
The Agent Skill implementation should be validated against the current Agent Skills specification.

The current skill file previously lacked required YAML frontmatter.

Target shape:

```md
---
name: wpb-new-construction-buyer-research
description: Research West Palm Beach and Palm Beach new-construction condo projects, corridors, floor plans, public updates, and buyer verification needs. Use for buyer questions about project status, comparisons, timing, floor plans, and current-detail verification.
---

# WPB New Construction Buyer Research
...
```

Also verify the discovery index against the current Agent Skills index specification.

### Acceptance criteria
- Validate with current Agent Skills tooling/spec.
- Skill directory name and YAML `name` match.
- Skill description clearly states activation conditions.
- Index schema/digest fields match current standard.
- Agent guidance points to canonical internal WPB pages before external sources.
- No current price/inventory is invented.

---

## 10. P1 — FLOOR-PLAN CANONICALIZATION

### Problem
The public floor-plan dataset often treats:
- official external PDF
- locally mirrored PDF
- duplicate imported copy
- case variant
- collection/index PDF

as separate buyer-facing plan records.

Example: Olara residence lines and Alba Plan D appear multiple times as external + local assets.

### Target entity model

```ts
type FloorPlan = {
  planId: string
  projectId: string
  normalizedName: string
  displayName: string
  planType: "individual" | "collection" | "index" | "fact-sheet"
  line?: string
  beds?: string
  baths?: string
  interiorSqFt?: number
  exteriorSqFt?: number
  totalSqFt?: number
  sourceUrl: string
  publicAssetUrl?: string
  internalMirrorPath?: string
  contentHash?: string
  effectiveDate?: string
  isCanonicalPublicPlan: boolean
}
```

### Required behavior
- one public canonical entity per actual plan/version
- local mirror does not create a second plan entity
- normalize case and punctuation
- retain source history internally
- distinguish collection PDFs from individual plans
- keep historical plan versions only when useful
- consider future HTML plan pages for high-intent search traffic

### Acceptance criteria
- no duplicate public plan names/versions caused solely by source vs mirror URLs
- existing external links preserved where useful
- one canonical plan ID
- floor-plan counts represent unique buyer-meaningful plans

---

## 11. P1 — PARAMETER / CANONICAL URL HYGIENE

Search has surfaced parameterized variants such as inquiry-context and filtered URLs.

### Required fix
- internal tracking should use analytics state/events rather than indexable URL variations where possible
- all parameter/filter variants must resolve to the intended clean canonical URL
- determine which filters deserve indexable landing pages versus noindex/canonical handling
- do not allow lead-attribution parameters to become distinct search results

### Acceptance criteria
- canonical tags ignore non-content tracking parameters
- sitemap contains clean canonical URLs only
- no parameter variants are intentionally internally linked as canonical destinations

---

## 12. P1 — THE SOUND ENTITY PAGE

The Sound already has meaningful Google demand, but a dated maintenance article is carrying the query cluster.

Create a stable page, likely:

`/projects/the-sound-west-palm-beach/`

or the canonical slug supported by the existing project model.

It should cover:
- project identity
- address/location
- rental vs ownership status clearly
- development/status timeline
- known pricing/rent context only if properly sourced/current
- amenities
- nearby retail/lifestyle anchors
- source links
- updates
- FAQ
- last-reviewed date

Then:
- link the existing ranking article to the entity page
- link the entity page back to relevant updates
- preserve the article URL and its ranking history
- ensure title/meta answers the actual query intent

---

## 13. P1 — NORTH FLAGLER SEO SPRINT

North Flagler is currently the strongest commercial/buyer corridor page.

Improve it without bloating it.

Target query families:
- North Flagler condos
- North Flagler new construction
- North Flagler waterfront condos
- North Flagler West Palm Beach developments
- Olara vs Shorecrest
- Ritz vs Olara vs Shorecrest
- marina / waterfront projects

Required enhancements:
- concise opening answer to what the corridor is
- project table with status, delivery, pricing guidance, floor-plan depth
- active sales vs pipeline distinction
- buyer-fit differences
- meaningful internal links to projects
- latest corridor updates
- compare CTA
- current packet/pricing CTA
- structured ItemList/Breadcrumb where appropriate

Do not stuff keywords.

---

## 14. P1 — PROJECT TEMPLATE MUST RESPECT PROJECT TYPE

One shared template should not automatically use condo-sales language for:
- rental apartments
- office towers
- proposed pipeline sites
- completed comparables
- hotel/residence combinations
- active-sales condominiums

Create explicit project-type/presentation rules.

Possible categories:

```ts
"condo-active-sales"
"condo-pipeline"
"rental"
"office"
"hotel-residences"
"mixed-use"
"completed-comparable"
"planning-watch"
```

CTA, schema, pricing language, floor-plan treatment, and buyer messaging should vary by type.

### Palm Beach geography check
Earlier live audit results found Palm Beach Island pages using a North Flagler phrase. Current repo changes may have partially fixed this. Verify current generated/live output before editing, and add QA preventing cross-corridor geography copy.

---

## 15. P1 — EDITORIAL WORKFLOW LANGUAGE

Previously surfaced public article copy included production labels such as:
- Team context
- Newsletter-ready note
- workflow/editorial scaffolding

Verify current main/live output because recent QA improvements may have fixed some of this.

If still present:
- keep internal article metadata internal
- render only reader-facing headline/dek/body/context
- add regression tests for known production labels

---

## 16. P1 — ANALYTICS ADAPTER / LEAD ATTRIBUTION

The repo already has an excellent event model in:
- `docs/analytics-events.md`
- `src/lib/analytics.ts`

But the current wrapper primarily dispatches local browser events and queues them.

### Required next step
Connect the existing vendor-neutral event layer to a production analytics destination such as GA4, without sending PII.

Preserve:
- no names
- no email addresses
- no phone numbers
- no full message contents
- no sensitive client notes

Must be able to answer:
- organic landing page → project view
- project → floor-plan click
- project → comparison
- CTA → form start
- form start → submit success/failure
- phone/email clicks
- article → buyer page → lead

Use page, project, corridor, CTA context and UTM/referrer metadata.

---

## 17. UX / CONVERSION PRINCIPLE

Do not make every CTA say “Contact Us.”

Map CTA to intent:

### High intent
- Send current availability for this building
- Compare these buildings for me
- Schedule a buyer strategy call/tour

### Medium intent
- Send current pricing + floor-plan packet
- Help me choose between these two projects

### Low intent
- Alert me when this pipeline project changes
- Send the WPB development intelligence update

Every submitted lead should preserve:
- landing page
- referring page
- project
- corridor
- CTA type
- UTM/referrer
- compare set where relevant

---

## 18. ASSET RULES

Read `docs/AI_PROJECT_GUIDE.md` before touching assets.

Architecture:

```text
iCloud intake library
    ↓ approved assets only
WPB_New_Construction_Assets
    ↓ publish script
WPB_New_Construction/public/assets/projects/
    ↓ registry/generated site data
live website
```

### Asset commands

Asset repo intake:

```bash
cd /Volumes/ExternalSSD/WPB_NewConstruction_Assets
node scripts/sync-icloud-approved-assets.mjs --dry-run
node scripts/sync-icloud-approved-assets.mjs --write
```

Website publishing:

```bash
cd /Volumes/ExternalSSD/WPB_NewConstruction
npm run assets:publish:dry
npm run assets:publish
npm run assets:refresh:dry
npm run assets:refresh
npm run assets:audit
```

Never:
- publish directly from iCloud
- use `/Users/...` or `/Volumes/...` in website data
- point public site data at asset-repo paths
- treat attribution as proof of image usage rights
- overwrite curated assets blindly

---

## 19. IMPLEMENTATION WORKFLOW FOR CODEX

### A. Establish a clean baseline

```bash
cd /Volumes/ExternalSSD/WPB_NewConstruction
pwd
git remote -v
git branch --show-current
git status --short --branch
git fetch origin
git log -5 --oneline
```

Do not destroy unrelated local work.

If appropriate, create a dedicated branch:

```bash
git switch -c codex/site-audit-growth-2026-09-04
```

### B. Baseline verification

Run the relevant existing suite before changing code:

```bash
npm run typecheck
npm run build
npm test
npm run assets:audit
```

Record any pre-existing failures separately.

### C. Implement in logical, reviewable batches

Recommended order:

1. Public/private data boundary
2. Canonical fact resolution
3. Sitemap lastmod
4. Structured-data identity graph
5. Agent Skill validation
6. Floor-plan canonicalization
7. Parameter/canonical URL cleanup
8. Project-type template rules
9. The Sound entity page
10. North Flagler SEO improvements
11. Analytics adapter
12. Conversion refinements

Do **not** combine all twelve into one giant unreviewable commit.

### D. Self-review after every major batch

Review as:
- senior TypeScript/frontend engineer
- technical SEO lead
- AI/agent discoverability specialist
- luxury real estate UX/CRO lead
- data-quality editor

### E. Verification

At minimum:

```bash
npm run typecheck
npm run build
npm test
npm run assets:audit
```

Also run targeted QA scripts relevant to changed areas, especially:

```bash
npm run qa:seo
npm run qa:public-json
npm run qa:copy
npm run qa:customer-copy
npm run qa:image-alt
npm run qa:internal-links
npm run qa:project-pages
npm run qa:geo
npm run qa:a11y-forms
npm run qa:performance
```

Use Playwright for desktop/mobile visual verification where relevant.

### F. Deployment rule

Do not publish midway through implementation.

When:
- user intent includes live implementation,
- working tree is understood,
- tests pass,
- changes are reviewed,

use the repo's normal production flow:

```bash
npm run ship:live
```

Then verify the deployed site and canonical URLs.

If the user asked only for code preparation/review, stop before deployment and provide a ready-to-deploy summary.

---

## 20. DEFINITION OF DONE

The first audit implementation cycle is done only when:

- public output does not expose internal research state
- canonical public facts are separated from research conflicts
- sitemap modification dates are credible
- schema identity graph uses real entity types
- Agent Skill validates against the current spec
- duplicate floor-plan entities are materially reduced/canonicalized
- tracking parameters do not create indexable duplicate destinations
- project templates respect project type
- The Sound has a stable entity strategy
- North Flagler has improved buyer/search intent coverage
- analytics events reach a production analytics destination without PII
- all relevant existing QA passes
- desktop/mobile visual QA has been performed
- changes are documented and committed in reviewable units

---

# COPY/PASTE STARTING PROMPT FOR CODEX

Use this when starting a fresh Codex session:

```text
CONTINUE WPBNEWCONSTRUCTION SEO / AI-SEARCH / GROWTH AUDIT IMPLEMENTATION

You are working on the live WPBNewConstruction.com project.

FIRST:
1. Confirm you are in the active repo BrokenFL/WPB_New_Construction.
2. Prefer /Volumes/ExternalSSD/WPB_NewConstruction when available.
3. Read docs/AI_PROJECT_GUIDE.md in full.
4. Read AGENTS.md and README.md.
5. Read docs/CODEX_SITE_AUDIT_HANDOFF.md in full.
6. Read docs/ai-search-optimization.md and docs/analytics-events.md.
7. Inspect the current git status and recent commits before changing anything.

DO NOT use BrokenFL/WestPalmNewConstruction. It is stale.

The detailed audit archive is here if Google Drive access is available:
- Audit folder: https://drive.google.com/drive/folders/1NYUakypspDDuQN9hSezwZ9rUILH5fkDC
- Master audit: https://docs.google.com/document/d/1zONX64qJvl7oHfn1iuhRfnXencwMIGmYhYFNm7PTGjM/edit
- Search Console baseline: https://docs.google.com/document/d/1Vhn4ppVVrFRcVVuSwmwuMqMEfftGOV2f5vLTfVSJFoM/edit

Do not block if Drive is unavailable. docs/CODEX_SITE_AUDIT_HANDOFF.md contains the implementation-critical findings.

GOAL:
Improve WPBNewConstruction.com into the authoritative West Palm Beach / Palm Beach development-intelligence and buyer-research platform, with stronger technical SEO, AI-agent readability, data integrity, conversion tracking, and qualified lead generation.

WORK ORDER:
1. Verify which audit findings remain open on current main/live because the repo is actively changing.
2. Fix the public/private data boundary first.
3. Fix canonical fact/entity resolution.
4. Repair sitemap lastmod generation.
5. Correct structured-data entity types/identity relationships.
6. Validate and repair the Agent Skill implementation.
7. Canonicalize the floor-plan dataset.
8. Clean parameter/canonical URL handling.
9. Make templates project-type aware.
10. Build/strengthen The Sound entity strategy.
11. Optimize North Flagler using the Search Console evidence in the handoff.
12. Connect the existing analytics event layer to a production analytics destination without PII.
13. Improve contextual lead conversion without turning the site into a generic Realtor brochure.

RULES:
- Preserve the existing project/corridor/floorplan/Q&A/news architecture.
- Never invent current pricing, inventory, incentives, dates, or legal terms.
- Preserve source transparency while removing internal research mechanics from public copy.
- Do not expose research paths, asset repo paths, local paths, QA state, review queues, or internal metadata.
- Follow the asset architecture in docs/AI_PROJECT_GUIDE.md.
- Do not destroy unrelated local work.
- Make reviewable commits by logical batch.
- Do not deploy until relevant QA passes and the working tree is understood.

BASELINE + FINAL VERIFICATION:
npm run typecheck
npm run build
npm test
npm run assets:audit

Also run targeted SEO/public-data/copy/geo/internal-link/performance/Playwright QA for changed areas.

After each major implementation batch:
- inspect the rendered output as a human buyer;
- inspect it as Google/AI crawler content;
- inspect schema/canonical output;
- review mobile behavior;
- document what changed and which audit findings it closes.

At the end, provide:
- findings completed
- files changed
- tests run/results
- unresolved items
- Search/SEO implications
- deployment status
- exact next step

If live implementation was requested and all verification passes, use the repo's standard `npm run ship:live` flow and verify the deployed URLs.
```

---

## 21. CODEX CLOSEOUT FORMAT

Before stopping, Codex should update or create a progress note containing:

```md
# WPB Audit Implementation Progress

## Completed
- ...

## Files changed
- ...

## Tests
- ...

## Live verification
- ...

## Remaining
- ...

## Search Console opportunities preserved/targeted
- ...

## Next recommended task
- ...
```

The objective is that the next agent can resume without rereading an entire chat history.
