# WPB New Construction | Codex V2 Overhaul Brief

Version 1.0 | September 17, 2026 | Planning only

**Repository:** `BrokenFL/WPB_New_Construction`  
**Maintained file:** `docs/CODEX_SITE_OVERHAUL_BRIEF.md`  
**Initial documentation branch:** `planning/codex-site-overhaul-brief-2026-09-17`

> This is a task-specific brief, not a replacement for the project operating guides. Saving or opening it does not start the overhaul. Begin implementation only when Brooke explicitly starts the sprint. Update this same Markdown file for future revisions; Word copies are editable snapshots, not automatically synchronized.

## Copy-paste task prompt

Act as lead designer and engineer for WPB New Construction. Deliver a cohesive, reviewable V2: the visual quality of a luxury architectural publication, with the usefulness of a buyer decision tool. Make the existing site substantially better, not substantially bigger.

### 1. ORIENT BEFORE EDITING

Read AGENTS.md, both AI_PROJECT_GUIDE.md files, docs/WPB_CODEX_MASTER_HANDOFF.md, and relevant editorial-showcase guidance. Verify current origin/main, open work and dirty files; use an isolated branch/worktree without disturbing unrelated work. Current evidence outranks stale handoffs. Reuse completed work, Codebase Memory MCP, the Visual Editor and approved asset-library workflows. Inventory available frontend, browser and image-generation tools; report gaps instead of pretending access.

### 2. SPEND EFFORT WHERE BUYERS WILL FEEL IT

Prioritize approximately 50% visual design/mobile polish, 30% buyer experience, and 20% SEO, performance, accessibility and reliability. Focus on the homepage, building directory, project pages, comparisons, floor plans and inquiry flow; carry shared improvements across other page types. A visitor should understand the value, find suitable buildings, compare a shortlist, understand plans and inquire without losing context. Improve what exists; do not duplicate the concierge, comparison tools or data systems. Keep 3D experiments separate.

### 3. DELEGATE INTELLIGENTLY

Where available, use gpt-astra extra high for bounded design, architecture and difficult reasoning; use gpt-5.6-luna at max for bounded inventory, mechanical changes and test review. Verify supported model/settings routing; disclose substitutions. Keep one lead responsible for coherence and integration. Give helpers narrow scopes, relevant context and clear outputs; avoid overlapping edits and repeated whole-repository audits. Quota is a ceiling, not a spending target.

### 4. ESTABLISH A DIRECTION, THEN EXECUTE

Capture desktop/mobile baselines. Establish one strong visual direction on the homepage and a representative building page before rolling it out. Report that checkpoint, then proceed with reversible decisions unless Brooke redirects. Improve hierarchy, typography, spacing, image selection/crops, galleries, navigation and restrained motion. Remove redundant buttons, repetitive sections and unnecessary steps without discarding useful content or working features. No wholesale stack rewrite.

Use available image generation for design concepts and useful original graphics. Preserve originals and follow existing asset approvals. Do not fabricate or alter real building geometry, views, amenities or floor-plan facts; clearly distinguish illustrative visuals from verified project imagery. Implement real responsive components, not a flattened screenshot of a website.

### 5. BUILD, INSPECT, CRITIQUE, IMPROVE

Run distinct review passes for web/art direction, graphic design, UX/buyer journeys, and technical QA. Use separate reviewers where supported; otherwise label these as review perspectives, not independent agents. Review the rendered site and actual interactions, not merely code or implementation summaries.

Set a consistent rubric before building: 8/10 means coherent, professional and usable; above 8 requires demonstrable polish with no significant category-specific weakness. Target ABOVE 8/10 in every category on desktop AND mobile. Support each score with page/screenshot evidence, observed task outcomes and remaining defects. Do not inflate scores or average away weaknesses. Scores are internal heuristics, not proof of conversion gains.

Fix the highest-impact issues and re-review. Limit each milestone to three focused improvement rounds; when progress stalls, diagnose or document the shortfall instead of endlessly rescoring. Functional, privacy, accessibility and SEO blockers cannot be waived by a design score.

### 6. FINISH CLEANLY

Use targeted checks while iterating and full relevant gates at integration. Test navigation, shortlist/context preservation, galleries, floor-plan access, inquiry success/error states, keyboard use and narrow mobile layouts. Intercept test submissions; never send real leads. Preserve factual sources, valuable URLs, consent behavior and canonical data boundaries.

Reserve roughly the final fifth of the available work budget for integration, regression testing and handoff. Maintain one short progress record with decisions, branch/SHA, completed work, evidence, blockers and the next action. Stop when the quality bar and checks are met, or document unmet criteria honestly when budget or meaningful progress runs out. Leave a functioning preview, before/after screenshots, scorecard, test results and a reviewable draft PR.

No production merge/deploy, new paid services, account/security changes, major migrations or activation of parked automation without Brooke's explicit approval. A preview is not a release. Continue beyond the first implementation, but do not chase perfection or add features simply to consume quota.

---

## Revision log

- **v1.0 - September 17, 2026:** Initial agreed brief: 50/30/20 priorities, model-aware delegation, truthful asset generation, evidence-backed review cycles, bounded iteration and no-deploy delivery.
