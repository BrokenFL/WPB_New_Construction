# Sprint 3 image decision and source basis

The final homepage uses the **existing user-provided Shorecrest project-page rendering**, unchanged: `/projects/shorecrest/media/user-provided-shorecrest-hero.jpg` (1280 × 955; 245,394 bytes; SHA-256 `af7734ab3607d38618bc9c2fbb1783463e2a2f975967dcd61e23bd1bd9f45319`). It was already bound to Shorecrest's public project page before this sprint; the project-page audit records “Yes / Keep waterfront tower identity.” The homepage now labels it “Shorecrest · North Flagler · Architectural rendering,” with rendering-specific alt text. CSS chooses a top/right crop and applies a readability scrim; no pixels, architecture, views, amenities or project facts were generated or altered.

The initial full-width bridge treatment improved composition but exposed the prior hero's softness. Two compact alternatives were rendered: Shorecrest and South Flagler House. Shorecrest had a clearer silhouette and more calm sky behind the headline on desktop/mobile. The 2200px Shorecrest performance candidate was **not selected**, because available metadata did not establish final public-use approval. The smaller, already page-bound user-provided source was reused instead. Existing generic source-library rights-review caveats remain unresolved; this sprint does not assert new licensing clearance or authorize publication of unused research assets.

The selected file is 384,720 bytes smaller than the preceding 630,114-byte homepage hero. This is a file-size comparison, not a measured loading-time or conversion improvement. Its 1280px native width still limits detail on large/high-density displays.

The original closing artwork `/assets/home/wpb-end-cap-bridge-v01.png` is unchanged, SHA-256 `2b27c45fac60037286a047f0ca0b27f9178d53a733658da1b7fd6737ebaf9ffd`. It is separate from the former hero JPG. No image-generation tool was needed, no new visual asset was published into the asset pipeline, and no new paid service was used.

## Historical inventory and narrow provenance check

The following collection record predates the final image decision above. Its initial recommendations are retained as evidence, not as the final implementation specification.

# Sprint 3 approved asset inventory

**Review date:** 2026-09-19  
**Checkout:** `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction`  
**Branch / HEAD:** `codex/site-overhaul-v2` / `431b57dede3a23840f9c893d7c5ae2bedcbb27c8`  
**Scope:** bounded review of existing approved public assets for the home editorial hero and supporting imagery. No source files, public assets, generated manifests, or image pipelines were changed. The inherited `M src/main.ts` worktree change was preserved.

The shortlist below was selected from the existing generated homepage publish manifest and visually inspected with `view_image`. The output dimensions and byte counts are for the files already in this checkout. Source paths are relative to the read-only asset-repository root `/Volumes/ExternalSSD/WPB_NewConstruction_Assets`; no new download or broad asset audit was performed.

## Recommendation

Use `/assets/home/wpb-waterfront-bridge-hero-v01.jpg` as the fact-first, full-width hero behind the solid masthead. On visual inspection it provides the strongest actual-place context: a West Palm Beach waterfront skyline and bridge. The approved manifest identifies its source and output dimensions, but does not certify whether the source is photographic or rendered; that classification is a visual assessment only. The public output is `1920×1080`, but its manifest source is `1280×720`, so it should be treated as an optimized/upscaled web output rather than native 1920px photographic detail.

The current 46%/54% split and 248px mobile strip documented below describe the base snapshot, not the selected Sprint 3 composition. The selected direction is a full-width hero with a solid masthead, with desktop and mobile crops art-directed around the bridge and skyline.

For a separate luxury-editorial treatment, the strongest existing approved family is:

- Desktop: `/assets/home/north-flagler-corridor-skyline-ultra-wide-v01.jpg`
- Mobile when the mobile frame can be taller/portrait: `/assets/home/north-flagler-corridor-skyline-vertical-v01.jpg`

That pair has the strongest premium panorama and crop coverage in the approved set by visual assessment. The source manifest records approved paths and dimensions; it does not independently classify the images as visualizations. If source/metadata review later approves concept labeling, use an explicit North Flagler concept/vision caption and do not imply that visible towers are built. The vertical file is the better mobile source when the full-width hero gets a taller portrait crop; it should not be forced into the base snapshot's shallow strip.

