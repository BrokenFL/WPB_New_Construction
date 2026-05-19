# Authorized Asset Resize Plan

Generated: 2026-05-18T15:19:47.146Z

This is a plan-only artifact. It does not generate, resize, publish, or alter image assets.

## Summary

- Authorized source assets: 193
- Planned derivatives: 772
- Blocked/non-authorized assets: 0
- Projects with authorized assets: 21

## Authorization Rule

Only assets with explicit positive asset-level clearance text or an authorized project entry in the reviewed asset tracker are included. Source availability alone is not authorization.

## Future Asset-Agent Command

```bash
node research/scripts/plan-authorized-asset-resize.mjs --write
```

The future image agent should consume `research/source-material-review/authorized-asset-resize-plan.json`, generate only listed derivatives, preserve the `credit` field beside every output, and stop if any source asset is missing or no longer explicitly authorized.

## Variant Targets

- hero: 1920px wide, webp, quality 82
- card: 960px wide, webp, quality 82
- thumb: 480px wide, webp, quality 80
- og: 1200x630, jpg, quality 84

## Authorized Assets

### Alba Palm Beach

- research/asset-library/projects/alba-palm-beach/images/candidates/01--official-candidate--albapalmbeach.com--11aa06d4.jpg | Source: Alba Palm Beach official project site
- research/asset-library/projects/alba-palm-beach/images/candidates/02--official-candidate--albapalmbeach.com--7ba18948.jpg | Source: Alba Palm Beach official project site
- research/asset-library/projects/alba-palm-beach/images/candidates/03--official-candidate--albapalmbeach.com--74f2d493.png | Source: Alba Palm Beach official project site
- research/asset-library/projects/alba-palm-beach/images/candidates/04--official-candidate--albapalmbeach.com--c0fe2ffd.jpg | Source: Alba Palm Beach official project site
- /projects/alba-palm-beach/media/alba-exterior-sketch.jpg | Source: Alba Palm Beach official project site
- /projects/alba-palm-beach/media/alba-hero.jpg | Source: Alba Palm Beach official project site
- /projects/alba-palm-beach/media/card.jpg | Source: source to be confirmed

### Alba Reserve

- research/asset-library/projects/alba-reserve/images/candidates/01--official-candidate--static.therealdeal.com--ad0ee3bd.jpg | Source: The Real Deal
- research/asset-library/projects/alba-reserve/images/candidates/02--official-candidate--static.therealdeal.com--1839ae2d.jpg | Source: The Real Deal
- research/asset-library/projects/alba-reserve/images/candidates/03--official-candidate--static.therealdeal.com--0682cfbf.jpg | Source: The Real Deal
- research/asset-library/projects/alba-reserve/images/candidates/04--official-candidate--static.therealdeal.com--6823e964.jpg | Source: The Real Deal
- /projects/alba-reserve/media/card.jpg | Source: source to be confirmed

### Mandarin Oriental Residences, West Palm Beach

- research/asset-library/projects/mandarin-oriental/images/candidates/01--official-candidate--storage.googleapis.com--89f03894.webp | Source: Mandarin Oriental Residences, West Palm Beach official project site
- research/asset-library/projects/mandarin-oriental/images/candidates/02--official-candidate--media.ffycdn.net--45becc7d.webp | Source: Mandarinoriental
- research/asset-library/projects/mandarin-oriental/images/candidates/03--official-candidate--greatgulfstrapi.blob.core.windows.net--f999b056.jpg | Source: Greatgulfgroup
- research/asset-library/projects/mandarin-oriental/images/candidates/04--official-candidate--greatgulfstrapi.blob.core.windows.net--20852886.jpg | Source: Greatgulfgroup
- /projects/mandarin-oriental/media/mandarin-oriental-hero.webp | Source: source to be confirmed
- /projects/mandarin-oriental/media/mandarin-oriental-podium.jpg | Source: source to be confirmed
- /projects/mandarin-oriental/media/mandarin-oriental-residence.webp | Source: source to be confirmed

### Olara

