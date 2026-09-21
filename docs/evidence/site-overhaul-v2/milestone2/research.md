# V2 Milestone 2 benchmark collection

- Access date: 2026-09-19 (America/New_York)
- Configured model selection: `gpt-5.6-luna/max`
- Scope: read-only inspection of official primary pages. These are interface and content observations, not traffic or conversion evidence.

| Website | Primary URL(s) visited | Hierarchy / news | Discovery | Trust | Inquiry | Return hooks |
|---|---|---|---|---|---|---|
| [Corcoran Sunshine](https://www.corcoransunshine.com/) | [Home](https://www.corcoransunshine.com/), [Portfolio](https://www.corcoransunshine.com/portfolio/), [How We Work](https://www.corcoransunshine.com/how-we-work/), [News & Press](https://www.corcoransunshine.com/news-press/), [Contact](https://www.corcoransunshine.com/contact/) | Compact agency nav; featured developments precede a press/news module; portfolio has location tabs. | Portfolio filters by NYC, Florida, National, and Global; project cards include South Florida work. | Named team, Miami/Palm Beach offices, partner brands, external press, Fair Housing/legal links, and market-report request. | Contact form plus office phone/email. | Portfolio, News & Press, State of the Market report. |
| [SERHANT. New Development](https://serhant.com/new-development) | [New Development](https://serhant.com/new-development), [Market Knowledge](https://serhant.com/market-knowledge) | Top-level Buy/Rent/Sell/New Development, Agents, and Insights; active and sold projects; press and reports. | Project cards carry location labels and View All; sold-project route supplies lifecycle context. | Sold archive, external press, licensed-broker/legal disclosures, and market reports. | Get in Touch form asks for name, email, phone, topic, message, and SMS consent. | Newsletter, reports, Guides, press, and sold projects. |
| [The Modern House](https://themodernhouse.com/) | [Home](https://themodernhouse.com/), [Journal](https://themodernhouse.com/journal), [Green Lane Close](https://themodernhouse.com/sales-list/green-lane-close), [Thornhill Crescent](https://themodernhouse.com/sales-list/thornhill-crescent) | Editorial homepage separates Today, Prime, New, Featured, and Past Sales; Journal has Latest, In-house, Film, Homes, Lifestyle, and Podcast. | Curated property cards; detail pages expose photos, floorplan, EPC, map, brochure, narrative, and related sales. | Team, reviews, press, FAQ, past sales, third-party portal marks, phone/email, and legal links. | Request viewing, Register for similar homes, phone/email, and appraisal route. | Property alerts, newsletter, related sales, and Journal. |
| [Mansion Global](https://www.mansionglobal.com/) | [Home](https://www.mansionglobal.com/), [New Developments](https://www.mansionglobal.com/new-developments), [Buy](https://www.mansionglobal.com/buy) | News, Top Markets, New Developments, United States, and Global; New Developments pairs editorial stories with property discovery. | Buy feed has sort controls, New Development badges, provider labels, and Save actions. | Dow Jones ownership, newsroom/sponsored-content disclaimer, provider labels, listing-agent and currency caveats, accessibility/legal links. | Newsletters, sign-in, and Save; no prominent direct inquiry form was visible on inspected pages. | Newsletters, saved listings, Top Markets, related stories, and topic routes. |
| [New Luxury Realty](https://newluxuryrealty.com/developments) | [Developments](https://newluxuryrealty.com/developments), [The Perigon](https://newluxuryrealty.com/developments/the-perigon), [West Palm Beach](https://newluxuryrealty.com/neighborhoods/west-palm-beach) | South Florida navigation is organized by counties, condos, homes, neighborhoods, investment, and contact. | Search, filters, interactive-map route, development cards with stage, price, address, units, delivery, and developer; detail pages add amenities/features. | Named developer/architect fields; explicit rendering and changing-data disclaimers; service-region and buyer-representation language. | Request Information, Schedule Showing, phone/email, and consultation routes. | Related developments, neighborhood routes, newsletter, map, and consultation. |
| [Palm Beach Luxury](https://www.palmbeachluxury.com/condos/) | [Condos](https://www.palmbeachluxury.com/condos/) | Properties split by lifestyle and price; Communities, Condos, Services, Insights, and About; Market Intelligence and guide content follow discovery. | Filters by location, price, waterfront, service level, and development; building guides and compare tool. | Beaches MLS source/date and daily-update language; explicit diligence guidance on reserves, inspections, boards, and assessments. | Buy, off-market, Build Your Collection, valuation, and contact routes. | Market reports, buyer/seller intelligence, neighborhood/lifestyle guides, and comparisons. |
| [Olara official](https://www.olarawestpalmbeach.com/) | [Home](https://www.olarawestpalmbeach.com/), [Press](https://www.olarawestpalmbeach.com/press) | Single-project sequence: Vision, Residences, Dining, Lifestyle, Location; separate dated press archive. | Explore Vision/Residences/Lifestyle/Location; floor plans, team, downloads, and press are explicit return destinations. | Named Arquitectonica and Gabellini Sheppard, sales-gallery address, dated press entries, and legal/privacy links. | Sales email, phones, sales-gallery address, and price-from statement; no form visible on inspected homepage. | Floor plans, downloads, press, team, location, and section anchors. |

## NewDevRev accessibility note

Attempted the official primary URL [https://newdevrev.com/](https://newdevrev.com/) on 2026-09-19. The text browser could not access it, and a direct read-only request timed out. It is excluded from the seven-site table; no secondary-only feature or performance claim is used here.

## Deep-inspection leads

- **The Modern House:** inspect responsive long-form listing narrative, floorplan/EPC/map/brochure controls, Request Viewing and Register Similar Homes placement, and related-sale behavior.
- **Corcoran Sunshine:** inspect portfolio filter tabs, regional cards, press/report trust modules, and how office/contact information collapses on mobile.
- **Olara:** inspect image-led section sequencing, anchor navigation, mobile CTA visibility, loading behavior, and readability of project facts over immersive media.

## Rendered desktop/mobile findings

Lead and Luna completed these on September 19 at 1440px and 390px. Competitor forms were opened but never completed or submitted. Selected screenshots are in this directory's `benchmark` folder; full local originals are in `output/playwright/milestone2/`. Some full-page captures contain offscreen lazy-image gaps, so those gaps are not scored as broken production images.

| Deep inspection | Observed task / composition | Decision for WPB |
|---|---|---|
| The Modern House | Home → Thornhill Crescent → Request viewing opens a form with property context. Floorplan, map, brochure and related properties sit alongside the narrative. Desktop uses one editorial feature and ordered property collections; mobile stacks them into a long page. Journal and property alerts provide explicit return destinations. | Keep clear browse/compare hero actions, add a dated editorial invitation immediately afterward, and preserve contextual inquiry. Do not copy the long repeated property collections. |
| Corcoran Sunshine | Home → Portfolio → Florida successfully filters the portfolio; Contact exposes name, email, phone and message fields. Desktop/mobile retain a menu button; press follows featured developments and offices/market-report request supply trust. The cookie notice occupies considerable mobile space. No buyer comparison tool was visible in these inspected paths. | Use regional discovery and source-linked updates. Retain WPB's visible mobile research navigation and a compact consent interface. Corcoran's project-sales statements are not website conversion evidence. |
| Olara official | Home and residences use expansive architectural images and alternating editorial blocks. Floor Plans exposes 26 cards, residence-type filters and PDF links. Mobile inquiry puts contact information above a single-column form. Header inquiry is consistently available; no unit-specific inquiry context was observed in inspected links. | Preserve approved large imagery and the distinctive bridge graphic, while keeping WPB's existing plan/building/shortlist context through inquiry. Avoid requiring visitors to traverse a long visual sequence before reaching tools. |

These seven sites were selected for local relevance, luxury presentation, new-development discovery or editorial structure. No verified competitor conversion rate, controlled experiment, CrUX dataset or comparable field-performance series was obtained. No estimated traffic was used as conversion evidence. Visual quality and apparent friction here are reviewer judgments.

## First-party demand and measurement limits

The Search Console connector returned `UNAUTHORIZED` / missing refresh token. Brooke was invited to reconnect while implementation continued; no membership or authentication bypass was attempted. No verified consented analytics report was available. Parked GA4 transport work remains parked.

The dated repository baseline in `docs/CODEX_SITE_AUDIT_HANDOFF.md` covers **August 5–September 1, 2026**, versus the preceding 28 days: 65 search clicks (49 prior), 3,305 impressions (1,721 prior), 1.97% CTR (2.85% prior), average position 23.59 (23.87 prior). Rybovich's project page had 12 clicks, North Flagler 7, West Palm Point's update 7, the Frisbie update 6 and Sound Apartments' update 6. This supports testing news-to-research paths; it is an older snapshot, does not establish current behavior, and search clicks are not inquiries or conversions.

## Arrangements and prioritized hypotheses

**Discovery-led:** hero → corridors → featured buildings → compare → three stories → neighborhood context → map → guidance → bridge. Strong first-visit introduction, but returning visitors must pass familiar material.

**Chosen discovery/news hybrid:** hero with browse/compare/latest-story paths → three newest approved stories → corridors → featured buildings → compare → neighborhood context → map → guidance → original bridge. The compact news section supplies a visible reason to return while the hero retains direct research access. All three stories remain until replaced; no freshness label overrides publication ordering.

1. **Find meaningful changes sooner.** Prominent dated stories should help repeat visitors find worthwhile new material. Check consenting repeat sessions reaching an update and then another useful research surface.
2. **Connect news to decisions.** Approved buyer implications and real related building/corridor links should help visitors turn an update into building research. Check article-to-project events and onward plan/comparison use.
3. **Complete mobile research and inquiry with context.** Earlier comparison selectors, named per-criterion project values and flatter readable forms should reduce friction. Check task completion, form errors/retries and valid submissions, then manually assess qualification in the existing lead workflow.

These are hypotheses, not measured gains. No accounts, publishing pipeline, canonical facts or paid services changed.


## Committed benchmark captures

- The Modern House: [desktop homepage](benchmark/modern-house-desktop.png), [mobile homepage](benchmark/modern-house-mobile.png).
- Corcoran Sunshine: [desktop contact path](benchmark/corcoran-contact-desktop.png), [mobile homepage](benchmark/corcoran-mobile.png).
- Olara official: [desktop plan library](benchmark/olara-official-floorplans-desktop.png), [mobile homepage](benchmark/olara-official-mobile.png).

These are observation records from September 19, not copied design assets for the WPB site.
