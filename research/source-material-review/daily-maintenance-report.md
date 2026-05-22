# Daily Maintenance Report

Generated: 2026-05-22T19:54:51.410Z

## Scripts Run

- import GPT news issue drafts: passed
- validate news drafts: passed
- publish eligible queued low-risk news: passed
- generate newsletter digest draft: passed
- import developer/project images: passed
- review imported developer/project images: passed
- check news/update sources: passed
- check imported project updates: passed
- check stale public copy: passed
- check image repetition and placement: passed
- check asset/performance budgets: passed
- inventory duplicate assets: passed
- run launch QA: needs attention (1)

## New Images Found

Review `research/imported-project-images/importedProjectImages.json` and `research/source-material-review/imported-project-images-review.md` after the image import/review steps.

## New News Found

Review `content/news-drafts.json` and `research/news-review/development-news-candidates.json`. GPT issue drafts land in the News Desk first. High-risk items remain review-first and cannot auto-publish.

## Stale Copy Flags

No blocking flags from this run.

## Missing Resources

Review team/developer/designer/architect gaps in `docs/project-team-resource-imagery.md` and the project image review files.

## Optimization Warnings

No blocking flags from this run.

## Next Human Review Items

- Review run launch QA; the command exited 1.

## Follow-Up Resolution

- The launch QA issue from this run was caused by imported image filenames and generic alt text on newly placed public images.
- The placed image files were renamed, candidate-only images were moved to `research/imported-project-images/review/`, alt text was improved, and the full requested QA suite passed afterward.