- research/asset-library/projects/olara/images/candidates/01--official-candidate--d3af2gfyi5943v.cloudfront.net--0da08560.jpg | Source: Olara official project site
- research/asset-library/projects/olara/images/candidates/02--official-candidate--d3af2gfyi5943v.cloudfront.net--7ba74780.jpg | Source: Olara official project site
- research/asset-library/projects/olara/images/candidates/03--official-candidate--d3af2gfyi5943v.cloudfront.net--94740545.jpg | Source: Olara official project site
- research/asset-library/projects/olara/images/candidates/04--official-candidate--d3af2gfyi5943v.cloudfront.net--5b7f77f4.jpg | Source: Olara official project site
- /projects/olara/media/olara-amenity-gym-2400x1600.png | Source: supplied project asset
- /projects/olara/media/olara-amenity-hot-cold-plunge-2400x1600.png | Source: supplied project asset
- /projects/olara/media/olara-amenity-pool-veranda-refreshments-2400x1600.png | Source: supplied project asset
- /projects/olara/media/olara-amenity-rooftop-pool-reading-2400x1600.png | Source: supplied project asset
- /projects/olara/media/olara-amenity-spa-relaxation-2400x1600.png | Source: supplied project asset
- /projects/olara/media/olara-arrival-valet-lobby-2400x1600.png | Source: supplied project asset
- /projects/olara/media/olara-gallery-card-pool-1122x1402.png | Source: supplied project asset
- /projects/olara/media/olara-gallery-card-pool-1600x2000.png | Source: supplied project asset
- /projects/olara/media/olara-hero-exterior-1536x1024.png | Source: supplied project asset
- /projects/olara/media/olara-logo-monogram-2000x2000.png | Source: supplied project asset
- /projects/olara/media/olara-marina-boat-dock-2400x1600.png | Source: supplied project asset
- /projects/olara/media/olara-mobile-hero-exterior-1080x1350.png | Source: supplied project asset
- /projects/olara/media/olara-residence-kitchen-evening-2400x1600.png | Source: supplied project asset
- /projects/olara/media/olara-residence-living-room-moonlight-2400x1600.png | Source: supplied project asset
- /projects/olara/media/olara-residence-primary-bath-2400x1600.png | Source: supplied project asset
- /projects/olara/media/olara-residence-primary-bath-detail-864x1024.jpg | Source: supplied project asset
- /projects/olara/media/olara-residence-terrace-sunrise-2400x1600.png | Source: supplied project asset
- /projects/olara/media/olara-view-balcony-intracoastal-2400x1600.png | Source: supplied project asset
- /projects/olara/media/olara-view-east-intracoastal-ocean-2400x1600.png | Source: supplied project asset

### Rybovich Marina Redevelopment

- research/asset-library/projects/rybovich-marina/images/candidates/01--official-candidate--e1.nmcdn.io--9c1ae4c2.webp | Source: Kpf
- research/asset-library/projects/rybovich-marina/images/candidates/02--official-candidate--e1.nmcdn.io--ef0589ba.webp | Source: Kpf
- research/asset-library/projects/rybovich-marina/images/candidates/03--official-candidate--kpf.com--7e3d9a88.webp | Source: Kpf
- research/asset-library/projects/rybovich-marina/images/candidates/04--official-candidate--e1.nmcdn.io--7e6b919a.webp | Source: Kpf
- /projects/rybovich-marina/media/card.webp | Source: source to be confirmed

### Shorecrest

- research/asset-library/projects/shorecrest/images/candidates/01--official-candidate--shorecrestwpb.com--26140aef.png | Source: Shorecrest official project site
- research/asset-library/projects/shorecrest/images/candidates/02--official-candidate--shorecrestwpb.com--5ac3a6fb.png | Source: Shorecrest official project site
- research/asset-library/projects/shorecrest/images/candidates/03--official-candidate--shorecrestwpb.com--7be725ea.png | Source: Shorecrest official project site
- research/asset-library/projects/shorecrest/images/candidates/04--official-candidate--shorecrestwpb.com--29553731.jpg | Source: Shorecrest official project site
- /projects/shorecrest/media/card.png | Source: source to be confirmed
- /projects/shorecrest/media/shorecrest-exterior-card.jpg | Source: Shorecrest official project site
- /projects/shorecrest/media/shorecrest-exterior-hero.jpg | Source: Shorecrest official project site
- /projects/shorecrest/media/shorecrest-residence.png | Source: Shorecrest official project site
- /projects/shorecrest/media/user-provided-shorecrest-card.jpg | Source: Shorecrest official project site
- /projects/shorecrest/media/user-provided-shorecrest-hero.jpg | Source: Shorecrest official project site

