# Luxury WPB New Construction Interface Design

Strategic design specification for the existing Vite/Cesium prototype in this workspace. This document translates current market research, luxury UX benchmarks, and the app's current 3D skyline/catalog capabilities into a high-end front-end direction for West Palm Beach new construction.

Date basis: May 10, 2026.

## 1. Market Intelligence

### Local Luxury Audit

West Palm Beach and Palm Beach luxury real estate sites are strong at individual project storytelling, but most still behave like sales brochures or listing directories rather than command-center products.

**Douglas Elliman**

- Useful pattern: clear global luxury brand architecture, direct pathways for buy/rent/sell, dedicated new-development brand category, market reports, magazines, and editorial content.
- Gap: the public new-development experience is not a deep cross-project intelligence interface. It points users into brand content and listings but does not make the WPB pipeline visually comparable in one place.
- Takeaway: borrow the credibility layer, not the generic portal feel.

**Corcoran and Corcoran Sunshine**

- Useful pattern: Corcoran new-development detail pages foreground project status, carousel/video, agent contact, brochure download, and a simple inquiry path. Corcoran Sunshine positions new-development sales around elite teams, tailored strategy, industry data, planning expertise, cutting-edge marketing, and a global network.
- Gap: the UI emphasizes a single project's sales funnel more than market-wide discovery.
- Takeaway: pair the app's map-first comparison with Corcoran Sunshine-level advisory credibility.

**Palm Beach Luxury**

- Useful pattern: the strongest local competitive reference for aggregated new construction. It separates lifestyle, price, neighborhood, new developments, insights, services, and FAQ. It includes filters, project timelines, comparison tables, deposit guidance, architect names, amenities, and market education.
- Gap: the experience is content-rich but not as cinematic or spatially immersive as the current Cesium prototype can become.
- Takeaway: use Palm Beach Luxury's buyer-intelligence depth as the minimum content bar, then exceed it with map-first spatial comparison.

**Olara**

- Useful pattern: project-first storytelling through resort positioning, waterfront lifestyle, wellness/dining, private marina, amenities, downloads, press, and direct inquiry.
- Gap: it is intentionally single-project and does not help buyers compare Olara against nearby Flagler projects.
- Takeaway: use Olara as a model for refined project modules and amenity storytelling.

**Ritz-Carlton Residences West Palm Beach**

- Useful pattern: prestige service story, direct schedule CTA, floor-plan and brochure downloads, amenity narrative, neighborhood value, and strong brand reassurance.
- Gap: the detail structure is polished but linear.
- Takeaway: treat service, downloads, and schedule actions as persistent conversion modules in every project detail view.

**Shorecrest**

- Useful pattern: Related Ross credibility, architecture/team narrative, project downloads, floorplans, waterfront living, and a concise inquiry path.
- Gap: JavaScript-dependent presentation limits crawlable/portable content if not mirrored in metadata.
- Takeaway: the app should keep rich project content in structured data, then render it across map, gallery, detail, and news surfaces.

**South Flagler House**

- Useful pattern: legacy address positioning, architectural pedigree, private club amenities, lifestyle depth, broker toolkit, factsheet, and high-touch inquiry.
- Gap: the content is premium but not built for fast side-by-side comparison with other projects.
- Takeaway: preserve the aspirational editorial tone while adding investor-grade comparability.

### Global Benchmark

**ARO Dubai**

- Best-in-class pattern: map-based off-plan discovery with project filters, instant popups, buyer/agent tools, 360 tours, video tours, aerial tours, favorites, folders, CRM, and dashboard concepts.
- Relevance: Dubai off-plan UX is closer to what WPB new construction needs than generic U.S. residential search because buyers compare buildings before completion.
- Takeaway: Option B, the Interactive Hub, should be the strategic primary direction.

**LDN.one**

- Best-in-class pattern: London new-build inventory grouped by zone, borough, neighborhood, budget, developer incentives, heatmap-style pricing analysis, and direct booking.
- Relevance: it proves new construction can be navigated by geography, budget, and investor logic rather than only by listing cards.
- Takeaway: the WPB interface should support corridor, status, delivery year, and price-range filters.

**SERHANT**

- Best-in-class pattern: media-company energy, bold new-development editorial, listings mixed with content, press, video, and personality-led authority.
- Relevance: ultra-luxury buyers respond to market narrative and cultural confidence, not only square footage.
- Takeaway: the News and Magazine surfaces should make the platform feel current, informed, and high velocity.

