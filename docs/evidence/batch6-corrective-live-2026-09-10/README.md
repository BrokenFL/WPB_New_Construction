# Batch 6 corrective live evidence

Selected production evidence captured September 10, 2026 after PR #93 and PR #89 reached `main`. This directory contains compact summaries and three selected screenshots copied from the isolated review runtime; no lead, token or personal data is included.

## Current decision

- PR #93 (`ae076dc5926baeebedb30b8d45b23a2ade710c05`) is approved, merged as `2469a470c4d7cd0391682e9566ef79d44ee417e4`, and deployed once by [34534298501](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34534298501) at `https://de109853.wpbnewconstruction.pages.dev`.
- The representative production review passed 9 route/viewport cases and 7 intercepted inquiry proofs. It covered desktop `/map/`, homepage desktop/mobile, Olara project desktop/mobile, Residence D floorplan desktop/mobile and `/inquire/` desktop/mobile. The route checks retained one visible H1, one nonempty JSON-LD graph, HTTPS social metadata, no horizontal overflow and no meaningful console/page errors. The inquiry proofs covered five canonical intents, legacy URL prefills, manual selection, floorplan context and first-touch preservation.
- After consent dismissal, the original PR #86 native Zoom-out/Ask WPB collision is clear. Fresh denied-consent zoom-in/out contexts pass real tiles, pan, concierge, focus/Escape, safe-area and overflow checks.
- A fresh 390×844 first visit still has a consent ownership defect: Zoom-out center `(45,619.86)` is hit by `ASIDE#wpb-analytics-consent`, the consent surface covers the launcher, and a background map control remains actionable. The consent surface exposes `role="dialog"` without `aria-modal`. Whole Batch 6 therefore remains **NOT LIVE-VERIFIED / NOT MEASURED**.
- PR #89 (`f5198ca5842af608828aaf9cbbc087e83e57fbfd`) is approved, merged as current main `baac91f5aa1a25d1013dcc762528cad558668512` and deployed once by [34535997309](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34535997309) at `https://05e16046.wpbnewconstruction.pages.dev` as internal tooling only. Its buyer-facing bundles match the PR #93 baseline; Phase A remains `apply:false` and review-only.

The next review target is the unnumbered candidate branch `fix/batch6-consent-control-ownership`, current reviewed application commit `c14c5b3ff542b98a5b91737cbcdbed6a7c2d2f93`. It is not release-approved or deployed. The screenshots distinguish consent, dismissed-controls and concierge-open states; they do not establish zero overlap between the launcher and the decorative map-count panel.

## Files

- `pr93-representative-live.json` — compact route and intercepted-submission result.
- `pr93-mobile-consent-control.json` — compact first-visit, dismissed-consent and denied-consent control-ownership result.
- `pr93-deployment-proof.json` — merge/deployment/source binding.
- `pr89-merge-proof.json` — internal-tooling merge, deployment and unchanged-bundle proof.
- `consent-first-visit.png`, `consent-dismissed-controls.png`, `consent-dismissed-concierge.png` — selected screenshots.
- `manifest.json` — SHA-256 hashes for the selected files and their source runtime artifacts.