### The Ritz-Carlton Residences, West Palm Beach

- research/asset-library/projects/ritz-carlton-wpb/images/candidates/01--official-candidate--theresidenceswestpalmbeach.com--b05ef334.jpg | Source: The Ritz-Carlton Residences, West Palm Beach official project site
- research/asset-library/projects/ritz-carlton-wpb/images/candidates/02--official-candidate--theresidenceswestpalmbeach.com--36dd5172.jpg | Source: The Ritz-Carlton Residences, West Palm Beach official project site
- research/asset-library/projects/ritz-carlton-wpb/images/candidates/03--official-candidate--theresidenceswestpalmbeach.com--fcfe6cb5.jpg | Source: The Ritz-Carlton Residences, West Palm Beach official project site
- research/asset-library/projects/ritz-carlton-wpb/images/candidates/04--official-candidate--theresidenceswestpalmbeach.com--228a51e1.jpg | Source: The Ritz-Carlton Residences, West Palm Beach official project site
- /projects/ritz-carlton-wpb/media/ritz-amenity-fitness-center-2400x1600.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-amenity-pool-cabanas-2400x1600.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-arrival-porte-cochere-evening-2400x1600.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-arrival-porte-cochere-two-cars-2400x1600.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-evening-aerial-road-motion-2400x1600.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-gallery-card-waterfront-tower-1600x2000.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-hero-waterfront-building-2880x1800.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-lobby-lounge-waterfront-2400x1600.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-lobby-service-2400x1600.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-mobile-hero-tower-sunset-1080x1350.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-residence-kitchen-entertaining-2400x1600.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-residence-living-room-sunrise-2400x1600.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-residence-primary-bath-2400x1600.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-view-balcony-night-2400x1600.png | Source: supplied project asset
- /projects/ritz-carlton-wpb/media/ritz-view-intracoastal-day-2400x1600.png | Source: supplied project asset

### 15 CityPlace

- research/asset-library/projects/15-cityplace/images/candidates/01--official-candidate--relatedross.com--f0cd3d83.jpg | Source: 15 CityPlace official project site
- research/asset-library/projects/15-cityplace/images/candidates/02--official-candidate--relatedross.com--07ea9ff2.jpg | Source: 15 CityPlace official project site
- research/asset-library/projects/15-cityplace/images/candidates/03--official-candidate--relatedross.com--537496e3.jpg | Source: 15 CityPlace official project site
- research/asset-library/projects/15-cityplace/images/candidates/04--official-candidate--relatedross.com--959d6de5.jpg | Source: 15 CityPlace official project site
- /projects/15-cityplace/media/card.jpg | Source: source to be confirmed

### Banyan Tree Residences West Palm Beach

- research/asset-library/projects/banyan-tree/images/candidates/01--official-candidate--admin.banyantreeresidenceswpb.com--cc4fad1c.png | Source: Banyan Tree Residences West Palm Beach official project site
- research/asset-library/projects/banyan-tree/images/candidates/02--official-candidate--admin.banyantreeresidenceswpb.com--639915ad.png | Source: Banyan Tree Residences West Palm Beach official project site
- research/asset-library/projects/banyan-tree/images/candidates/03--official-candidate--admin.banyantreeresidenceswpb.com--188631da.png | Source: Banyan Tree Residences West Palm Beach official project site
- research/asset-library/projects/banyan-tree/images/candidates/04--official-candidate--admin.banyantreeresidenceswpb.com--bb3767c4.png | Source: Banyan Tree Residences West Palm Beach official project site
- /projects/banyan-tree/media/card.png | Source: source to be confirmed
- /projects/banyan-tree/media/user-provided-banyan-tree-card.jpg | Source: source to be confirmed
- /projects/banyan-tree/media/user-provided-banyan-tree-hero.jpg | Source: source to be confirmed