ImageGen is not recommended for this sprint. The approved repository already contains a strong wide/vertical family plus the bridge hero, and the selected full-width treatment does not require a fabricated derivative. A generated derivative would add provenance risk without solving an identified crop gap.

## Current home hero and loading audit

| Area | Current evidence | Implication for Sprint 3 |
| --- | --- | --- |
| Source selection | `src/data/homepageAssets.ts:2-4` points both `hero.desktop` and `hero.mobile` to `/assets/home/wpb-waterfront-bridge-hero-v01.jpg`. | The mobile slot is not currently a mobile-specific asset. Preserve this bridge binding unless a deliberate editorial concept choice is made. |
| Rendered hero | `src/main.ts:2376-2393` renders a `<picture>` with a mobile source, the desktop image, `width="1920"`, `height="1080"`, `loading="eager"`, `decoding="async"`, `fetchpriority="high"`, and `object-position: center center`. | The current browser runtime treats the bridge as the above-the-fold priority image. |
| Desktop composition in the base snapshot | `public/assets/styles/v2-editorial.css:45-52` currently makes `.home-hero` a 46% copy / 54% media grid with a 620px minimum height. The image is the right panel with `object-fit: cover`. | This is an audit of the pre-sprint base, not the selected direction. Sprint 3 calls for a full-width hero with a solid masthead; that frame preserves more of a wide panorama. |
| Mobile composition in the base snapshot | `public/assets/styles/v2-editorial.css:228-236` currently changes the hero to a column, with media first at `height: 248px; min-height: 248px`; the image remains `object-fit: cover; object-position: center center`. | This is a base snapshot only. The selected full-width treatment should use an intentional mobile crop/frame; do not let the existing shallow strip determine the asset choice. |
| Disk prerender | `dist/index.html` contains `<main class="static-prerender" data-static-prerender="home">` with static intro/guide content; it does not contain `.home-hero` or the hero image. | The hero is runtime-rendered and is not part of the disk static-prerender payload. This is separate from the eager/high-priority image request in `src/main.ts`. |
| Public file provenance | `data/generated_homepage_asset_publish_manifest.json:597-612` records the bridge source, output dimensions, hashes, and `action: "skipped-existing"`. | The current bridge is an existing approved publication, not a newly generated asset in this review. |

## Shortlist: existing approved public assets

All output paths below are exact files under `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction/public`. `output` is intrinsic width × height and bytes; `source` is the approved asset-repository input recorded by `data/generated_homepage_asset_publish_manifest.json`.

### 1. Required identity anchor: waterfront bridge hero JPG

- **Public file:** `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction/public/assets/home/wpb-waterfront-bridge-hero-v01.jpg`
- **Public URL:** `/assets/home/wpb-waterfront-bridge-hero-v01.jpg`
- **Source:** `public-front-page-assets/approved-for-website/images/wpb-waterfront-bridge-hero-v01.jpg`
- **Intrinsic output:** `1920 × 1080`, `630,114` bytes. Source: `1280 × 720`.
- **Source basis:** `data/generated_homepage_asset_publish_manifest.json:597-612`; output hash `7c630f14bb72e56e9f0724ddedcd75a8c552a54f3fd0dc184906583d4f83b7aa`.
- **Visual assessment:** reads as a West Palm Beach waterfront location photograph with the bridge and skyline across the Intracoastal, making it the strongest actual-place context in this shortlist. The manifest does not independently prove photographic origin or architectural status.
- **Desktop crop:** strong in the selected full-width hero; center or subject-aware positioning keeps the bridge and skyline. The `1280×720` source-to-`1920×1080` output path is a fidelity limitation at very large display sizes.
- **Mobile crop:** use a subject-aware full-width masthead crop that keeps the bridge and skyline legible. This is a better mobile fallback than forcing a wide concept panorama into a shallow frame.
- **Use:** preserve as the hero JPG. It is separate from the unchanged original closing bridge graphic documented below; do not conflate the two assets.

### Closing bridge asset is separate and unchanged

- **Public file:** `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction/public/assets/home/wpb-end-cap-bridge-v01.png`
- **Public URL:** `/assets/home/wpb-end-cap-bridge-v01.png`
- **Intrinsic output:** `1915 × 821`, `1,032,347` bytes.
- **SHA-256:** `2b27c45fac60037286a047f0ca0b27f9178d53a733658da1b7fd6737ebaf9ffd`.
- **Status:** this is the original closing/end-cap bridge graphic and remains unchanged. It is not the `wpb-waterfront-bridge-hero-v01.jpg` hero image above.