**Luxury Presence Guidance**

- Best-in-class pattern: high-quality real imagery, mobile responsiveness, visible brand identity in the first viewport, fast load, clear UX, visible search/contact paths, IDX or live search where applicable, and typography systems that feel intentional and high-end.
- Relevance: validates the need for speed, legibility, mobile-first layout, and lead capture in addition to visual polish.
- Takeaway: cinematic must never mean slow, confusing, or CTA-light.

### Strategic Gap

The local market lacks an ultra-premium, map-first "new construction command center" for West Palm Beach. The app should own that gap by combining:

- spatial intelligence from the existing Cesium 3D city context;
- luxury editorial quality from single-project websites;
- comparison logic from local buyer guides;
- interactive filtering and lead capture inspired by Dubai/London new-build platforms.

## 2. Visual Identity

### Positioning

The interface should feel like a private advisory dashboard for waterfront development, not a generic listings portal. The tone is architectural, restrained, precise, and quietly cinematic.

### Palette

Use a high-contrast neutral system with coastal and architectural accents:

- **Obsidian** `#0b0f12`: primary deep background for map chrome and cinematic overlays.
- **Ivory** `#f4efe5`: main text color and light-surface background.
- **Warm limestone** `#d8c8aa`: secondary surface and project-detail warmth.
- **Muted bronze** `#9a7a4f`: premium accent for CTA outlines, active states, and data highlights.
- **Sea glass** `#8fb9ad`: map hover, waterfront badges, and calm informational states.
- **Ink gray** `#252a2d`: body text on light surfaces.
- **Signal coral** `#c86f58`: sparse urgency, construction status, and selected map object.

Avoid a black-and-gold cliché. Bronze should be used as a material accent, not a dominant theme.

### Typography

- **Display:** architectural serif for hero and project names. Candidates: Canela, Noe Display, Tiempos Headline, or an available system fallback such as Iowan Old Style.
- **UI/body:** clean geometric or variable sans. Candidates: Inter, Neue Haas Grotesk, Avenir Next, Proxima Nova, or system fallback.
- **Data labels:** uppercase microcopy may be used sparingly with 0.08em letter spacing. Do not use negative letter spacing.
- **Scale:** large display type only in true hero or immersive project-detail contexts. Keep map/tool labels compact and stable.

### Layout Principles

- Massive first-viewport image or map signal.
- Thin dividing rules instead of heavy containers.
- Glass overlays only where they preserve map/image context.
- No nested cards.
- Cards are reserved for repeated project/news items, modal drawers, and framed tools.
- Use full-width bands and constrained inner layouts for editorial sections.
- Let the project or map be the hero, not decorative gradients.

### Motion And Micro-Interactions

Motion should feel expensive through timing and restraint:

- Hover lift: `translateY(-2px)` with subtle shadow and 220-280ms cubic easing.
- Map pin hover: scale from 1 to 1.08, reveal compact preview, dim non-hovered pins.
- Detail transition: project sheet slides in from right on desktop, bottom sheet on mobile.
- Gallery reveal: image crossfade plus masked title reveal.
- News bento: gentle image zoom on hover, no excessive bouncing.
- Respect `prefers-reduced-motion`.

## 3. Core UX

### Primary Modes

**Map**

- Default experience and strongest competitive advantage.
- Uses the existing Cesium/Google 3D scene and current project data.
- Shows all tracked developments as styled 3D objects or pins.
- Provides filters for status, corridor, delivery year, completion phase, and asset type.

**Gallery**

- Image-led project browsing for users who want mood, architecture, and brand.
- Large media tiles with minimal text, status, delivery year, and CTA.
- Supports swipeable mobile browsing.

**News**

- Magazine-style current news and market updates.
- Bento grid with project financing, sales-gallery openings, construction milestones, press mentions, and new floor-plan drops.
- Every news item should link to a related project and contain a lead CTA.

**Project Detail**

- Immersive detail view opened from map, gallery, news, or direct URL.
- Modular layout: hero, facts, model/gallery, floor plans, amenities, timeline, location context, sources/downloads, inquiry.

### Navigation

Top-level navigation:

- `Map`
- `Gallery`
- `News`
- `Saved`
- `Inquire`

Inventory segmentation:

- `New Construction`: under construction and active pre-sales.
- `Completed Assets`: complete or resale-focused buildings.
- `Planning Pipeline`: concept, planning, entitled, and low-confidence tracked projects.
- `All`: unfiltered command-center view.