### Mr. C Hotel & Residences West Palm Beach

- research/asset-library/projects/mr-c/images/candidates/01--official-candidate--i0.wp.com--83197a3b.webp | Source: Mr. C Hotel & Residences West Palm Beach official project site
- research/asset-library/projects/mr-c/images/candidates/02--official-candidate--i0.wp.com--25ed96c3.webp | Source: Mr. C Hotel & Residences West Palm Beach official project site
- research/asset-library/projects/mr-c/images/candidates/03--official-candidate--i0.wp.com--dc1588f7.webp | Source: Mr. C Hotel & Residences West Palm Beach official project site
- research/asset-library/projects/mr-c/images/candidates/04--official-candidate--mrcresidenceswpb.com--70dd69fb.jpg | Source: Mr. C Hotel & Residences West Palm Beach official project site
- /projects/mr-c/media/card.jpg | Source: source to be confirmed
- /projects/mr-c/media/mr-c-hero.jpg | Source: Mr. C Hotel & Residences West Palm Beach official project site
- /projects/mr-c/media/mr-c-residence.webp | Source: Mr. C Hotel & Residences West Palm Beach official project site

### Related Ross Fern Street / South Dixie Condo

- research/asset-library/projects/related-ross-fern-street/images/candidates/01--official-candidate--static.therealdeal.com--c00cedb5.jpg | Source: The Real Deal
- research/asset-library/projects/related-ross-fern-street/images/candidates/02--official-candidate--static.therealdeal.com--98648d22.jpg | Source: The Real Deal
- research/asset-library/projects/related-ross-fern-street/images/candidates/03--official-candidate--static.therealdeal.com--4ba16752.jpg | Source: The Real Deal
- research/asset-library/projects/related-ross-fern-street/images/candidates/04--official-candidate--static.therealdeal.com--ec1a496a.jpg | Source: The Real Deal
- /projects/related-ross-fern-street/media/card.jpg | Source: source to be confirmed

### The Berkeley Palm Beach

- research/asset-library/projects/berkeley/images/candidates/01--official-candidate--floridayimby.com--24582688.jpg | Source: Florida YIMBY
- research/asset-library/projects/berkeley/images/candidates/02--official-candidate--floridayimby.com--85a3cd9f.jpg | Source: Florida YIMBY
- research/asset-library/projects/berkeley/images/candidates/03--official-candidate--floridayimby.com--6ea8b79a.jpg | Source: Florida YIMBY
- research/asset-library/projects/berkeley/images/candidates/04--official-candidate--floridayimby.com--d14ec29e.jpg | Source: Florida YIMBY
- /projects/berkeley/docs/floorplans/penthouse-floorplan-template--a68d7efe.jpg | Source: source to be confirmed
- /projects/berkeley/docs/floorplans/residence-a-floorplan-template--3f71b9ce.jpg | Source: source to be confirmed
- /projects/berkeley/docs/floorplans/residence-b-floorplan-template--9d9ba081.jpg | Source: source to be confirmed
- /projects/berkeley/docs/floorplans/residence-c-floorplan-template--b089a348.jpg | Source: source to be confirmed
- /projects/berkeley/docs/floorplans/residence-d-floorplan-template--904ee317.jpg | Source: source to be confirmed
- /projects/berkeley/docs/floorplans/residence-e-floorplan-template--c3bd0c2e.jpg | Source: source to be confirmed
- /projects/berkeley/docs/floorplans/residence-f-floorplan-template--5c0f8efd.jpg | Source: source to be confirmed
- /projects/berkeley/docs/floorplans/residence-g-floorplan-template--95ec6883.jpg | Source: source to be confirmed
- /projects/berkeley/media/card.jpg | Source: source to be confirmed

### NORA House