### 2. Strongest fullwidth editorial concept: North Flagler ultra-wide

- **Public file:** `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction/public/assets/home/north-flagler-corridor-skyline-ultra-wide-v01.jpg`
- **Public URL:** `/assets/home/north-flagler-corridor-skyline-ultra-wide-v01.jpg`
- **Source:** `public-front-page-assets/approved-for-website/images/north-flagler-corridor-skyline-ultra-wide-v01.png`
- **Intrinsic output:** `1920 × 822`, `567,430` bytes. Source: `1916 × 821`.
- **Visual assessment:** reads as a North Flagler waterfront corridor visualization with multiple contemporary towers, water, and boats. The manifest establishes approved provenance and dimensions only; it does not independently establish the image's photographic or concept status.
- **Desktop crop:** strongest premium alternate for a full-width editorial hero or wide corridor banner. A full-width frame preserves more lateral skyline and water context than the base split panel.
- **Mobile crop:** use the vertical companion below when the full-width mobile frame can be taller; a shallow crop loses the panoramic side context.
- **Use:** premium alternate to the bridge after source/metadata review. Do not change public alt or caption wording from this visual assessment alone.

### 3. North Flagler mobile companion

- **Public file:** `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction/public/assets/home/north-flagler-corridor-skyline-vertical-v01.jpg`
- **Public URL:** `/assets/home/north-flagler-corridor-skyline-vertical-v01.jpg`
- **Source:** `public-front-page-assets/approved-for-website/images/north-flagler-corridor-skyline-vertical-v01.png`
- **Intrinsic output:** `1536 × 1920`, `910,645` bytes. Source: `1122 × 1402`.
- **Visual assessment:** reads as the portrait member of the North Flagler corridor family; the composition keeps a central tower, neighboring massing, water, and yachts in a portrait frame. This is not a metadata-backed classification.
- **Desktop crop:** too portrait-heavy for a wide masthead unless intentionally cropped; use the ultra-wide companion for desktop.
- **Mobile crop:** strongest mobile source in the shortlist when the full-width hero permits a taller portrait slice. A shallow frame discards much of the top and bottom.
- **Use:** mobile companion for item 2 after source/metadata review; do not infer or publish new labels from the visual inspection alone.

### 4. North Flagler three-building sunset alternate

- **Public file:** `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction/public/assets/home/north-flagler-3-buildings-sunset-v01.jpg`
- **Public URL:** `/assets/home/north-flagler-3-buildings-sunset-v01.jpg`
- **Source:** `public-front-page-assets/approved-for-website/images/north-flagler-3-buildings-sunset-v01.png`
- **Intrinsic output:** `1920 × 822`, `753,950` bytes. Source: `1916 × 821`.
- **Visual assessment:** reads as a cinematic North Flagler waterfront visualization at sunset with three contemporary buildings. The approved manifest does not establish whether the image is a rendering or photograph, nor whether the buildings exist in that configuration.
- **Desktop crop:** strong full-width art direction with sky-to-water contrast. A subject-aware crop should keep the central building and enough lateral context.
- **Mobile crop:** no matching approved vertical file was found in the homepage manifest. Use the bridge or the vertical North Flagler family if a taller mobile crop is required.
- **Use:** high-drama desktop alternate after source/metadata review. Do not place it directly beside item 2 because they are closely related North Flagler visual families.

### 5. South Flagler corridor wide

- **Public file:** `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction/public/assets/home/south-flagler-corridor-hero-main-wide-v01.jpg`
- **Public URL:** `/assets/home/south-flagler-corridor-hero-main-wide-v01.jpg`
- **Source:** `public-front-page-assets/approved-for-website/images/south-flagler-corridor-hero-main-wide-v01.png`
- **Intrinsic output:** `1920 × 822`, `671,111` bytes. Source: `1916 × 821`.
- **Visual assessment:** reads as a South Flagler waterfront corridor visualization with contemporary towers, Palm Beach/water context, and a boat. The manifest establishes approved provenance and dimensions, but not photographic or concept origin, built status, or project boundaries.
- **Desktop crop:** strong wide supporting banner; center crop keeps the principal waterfront massing and water.
- **Mobile crop:** side towers are lost in a shallow crop; use the vertical companion if the full-width mobile frame is portrait-capable.
- **Use:** supporting corridor/editorial section, or a second editorial hero after source/metadata review when the page explicitly compares North and South Flagler.

