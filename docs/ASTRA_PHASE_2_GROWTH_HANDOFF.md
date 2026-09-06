# WPBNewConstruction — Astra Phase 2 Growth Handoff

**Created:** 2026-09-05  
**Production site:** https://www.wpbnewconstruction.com  
**Production repo:** `BrokenFL/WPB_New_Construction`  
**Planning branch:** `astra-phase-2-growth`  
**Production baseline:** `fb7bf0e9b93a4c4710423dcd900d3e9d185e7605`

## 0. PURPOSE

Phase 1 is complete and deployed: public/private data separation, canonical project facts, floor-plan deduplication, sitemap fixes, structured-data identity corrections, Agent Skill 0.2 validation, canonical URL cleanup, project-type-aware templates, The Sound entity strategy, North Flagler SEO improvements, editorial cleanup, privacy-safe GA4, and consent gating.

Phase 2 is about **traffic growth + conversion**, not foundational cleanup.

North star:

> Qualified organic / AI traffic → useful project research → project/floor-plan/comparison engagement → identifiable buyer intent → conversation with The Scott Gordon Group.

Do not turn the site into a generic Realtor brochure. Preserve the intelligence-platform positioning.

---

# 1. ASTRA OPERATING MODEL

This phase can be executed from ChatGPT/Astra using:

- GitHub for repository reads/writes, branches, PRs, Actions, and deployment verification
- Google Search Console for first-party search demand
- Google Drive for the master audit and research archive
- Web research for current official/developer/city sources
- GA4 results once enough post-release data exists

Codex is **not required** for most Phase 2 work.

Use Codex only when a task materially depends on:

- local-only files on the Mac mini or external SSD
- heavy binary/image processing
- local asset-library synchronization
- long interactive terminal debugging that cannot be reasonably verified in CI

Never push directly to `main` during implementation. Work in reviewable branches/PRs. Merging to `main` triggers the production pipeline.

---

# 2. REQUIRED READING

Before implementing:

1. `docs/AI_PROJECT_GUIDE.md`
2. `AGENTS.md`
3. `README.md`
4. `docs/CODEX_SITE_AUDIT_HANDOFF.md`
5. `docs/WPB_AUDIT_IMPLEMENTATION_PROGRESS.md`
6. `docs/analytics-events.md`
7. this file

Deep audit archive:

- Master audit: `https://docs.google.com/document/d/1zONX64qJvl7oHfn1iuhRfnXencwMIGmYhYFNm7PTGjM/edit`
- Search Console baseline: `https://docs.google.com/document/d/1Vhn4ppVVrFRcVVuSwmwuMqMEfftGOV2f5vLTfVSJFoM/edit`

---

# 3. PHASE 2 PRIORITY ORDER

## P2-001 — HTML FLOOR-PLAN ENTITY PAGES

### Why first
Floor-plan traffic is high-intent and one of the site's strongest unique assets. Today a buyer can still land directly on a PDF without project context or a conversion path.

### Target architecture
Create canonical HTML plan routes such as:

`/floorplans/[project]/[plan]/`

Each meaningful individual plan page should contain, when verified:

- project/building name
- residence / line / stack name
- bedrooms / baths
- interior, terrace, and total square footage
- floor range or stack
- exposure / orientation / view notes
- rendered plan preview
- downloadable canonical PDF
- source + last-reviewed date
- project-guide link
- compare CTA
- request-current-availability CTA

Collection/index/fact-sheet documents should remain separate document types and should not masquerade as individual plan entities.

### SEO
- one canonical HTML page per logical plan/version
- add to sitemap when substantive
- internal links from project pages and `/floorplans/`
- use descriptive title/meta/H1
- add BreadcrumbList and appropriate WebPage/ItemList structure
- do not fabricate unit availability

### Acceptance
- first implementation should cover a small high-value pilot, not every plan at once
- recommended pilot: Olara + Alba first
- no duplicate source-vs-mirror plan pages
- PDFs remain available from HTML pages
- plan pages pass SEO/internal-link/public-copy QA

---