- research/asset-library/projects/nora-house/images/candidates/01--official-candidate--norahouse.com--7f3c7c65.jpg | Source: NORA House official project site
- research/asset-library/projects/nora-house/images/candidates/02--official-candidate--norahouse.com--a2ef2708.webp | Source: NORA House official project site
- research/asset-library/projects/nora-house/images/candidates/03--official-candidate--norahouse.com--aaf83d65.jpg | Source: NORA House official project site
- research/asset-library/projects/nora-house/images/candidates/04--official-candidate--norahouse.com--3fa1f332.jpg | Source: NORA House official project site
- /projects/nora-house/docs/floorplans/residence-01-floorplan--1f9ee4f9.webp | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-02-floorplan--8eaf9a11.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-03-floorplan--3f2cb001.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-04-floorplan--1a34d859.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-05-floorplan--7b476826.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-06-floorplan--36e6d64f.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-07-floorplan--82bb861e.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-08-floorplan--5a6dbe79.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-09-floorplan--4d4f0e1c.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-10-floorplan--f630ef36.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-11-floorplan--dc05c90e.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-12-floorplan--e5e100a6.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-13-floorplan--46f6c2f2.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-14-floorplan--daae34c8.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-15-floorplan--0717f2fa.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-16-floorplan--ca744524.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/residence-17-floorplan--8ef533db.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-401-floorplan--ac6acc9c.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-402-floorplan--770a3c13.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-403-floorplan--db1cd849.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-404-floorplan--bf2691cd.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-405-floorplan--549f79c3.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-406-floorplan--18b8b27f.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-407-floorplan--cd216b95.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-409-floorplan--dfaf5596.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-410-floorplan--c9a0d4e8.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-412-floorplan--0d520fbd.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-413-floorplan--e8fddd07.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-414-floorplan--83c5f27b.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-415-floorplan--7b2cce5e.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-416-floorplan--e8ea896d.jpg | Source: source to be confirmed
- /projects/nora-house/docs/floorplans/terrace-417-floorplan--b4dd503f.jpg | Source: source to be confirmed
- /projects/nora-house/media/card.jpg | Source: source to be confirmed
- /projects/nora-house/media/nora-hero.jpg | Source: NORA House official project site
- /projects/nora-house/media/nora-street.webp | Source: NORA House official project site
- /projects/nora-house/media/user-provided-nora-house-card.jpg | Source: NORA House official project site
- /projects/nora-house/media/user-provided-nora-house-hero.jpg | Source: NORA House official project site

### Edgeworth North Tower

- research/asset-library/projects/edgeworth-north/images/candidates/01--official-candidate--images.squarespace-cdn.com--70310756.webp | Source: Edgeworth North Tower official project site
- research/asset-library/projects/edgeworth-north/images/candidates/02--official-candidate--images.squarespace-cdn.com--95646ee5.webp | Source: Edgeworth North Tower official project site
- research/asset-library/projects/edgeworth-north/images/candidates/03--official-candidate--images.squarespace-cdn.com--977977f0.webp | Source: Edgeworth North Tower official project site
- research/asset-library/projects/edgeworth-north/images/candidates/04--official-candidate--images.squarespace-cdn.com--54cfbcd7.webp | Source: Edgeworth North Tower official project site
- /projects/edgeworth-north/media/card.webp | Source: source to be confirmed

### Edgeworth South Tower

- research/asset-library/projects/edgeworth-south/images/candidates/01--official-candidate--images.squarespace-cdn.com--70310756.webp | Source: Edgeworth South Tower official project site
- research/asset-library/projects/edgeworth-south/images/candidates/02--official-candidate--images.squarespace-cdn.com--95646ee5.webp | Source: Edgeworth South Tower official project site
- research/asset-library/projects/edgeworth-south/images/candidates/03--official-candidate--images.squarespace-cdn.com--977977f0.webp | Source: Edgeworth South Tower official project site
- research/asset-library/projects/edgeworth-south/images/candidates/04--official-candidate--images.squarespace-cdn.com--54cfbcd7.webp | Source: Edgeworth South Tower official project site

### Fort Partners South Flagler Assemblage

- research/asset-library/projects/fort-partners-south-flagler/images/candidates/01--official-candidate--static.therealdeal.com--a913c60e.jpg | Source: The Real Deal
- research/asset-library/projects/fort-partners-south-flagler/images/candidates/02--official-candidate--static.therealdeal.com--eb161491.jpg | Source: The Real Deal
- research/asset-library/projects/fort-partners-south-flagler/images/candidates/03--official-candidate--static.therealdeal.com--670e054d.jpg | Source: The Real Deal
- research/asset-library/projects/fort-partners-south-flagler/images/candidates/04--official-candidate--static.therealdeal.com--b733a111.jpg | Source: The Real Deal
- /projects/fort-partners-south-flagler/media/card.jpg | Source: source to be confirmed