### 6. South Flagler corridor vertical companion

- **Public file:** `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction/public/assets/home/south-flagler-corridor-vertical-v01.jpg`
- **Public URL:** `/assets/home/south-flagler-corridor-vertical-v01.jpg`
- **Source:** `public-front-page-assets/approved-for-website/images/south-flagler0.png`
- **Intrinsic output:** `1536 × 1920`, `971,765` bytes. Source: `1122 × 1402`.
- **Visual assessment:** reads as the portrait member of the South Flagler corridor family; visible buildings should be treated as illustrative until source metadata says otherwise.
- **Desktop crop:** use as a deliberate portrait card or tall editorial panel; the wide companion is better for a full-width row.
- **Mobile crop:** strongest portrait companion for item 5 if the full-width mobile frame is tall enough.
- **Use:** mobile/portrait supporting image after source/metadata review. Do not add public labels based on visual inspection alone.

### 7. Downtown nighttime context

- **Public file:** `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction/public/assets/home/downtown-hero-nighttime-v01.jpg`
- **Public URL:** `/assets/home/downtown-hero-nighttime-v01.jpg`
- **Source:** `public-front-page-assets/approved-for-website/images/downtown-hero-nightime-v01.png` (source spelling retained from manifest).
- **Intrinsic output:** `1920 × 1440`, `893,482` bytes. Source: `1448 × 1086`.
- **Visual assessment:** reads as a downtown West Palm Beach skyline and urban context at dusk. The manifest does not independently certify photographic or concept origin, so use it as atmosphere/orientation only until source metadata is confirmed.
- **Desktop crop:** 4:3 source works well in a feature card or tall editorial block; a fullwidth crop should keep the central skyline and dusk sky.
- **Mobile crop:** center crop is viable if the focal skyline remains centered; avoid text overlays over the brightest architectural detail.
- **Use:** supporting downtown section. Avoid pairing immediately with either bridge night/day image because the bridge family is a near-duplicate subject.

### 8. NORA growth-corridor lifestyle image

- **Public file:** `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction/public/assets/home/downtown-nora-hero-v01.jpg`
- **Public URL:** `/assets/home/downtown-nora-hero-v01.jpg`
- **Source:** `public-front-page-assets/approved-for-website/images/downtown-nora-hero-v01.png`
- **Intrinsic output:** `1920 × 1080`, `716,956` bytes. Source: `1672 × 941`.
- **Visual assessment:** reads as a NORA/North Downtown mixed-use and lifestyle visualization; the visible sign is a location cue in the artwork. The manifest does not independently certify photographic or concept origin, so visible buildings, streetscape, and activity should not be converted into public factual claims from this review alone.
- **Desktop crop:** fits a wide supporting card or half-width editorial panel; keep the sign and central street activity in frame.
- **Mobile crop:** center crop is workable in the base snapshot's 248px frame if the sign remains in the selected focal area; for the selected full-width masthead, retain that focal area in the art-directed mobile crop.
- **Use:** supporting home imagery for downtown/NORA context after source/metadata review. Do not edit public alt/caption wording based on visual inspection alone.

## Deliberate exclusions

- `/assets/home/downtown-corridor-bridge-daytime-v01.jpg` and `/assets/home/downtown-corridor-bridge-night-v01.jpg` are approved and usable, but they repeat the same bridge/waterfront subject as the required original bridge. Keep at most one bridge family image in the first visual sequence.
- `/assets/home/marina-redevelopment-hero-wide-v01.jpg` is approved and visually useful for a later market-context section, but it is 1920×1440 and `1,075,647` bytes, with a less specific focal subject. It is not a stronger home hero than the bridge or North Flagler panorama.
- Project-specific files such as the approved Mandarin Oriental podium image are premium, but a generic home hero would over-associate the entire site with one development. Reserve those for clearly labeled project modules.
- Heavy or unverified project media, including the multi-megabyte Ritz PNG, is outside this bounded homepage shortlist.

## Provenance and labeling rule

