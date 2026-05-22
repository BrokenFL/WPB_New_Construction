# WPB New Construction Site Imagery Plan

Some visuals may be editorial or representative unless marked as official project imagery. Do not invent official renderings.

| Image name | Route/page | Purpose | Visual description | Geography notes | Alt text | Asset path | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| WPB geography map hero | `/map` and homepage atlas | Explain the buyer map before pins | Downtown West Palm Beach skyline across the Intracoastal / Lake Worth Lagoon | Downtown sits west of the Intracoastal; Palm Beach island sits east across the lagoon; ocean is beyond Palm Beach, not against Downtown | Editorial geography image showing Downtown West Palm Beach west of the Intracoastal with Palm Beach island to the east | `public/assets/editorial/wpb-geography-map-hero.jpg` | Available; user-provided and optimized |
| Flagler waterfront corridor | North Flagler corridor pages | Warm the waterfront corridor story | North Flagler waterfront aerial with Intracoastal, towers, marina edge, and Downtown context | Show lagoon/intracoastal water, not ocean surf against Downtown | Editorial image of the Flagler waterfront corridor with towers, marina, and Palm Beach across the Intracoastal | `public/assets/editorial/flagler-waterfront-corridor.jpg` | Available; user-provided and optimized |
| Downtown core corridor | Downtown corridor pages | Show walkable buyer context | Night skyline view of Downtown West Palm Beach across the Intracoastal | Urban core, not beach setting | Editorial image of walkable Downtown West Palm Beach with restaurants and towers in the background | `public/assets/editorial/downtown-core-corridor.jpg` | Available; user-provided and optimized |
| Rosemary Square corridor | The Square / Rosemary context | Show retail and dining lifestyle | Night skyline view used as a downtown/Rosemary representative visual until a district-level image is sourced | Use city/district cues, no oceanfront cues | Editorial image of an open-air Rosemary and The Square dining district in West Palm Beach | `public/assets/editorial/rosemary-square-corridor.jpg` | Available as representative downtown visual; better district image still welcome |
| NORA growth corridor | NORA / North Downtown content | Explain emerging-district energy | Needs a NORA/North Downtown street-level or adaptive-reuse image | Growth corridor north of core; keep gritty-polished balance | Editorial image of NORA and North Downtown growth with adaptive reuse and new development energy | `public/assets/editorial/nora-growth-corridor.jpg` | Needs sourcing |
| Buyer intelligence interior | Market Notes and inquiry CTAs | Add warmth to the advisory layer | Needs an elegant condo interior looking east over Intracoastal toward Palm Beach and ocean beyond | Interior should look toward Palm Beach/ocean beyond the lagoon; do not place surf directly next to Downtown | Editorial condo interior overlooking the Intracoastal toward Palm Beach and the Atlantic beyond | `public/assets/editorial/buyer-intelligence-interior.jpg` | Needs sourcing |

## Implementation Notes

- Use optimized JPG/WebP assets with stable dimensions.
- Add `loading="lazy"` except for the first viewport image.
- Use captions such as `Editorial visual` where the asset is representative.
- Keep project-specific pages limited to official, user-provided, or clearly representative project imagery.
- If an asset does not exist yet, render a polished placeholder and keep this manifest as the sourcing brief.
- Implemented imagery records live in `src/data/editorialImagery.ts`.
- The reusable renderer lives in `src/components/EditorialImagePanel.ts` and falls back to a polished editorial placeholder when files are not yet sourced.
- Sourced from user-provided images on 2026-05-21: `wpb-geography-map-hero.jpg`, `flagler-waterfront-corridor.jpg`, `downtown-core-corridor.jpg`, and `rosemary-square-corridor.jpg`.
- Remaining needs-sourcing records: `nora-growth-corridor.jpg` and `buyer-intelligence-interior.jpg`.