### Mobile-First Behavior

- Map occupies the top viewport.
- Asset feed becomes a bottom sheet with snap points.
- Filters become a horizontal chip row and a full-screen filter drawer.
- Lead CTA remains sticky at the bottom edge.
- Project detail opens as a full-screen route/sheet with a visible close/back affordance.
- No horizontal scrolling or text overflow at 390px width.

### Lead Generation Logic

V1 should be integration-ready, with no live CRM dependency.

Lead entry points:

- `Schedule private tour`
- `Request floor plans`
- `Download brochure`
- `Ask an advisor`
- `Compare this building`

Lead drawer fields:

- first name;
- last name;
- email;
- phone;
- buyer intent;
- target projects;
- preferred contact method;
- note.

Submit behavior:

- Validate client-side.
- Build a typed payload.
- Send through an adapter function that currently resolves locally or logs in development.
- Leave a single future integration seam for webhook/CRM submission.

## 4. Component Specs

### Interactive Map

Keep Cesium and Google Photorealistic 3D Tiles as the primary engine. Do not replace the stack with Mapbox in this design phase.

Important constraint: Google Photorealistic 3D Tiles are not styleable like Mapbox vector tiles. The luxury layer should come from:

- atmospheric scene setup;
- camera choreography;
- UI chrome;
- custom project pins;
- hover previews;
- status/filter overlays;
- selected-building emphasis;
- editorial bottom/right sheets.

Map component requirements:

- Custom project pin system with status color, delivery-year badge, and selected state.
- Hover preview with image, project name, corridor, status, delivery year, price range, and CTA.
- Scenario/corridor selector tied to current `proposalScenarios`.
- Light/dark UI mode toggle for controls and panels; map base layer remains constrained by Cesium/Google capabilities.
- Active building detail sheet with model/gallery handoff.
- Fallback visual state when Google key is absent and the app uses Cesium OSM buildings.

### Asset Cards

Cards should support:

- project name;
- corridor/location;
- status;
- delivery year;
- residence count;
- price range;
- confidence label;
- waterfront/private marina/hospitality/wellness badges;
- primary image;
- quick actions: `View`, `Compare`, `Inquire`.

Cards must be compact enough for scanning and refined enough for luxury perception. Avoid oversized marketing-card layouts in the map feed.

### Asset Detail Pages

The detail page should include:

- cinematic hero media or 3D model panel;
- project facts: address, status, delivery, floors, residences, price range, height, architect/designer;
- immersive gallery;
- floor-plan module with filtered links by bedroom/residence type when data exists;
- technical specs and development confidence;
- amenities grouped by lifestyle category;
- location context with saved Cesium camera or mini-map;
- source/download links;
- inquiry module.

### Current News

News uses a bento/magazine grid:

- large lead story for major project updates;
- compact cards for financing, construction milestones, floor-plan drops, sales-gallery news, and market reports;
- every item links to a project detail page when possible;
- include source/date/category metadata;
- keep the tone factual, timely, and advisory.

### Glassmorphism

Use frosted surfaces only for map controls, hover previews, and lead drawer headers:

- background: rgba surfaces with high enough contrast;
- backdrop blur: 16-24px;
- border: 1px solid low-opacity ivory/limestone;
- avoid stacking glass panels inside glass panels.

### Accessibility

- All interactive elements need accessible names.
- Maintain contrast for ivory-on-obsidian and ink-on-ivory text.
- Hover-only details must also be reachable through click/tap.
- Use semantic buttons for filters and CTAs.
- Motion must respect reduced-motion preferences.

## 5. Interfaces And Data

These are planning interfaces for the later app implementation. They should extend the existing `ProposalBuilding` and `ProposalScenario` model without requiring a backend.

```ts
export type CompletionPhase =
  | "Completed"
  | "New Construction"
  | "Planning Pipeline";

export type LeadIntent =
  | "schedule-tour"
  | "request-floor-plans"
  | "download-brochure"
  | "ask-advisor";

export type ProjectMedia = {
  type: "image" | "video" | "model" | "floor-plan";
  label: string;
  url: string;
  alt?: string;
  poster?: string;
};

export type NewsItem = {
  id: string;
  title: string;
  category:
    | "Construction"
    | "Financing"
    | "Sales Gallery"
    | "Floor Plans"
    | "Market Intelligence"
    | "Press";
  date: string;
  projectId?: string;
  summary: string;
  image?: string;
  url: string;
};

export type LeadPayload = {
  intent: LeadIntent;
  projectIds: string[];
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  preferredContactMethod: "email" | "phone" | "text";
  note?: string;
  sourceSurface: "map" | "gallery" | "news" | "project-detail";
  submittedAt: string;
};
```