## P2-002 — COMMERCIAL SEO EXPANSION USING SEARCH CONSOLE

North Flagler was Phase 1. Phase 2 should move through the next strongest commercial surfaces.

Priority order:

1. Homepage — primary owner of `West Palm Beach new construction condos`
2. `/buildings/` — secondary browse/directory intent
3. Downtown corridor
4. South Flagler corridor
5. Palm Beach corridor
6. Rosewood
7. Maison d'Or
8. Fern / Gardenia / 464 Fern cluster
9. Rybovich Marina
10. North Flagler vs South Flagler comparison intent

For every page:

- query owner must be explicit
- answer-first opening
- differentiated search intent
- strong internal links
- current buyer CTA
- avoid keyword stuffing
- preserve winning URLs

Before changing a page, pull the latest Search Console query × page data and confirm the opportunity still exists.

---

## P2-003 — CURATED COMPARISON PAGES

Do **not** mass-generate pairwise comparison pages.

Create only comparisons with genuine buyer value and sufficient verified data.

Initial candidates:

- North Flagler vs South Flagler
- Olara vs Ritz-Carlton vs Shorecrest
- Alba vs Shorecrest
- Downtown vs waterfront new construction
- branded residences vs non-branded luxury new build

Each comparison should include:

- concise decision summary
- location/corridor differences
- project status
- expected delivery
- scale/residence count
- floor-plan depth
- amenity/lifestyle differences
- pricing guidance only when current and timestamped
- buyer-fit framing
- current verification items
- contextual CTA: `Compare these for me`

The page should answer a real decision, not exist merely to target a keyword.

---

## P2-004 — CONTEXTUAL LEAD PRODUCTS

The analytics layer is live. Now improve what the site asks users to do.

Implement intent-specific conversions rather than generic contact forms.

### High intent
- Send current availability for this building
- Compare these buildings for me
- Schedule a buyer strategy call / tour

### Medium intent
- Send current pricing + floor-plan packet
- Help me choose between these projects

### Low intent
- Alert me when this pipeline project changes
- Send the WPB development intelligence update

Persist without PII in analytics:

- landing page
- project
- corridor
- CTA type
- compare set
- article/source page
- referrer / UTM context

Keep submitted name/email/phone/message out of GA4.

---

## P2-005 — BUYER INTELLIGENCE REPORT + NEWSLETTER

Create a recurring first-party lead product:

**WPB New Construction Buyer Intelligence Report — [Month Year]**

Suggested sections:

- what changed this month
- active-sales project comparison
- pipeline projects to watch
- delivery/status changes
- notable pricing guidance with effective dates
- newly released floor plans
- planning / construction milestones
- corridor snapshot
- buyer questions to verify now

SEO rule:

Do not hide useful evergreen project facts behind a form.

Lead-magnet rule:

Gate the assembled current report / downloadable packet, not the underlying crawlable buyer research.

Newsletter concept:

**What Changed in WPB Construction This Week**

Use the existing update/news architecture rather than creating a disconnected editorial system.

---

## P2-006 — REAL AUTHORSHIP / REVIEWER LAYER

Phase 1 fixed incorrect entity typing. Phase 2 should make real local expertise visible.

Add actual author/reviewer presentation where appropriate:

- real Person name
- role / brokerage relationship
- relevant credentials
- short local-expertise bio
- profile URL
- published / reviewed / updated date

Use real team members only. Do not create fictional editorial personas or `Review Desk` people.

Recommended content ownership model:

- development-news article: named author + optional reviewer
- buyer guide / comparison: local advisor reviewer
- project entity page: reviewed-by person/team with last-reviewed date

Schema should match visible content.

---

## P2-007 — BUYER DUE-DILIGENCE CONTENT

Build a focused `Before You Buy` content moat.

High-value topics:

- Florida new-construction condo deposit structures
- what to ask before signing a developer contract
- assignment / resale restrictions
- condo fees and what buyers should compare
- closing-cost questions
- parking and storage
- pet policies
- marina / dock rights
- branded residence fees and service structures
- private elevator / shared elevator differences
- delivery delays and changing timelines
- how to compare floor plans beyond square footage

