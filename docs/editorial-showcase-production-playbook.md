# Editorial Showcase Project Page Playbook

This is the required production workflow for duplicating and improving the WPB New Construction editorial showcase project-page template.

Read this guide before converting another project page. The reusable renderer and schema are already in place. The work for each project is editorial: choose the right approved assets, write authoritative buyer-facing copy, curate a strong visual sequence, verify mobile behavior, and publish a narrowly scoped release.

## 1. Template Source Of Truth

The showcase renderer is:

```text
renderEditorialShowcaseProjectPage(...) in src/main.ts
```

The schema types are:

```text
src/data/projectCopyPackage.ts
```

The project records are:

```text
public/data/project-copy-package.json
```

Enable the template per project:

```json
{
  "pageTemplate": "editorial-showcase",
  "showcase": {
    "template": "editorial-showcase"
  }
}
```

Do not rebuild the layout for each project. Feed the shared schema.

## 2. Approved Asset Boundary

Use only assets already approved for website use:

```text
/Volumes/ExternalSSD/WPB_NewConstruction_Assets/public-projects/{project-id}/approved-for-website
```

The iCloud asset library is an intake and review layer. It is not a production source. Do not reference local absolute paths in website data.

Create optimized website copies under one of these paths:

```text
public/projects/{project-id}/media/showcase/
public/assets/projects/{project-id}/showcase/
public/assets/projects/{project-id}/floorplans/showcase/
```

Prefer efficient JPG or WebP derivatives for photographic images. Preserve PNG only when it is useful for transparency or image quality. Run the performance budget before publishing.

## 3. Inspect Before Editing

Before touching the schema:

1. Read the existing project record in `public/data/project-copy-package.json`.
2. List every approved project image and floor-plan file.
3. Generate a contact sheet with filenames and dimensions.
4. Inspect the official project website for current buyer-facing facts.
5. Preserve unrelated dirty worktree changes. Do not stage or revert them.

Treat contact-sheet review as mandatory. Filenames are useful hints, but image choice is a visual judgment.

## 4. Copy Rules

Each page should receive:

- A concise hero tagline.
- An authoritative overview paragraph.
- A compact local take.
- Public-facing quick facts.
- Location copy.
- Project-team fields.
- SEO title and description.

Use the user-approved buyer-facing facts. Keep internal conflict notes in research layers when needed, but do not clutter the public page with passive caveat language when the user has approved a display value.

Use `heroTags` for the three compact buyer-filterable hero facts:

```text
Status
Corridor
Sales
```

## 5. Featured Image Roles

Each large image must do a different job:

1. `heroImage`: strongest identity image, usually an exterior or defining waterfront view.
2. `visualBreak`: lifestyle image after the overview and before residences, usually patio, terrace, interior, or arrival.
3. `neighborhoodImage`: lower visual reset before the map, usually pool, waterfront, neighborhood, or view image.

Choose dynamic shots for the three large positions. Avoid using three similar exterior images.

The first gallery image must not visually repeat `visualBreak`. This applies even when the two files were shot at different times of day or use slightly different crops. Adjacent images should feel intentionally different.

## 6. Gallery Curation Rules

The gallery should feel complete, not exhaustive.

- Start from every approved project image.
- Include each genuinely distinct scene once.
- Remove minor crop variants, resolution variants, near-identical angles, and repeated time-of-day versions when they do not add value.
- Keep the highest-quality version of duplicated scenes.
- Use one strongest bathroom when two bathroom images show the same room.
- Use one strongest valet or arrival image when the difference is minor.
- Keep multiple residence images only when they show different rooms, layouts, orientations, or clearly different moods.
- Keep multiple exterior images only when the perspective materially changes.
- Sequence the gallery so adjacent frames vary: interior, view, residence, amenity, arrival, exterior.

The user’s preference is curated breadth: enough images to show the project fully, without making buyers swipe through small differences.

## 7. Floor-Plan Cards

Use three clear residence cards when approved plans exist.

- Prefer real approved floor-plan thumbnails.
- Render PDFs to image thumbnails when necessary.
- Crop to the plan drawing itself. Do not use a full brochure sheet when white space makes the plan unreadable.
- Convert focused crops to high-contrast monochrome when that improves legibility.
- Keep card titles buyer-friendly, such as `2 Bedrooms`, `3 Bedrooms`, or `Penthouse`.
- Use exact size ranges when verified. Otherwise use a clear inquiry label.

## 8. Amenities

Use the compact amenity icon rail. Highlight the strongest building-specific amenities rather than reproducing a long text list.

Use supported icon keys from `berkeleyIcon(...)` in `src/main.ts`. Add a reusable icon only when the shared set does not cover an important feature.

## 9. Required Two-Pass Visual Review

Every new showcase page gets two visual review passes.

### Round One

Render desktop and mobile screenshots. Review:

- Hero framing and text fit.
- Featured-image variety.
- Overview pacing.
- Floor-plan readability.
- Gallery opener versus `visualBreak`.
- Amenity rail clarity.
- Map position and address.
- Mobile width containment.

Implement the review findings.

### Round Two

Render again after fixes. Review:

- Whether the page has a distinct project identity.
- Whether any gallery images are near-duplicates.
- Whether the three large images each serve a different purpose.
- Whether mobile remains readable at `390px`.
- Whether the residence cards look intentional and legible.

Do not publish until the second review is clean.

## 10. Validation And Release

Run:

```bash
git diff --check
npm run typecheck
npm run qa:performance
npm run build
```

Before commit:

- Stage only the project-specific schema and assets.
- Keep unrelated local drafts unstaged.
- Confirm every new production image is intentional.

Publish:

```bash
git push origin main
npm run ship:live
```

`npm run ship:live` must complete the full launch gate before the release is considered published.

After publish:

1. Restore unrelated local drafts if they were temporarily stashed.
2. Confirm `HEAD` matches `origin/main`.
3. Read back the live project schema from:

```text
https://www.wpbnewconstruction.com/data/project-copy-package.json?liveVerify={commit}
```

4. Confirm representative public image URLs return `200`.
5. Capture live desktop and mobile screenshots.
6. Confirm mobile `scrollWidth` equals the viewport width at `390px`.
7. Open the live cache-busted URL in the in-app browser.

## 11. Completion Evidence

Close the project with:

- Live project URL.
- Published commit.
- Launch QA result.
- Gallery image count.
- Mobile overflow result.
- Desktop screenshot.
- Mobile screenshot.
- Note that unrelated worktree drafts were preserved.

## 12. Current Reference Pages

Use these pages as working examples:

- Berkeley: original approved template direction.
- Alba: boutique waterfront example.
- Olara: resort-scale waterfront example with curated gallery deduplication.
- Shorecrest: boutique Related Ross example with focused PDF floor-plan crops.

Each project should feel distinct while using the same underlying schema.