The homepage publish manifest establishes that these files came from `public-front-page-assets/approved-for-website/images` and were already published into `public/assets/home`. It does not certify photographic origin, rendering status, construction status, or project boundaries. The photography/concept classifications in this inventory are visual assessments for art direction only. No public alt text or caption was edited from this review. Any future label change should follow source/metadata approval; visual appearance alone is insufficient.

## Narrow Shorecrest provenance check

This check was limited to the existing Shorecrest source/review metadata and the two files already present in the checkout. No asset was downloaded, edited, regenerated, or promoted.

### What is proven for the 2200px candidate

- **Original public source file:** `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction/public/projects/shorecrest/media/shorecrest-exterior-hero.jpg`
- **Original output facts:** `6000 × 3999`, `5,992,573` bytes; SHA-256 `6ddca045659d077d0be246dbf25221c7908577401c263345c8fca16d74f1aa52`.
- **Candidate derivative:** `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction/public/projects/shorecrest/media/shorecrest-exterior-hero-2200x1466.jpg`
- **Candidate output facts:** `2200 × 1466`, `686,083` bytes; SHA-256 `a07a3e896764352012efe4134e5a0e844462f97bba9935d7652db5517bc6f2a1`.
- `research/source-material-review/image-caption-catalog.json:1539-1549` maps the original public path to project `shorecrest`, role `hero`, provider type `official project site`, and source label `Official project site: Shorecrest`. The same record says `rightsStatus: Rights review required before publishing images`.
- `research/source-material-review/authorized-asset-resize-plan.md:104-108` lists the original public path with credit `Source: Shorecrest official project site`. Its JSON plan at `:2249-2263` includes the path as a hero input and plans a 1920px WebP derivative, but the file states `mode: plan-only; no image generation or resizing performed`; it is not a final clearance record for the separate 2200px JPG.
- `research/source-material-review/project-gallery-performance-resize-report.md:24` records the original-to-2200 resize as a Shorecrest `Hero candidate` (5.7 MB to 670 KB). This proves the derivative was documented for performance work, not that it received final public-use approval.
- The candidate's embedded XMP says `Generated image` and identifies Topaz Gigapixel AI 8.0.0. That describes file processing metadata; it does not establish ownership, source rights, or approval.

### Approval limit

The available records prove official-site provenance and intended hero use for the original, but they do **not** prove final public approval for `shorecrest-exterior-hero-2200x1466.jpg`. The asset-library record `research/asset-library/projects/shorecrest/metadata.json` says third-party images/renderings are research-only until owner, broker, developer, or license terms permit publication. `research/source-material-review/creative-asset-repository-handoff.md:26` likewise says assets marked `rights review required` need explicit approval before publication. The resize plan's mixed text (`Rights review required before publishing images ... authorized`) is insufficient to treat the 2200 derivative as cleared.

### Current published hero comparison

- The route-bound Shorecrest hero remains `/projects/shorecrest/media/user-provided-shorecrest-hero.jpg`, referenced in `src/main.ts:474`, `1709`, and `1731`, and in `src/generated/siteData.ts:3965-3967`.
- Its output is `1280 × 955`, `245,394` bytes; SHA-256 `af7734ab3607d38618bc9c2fbb1783463e2a2f975967dcd61e23bd1bd9f45319`.
- `research/source-material-review/image-caption-catalog.json:1578-1588` also maps this current hero to the official Shorecrest project site and role `hero`, but it carries the same `rights review required` status. `research/source-material-review/project-page-audit-batch-2.md:86` records the operational decision `Hero | user-provided-shorecrest-hero.jpg | Yes | Keep waterfront tower identity`.
- Visual inspection found the 2200 candidate materially sharper and better suited to the selected full-width masthead: it has a broader 3:2 waterfront/tower composition with the tower held on the right. The current route-bound hero is smaller and taller, but is already the accepted page-bound asset. This is a visual/operational comparison, not a rights conclusion.

**Recommendation:** do not swap in the 2200px Shorecrest candidate on this repo evidence alone. Keep the current route-bound hero as the continuity fallback unless separate explicit approval covers the candidate and its derivative. If that approval is later recorded, the 2200 file is the stronger full-width Shorecrest art-direction option and needs no ImageGen derivative. The original closing bridge PNG remains a separate unchanged asset as documented above.