Requirements:

- no individualized legal or financial advice
- cite current authoritative sources where necessary
- separate evergreen education from project-specific facts
- link naturally into relevant project and comparison pages

---

## P2-008 — FEATURE / LIFESTYLE GUIDES

Create guides only when enough verified project data supports a useful comparison.

Candidate themes:

- waterfront new construction
- marina / boat-dock access
- branded residences
- wellness-heavy buildings
- private elevators
- pet-friendly projects
- downtown walkability
- boutique vs large-scale towers

Avoid tag-page spam or thin doorway pages.

---

## P2-009 — INTERNAL LINKING / QUERY OWNERSHIP

For every new page, define the canonical query owner.

Rules:

- homepage owns the broad head term
- corridors own geography intent
- projects own building-brand intent
- floor-plan entity pages own plan/line intent
- comparisons own specific decision comparisons
- answers/guides own buyer-process questions
- updates own dated development-news intent

Do not let multiple page families compete with near-identical headings and copy.

Add contextual links from winning news articles into permanent project/corridor entities.

---

## P2-010 — MEASUREMENT LOOP

GA4 was enabled in production on 2026-09-05.

Do not wait for months before iterating, but avoid pretending one or two days of Analytics data is statistically meaningful.

Recommended checkpoints:

### 7-day check
Confirm instrumentation quality:
- consent rates
- page_view
- building/project views
- floor-plan clicks
- compare opens
- article → project clicks
- form starts
- lead submission success/failure
- phone/email clicks

### 28-day check
Combine GA4 + Search Console:
- organic landing pages with strongest engagement
- pages with impressions but poor CTR
- project pages producing floor-plan actions
- article traffic that progresses into commercial pages
- corridor pages producing comparisons
- CTA types producing form starts

### 60–90 day check
Use real conversion evidence to reorder content priorities.

Never optimize only for clicks if the traffic does not progress toward useful buyer behavior.

---

# 4. RECOMMENDED IMPLEMENTATION WAVES

## Wave A — Highest buyer value
1. HTML floor-plan entity framework
2. Olara + Alba floor-plan pilot
3. Homepage / Buildings commercial SEO pass
4. North Flagler vs South Flagler comparison
5. contextual project/floor-plan CTA refinement

## Wave B — Expand the commercial surface
6. Downtown corridor
7. South Flagler corridor
8. Palm Beach corridor
9. Rosewood + Maison d'Or + Fern/Gardenia optimizations
10. first real author/reviewer profiles

## Wave C — Repeat-visit / lead engine
11. Buyer Intelligence Report
12. newsletter signup + preference model
13. pipeline-project alerts
14. buyer due-diligence series
15. selective lifestyle guides

Do not launch all of this in one giant PR.

---

# 5. ASTRA RESEARCH RULES

For any current project fact:

Source priority:

1. official developer/project site
2. city / county / planning / permit source
3. official contractor / architect / project-team source
4. reputable local/business reporting
5. brokerage/aggregator sources only as secondary context

Never invent:

- current inventory
- pricing
- incentives
- delivery date
- fees
- floor-plan availability
- legal terms
- sales status

If a material fact is uncertain, either omit it or state the buyer-facing verification need cleanly.

---

# 6. IMPLEMENTATION RULES

- preserve Phase 1 public/private separation
- do not reintroduce internal QA fields to public output
- preserve canonical URLs already earning search equity
- avoid parameterized crawlable attribution links
- keep GA4 consent-gated and PII-free
- do not add a second Google tag loader
- use project-type-aware CTAs
- schema must reflect visible, truthful entities
- update sitemap only with substantive canonical routes
- run existing QA before merging
- inspect desktop + mobile output for major new page types

---

# 7. DEPLOYMENT RULE

`main` is production.

Workflow:

1. implement on a feature branch
2. create PR
3. inspect changed files and current production diff
4. allow CI / launch QA / gatekeeper to pass
5. merge only when the batch is coherent
6. merging to `main` triggers production deployment
7. verify live canonical pages and analytics after deploy

