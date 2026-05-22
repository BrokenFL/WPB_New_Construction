# Agent 10 QA Accessibility Performance Review

Generated: 2026-05-21 21:01 EDT

Scope: read-only review of scripts, current site code, generated/public data, public placeholder risk, and safe checks against the existing build. No edits were made to `src/main.ts` or `src/style.css`.

## Summary

- `npm run qa:launch` passed: 37 checks, 0 findings.
- `npm run qa:gatekeeper` passed: 261 built files checked.
- Highest-risk gaps are outside current automated coverage: public JSON exposes internal rights/sign-off language, project-page inquiry forms lack programmatic labels, and many listing/news images are eager/synchronous.

## Prioritized Findings

### P1 - Public JSON still exposes internal authorization and sign-off wording

Evidence:
- `public/data/project-asset-status.json` repeats `Full project image authorization confirmed by user on 2026-05-18` and `User sign-off recorded for site use; no developer or brand endorsement implied.`
- `public/data/image-clearance-candidates.json` repeats the same sign-off language.
- `public/data/project-team-credits.json` includes the same sign-off note in public source-credit records.
- `public/data/answer-engine-faq.json` exposes `project-source-catalog` source labels.

Why it matters:
These files are in `public/`, so they are shipped as public artifacts even when not visibly rendered in the app. The existing gatekeeper checks `dist` visible text and outbound links, but it does not block this class of public data leakage.

Suggested fix:
Move rights/sign-off notes to `research/` only, or generate public-safe equivalents such as `Image source reviewed for site use` and `Independent brokerage site; no project sponsor endorsement implied.` For answer-engine sources, replace public `project-source-catalog` values with `WPB project review file` or omit internal source labels from public JSON. Add the same patterns to `research/scripts/qa-gatekeeper-surface.mjs` and include `public/data/*.json` in the scan.

### P2 - Project brochure inquiry forms are placeholder-only controls

Evidence:
- `src/main.ts` renders project-page inquiry inputs as bare `<input>` and `<textarea>` controls with placeholders only around the brochure inquiry card.
- The main `/inquire/` form is labeled correctly, so this is localized to the project brochure form.

Why it matters:
Placeholders are not a durable accessible name and disappear once the field has content. Screen-reader and voice-control users can get ambiguous controls on project pages.

Suggested fix:
Mirror the main inquiry form pattern: wrap each control in a `<label>` with a visible or visually-hidden label, or add explicit `aria-label` values. Prefer real labels if the design can absorb them.

### P2 - Listing and news images are eager/synchronous beyond the first viewport

Evidence:
- `renderFeaturedProject()` emits every project card image as `loading="eager" decoding="sync"` and gives high fetch priority to ranks 1-6.
- News cards and home news cards also use `loading="eager" decoding="sync"`.
- Public artifacts are large: `public/` is about 650 MB and `dist/` about 445 MB on disk; several public models are 28-34 MB, and multiple floorplan PDFs/images are 6-26 MB.

Why it matters:
The homepage and project routes can compete for bandwidth and main-thread decode time before the user reaches lower cards/news. This is especially expensive on mobile and cellular connections.

Suggested fix:
Keep eager/high priority only for the first hero or first one to two above-the-fold cards. Change lower-rank project and news images to `loading="lazy" decoding="async"` and consider responsive `srcset`/thumbnail use for card images. Add a budget check for oversized shipped assets and duplicate public PDFs.

### P3 - Automated gatekeeper misses some public-surface risks

Evidence:
- `qa:gatekeeper` passed while public JSON still contains sign-off/internal-source wording.
- `qa:launch` reports manual QA still required for browser screenshots, CRM/lead destination, and broker/compliance review.

Why it matters:
The current checks are useful build/static gates, but a pass should not be treated as full launch clearance. Public data, rendered accessibility, and performance budgets need separate gates.

Suggested fix:
Extend launch QA with:
- public JSON phrase scanning,
- rendered form-control label checks,
- image loading/fetchpriority checks,
- optional Lighthouse/axe pass against preview routes,
- explicit artifact-size thresholds.

## Commands Run

- `rg ... /Users/brookesnader/.codex/memories/MEMORY.md`
- `pwd && rg --files ...`
- `git status --short`
- `sed -n ... package.json`
- `rg --files research`
- `sed -n ... research/scripts/qa-launch-readiness.mjs`
- `sed -n ... research/scripts/qa-gatekeeper-surface.mjs`
- `sed -n ... src/main.ts`
- `sed -n ... src/style.css`
- `rg -n ... src/main.ts src/renderUtils.ts src/generated/siteData.ts public/data/*.json research/scripts/*.mjs index.html`
- `nl -ba src/main.ts ...`
- `nl -ba public/data/project-asset-status.json ...`
- `nl -ba public/data/project-team-credits.json ...`
- `npm run qa:launch`
- `npm run qa:gatekeeper`
- `rg -n ... public dist index.html src research/source-material-review/launch-qa-report.md`
- `find public -type f ... -size +2M ...`
- `rg -n ... research/scripts/build-site-intelligence.mjs research/scripts/*.mjs src/generated/siteData.ts`
- `du -sh public dist research output .playwright-cli`
- `date '+%Y-%m-%d %H:%M:%S %Z'`