Extend `ProposalBuilding` with optional fields:

```ts
priceRange?: string;
residenceCount?: number;
amenityHighlights?: string[];
media?: ProjectMedia[];
completionPhase?: CompletionPhase;
newsRefs?: string[];
```

V1 submit adapter:

```ts
export async function submitLead(payload: LeadPayload): Promise<{ ok: true }> {
  console.info("Lead payload ready for CRM integration", payload);
  return { ok: true };
}
```

## 6. Prototype Directions

### Option A: The Minimalist Gallery

**Selected creative direction.** Use this as the primary visual north star for the next implementation pass.

**Desired filename:** `public/concepts/option-a-minimalist-gallery.png`

**Rationale:** This direction would dominate local listing-heavy pages by making every tower feel like a collectible architectural asset. It is strongest for brand perception, private-client presentations, and high-end storytelling. The existing Cesium map should still remain available, but the first impression should shift from utility dashboard to image-led private gallery.

**Exact image-generation prompt:**

```text
Use case: ui-mockup
Asset type: High-fidelity desktop website concept for a luxury West Palm Beach new-construction real estate platform
Primary request: Create "Option A: The Minimalist Gallery" for a premium real estate interface.
Scene/backdrop: Full-bleed, sunlit waterfront architectural photography of West Palm Beach and Palm Beach Island, elegant new residential towers along the Intracoastal, realistic but not tied to any copyrighted building rendering.
Interface: Hidden/minimal navigation, thin-line typography, huge image-led project gallery, discreet project status labels, refined ivory and obsidian UI, warm limestone surfaces, muted bronze accent, sea-glass hover accents.
Layout: First viewport desktop web UI, 16:9 composition. Brand mark at top left as "WPB NEW CONSTRUCTION". Small top-right icons for map, gallery, news, inquire. Three large gallery panels with one selected project expanded and two partially visible.
Visible UI copy: "North Flagler", "South Flagler", "Downtown", "Private Advisory", "Request Floor Plans", "2027 Delivery", "Waterfront Residences".
Style: Ultra-slick, quiet luxury, generous whitespace, cinematic, architectural, editorial, realistic high-end product design.
Constraints: Make text legible and correctly spelled. No fake browser chrome. No people. No cartoon styling. No black-and-gold cliché. No cluttered cards.
```

### Option B: The Interactive Hub

**Desired filename:** `public/concepts/option-b-interactive-hub.png`

**Rationale:** This is the best fit for the existing Cesium app and the strongest market wedge because it solves cross-development comparison. It turns the current skyline prototype into a buyer/advisor command center.

**Exact image-generation prompt:**

```text
Use case: ui-mockup
Asset type: High-fidelity desktop web app concept for a luxury West Palm Beach new-construction 3D map platform
Primary request: Create "Option B: The Interactive Hub" for a premium real estate command center.
Scene/backdrop: Split-screen interface with a realistic 3D aerial map of West Palm Beach waterfront on the left, custom glowing project pins and subtle 3D massing towers; scrollable luxury asset feed on the right.
Interface: Cesium-style 3D map, glassmorphism map controls, custom pins with hover preview card, segmented filters for New Construction, Completed Assets, Planning Pipeline, All. Sticky lead CTA.
Layout: Desktop 16:9 app UI. Left 62 percent is live map. Right 38 percent is dense but elegant project feed. Bottom-left compact timeline by delivery year. Top navigation includes Map, Gallery, News, Saved, Inquire.
Visible UI copy: "Map", "Gallery", "News", "Saved", "Inquire", "New Construction", "Completed Assets", "Planning Pipeline", "All", "Shorecrest", "Olara", "Ritz-Carlton", "Schedule Private Tour".
Style: Ultra-slick, high contrast, premium advisory dashboard, restrained glass overlays, ivory text, obsidian map chrome, muted bronze and sea-glass accents.
Constraints: Make text legible and correctly spelled. No fake browser chrome. No clutter. No cartoon map. No overused black/gold styling. UI should feel buildable in the existing Vite/Cesium app.
```

### Option C: The Cinematic Magazine