Do not manually run a second production deployment unless the automatic workflow fails and the cause is understood.

---

# 8. SEPARATE MAINTENANCE BACKLOG

Do not mix these into the growth sprint unless they become blockers:

- npm dependency audit currently reports four high-severity findings
- asset-library advisory warnings
- old crawler/search snippets that need natural recrawl after Phase 1 cleanup
- local asset-library normalization

Track them, but keep growth work focused.

---

# 9. DEFINITION OF PHASE 2 SUCCESS

Phase 2 is not complete merely because more pages exist.

Success means:

- high-intent floor-plan searches land on useful HTML pages
- major commercial query clusters have clear canonical owners
- organic articles feed permanent project/corridor entities
- comparisons help buyers make real decisions
- calls to action match user intent
- low-intent users have a reason to return or subscribe
- real authors/reviewers strengthen trust
- Search Console impressions convert into higher CTR and deeper site engagement
- GA4 can show project → floorplan/compare → inquiry journeys without PII
- no regression to the Phase 1 data-quality/search foundation

---

# 10. COPY / PASTE STARTING PROMPT FOR ASTRA

```text
CONTINUE WPBNEWCONSTRUCTION — PHASE 2 GROWTH IMPLEMENTATION

You are working on WPBNewConstruction.com from inside ChatGPT.

Production repo:
BrokenFL/WPB_New_Construction

Production baseline after Phase 1:
fb7bf0e9b93a4c4710423dcd900d3e9d185e7605

Planning branch:
astra-phase-2-growth

FIRST:
1. Read docs/AI_PROJECT_GUIDE.md.
2. Read AGENTS.md and README.md.
3. Read docs/WPB_AUDIT_IMPLEMENTATION_PROGRESS.md.
4. Read docs/ASTRA_PHASE_2_GROWTH_HANDOFF.md in full.
5. Review current main and verify Phase 1 remains live/healthy before changing anything.
6. Use Google Search Console first-party data and current official web sources when prioritizing current SEO/content work.

GOAL:
Move WPBNewConstruction from a technically strong development-intelligence site into a measurable organic-growth and qualified-buyer conversion engine, without turning it into a generic Realtor site.

IMPLEMENTATION ORDER:
1. HTML floor-plan entity framework.
2. Olara + Alba pilot plan pages.
3. Homepage and Buildings commercial SEO improvements using Search Console.
4. North Flagler vs South Flagler buyer comparison.
5. Intent-specific project/floor-plan/comparison CTAs.
6. Downtown, South Flagler, and Palm Beach corridor improvements.
7. Rosewood, Maison d'Or, Fern/Gardenia, and other Search Console striking-distance pages.
8. Real author/reviewer presentation and schema.
9. Buyer Intelligence Report/newsletter foundation.
10. Buyer due-diligence content and selective lifestyle guides.

RULES:
- Do not work directly on main.
- Do not deploy after each small edit.
- Use reviewable implementation batches.
- Preserve all Phase 1 public/private data boundaries.
- Never invent current pricing, inventory, incentives, delivery, fees, or contract terms.
- Preserve winning URLs.
- Keep GA4 consent-gated and PII-free.
- Do not mass-generate thin comparison or feature pages.
- Every page must have one clear search intent and buyer purpose.

FOR EACH BATCH:
- research the current query opportunity
- inspect current code/data architecture
- implement
- run/trigger relevant existing QA
- inspect desktop/mobile output
- review canonical/schema/internal links
- create a PR
- do not merge until the batch is coherent and verified

Start with P2-001 in the handoff: design and implement the HTML floor-plan entity framework and an Olara + Alba pilot. Before changing code, report the proposed route/data/schema design and the exact files you expect to change. Then proceed unless you identify a material architectural conflict.
```

---

# 11. HANDOFF NOTE

Astra should treat this document as the Phase 2 requirements source and the current `main` branch as implementation truth.

If repo reality conflicts with this plan, verify first and update the plan rather than blindly following stale assumptions.
