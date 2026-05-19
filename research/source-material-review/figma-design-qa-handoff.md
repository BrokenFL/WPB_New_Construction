# Figma Design QA Handoff

Target board: `WPB New Construction - Design QA Review`

## Current Tool Status

- Figma connector attempted on 2026-05-15.
- Result: `UNAUTHORIZED; ReauthenticationRequired`.
- Next action: reauthenticate Figma, then run web capture against `http://127.0.0.1:5173/`.

## Capture Targets

Use desktop width `1440` and mobile width `390`.

- `/` - homepage map, corridor zones, project cards, trust/footer.
- `/projects/olara/` - complete authorized project page.
- `/projects/ritz-carlton-wpb/` - complete authorized branded project page.
- `/projects/mandarin-oriental/` - authorized new advisory page with no floorplans yet.
- `/projects/mr-c/` - authorized downtown project page.
- `/projects/alba-palm-beach/` - authorized North Flagler project page.
- `/projects/shorecrest/` - pending-authorization image status.
- `/projects/south-flagler-house/` - pending-authorization image status and split tower floorplans.
- `/projects/nora-house/` - pending-authorization image status and high floorplan count.
- `/floorplans/` - public floorplan library.
- `/inquire/?project=olara&interest=floorplans` - lead capture context.
- `/privacy/`, `/terms/`, `/fair-housing/` - legal/disclosure surfaces.

## Board Sections

1. Homepage + Stylized Map
2. Project Pages
3. Floorplans + Asset Routing
4. Lead Capture + Legal
5. Mobile States
6. Critic / Publisher / UI Designer Notes

## Annotation Standard

- `Critical`: blocks launch or credibility.
- `High`: noticeable buyer-facing quality issue.
- `Medium`: polish, clarity, or conversion issue.
- `Asset`: image/floorplan/source-rights issue.
- `Content`: missing fact, weak copy, or unresolved source.

## Current Known Focus Areas

- Map should feel more precise and less like a generic locator.
- Pending authorization labels must be visible without making pages feel unfinished.
- Floorplan grids need stronger filtering/grouping after duplicate normalization.
- Lead capture needs final CRM or spreadsheet routing.
- Mobile hero/map/card stacking needs screenshot review.