**Desired filename:** `public/concepts/option-c-cinematic-magazine.png`

**Rationale:** This direction is strongest for SEO, authority, and market education. It makes the platform feel like the definitive editorial source on West Palm Beach's development boom while still routing users into project details and lead capture.

**Exact image-generation prompt:**

```text
Use case: ui-mockup
Asset type: High-fidelity desktop website concept for a luxury real estate editorial and new-construction platform
Primary request: Create "Option C: The Cinematic Magazine" for West Palm Beach new construction.
Scene/backdrop: Cinematic waterfront hero video frame showing morning light over the Intracoastal, luxury residential towers, and Palm Beach in the distance, with editorial overlays and parallax-style section hints.
Interface: Deep editorial layout, large hero headline, bento grid Current News section, immersive project story cards, subtle video controls, sticky advisory CTA, premium typography.
Layout: Desktop 16:9 first viewport with a full-bleed hero at top, a visible bento news grid peeking below, and a right-side vertical index of featured developments.
Visible UI copy: "Current News", "West Palm Beach Development Briefing", "Construction", "Financing", "Sales Gallery", "Floor Plans", "Ask an Advisor", "Read Market Update".
Style: Cinematic magazine, smooth parallax feel, high-end editorial, architectural, ivory/obsidian/limestone palette with muted bronze and sea-glass accents.
Constraints: Make text legible and correctly spelled. No fake browser chrome. No people. No decorative blobs. No cluttered template look. No black-and-gold cliché.
```

## 7. Implementation Notes For Existing App

Recommended build sequence after this design package:

1. Add view-state navigation for `Map`, `Gallery`, and `News` without changing the Cesium engine.
2. Reframe the first viewport around the selected Minimalist Gallery direction, with massive project imagery, hidden/minimal navigation, and refined project actions.
3. Keep the Cesium map as a secondary discovery mode rather than the default visual impression.
4. Extend the project data model with optional luxury metadata and derived `completionPhase`.
5. Add hover/click project previews on the map and a richer project detail sheet.
6. Add static `NewsItem` data and a bento news view.
7. Add the integration-ready lead drawer and `submitLead` adapter.
8. Use generated concept images only as visual direction, not production UI assets.

## 8. Test And Acceptance Plan

Design package acceptance:

- `design.md` covers market intelligence, visual identity, core UX, component specs, map constraints, lead flow, data/interface planning, three prototype prompts, assumptions, and sources.
- Three concept images are saved in `public/concepts/` with stable filenames.
- The three concepts are visually distinct and match the brief:
  - Option A: image-led minimalist gallery.
  - Option B: split-screen map command center.
  - Option C: cinematic editorial/magazine.

Future implementation acceptance:

- `npm run build` passes.
- Desktop layout works at 1440px.
- Tablet layout works around 1024px.
- Mobile layout works at 390px with no horizontal overflow.
- App has useful fallback behavior without `VITE_GOOGLE_MAPS_API_KEY`.
- Lead drawer validates fields and produces a typed `LeadPayload`.
- Project details remain accessible from map, gallery, and news.

## 9. Assumptions

- Generated visual concepts are design assets, not production code.
- Licensed real photography, renderings, and video will be swapped in later.
- Lead capture is integration-ready only in v1.
- Current project data remains the source of truth until a live CMS or CRM is introduced.
- The existing Cesium/Google 3D stack remains the map foundation.
- Source data and public availability may change, especially pricing, delivery dates, and project status.

## 10. Sources

- [Palm Beach Luxury new developments](https://www.palmbeachluxury.com/new-developments/)
- [Olara](https://www.olarawestpalmbeach.com/)
- [Ritz-Carlton Residences West Palm Beach](https://theresidenceswestpalmbeach.com/)
- [Shorecrest](https://www.shorecrestwpb.com/)
- [South Flagler House](https://www.southflaglerhouse.com/)
- [Corcoran 3550 South Ocean](https://www.corcoran.com/new-developments/for-sale/downtown/one-essex-crossing/10986)
- [Corcoran Sunshine](https://www.corcoransunshine.com/how-we-work/)
- [Luxury Presence 2026 real estate website features](https://www.luxurypresence.com/blogs/real-estate-website-features/)
- [Luxury Presence typography guidance](https://www.luxurypresence.com/blogs/brand-fonts-real-estate-website/)
- [ARO Dubai](https://aro.ae/)
- [LDN.one](https://www.ldn.one/)
- [SERHANT](https://serhant.com/)
