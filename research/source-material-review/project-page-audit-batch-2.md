# Batch 2 Project Page Editorial / Visual Audit

Date: 2026-05-23
Branch: `codex/project-page-audit-batch-2`
Model: Ritz audit pattern from `codex/project-page-audit-ritz-first` / commit `12d9b93`

Routes audited locally:

- `/projects/olara/`
- `/projects/south-flagler-house/`
- `/projects/alba-palm-beach/`
- `/projects/shorecrest/`

## Source Material Reviewed

- Olara official site and materials: `https://www.olarawestpalmbeach.com/`
- Olara official interiors / residences / vision pages:
  - `https://www.olarawestpalmbeach.com/interiors/`
  - `https://www.olarawestpalmbeach.com/residences/`
  - `https://www.olarawestpalmbeach.com/vision/`
- World Red Eye Olara coverage: `https://worldredeye.com/2026/04/wre-news-savanna-plans-26-story-olara-tower-with-private-marina-in-west-palm-beach/`
- South Flagler House official site and team / architecture pages:
  - `https://www.southflaglerhouse.com/`
  - `https://www.southflaglerhouse.com/team/`
  - `https://www.southflaglerhouse.com/architecture-design`
- Florida YIMBY South Flagler House topping-out coverage: `https://floridayimby.com/2025/11/south-flagler-house-tops-out-at-1355-south-flagler-drive-in-west-palm-beach.html`
- Alba Palm Beach official site and press/floorplan materials: `https://www.albapalmbeach.com/`
- Alba progress / team / penthouse source pages:
  - `https://www.albapalmbeach.com/press/alba-tops-off-in-west-palm-beach`
  - `https://floridayimby.com/2025/08/construction-progresses-on-22-story-alba-palm-beach-at-4714-north-flagler-drive-in-northwood-west-palm-beach.html`
  - `https://www.albapalmbeach.com/press/lower-penthouse-collection-debuts-at-alba-palm-beach`
- Shorecrest official site and Related Ross sources:
  - `https://www.shorecrestwpb.com/`
  - `https://www.shorecrestwpb.com/team`
  - `https://www.relatedross.com/our-company/properties/shorecrest`
  - `https://www.relatedross.com/press-releases/2026-02-18/related-ross-secures-157-million-construction-loan-shorecrest-west-palm`
- Internal source catalog: `research/source-material-review/project-source-catalog.json`
- Current local assets under `public/projects/{olara,south-flagler-house,alba-palm-beach,shorecrest}/media/`

## Page Direction Applied

### Olara

- Repositioned as active North Flagler waterfront living with marina, wellness, dining, and social energy.
- Removed repeated resort/marina phrasing across intro, Buyer Lens, residences, amenities, and location.
- Expanded team cards to buyer-facing notes for Savanna, Arquitectonica, Gabellini Sheppard, EDSA, SavCon/Gilbane, and Jose Andres Group.
- Latest Coverage now has an Olara-specific article first, with North Flagler resort/luxury fallback rules.

### South Flagler House

- Repositioned around composed South Flagler formality, Palm Beach-adjacent scale, RAMSA architecture, Related Ross, Pembrooke & Ives, and private-club depth.
- Reduced repeated "legacy / estate / formal" wording and used more concrete buyer decision criteria.
- Expanded team cards for Related Ross, RAMSA, Pembrooke & Ives, and SMI Landscape Architecture.
- Latest Coverage prioritizes South Flagler House topping-out / construction progress before South Flagler corridor context.

### Alba Palm Beach

- Repositioned as the boutique North Flagler waterfront alternative with 55 residences, direct Intracoastal orientation, and townhome-style options.
- Removed copy that made Alba sound like a smaller Olara; the page now leads with proportion, direct water, and quieter residential rhythm.
- Expanded only sourced team cards: BGI Companies / Kenneth Baboun, Blue Road, Spina O'Rourke + Partners, Schmidt Nichols, Moss Construction, and One Sotheby's International Realty.
- Latest Coverage now includes Alba-specific construction progress and boutique/waterfront fallback behavior.

### Shorecrest

- Kept public-safe source confidence explicit.
- Moved the page into a source-aware "what we know / what needs confirmation" posture.
- Added team/source cards only where current public sources support them: Related Ross, Roger Ferris + Partners, Rottet Studio, DS Boca, and Related Sales / Corcoran Sunshine context.
- Latest Coverage prioritizes Shorecrest-specific Related Ross financing coverage, then tightly related North Flagler / Related Ross waterfront pipeline context.

## Image Audit

| Page | Section | Current image | Match? | Action |
|---|---|---|---|---|
| Olara | Hero | `olara-hero-exterior-1536x1024.jpg` | Yes | Keep building identity and waterfront context. |
| Olara | Residences | `olara-residence-living-room-moonlight-1600x1067.jpg`, `olara-residence-kitchen-evening-1600x1067.jpg`, `olara-residence-primary-bath-1600x1067.jpg` | Yes | Force residence gallery to interiors/views. |
| Olara | Amenities | Gym, spa, hot/cold plunge, pool veranda, marina, pool deck images | Yes | Force amenity tiles to wellness, pool, dining/marina lifestyle roles. |
| Olara | Location | Map panel | Yes | Keep map as location module. |
| South Flagler House | Hero | `user-provided-south-flagler-house-hero.jpg` | Yes | Keep as formal waterfront identity image. |
| South Flagler House | Residences | Penthouse living, kitchen, primary bedroom imported images | Yes | Replace generic exterior sequence with residence-scale imagery. |
| South Flagler House | Amenities | Pool, private club, wellness, entrance, penthouse deck images | Yes | Replace repeated exterior/detail emphasis with club-depth imagery. |
| South Flagler House | Location | Map panel | Yes | Keep map as South Flagler setting module. |
| Alba Palm Beach | Hero | `alba-hero.jpg` | Yes | Keep direct waterfront aerial identity. |
| Alba Palm Beach | Residences | Aerial waterfront, exterior sketch, waterfront rendering | Partial | Use best existing approved assets; note limited interior asset depth. |
| Alba Palm Beach | Amenities | Waterfront terrace, pool/water edge, boutique building rhythm | Partial | Use existing assets without inventing amenity claims; recommend adding residence/townhome interiors later. |
| Alba Palm Beach | Location | Map panel | Yes | Keep map as Northwood/North Flagler setting module. |
| Shorecrest | Hero | `user-provided-shorecrest-hero.jpg` | Yes | Keep waterfront tower identity. |
| Shorecrest | Residences | Living room rendering, residence interior, waterfront exposure | Yes | Force residence section away from sponsor-generic images. |
| Shorecrest | Amenities | Pool/amenity context, dining/lounge reference, outdoor setting plus placeholders | Partial | Use only sourced images and placeholders for packet-dependent items. |
| Shorecrest | Location | Map panel | Yes | Keep map as North Flagler setting module. |

## Typography / Module Notes

- Reused Ritz calmer project-page typography rather than introducing a new visual system.
- Extended six-card team rendering to Olara, South Flagler House, Alba, and Shorecrest where supported.
- Section headings remain calmer than the hero; team/source confidence text remains secondary.
- Latest Coverage cards keep one internal `Read Update` action.

## Remaining Recommendations

- Alba needs stronger approved residence/townhome interiors if available from an official media packet.
- Shorecrest should stay source-aware until current offering documents confirm pricing, delivery, service inclusions, fees, parking, storage, and line availability.
- After deploy, verify Cloudflare serves the same local image paths used in the forced section galleries.
