# Developer Image Import Automation

This workflow collects candidate interior, amenity, exterior, and rendering images from known project/developer sites for review. It does not publish new images automatically.

## Schedule

The LaunchAgent file in `launchd/com.brooke.wpb-developer-image-import.plist` is set for 9:00 AM local time.

Install it manually:

```bash
cp launchd/com.brooke.wpb-developer-image-import.plist ~/Library/LaunchAgents/
launchctl unload ~/Library/LaunchAgents/com.brooke.wpb-developer-image-import.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.brooke.wpb-developer-image-import.plist
launchctl list | grep wpb-developer-image-import || true
```

Unload it:

```bash
launchctl unload ~/Library/LaunchAgents/com.brooke.wpb-developer-image-import.plist
```

Run it manually:

```bash
npm run import:developer-images
npm run review:developer-images
```

## Review Workflow

- Source registry: `research/config/project-image-sources.json`
- Review metadata: `research/imported-project-images/importedProjectImages.json`
- Public approved bundle: `src/data/approvedImportedProjectImages.json`
- Review report: `research/source-material-review/imported-project-images-review.md`
- Optional approval tracking: `research/imported-project-images/approved-images.json`

Every imported image records its project association, source page URL, source image URL, local path, capture date, guessed image type, dimensions, caption, alt text, notes, and status.

New imports default to `needs_review`. After review, change selected records in `research/imported-project-images/importedProjectImages.json` to `approved`, then run `npm run review:developer-images`. That syncs only approved records into `src/data/approvedImportedProjectImages.json`; `needs_review`, `rejected`, and `archived` records stay out of the public image resolver and public bundle.

## Source And Rights Notes

Use captions such as `Developer-site image`, `Project rendering`, `Interior rendering`, or `Amenity image`. Do not label an image as official unless the source metadata confirms it. Do not overwrite manually curated or user-provided images. Keep each image matched to its project.