### Forté on Flagler

- research/asset-library/projects/forte-on-flagler/images/candidates/01--official-candidate--fortewpb.com--b5b863ab.png | Source: Forté on Flagler official project site
- research/asset-library/projects/forte-on-flagler/images/candidates/02--official-candidate--fortewpb.com--9a29aed6.jpg | Source: Forté on Flagler official project site
- research/asset-library/projects/forte-on-flagler/images/candidates/03--official-candidate--fortewpb.com--d4e726f5.jpg | Source: Forté on Flagler official project site
- research/asset-library/projects/forte-on-flagler/images/candidates/04--official-candidate--fortewpb.com--595c88a6.jpg | Source: Forté on Flagler official project site
- /projects/forte-on-flagler/media/card.jpg | Source: source to be confirmed
- /projects/forte-on-flagler/media/card.png | Source: source to be confirmed

### La Clara

- research/asset-library/projects/la-clara/images/candidates/01--official-candidate--stantec.com--2554e025.jpg | Source: Stantec
- research/asset-library/projects/la-clara/images/candidates/02--official-candidate--stantec.com--282d9cb6.jpg | Source: Stantec
- research/asset-library/projects/la-clara/images/candidates/03--official-candidate--stantec.com--bb94fda2.jpg | Source: Stantec
- research/asset-library/projects/la-clara/images/candidates/04--official-candidate--stantec.com--81e36ca3.jpg | Source: Stantec
- /projects/la-clara/media/card.jpg | Source: source to be confirmed

### Maison d'Or

- research/asset-library/projects/maison-dor/images/candidates/01--official-candidate--livemaisondor.com--5af88e37.jpg | Source: Maison d'Or official project site
- research/asset-library/projects/maison-dor/images/candidates/02--official-candidate--livemaisondor.com--24b9844b.jpg | Source: Maison d'Or official project site
- research/asset-library/projects/maison-dor/images/candidates/03--official-candidate--livemaisondor.com--8b49905d.webp | Source: Maison d'Or official project site
- research/asset-library/projects/maison-dor/images/candidates/04--official-candidate--livemaisondor.com--e7e09b44.jpg | Source: Maison d'Or official project site
- /projects/maison-dor/media/card.jpg | Source: source to be confirmed

### Portofino South / Flagler Yacht Club Buyout Watch

- research/asset-library/projects/portofino-flagler-yacht-club/images/candidates/01--official-candidate--static.therealdeal.com--9a39e6c8.jpg | Source: The Real Deal
- research/asset-library/projects/portofino-flagler-yacht-club/images/candidates/02--official-candidate--static.therealdeal.com--d96aee82.jpg | Source: The Real Deal
- research/asset-library/projects/portofino-flagler-yacht-club/images/candidates/03--official-candidate--static.therealdeal.com--c0a3acb5.jpg | Source: The Real Deal
- research/asset-library/projects/portofino-flagler-yacht-club/images/candidates/04--official-candidate--static.therealdeal.com--ff76256e.jpg | Source: The Real Deal
- /projects/portofino-flagler-yacht-club/media/card.jpg | Source: source to be confirmed

### South Flagler House North Tower

- research/asset-library/projects/south-flagler-house-north/images/candidates/01--official-candidate--southflaglerhouse.com--5f3223c8.jpg | Source: South Flagler House North Tower official project site
- research/asset-library/projects/south-flagler-house-north/images/candidates/02--official-candidate--southflaglerhouse.com--4ad798de.jpg | Source: South Flagler House North Tower official project site
- research/asset-library/projects/south-flagler-house-north/images/candidates/03--official-candidate--southflaglerhouse.com--780c0404.png | Source: South Flagler House North Tower official project site
- research/asset-library/projects/south-flagler-house-north/images/candidates/04--official-candidate--southflaglerhouse.com--61e4fc9d.png | Source: South Flagler House North Tower official project site


## Blocked Inputs

