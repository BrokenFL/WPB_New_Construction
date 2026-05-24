# News Branding and Project Layout Audit

Date: 2026-05-24

## Homepage News Before / After

Before, the homepage update area read as a generic latest-news feed with the eyebrow `Latest Updates`, the headline `New-construction signals worth watching.`, and no explanatory subhead. The card selection came from `homepageExternalNews`, which only included fresh lanes.

After, the homepage section is branded as `WPB Development Desk` with the headline `Latest West Palm Beach development updates.` and the buyer-facing subhead: `Construction milestones, planning signals, project announcements, and buyer-relevant movement across West Palm Beach's new-development pipeline.` The archive link now points buyers into the Development Desk rather than a generic update list.

## Why The Homepage Showed One Story

The homepage selector filtered published articles to `breaking_14d` and `recent_30d` only. The current published article set had one item in those fresh lanes, so the homepage had only one eligible card even though more published articles existed.

## Updated Homepage Story Selection Rule

The homepage now selects up to three cards in this order:

1. Published `breaking_14d` and `recent_30d` items.
2. If fewer than three are available, published `evergreen_analysis`, `evergreen_context`, or `archive_only` items fill the remaining slots.
3. Older cards are labeled as context, project watch, construction milestone, or market signal based on lane/category/title signals, and are not labeled as current or breaking unless they are actually in a fresh lane.
4. Cards continue to link internally to `/updates/:id/`.

## Updates Archive Brand

The `/updates/` archive is now framed as `West Palm Beach Development Desk`. The header explains that fresh items sit first and older reporting is retained only when it still helps buyers compare timing, corridor momentum, or project fit.

The page now has separate surfaces for:

- Fresh Signal / Fresh Updates
- Context Archive
- Existing filter chips and search controls
- Newsletter signup and current-availability CTA

## Project Page Layout Change Summary

Project pages now use this buyer-first order:

1. Hero
2. Quick Facts / stat sheet
3. Snapshot strip
4. Brooke's Buyer Lens with best-for and compare-against guidance
5. Residences
6. Amenities
7. Location / corridor
8. Project Team
9. Compare Nearby
10. Missing-info guardrail
11. Latest Coverage
12. Inquiry / buyer resources CTA

Quick Facts now appears immediately after the hero and includes available corridor, status, delivery, residences, pricing note, address, developer/sponsor, architect, interior designer, lifestyle lane, floor count, floorplan status, and confidence level fields.

## Repeated Copy Cleanup Summary

Priority pages reviewed: Ritz-Carlton Residences, Olara, South Flagler House, Alba Palm Beach, and Shorecrest.

Tightening focused on repeated use of `waterfront`, `luxury`, `branded`, `North Flagler`, `resort`, `estate`, `boutique`, and `service` across hero/intro, Buyer Lens, residence, amenity, location, and team copy.

Changes made:

- South Flagler House: reduced repeated estate/waterfront phrasing and kept the hero focused on identity, the Buyer Lens on fit, and the team section on credibility.
- Olara: reduced repeated waterfront/resort language and kept the buyer distinction on marina, wellness, culinary energy, and active North Flagler lifestyle.
- Alba: reduced repeated boutique/waterfront phrasing so scale and residence mix do more of the work.
- Ritz-Carlton Residences: shifted repeated brand/service phrasing toward operational and unit-specific diligence.
- Shorecrest: removed repeated waterfront/pipeline wording and reinforced verification-first positioning.

## Latest Coverage Placement

Latest Coverage remains compact and project-specific. The selector now caps at three items, prioritizes project-specific articles first, then corridor context, then broader market signals only when relevant. Cards display a relationship label so buyers can tell whether an article is project-specific or contextual.
