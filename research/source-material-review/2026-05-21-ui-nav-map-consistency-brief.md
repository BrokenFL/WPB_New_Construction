# UI Navigation And Map Consistency Brief

Generated: 2026-05-21

Scope: read-mostly QA pass for logo/home routing, project-page route links, map fallback visibility, and buyer-facing label consistency.

## Live Checks

- Dev preview checked at `http://127.0.0.1:5173/`.
- Sampled routes: `/`, `/projects/shorecrest/`, `/projects/olara/`, `/floorplans/`, `/answers/`.
- Current rendered logo resolves to `/` on sampled routes.
- Current rendered homepage map state was `ready`; visible page text did not include `Static map fallback` or `Configure Google Map`.
- Project pages sampled exposed section links for Overview, Residences, Amenities, Design Team, Location, Buyer Resources, and Contact.

## Prioritized Fixes

1. Tighten active navigation semantics.
   - Current behavior marks both `Map` and `Projects` as `aria-current="page"` on home and project pages because both links share `data-nav-item="home"`.
   - Fix in `src/main.ts` `applyRoute()` and the header nav markup around `data-nav-item`.
   - Suggested language: keep only one current item, or use `aria-current="location"` only when the hash matches a home section.

2. Normalize buyer-facing CTA language across cards, project heroes, and project resources.
   - Current labels mix `Open Project`, `Request Packet`, `Request Guidance`, `View Resources`, `Contact`, and `Request Current Availability`.
   - Fix in `src/main.ts` `renderFeaturedProject()` and `renderDraftProjectPage()`.
   - Suggested labels: `View Project`, `Request Current Availability`, `View Floorplans & Documents`, and `Ask For This Project`.

3. Make project-page route links clearer for buyers.
   - Current project section nav is present but generic. The page would benefit from a clear route back to `All Projects` or `Compare Projects` near the project hero/section nav, not only the global header or Location module.
   - Fix in `src/main.ts` `renderDraftProjectPage()`.
   - Suggested addition: a first section-nav link to `/#projects` labeled `Compare Projects`.

4. Keep the no-static-map rule enforced in both code and fallback copy.
   - Current code removes the static map image and uses `Interactive map unavailable` instead of `Static map fallback`.
   - Verify in `src/main.ts` `initHeroGoogleMap()`, `initProjectLocationMaps()`, and `src/style.css` map-state selectors before shipping.
   - If the API key is absent, avoid showing a static map asset; show a neutral unavailable state or hide the map surface.

5. Consider making header labels more explicitly buyer-facing.
   - `Q&A` and `Verify` are concise but less clear than page titles.
   - Fix in `src/main.ts` header nav markup.
   - Suggested labels if space allows: `Buyer Questions` and `How We Verify`.

## Files/Functions Involved

- `src/main.ts`: header nav markup, `applyRoute()`, `renderFeaturedProject()`, `renderDraftProjectPage()`, `initHeroGoogleMap()`, `initProjectLocationMaps()`.
- `src/style.css`: `.home-hero-map-card` map states, `.project-google-map`, `.site-nav` active/route styles.
- `research/source-material-review/launch-qa-report.md`: check only when running full launch QA; generated timestamp-only changes should not be treated as UI fixes.
