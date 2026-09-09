# P2 Project SEO Batch 4 — Rosewood + Maison d’Or

Updated September 8, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`.

## Final status

**IMPLEMENTED / TESTED / APPROVED / DEPLOYED / LIVE-VERIFIED — NOT MEASURED.**

Batch 4 improved the canonical Rosewood Residences West Palm Beach and Maison d’Or buyer guides, including buyer-facing status/source qualification, metadata/schema, internal discovery, request-intent handling and same-session inquiry switching. Brooke approved PR #80 for release after the exact tested implementation and documentation-head workflows were green.

PR #75 remains **PARKED**. GA4 configuration was not revisited. Alba’s unpublished HTML state, 3D map work and Three.js floor-plan implementation were not modified by this release.

## Approved candidate and PR #80 release

- Exact tested application: `b0f0f216f73abb4d42466c6c0aeaeb50325f380f`.
- Final green implementation workflow: `34266304318`.
- Documentation-only PR head at approval: `16b206fae117e8b92710d3a1f22eed58bf92b6c1`.
- Final green documentation-head workflow: `34267585008`.
- PR #80 merge SHA: `9041493a48c573658872d79445c4f1e796643c8c`.
- PR #80 normal production workflow: `34277677628`.

The normal main-branch production workflow was allowed to deploy the approved release once. No duplicate manual deployment was initiated.

## Live acceptance, canonical-link failure and PR #81

The first live acceptance audit correctly found one production defect: Maison d’Or linked to the unpublished `/projects/south-flagler-house-north/` route instead of the canonical published `/projects/south-flagler-house/` route. The failure was not waived.

A release-only hotfix was prepared as PR #81. It changed the Maison d’Or internal link to the canonical South Flagler House route and added focused regression coverage; it did not alter analytics, inquiry runtime, Alba, PR #75, Maps behavior or 3D work.

- PR #81 hotfix validation workflow: `34278719639` — SUCCESS.
- Final production SHA after PR #81: `cdf8240a8a5c6b1bf482f0e48ce9e496fd9b0ebe`.
- PR #81 normal production workflow: `34278996546` — SUCCESS, including Cloudflare deployment.
- Final live acceptance workflow: `34280040979` — SUCCESS.

The final live acceptance passed the PR #80 production verification and the six-page live Olara regression audit, including desktop/mobile coverage and retained existing buyer journeys. Batch 4 is therefore live-verified.

## QA-harness-only corrections during live verification

Two corrections made while completing production acceptance were limited to the verification harness and were **not application changes**:

1. The intercepted production-safe inquiry test used a browser-only Turnstile stub so no real CAPTCHA/server delivery path was invoked.
2. The harness dismissed/reset the successful lead modal between same-session test actions so the modal did not block the next CTA.

Those harness changes did not weaken the application assertions or alter production application SHA `cdf8240a8a5c6b1bf482f0e48ce9e496fd9b0ebe`.

## What live acceptance verified

The live audit covered the Rosewood and Maison d’Or canonical routes, titles/descriptions/canonicals/H1 identity, structured data and sitemap dates, buyer summaries and status/source qualifications, project imagery and internal links, availability and pricing/floor-plan packet CTAs, Rosewood alias normalization, exact current interest at the form and intercepted payload, forward/reverse same-session request switching, Rosewood ↔ Maison switching, first-touch attribution preservation, responsive overflow, actual Maps behavior and existing Olara/corridor/comparison/commercial journeys.

All automated QA lead POSTs were intercepted. **No real lead was sent.**

## Remaining limitations / not certified

This release does **not** certify:

- production Turnstile server-side verification;
- actual inbox/email notification delivery;
- database or CRM delivery;
- duplicate behavior from a real production submission;
- actual GA4 network transport;
- measured search, lead or conversion growth.

Those items require a separately controlled real-world acceptance/measurement step. Batch 4’s release status is therefore **live-verified but not measured**.

## Separate visual backlog

Non-blocking and intentionally not modified during release: evaluate moving/integrating the Batch 4 buyer-summary content below the visual hero or At-a-Glance section and reducing repeated facts, especially on mobile.

## Historical implementation note

Historical candidate failures remain valid evidence rather than being recast as passes. In particular, run `34264240516` exposed the deterministic same-session request-intent inheritance defect. The final Batch 4 enhancer resolved that behavior using explicit allowlisted request ownership while preserving first-touch attribution and buyer edits. Historical stylesheet/internal-link failures also remain in Git history. The final implementation candidate `b0f0f216...`, release merges and live workflow identities above are the authoritative closeout record.