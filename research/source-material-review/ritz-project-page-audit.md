# Ritz-Carlton WPB Project Page Editorial / Visual Audit

Date: 2026-05-23
Route audited: `/projects/ritz-carlton-wpb/`
Live page reviewed: `https://www.wpbnewconstruction.com/projects/ritz-carlton-wpb/`

## Source Material Reviewed

- Official project site: `https://theresidenceswestpalmbeach.com/`
- Related Group property page: `https://relatedgroup.com/properties/the-ritz-carlton-residences-west-palm-beach/`
- Ritz residences page: `https://theresidenceswestpalmbeach.com/residences/`
- Rockwell Group project page: `https://www.rockwellgroup.com/index.php/projects/the-ritz-carlton-residences`
- BH Group project page: `https://www.bhgroupmiami.com/projects/the-ritz-carlton-residences-at-west-palm-beach/`
- Florida YIMBY groundbreaking coverage: `https://floridayimby.com/2026/02/related-group-and-bh-group-break-ground-on-the-ritz-carlton-residences-west-palm-beach.html`
- Internal source catalog: `research/source-material-review/project-source-catalog.json`
- Current local assets: `public/projects/ritz-carlton-wpb/media/`

## Audit Perspectives

### 1. UI Designer

- Hero scale is appropriate for a brand-led project page, but the previous headline was too narrow and too large, creating stacked serif blocks that felt editorially heavy.
- Below the hero, section headlines were competing with the hero. Shared brochure modules needed smaller section headline sizing and softer letter spacing.
- Known facts and buyer-lens modules were visually useful but read as data modules. They needed calmer type and clearer section jobs.
- Team cards were limited to three cards and did not give the richer role context required for a high-consideration real-estate page.
- Mobile readability was acceptable in structure, but long stacked headings created excessive vertical scrolling.

### 2. Copywriter

- Copy repeated "branded," "North Flagler," "waterfront," "luxury," and "Ritz-Carlton" too often across hero, buyer lens, amenities, and location.
- The page needed each section to carry a distinct job: intro for what it is, buyer lens for fit, residences for how it lives, amenities for operations, location for access/context, team for credibility, coverage for public signals, CTA for current packet.
- The revised copy keeps the brand visible but moves the repeated claim into practical buyer questions: plan, exposure, service model, fees, timing, and alternatives.

### 3. Buyer / Customer

- The page now better answers: "Is this right for me?" instead of only "What is the project?"
- Buyer Lens should stay near the top because it converts facts into fit.
- Project Team matters for buyer confidence, but long bios would slow the page. Concise "who they are / why it matters" cards are the right format.
- Latest Coverage belongs near the bottom after resources and comparisons so a buyer can see public milestones without leaving the site.

### 4. Developer

- Developer and partner roles should be presented accurately without overstating unpublished offering terms.
- Related Group and BH Group are confirmed by official/developer and reporting sources.
- Arquitectonica, Rockwell Group, Naturalficial, Marriott International / Ritz-Carlton residential brand context are supported by official or credible sources.
- Address language remains a source-confidence note because official contexts include 1717 N Flagler and 1745 N Flagler references.

### 5. Real Estate Advisor

- The page should help Brooke move a buyer from browsing into a current-packet conversation.
- CTA placement is strong in hero, sticky nav, and buyer resources, but project coverage should not add a second "ask about this update" action that distracts from reading the site article.
- The page should keep buyers on-site: article cards link to on-site updates first, and the original source remains in the article footer.

## Image-to-Section Audit

| Page section | Current image | Does it match? | Recommended image/action |
|---|---|---|---|
| Hero | `ritz-hero-waterfront-building-2200x1375.jpg` | Yes | Keep. Shows building identity and waterfront/skyline context. |
| Mobile hero | `ritz-mobile-hero-tower-sunset-900x1125.jpg` | Yes | Keep. Good vertical crop for phone. |
| Residences | Previously first three non-hero gallery items could include tower/arrival/lobby before residence images | Partial | Force Ritz residence tiles to use `ritz-residence-living-room-sunrise-1600x1067.jpg`, `ritz-residence-kitchen-entertaining-1600x1067.jpg`, and `ritz-residence-primary-bath-1600x1067.jpg`. |
| Amenities | Previous shared selection could pull residence imagery into amenity slots | No | Force Ritz amenities to use fitness, pool/cabanas, waterfront lounge, valet arrival, lobby service, and evening terrace/view imagery. |
| Location | Google map panel plus route metrics | Yes | Keep. Add no decorative image; the map has the clearest location job. |
| Team | Placeholder/logo cards only where approved logos exist | Partial | Keep tasteful placeholders/logos; do not add unsourced headshots. Expand to six concise team cards. |
| Latest Coverage | No Ritz-specific published article appeared first | No | Add project-specific published update for the February 24, 2026 groundbreaking, then allow closely related North Flagler branded/luxury coverage. |

## Typography Findings And Changes

- Hero headline remains large but was reduced from the previous extreme scale and given a wider measure.
- Shared brochure module headlines were reduced and letter spacing softened.
- Project section headings in known facts and buyer lens were scoped down for project pages only.
- Team-card headlines were reduced so role labels and explanations have room to breathe.
- Metadata, category/date labels, and source labels stay small and secondary.

## Project Team Notes

- Developer: Related Group. Confirmed by Related Group property page and Florida YIMBY.
- Co-developer: BH Group. Confirmed by BH Group project page and Florida YIMBY.
- Architect: Arquitectonica. Confirmed by Florida YIMBY and current source catalog.
- Interior / Design: Rockwell Group. Confirmed by Rockwell Group project page and Florida YIMBY.
- Landscape Architect: Naturalficial. Confirmed by Florida YIMBY and current source catalog.
- Brand / Service Partner: The Ritz-Carlton / Marriott International collaboration. Confirmed by Florida YIMBY; service inclusions still need current buyer-packet confirmation.

## Remaining Recommendations

- Source or confirm final legal/offering address language before using it in contract-sensitive copy.
- Verify which image paths are actually deployed on Cloudflare after the next live deploy; pre-audit live page showed several blank image slots even though local files exist.
- Consider a future project-page data model that lets each project declare residence images, amenity images, team cards, and coverage rules explicitly instead of relying on shared gallery order.
